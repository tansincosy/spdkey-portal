import { mock } from 'mockjs';
import { Request, Response } from 'express';

export default {
  'DELETE /api/operation-log': async (req: Request, res: Response) => {
    return res.json({});
  },

  'POST /api/operation-log': async (req: Request, res: Response) => {
    return res.json(
      mock({
        id: '@guid',
      }),
    );
  },

  'GET /api/operation-log': async (req: Request, res: Response) => {
    const { current = 1, pageSize = 10, id } = req.query;

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
    const mockDatas = mock({
      'data|1-50': [
        {
          id: '@guid',
          message: '@paragraph()',
          module: '@title()',
          timestamp: '@datetime(T)',
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
