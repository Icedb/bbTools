import axios from 'axios';
 
// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_BASE_API, // api的base_url
  timeout: 5000 // 请求超时时间
});
 
// 请求拦截器
service.interceptors.request.use(
  config => {
    // 可以在这里添加请求头等信息
    // 例如：config.headers['Authorization'] = 'Bearer your-token';
    return config;
  },
  error => {
    // 请求错误处理
    console.log(error); // for debug
    Promise.reject(error);
  }
);
 
// 响应拦截器
service.interceptors.response.use(
  response => {
    // 对响应数据做处理，例如只返回data部分
    const res = response.data;
    // 如果返回的状态码为200，说明成功，可以直接返回数据
    if (res.code === 200) {
      return res.data;
    } else {
      // 其他状态码都当作错误处理
      // 可以在这里对不同的错误码进行不同处理
      return Promise.reject({
        message: res.message || 'Error',
        status: res.code
      });
    }
  },
  error => {
    // 对响应错误做处理
    console.log('err' + error); // for debug
    return Promise.reject(error);
  }
);
 
export default service;
