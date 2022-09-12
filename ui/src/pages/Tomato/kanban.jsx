import { React, useState, useEffect, useRef } from 'react';
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
  Progress,
  InputNumber,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  ClockCircleOutlined,
  PlusSquareOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { DateShowFormat } from '../../utils/date';
import { request } from '../../utils/request';

const { TextArea } = Input;
const { Option } = Select;

export default function Kanban({ param }) {
  const [refresh, setRefresh] = useState(false);
  const [dataList, setDataList] = useState([]);

  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();

  const [clock, setClock] = useState(false);

  const unit = param.duration * 60;

  useEffect(() => {
    request.get(`/tomato/task`, {
      params: {
        "plan_id": [param.planID]
      },
    }).then(function (response) {
      setDataList(response.data.data);
    })
    // eslint-disable-next-line
  }, [refresh]);

  const onCreate = (values) => {
    values.plan_id = param.planID
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
    values.plan_id = param.planID
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

  var dataSaver = useRef();
  // 开启番茄钟
  const clockClick = (data) => {
    dataSaver.current = data;
    setClock(true);
  };
  // 一个番茄钟完成
  const incClock = () => {
    var data = dataSaver.current;
    data.cost += 1;
    onEdit(data);
  }

  const cols = [
    {
      title: "TODO",
      status: "todo",
      headColor: "LightGray",
    },
    {
      title: "DOING",
      status: "doing",
      headColor: "LemonChiffon",
    },
    {
      title: "DONE",
      status: "done",
      headColor: "DarkSeaGreen",
    },
  ];

  const availableTomato = () => {
    if (dataList.length === 0) {
      return param.totalPredict
    }
    // 编辑时应该加上本任务的“预估需要的番茄数量”
    let count = 0
    const predict = form.getFieldValue('predict')
    if (predict !== undefined) {
      count = predict
    }
    return param.totalPredict - dataList.map((v) => v.predict).reduce((pre, cur) => pre + cur) + count
  }

  return (
    <Row
      gutter={32}
      style={{ padding: '0px 16px 0px 16px' }}
    >
      {
        cols.map((c) => {
          return (
            <Col
              span={8}
            >
              <Divider orientation="left">{c.title}</Divider>
              {
                dataList.filter((v) => { return v.status === c.status })
                  .map((v) => {
                    return <CardCom
                      headColor={c.headColor}
                      data={v}
                      editClick={editClick}
                      onDelete={onDelete}
                      clockClick={clockClick}
                    />
                  })
              }
              {
                c.status === 'todo' ?
                  <Button
                    block
                    type="link"
                    onClick={() => {
                      form.resetFields();
                      setVisible(true);
                    }}
                  >
                    <PlusSquareOutlined />添加任务
                  </Button> :
                  ''
              }
            </Col>
          )
        })
      }
      <FormCom
        form={form}
        visible={visible}
        onCreate={onCreate}
        onEdit={onEdit}
        onCancel={() => {
          setVisible(false);
          form.resetFields();
        }}
        availableTomato={availableTomato()}
      />
      <ClockCom
        clock={clock}
        setClock={setClock}
        unit={unit}
        incClock={incClock}
      />
    </Row >
  );
};

const CardCom = ({ headColor, data, editClick, onDelete, clockClick }) => {
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
                  <ClockCircleOutlined key="clock" onClick={() => clockClick(data)} />
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
        style={{ whiteSpace: 'pre-line', padding: 8 }}
      >
        <p>
          {data.description}
        </p>
        <p>
          <Tooltip
            title={`实际投入的番茄数：${data.cost}`}
          >
            {
              // 未超出预估
              data.cost <= data.predict ?
                <Progress
                  showInfo={false}
                  percent={Math.floor(data.cost / data.predict * 100)}
                  steps={data.predict}
                  strokeColor={'green'}
                /> :
                // 超出预估，超出部分标记为红色
                <Progress
                  showInfo={false}
                  percent={100}
                  steps={data.cost}
                  strokeColor={
                    new Array(data.cost).fill('green').fill('red', -(data.cost - data.predict))
                  }
                />
            }
          </Tooltip>
        </p>
        <p>
          {moment(data.created_at).format(DateShowFormat)}
        </p>
      </div>
    </Card >
  );
};

const FormCom = ({ form, visible, onCreate, onEdit, onCancel, availableTomato }) => {
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
          status: 'todo',
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
          <TextArea rows={8} placeholder="该任务的具体细节，调研越充分，预估时间越准确~" />
        </Form.Item>
        <Form.Item name="status" label="状态">
          <Select>
            <Option key='todo' value='todo'>todo</Option>
            <Option key='doing' value='doing'>doing</Option>
            <Option key='done' value='done'>done</Option>
          </Select>
        </Form.Item>
        <Form.Item name="predict" label="预估需要的番茄数" rules={[
          {
            required: true,
            message: '不可为空',
          }
        ]}>
          <InputNumber
            min={1} max={availableTomato}
            style={{ width: '225px' }}
            placeholder={`本计划剩余可用的番茄数：${availableTomato}`}
          />
        </Form.Item>
        <Form.Item hidden name="cost" label="实际投入的番茄数">
          <InputNumber />
        </Form.Item>
      </Form>
    </Modal >
  );
};

const ClockCom = ({ clock, setClock, unit, incClock }) => {
  const total = unit;
  const [second, setSecond] = useState(total);
  const timerId = useRef();

  if (clock && !timerId.current) {
    const id = setInterval(() => {
      // console.log('timer')
      setSecond(pre => pre - 1)
    }, 1000);
    timerId.current = id;
  };

  if (second <= 0) {
    clearInterval(timerId.current);
  };

  const clear = () => {
    setClock(false);
    timerId.current = null;
    setSecond(total);
  }

  return (
    <Modal
      centered
      mask
      maskClosable={false}
      title="番茄时钟"
      visible={clock}
      closeIcon={
        <Popconfirm
          title="放弃很容易，但坚持一定很酷！"
          onCancel={() => {
            clearInterval(timerId.current);
            clear()
          }}
          okText="坚持"
          cancelText="放弃"
          placement='bottom'
        >
          <CloseOutlined />
        </Popconfirm>
      }
      footer={
        second <= 0 ?
          <Button
            onClick={() => {
              incClock()
              clear()
            }}
          >确认</Button>
          : ''
      }
    >
      <Progress
        strokeColor={{
          '0%': 'LemonChiffon',
          '100%': 'DarkSeaGreen',
        }}
        type="circle"
        percent={(1 - second / total) * 100}
        width={460}
        format={(percent) => {
          // console.log(percent)
          var m = Math.floor(second / 60);
          if (m.toString().split("").length < 2) {
            m = `0${m}`
          }
          var s = second - m * 60
          if (s.toString().split("").length < 2) {
            s = `0${s}`
          }
          return `${m}:${s}`
        }}
      />
    </Modal>
  );
};
