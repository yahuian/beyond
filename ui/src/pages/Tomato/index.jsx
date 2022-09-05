import { React } from 'react';
import {
  Tabs,
} from 'antd';
import {
  ProjectTwoTone,
} from '@ant-design/icons';
import Kanban from './kanban';

const { TabPane } = Tabs;

export default function Tomato() {
  return (
    <Tabs
      defaultActiveKey="kanban"
      destroyInactiveTabPane
      size='large'
    >
      <TabPane tab={<span>< ProjectTwoTone />看板</span>} key="kanban">
        <Kanban />
      </TabPane>
    </Tabs>
  )
}
