import { React, useState, useEffect } from 'react';
import {
  Table, Button, Form, Input, Modal, Radio,
} from 'antd';
import { DeleteOutlined, PlusSquareOutlined } from '@ant-design/icons';
import moment from 'moment';
import { DatetimeDropDown } from '../../components';
import { DateShowFormat, FormatDateQuery } from '../../utils/date';
import { request } from '../../utils/request';

const columns = [
  {
    title: '类型',
    dataIndex: 'kind',
    render: (_, { kind }) => (
      kind === 'type' ? '分类' : '账本'
    ),
    filters: [
      {
        text: '分类',
        value: 'type',
      },
      {
        text: '账本',
        value: 'ledger',
      }
    ]
  },
  {
    title: '名称',
    dataIndex: 'name',
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    render: (v) => {
      return moment(v).format(DateShowFormat)
    },
    filterDropdown: props => <DatetimeDropDown {...props} />,
  },
  {
    title: '备注',
    dataIndex: 'note',
  }
];

export default function Template() {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [refresh, setRefresh] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const fetchData = (params) => {
    setLoading(true);
    request.get(`/bill/template`, {
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
    request.delete('/bill/template', {
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
    request.post(`/bill/template`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(function (response) {
      setRefresh(!refresh)
    })
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
          <PlusSquareOutlined />添加
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
  const [form] = Form.useForm();
  return (
    <Modal
      visible={visible}
      title="添加"
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
          kind: 'type',
        }}
      >
        <Form.Item name="kind" label="类型">
          <Radio.Group>
            <Radio value="type">分类</Radio>
            <Radio value="ledger">账本</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="name" label="名称" rules={[
          {
            required: true,
            message: '请输入名称',
          }
        ]}>
          <Input type="textarea" />
        </Form.Item>
        <Form.Item name="note" label="备注">
          <Input type="textarea" />
        </Form.Item>
      </Form>
    </Modal >
  );
};
