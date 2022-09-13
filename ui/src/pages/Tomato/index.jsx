import { React, useState } from 'react';
import {
  Tabs,
} from 'antd';
import {
  ProjectTwoTone,
  ScheduleTwoTone,
} from '@ant-design/icons';
import Kanban from './kanban';
import Plan from './plan';

const { TabPane } = Tabs;

export default function Tomato() {
  const [param, setParam] = useState(
    {
      tab: 'plan',
      planID: 1,
      duration: 45,
      totalPredict: 0,
    }
  )

  return (
    <Tabs
      defaultActiveKey={param.tab}
      activeKey={param.tab}
      destroyInactiveTabPane
      size='large'
      onTabClick={(v) => setParam({ ...param, tab: v })}
      tabBarStyle={{
        position: 'sticky',
        top: '0',
        zIndex: '999',
        background: 'white',
      }}
    >
      <TabPane tab={<span>< ScheduleTwoTone />计划</span>} key="plan">
        <Plan
          setParam={setParam}
        />
      </TabPane>
      <TabPane tab={<span>< ProjectTwoTone />看板</span>} key="kanban">
        <Kanban
          param={param}
        />
      </TabPane>
    </Tabs>
  )
}
