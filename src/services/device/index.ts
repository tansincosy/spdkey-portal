import { request } from 'umi';
export async function getDevices(
  params: {
    current?: number;
    pageSize?: number;
  },
  options?: Record<string, any>,
) {
  return request<API.Device[]>('/api/device', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function removeDevice(options?: Record<string, any>) {
  return request<Record<string, any>>('/api/device', {
    method: 'DELETE',
    ...(options || {}),
  });
}

export async function updateDevice(options?: Record<string, any>) {
  return request<API.Device>('/api/device', {
    method: 'PUT',
    ...(options || {}),
  });
}

export async function addDevice(options?: Record<string, API.Device>) {
  return request<API.Device>('/api/device', {
    method: 'POST',
    ...(options || {}),
  });
}

export async function getDeviceInfo(params: Record<string, any>) {
  return request<API.Device>('/api/device', {
    method: 'GET',
    params: {
      ...params,
    },
  });
}
export async function getDevicesByUserId(params: Record<string, any>) {
  return request<API.Device[]>('/api/device', {
    method: 'GET',
    params: {
      ...params,
    },
  });
}
