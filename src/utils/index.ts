import { divide } from 'lodash'

// 进攻点位对应字母
const battleLetter: Record<number, string> = {
  1401: 'A', 1402: 'B', 1403: 'C', 1404: 'D', 1405: 'E', 1406: 'F', 1407: 'G', 1408: 'H', 1409: 'I',
  1411: 'A', 1412: 'B', 1413: 'C', 1414: 'D', 1415: 'E', 1416: 'F', 1417: 'G', 1418: 'H', 1419: 'I',
  1420: 'J', 1421: 'K', 1422: 'A', 1423: 'B', 1424: 'C', 1425: 'D', 1426: 'E', 1427: 'F', 1428: 'G',
  1429: 'A', 1430: 'B', 1431: 'C', 1432: 'D', 1433: 'E', 1434: 'F', 1435: 'G', 1436: 'H',
  1437: 'A', 1438: 'B', 1439: 'C', 1440: 'D', 1441: 'E', 1442: 'F', 1443: 'G', 1444: 'H', 1445: 'I',
  1446: 'A', 1447: 'B', 1448: 'C', 1449: 'D', 1450: 'E', 1451: 'F', 1452: 'G', 1453: 'H', 1454: 'I',
  1455: 'J'
}

const levelLetter: Record<number, string> = {
  6531: '1',
  6532: '2',
  6533: '3',
  6534: '4',
  6535: '5',
  6536: '6',
  6537: '7',
}

// 贡献计算
const contributeCompute = (a: number) => {
  return divide(a, 10)
}

// 时间计算
const formatTime = (times: number) => {
  const m = Math.floor(divide(times, 60))
  const s = times % 60
  return m + '分' + s + '秒'
}

export {
  battleLetter,
  levelLetter,
  contributeCompute,
  formatTime
}