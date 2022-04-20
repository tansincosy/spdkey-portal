import { FormattedMessage, useIntl } from 'umi';
import { Button, Popconfirm } from 'antd';

const PopConfirmDel: React.FC<{ onConfirmDel: () => void }> = ({ onConfirmDel }) => {
  const intl = useIntl();
  const defaultMessage = intl.formatMessage({
    id: 'pages.channel.form.del.is-del',
    defaultMessage: '是否确认删除？',
  });

  return (
    <Popconfirm title={defaultMessage} onConfirm={onConfirmDel} okText="Yes" cancelText="No">
      <Button danger type="text">
        <FormattedMessage id="pages.searchTable.delete" defaultMessage="删除" />
      </Button>
    </Popconfirm>
  );
};

export default PopConfirmDel;
