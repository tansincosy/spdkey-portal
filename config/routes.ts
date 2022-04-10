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
  // {
  //   path: '/epg',
  //   name: 'epg',
  //   icon: 'icon-pindaoEPG',
  //   routes: [
  //     {
  //       path: '/epg/channel',
  //       name: 'channel',
  //       component: './live/List',
  //     },
  //   ],
  // },
  {
    path: '/settings',
    name: 'setting',
    icon: 'icon-setting',
    routes: [
      // {
      //   path: '/settings/user',
      //   name: 'user-manager-list',
      //   component: './user/List',
      // },
      {
        path: '/settings/device',
        name: 'device-list',
        component: './device/List',
      },
      {
        path: '/settings/logs',
        name: 'settings-logs',
        component: './actionLogs/List',
      },
      {
        path: '/settings/config',
        name: 'settings-config',
        component: './customConfig/List',
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
