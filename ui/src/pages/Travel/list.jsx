import { React, useState, useEffect } from 'react';
import { List } from 'antd';
import moment from 'moment';
import { request } from '../../utils/request';
import { DateShowFormat } from '../../utils/date';

export default function TravelList() {
  const pageSize = 6

  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    request.get('/travel', {
      param: {
        size: pageSize,
        page: page,
      }
    }).then(function (response) {
      setData(response.data.data)
    })
    // eslint-disable-next-line
  }, []);

  const list = data.map((v) => ({
    title: v.name,
    description: '',
    content: <div>
      <p>{moment(v).format(DateShowFormat)}</p>
    </div>
  }));

  return (
    <List
      itemLayout="vertical"
      size="large"
      pagination={{
        onChange: (page) => {
          setPage(page)
        },
        pageSize: pageSize,
      }}
      dataSource={list}
      renderItem={(item) => (
        <List.Item
          key={item.title}
        >
          <List.Item.Meta
            title={item.title}
            description={item.description}
          />
          {item.content}
        </List.Item>
      )}
    />
  )
}
