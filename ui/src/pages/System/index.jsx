import React from 'react'
import { Tabs, Typography, Image } from 'antd';
import {
  PhoneTwoTone,
} from '@ant-design/icons';

const { TabPane } = Tabs;
const { Title, Paragraph, Link } = Typography;

export default function System() {
  return (
    <Tabs
      defaultActiveKey="contact"
      destroyInactiveTabPane
      size='large'
      tabBarStyle={{
        position: 'sticky',
        top: '0',
        zIndex: '999',
        background: 'white',
      }}
    >
      <TabPane tab={<span><PhoneTwoTone />联系我们</span>} key="contact">
        <Typography>
          <Title level={4}>产品</Title>
          <Paragraph>
            产品使用问题，想法建议等，欢迎在<Link href="https://github.com/YahuiAn/beyond/discussions">此处</Link>讨论 (=^▽^=) ~
          </Paragraph>
          <Title level={4}>BUG</Title>
          <Paragraph>
            发现 BUG 了 (⊙o⊙) ？劳烦在<Link href="https://github.com/YahuiAn/beyond/issues">此处</Link>反馈~
          </Paragraph>
        </Typography>
      </TabPane>
    </Tabs>
  )
}
