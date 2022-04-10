import { Button, message, Drawer, Form } from 'antd';
import React, { useState, useRef } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import { removeDevice, getDeviceInfo, getDevices, updateDevice } from '@/services';
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
const handleRemove = async (selectedRows: API.Device[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removeDevice({
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

const handleUpdate = async (fields: API.Device) => {
  const hide = message.loading('正在添加');
  console.log(fields);
  const resultData = {
    ...fields,
    isLocked: fields.isLocked ? 1 : 0,
    isOnline: fields.isOnline ? 1 : 0,
  };
  try {
    await updateDevice({ data: resultData });
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
  const [currentRow, setCurrentRow] = useState<API.Device>();
  const [selectedRowsState, setSelectedRows] = useState<API.Device[]>([]);
  const [deviceForm] = Form.useForm();
  const getUserInfoFromService = async (id: string) => {
    const deviceInfo = await getDeviceInfo({ id });
    setCurrentRow(deviceInfo);
  };

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();
  const columns: ProColumns<API.Device>[] = [
    {
      title: (
        <FormattedMessage id="pages.searchTable.updateForm.deviceName" defaultMessage="设备名字" />
      ),
      dataIndex: 'name',
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
      title: <FormattedMessage id="pages.searchTable.isLocked" defaultMessage="Description" />,
      dataIndex: 'isLocked',
      hideInForm: true,
      valueEnum: {
        1: {
          text: (
            <FormattedMessage id="pages.searchTable.nameStatus.yes" defaultMessage="Shut down" />
          ),
          status: 'Error',
        },
        0: {
          text: <FormattedMessage id="pages.searchTable.nameStatus.no" defaultMessage="Running" />,
          status: 'Success',
        },
      },
    },
    {
      title: <FormattedMessage id="pages.client.table.isOnline" defaultMessage="Description" />,
      dataIndex: 'isOnline',
      hideInForm: true,
      valueEnum: {
        1: {
          text: (
            <FormattedMessage id="pages.searchTable.nameStatus.yes" defaultMessage="Shut down" />
          ),
          status: 'Success',
        },
        0: {
          text: <FormattedMessage id="pages.searchTable.nameStatus.no" defaultMessage="Running" />,
          status: 'Warning',
        },
      },
    },
    {
      title: <FormattedMessage id="pages.client.table.clientId" defaultMessage="设备id" />,
      dataIndex: 'deviceId',
      hideInForm: true,
      hideInTable: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.client.table.accessTokenValidateSeconds"
          defaultMessage="令牌有效时间"
        />
      ),
      dataIndex: 'accessTokenValidateSeconds',
      hideInForm: true,
      hideInTable: true,
      tooltip: <FormattedMessage id="pages.client.table.secondsTip" defaultMessage="单位：秒" />,
    },
    {
      title: (
        <FormattedMessage
          id="pages.client.table.refreshTokenValidateSeconds"
          defaultMessage="重置令牌有效时间"
        />
      ),
      tooltip: <FormattedMessage id="pages.client.table.secondsTip" defaultMessage="单位：秒" />,
      dataIndex: 'refreshTokenValidateSeconds',
      hideInForm: true,
      hideInTable: true,
    },
    {
      title: <FormattedMessage id="pages.searchTable.platform" defaultMessage="平台" />,
      search: false,
      hideInForm: true,
      dataIndex: 'os',
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
              const deviceInfo = await getDeviceInfo({ id: record.id });
              console.log('deviceInfo', deviceInfo);
              deviceInfo.isLocked = deviceInfo.isLocked === 1;
              deviceInfo.isOnline = deviceInfo.isOnline === 1;
              deviceForm.setFieldsValue(deviceInfo);
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
          onClick={async () => {
            await handleRemove([record]);
            actionRef.current?.reloadAndRest?.();
          }}
        >
          <FormattedMessage id="pages.searchTable.delete" defaultMessage="删除" />
        </Button>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.Device, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.searchTable.title',
          defaultMessage: 'Enquiry form',
        })}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        request={getDevices}
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
          id: 'pages.device.editForm',
          defaultMessage: '设置设备',
        })}
        form={deviceForm}
        width="50%"
        visible={createDrawerVisible}
        onVisibleChange={setCreateDrawerVisible}
        onFinish={async (value) => {
          let success;
          if (value.id) {
            success = await handleUpdate(value as API.Device);
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
        <ProFormSelect
          name="grants"
          disabled
          label={intl.formatMessage({
            id: 'pages.device.addForm.grants',
            defaultMessage: '授权类型',
          })}
          options={[
            {
              label: 'password',
              value: 'password',
            },
            {
              label: 'redirect_url',
              value: 'redirect_url',
            },
          ]}
          mode="tags"
        />
        <ProFormSwitch
          name="isOnline"
          label={intl.formatMessage({
            id: 'pages.client.table.isOnline',
            defaultMessage: '是否在线',
          })}
        />
        <ProFormSwitch
          name="isLocked"
          label={intl.formatMessage({
            id: 'pages.user.addForm.isLocked',
            defaultMessage: '是否锁定',
          })}
        />
        <ProFormDigit
          name="accessTokenValidateSeconds"
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
            id: 'pages.client.table.accessTokenValidateSeconds',
            defaultMessage: '令牌有效时间',
          })}
        />
        <ProFormDigit
          name="refreshTokenValidateSeconds"
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
            id: 'pages.client.table.refreshTokenValidateSeconds',
            defaultMessage: '重置令牌时间',
          })}
        />
      </DrawerForm>
      <Drawer
        width="30%"
        visible={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.name && (
          <>
            <ProDescriptions<API.Device>
              column={1}
              title={currentRow?.name}
              request={async () => ({
                data: currentRow || {},
              })}
              params={{
                id: currentRow?.id,
              }}
              columns={columns as ProDescriptionsItemProps<API.Device>[]}
            />
          </>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
