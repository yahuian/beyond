import { React, useState, useEffect } from 'react';
import {
  Table, Typography, Tabs, message, DatePicker, Button,
  Form, Input, Modal, Radio, InputNumber,
} from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios'
import moment from 'moment';
import { NameChart } from './chart';

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
        text: '支出',
        value: 'pay',
      },
      {
        text: '收入',
        value: 'income',
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
  const [visible, setVisible] = useState(false);
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
        setRefresh(!refresh)
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

  const onCreate = (values) => {
    const payload = JSON.stringify(values)
    axios.post(`http://192.168.1.12:2022/api/bill/details`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(
      response => {
        message.success(response.data.msg);
        setRefresh(!refresh)
      },
      error => {
        message.error(error.message);
      }
    )
    setVisible(false);
  };

  useEffect(
    () => { fetchData({ pagination }) }, [refresh]
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
    <Tabs
      defaultActiveKey="details"
    >
      <TabPane
        tab={<span>收支明细</span>}
        key="details"
      >
        <div style={{ marginBottom: 16 }}>
          <Button
            danger
            ghost
            type="primary"
            style={{ marginRight: 8 }}
            onClick={deleteData}
            disabled={!hasSelected}
          >
            <DeleteOutlined />删除
          </Button>
          <Button
            type="dashed"
            onClick={() => setVisible(true)}
            disabled={hasSelected}
          >
            <PlusOutlined />记账
          </Button>
          <CreateForm
            visible={visible}
            onCreate={onCreate}
            onCancel={() => setVisible(false)}
          />
        </div>
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
      <TabPane
        tab={<span>统计分析</span>}
        key="chart"
      >
        <NameChart/>
      </TabPane>
      <TabPane
        tab={<span>模板管理</span>}
        key="template"
      >
        <div>
          Hello,World!
        </div>
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

const CreateForm = ({ visible, onCreate, onCancel }) => {
  const [form] = Form.useForm();
  return (
    <Modal
      visible={visible}
      title="记账"
      okText="Create"
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            form.resetFields();
            onCreate(values);
          })
          .catch((info) => {
            console.log('Validate Failed:', info);
          });
      }}
    >
      <Form
        form={form}
        layout="horizontal"
        name="form_in_modal"
        initialValues={{
          kind: 'pay',
        }}
      >
        <Form.Item name="kind" label="类型">
          <Radio.Group>
            <Radio value="pay">支出</Radio>
            <Radio value="income">收入</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="money" label="金额" rules={[
          {
            required: true,
            message: '请输入金额',
          }
        ]}>
          <InputNumber />
        </Form.Item>
        <Form.Item name="name" label="名称"
        >
          <Input type="textarea" />
        </Form.Item>
        <Form.Item name="type" label="分类">
          <Input type="textarea" />
        </Form.Item>
        <Form.Item name="ledger" label="账本">
          <Input type="textarea" />
        </Form.Item>
        <Form.Item name="note" label="备注">
          <Input type="textarea" />
        </Form.Item>
      </Form>
    </Modal >
  );
};
