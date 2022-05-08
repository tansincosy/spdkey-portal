import React, { useRef, useState } from 'react';
import { Button, Form, Image, message, Select } from 'antd';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import ProCard from '@ant-design/pro-card';
// @ts-ignore
import styles from './split.less';
import { PageContainer } from '@ant-design/pro-layout';
import {
  getChannels,
  removeChannel,
  addChannel,
  beginParseEpgXml,
  getChannelSourceProgram,
  getChannelSource,
} from '@/services';
import { FormattedMessage, useIntl } from 'umi';
import { DrawerForm, ProFormText } from '@ant-design/pro-form';
import PopConfirmDel from '@/components/Popconfirm';
import { useDebounceFn } from 'ahooks';
import { PlaybillList } from '../components/Porgram';

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

const ChannelList: React.FC<{
  id?: string;
  onChange: (channel: API.Channel) => void;
}> = ({ onChange, id }) => {
  const [channelForm] = Form.useForm();
  const [createDrawerVisible, setCreateDrawerVisible] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const intl = useIntl();

  const columns: ProColumns<API.Channel>[] = [
    {
      title: <FormattedMessage id="pages.channel.table.list.logo" defaultMessage="台标" />,
      dataIndex: 'images',
      render(dataRow: any) {
        return <Image width={75} height={30} src={dataRow[0]?.href} />;
      },
      search: false,
    },
    {
      title: <FormattedMessage id="pages.channel.table.list.titleKey" defaultMessage="频道名" />,
      dataIndex: 'title',
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              if (entity.id) {
                onChange(entity);
              }
            }}
          >
            {dom}
          </a>
        );
      },
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

  const channelSourceProgramsPageNumber = useRef<number>(1);
  const [channelSourceProgramsOptions, setChannelSourceProgramsOptions] = useState<
    API.AllowChannelSource[]
  >([]);

  const loadChannelSourcesProgram = async (current: number) => {
    const { data } = await getChannelSourceProgram({ current, pageSize: 200 });
    channelSourceProgramsPageNumber.current = current;
    setChannelSourceProgramsOptions((oldOptions) => {
      return [...oldOptions, ...data];
    });
  };

  const onPopupScrollForChannelSourceProgram = async (e: any) => {
    const {
      target: { scrollTop, offsetHeight, scrollHeight },
    } = e;
    if (scrollTop + offsetHeight >= scrollHeight) {
      await loadChannelSourcesProgram(channelSourceProgramsPageNumber.current + 1);
    }
  };

  const channelSourcePageNumber = useRef<number>(1);
  const [channelSourceOptions, setChannelSourceOptions] = useState<API.ChannelSource[]>([]);

  const loadChannelSources = async (current: number) => {
    const { data } = await getChannelSource({ current, pageSize: 200 });
    channelSourcePageNumber.current = current;
    setChannelSourceOptions((oldOptions) => {
      return [...oldOptions, ...data];
    });
  };

  const onPopupScroll = async (e: any) => {
    const {
      target: { scrollTop, offsetHeight, scrollHeight },
    } = e;
    if (scrollTop + offsetHeight >= scrollHeight) {
      await loadChannelSources(channelSourcePageNumber.current + 1);
    }
  };

  const onPlaySourceSearch = useDebounceFn(
    async (value: string) => {
      if (value) {
        const { data } = await getChannelSource(
          {},
          {
            params: {
              name: value,
            },
          },
        );
        if (Array.isArray(data) && data.length > 0) {
          setChannelSourceOptions(data);
        }
      }
    },
    {
      wait: 1000,
    },
  );

  const onPlaySourceProgramSearch = useDebounceFn(
    async (value: string) => {
      if (value) {
        const { data } = await getChannelSourceProgram(
          {},
          {
            params: {
              name: value,
            },
          },
        );
        if (Array.isArray(data) && data.length > 0) {
          setChannelSourceProgramsOptions(data);
        }
      }
    },
    {
      wait: 1000,
    },
  );

  return (
    <>
      <ProTable<API.Channel, API.PageParams>
        columns={columns}
        actionRef={actionRef}
        request={getChannels}
        rowKey="id"
        rowClassName={(record) => {
          return record.id === id ? styles['split-row-select-active'] : '';
        }}
        toolbar={{
          actions: [
            <Button
              key="list"
              type="primary"
              onClick={() => {
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
        onRow={(record) => {
          return {
            onClick: () => {
              if (record) {
              }
            },
          };
        }}
      />

      <DrawerForm<API.Channel>
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
          console.log(
            'channelForm>>>',
            channelForm.getFieldsValue(),
            'value.playSources',
            value.playSources,
          );
          let success;
          if (value.id) {
            console.log('update');
          } else {
            const { title } = value;
            if (title) {
              success = await handleAddChannel({
                title,
                programSourceId: value.programSourceId,
                playSources: value.playSources || [],
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
        <Form.Item
          name="playSources"
          label={intl.formatMessage({
            id: 'pages.channel.table.list.channel-url',
            defaultMessage: '直播播放地址',
          })}
        >
          <Select
            onSearch={onPlaySourceSearch.run}
            onClear={() => loadChannelSources(1)}
            mode="multiple"
            onPopupScroll={onPopupScroll}
            onDropdownVisibleChange={() => loadChannelSources(1)}
            showSearch
            allowClear
            filterOption={false}
            defaultActiveFirstOption={false}
            getPopupContainer={(triggerNode) => triggerNode.parentNode}
            notFoundContent={null}
            placeholder={intl.formatMessage({
              id: 'pages.channel.table.list.channel-url',
              defaultMessage: '直播播放地址',
            })}
          >
            {channelSourceOptions.map((item: API.ChannelSource) => {
              return (
                <Select.Option key={item.id} value={item.playUrl}>
                  {item.name}
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>

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

        <Form.Item
          name="programSourceId"
          label={
            <FormattedMessage
              id="pages.channel.form.chosen-program"
              defaultMessage="从源中选择节目单"
            />
          }
        >
          <Select
            onPopupScroll={onPopupScrollForChannelSourceProgram}
            allowClear
            showSearch
            filterOption={false}
            defaultActiveFirstOption={false}
            getPopupContainer={(triggerNode) => triggerNode.parentNode}
            onSearch={onPlaySourceProgramSearch.run}
            onClear={() => loadChannelSourcesProgram(1)}
            onDropdownVisibleChange={() => loadChannelSourcesProgram(1)}
            placeholder={intl.formatMessage({
              id: 'pages.channel.form.chosen-program',
              defaultMessage: '从源中选择节目单',
            })}
            options={channelSourceProgramsOptions.map((item: API.AllowChannelSource) => ({
              label: item.name,
              value: `${item.ePGUrlId}:${item.channelId}`,
            }))}
          />
        </Form.Item>
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
          <ChannelList onChange={(chosenId) => setChannelItem(chosenId)} id={channelItem.id} />
        </ProCard>
        <ProCard title={channelItem.title}>
          <PlaybillList programSourceId={channelItem.programSourceId} />
        </ProCard>
      </ProCard>
    </PageContainer>
  );
};

export default Channel;
