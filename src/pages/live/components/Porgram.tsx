import PopConfirmDel from '@/components/Popconfirm';
import { getPlaybill, removePlaybill } from '@/services';
import { FooterToolbar } from '@ant-design/pro-layout';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Button, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'umi';

export const PlaybillList: React.FC<{ programSourceId?: string }> = (props) => {
  const { programSourceId } = props;
  const [tableListDataSource, setTableListDataSource] = useState<API.PlayBill[]>([]);
  const [selectedRowsState, setSelectedRows] = useState<API.PlayBill[]>([]);
  const actionRef = useRef<ActionType>();

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

  const columns: ProColumns<API.PlayBill>[] = [
    {
      title: <FormattedMessage id="pages.channel.table.list.playbill" defaultMessage="节目单" />,
      dataIndex: 'title',
    },
    {
      title: <FormattedMessage id="pages.channel.table.list.starttime" defaultMessage="开始时间" />,
      dataIndex: 'startTime',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: <FormattedMessage id="pages.channel.table.list.endtime" defaultMessage="结束时间" />,
      dataIndex: 'endTime',
      valueType: 'dateTime',
      search: false,
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
    getPlaybillData({ current: 1, pageSize: 10, programSourceId });
  }, [programSourceId]);

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
        actionRef={actionRef}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
        request={(params) =>
          getPlaybillData({ current: params?.current, pageSize: params?.pageSize, programSourceId })
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
