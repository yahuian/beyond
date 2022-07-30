import { React, useState, useEffect } from 'react';
import { message } from 'antd';
import { Pie, WordCloud } from '@ant-design/plots';
import axios from 'axios'

export function NameChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    axios.get(`http://192.168.1.12:2022/api/bill/details/chart/pie`, {
      params: {
        "field": "name"
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

export function PieChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    setLoading(true)
    axios.get(`http://192.168.1.12:2022/api/bill/details/chart/pie`, {
      params: {
        "field": "type"
      }
    }).then(
      response => {
        setData(response.data.data);
        setLoading(false)
      },
      error => {
        message.error(error.message);
      }
    );
  };

  const config = {
    data,
    appendPadding: 10,
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
