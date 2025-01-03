import service from './request';
// import qs from "qs";

export function getUserGroupData(data: any) {
  // return Request.axiosInstance({
  //   headers: {
  //     'Content-Type': 'application/x-www-form-urlencoded',
  //   },
  //   url: '/getBB/Society',
  //   method: 'post',
  //   data: parameter
  // })
  return service.post('/getBB/Society', data);
}

export function getUserSingleData(data: any) {
  return service.post('/getBB/SocietyOfSingle', data);

}

export function getServerList() {
  return service.get('/getBB/serverList');
}