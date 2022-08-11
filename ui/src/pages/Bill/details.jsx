import { React, useState, useEffect } from 'react';
import {
  Table, Typography, Button, Select,
  Form, Input, Modal, Radio, InputNumber,
} from 'antd';
import { DeleteOutlined, PlusSquareOutlined } from '@ant-design/icons';
import moment from 'moment';
import { DatetimeDropDown } from '../../components';
import { DateShowFormat, FormatDateQuery } from '../../utils/date';
import { request } from '../../utils/request';

const { Text } = Typography;
const { Option } = Select;

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
      return moment(v).format(DateShowFormat) + " " + weeks[moment().day()]
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

export default function Details() {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [refresh, setRefresh] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const fetchData = (params) => {
    setLoading(true);
    request.get(`/bill/details`, {
      params: {
        "page": params.pagination.current,
        "size": params.pagination.pageSize,
        "kind": params.kind,
        "created_at": FormatDateQuery(params.created_at)
      }
    }).then(function (response) {
      setData(response.data.data);
      setLoading(false);
      setPagination({
        ...params.pagination,
        total: response.data.count,
      });
    }).catch(function (error) {
      setLoading(false);
    })
  };

  // TODO 增加二次确认机制
  const deleteData = () => {
    setLoading(true);
    const payload = JSON.stringify({ ids: selectedRowKeys })
    request.delete('/bill/details', {
      headers: {
        'Content-Type': 'application/json'
      },
      data: payload
    }).then(function (response) {
      setLoading(false);
      setRefresh(!refresh)
      setSelectedRowKeys([]);
    }
    ).catch(function (error) {
      setLoading(false);
    })
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
    request.post(`/bill/details`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(function (response) {
      setRefresh(!refresh)
    })
    setVisible(false);
  };

  useEffect(
    // eslint-disable-next-line
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
    <div>
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
          <PlusSquareOutlined />记账
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
    </div>
  )
}

const CreateForm = ({ visible, onCreate, onCancel }) => {
  const [typeData, setTypeData] = useState([]);
  const [ledgerData, setLedgerData] = useState([]);
  const [form] = Form.useForm();

  useEffect(
    // TODO 超过 100 时支持远程搜索
    () => {
      request.get(`/bill/template`, {
        params: {
          "size": 100,
          "kind": ["type"],
        }
      }).then(function (response) {
        setTypeData(response.data.data);
      });
      request.get(`/bill/template`, {
        params: {
          "size": 100,
          "kind": ["ledger"],
        }
      }).then(function (response) {
        setLedgerData(response.data.data);
      })
    }, []
  );

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
          <Select showSearch allowClear >
            {
              typeData.map((v) => {
                return <Option value={v.name}>{v.name}</Option>
              })
            }
          </Select>
        </Form.Item>
        <Form.Item name="ledger" label="账本">
          <Select showSearch allowClear>
            {
              ledgerData.map((v) => {
                return <Option value={v.name}>{v.name}</Option>
              })
            }
          </Select>
        </Form.Item>
        <Form.Item name="note" label="备注">
          <Input type="textarea" />
        </Form.Item>
      </Form>
    </Modal >
  );
};
