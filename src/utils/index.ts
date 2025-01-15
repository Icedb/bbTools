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