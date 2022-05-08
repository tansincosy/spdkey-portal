import { session } from '@/util/session';
import { request } from 'umi';

/**
 * 用户登录
 * @param body
 * @param options
 * @returns
 */
export async function login(
  body: API.UserLogin,
  options?: Record<string, any>,
): Promise<API.Token> {
  const str: string[] = [];
  body.grant_type = 'password';
  body.scope = 'super-admin';
  delete body.autoLogin;

  Object.keys(body).forEach((key) => {
    str.push(encodeURIComponent(key) + '=' + encodeURIComponent(body[key]));
  });
  const device = session.get<API.Device>('device');
  //clientId 签发的设备id
  //clientSecret 签发的设备密钥
  const basicAuth = btoa(`${device?.deviceId}:${device?.deviceSecret}`);
  return request<API.LoginResult>('/api/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basicAuth}`,
    },
    data: str.join('&'),
    ...(options || {}),
  });
}

export async function refreshAccessToken(refreshToken: string): Promise<API.Token> {
  const str: string[] = [];
  const body = {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  };
  Object.keys(body).forEach((key) => {
    str.push(encodeURIComponent(key) + '=' + encodeURIComponent(body[key]));
  });
  const device = session.get<API.Device>('device');
  //clientId 签发的设备id
  //clientSecret 签发的设备密钥
  const basicAuth = btoa(`${device?.deviceId}:${device?.deviceSecret}`);
  return request<API.LoginResult>('/api/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basicAuth}`,
    },
    data: str.join('&'),
  });
}

export async function logout() {
  const device = session.get<API.Device>('device');
  const basicAuth = btoa(`${device?.deviceId}:${device?.deviceSecret}`);
  const { accessToken } = session.get<API.Token>('token') || {};
  return request('/api/oauth/revoke', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
    },
    data: {
      accessToken,
    },
  });
}
