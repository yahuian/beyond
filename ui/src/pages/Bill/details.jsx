import { React, useState, useEffect } from 'react';
import {
  Table, Typography, Button, Select,
  Form, Input, Modal, Radio, InputNumber, DatePicker
} from 'antd';
import { DeleteOutlined, PlusSquareOutlined } from '@ant-design/icons';
import moment from 'moment';
import { DatetimeDropDown } from '../../components';
import { DateShowFormat, FormatDateQuery } from '../../utils/date';
import { request } from '../../utils/request';

const { Text } = Typography;
const { Option } = Select;

const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export default function Details() {
  // 筛选分类和账本
  const [typeData, setTypeData] = useState([]);
  const [ledgerData, setLedgerData] = useState([]);

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
        return moment(v).format(DateShowFormat) + " " + weeks[moment(v).day()]
      },
      filterDropdown: props => <DatetimeDropDown {...props} />,
    },
    {
      title: '分类',
      dataIndex: 'type',
      filters: typeData.map((v) => {
        return { text: v.name, value: v.name, }
      })
    },
    {
      title: '账本',
      dataIndex: 'ledger',
      filters: ledgerData.map((v) => {
        return { text: v.name, value: v.name, }
      })
    },
    {
      title: '备注',
      dataIndex: 'note',
    },
    {
      title: '操作',
      dataIndex: 'edit',
      render: (_, record) => {
        return (
          <Typography.Link onClick={() => {
            // fix: Uncaught TypeError: date.clone is not a function
            record['created_at'] = moment(record['created_at']);
            form.setFieldsValue(record);
            setVisible(true);
          }}>
            编辑
          </Typography.Link>
        )
      },
    },
  ];

  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [refresh, setRefresh] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // 创建和编辑表单
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchData = (params) => {
    setLoading(true);
    request.get(`/bill/details`, {
      params: {
        "page": params.pagination.current,
        "size": params.pagination.pageSize,
        "kind": params.kind,
        "type": params.type,
        "ledger": params.ledger,
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

    request.get(`/bill/type`, {
      params: {
        "size": 100,
      }
    }).then(function (response) {
      setTypeData(response.data.data);
    });
    request.get(`/bill/ledger`, {
      params: {
        "size": 100,
      }
    }).then(function (response) {
      setLedgerData(response.data.data);
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

  const onEdit = (values) => {
    const payload = JSON.stringify(values)
    request.put(`/bill/details`, payload, {
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
          onClick={() => {
            form.resetFields();
            setVisible(true);
          }}
          disabled={hasSelected}
        >
          <PlusSquareOutlined />记账
        </Button>
        <FormCom
          form={form}
          typeData={typeData}
          ledgerData={ledgerData}
          visible={visible}
          onCreate={onCreate}
          onEdit={onEdit}
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

function getDefaultLedger(params) {
  const list = params.filter((v) => v.is_default === true)
  if (list.length === 0) {
    return ''
  }
  return list[0].name
}

const FormCom = ({ form, typeData, ledgerData, visible, onCreate, onEdit, onCancel }) => {
  return (
    <Modal
      maskClosable={false}
      visible={visible}
      title="记账"
      okText="确定"
      cancelText="取消"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            values['id'] === undefined ? onCreate(values) : onEdit(values)
          })
          .catch((info) => {
            console.log('Validate Failed:', info);
          });
      }}
      width='500px'
    >
      <Form
        labelCol={{ span: 3 }}
        form={form}
        layout="horizontal"
        name="form_in_modal"
        initialValues={{
          kind: 'pay',
          created_at: moment(),
          ledger: getDefaultLedger(ledgerData),
        }}
      >
        <Form.Item hidden name="id" label="id">
          <Input type="textarea" />
        </Form.Item>
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
          <InputNumber style={{ width: '120px' }} />
        </Form.Item>
        <Form.Item name="created_at" label="时间">
          <DatePicker placeholder='选择时间' style={{ width: '120px' }} />
        </Form.Item>
        <Form.Item name="type" label="分类">
          <Select showSearch allowClear >
            {
              typeData.map((v) => {
                return <Option key={v.name} value={v.name}>{v.name}</Option>
              })
            }
          </Select>
        </Form.Item>
        <Form.Item name="ledger" label="账本">
          <Select showSearch allowClear>
            {
              ledgerData.map((v) => {
                return <Option key={v.name} value={v.name}>{v.name}</Option>
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
