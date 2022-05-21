import type { Settings as LayoutSettings } from '@ant-design/pro-layout';
import { SettingDrawer } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
import { history, Link, request as umiRequest } from 'umi';
import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';
import {
  addDevice,
  currentUser as queryCurrentUser,
  refreshAccessToken,
  updateDevice,
} from './services';
import { BookOutlined, LinkOutlined } from '@ant-design/icons';
import defaultSettings from '../config/defaultSettings';
import { session } from './util';
import type { RequestOptionsInit, ResponseError } from 'umi-request';
import UAParser from 'ua-parser-js';
import { isEmpty } from 'lodash';
import { message, notification } from 'antd';
import { v4 } from 'uuid';

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

const registerDevice = async () => {
  const uaParser = new UAParser();
  const browser = uaParser.getBrowser();
  const device = uaParser.getDevice();
  const engine = uaParser.getEngine();
  const OS = uaParser.getOS();
  const deviceId = v4();

  const deviceInfo = {
    os: `${OS.name} ${OS.version}`,
    engine: `${engine.name} ${engine.version}`,
    browser: `${browser.name} ${browser.version}`,
    type: device.type ?? 'desktop',
  };
  const { id, deviceSecret } = await addDevice({
    data: {
      deviceId,
      os: `${OS.name} ${OS.version}`,
      engine: deviceInfo.engine,
      platform: deviceInfo.browser,
      type: deviceInfo.type,
      name: `${deviceInfo.os}_${deviceInfo.type}_${deviceInfo.engine}_${deviceId}`,
    },
  });

  const sessionSave = {
    id,
    deviceId,
    deviceSecret,
    ...deviceInfo,
  };
  session.put('device', sessionSave, true);
};

const updateDeviceState = async () => {
  const deviceInfo = session.get<API.Device>('device');
  if (deviceInfo?.id) {
    await updateDevice({
      data: {
        id: deviceInfo?.id,
        isOnline: 1,
      },
    }).catch(() => {
      registerDevice();
    });
  } else {
    registerDevice();
  }
};

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  updateDeviceState();
  const fetchUserInfo = async () => {
    try {
      const userInfo = await queryCurrentUser();
      return userInfo;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  // 如果不是登录页面，执行
  if (history.location.pathname !== loginPath) {
    const currentUser = (await fetchUserInfo()) || {};
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    waterMarkProps: {
      content: initialState?.currentUser?.username,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    links: isDev
      ? [
          <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI 文档</span>
          </Link>,
          <Link to="/~docs" key="docs">
            <BookOutlined />
            <span>业务组件文档</span>
          </Link>,
        ]
      : [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children, props) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {!props.location?.pathname?.includes('/login') && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  405: '请求方法不被允许。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

const errorHandler = async (error: ResponseError) => {
  const { response } = error;
  const { errorMessage } = await response.json();
  if (response && response.status) {
    const errorText = codeMessage[response.status] || response.statusText;
    const { status, url } = response;
    if ([400, 401].includes(response.status)) {
      message.error(errorMessage);
      throw error;
    }

    notification.error({
      message: `请求错误 ${status}: ${url}`,
      description: errorText,
    });
  }

  if (!response) {
    notification.error({
      description: '您的网络发生异常，无法连接服务器',
      message: '网络异常',
    });
  }
  throw error;
};

const getHeader = () => {
  const tokenInfo = session.get<API.Token>('token') || {};
  return !isEmpty(tokenInfo)
    ? {
        Authorization: `${tokenInfo.type} ${tokenInfo.accessToken}`,
      }
    : undefined;
};

let isRefreshing = false; // 是否正在刷新
const subscribers: any[] = []; // 重试队列，每一项将是一个待执行的函数形式

const addSubscriber = (listener: (accessToken: string) => void) => subscribers.push(listener);

// 执行被缓存等待的接口事件
const notifySubscriber = (newAccessToken = '') => {
  subscribers.forEach((callback) => callback(newAccessToken));
  subscribers.length = 0;
};

// 刷新 token 请求
const refreshTokenRequest = async () => {
  const tokenInfo = session.get<API.Token>('token') || {};
  if (!tokenInfo.refreshToken || isEmpty(tokenInfo)) {
    session.remove('token');
    history.push(loginPath);
    isRefreshing = false;
    return;
  }
  try {
    const newTokenInfo = await refreshAccessToken(tokenInfo.refreshToken || '');
    session.put('token', newTokenInfo, true);
    notifySubscriber(newTokenInfo.accessToken);
  } catch (e) {
    console.error('请求刷新 token 失败');
  }
  isRefreshing = false;
};

// 判断如何响应
function checkStatus(response: Response, options: RequestOptionsInit) {
  const { url } = response;
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenRequest();
  }

  // 正在刷新 token，返回一个未执行 resolve 的 promise
  return new Promise<Response>((resolve) => {
    // 将resolve放进队列，用一个函数形式来保存，等token刷新后直接执行
    addSubscriber((newAccessToken) => {
      const newOptions = {
        ...options,
        prefix: '',
        params: {},
        headers: {
          Authorization: `Bearer ${newAccessToken}`,
        },
      };
      resolve(umiRequest(url, newOptions));
    });
  });
}

const responseHandler = async (response: Response, options: RequestOptionsInit) => {
  const res = await response.clone().json();
  switch (res.errorCode) {
    case 'spd:101012':
    case 'spd:101008':
      return checkStatus(response, options);
    case 'spd:101008':
    case 'spd:101009':
      session.remove('token');
      history.push(loginPath);
      return response;
    default:
      break;
  }
  return response;
};

// https://umijs.org/zh-CN/plugins/plugin-request
export const request: RequestConfig = {
  errorHandler,
  responseInterceptors: [responseHandler],
  requestInterceptors: [
    (_url, options) => {
      if (_url.indexOf('token') === -1) {
        // eslint-disable-next-line no-param-reassign
        options.headers = getHeader();
      }
      return {
        url: _url,
        options,
      };
    },
  ],
};
