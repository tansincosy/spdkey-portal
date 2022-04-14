import { PlusOutlined } from '@ant-design/icons';
import { Button, message, Form, Drawer } from 'antd';
import React, { useState, useRef } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { DrawerForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { addConfig, removeConfig, updateConfig, getConfigList, checkRepeatName } from '@/services';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.Config) => {
  const hide = message.loading('正在添加');
  try {
    await addConfig({
      data: {
        ...fields,
      },
    });
    hide();
    message.success('新增成功');
    return true;
  } catch (error) {
    hide();
    message.error(`新增失败请重试 ${error}`);
    return false;
  }
};

const handleUpdate = async (fields: API.Config) => {
  const hide = message.loading('正在更新');
  try {
    await updateConfig({
      data: {
        ...fields,
      },
    });
    hide();
    message.success('更新成功');
    return true;
  } catch (error) {
    hide();
    message.error(`更新失败请重试 ${error}`);
    return false;
  }
};

/**
 *  Delete node
 * @zh-CN 删除节点
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: API.Config[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removeConfig({
      data: {
        ids: selectedRows.map((row) => row.id),
      },
    });
    hide();
    message.success('删除成功');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败');
    return false;
  }
};

const TableList: React.FC = () => {
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<API.Config>();
  const [editForm] = Form.useForm();

  const actionRef = useRef<ActionType>();
  const [selectedRowsState, setSelectedRows] = useState<API.RuleListItem[]>([]);

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  const columns: ProColumns<API.RuleListItem>[] = [
    {
      title: <FormattedMessage id="pages.dashboard.setting.title" defaultMessage="配置名称" />,
      dataIndex: 'name',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              if (entity) {
                setCurrentRow(entity);
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
      title: <FormattedMessage id="pages.dashboard.setting.value" defaultMessage="配置结果" />,
      dataIndex: 'value',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: <FormattedMessage id="pages.config.type" defaultMessage="类别" />,
      dataIndex: 'type',
      ellipsis: true,
      hideInSearch: true,
      valueEnum: {
        global: {
          text: '全局',
        },
      },
    },

    {
      title: <FormattedMessage id="pages.dashboard.setting.introduce" defaultMessage="备注" />,
      dataIndex: 'introduce',
      valueType: 'textarea',
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: <FormattedMessage id="pages.dashboard.setting.createAt" defaultMessage="创建时间" />,
      hideInForm: true,
      dataIndex: 'createdAt',
      valueType: 'dateTime',
    },
    {
      title: <FormattedMessage id="pages.dashboard.setting.updateAt" defaultMessage="更新时间" />,
      hideInForm: true,
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <Button
          size="small"
          type="link"
          key="config"
          onClick={() => {
            editForm.setFieldsValue({
              ...record,
            });
            handleModalVisible(true);
          }}
        >
          <FormattedMessage id="pages.dashboard.setting.editButton" defaultMessage="编辑" />
        </Button>,
        <Button
          size="small"
          type="link"
          danger
          key="deletedButton"
          onClick={() => {
            handleRemove([record]);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }}
        >
          <FormattedMessage id="pages.searchTable.delete" defaultMessage="删除" />
        </Button>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.Config, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.dashboard.setting.tableTitle',
          defaultMessage: '所有配置项',
        })}
        actionRef={actionRef}
        rowKey="id"
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              editForm.resetFields();
              handleModalVisible(true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
          </Button>,
        ]}
        request={getConfigList}
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
          id: 'pages.dashboard.setting.newForm',
          defaultMessage: '新增配置',
        })}
        form={editForm}
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        onFinish={async (value) => {
          const formData = await editForm.validateFields();
          let success;
          if (formData && formData.id) {
            success = await handleUpdate(formData as API.Config);
          } else {
            success = await handleAdd(value as API.Config);
          }
          if (success) {
            handleModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormText name="id" hidden />
        <ProFormText
          label={<FormattedMessage id="pages.dashboard.setting.title" defaultMessage="配置名称" />}
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage id="pages.searchTable.ruleName" defaultMessage="名称不能为空" />
              ),
            },
            {
              validator: async (rule, value) => {
                if (!value) {
                  return Promise.resolve();
                }
                const addFormData = editForm.getFieldsValue();
                const { result } = await checkRepeatName(value);
                if (result && !addFormData.id) {
                  // eslint-disable-next-line prefer-promise-reject-errors
                  return Promise.reject('名称重复');
                }
                return Promise.resolve();
              },
            },
          ]}
          name="name"
        />
        <ProFormSelect
          name="type"
          label={<FormattedMessage id="pages.dashboard.setting.type" defaultMessage="类别" />}
          options={[
            { value: 'GLOBAL', label: '全局' },
            { value: 'MOBILE', label: 'MOBILE' },
            { value: 'STB', label: 'STB' },
          ]}
        />
        <ProFormTextArea
          name="value"
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage id="pages.searchTable.ruleName" defaultMessage="名称不能为空" />
              ),
            },
          ]}
          label={<FormattedMessage id="pages.dashboard.setting.value" defaultMessage="配置结果" />}
        />

        <ProFormTextArea
          name="introduce"
          label={<FormattedMessage id="pages.dashboard.setting.introduce" defaultMessage="备注" />}
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
            <ProDescriptions<API.Config>
              column={1}
              title={currentRow?.name}
              request={async () => ({
                data: currentRow || {},
              })}
              params={{
                id: currentRow?.id,
              }}
              columns={columns as ProDescriptionsItemProps<API.Config>[]}
            />
          </>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
