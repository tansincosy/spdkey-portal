import { mock } from 'mockjs';
import { Request, Response } from 'express';

export default {
  //资源测试
  'GET /api/channel/source/test': async (req: Request, res: Response) => {
    return res.json({});
  },
  //xml 解析
  'POST /api/epg-xml/xml-parse': async (req: Request, res: Response) => {
    return res.json({});
  },
  //EPG.xml中的频道列表
  'GET /api/epg-xml/program-channel': async (req: Request, res: Response) => {
    const { current = 1, pageSize = 10, id } = req.query;

    const mockDatas = mock({
      'data|1-50': [
        {
          images: [
            {
              href: '@image(70*30)',
              type: 30,
            },
          ],
          id: '@guid',
          title: '@name',
          language: '@title(2,4)',
          'status|1': ['1', '0', '-1'],
          epgXmlId: '@guid',
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
  'POST /api/channel/source': async (req: Request, res: Response) => {
    return res.json(
      mock({
        id: '@guid()',
      }),
    );
  },
  'DELETE /api/channel/source': async (req: Request, res: Response) => {
    return res.json(
      mock({
        id: '@guid()',
      }),
    );
  },
  'GET /api/channel/source': async (req: Request, res: Response) => {
    const { current = 1, pageSize = 10, id } = req.query;
    if (id) {
      return res.json(
        mock({
          id: '@guid',
          title: '@name',
          images: [
            {
              href: '@image(70*30)',
              type: 30,
            },
          ],
          //播放地址
          playUrl: 'https://demo.com',
          country: '@country',
          language: '@title(2,4)',
          updatedAt: '@datetime(T)',
          createdAt: '@datetime(T)',
        }),
      );
    }
    const mockDatas = mock({
      'data|1-50': [
        {
          images: [
            {
              href: '@image(70*30)',
              type: 30,
            },
          ],
          id: '@guid',
          title: '@name',
          language: '@title(2,4)',
          'status|1': ['1', '0', '-1'],
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
  'GET /api/channel': async (req: Request, res: Response) => {
    const { current = 1, pageSize = 10, id } = req.query;
    if (id) {
      return res.json(
        mock({
          id: '@guid',
          title: '@name',
          'channelId|1': '@integer(0,100)',
          images: [
            {
              href: '@image(70*30)',
              type: 'LOGO',
            },
          ],
          'playSources|1': ['@url', '@url(0,100)', '@url(0,100)'],
          updatedAt: '@datetime(T)',
          createdAt: '@datetime(T)',
        }),
      );
    }

    const mockDatas = mock({
      'data|1-50': [
        {
          images: [
            {
              href: '@image(70*30)',
              type: 'LOGO',
            },
          ],
          id: '@guid',
          title: '@name',
          'channelId|1': '@integer(0,100)',
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

  'GET /api/playbill': async (req: Request, res: Response) => {
    const { current = 1, pageSize = 10, id } = req.query;
    if (id) {
      return res.json(
        mock({
          id: '@guid',
          title: '@name',
          images: [
            {
              href: '@image(70*30)',
              type: 'POSTER',
            },
          ],
          language: '@name',
          'channelId|1': '@integer(0,100)',
          startTime: '@datetime(T)',
          endTime: '@datetime(T)',
          updatedAt: '@datetime(T)',
          createdAt: '@datetime(T)',
        }),
      );
    }

    const mockDatas = mock({
      'data|1-50': [
        {
          id: '@guid',
          title: '@name',
          images: [
            {
              href: '@image(70*30)',
              type: 'POSTER',
            },
          ],
          language: '@name',
          'channelId|1': '@integer(0,100)',
          startTime: '@datetime(T)',
          endTime: '@datetime(T)',
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

  'POST /api/channel': async (req: Request, res: Response) => {
    return res.json(
      mock({
        id: '@guid',
      }),
    );
  },

  'POST /api/playbill': async (req: Request, res: Response) => {
    return res.json(
      mock({
        id: '@guid',
      }),
    );
  },

  'PUT /api/channel': async (req: Request, res: Response) => {
    return res.json(
      mock({
        id: '@guid',
      }),
    );
  },

  'PUT /api/playbill': async (req: Request, res: Response) => {
    return res.json(
      mock({
        id: '@guid',
      }),
    );
  },

  'DELETE /api/channel': async (req: Request, res: Response) => {
    return res.json({});
  },

  'DELETE /api/playbill': async (req: Request, res: Response) => {
    return res.json({});
  },
};
