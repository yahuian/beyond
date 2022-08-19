import { React } from 'react';
import { Tabs } from 'antd';
import {
  AccountBookTwoTone, FundTwoTone,
  TagTwoTone, FileTextTwoTone
} from '@ant-design/icons';
import Details from './details';
import { Chart } from './chart';
import Type from './type';
import Ledger from './ledger';

const { TabPane } = Tabs;

export default function Bill() {
  return (
    <Tabs
      defaultActiveKey="details"
      destroyInactiveTabPane
      size='large'
    >
      <TabPane tab={<span><AccountBookTwoTone />明细</span>} key="details">
        <Details />
      </TabPane>
      <TabPane tab={<span><FundTwoTone />统计</span>} key="chart">
        <Chart />
      </TabPane>
      <TabPane tab={<span><TagTwoTone />分类</span>} key="type" >
        <Type />
      </TabPane>
      <TabPane tab={<span><FileTextTwoTone />账本</span>} key="ledger" >
        <Ledger />
      </TabPane>
    </Tabs>
  )
}
