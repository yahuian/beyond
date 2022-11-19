import { React, useState, useEffect } from 'react';
import {
  Card,
  List,
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  InputNumber,
  Tooltip,
  Typography,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  PlusSquareOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { DateShowFormat } from '../../utils/date';
import { request } from '../../utils/request';

const { TextArea } = Input;
const { Link } = Typography;

export default function Plan({ setParam }) {
  const [refresh, setRefresh] = useState(false);
  const [dataList, setDataList] = useState([]);

  const [size, setSize] = useState(16);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    request.get('/tomato/plan', {
      params: {
        size: size,
        page: page,
      }
    }).then(function (response) {
      setDataList(response.data.data);
      setTotal(response.data.count);
    })
    // eslint-disable-next-line
  }, [page, size, total, refresh]);

  const onCreate = (values) => {
    const payload = JSON.stringify(values);
    request.post(`/tomato/plan`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(function (response) {
      setVisible(false);
      setRefresh(!refresh);
    });
  };

  const onDelete = (id) => {
    const payload = JSON.stringify({ 'ids': [id] });
    request.delete(`/tomato/plan`, {
      headers: {
        'Content-Type': 'application/json'
      },
      data: payload,
    }).then(function (response) {
      setRefresh(!refresh);
    });
  };

  // 按下卡片上的编辑按钮
  const editClick = (data) => {
    form.setFieldsValue(data);
    setVisible(true);
  };

  const onEdit = (values) => {
    const payload = JSON.stringify(values);
    request.put(`/tomato/plan`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(function (response) {
      setVisible(false);
      setRefresh(!refresh);
    });
  };

  return (
    <div>
      <Button
        type="dashed"
        onClick={() => {
          form.resetFields();
          setVisible(true);
        }}
      >
        <PlusSquareOutlined />添加
      </Button>
      <FormCom
        form={form}
        visible={visible}
        onCreate={onCreate}
        onCancel={() => setVisible(false)}
        onEdit={onEdit}
      />
      <List
        grid={{
          gutter: 8,
          column: 3,
        }}
        pagination={{
          onChange: (page, size) => {
            console.log(page, size)
            setPage(page)
            setSize(size)
          },
          pageSize: size,
          total: total,
        }}
        dataSource={dataList}
        renderItem={(data) => (
          <List.Item>
            <CardCom
              data={data}
              editClick={editClick}
              onDelete={onDelete}
              setParam={setParam}
            />
          </List.Item>
        )}
      />
    </div>
  );
};

const CardCom = ({ data, editClick, onDelete, setParam }) => {
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

  const formatTime = (time) => {
    var h = Math.floor(time / 60);
    var m = time - h * 60

    if (h === 0) {
      return `${m}m`
    } else if (m === 0) {
      return `${h}h`
    } else {
      return `${h}h:${m}m`
    }
  }

  const statistics = [
    {
      title: "预估番茄",
      value: data.predict,
      valueStyle: { color: '#3f8600' },
      suffix: '个',
    },
    {
      title: "投入番茄",
      value: data.cost,
      valueStyle: { color: '#3f8600' },
      suffix: '个',
    },
    {
      title: "投入时间",
      value: formatTime(data.cost_time),
      valueStyle: { color: '#3f8600' },
    },
  ];

  return (
    <Card
      hoverable
      size="small"
      title={
        <Link
          // 点击后跳转到看板页面
          onClick={() => setParam(
            {
              tab: 'kanban',
              planID: data.id,
              duration: data.tomato_duration,
              totalPredict: data.predict,
            }
          )}
        >
          {data.title}
        </Link>
      }
      style={{ marginTop: 16 }}
      headStyle={{ background: 'WhiteSmoke' }}
      extra={enter ?
        <div>
          <Popconfirm
            title="确定要删除该计划吗？"
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
        </div>
        : ''
      }
      onMouseEnter={MouseEnter.bind(this)}
      onMouseLeave={MouseLeave.bind(this)}
    >
      <div
        style={{ whiteSpace: 'pre-line', padding: 8 }}
      >
        <p>
          {data.description}
        </p>
        <p>
          {moment(data.created_at).format(DateShowFormat)}
        </p>
      </div>
      <Row gutter={16}>
        {
          statistics.map((v) => {
            return <Col>
              <Statistic
                title={v.title}
                value={v.value}
                valueStyle={v.valueStyle}
                suffix={v.suffix}
              />
            </Col>
          })
        }
      </Row>
    </Card >
  );
};

const FormCom = ({ form, visible, onCreate, onEdit, onCancel }) => {
  return (
    <Modal
      visible={visible}
      title="计划"
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
      width='40%'
    >
      <Form
        style={{ padding: "0px 8px 0px 8px" }}
        form={form}
        layout="vertical"
        name="form_in_modal"
        initialValues={{
          tomato_duration: 45,
        }}
      >
        <Form.Item hidden name="id" label="id">
          <Input type="textarea" />
        </Form.Item>
        <Form.Item name="title" label="标题" rules={[
          {
            required: true,
            message: '不可为空',
          },
          {
            type: 'string',
            max: 100,
            message: '最多可输入100个字符'
          }
        ]}>
          <Input type="textarea" />
        </Form.Item>
        <Form.Item name="description" label="描述" rules={[
          {
            type: 'string',
            max: 5000,
            message: '最多可输入5000个字符'
          }
        ]}>
          <TextArea rows={8} placeholder="该计划的详细描述~" />
        </Form.Item>
        <Form.Item name="tomato_duration" label="每个番茄的时长（单位为分钟）">
          <InputNumber min={1} max={60} />
        </Form.Item>
        <Form.Item name="predict" label="预估可投入的番茄数" rules={[
          {
            required: true,
            message: '不可为空',
          }
        ]}>
          <InputNumber min={1} />
        </Form.Item>
      </Form>
    </Modal >
  );
};