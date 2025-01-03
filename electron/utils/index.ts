import { app } from 'electron'
// const { app } = window.require('electron');
// const fs = require("fs") as typeof import('fs');
// const fs = require("fs");
import fs from 'fs'

// 获取配置文件地址
// 获取配置文件地址
let userData = app ? app.getPath('userData') : ''
const filePath = `${userData}\\serverData.json`

// 默认服务器配置
let serverList = [
  // { name: 'S1.2144一区（命运之轮）', value: 'hun01' },
  { name: '混服', value: 'hun' },
  { name: '国服', value: 'gf01' },
  { name: 'B服', value: 'bilibili' },
]

// 判断文件是否存在
const isFileExist = (path: string) => {
  try {
    fs.accessSync(path, fs.constants.F_OK);
  } catch (e) {
    return false;
  }
  return true;
}

const getServerList = () => {
   //验证文件是否存在
   let bExistsSync = isFileExist(filePath);
   let server = []
   if (bExistsSync) {
     // 读取配置文件
     let data = fs.readFileSync(filePath, 'utf8')
     if (data) {
       try {
         server = JSON.parse(data)
       } catch (error) {
         console.log(error)
         return []
       }
     }
   } else {
     // 创建配置文件
     let error = fs.writeFileSync(filePath, JSON.stringify(serverList))
   }
 
   // console.log(req.body)
   if (server) {
    return server
   } else {
    return []
   }
}

export {
  getServerList
}