import { React, useState } from 'react';
import { BrowserRouter, NavLink, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { MoneyCollectTwoTone, SettingTwoTone } from '@ant-design/icons';
import './App.css';
import Bill from './pages/Bill';
import System from './pages/System';

const { Content, Sider } = Layout;

const routers = [
  // {
  //   key: '/news',
  //   icon: <StarTwoTone />,
  //   label: (
  //     <NavLink to="/news">订阅信息</NavLink>
  //   ),
  //   component: <News />
  // },
  {
    key: '/bill',
    icon: <MoneyCollectTwoTone />,
    label: (
      <NavLink to="/bill">每日记账</NavLink>
    ),
    component: <Bill />
  },
  {
    key: '/system',
    icon: <SettingTwoTone />,
    label: (
      <NavLink to="/system">系统设置</NavLink>
    ),
    component: <System />
  },
]

export default function App() {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <BrowserRouter>
      <Layout style={{ minHeight: '100vh', }}>
        <Sider
          collapsedWidth='60' width='140'
          collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}
          style={{ background: 'white' }}
        >
          <div className="logo" />
          <Menu theme="light" defaultSelectedKeys={[routers[0].key]} mode="inline" items={routers}></Menu>
        </Sider>
        <Layout className="site-layout">
          <Content style={{ margin: '16px 16px', }}>
            <div className="site-layout-background" style={{ padding: 24, minHeight: 360, }}>
              <Routes>
                {routers.map((p) => { return (<Route key={p.key} path={p.key} element={p.component}></Route>) })}
                <Route path='*' element={<Navigate to={routers[0].key} />} />
              </Routes>
            </div>
          </Content>
        </Layout>
      </Layout>
    </BrowserRouter>
  );
};

// TODO 适配移动端
// TODO 侧边栏固定不动
// TODO 侧边栏支持开关，排序
// BUG 直接在地址栏输入路由，左侧导航栏未高亮显示