import { request } from 'umi';

export async function getChannels(
  params: {
    current?: number;
    pageSize?: number;
  },
  options?: Record<string, any>,
) {
  return request<API.Channel[]>('/api/channel', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getPlaybill(
  params: {
    current?: number;
    pageSize?: number;
  },
  options?: Record<string, any>,
) {
  return request<API.PlayBill[]>('/api/playbill', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function addChannel(options?: Record<string, any>) {
  return request<API.Channel>('/api/channel', {
    method: 'POST',
    ...(options || {}),
  });
}

export async function addPlaybill(options?: Record<string, any>) {
  return request<API.PlayBill>('/api/playbill', {
    method: 'POST',
    ...(options || {}),
  });
}

export async function updateChannel(options?: Record<string, any>) {
  return request<API.Channel>('/api/config', {
    method: 'PUT',
    ...(options || {}),
  });
}

export async function updatePlaybill(options?: Record<string, any>) {
  return request<API.PlayBill>('/api/config', {
    method: 'PUT',
    ...(options || {}),
  });
}

export async function removeChannel(options?: Record<string, any>) {
  return request<Record<string, any>>('/api/channel', {
    method: 'DELETE',
    ...(options || {}),
  });
}

export async function removePlaybill(options?: Record<string, any>) {
  return request<Record<string, any>>('/api/playbill', {
    method: 'DELETE',
    ...(options || {}),
  });
}

export async function getChannelSource(
  params: {
    current?: number;
    pageSize?: number;
  },
  options?: Record<string, any>,
) {
  return request<API.ChannelSource[]>('/api/channel/source', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getChannelSourcesInfo(params: { id: string }) {
  return request<API.ChannelSource>('/api/channel/source', {
    method: 'GET',
    params: {
      ...params,
    },
  });
}

export async function refreshChannelSource() {
  return request<API.ChannelSource>('/api/channel/source/test', {
    method: 'GET',
    params: {},
  });
}
