import { React, useState, useEffect } from 'react';
import { Col, Row, Select, DatePicker } from 'antd';
import { Pie, Line } from '@ant-design/plots';
import moment from 'moment';
import { DateQueryFormat, FormatDateQuery } from '../../utils/date';
import { request } from '../../utils/request';

const { Option } = Select;
const { RangePicker } = DatePicker;

export function Chart() {
  const defaultKind = 'pay'

  // 接口查询参数
  const [kind, setKind] = useState(defaultKind);
  const [type, setType] = useState();
  const [ledger, setLedger] = useState();

  // 饼图设置时间区间
  const defaultDate = [
    moment().startOf('month'),
    moment().endOf('month')
  ]
  const [createdAt, setCreatedAt] = useState([
    defaultDate[0].format(DateQueryFormat),
    defaultDate[1].format(DateQueryFormat),
  ]);

  // 下拉框数据
  const [typeData, setTypeData] = useState([]);
  const [ledgerData, setLedgerData] = useState([]);

  const query = { kind, type, ledger }

  useEffect(
    () => {
      request.get(`/bill/type`, {
        params: {
          "size": 100,
        }
      }).then(function (response) {
        setTypeData(response.data.data);
      });
      request.get(`/bill/ledger`, {
        params: {
          "size": 100,
        }
      }).then(function (response) {
        setLedgerData(response.data.data);
        setLedger(response.data.data.filter((v) => v.is_default === true).map((v) => v.name))
      })
    }, []
  );

  return (
    <div>
      <Row style={{ paddingBottom: 16 }}>
        <Select
          defaultValue={defaultKind}
          style={{ width: 70 }}
          onChange={(value) => setKind(value)}
        >
          <Option value="pay">支出</Option>
          <Option value="income">收入</Option>
        </Select>
        <Select
          showArrow
          showSearch
          allowClear
          mode="multiple"
          style={{ width: 300, paddingLeft: 8 }}
          placeholder="分类"
          onChange={(value) => setType(value)}
        >
          {
            typeData.map((v) => {
              return <Option key={v.name} value={v.name}>{v.name}</Option>
            })
          }
        </Select>
        <Select
          showArrow
          showSearch
          allowClear
          mode="multiple"
          defaultValue={ledger}
          key={ledger}
          style={{ width: 300, paddingLeft: 8 }}
          placeholder="账本"
          onChange={(value) => setLedger(value)}
        >
          {
            ledgerData.map((v) => {
              return <Option key={v.name} value={v.name}>{v.name}</Option>
            })
          }
        </Select>
      </Row>
      <Row>
        <Col span={6}>
          <div style={{ height: 300 }}><LineChart date='day' query={query} /></div>
        </Col>
        <Col span={6}>
          <div style={{ height: 300 }}><LineChart date='week' query={query} /></div>
        </Col>
        <Col span={6}>
          <div style={{ height: 300 }}><LineChart date='month' query={query} /></div>
        </Col>
        <Col span={6}>
          <div style={{ height: 300 }}><LineChart date='year' query={query} /></div>
        </Col>
      </Row>
      <Row style={{ paddingTop: 16 }}>
        <Col>
          <div style={{ paddingLeft: 8 }}>
            <RangePicker
              style={{ width: 230 }}
              defaultValue={defaultDate}
              onChange={(values) => {
                setCreatedAt(FormatDateQuery(values))
              }}
            />
          </div>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <div style={{ height: 300 }}><PieChart field='type' createdAt={createdAt} query={query} /></div>
        </Col>
        <Col span={12}>
          <div style={{ height: 300 }}><PieChart field='ledger' createdAt={createdAt} query={query} /></div>
        </Col>
      </Row>
    </div>
  )
}

const LineChart = (param) => {
  const [data, setData] = useState([]);
  const [budget, setBudget] = useState(0);

  useEffect(() => {
    getData();
    // eslint-disable-next-line
  }, [param]);

  const getData = () => {
    request.get(`/bill/details/chart/line`, {
      params: {
        "date": param.date,
        ...param.query,
      },
    }).then(function (response) {
      setData(response.data.data.bases);
      setBudget(response.data.data.budget);
    });
  };

  let annotations = [
    {
      type: 'text',
      content: param.date,
    },
  ]

  if (param.date === "month" && budget !== 0) {
    annotations.push(
      // 高于预算颜色变化
      {
        type: 'regionFilter',
        start: ['min', budget],
        end: ['max', 'max'],
        color: '#F4664A',
      },
      {
        type: 'text',
        position: ['min', budget],
        content: '每月预算',
        offsetY: -4,
        style: {
          textBaseline: 'bottom',
        },
      },
      {
        type: 'line',
        start: ['min', budget],
        end: ['max', budget],
        style: {
          stroke: '#F4664A',
          lineDash: [2, 2],
        },
      },
    )
  }

  const config = {
    data,
    xField: 'key',
    yField: 'value',
    label: {},
    annotations: annotations
  };

  return <Line {...config} />;
};

const PieChart = (param) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    getData();
    // eslint-disable-next-line
  }, [param]);

  const getData = () => {
    request.get(`/bill/details/chart/pie`, {
      params: {
        "field": param.field,
        "created_at": param.createdAt,
        ...param.query,
      },
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

// BUG 页面缩放后词云图会变白
// TODO 饼图支持下钻（名称二级饼图）
// TODO 日期选择框选第二个图标会立刻刷新
