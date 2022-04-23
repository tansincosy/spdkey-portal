import { request } from 'umi';

export async function getLogs(
  params: {
    current?: number;
    pageSize?: number;
  },
  options?: Record<string, any>,
) {
  return request<API.Log[]>('/api/operation-log', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function removeLog(options?: Record<string, any>) {
  return request<Record<string, any>>('/api/operation-log', {
    method: 'DELETE',
    ...(options || {}),
  });
}

export async function addLog(options?: Record<string, any>) {
  return request<API.User>('/api/operation-log', {
    method: 'POST',
    ...(options || {}),
  });
}
