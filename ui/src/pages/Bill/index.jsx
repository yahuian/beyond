import { React } from 'react';
import { Tabs } from 'antd';
import Details from './details';
import { ChartPie, ChartLine } from './chart';
import Template from './template';

const { TabPane } = Tabs;

export default function Bill() {
  return (
    <Tabs
      defaultActiveKey="details"
      destroyInactiveTabPane
    >
      <TabPane tab={<span>收支明细</span>} key="details">
        <Details />
      </TabPane>
      <TabPane tab={<span>统计分析</span>} key="chart">
        <ChartLine />
        <div style={{ padding: '8px 0px 8px 0px', backgroundColor: '#f0f2f5' }} />
        <ChartPie />
      </TabPane>
      <TabPane tab={<span>模板管理</span>} key="template" >
        <Template />
      </TabPane>
    </Tabs>
  )
}
