import { React, useState, useEffect } from 'react';
import { message, Col, Row, Select } from 'antd';
import { Pie, WordCloud } from '@ant-design/plots';
import axios from 'axios'
import { DatetimeDropDown } from '../../components';

const { Option } = Select;

export default function Chart() {
  const defaultKind = 'pay'

  const [param, setParam] = useState({
    kind: defaultKind
  });

  const onSelect = (value) => {
    setParam({ kind: value })
  };

  return (
    <div>
      <Row>
        <Col>
          <div style={{ padding: 8 }}>
            <Select
              defaultValue={defaultKind}
              style={{ width: 70 }}
              onChange={onSelect}
            >
              <Option value="pay">支出</Option>
              <Option value="income">收入</Option>
            </Select>
          </div>
        </Col>
        <Col>
          <DatetimeDropDown />
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
        "field": "type",
        ...param,
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
        "field": "name",
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
