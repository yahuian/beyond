import axios from 'axios'
import { message } from 'antd'

export const request = axios.create({
  baseURL: 'http://localhost:2022/api'
})

// Add a response interceptor
request.interceptors.response.use(function (response) {
  // Any status code that lie within the range of 2xx cause this function to trigger
  // Do something with response data
  if (response.config.method !== 'get') {
    message.success(response.data.msg);
  }
  return response;
}, function (error) {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  if (error.response.data) {
    message.error(error.response.data.msg);
  } else {
    message.error(error.message);
  }
  return Promise.reject(error);
});