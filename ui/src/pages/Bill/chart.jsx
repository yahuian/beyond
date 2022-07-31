import { React, useState, useEffect } from 'react';
import { message, Col, Row, Select, DatePicker } from 'antd';
import { Pie, WordCloud } from '@ant-design/plots';
import axios from 'axios'
import moment from 'moment';
import { DateQueryFormat, FormatDateQuery } from '../../utils/date';

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function Chart() {
  const defaultKind = 'pay'
  const defaultDate = [
    moment().startOf('month'),
    moment().endOf('month')
  ]

  const [param, setParam] = useState({
    kind: defaultKind,
    created_at: [
      defaultDate[0].format(DateQueryFormat),
      defaultDate[1].format(DateQueryFormat),
    ]
  });

  return (
    <div>
      <Row>
        <Col>
          <Select
            defaultValue={defaultKind}
            style={{ width: 70 }}
            onChange={(value) => {
              setParam(pre => {
                return { ...pre, kind: value }
              })
            }}
          >
            <Option value="pay">支出</Option>
            <Option value="income">收入</Option>
          </Select>
        </Col>
        <Col>
          <div style={{ paddingLeft: 8 }}>
            <RangePicker
              style={{ width: 230 }}
              defaultValue={defaultDate}
              onChange={(values) => {
                setParam(pre => {
                  return { ...pre, created_at: FormatDateQuery(values) }
                })
              }}
            />
          </div>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <div style={{ height: 300 }}><PieChart param={param} /></div>
        </Col>
        <Col span={12}>
          <div style={{ height: 300 }}><NameChart param={param} /></div>
        </Col>
      </Row>
    </div>
  )
}

const PieChart = ({ param }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    getData();
  }, [param]);

  const getData = () => {
    axios.get(`http://192.168.1.12:2022/api/bill/details/chart/pie`, {
      params: {
        field: "type",
        ...param
      }
    }).then(
      response => {
        setData(response.data.data);
      },
      error => {
        message.error(error.message);
      }
    );
  };

  const config = {
    data,
    angleField: 'value',
    colorField: 'key',
    radius: 0.9,
    label: {
      type: 'inner',
      offset: '-30%',
      content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
      style: {
        fontSize: 14,
        textAlign: 'center',
      },
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  return <Pie {...config} />;
};

const NameChart = ({ param }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    getData();
  }, [param]);

  const getData = () => {
    axios.get(`http://192.168.1.12:2022/api/bill/details/chart/pie`, {
      params: {
        field: "name",
        ...param
      }
    }).then(
      response => {
        setData(response.data.data);
      },
      error => {
        message.error(error.message);
      }
    );
  };

  const config = {
    data,
    wordField: 'key',
    weightField: 'value',
    colorField: 'key',
    wordStyle: {
      fontFamily: 'Verdana',
      fontSize: [10, 32],
      rotation: 0,
    },
    // 返回值设置成一个 [0, 1) 区间内的值，
    // 可以让每次渲染的位置相同（前提是每次的宽高一致）。
    random: () => 0.5,
  };

  return <WordCloud {...config} />;
};

// BUG 页面缩放后词云图会变白
// TODO 饼图支持下钻（名称二级饼图）
// TODO 日期选择框选第二个图标会立刻刷新