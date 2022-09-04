import { React, useState } from 'react';
import {
  Col,
  Row,
  Card,
  Divider,
  Tooltip,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

export default function Kanban() {
  const dataList = [
    {
      id: 1,
      status: 'todo',
      title: 'UI主体框架',
      description: "1.完成后端\n2.完成前端\n3.测试\n4.上线\n5.宣传",
    },
    {
      id: 2,
      status: 'todo',
      title: '任务模块',
      description: "1.完成后端\n2.完成前端\n3.测试",
    },
    {
      id: 3,
      status: 'todo',
      title: '番茄时钟',
      description: "1.完成后端\n2.完成前端\n3.测试",
    },
    {
      id: 4,
      status: 'todo',
      title: '计划与分析',
      description: "1.完成后端\n2.完成前端\n3.测试",
    },
    {
      id: 5,
      status: 'doing',
      title: '折线图',
      description: "1.完成后端\n2.完成前端\n3.测试",
    },
    {
      id: 6,
      status: 'done',
      title: '统计图',
      description: "1.完成后端\n2.完成前端\n3.测试",
    }
  ]

  return (
    <Row
      gutter={32}
      style={{ padding: '0px 16px 0px 16px' }}
    >
      <Col
        span={8}
      >
        <Divider orientation="left">TODO</Divider>
        {
          dataList.filter((v) => { return v.status === 'todo' })
            .map((v) => {
              return <CardCom
                headColor='LightGray'
                data={v}
              />
            })
        }
      </Col>
      <Col
        span={8}
      >
        <Divider orientation="left">DOING</Divider>
        {
          dataList.filter((v) => { return v.status === 'doing' })
            .map((v) => {
              return <CardCom
                headColor='LemonChiffon'
                data={v}
              />
            })
        }
      </Col>
      <Col
        span={8}
      >
        <Divider orientation="left">DONE</Divider>
        {
          dataList.filter((v) => { return v.status === 'done' })
            .map((v) => {
              return <CardCom
                headColor='DarkSeaGreen'
                data={v}
              />
            })
        }
      </Col>
    </Row>
  )
}

const CardCom = ({ headColor, data }) => {
  const [enter, setEnter] = useState(false)

  const MouseEnter = () => {
    setTimeout(() => {
      setEnter(true)
    }, 100)
  }

  const MouseLeave = () => {
    setTimeout(() => {
      setEnter(false)
    }, 100)
  }

  return (
    <Card
      hoverable
      size="small"
      title={data.title}
      style={{ margin: 16 }}
      headStyle={{ background: headColor }}
      extra={enter ?
        <div>
          <Tooltip title='删除'>
            <DeleteOutlined key="delete" />
          </Tooltip>
          &nbsp;&nbsp;&nbsp;
          <Tooltip title='编辑'>
            <EditOutlined key="edit" />
          </Tooltip>
          {
            data.status === 'doing' ?
              <>
                &nbsp;&nbsp;&nbsp;
                <Tooltip title='番茄时钟'>
                  <ClockCircleOutlined key="clock" />
                </Tooltip>
              </>
              : ''
          }
        </div>
        : ''
      }
      onMouseEnter={MouseEnter.bind(this)}
      onMouseLeave={MouseLeave.bind(this)}
    >
      <div
        style={{ whiteSpace: 'pre-line' }}
      >
        {data.description}
      </div>
    </Card >
  )
}
