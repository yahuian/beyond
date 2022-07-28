import React, { useState } from 'react';
import { Button, Form, Input, Modal, Radio, InputNumber, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios'

export default function CreateButton({ refresh, setRefresh }) {
  const [visible, setVisible] = useState(false);

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

  return (
    <div>
      <Button
        type="primary"
        onClick={() => setVisible(true)}
      >
        <PlusOutlined />记账
      </Button>
      <CreateForm
        visible={visible}
        onCreate={onCreate}
        onCancel={() => setVisible(false)}
      />
    </div>
  );
};

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
