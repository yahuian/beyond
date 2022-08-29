import { React, useState, useEffect } from 'react';
import {
  List,
  Typography,
  Form,
  DatePicker,
  Input,
  Modal,
  Image,
  Upload,
} from 'antd';
import {
  InboxOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { request } from '../../utils/request';
import { DateShowFormat } from '../../utils/date';
import configData from '../../config.json'

const { TextArea } = Input;

export default function TravelList() {
  const [refresh, setRefresh] = useState(false);

  const [data, setData] = useState([]);

  const pageSize = 3;
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

  const onDelete = (values) => {
    const payload = JSON.stringify(values);
    request.delete(`/travel`, {
      headers: {
        'Content-Type': 'application/json'
      },
      data: payload
    }).then(function (response) {
      setRefresh(!refresh);
    });
  }

  // 图片预览
  const [fileList, setFileList] = useState([]);

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
              <Typography.Link type='danger' onClick={() => { onDelete({ 'ids': [item.id] }) }}>
                删除
              </Typography.Link>,
              <Typography.Link onClick={() => {
                form.resetFields();
                item['created_at'] = moment(item['created_at']);
                form.setFieldsValue(item);
                setFileList(
                  item.files.map((v) => {
                    return {
                      uid: v.id,
                      url: `${configData.server}file/read?id=${v.id}`,
                      status: 'done',
                    }
                  })
                )
                setVisible(true);
              }}>
                编辑
              </Typography.Link>,
            ]}
          >
            <List.Item.Meta
              title={item.name}
            />
            <div style={{ whiteSpace: 'pre-line', paddingBottom: '8px' }}>
              {item.note}
            </div>
            {
              item.files.map((v) => {
                return <Image
                  width={150} height={150}
                  src={`${configData.server}file/read?id=${v.id}`}
                  style={{ padding: 3 }} />
              })
            }
            <div>
              {moment(item.created_at).format(DateShowFormat)}
            </div>
          </List.Item>
        )}
      />
      <FormCom
        form={form}
        visible={visible}
        fileList={fileList}
        setFileList={setFileList}
        onCancel={() => { setVisible(false) }}
        onEdit={onEdit}
      />
    </div>
  )
}

const FormCom = ({ form, visible, fileList, setFileList, onEdit, onCancel }) => {
  form.setFieldsValue({
    files: fileList.map((v) => {
      // 已有的图片
      if (typeof v.uid === 'number') {
        return v.uid
      }
      // 新上传成功的照片
      if (v.status === 'done' && v.response !== undefined) {
        return v.response.data[0].id
      }
      return 0
    })
  })

  const onChange = (info) => {
    setFileList(info.fileList)
  };

  const onRemove = (info) => {
    const payload = JSON.stringify({ 'ids': [info.uid] });
    request.delete(`/file/delete`, {
      headers: {
        'Content-Type': 'application/json'
      },
      data: payload
    })
  }

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
      width='50%'
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
          <TextArea rows={8} placeholder='为这次旅行写点啥纪念一下吧~' />
        </Form.Item>
        <Form.Item name="files" label="图片">
          <Upload
            name='file[]'
            multiple={true}
            action={`${configData.server}file/upload`}
            onChange={onChange}
            onRemove={onRemove}
            listType="picture-card"
            fileList={fileList}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">上传</p>
          </Upload>
        </Form.Item>
        <Form.Item name="created_at" label="时间">
          <DatePicker placeholder='选择时间' style={{ width: '120px' }} />
        </Form.Item>
      </Form>
    </Modal >
  );
};

// TODO 支持视频
// TODO 图片支持调整顺序