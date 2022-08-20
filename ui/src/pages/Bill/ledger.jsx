import { React, useState, useEffect } from 'react';
import {
  Table, Button, Form, Input, Modal, Typography, Popover, Radio, Tag,
  InputNumber
} from 'antd';
import { DeleteOutlined, PlusSquareOutlined, QuestionCircleTwoTone } from '@ant-design/icons';
import moment from 'moment';
import { DatetimeDropDown } from '../../components';
import { DateShowFormat, FormatDateQuery } from '../../utils/date';
import { request } from '../../utils/request';

export default function Ledger() {
  const columns = [
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
    },
    {
      title: '默认账本',
      dataIndex: 'is_default',
      render: (v) => {
        return v === true ? <Tag color="green">是</Tag> : '否'
      },
    },
    {
      title: '每月预算',
      dataIndex: 'budget',
    },
    {
      title: '操作',
      dataIndex: 'edit',
      render: (_, record) => {
        return (
          <Typography.Link onClick={() => {
            record['created_at'] = moment(record['created_at'])
            setVisible(true);
            form.setFieldsValue(record);
          }}>
            编辑
          </Typography.Link>
        )
      },
    }
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
    request.get(`/bill/ledger`, {
      params: {
        "page": params.pagination.current,
        "size": params.pagination.pageSize,
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
    request.delete('/bill/ledger', {
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
    request.post(`/bill/ledger`, payload, {
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
    request.put(`/bill/ledger`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(function (response) {
      setRefresh(!refresh)
    })
    setVisible(false);
  };

  useEffect(
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <FormCom
          form={form}
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

const FormCom = ({ form, visible, onCreate, onEdit, onCancel }) => {
  return (
    <Modal
      visible={visible}
      title="账本"
      okText="确定"
      cancelText="取消"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            form.resetFields();
            values['id'] === undefined ? onCreate(values) : onEdit(values)
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
          created_at: moment(),
          is_default: false,
        }}
      >
        <Form.Item hidden name="id" label="id">
          <Input type="textarea" />
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
        <Form.Item label="默认账本">
          <Popover
            content={
              <div>
                <p>默认账本在记账和统计时会自动填充</p>
                <p>若有多个，记账时选第一个，统计时全部选择</p>
              </div>
            }
          >
            <QuestionCircleTwoTone style={{ paddingRight: 10 }} />
          </Popover>
          <Form.Item
            name="is_default"
            noStyle
          >
            <Radio.Group>
              <Radio value={false}>否</Radio>
              <Radio value={true}>是</Radio>
            </Radio.Group>
          </Form.Item>
        </Form.Item>
        <Form.Item name="budget" label="每月预算">
          <InputNumber />
        </Form.Item>
      </Form>
    </Modal >
  );
};
