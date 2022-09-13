import { React } from 'react';
import {
  Tabs,
} from 'antd';
import {
  FlagTwoTone,
  EnvironmentTwoTone,
} from '@ant-design/icons';
import Map from './map';
import TravelList from './list';

const { TabPane } = Tabs;

export default function Travel() {
  return (
    <Tabs
      defaultActiveKey="details"
      destroyInactiveTabPane
      size='large'
      tabBarStyle={{
        position: 'sticky',
        top: '0',
        zIndex: '999',
        background: 'white',
      }}
    >
      <TabPane tab={<span>< EnvironmentTwoTone />地图</span>} key="details">
        <Map />
      </TabPane>

      <TabPane tab={<span><FlagTwoTone />足迹</span>} key="list">
        <TravelList />
      </TabPane>
    </Tabs>
  )
}
