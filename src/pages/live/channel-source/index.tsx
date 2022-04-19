import { PlusOutlined } from '@ant-design/icons';
import { Button, Drawer, Form, Image, message, Popconfirm } from 'antd';
import React, { useState, useRef } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import {
  getChannelSource,
  getChannelSourcesInfo,
  addChannelSourcesInfo,
  removeChannelSource,
} from '@/services';
import { DrawerForm, ProFormText } from '@ant-design/pro-form';

const ChannelList: React.FC = () => {
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.ChannelSource>();
  const [userForm] = Form.useForm();
  const [selectedRowsState, setSelectedRows] = useState<API.ChannelSource[]>([]);
  const [createDrawerVisible, setCreateDrawerVisible] = useState<boolean>(false);
  const getUserInfoFromService = async (id: string) => {
    const channelSourceInfo = await getChannelSourcesInfo({
      id,
    });
    setCurrentRow(channelSourceInfo);
  };

  /**
   *  Delete node
   * @zh-CN 删除节点
   *
   * @param selectedRows
   */
  const handleRemove = async (selectedRows: API.User[]) => {
    const hide = message.loading('正在删除');
    if (!selectedRows) return true;
    try {
      await removeChannelSource({
        data: {
          ids: selectedRows.map((row) => row.id),
        },
      });
      hide();
      message.success(
        intl.formatMessage({
          id: 'pages.channel.form.del.success',
          defaultMessage: '删除频道成功',
        }),
      );
      return true;
    } catch (error) {
      hide();
      message.error(
        intl.formatMessage({ id: 'pages.channel.form.del.fail', defaultMessage: '删除频道失败' }),
      );
      return false;
    }
  };

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
            <FormattedMessage id="pages.searchTable.nameStatus.default" defaultMessage="未刷新" />
          ),
          status: '-1',
        },
        '0': {
          text: <FormattedMessage id="pages.searchTable.nameStatus.no" defaultMessage="不可用" />,
          status: '0',
        },
        '1': {
          text: <FormattedMessage id="pages.searchTable.nameStatus.yes" defaultMessage="可用" />,
          status: '1',
        },
      },
    },
    {
      title: <FormattedMessage id="pages.searchTable.language" defaultMessage="语言" />,
      dataIndex: 'language',
    },
    {
      search: false,
      title: <FormattedMessage id="pages.searchTable.createdAt" defaultMessage="创建时间" />,
      dataIndex: 'createdAt',
      hideInForm: true,
      valueType: 'dateTime',
      sorter: true,
    },
    {
      search: false,
      title: <FormattedMessage id="pages.searchTable.updatedAt" defaultMessage="更新时间" />,
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      hideInForm: true,
      sorter: true,
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => {
        return (
          <Popconfirm
            title={intl.formatMessage({
              id: 'pages.channel.form.del.is-del',
              defaultMessage: '是否确认删除？',
            })}
            onConfirm={() => handleRemove([record])}
            okText="Yes"
            cancelText="No"
          >
            <a type="link">
              <FormattedMessage id="pages.searchTable.delete" defaultMessage="删除" />
            </a>
          </Popconfirm>
        );
      },
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
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              userForm.resetFields();
              setCreateDrawerVisible(true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
          </Button>,

          ,
        ]}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
        request={(params, sort) => {
          return getChannelSource({
            ...params,
            ...sort,
          });
        }}
        columns={columns}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.searchTable.chosen" defaultMessage="Chosen" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" defaultMessage="项" />
              &nbsp;&nbsp;
              <span>
                <FormattedMessage
                  id="pages.searchTable.totalServiceCalls"
                  defaultMessage="Total number of service calls"
                />{' '}
                <FormattedMessage id="pages.searchTable.tenThousand" defaultMessage="万" />
              </span>
            </div>
          }
        >
          <Popconfirm
            title={intl.formatMessage({
              id: 'pages.channel.form.del.is-del',
              defaultMessage: '是否确认删除？',
            })}
            onConfirm={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
            okText="Yes"
            cancelText="No"
          >
            <Button danger>
              <FormattedMessage
                id="pages.searchTable.batchDeletion"
                defaultMessage="Batch deletion"
              />
            </Button>
          </Popconfirm>
        </FooterToolbar>
      )}
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
              columns={columns as ProDescriptionsItemProps<API.ChannelSource>[]}
            />
          </>
        )}
      </Drawer>
      <DrawerForm
        title={intl.formatMessage({
          id: 'pages.channel.table.list.url',
          defaultMessage: 'm3u地址',
        })}
        form={userForm}
        width="30%"
        visible={createDrawerVisible}
        onVisibleChange={setCreateDrawerVisible}
        onFinish={async (value) => {
          const success = await addChannelSourcesInfo({
            data: {
              ...value,
            },
          });
          if (success) {
            setCreateDrawerVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
              message.success(
                intl.formatMessage({
                  id: 'pages.channel.form.add.success.message',
                  defaultMessage: '新建频道成功',
                }),
              );
            }
          }
        }}
      >
        <ProFormText
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.channel.table.list.input-url"
                  defaultMessage="请输入m3u地址"
                />
              ),
            },
            {
              //匹配包含http://或者https://和.m3u的结尾字符串
              pattern: /(http:\/\/|https:\/\/).*\.m3u$/,
              message: (
                <FormattedMessage
                  id="pages.channel.table.list.input-url"
                  defaultMessage="请输入m3u地址"
                />
              ),
            },
          ]}
          label={intl.formatMessage({
            id: 'pages.channel.table.list.url',
            defaultMessage: 'm3u地址',
          })}
          width="lg"
          name="url"
        />
      </DrawerForm>
    </PageContainer>
  );
};

export default ChannelList;
