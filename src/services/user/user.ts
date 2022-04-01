import { request } from 'umi';

export async function currentUser(options?: Record<string, any>) {
  return request<API.CurrentUser>(`/api/user/current-user`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function getUsers(
  params: {
    current?: number;
    pageSize?: number;
  },
  options?: Record<string, any>,
) {
  return request<API.User[]>('/api/user', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function removeUser(options?: Record<string, any>) {
  return request<Record<string, any>>('/api/user', {
    method: 'DELETE',
    ...(options || {}),
  });
}

export async function addUser(options?: Record<string, any>) {
  return request<API.User>('/api/user', {
    method: 'POST',
    ...(options || {}),
  });
}

export async function updateUser(options?: Record<string, any>) {
  return request<API.User>('/api/user', {
    method: 'PUT',
    ...(options || {}),
  });
}

export async function getUserInfo(params: { id: string }) {
  return request<API.User>('/api/user', {
    method: 'GET',
    params: {
      ...params,
    },
  });
}
