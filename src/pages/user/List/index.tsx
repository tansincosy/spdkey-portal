import { PlusOutlined } from '@ant-design/icons';
import { Button, message, Drawer, Form } from 'antd';
import React, { useState, useRef } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import {
  getUsers,
  removeUser,
  getUserInfo,
  addUser,
  updateUser,
  updateDevice,
  getDevicesByUserId,
} from '@/services/modules';
import {
  DrawerForm,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
} from '@ant-design/pro-form';

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
    await removeUser({
      data: {
        ids: selectedRows.map((row) => row.id),
      },
    });
    hide();
    message.success('删除成功');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};

const handleAdd = async (fields: API.User) => {
  const hide = message.loading('正在添加');
  console.log(fields);
  try {
    await addUser({ data: fields });
    hide();
    message.success('新增成功');
    return true;
  } catch (error) {
    hide();
    message.error('新增失败，请重试！');
    return false;
  }
};

const handleUpdate = async (fields: API.User) => {
  const hide = message.loading('正在添加');
  console.log(fields);
  try {
    await updateUser({ data: fields });
    hide();
    message.success('更新成功');
    return true;
  } catch (error) {
    hide();
    message.error('更新失败，请重试！');
    return false;
  }
};

const TableList: React.FC = () => {
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [createDrawerVisible, setCreateDrawerVisible] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.User>();
  const [selectedRowsState, setSelectedRows] = useState<API.User[]>([]);
  const [userForm] = Form.useForm();
  const [isUpdateForm, setIsUpdateForm] = useState<boolean>(false);
  const [userClients, setUserClients] = useState<API.Device[]>([]);
  const getUserInfoFromService = async (id: string) => {
    setUserClients([]);
    const userInfo = await getUserInfo({ id });
    const clientList = await getDevicesByUserId({ userId: id });
    setUserClients(clientList);
    setCurrentRow(userInfo);
  };

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();
  const clientColume: ProColumns<API.Device>[] = [
    {
      title: intl.formatMessage({ id: 'pages.client.table.id' }),
      dataIndex: 'id',
    },
    {
      title: intl.formatMessage({ id: 'pages.client.table.name' }),
      dataIndex: 'name',
    },
    {
      title: intl.formatMessage({ id: 'pages.client.table.isOnline' }),
      dataIndex: 'isOnline',
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        record.isOnline && (
          <Button
            danger
            type="link"
            key="offline"
            onClick={async () => {
              await updateDevice({
                data: {
                  ...record,
                  isOnline: false,
                },
              });
              message.success('已下线');
            }}
          >
            <FormattedMessage id="pages.searchTable.offline" defaultMessage="下线" />
          </Button>
        ),
      ],
    },
  ];
  const columns: ProColumns<API.User>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.username.nameLabel"
          defaultMessage="用户名"
        />
      ),
      dataIndex: 'username',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setIsUpdateForm(false);
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
      title: <FormattedMessage id="pages.searchTable.isLocked" defaultMessage="Description" />,
      dataIndex: 'isLocked',
      hideInForm: true,
      valueEnum: {
        true: {
          text: (
            <FormattedMessage id="pages.searchTable.nameStatus.yes" defaultMessage="Shut down" />
          ),
          status: 'Error',
        },
        false: {
          text: <FormattedMessage id="pages.searchTable.nameStatus.no" defaultMessage="Running" />,
          status: 'Default',
        },
      },
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.clientLimit"
          defaultMessage="Number of service calls"
        />
      ),
      search: false,
      hideInForm: true,
      dataIndex: 'clientLimit',
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
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="config"
          onClick={async () => {
            setCurrentRow(record);
            if (record.id) {
              setIsUpdateForm(true);
              const userInfo = await getUserInfo({ id: record.id });
              userForm.setFieldsValue(userInfo);
              setCreateDrawerVisible(true);
            }
          }}
        >
          <FormattedMessage id="pages.searchTable.config" defaultMessage="Configuration" />
        </a>,
        <Button
          danger
          type="link"
          key="delete"
          onClick={() => {
            handleRemove([record]);
            setIsUpdateForm(false);
          }}
        >
          <FormattedMessage id="pages.searchTable.delete" defaultMessage="删除" />
        </Button>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.User, API.PageParams>
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
            onClick={() => {
              userForm.resetFields();
              setIsUpdateForm(false);
              setCreateDrawerVisible(true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
          </Button>,
        ]}
        request={getUsers}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
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
          <Button
            danger
            onClick={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            <FormattedMessage
              id="pages.searchTable.batchDeletion"
              defaultMessage="Batch deletion"
            />
          </Button>
        </FooterToolbar>
      )}
      <DrawerForm
        title={intl.formatMessage({
          id: 'pages.user.addForm',
          defaultMessage: '新增用户',
        })}
        form={userForm}
        width="50%"
        visible={createDrawerVisible}
        onVisibleChange={setCreateDrawerVisible}
        onFinish={async (value) => {
          let success;
          if (value.id) {
            success = await handleUpdate(value as API.User);
          } else {
            success = await handleAdd(value as API.User);
          }
          if (success) {
            setCreateDrawerVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormText name="id" hidden />
        <ProFormText
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.user.addForm.password.notEmpty"
                  defaultMessage="不能为空"
                />
              ),
            },
          ]}
          label={intl.formatMessage({
            id: 'pages.user.addForm.username',
            defaultMessage: '用户名',
          })}
          width="lg"
          name="username"
        />
        {!isUpdateForm && (
          <ProFormText
            valueType="password"
            label={intl.formatMessage({
              id: 'pages.user.addForm.password',
              defaultMessage: '密码',
            })}
            rules={[
              {
                required: true,
                message: (
                  <FormattedMessage
                    id="pages.user.addForm.password.notEmpty"
                    defaultMessage="不能为空"
                  />
                ),
              },
            ]}
            width="lg"
            name="password"
          />
        )}

        <ProFormSelect
          name="scopes"
          label={intl.formatMessage({
            id: 'pages.user.addForm.scopes',
            defaultMessage: '作用范围',
          })}
          options={[
            {
              label: 'web',
              value: 'web',
            },
            {
              label: 'mobile',
              value: 'mobile',
            },
            {
              label: 'stb',
              value: 'stb',
            },
            {
              label: 'portal',
              value: 'portal',
            },
          ]}
          mode="tags"
        />
        <ProFormSwitch
          name="isLocked"
          label={intl.formatMessage({
            id: 'pages.user.addForm.isLocked',
            defaultMessage: '是否锁定',
          })}
        />
        <ProFormDigit
          name="clientLimit"
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.user.addForm.password.notEmpty"
                  defaultMessage="不能为空"
                />
              ),
            },
          ]}
          label={intl.formatMessage({
            id: 'pages.user.addForm.clientLimit',
            defaultMessage: '最大设备数量',
          })}
        />
      </DrawerForm>
      <Drawer
        width="50%"
        visible={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.username && (
          <>
            <ProDescriptions<API.User>
              column={2}
              title={currentRow?.username}
              request={async () => ({
                data: currentRow || {},
              })}
              params={{
                id: currentRow?.id,
              }}
              columns={columns as ProDescriptionsItemProps<API.User>[]}
            />
            <ProTable
              options={false}
              search={false}
              rowKey="id"
              dataSource={userClients}
              size="small"
              pagination={false}
              columns={clientColume}
            />
          </>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
