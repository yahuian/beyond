import { React, useState } from 'react';
import { NavLink, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  MoneyCollectTwoTone,
  SettingTwoTone,
  CameraTwoTone,
  CarryOutTwoTone,
  LikeTwoTone,
} from '@ant-design/icons';
import './App.css';
import Bill from './pages/Bill';
import System from './pages/System';
import logo from './assets/logo.png'
import word from './assets/logo_word.png'
import Travel from './pages/Travel';
import Tomato from './pages/Tomato';
import Habit from './pages/Habit';

const { Content, Sider } = Layout;

const routers = [
  {
    key: '/tomato',
    icon: <CarryOutTwoTone />,
    label: (
      <NavLink to="/tomato">番茄任务</NavLink>
    ),
    component: <Tomato />
  },
  {
    key: '/habit',
    icon: <LikeTwoTone />,
    label: (
      <NavLink to="/habit">习惯打卡</NavLink>
    ),
    component: <Habit />
  },
  // {
  //   key: '/news',
  //   // icon: <StarTwoTone />,
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
    key: '/travel',
    icon: <CameraTwoTone />,
    label: (
      <NavLink to="/travel">旅行足迹</NavLink>
    ),
    component: <Travel />
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
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);
  const [left, setLeft] = useState(76);

  return (
    <Layout style={{ minHeight: '100vh', }}>
      <Sider
        collapsedWidth={left}
        width={left}
        collapsible
        collapsed={collapsed}
        trigger={null}
        style={{
          background: 'white',
          borderBottomRightRadius: '25px',
          borderTopRightRadius: '25px',
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{ padding: '16px 8px 8px 8px' }}
          onClick={() => {
            setCollapsed(!collapsed);
            collapsed === true ? setLeft(128) : setLeft(76)
          }}
        >
          {
            collapsed ? <img src={logo} alt='logo.png' height='60px'></img> :
              <div style={{ padding: 8 }}><img src={word} alt='logo.png' height='60px'></img></div>
          }
        </div>
        <Menu
          theme="light"
          defaultSelectedKeys={[routers[0].key]}
          mode="inline"
          items={routers}
          selectedKeys={[location.pathname]}
        ></Menu>
      </Sider>
      <Layout className="site-layout">
        <Content
          style={{
            marginLeft: 16 + left,
          }}
        >
          <div
            className="site-layout-background"
            style={{ padding: '0px 24px 24px 24px', minHeight: 360 }}
          >
            <Routes>
              {
                routers.map((p) => {
                  return <Route key={p.key} path={p.key} element={p.component}></Route>
                })
              }
              <Route path='*' element={<Navigate to={routers[0].key} />} />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

// TODO 适配移动端
// TODO 侧边栏支持开关，排序