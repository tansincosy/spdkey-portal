import { UndoOutlined } from '@ant-design/icons';
import { Button, Drawer, Form, Image } from 'antd';
import React, { useState, useRef } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import { getChannelSource, getChannelSourcesInfo, refreshChannelSource } from '@/services';

const TableList: React.FC = () => {
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.ChannelSource>();
  const [userForm] = Form.useForm();
  const getUserInfoFromService = async (id: string) => {
    const channelSourceInfo = await getChannelSourcesInfo({
      id,
    });
    setCurrentRow(channelSourceInfo);
  };

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();
  const columns: ProColumns<API.ChannelSource>[] = [
    {
      title: <FormattedMessage id="pages.searchTable.logo" defaultMessage="台标" />,
      search: false,
      hideInForm: true,
      dataIndex: 'images',
      render(dataRow: any) {
        return <Image width={75} height={30} src={dataRow[0]?.href} />;
      },
    },
    {
      title: <FormattedMessage id="pages.searchTable.channelName" defaultMessage="频道名" />,
      dataIndex: 'title',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              if (entity.id) {
                getUserInfoFromService(entity.id);
                setShowDetail(true);
              }
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: <FormattedMessage id="pages.searchTable.status" defaultMessage="状态" />,
      dataIndex: 'status',
      hideInForm: true,
      valueEnum: {
        '-1': {
          text: (
            <FormattedMessage id="pages.searchTable.nameStatus.yes" defaultMessage="Shut down" />
          ),
          status: 0,
        },
        '1': {
          text: <FormattedMessage id="pages.searchTable.nameStatus.no" defaultMessage="Running" />,
          status: 1,
        },
        '0': {
          text: <FormattedMessage id="pages.searchTable.nameStatus.no" defaultMessage="Running" />,
          status: 1,
        },
      },
    },
    {
      title: <FormattedMessage id="pages.searchTable.language" defaultMessage="语言" />,
      dataIndex: 'language',
      hideInForm: true,
    },
    {
      search: false,
      title: <FormattedMessage id="pages.searchTable.createdAt" defaultMessage="创建时间" />,
      dataIndex: 'createdAt',
      hideInForm: true,
      valueType: 'dateTime',
    },
    {
      search: false,
      title: <FormattedMessage id="pages.searchTable.updatedAt" defaultMessage="更新时间" />,
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      hideInForm: true,
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.ChannelSource, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.searchTable.title',
          defaultMessage: 'Enquiry form',
        })}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={async () => {
              await refreshChannelSource();
              actionRef.current?.reload();

              userForm.resetFields();
            }}
          >
            <UndoOutlined />{' '}
            <FormattedMessage id="pages.searchTable.refresh-resource" defaultMessage="刷新资源" />
          </Button>,
        ]}
        request={getChannelSource}
        columns={columns}
      />
      <Drawer
        width="50%"
        visible={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.title && (
          <>
            <ProDescriptions<API.User>
              column={2}
              title={currentRow?.title}
              request={async () => ({
                data: currentRow || {},
              })}
              params={{
                id: currentRow?.id,
              }}
              columns={columns as ProDescriptionsItemProps<API.User>[]}
            />
          </>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
