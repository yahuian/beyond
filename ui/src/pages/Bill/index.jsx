import { React, useState, useEffect } from 'react';
import { Table, Typography, Tabs, message, DatePicker, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import axios from 'axios'
import moment from 'moment';
import CreateButton from './create';

const { TabPane } = Tabs;
const { Text } = Typography;
const { RangePicker } = DatePicker;

const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

const columns = [
  {
    title: '类型',
    dataIndex: 'kind',
    render: (_, { kind }) => (
      kind === 'income' ? '收入' : '支出'
    ),
    filters: [
      {
        text: '收入',
        value: 'income',
      },
      {
        text: '支出',
        value: 'pay',
      }
    ]
  },
  {
    title: '金额',
    dataIndex: 'money',
    render: (_, { kind, money }) => (
      kind === 'income' ? <Text type='success' strong>+{money}</Text> :
        <Text strong>-{money}</Text>
    )
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    render: (v) => {
      return moment(v).format('YYYY-MM-DD') + " " + weeks[moment().day()]
    },
    filterDropdown: props => <DatetimeDropDown {...props} />,
  },
  {
    title: '名称',
    dataIndex: 'name',
  },
  {
    title: '分类',
    dataIndex: 'type',
  },
  {
    title: '账本',
    dataIndex: 'ledger',
  },
  {
    title: '备注',
    dataIndex: 'note',
  }
];

export default function Bill() {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [refresh, setRefresh] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const fetchData = (params) => {
    const query = {
      "page": params.pagination.current,
      "size": params.pagination.pageSize,
      "kind": params.kind,
    }
    if (params.created_at instanceof Array) {
      query.created_at = [params.created_at[0].format('YYYY-MM-DD'), params.created_at[1].format('YYYY-MM-DD')]
    }
    setLoading(true);
    axios.get(`http://192.168.1.12:2022/api/bill/details`, {
      params: { ...query }
    }).then(
      response => {
        setData(response.data.data);
        setLoading(false);
        setPagination({
          ...params.pagination,
          total: response.data.count,
        });
      },
      error => {
        message.error(error.message);
      }
    );
  };

  const deleteData = () => {
    setLoading(true);
    const payload = JSON.stringify({ ids: selectedRowKeys })
    axios.delete('http://192.168.1.12:2022/api/bill/details', {
      headers: {
        'Content-Type': 'application/json'
      },
      data: payload
    }).then(
      response => {
        message.success(response.data.msg);
        setLoading(false);
        setSelectedRowKeys([]);
      },
      error => {
        message.error(error.message);
      }
    );
  };

  const hasSelected = selectedRowKeys.length > 0;
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  useEffect(
    () => { fetchData({ pagination }) }, [refresh, loading]
  );

  const onChange = (newPagination, filters, sorter) => {
    fetchData({
      sortField: sorter.field,
      sortOrder: sorter.order,
      pagination: newPagination,
      ...filters,
    });
  };

  return (
    <Tabs defaultActiveKey="1">
      <TabPane tab={<span>明细</span>} key="details">
        <Button
          style={{ marginBottom: 16, }}
          type="primary"
          onClick={deleteData}
          disabled={!hasSelected}
        >
          <DeleteOutlined />删除
        </Button>
        <CreateButton refresh={refresh} setRefresh={setRefresh} />
        <Table
          columns={columns}
          rowKey={(record) => record.id}
          dataSource={data}
          pagination={pagination}
          loading={loading}
          onChange={onChange}
          rowSelection={rowSelection}
        />
      </TabPane>
    </Tabs>
  )
}

const DatetimeDropDown = ({
  setSelectedKeys,
  selectedKeys,
  confirm,
  setFilters,
  clearFilters
}) => {
  return (
    <div style={{ padding: 8 }}>
      <RangePicker
        value={selectedKeys}
        onChange={(dates) => {
          setSelectedKeys(dates)
          if (!dates || dates.length !== 2) {
            clearFilters?.()
            confirm()
          } else {
            confirm()
          }
          if (setFilters) {
            setFilters()
          }
        }}
      />
    </div>
  )
}
