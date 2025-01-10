import { app, dialog, BrowserWindow } from 'electron'
// const { app } = window.require('electron');
// const fs = require("fs") as typeof import('fs');
// const fs = require("fs");
import fs from 'fs'
import { loadExcel, saveExcel } from './excel'

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

// 发送消息给渲染进程，只想到了win.webContents.send发送，之后有空再看看别的
const sendMsg = (win: BrowserWindow, msg: string, type: string) => {
  // console.log(msg)
  win.webContents.send('message', msg, type)
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

// 加载excel文件，获取多个sheet，然后对数据的id进行去重
const loadExcelData = () => {
  try {
    const filePaths = dialog.showOpenDialogSync({
      properties: ['openFile'],
      filters: [
        { name: 'Excel', extensions: ['xls', 'xlsx'] }
      ]
    })
    const path = filePaths[0]
    const workSheetsFromFile = loadExcel(path)
    // 去重并生成根据sheet的多维数组
    let groupData = []
    workSheetsFromFile.forEach(sheet => {
      let group = sheet.data
      let groupObj = {
        groupName: sheet.name,
        group: [],
        hasAdd: 0
      }
      group.forEach((item, index) => {
        if (index > 0 && item[0]) {
          // 去重
          for (let i in groupData) {
            if (groupData[i].group.find((v) => v.uid === item[0])) {
              return
            }
          }
          if (groupObj.group.find((v) => v.uid === item[0])) {
            return
          }

          if (item[0] === 'uid') {
            return
          }

          if (!item[0] || isNaN(item[0])) {
            return
          }

          if (!item[1]) {
            item[1] = '默认帕鲁'
          }
  
          let obj = {
            uid: item[0],
            name: item[1],
            hasEdit: 0,
            message: '',
            profile: null
          }
          groupObj.group.push(obj)
        }
      })
      groupData.push(groupObj)
    })
    return groupData
  } catch (error) {
    console.log(error)
    return []
  }
}

// 保存文件，调用showOpenDialogSync获取保存路径，然后将文件流写入
const saveFile = (dataBuffer: Buffer, fileName: string, extensions: string[] | string) => {
  try {
    // 判断extensions是否为数组
    if (!Array.isArray(extensions)) {
      extensions = [extensions]
    }
    const filePaths = dialog.showSaveDialogSync({
      title: '保存文件',
      defaultPath: '团战数据',
      filters: [
        { name: 'Excel', extensions: extensions }
      ]
    })
    // const fileName = '团战数据' + extensions[0]
    const path = filePaths
    return fs.writeFileSync(path, dataBuffer);
  } catch (error) {
    console.log(error)
    return false
  }
}

// 保存excel
const saveExcelData = (data: any, fileName: string) => {
  const buffer = saveExcel(data)
  saveFile(buffer, fileName, ['xls', 'xlsx'])
}

export {
  sendMsg,
  getServerList,
  loadExcelData,
  saveExcelData
}