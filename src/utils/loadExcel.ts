const loadExcel = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    // 使用 once 而不是 on，避免多次触发
    try {
      const result = window.ipcRenderer.sendSync('loadExcel')
      resolve(result)
    } catch (error) {
      reject(error)
    }
  })
}

export default loadExcel;
