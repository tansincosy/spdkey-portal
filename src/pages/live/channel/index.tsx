import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, Image, message } from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import ProCard from '@ant-design/pro-card';
// @ts-ignore
import styles from './split.less';
import { FooterToolbar, PageContainer } from '@ant-design/pro-layout';
import {
  getChannels,
  getPlaybill,
  removeChannel,
  removePlaybill,
  addChannel,
  beginParseEpgXml,
  getChannelSourceProgram,
  getChannelSource,
} from '@/services';
import { FormattedMessage, useIntl } from 'umi';
import { DrawerForm, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import PopConfirmDel from '@/components/Popconfirm';

//TODO：选择频道问题  状态不能文字展示，选择节目单时，匹配节目url 节目单channelID
/**
 * {
 *
 *  channelId: 'xxxx.xml.urlid: channelID'
 *  选择时，不存储节目单数据，选择完成，进行存储，并且匹配关联节目单
 *
 * }
 * @param selectedRows
 * @returns
 */

const handleRemove = async (selectedRows: API.PlayBill[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removePlaybill({
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

const handleAddChannel = async (fields: API.Channel) => {
  const hide = message.loading('正在添加');
  try {
    await addChannel({
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

const handleRemoveChannel = async (selectedRows: API.Channel[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    await removeChannel({
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

const PlaybillList: React.FC<{ channelId?: string }> = (props) => {
  const { channelId } = props;
  const [tableListDataSource, setTableListDataSource] = useState<API.PlayBill[]>([]);
  const [selectedRowsState, setSelectedRows] = useState<API.PlayBill[]>([]);
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<API.PlayBill>[] = [
    {
      title: <FormattedMessage id="pages.channel.table.list.playbill" defaultMessage="节目单" />,
      dataIndex: 'title',
    },
    {
      title: <FormattedMessage id="pages.channel.table.list.starttime" defaultMessage="开始时间" />,
      dataIndex: 'startTime',
      valueType: 'dateTime',
    },
    {
      title: <FormattedMessage id="pages.channel.table.list.endtime" defaultMessage="结束时间" />,
      dataIndex: 'endTime',
      valueType: 'dateTime',
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
      width: 80,
      valueType: 'option',
      render: (_, record) => (
        <PopConfirmDel
          onConfirmDel={() => {
            handleRemove([record]);
          }}
        />
      ),
    },
  ];

  useEffect(() => {
    getPlaybillData({ current: 1, pageSize: 10, channelId });
  }, [channelId]);

  async function getPlaybillData(params: any) {
    const data = (await getPlaybill(params)) as any;
    if (data.data) {
      setTableListDataSource(data.data);
    }
    return data;
  }

  return (
    <>
      <ProTable<API.PlayBill, API.PageParams>
        columns={columns}
        dataSource={tableListDataSource}
        rowKey="id"
        search={false}
        actionRef={actionRef}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
        toolbar={{
          actions: [
            <Button key="list" type="primary" onClick={() => {}}>
              <FormattedMessage
                id="pages.channel.table.list.addPlaybillButton"
                defaultMessage="新建节目单"
              />
            </Button>,
          ],
        }}
        request={(params) =>
          getPlaybillData({ current: params?.current, pageSize: params?.pageSize, channelId })
        }
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
    </>
  );
};

const ChannelList: React.FC<{
  channelId?: string;
  onChange: (channel: API.Channel) => void;
}> = (props) => {
  const { onChange, channelId } = props;
  const [channelForm] = Form.useForm();
  const [createDrawerVisible, setCreateDrawerVisible] = useState<boolean>(false);
  const [playBillList, setPlayBillList] = useState<API.PlayBill[]>([]);
  const actionRef = useRef<ActionType>();
  const intl = useIntl();
  const columns: ProColumns<API.Channel>[] = [
    {
      title: <FormattedMessage id="pages.channel.table.list.logo" defaultMessage="台标" />,
      dataIndex: 'images',
      render(dataRow: any) {
        return <Image width={75} height={30} src={dataRow[0]?.href} />;
      },
    },
    {
      title: <FormattedMessage id="pages.channel.table.list.titleKey" defaultMessage="频道名" />,
      dataIndex: 'title',
    },
    {
      title: <FormattedMessage id="pages.channel.table.list.channelId" defaultMessage="频道ID" />,
      dataIndex: 'channelId',
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="操作" />,
      width: 80,
      valueType: 'option',
      render: (_, record) => (
        <PopConfirmDel
          onConfirmDel={() => {
            handleRemoveChannel([record]);
          }}
        />
      ),
    },
  ];

  /**
   * 解析xml 文件
   * @returns
   */
  const beginEPGXmlParse = async () => {
    const { xmlReadyParseUrl } = (await channelForm.getFieldsValue()) || {};

    if (!xmlReadyParseUrl) {
      message.warning(
        intl.formatMessage({
          id: 'pages.channel.table.list.noXmlUrl',
          defaultMessage: '没有填写xml地址,请填写',
        }),
      );
      return;
    }
    await beginParseEpgXml({
      parseUrl: xmlReadyParseUrl,
    });

    message.success(
      intl.formatMessage({
        id: 'pages.channel.table.list.parseSuccess',
        defaultMessage: '解析成功',
      }),
    );
  };

  return (
    <>
      <ProTable<API.Channel, API.PageParams>
        columns={columns}
        actionRef={actionRef}
        request={getChannels}
        rowKey="id"
        rowClassName={(record) => {
          return record.channelId === channelId ? styles['split-row-select-active'] : '';
        }}
        toolbar={{
          search: {
            onSearch: (value) => {
              alert(value);
            },
          },
          actions: [
            <Button
              key="list"
              type="primary"
              onClick={() => {
                setPlayBillList([]);
                channelForm.resetFields();
                setCreateDrawerVisible(true);
              }}
            >
              <FormattedMessage
                id="pages.channel.table.list.addChannelButton"
                defaultMessage="新建频道"
              />
            </Button>,
          ],
        }}
        options={false}
        search={false}
        onRow={(record) => {
          return {
            onClick: () => {
              if (record) {
                onChange(record);
              }
            },
          };
        }}
      />

      <DrawerForm
        title={[
          <FormattedMessage
            key="title"
            id="pages.channel.table.list.addChannelButton"
            defaultMessage="新建频道"
          />,
        ]}
        form={channelForm}
        width="50%"
        visible={createDrawerVisible}
        onVisibleChange={setCreateDrawerVisible}
        onFinish={async (value: API.Channel) => {
          console.log('channelForm>>>', channelForm);
          let success;
          if (value.id) {
            console.log('update');
          } else {
            const { title } = value;
            if (title) {
              success = await handleAddChannel({
                title,
                playSources:
                  (value.playSources && value.playSources.map((item: any) => item.item)) || [],
                channelId: value.channelId,
                playbills: playBillList,
              });
            }
          }
          if (success) {
            setCreateDrawerVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormText
          name="title"
          label={intl.formatMessage({
            id: 'pages.channel.table.list.titleKey',
            defaultMessage: '频道名',
          })}
        />
        <ProFormSelect
          name="playSources"
          mode="multiple"
          allowClear
          request={getChannelSource}
          label={intl.formatMessage({
            id: 'pages.channel.table.list.channel-url',
            defaultMessage: '直播播放地址',
          })}
          placeholder={intl.formatMessage({
            id: 'pages.channel.table.list.channel-url',
            defaultMessage: '直播播放地址',
          })}
        />
        <ProFormText
          addonAfter={
            <Button onClick={beginEPGXmlParse} type="primary" size="small">
              {intl.formatMessage({
                id: 'pages.channel.add.form.label.xml-button',
                defaultMessage: '开始解析',
              })}
            </Button>
          }
          name="xmlReadyParseUrl"
          label={intl.formatMessage({
            id: 'pages.channel.add.form.label.xml-name',
            defaultMessage: '填写xml地址',
          })}
        />
        <ProFormSelect
          name="channelProgram"
          showSearch
          allowClear
          request={getChannelSourceProgram}
          label={
            <FormattedMessage
              id="pages.channel.form.chosen-program"
              defaultMessage="从源中选择节目单"
            />
          }
          placeholder={intl.formatMessage({
            id: 'pages.channel.form.chosen-program',
            defaultMessage: '从源中选择节目单',
          })}
          rules={[{ required: true, message: 'Please select your country!' }]}
        />
      </DrawerForm>
    </>
  );
};

const Channel: React.FC = () => {
  const [channelItem, setChannelItem] = useState<API.Channel>({} as any);

  return (
    <PageContainer>
      <ProCard split="vertical">
        <ProCard colSpan="384px" ghost>
          <ChannelList onChange={(chosenId) => setChannelItem(chosenId)} />
        </ProCard>
        <ProCard title={channelItem.title}>
          <PlaybillList channelId={channelItem.channelId} />
        </ProCard>
      </ProCard>
    </PageContainer>
  );
};

export default Channel;
