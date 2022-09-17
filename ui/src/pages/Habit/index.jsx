import { React } from 'react';
import {
  Tabs,
} from 'antd';
import {
  ScheduleTwoTone,
  FundTwoTone,
} from '@ant-design/icons';
import Month from './month';
import Chart from './chart';

const { TabPane } = Tabs;

export default function Habit() {
  return (
    <Tabs
      defaultActiveKey='month'
      destroyInactiveTabPane
      size='large'
      tabBarStyle={{
        position: 'sticky',
        top: '0',
        zIndex: '999',
        background: 'white',
      }}
    >
      <TabPane tab={<span>< ScheduleTwoTone />日历</span>} key="month">
        <Month />
      </TabPane>
      <TabPane tab={<span><FundTwoTone />统计</span>} key="chart">
        <Chart />
      </TabPane>
    </Tabs>
  )
}
