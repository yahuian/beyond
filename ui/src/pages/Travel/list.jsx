import { React, useState, useEffect } from 'react';
import {
  List,
  Typography,
  Form,
  DatePicker,
  Input,
  Modal,
} from 'antd';
import moment from 'moment';
import { request } from '../../utils/request';
import { DateShowFormat } from '../../utils/date';

export default function TravelList() {
  const [refresh, setRefresh] = useState(false);

  const [data, setData] = useState([]);

  const pageSize = 6;
  const [page, setPage] = useState(1);

  useEffect(() => {
    request.get('/travel', {
      param: {
        size: pageSize,
        page: page,
      }
    }).then(function (response) {
      setData(response.data.data)
    })
    // eslint-disable-next-line
  }, [refresh]);

  // 表单
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);

  const onEdit = () => {
    const payload = JSON.stringify(form.getFieldsValue());
    request.put(`/travel`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(function (response) {
      setRefresh(!refresh);
      setVisible(false);
    });
  }

  return (
    <div>
      <List
        itemLayout="vertical"
        size="large"
        pagination={{
          onChange: (page) => {
            setPage(page)
          },
          pageSize: pageSize,
        }}
        dataSource={data}
        renderItem={(item) => (
          <List.Item
            key={item.name}
            actions={[
              <Typography.Link onClick={() => {
                form.resetFields();
                item['created_at'] = moment(item['created_at']);
                form.setFieldsValue(item);
                setVisible(true)
              }}>
                编辑
              </Typography.Link>
            ]}
          >
            <List.Item.Meta
              title={item.name}
            />
            <div>
              {item.note}
            </div>
            <div>
              {moment(item.created_at).format(DateShowFormat)}
            </div>
          </List.Item>
        )}
      />
      <FormCom
        form={form}
        visible={visible}
        onCancel={() => { setVisible(false) }}
        onEdit={onEdit}
      />
    </div>
  )
}

const FormCom = ({ form, visible, onEdit, onCancel }) => {
  return (
    <Modal
      visible={visible}
      title="标记"
      okText="确定"
      cancelText="取消"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            onEdit(values)
          })
          .catch((info) => {
            console.log('Validate Failed:', info);
          });
      }}
      width='500px'
    >
      <Form
        form={form}
        layout="horizontal"
        name="form_in_modal"
        initialValues={{
          kind: 'type',
          created_at: moment(),
        }}
      >
        <Form.Item hidden name="id" label="id">
          <Input type="textarea" />
        </Form.Item>
        <Form.Item name="name" label="名称">
          <Input readOnly type="textarea" />
        </Form.Item>
        <Form.Item name="note" label="备注">
          <Input type="textarea" />
        </Form.Item>
        <Form.Item name="created_at" label="时间">
          <DatePicker placeholder='选择时间' style={{ width: '120px' }} />
        </Form.Item>
      </Form>
    </Modal >
  );
};
