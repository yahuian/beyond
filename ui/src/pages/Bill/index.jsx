import { React } from 'react';
import { Tabs } from 'antd';
import Details from './details';
import { Chart } from './chart';
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
        <Chart />
      </TabPane>
      <TabPane tab={<span>模板管理</span>} key="template" >
        <Template />
      </TabPane>
    </Tabs>
  )
}
