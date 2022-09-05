import { React, useState, useEffect } from 'react';
import {
  Col,
  Row,
  Card,
  Divider,
  Tooltip,
  Button,
  Form,
  Input,
  Modal,
  Select,
  Popconfirm,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  ClockCircleOutlined,
  PlusSquareOutlined,
} from '@ant-design/icons';
import { request } from '../../utils/request';
import moment from 'moment';

const { TextArea } = Input;
const { Option } = Select;

export default function Kanban() {
  const [refresh, setRefresh] = useState(false);
  const [dataList, setDataList] = useState([]);

  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(
    () => {
      request.get(`/tomato/task`)
        .then(function (response) {
          setDataList(response.data.data);
        })
    }, [refresh]
  );

  const onCreate = (values) => {
    const payload = JSON.stringify(values);
    request.post(`/tomato/task`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(function (response) {
      setVisible(false);
      setRefresh(!refresh);
    });
  };

  const onEdit = (values) => {
    const payload = JSON.stringify(values);
    request.put(`/tomato/task`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(function (response) {
      setVisible(false);
      setRefresh(!refresh);
    });
  };

  const editClick = (data) => {
    data['created_at'] = moment(data['created_at']);
    form.setFieldsValue(data);
    setVisible(true);
  };

  const onDelete = (id) => {
    const payload = JSON.stringify({ 'ids': [id] });
    request.delete(`/tomato/task`, {
      headers: {
        'Content-Type': 'application/json'
      },
      data: payload,
    }).then(function (response) {
      setRefresh(!refresh);
    });
  };

  return (
    <Row
      gutter={32}
      style={{ padding: '0px 16px 0px 16px' }}
    >
      <Col
        span={8}
      >
        <Divider orientation="left">TODO</Divider>
        {
          dataList.filter((v) => { return v.status === 'todo' })
            .map((v) => {
              return <CardCom
                headColor='LightGray'
                data={v}
                editClick={editClick}
                onDelete={onDelete}
              />
            })
        }
        <Button
          block
          type="link"
          onClick={() => setVisible(true)}
        >
          <PlusSquareOutlined />添加任务
        </Button>
      </Col>
      <Col
        span={8}
      >
        <Divider orientation="left">DOING</Divider>
        {
          dataList.filter((v) => { return v.status === 'doing' })
            .map((v) => {
              return <CardCom
                headColor='LemonChiffon'
                data={v}
                editClick={editClick}
                onDelete={onDelete}
              />
            })
        }
      </Col>
      <Col
        span={8}
      >
        <Divider orientation="left">DONE</Divider>
        {
          dataList.filter((v) => { return v.status === 'done' })
            .map((v) => {
              return <CardCom
                headColor='DarkSeaGreen'
                data={v}
                editClick={editClick}
                onDelete={onDelete}
              />
            })
        }
      </Col>
      <FormCom
        form={form}
        visible={visible}
        onCreate={onCreate}
        onEdit={onEdit}
        onCancel={() => setVisible(false)}
      />
    </Row>
  );
};

const CardCom = ({ headColor, data, editClick, onDelete }) => {
  const [enter, setEnter] = useState(false);

  const MouseEnter = () => {
    setTimeout(() => {
      setEnter(true)
    }, 100);
  };

  const MouseLeave = () => {
    setTimeout(() => {
      setEnter(false)
    }, 100);
  };

  return (
    <Card
      hoverable
      size="small"
      title={data.title}
      style={{ margin: 16 }}
      headStyle={{ background: headColor }}
      extra={enter ?
        <div>
          <Popconfirm
            title="确定要删除该任务吗？"
            onConfirm={() => onDelete(data.id)}
            okText="Yes"
            cancelText="No"
            placement="bottom"
          >
            <Tooltip title='删除'>
              <DeleteOutlined key="delete" />
            </Tooltip>
          </Popconfirm>

          &nbsp;&nbsp;&nbsp;
          <Tooltip title='编辑'>
            <EditOutlined key="edit" onClick={() => editClick(data)} />
          </Tooltip>
          {
            data.status === 'doing' ?
              <>
                &nbsp;&nbsp;&nbsp;
                <Tooltip title='番茄时钟'>
                  <ClockCircleOutlined key="clock" />
                </Tooltip>
              </>
              : ''
          }
        </div>
        : ''
      }
      onMouseEnter={MouseEnter.bind(this)}
      onMouseLeave={MouseLeave.bind(this)}
    >
      <div
        style={{ whiteSpace: 'pre-line' }}
      >
        <p>
          {data.description}
        </p>
        {
          data.note === '' ? '' : <hr color='#ECF0F1' />
        }
        <p>
          {data.note}
        </p>
      </div>
    </Card >
  );
};

const FormCom = ({ form, visible, onCreate, onEdit, onCancel }) => {
  return (
    <Modal
      visible={visible}
      title="任务"
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
      width='30%'
    >
      <Form
        labelCol={{ span: 3 }}
        form={form}
        layout="horizontal"
        name="form_in_modal"
        initialValues={{
          status: 'todo',
        }}
      >
        <Form.Item hidden name="id" label="id">
          <Input type="textarea" />
        </Form.Item>
        <Form.Item name="title" label="标题" rules={[
          {
            required: true,
            message: '请输入标题',
          }
        ]}>
          <Input type="textarea" />
        </Form.Item>
        <Form.Item name="status" label="状态">
          <Select>
            <Option key='todo' value='todo'>todo</Option>
            <Option key='doing' value='doing'>doing</Option>
            <Option key='done' value='done'>done</Option>
          </Select>
        </Form.Item>
        <Form.Item name="description" label="描述">
          <TextArea rows={6} />
        </Form.Item>
        <Form.Item name="note" label="笔记">
          <TextArea rows={6} />
        </Form.Item>
      </Form>
    </Modal >
  );
};
