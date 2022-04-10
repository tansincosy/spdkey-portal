import { request } from 'umi';

export async function addConfig(options?: Record<string, any>) {
  return request<API.Config>('/api/config', {
    method: 'POST',
    ...(options || {}),
  });
}

export async function updateConfig(options?: Record<string, any>) {
  return request<API.Config>('/api/config', {
    method: 'PUT',
    ...(options || {}),
  });
}

export async function removeConfig(options?: Record<string, any>) {
  return request<Record<string, any>>('/api/config', {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** 获取规则列表 GET /api/rule */
export async function getConfigList(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: Record<string, any>,
) {
  return request<API.RuleList>('/api/config', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function checkRepeatName(name: string): Promise<{ result: boolean }> {
  return request('/api/config/repeat-name', {
    method: 'GET',
    params: {
      name,
    },
  });
}

export async function getConfigTypes(): Promise<API.ConfigType[]> {
  return request('/api/config/type', {
    method: 'GET',
  });
}
