import { React, useState, useEffect } from 'react';
import {
  Form,
  Modal,
  Input,
  DatePicker,
} from 'antd';
import { ChoroplethMap } from '@ant-design/maps';
import moment from 'moment';
import { request } from '../../utils/request';

export default function Map() {
  // 表单
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);

  const [refresh, setRefresh] = useState(false);

  // 去过的城市
  const [cities, setCities] = useState([]);
  useEffect(() => {
    request.get('/travel/all').then(function (response) {
      setCities(response.data.data)
    })
  }, [refresh]);

  const onCreate = (values) => {
    const payload = JSON.stringify(values)
    request.post(`/travel`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(function (response) {
      setVisible(false);
      setRefresh(!refresh);
    })
  }

  return (
    <div>
      <MapCom
        cities={cities}
        onclick={(name, level) => {
          form.resetFields();
          form.setFieldsValue({
            name: name,
            level: level,
          });
          setVisible(true);
        }}
      />

      <FormCom
        form={form}
        visible={visible}
        onCancel={() => { setVisible(false) }}
        onCreate={onCreate}
      />
    </div>
  )
}

const MapCom = ({ cities, onclick }) => {
  const config = {
    map: {
      type: 'mapbox',
      style: 'blank',
      center: [120.19382669582967, 30.258134]
    },
    source: {
      joinBy: {
        sourceField: 'adcode',
        geoField: 'adcode',
      },
    },
    viewLevel: {
      level: 'country',
      adcode: 100000,
      granularity: 'city',
    },
    autoFit: true,
    color: {
      field: 'name',
      value: ({ name }) => {
        return cities.map((v) => { return v.name }).includes(name) ? 'CornflowerBlue' : ''
      },
    },
    style: {
      opacity: 1,
      stroke: '#ccc',
      lineWidth: 0.6,
      lineOpacity: 1,
    },
    label: {
      visible: true,
      field: 'name',
      style: {
        fill: '#000',
        opacity: 0.8,
        fontSize: 10,
        stroke: '#fff',
        strokeWidth: 1.5,
        textAllowOverlap: false,
        padding: [5, 5],
      },
    },
    state: {
      active: {
        stroke: 'green',
        lineWidth: 1.0,
      },
    },
    tooltip: {
      items: ['name'],
    },
    zoom: {
      position: 'bottomright',
    },
    chinaBorder: {
      // 国界
      national: {
        color: '#ccc',
        width: 0.7,
        opacity: 0.8,
      },
      // 争议
      dispute: {
        color: '#ccc',
        width: 0.7,
        opacity: 0.8,
        dashArray: [2, 2],
      },
      // 海洋
      coast: {
        color: '#ccc',
        width: 0.7,
        opacity: 0.8,
      },
      // 港澳
      hkm: {
        color: 'gray',
        width: 0.7,
        opacity: 0.8,
      },
    },
    onReady: (c) => {
      c.on('fillAreaLayer:click', (event) => {
        const name = event.feature.properties.name;
        const level = event.feature.properties.level;
        onclick(name, level);
      });
    }
  };

  return (
    <div
      // TODO height 占满整个屏幕
      style={{ width: '100%', height: '825px' }}
    >
      <ChoroplethMap {...config} />
    </div>
  )
}

const FormCom = ({ form, visible, onCreate, onCancel }) => {
  return (
    <Modal
      maskClosable={false}
      visible={visible}
      title="标记"
      okText="确定"
      cancelText="取消"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            onCreate(values)
          })
          .catch((info) => {
            console.log('Validate Failed:', info);
          });
      }}
      width='500px'
    >
      <Form
        form={form}
        layout="inline"
        name="form_in_modal"
        initialValues={{
          kind: 'type',
          created_at: moment(),
        }}
      >
        <Form.Item name="name" label="名称">
          <Input readOnly type="textarea" />
        </Form.Item>
        <Form.Item name="created_at" label="时间">
          <DatePicker placeholder='选择时间' style={{ width: '120px' }} />
        </Form.Item>
      </Form>
    </Modal >
  );
};
