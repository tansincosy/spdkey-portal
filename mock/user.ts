import { Request, Response } from 'express';
import { mock } from 'mockjs';
const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

async function getFakeCaptcha(req: Request, res: Response) {
  await waitTime(2000);
  return res.json('captcha-xxx');
}

const { ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION } = process.env;

/**
 * 当前用户的权限，如果为空代表没登录
 * current user access， if is '', user need login
 * 如果是 pro 的预览，默认是有权限的
 */
let access = ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site' ? 'admin' : '';

const getAccess = () => {
  return access;
};

// 代码中会兼容本地 service mock 以及部署站点的静态数据
export default {
  // 支持值为 Object 和 Array
  'GET /api/user/current-user': (req: Request, res: Response) => {
    // if (!getAccess()) {
    //   res.status(400).send({
    //     errorCode: 'INKA:101012',
    //     errorMessage: 'Invalid user: username or password is incorrect, please re-enter',
    //   });
    //   return;
    // }
    res.send({
      username: 'Serati Ma',
      id: '00000001',
    });
  },
  // GET POST 可省略
  'GET /api/users': [
    {
      key: '1',
      name: 'John Brown',
      age: 32,
      address: 'New York No. 1 Lake Park',
    },
    {
      key: '2',
      name: 'Jim Green',
      age: 42,
      address: 'London No. 1 Lake Park',
    },
    {
      key: '3',
      name: 'Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park',
    },
  ],
  'POST /api/login/account': async (req: Request, res: Response) => {
    const { password, username, type } = req.body;
    await waitTime(2000);
    if (password === 'ant.design' && username === 'admin') {
      res.send({
        status: 'ok',
        type,
        currentAuthority: 'admin',
      });
      access = 'admin';
      return;
    }
    if (password === 'ant.design' && username === 'user') {
      res.send({
        status: 'ok',
        type,
        currentAuthority: 'user',
      });
      access = 'user';
      return;
    }
    if (type === 'mobile') {
      res.send({
        status: 'ok',
        type,
        currentAuthority: 'admin',
      });
      access = 'admin';
      return;
    }

    res.send({
      status: 'error',
      type,
      currentAuthority: 'guest',
    });
    access = 'guest';
  },
  'POST /api/login/outLogin': (req: Request, res: Response) => {
    access = '';
    res.send({ data: {}, success: true });
  },
  'POST /api/register': (req: Request, res: Response) => {
    res.send({ status: 'ok', currentAuthority: 'user', success: true });
  },
  'GET /api/500': (req: Request, res: Response) => {
    res.status(500).send({
      timestamp: 1513932555104,
      status: 500,
      error: 'error',
      message: 'error',
      path: '/base/category/list',
    });
  },
  'GET /api/404': (req: Request, res: Response) => {
    res.status(404).send({
      timestamp: 1513932643431,
      status: 404,
      error: 'Not Found',
      message: 'No message available',
      path: '/base/category/list/2121212',
    });
  },
  'GET /api/403': (req: Request, res: Response) => {
    res.status(403).send({
      timestamp: 1513932555104,
      status: 403,
      error: 'Forbidden',
      message: 'Forbidden',
      path: '/base/category/list',
    });
  },
  'GET /api/401': (req: Request, res: Response) => {
    res.status(401).send({
      timestamp: 1513932555104,
      status: 401,
      error: 'Unauthorized',
      message: 'Unauthorized',
      path: '/base/category/list',
    });
  },

  'GET  /api/login/captcha': getFakeCaptcha,

  'POST /api/user': async (req: Request, res: Response) => {
    return res.json(
      mock({
        id: '@guid',
      }),
    );
  },

  'PUT /api/user': async (req: Request, res: Response) => {
    return res.json(
      mock({
        id: '@guid',
      }),
    );
  },

  'DELETE /api/user': async (req: Request, res: Response) => {
    return res.json({});
  },

  'POST /api/device': async (req: Request, res: Response) => {
    return res.json(
      mock({
        id: '@guid',
        clientId: '@guid',
        clientSecret: '@guid',
      }),
    );
  },

  'POST /api/oauth/token': async (req: Request, res: Response) => {
    return res.json(
      mock({
        accessToken: '@guid()',
        refreshToken: '@guid()',
        expiredIn: '@integer(60, 3600)',
        type: 'Bearer',
      }),
    );
  },

  'GET /api/oauth/revoke': async (req: Request, res: Response) => {
    return res.json({});
  },

  'PUT /api/device': async (req: Request, res: Response) => {
    return res.json(
      mock({
        id: '@guid',
      }),
    );
  },

  'DELETE /api/device': async (req: Request, res: Response) => {
    return res.json({});
  },

  'GET /api/device': async (req: Request, res: Response) => {
    const { current = 1, pageSize = 10, id, userId } = req.query;
    const mockDatas = mock({
      'data|1-50': [
        {
          id: '@guid',
          clientId: '@guid',
          name: '@name',
          platform: '@name',
          clientSecret: '@guid',
          'isLocked|1': [true, false],
          accessTokenValidateSeconds: '@integer(1, 60)',
          refreshTokenValidateSeconds: '@integer(1, 60)',
          'grants|1': ['password', 'redirect_url'],
          updatedAt: '@datetime(T)',
          createdAt: '@datetime(T)',
          'isOnline|1': [true, false],
        },
      ],
      'total|1': [5, 20, 50],
      success: true,
      pageSize,
      current,
    });
    if (id) {
      return res.json(
        mock({
          id: '@guid',
          clientId: '@guid',
          name: '@name',
          platform: '@name',
          clientSecret: '@guid',
          'isLocked|1': [true, false],
          accessTokenValidateSeconds: '@integer(1, 60)',
          refreshTokenValidateSeconds: '@integer(1, 60)',
          'grants|1': ['password', 'redirect_url'],
          'configs|1-5': ['global', 'custom1', 'custom2'],
          updatedAt: '@datetime(T)',
          createdAt: '@datetime(T)',
          'isOnline|1': [true, false],
        }),
      );
    }

    const datas = mockDatas.data.map(
      (item: { updatedAt: string | number; createdAt: string | number }) => ({
        ...item,
        updatedAt: +item.updatedAt,
        createdAt: +item.createdAt,
      }),
    );
    if (userId) {
      return res.json(datas);
    }
    mockDatas.data = datas;
    return res.json(mockDatas);
  },

  'DELETE /api/log': async (req: Request, res: Response) => {
    return res.json({});
  },

  'POST /api/log': async (req: Request, res: Response) => {
    return res.json(
      mock({
        id: '@guid',
      }),
    );
  },

  'GET /api/log': async (req: Request, res: Response) => {
    const { current = 1, pageSize = 10, id } = req.query;
    const mockDatas = mock({
      'data|1-50': [
        {
          id: '@guid',
          'level|1': ['info', 'error', 'warn', 'debug'],
          message: '@paragraph()',
          timestamp: '@datetime(T)',
          user: '@cname',
        },
      ],
      'total|1': [5, 20, 50],
      success: true,
      pageSize,
      current,
    });
    if (id) {
      return res.json(
        mock({
          id: '@guid',
          clientId: '@guid',
          name: '@name',
          platform: '@name',
          clientSecret: '@guid',
          'isLocked|1': [true, false],
          accessTokenValidateSeconds: '@integer(1, 60)',
          refreshTokenValidateSeconds: '@integer(1, 60)',
          'grants|1': ['password', 'redirect_url'],
          updatedAt: '@datetime(T)',
          createdAt: '@datetime(T)',
          'isOnline|1': [true, false],
        }),
      );
    }

    const datas = mockDatas.data.map(
      (item: { updatedAt: string | number; createdAt: string | number }) => ({
        ...item,
        updatedAt: +item.updatedAt,
        createdAt: +item.createdAt,
      }),
    );
    mockDatas.data = datas;
    return res.json(mockDatas);
  },

  'GET /api/user': async (req: Request, res: Response) => {
    const { current = 1, pageSize = 10, id } = req.query;
    if (id) {
      return res.json(
        mock({
          id: '@guid',
          username: '@name',
          'isLocked|+1': [true, false],
          'clientLimit|1': [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
          'scopes|1-3': ['mobile', 'stb', 'admin', 'web'],
          updatedAt: '@datetime(T)',
          createdAt: '@datetime(T)',
        }),
      );
    }

    const mockDatas = mock({
      'data|1-50': [
        {
          id: '@guid',
          username: '@name',
          'isLocked|+1': [true, false],
          'clientLimit|1': [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
          updatedAt: '@datetime(T)',
          createdAt: '@datetime(T)',
        },
      ],
      'total|1': [5, 20, 50],
      success: true,
      pageSize,
      current,
    });

    const data = mockDatas.data?.map(
      (item: { updatedAt: string | number; createdAt: string | number }) => {
        return {
          ...item,
          updatedAt: +item.updatedAt,
          createdAt: +item.createdAt,
        };
      },
    );

    mockDatas.data = data;
    return res.json(mockDatas);
  },
};
