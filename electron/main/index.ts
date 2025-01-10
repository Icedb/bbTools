import { app, BrowserWindow, shell, ipcMain, session } from 'electron'
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
      console.log('Download complete')
      console.log(state)
      if (state === 'completed') {
        sendMsg(win, '下载完成', 'success')
      } else {
        sendMsg(win, '下载失败', 'error')
      }
    })
  })
}

app.whenReady().then(() => {
  // 拦截请求并修改 header
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    // details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) miHoYoBBS/2.11.1';
    // details.requestHeaders['Referer'] = 'https://webstatic.mihoyo.com/';
    // details.requestHeaders['x-rpc-app_version'] = '2.24.2';
    // details.requestHeaders['x-rpc-client_type'] = '5';
    // details.requestHeaders['accept-language'] = 'zh-CN,zh;q=0.9,en;q=0.8';
    // details.requestHeaders['origin'] = 'https://webstatic.mihoyo.com/';
    // details.requestHeaders['accept-language'] = 'zh-CN,zh;q=0.9,en;q=0.8';
    // details.requestHeaders['accept-language'] = 'zh-CN,zh;q=0.9,en;q=0.8';
    // details.requestHeaders['Cookie'] = '_MHYUUID=a5f8d3a6-9a95-49ee-a327-5dd2c6330499; DEVICEFP_SEED_ID=738d476151fb4379; DEVICEFP_SEED_TIME=1716338798100; _ga=GA1.1.478155285.1716338799; cookie_token_v2=v2_nfMq0aJNj_o-JXyo45vsOH7CuXpDDhDiTq4J91yQ1zCk0Xi46tOndWaSwHZyk_KOcxeUAmJO-TMVsRW9XSAnf0d5gOk3ZszIqxTiNZmdmGdNu83A7QTRQRH8HzNt_fBnRq2WUwvOzataB25a9g==.CAE=; account_mid_v2=0ywfka2ovh_mhy; account_id_v2=77344928; ltoken_v2=v2_YZBn7l3uUTRsXGDjbMyLVkSX7gtZPivgFXhRjQB_oiKLbqgTwa7CTN3iDVEznuTvfbdphCuCKgPAJmLddLkH9vP0vuVKdmDHVRa7I7UKdbc4ZsfASk-sAsjSn2Zdlhn9vhUWqwnmDMK2Dtlu1Q==.CAE=; ltmid_v2=0ywfka2ovh_mhy; ltuid_v2=77344928; cookie_token=jsdA8QKlrkAWg4nTkY2dTcPP4fq9HqcHUqfR6cuA; account_id=77344928; ltoken=NX5Cw02UpRjcrKy7uJW7VTC0G3EOYfIvMgHJINVV; ltuid=77344928; acw_tc=ac11000117362104865033036ec697dcd8bde5f0ede8a4893632d43e11e040; _ga_KS4J8TXSHQ=GS1.1.1736210485.6.0.1736210485.0.0.0; DEVICEFP=38d7fa772ba80';

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
  console.log('getServer', arg)
  const serverList = getServerList();
  event.reply('getServer-reply', serverList)
})

// 获取蹦蹦数据
ipcMain.on('getBBData', async (event, arg) => {
  const cookie = ' _MHYUUID=a5f8d3a6-9a95-49ee-a327-5dd2c6330499; DEVICEFP_SEED_ID=738d476151fb4379; DEVICEFP_SEED_TIME=1716338798100; _ga=GA1.1.478155285.1716338799; cookie_token_v2=v2_nfMq0aJNj_o-JXyo45vsOH7CuXpDDhDiTq4J91yQ1zCk0Xi46tOndWaSwHZyk_KOcxeUAmJO-TMVsRW9XSAnf0d5gOk3ZszIqxTiNZmdmGdNu83A7QTRQRH8HzNt_fBnRq2WUwvOzataB25a9g==.CAE=; account_mid_v2=0ywfka2ovh_mhy; account_id_v2=77344928; ltoken_v2=v2_YZBn7l3uUTRsXGDjbMyLVkSX7gtZPivgFXhRjQB_oiKLbqgTwa7CTN3iDVEznuTvfbdphCuCKgPAJmLddLkH9vP0vuVKdmDHVRa7I7UKdbc4ZsfASk-sAsjSn2Zdlhn9vhUWqwnmDMK2Dtlu1Q==.CAE=; ltmid_v2=0ywfka2ovh_mhy; ltuid_v2=77344928; cookie_token=jsdA8QKlrkAWg4nTkY2dTcPP4fq9HqcHUqfR6cuA; account_id=77344928; ltoken=NX5Cw02UpRjcrKy7uJW7VTC0G3EOYfIvMgHJINVV; ltuid=77344928; acw_tc=ac11000117362104865033036ec697dcd8bde5f0ede8a4893632d43e11e040; _ga_KS4J8TXSHQ=GS1.1.1736210485.6.0.1736210485.0.0.0; DEVICEFP=38d7fa772ba80'
  const data = await getBBData(arg, cookie);
  event.returnValue = data;
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
  saveExcelData(arg, fileName)
  sendMsg(win, '保存成功', 'success')
})
