import xlsx from 'node-xlsx';

// 加载Excel文件
export const loadExcel = (path: string) => {
  const workSheetsFromFile = xlsx.parse(path, {
    type: 'binary',
    codepage: 936
  });
  return workSheetsFromFile;
}

// 保存Excel文件，最后全提取出来了，方法没啥封装的作用了emmm
export const saveExcel = (data: any) => {
  const buffer = xlsx.build(data);
  return buffer
}

