import { React, useState, useEffect } from 'react';
import {
  Row,
  DatePicker,
  Col,
} from 'antd';
import {
  Line,
} from '@ant-design/plots';
import moment from 'moment';
import { request } from '../../utils/request';

export default function Chart() {
  const [data, setData] = useState([]);
  const [year, setYear] = useState(moment(new Date()));

  useEffect(() => {
    request.get(`/habit/chart`, {
      params: {
        "year": year.format('YYYY'),
      }
    }).then(function (response) {
      setData(response.data.data)
    })
  }, [year]);

  const charts = Object.values(
    data.reduce((group, cur) => {
      const name = cur.name;
      group[name] = group[name] ?? [];
      group[name].push(cur);
      return group;
    }, {})
  )

  return (
    <div>
      <Row>
        <DatePicker
          style={{ width: 75 }}
          allowClear={false}
          format='YYYY'
          picker="year"
          value={year}
          onChange={(v) => setYear(v)}
        />
      </Row>
      <Row gutter={32}>
        {
          charts.map((v, i) => {
            return <Col span={8}>
              <Line
                style={{ paddingTop: 32, height: 300 }}
                key={i}
                data={v}
                xField='date'
                yField='sum'
                annotations={[
                  {
                    type: 'text',
                    content: v[0].name,
                  }
                ]}
                label={{}}
                yAxis={{
                  title: {
                    text: v[0].unit,
                  }
                }}
              />
            </Col>
          })
        }
      </Row>
    </div>
  )
}
