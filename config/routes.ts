//TODO:设置 ->device -> user 之间关系
//设置
// livetv 频道和节目单之间关系
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user',
        routes: [
          {
            name: 'login',
            path: '/user/login',
            component: './user/Login',
          },
        ],
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/epg',
    name: 'epg',
    icon: 'icon-pindaoEPG',
    routes: [
      {
        path: '/epg/channel',
        name: 'channel',
        component: './live/List',
      },
    ],
  },
  {
    path: '/settings',
    name: 'setting',
    icon: 'icon-setting',
    routes: [
      {
        path: '/settings/user',
        name: 'user-manager-list',
        component: './settings/userList',
      },
      {
        path: '/settings/device',
        name: 'device-list',
        component: './settings/device/List',
      },
      // {
      //   path: '/settings/logs',
      //   name: 'settings-logs',
      //   component: './actionLogs/List',
      // },
      {
        path: '/settings/config',
        name: 'settings-config',
        component: './settings/customConfig/List',
      },
    ],
  },
  {
    path: '/',
    redirect: '/settings/device',
  },
  {
    component: './404',
  },
];
