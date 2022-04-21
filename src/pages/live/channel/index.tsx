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
  getChannelSource,
  getChannelSourceProgram,
} from '@/services';
import { FormattedMessage, useIntl } from 'umi';
import { DrawerForm, ProFormList, ProFormText, ProFormUploadDragger } from '@ant-design/pro-form';
import XLSX from 'xlsx';
import PopConfirmDel from '@/components/Popconfirm';
let cacheCallbacks: any;

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
  const actionChannelSourceRef = useRef<ActionType>();
  const intl = useIntl();
  const [createChannelSourceVisible, setCreateChannelSourceVisible] = useState<boolean>(false);
  const [channelSourceSelectedRow, setChannelSourceSelectedRows] = useState<API.ChannelSource[]>(
    [],
  );

  const [playbillChosenVisible, setPlaybillChosenVisible] = useState<boolean>(false);
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

  //[channel -> inputPG ]

  // new PG
  //edit program data
  //edit channel data

  const importToJson = (jsonArray: any) => {
    const resultJson = jsonArray
      .filter((item: any | null) => item)
      .map((objArr: any, index: number) => {
        if (index !== 0) {
          const [title, chanId, startTime, endTime] = objArr;
          return {
            title,
            channelId: chanId,
            startTime: startTime,
            endTime: endTime,
          };
        }
      });
    setPlayBillList(resultJson);
  };

  const uploadProps = {
    // 这里我们只接受excel2007以后版本的文件，accept就是指定文件选择框的文件类型
    accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    name: 'file',
    showUploadList: false,
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

        <ProFormList
          name="playSources"
          label={intl.formatMessage({
            id: 'pages.channel.table.list.channel-url',
            defaultMessage: '直播播放地址',
          })}
        >
          {(f, index, action) => {
            return (
              <>
                <div
                  style={{
                    display: 'flex',
                  }}
                >
                  <ProFormText initialValue={index} name="item" />
                  <Button
                    style={{
                      marginLeft: '10px',
                      marginTop: '2px',
                    }}
                    size="small"
                    type="primary"
                    key="set-channel-source"
                    onClick={() => {
                      setCreateChannelSourceVisible(true);
                      setChannelSourceSelectedRows([]);
                      cacheCallbacks = (channelSource: API.ChannelSource[]) => {
                        if (Array.isArray(channelSource)) {
                          if (channelSource.length > 1) {
                            channelSource.forEach((rowData, channelIndex) => {
                              if (channelIndex === 0) {
                                action.setCurrentRowData({
                                  item: channelSource[0].playUrl,
                                });
                              } else {
                                action.add({
                                  item: rowData.playUrl,
                                });
                              }
                            });
                          } else {
                            action.setCurrentRowData({
                              item: channelSource[0].playUrl,
                            });
                          }
                        }
                      };
                    }}
                  >
                    {intl.formatMessage({
                      id: 'pages.searchTable.add.sourceAdd',
                      defaultMessage: '选择频道源',
                    })}
                  </Button>
                </div>
              </>
            );
          }}
        </ProFormList>
        <ProFormUploadDragger
          fieldProps={{
            onRemove() {
              setPlayBillList([]);
            },
            beforeUpload: (file) => {
              const rABS = true;
              if (!file) {
                return;
              }
              const fileReader = new FileReader();
              fileReader.onload = function (e: any) {
                let data = e?.target.result;
                if (!rABS) data = new Uint8Array(data);
                const workbook = XLSX.read(data, {
                  type: rABS ? 'binary' : 'array',
                });
                // 假设我们的数据在第一个标签
                const first_worksheet = workbook.Sheets[workbook.SheetNames[0]];
                // XLSX自带了一个工具把导入的数据转成json
                const jsonArr = XLSX.utils.sheet_to_json(first_worksheet, { header: 1 });
                importToJson(jsonArr);
              };
              if (rABS) {
                fileReader.readAsBinaryString(file);
              }
              return false;
            },
          }}
          {...uploadProps}
          max={1}
          label={
            <>
              {intl.formatMessage({
                id: 'pages.searchTable.import-program',
                defaultMessage: '导入节目单',
              })}
              <Button
                onClick={() => {
                  setPlaybillChosenVisible(true);
                }}
                size="small"
                type="primary"
                style={{
                  marginLeft: 10,
                }}
              >
                {
                  <FormattedMessage
                    id="pages.channel.form.chosen-program"
                    defaultMessage="从源选择节目单"
                  />
                }
              </Button>
            </>
          }
        />
        <ProTable
          options={false}
          search={false}
          rowKey="startTime"
          dataSource={playBillList}
          size="small"
          pagination={false}
          title={() => '节目单列表'}
          columns={[
            {
              dataIndex: 'title',
              title: (
                <FormattedMessage id="pages.channel.table.list.playbill" defaultMessage="节目单" />
              ),
            },
            {
              dataIndex: 'startTime',
              title: (
                <FormattedMessage
                  id="pages.channel.table.list.starttime"
                  defaultMessage="开始时间"
                />
              ),
            },
            {
              dataIndex: 'endTime',
              title: (
                <FormattedMessage id="pages.channel.table.list.endtime" defaultMessage="结束时间" />
              ),
            },
          ]}
        />
      </DrawerForm>

      <DrawerForm
        title={
          <FormattedMessage
            id="pages.channel.table.list.chosenChannel"
            defaultMessage="所有频道源"
          />
        }
        width="30%"
        visible={createChannelSourceVisible}
        onVisibleChange={setCreateChannelSourceVisible}
        onFinish={async () => {
          if (channelSourceSelectedRow.length > 0) {
            setCreateChannelSourceVisible(false);
          }
        }}
      >
        <ProTable
          rowKey="id"
          request={getChannelSourceProgram}
          size="small"
          rowSelection={{
            onChange: (_, selectedRows) => {
              setChannelSourceSelectedRows(selectedRows);
            },
          }}
          columns={[
            {
              dataIndex: 'title',
              title: (
                <FormattedMessage id="pages.searchTable.channelName" defaultMessage="频道名" />
              ),
            },
            {
              title: <FormattedMessage id="pages.searchTable.status" defaultMessage="状态" />,
              dataIndex: 'status',
              hideInForm: true,
              valueEnum: {
                '-1': {
                  text: (
                    <FormattedMessage
                      id="pages.searchTable.nameStatus.default"
                      defaultMessage="未刷新"
                    />
                  ),
                  status: '-1',
                },
                '0': {
                  text: (
                    <FormattedMessage
                      id="pages.searchTable.nameStatus.no"
                      defaultMessage="不可用"
                    />
                  ),
                  status: '0',
                },
                '1': {
                  text: (
                    <FormattedMessage id="pages.searchTable.nameStatus.yes" defaultMessage="可用" />
                  ),
                  status: '1',
                },
              },
            },
            {
              search: false,
              title: (
                <FormattedMessage id="pages.searchTable.updatedAt" defaultMessage="更新时间" />
              ),
              dataIndex: 'updatedAt',
              valueType: 'dateTime',
              hideInForm: true,
            },
          ]}
        />
      </DrawerForm>

      <DrawerForm
        title={
          <FormattedMessage
            id="pages.channel.table.list.chosenChannel"
            defaultMessage="所有频道源"
          />
        }
        width="30%"
        visible={playbillChosenVisible}
        onVisibleChange={setPlaybillChosenVisible}
        onFinish={async () => {
          if (channelSourceSelectedRow.length > 0) {
            setPlaybillChosenVisible(false);
            if (cacheCallbacks) {
              cacheCallbacks(channelSourceSelectedRow);
            }

            if (actionChannelSourceRef.current) {
              actionChannelSourceRef.current.reload();
            }
          }
        }}
      >
        <ProTable
          actionRef={actionChannelSourceRef}
          rowKey="id"
          request={getChannelSource}
          size="small"
          rowSelection={{
            onChange: (_, selectedRows) => {
              setChannelSourceSelectedRows(selectedRows);
            },
          }}
          columns={[
            {
              dataIndex: 'title',
              title: (
                <FormattedMessage id="pages.searchTable.channelName" defaultMessage="频道名" />
              ),
            },
            {
              title: <FormattedMessage id="pages.searchTable.status" defaultMessage="状态" />,
              dataIndex: 'status',
              hideInForm: true,
              valueEnum: {
                '-1': {
                  text: (
                    <FormattedMessage
                      id="pages.searchTable.nameStatus.default"
                      defaultMessage="未刷新"
                    />
                  ),
                  status: '-1',
                },
                '0': {
                  text: (
                    <FormattedMessage
                      id="pages.searchTable.nameStatus.no"
                      defaultMessage="不可用"
                    />
                  ),
                  status: '0',
                },
                '1': {
                  text: (
                    <FormattedMessage id="pages.searchTable.nameStatus.yes" defaultMessage="可用" />
                  ),
                  status: '1',
                },
              },
            },
            {
              search: false,
              title: (
                <FormattedMessage id="pages.searchTable.updatedAt" defaultMessage="更新时间" />
              ),
              dataIndex: 'updatedAt',
              valueType: 'dateTime',
              hideInForm: true,
            },
          ]}
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
