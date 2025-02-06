import { app, BrowserWindow, shell, ipcMain, session, dialog } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'

import { sendMsg, getServerList, loadExcelData, saveExcelData } from '../utils/index'
import getBBData from '../api/index'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

// 关闭图片不安全提示
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';


async function createWindow() {
  win = new BrowserWindow({
    title: '蹦蹦团战工具',
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    icon: path.join(process.env.VITE_PUBLIC, 'logo.ico'),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
  })



  if (VITE_DEV_SERVER_URL) { // #298
    win.loadURL(VITE_DEV_SERVER_URL)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
    //隐藏顶部菜单
    win.setMenu(null)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  // win.webContents.on('will-navigate', (event, url) => { }) #344
  // 下载提示
  win.webContents.session.on('will-download', (event, item, webContents) => {
    item.once('done', (event, state) => {
      if (state === 'completed') {
        sendMsg(win, '下载完成', 'success')
      } else if (state !== 'cancelled') {
        sendMsg(win, '下载失败:' + state, 'error')
      }
    })
  })
  // 关闭提示
  win.on('close', e => {
    e.preventDefault(); //先阻止一下默认行为，不然直接关了，提示框只会闪一下
    dialog.showMessageBox({
      type: 'info',
      title: '提示',
      message: '确认关闭？',
      buttons: ['确认', '取消'],   //选择按钮，点击确认则下面的idx为0，取消为1
      cancelId: 1, //这个的值是如果直接把提示框×掉返回的值，这里设置成和“取消”按钮一样的值，下面的idx也会是1
    }).then(idx => {
      if (idx.response == 1) {
        e.preventDefault();
      } else {
        win = null
        app.exit();
      }
    })
  });
}

app.whenReady().then(() => {
  // 拦截请求并修改 header
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  createWindow();
});

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})

// 读取服务器列表
ipcMain.on('getServer', (event, arg) => {
  const serverList = getServerList();
  event.reply('getServer-reply', serverList)
})

// 获取蹦蹦数据
ipcMain.on('getBBData', async (event, messageId, arg, cookie) => {
  try {
    const data = await getBBData(arg, cookie);
    // event.returnValue = data;
    event.reply(messageId, { data });
  } catch (error) {
    event.reply(messageId, { error });
  }
})

// 加载本地excel
ipcMain.on('loadExcel', (event, arg) => {
  // 加载并解析excel，返回数据
  const data = loadExcelData()
  // console.log(data)
  // event.reply('loadExcel-reply', result)
  event.returnValue = data
  sendMsg(win, '加载完成，数据已替换', 'success')
})

// 保存excel
ipcMain.on('saveExcel', (event, arg, fileName) => {
  // 保存excel
  // saveExcel(arg)
  saveExcelData(arg, fileName).then(() => {
    sendMsg(win, '保存成功', 'success')
  }).catch((error) => {
    if (error !== 'canceled') {
      sendMsg(win, '保存失败', 'error')
    }
  })
})

// 下载本地文件
ipcMain.on('downloadTemplateFile', () => {
  // 下载文件
  let teamObj = {
    name: '分队',
    data: [['UID', 'UserName']],
    options: {'!cols': [{ wch: 20 }, { wch: 20 }]}
  }
  let data = []
  for (let i = 1; i <= 3; i++) {
    data.push({
      ...teamObj,
      name: `分队${i}`
    })
  }
  saveExcelData(data, '社团成员名单模板.xls').then(() => {
    sendMsg(win, '保存成功', 'success')
  }).catch((error) => {
    if (error !== 'canceled') {
      sendMsg(win, '保存失败', 'error')
    }
  })
})
