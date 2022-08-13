import { React, useState, useEffect } from 'react';
import { Col, Row, Select, DatePicker } from 'antd';
import { Pie, WordCloud, Line } from '@ant-design/plots';
import moment from 'moment';
import { DateQueryFormat, FormatDateQuery } from '../../utils/date';
import { request } from '../../utils/request';

const { Option } = Select;
const { RangePicker } = DatePicker;

// 折线图统计部分
export function ChartLine() {
  const defaultKind = 'pay'

  const [kind, setKind] = useState(defaultKind);

  return (
    <div style={{ paddingBottom: 16 }}>
      <div style={{ paddingBottom: 16 }}>
        <Row>
          <Col>
            <Select
              defaultValue={defaultKind}
              style={{ width: 70 }}
              onChange={(value) => {
                setKind(value)
              }}
            >
              <Option value="pay">支出</Option>
              <Option value="income">收入</Option>
            </Select>
          </Col>
        </Row>
      </div>
      <Row>
        <Col span={6}>
          <div style={{ height: 300 }}><LineChart kind={kind} date='day' /></div>
        </Col>
        <Col span={6}>
          <div style={{ height: 300 }}><LineChart kind={kind} date='week' /></div>
        </Col>
        <Col span={6}>
          <div style={{ height: 300 }}><LineChart kind={kind} date='month' /></div>
        </Col>
        <Col span={6}>
          <div style={{ height: 300 }}><LineChart kind={kind} date='year' /></div>
        </Col>
      </Row>
    </div>
  )
}

const LineChart = (param) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    getData();
    // eslint-disable-next-line
  }, [param]);

  const getData = () => {
    request.get(`/bill/details/chart/line`, {
      params: param,
    }).then(function (response) {
      setData(response.data.data);
    });
  };

  const config = {
    data,
    xField: 'key',
    yField: 'value',
    xAxis: {
      tickCount: 12,
    },
    annotations: [
      {
        type: 'text',
        content: param.date,
      }
    ]
  };

  return <Line {...config} />;
};

// 饼图统计部分
export function ChartPie() {
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
    <div style={{ paddingTop: 16 }} >
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
    // eslint-disable-next-line
  }, [param]);

  const getData = () => {
    request.get(`/bill/details/chart/pie`, {
      params: {
        field: "type",
        ...param
      }
    }).then(function (response) {
      setData(response.data.data);
    });
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
    // eslint-disable-next-line
  }, [param]);

  const getData = () => {
    request.get(`/bill/details/chart/pie`, {
      params: {
        field: "name",
        ...param
      }
    }).then(function (response) {
      setData(response.data.data);
    });
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