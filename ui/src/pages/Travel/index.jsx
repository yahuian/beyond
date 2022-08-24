import { React, useState, useEffect } from 'react';
import {
  Tabs
} from 'antd';
import {
  FlagTwoTone,
  EnvironmentTwoTone,
} from '@ant-design/icons';
import { ChoroplethMap } from '@ant-design/maps';
import { request } from '../../utils/request';

const { TabPane } = Tabs;

export default function Travel() {
  return (
    <div>
      <Tabs
        defaultActiveKey="details"
        destroyInactiveTabPane
        size='large'
      >
        <TabPane tab={<span>< EnvironmentTwoTone />地图</span>} key="details">
          <Map></Map>
        </TabPane>
        <TabPane tab={<span><FlagTwoTone />足迹</span>}>
        </TabPane>
      </Tabs>
    </div>
  )
}

const Map = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    request.get('/travel/all').then(function (response) {
      setData(response.data.data)
    })
  }, []);

  const config = {
    map: {
      type: 'mapbox',
      style: 'blank',
      center: [120.19382669582967, 30.258134]
    },
    source: {
      joinBy: {
        sourceField: 'adcode',
        geoField: 'adcode',
      },
    },
    viewLevel: {
      level: 'country',
      adcode: 100000,
      granularity: 'city',
    },
    autoFit: true,
    color: {
      field: 'name',
      value: ({ name }) => {
        return data.map((v) => { return v.name }).includes(name) ? 'CornflowerBlue' : ''
      },
    },
    style: {
      opacity: 1,
      stroke: '#ccc',
      lineWidth: 0.6,
      lineOpacity: 1,
    },
    label: {
      visible: true,
      field: 'name',
      style: {
        fill: '#000',
        opacity: 0.8,
        fontSize: 10,
        stroke: '#fff',
        strokeWidth: 1.5,
        textAllowOverlap: false,
        padding: [5, 5],
      },
    },
    state: {
      active: {
        stroke: 'green',
        lineWidth: 1.0,
      },
    },
    tooltip: {
      items: ['name'],
    },
    zoom: {
      position: 'bottomright',
    },
    chinaBorder: {
      // 国界
      national: {
        color: '#ccc',
        width: 0.7,
        opacity: 0.8,
      },
      // 争议
      dispute: {
        color: '#ccc',
        width: 0.7,
        opacity: 0.8,
        dashArray: [2, 2],
      },
      // 海洋
      coast: {
        color: '#ccc',
        width: 0.7,
        opacity: 0.8,
      },
      // 港澳
      hkm: {
        color: 'gray',
        width: 0.7,
        opacity: 0.8,
      },
    }
  };

  return (
    <div
      // TODO height 占满整个屏幕
      style={{ width: '100%', height: '825px' }}
    >
      <ChoroplethMap {...config} />
    </div>
  )
}
