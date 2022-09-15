import { React, useState, useEffect } from 'react'
import {
  Calendar,
  Card,
  DatePicker,
  Popconfirm,
  Tooltip,
  Space,
  Input,
  Modal,
  Form,
  Button,
  InputNumber,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { DateQueryFormat } from '../../utils/date';
import { request } from '../../utils/request';

export default function Month() {
  const [refresh, setRefresh] = useState(false);
  const [data, setData] = useState([]);

  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    request.get(`/habit`, {
      params: {
        "created_at": [
          moment(new Date()).startOf('month').format(DateQueryFormat),
          moment(new Date()).endOf('month').format(DateQueryFormat)
        ]
      },
    }).then(function (response) {
      setData(response.data.data);
    })
    // eslint-disable-next-line
  }, [refresh]);

  // 从所有 data 中筛选出 date 当天的数据
  const filterData = (date) => {
    return data.filter((v) => moment(v.created_at).isSame(date, "day"))
  }

  // 当前选中的日期
  const [selected, setSelected] = useState();

  const dateFullCellRender = (date) => {
    return (
      // 非当前月的天不显示
      !date.isSame(new Date(), "month") ? '' :
        <Card
          hoverable
          size="small"
          title={date.format('DD')}
          style={{
            height: 120,
            backgroundColor: date.isSame(new Date(), "day") ? '#f0f2f5' : '',
          }}
          extra={
            // 选中时才弹出对于的操作按钮
            !selected?.isSame(date) ? '' :
              <div>
                {
                  filterData(date).length === 0 ?
                    <Tooltip title='打卡'>
                      &nbsp;&nbsp;&nbsp;
                      <CheckCircleOutlined key="create" onClick={() => {
                        form.resetFields();
                        setVisible(true);
                      }} />
                    </Tooltip>
                    :
                    <div>
                      <Popconfirm
                        title="确定要删除今天的打卡记录吗？"
                        onConfirm={() => {
                          onDelete(filterData(selected).map((v) => v.id))
                        }}
                        okText="Yes"
                        cancelText="No"
                        placement="bottom"
                      >
                        &nbsp;&nbsp;&nbsp;
                        <Tooltip title='删除'>
                          <DeleteOutlined key="delete" />
                        </Tooltip>
                      </Popconfirm>
                      <Tooltip title='编辑'>
                        &nbsp;&nbsp;&nbsp;
                        <EditOutlined key="edit" onClick={() => {
                          form.setFieldsValue({
                            'habit': filterData(selected),
                            'created_at': selected,
                          });
                          setVisible(true);
                        }} />
                      </Tooltip>
                    </div>
                }
              </div>
          }
        >
          {
            filterData(date).map((v) => `${v.name}${v.number}${v.unit} `)
          }
        </Card>
    )
  }

  const onCreate = (values) => {
    request.post(`/habit`, JSON.stringify(values), {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(function (response) {
      setVisible(false);
      setRefresh(!refresh);
    });
  }

  const onDelete = (ids) => {
    const payload = JSON.stringify({ 'ids': ids });
    request.delete(`/habit`, {
      headers: {
        'Content-Type': 'application/json'
      },
      data: payload,
    }).then(function (response) {
      setRefresh(!refresh);
    });
  };

  const onEdit = (values) => {
    request.put(`/habit`, JSON.stringify(values), {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(function (response) {
      setVisible(false);
      setRefresh(!refresh);
    });
  };

  return <div>
    <Calendar
      onSelect={(date) => setSelected(date)}
      dateFullCellRender={dateFullCellRender}
      headerRender={({ value, type, onChange, onTypeChange }) => {
        return <DatePicker
          style={{ width: 95 }}
          allowClear={false}
          format='YYYY-MM'
          picker="month"
          defaultValue={value}
          onChange={(v) => {
            console.log(v.format('YYYY-MM'))
          }}
        />;
      }}
    />
    <FormCom
      form={form}
      visible={visible}
      onCreate={onCreate}
      onEdit={onEdit}
      onCancel={() => setVisible(false)}
      selected={selected}
    />
  </div>
}

const FormCom = ({ form, visible, onCreate, onEdit, onCancel, selected }) => {
  return (
    <Modal
      visible={visible}
      title="打卡"
      okText="确定"
      cancelText="取消"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            values.habit.map((v) => {
              v.created_at = selected
              return v
            })
            values['created_at'] === undefined ? onCreate(values) : onEdit(values)
          })
          .catch((info) => {
            console.log('Validate Failed:', info);
          });
      }}
      width='19%'
    >
      <Form
        form={form}
      >
        <Form.List name="habit">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{
                    display: 'flex',
                  }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={[name, 'name']}
                    rules={[
                      {
                        required: true,
                        message: '名称是必填项',
                      },
                      {
                        type: 'string',
                        max: 10,
                        message: '最多可输入10个字符'
                      }
                    ]}
                  >
                    <Input placeholder="如：跑步" style={{ width: 100 }} />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'number']}
                    rules={[
                      {
                        required: true,
                        message: '数量是必填项',
                      },
                    ]}
                  >
                    <InputNumber placeholder="如：5" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'unit']}
                    rules={[
                      {
                        required: true,
                        message: '单位是必填项',
                      },
                      {
                        type: 'string',
                        max: 10,
                        message: '最多可输入10个字符'
                      }
                    ]}
                  >
                    <Input placeholder="如：km" style={{ width: 90 }} />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  增加习惯
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
        <Form.Item
          name='created_at'
        >
          <Input hidden />
        </Form.Item>
      </Form>
    </Modal >
  );
};