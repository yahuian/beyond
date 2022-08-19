import React from 'react'
import { Tabs, Typography, Image } from 'antd';
import {
  PhoneTwoTone,
} from '@ant-design/icons';
import redbook from '../../assets/redbook.png'

const { TabPane } = Tabs;
const { Title, Paragraph, Link } = Typography;

export default function System() {
  return (
    <Tabs
      defaultActiveKey="contact"
      destroyInactiveTabPane
      size='large'
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
          <Title level={4}>资讯</Title>
          <Paragraph>
            关注作者，获取更多产品使用小技巧~<br />
            <Image width={300} src={redbook} style={{ padding: '8px 0px 8px 0px' }} />
          </Paragraph>
        </Typography>
      </TabPane>
    </Tabs>
  )
}
