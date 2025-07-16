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

// 默认服务器配置（带版本号）
// 获取项目版本号
const defaultConfig = {
  version: app.getVersion(), // 配置文件版本
  servers: [
    { name: '混服S1', value: 'hun01', display: true },
    { name: '混服S2', value: 'hun02', display: true },
    { name: '国服', value: 'gf01', display: true },
    { name: 'B服01', value: 'bilibili01', display: true },
    { name: 'B服02', value: 'bilibili02', display: true },
    { name: 'UC服01', value: 'uc01', display: true },
    { name: 'UC服02', value: 'uc02', display: true },
    // { name: '当乐服', value: 'dangle01', display: true }
  ]
}

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
  let bExistsSync = isFileExist(filePath);
  let userConfig = null;

  if (bExistsSync) {
    try {
      let data = fs.readFileSync(filePath, 'utf8');
      userConfig = JSON.parse(data);
    } catch (error) {
      console.log('配置文件解析失败:', error);
      userConfig = null;
    }
  }

  // 如果没有用户配置或版本不匹配，需要合并配置
  if (!userConfig || !userConfig.version || userConfig.version !== defaultConfig.version) {
    const mergedConfig = mergeConfigs(userConfig, defaultConfig);
    
    // 保存合并后的配置
    try {
      fs.writeFileSync(filePath, JSON.stringify(mergedConfig, null, 2));
      return mergedConfig.servers;
    } catch (error) {
      console.log('保存配置文件失败:', error);
      return defaultConfig.servers;
    }
  }

  return userConfig.servers || defaultConfig.servers;
}

// 版本比较函数
const compareVersions = (version1: string, version2: string): number => {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;
    
    if (v1Part < v2Part) return -1;
    if (v1Part > v2Part) return 1;
  }
  
  return 0;
}

// 配置合并策略
const mergeConfigs = (userConfig: any, defaultConfig: any) => {
  if (!userConfig) {
    return defaultConfig;
  }

  // 保留用户的自定义服务器
  const userServers = userConfig.servers || [];
  const defaultServers = defaultConfig.servers || [];

  const serverMap = new Map();

  // 比较版本号，决定优先级
  const userVersion = userConfig.version || '0.0.0';
  const defaultVersion = defaultConfig.version || '0.0.0';
  const useDefaultPriority = compareVersions(defaultVersion, userVersion) >= 0;
  if (useDefaultPriority) {
    // 使用默认配置优先级
    defaultServers.forEach(defaultServer => {
      serverMap.set(defaultServer.value, { ...defaultServer, display: defaultServer.display ?? true });
    });
    // userServers内没有的再添加用户服务器，并合并display字段
    userServers.forEach(userServer => {
      if (!serverMap.has(userServer.value)) {
        serverMap.set(userServer.value, { ...userServer, display: userServer.display ?? true });
      } else {
        // 如果服务器已存在，合并display字段（false覆盖true）
        const existingServer = serverMap.get(userServer.value);
        const mergedServer = {
          ...existingServer,
          display: (userServer.display === false || existingServer.display === false) ? false : true
        };
        serverMap.set(userServer.value, mergedServer);
      }
    });
  } else {
    userServers.forEach(userServer => {
      serverMap.set(userServer.value, { ...userServer, display: userServer.display ?? true });
    });
    // defaultServers内没有的再添加默认服务器，并合并display字段
    defaultServers.forEach(defaultServer => {
      if (!serverMap.has(defaultServer.value)) {
        serverMap.set(defaultServer.value, { ...defaultServer, display: defaultServer.display ?? true });
      } else {
        // 如果服务器已存在，合并display字段（false覆盖true）
        const existingServer = serverMap.get(defaultServer.value);
        const mergedServer = {
          ...existingServer,
          display: (defaultServer.display === false || existingServer.display === false) ? false : true
        };
        serverMap.set(defaultServer.value, mergedServer);
      }
    });
  }

  // 将 Map 转换为数组
  const mergedServers = Array.from(serverMap.values());

  return {
    ...defaultConfig,
    servers: mergedServers,
    version: useDefaultPriority ? defaultConfig.version : userConfig.version
  };
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
    if (!filePaths || filePaths.length === 0) {
      return []
    }
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
const saveFile = (
  dataBuffer: Buffer,
  fileName: string,
  extensions: string[] | string
): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!Array.isArray(extensions)) {
        extensions = [extensions];
      }
      const filePaths = await dialog.showSaveDialog({
        title: '保存文件',
        defaultPath: fileName,
        filters: [{ name: 'Excel', extensions }]
      });
      if (filePaths.canceled || !filePaths.filePath) {
        return reject('canceled');
      }
      await fs.promises.writeFile(filePaths.filePath, dataBuffer);
      resolve();
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

// 保存excel
const saveExcelData = (data: any, fileName: string) => {
  const buffer = saveExcel(data)
  return saveFile(buffer, fileName, ['xls', 'xlsx'])
}

export {
  sendMsg,
  getServerList,
  loadExcelData,
  saveExcelData
}