import { divide } from 'lodash'
import { GroupItem } from '@/types/analysis'

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

// 理论上应该提取成配置文件，但是比较懒，下次再有这类问题再提
const levelLetter: Record<number, string> = {
  6401: '1',6402: '2',6403: '3',6404: '4',6405: '5',6406: '6',6407: '7',
  6491: '1',6492: '2',6493: '3',6494: '4',6495: '5',6496: '6',6497: '7',
  6501: '1',6502: '2',6503: '3',6504: '4',6505: '5',6506: '6',6507: '7',
  6511: '1',6512: '2',6513: '3',6514: '4', 6515: '5',6516: '6',6517: '7',
  6521: '1',6522: '2',6523: '3',6524: '4', 6525: '5',6526: '6',6527: '7',
  6531: '1',6532: '2',6533: '3',6534: '4',6535: '5',6536: '6',6537: '7',
  6541: '1',6542: '2',6543: '3',6544: '4',6545: '5',6546: '6',6547: '7',
  6551: '1',6552: '2',6553: '3',6554: '4',6555: '5',6556: '6',6557: '7',
  6561: '1',6562: '2',6563: '3',6564: '4',6565: '5',6566: '6',6567: '7',
  6571: '1',6572: '2',6573: '3',6574: '4',6575: '5',6576: '6',6577: '7',
  6581: '1',6582: '2',6583: '3',6584: '4',6585: '5',6586: '6',6587: '7',
  6591: '1',6592: '2',6593: '3',6594: '4',6595: '5',6596: '6',6597: '7',
  6601: '1',6602: '2',6603: '3',6604: '4',6605: '5',6606: '6',6607: '7',
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

// 处理excel数据
const handleExcelData = (groupList: GroupItem[], startTime: number, historyId?: number) => {
  let letter = historyId !== undefined ? battleLetter : levelLetter
  let teamName = ''
  let redSquare = ''
  let blueSquare = ''
  let mapName = ''
  const data = groupList.map((group) => {
    let headerArr = ['昵称']
    let headerNum = 0
    let groupData = group.group.map((people) => {
      if (!teamName) {
        teamName = people.profile?.name || ''
      }
      let historyObj;
      if (historyId !== undefined) {
        historyObj = people.profile?.battle_info?.history[historyId]?.history || { history: [] }
        redSquare = people.profile?.battle_info?.history[historyId]?.name1 || ''
        blueSquare = people.profile?.battle_info?.history[historyId]?.name2 || ''
        mapName = people.profile?.battle_info?.history[historyId]?.map_name || ''
      } else {
        historyObj = people.profile?.level_info?.history || []
        mapName = people.profile?.level_info?.map_name || ''
      }

      if (historyObj?.length) {
        let historyData = [people.name]

        for (let i = 0; i <= historyObj.length - 1; i++) {
          let history = historyObj[i]
          if (headerNum <= i) {
            headerArr.push('进点时间', '所进关卡', '通关时间', '同步率')
          }
          headerNum++
          historyData.push(
            formatTime(history.enter_time - startTime),
            letter[history.level_id],
            history.pass_time + '秒',
            contributeCompute(history.contribute_rate) + '%'
          )
        }
        return historyData.flat()
      } else {
        return [people.name, '暂无数据']
      }
    })
    groupData.unshift(headerArr)
    return {
      name: group.groupName,
      data: groupData
    }
  })

  let name;
  if (historyId !== undefined) {
    name = `${redSquare} VS ${blueSquare} ${mapName}团战数据`
  } else {
    name = `${teamName}${mapName}团本数据`
  }
  return {
    data,
    name
  }
}

export {
  battleLetter,
  levelLetter,
  contributeCompute,
  formatTime,
  handleExcelData
}