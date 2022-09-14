import { React, useState } from 'react'
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
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import moment from 'moment';

export default function Month() {
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();

  const data = [
    {
      id: 1,
      created_at: '2022-09-12',
      name: '💪',
      unit: '个',
      number: '20',
    },
    {
      id: 2,
      created_at: '2022-09-12',
      name: '🛹',
      unit: 'h',
      number: '2',
    },
    {
      id: 3,
      created_at: '2022-09-13',
      name: '🏃‍♂️',
      unit: 'km',
      number: '10',
    },
    {
      id: 4,
      created_at: '2022-09-10',
      name: '🏃‍♂️',
      unit: 'km',
      number: '20',
    }
  ]

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
                          console.log(filterData(selected).map((v) => v.id))
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
    console.log(values)
  }

  return <div>
    <Calendar
      onSelect={(date) => {
        setSelected(date)
      }}
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
      onCancel={() => setVisible(false)}
    />
  </div>
}

const FormCom = ({ form, visible, onCreate, onEdit, onCancel }) => {
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
            values['id'] === undefined ? onCreate(values) : onEdit(values)
          })
          .catch((info) => {
            console.log('Validate Failed:', info);
          });
      }}
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
                    ]}
                  >
                    <Input placeholder="例如：跑步" />
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
                    <Input placeholder="例如：5" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'unit']}
                    rules={[
                      {
                        required: true,
                        message: '单位是必填项',
                      },
                    ]}
                  >
                    <Input placeholder="例如：km" />
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
      </Form>
    </Modal >
  );
};