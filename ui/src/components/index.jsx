import { React } from 'react';
import { DatePicker } from 'antd';

const { RangePicker } = DatePicker;

// 开始时间-结束时间选择器
export const DatetimeDropDown = ({
  setSelectedKeys,
  selectedKeys,
  confirm,
  setFilters,
  clearFilters
}) => {
  return (
    <div style={{ padding: 8 }}>
      <RangePicker
        value={selectedKeys}
        onChange={(dates) => {
          setSelectedKeys(dates)
          if (!dates || dates.length !== 2) {
            clearFilters?.()
            confirm()
          } else {
            confirm()
          }
          if (setFilters) {
            setFilters()
          }
        }}
      />
    </div>
  )
}
