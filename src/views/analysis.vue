<template>
  <el-scrollbar v-loading="fullLoading">
    <div class="analysis-box">
      <el-row align="middle" justify="space-between">
        <el-col :lg="10" :xs="24">
          <div class="map-box">
            <div class="select-box">
              <el-select v-model="historyId" placeholder="请选择团战信息" @change="checkHistory" style="width: 300px;">
                <el-option v-for="item in historyArr" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
              <el-link type="primary" @click="downloadDataToExcel" :icon="Download">下载团战数据</el-link>
            </div>
            <p class="map-name">
              {{ mapName }}
              <span v-if="resultStatus == 1">胜利</span>
              <span v-else class="fail">失败</span>
            </p>
            <div class="square">
              <p>{{ redSquare }}</p>
              <p>{{ blueSquare }}</p>
            </div>
            <img :src="mapUrl" alt="团战地图" style="width:100%;" v-show="mapUrl">
          </div>
        </el-col>
        <el-col :lg="13" :xs="24">
          <el-tabs type="border-card" v-model="nowTabs" @tab-click="tabClick">
            <el-tab-pane :label="item.groupName" :name="gIndex" v-for="(item, gIndex) in groupList" :key="gIndex"
              v-if="groupList && groupList.length > 0">
              <el-tabs tab-position="left" style="height: 350px;" v-if="item.group && item.group.length > 0"
                :stretch="false">
                <el-tab-pane v-for="(people, pIndex) in item.group" :key="pIndex">
                  <template #label>
                    <p v-if="people" class="fixed-width">{{ people.name }}</p>
                    <el-tooltip v-else class="box-item" effect="light" content="此位置有成员但未获取数据" placement="top">
                      <p class="fixed-width">成员占位 <el-icon><question-filled /></el-icon></p>
                    </el-tooltip>
                  </template>
                  <el-scrollbar height="350px">
                    <p v-for="(battle, bIndex) in people.profile.battle_info?.history[historyId].history" :key="bIndex"
                      v-if="people && people.profile.battle_info && people.profile.battle_info.history[historyId].history.length > 0">
                      在{{ formatTime(battle.enter_time - startTime) }}进入了{{ letter[battle.level_id] }}点，
                      通关时间{{ battle.pass_time }}秒，贡献了{{ contributeCompute(battle.contribute_rate) }}%同步率
                    </p>
                    <p
                      v-else-if="people && people.profile.battle_info && people.profile.battle_info.history[historyId].history.length < 1">
                      暂无参团数据或数据报错
                    </p>
                    <p v-else>{{ people && people.message ? `请求报错：${people.message}` : '暂无数据' }}</p>
                  </el-scrollbar>
                </el-tab-pane>
              </el-tabs>
              <el-empty description="暂无本分组数据" v-else style="height:350px;" />
            </el-tab-pane>
            <el-empty description="请前往数据管理添加用户数据" v-else style="height:350px;" />
          </el-tabs>
        </el-col>
      </el-row>
      <el-card class="box-card" shadow="never">
        <template #header>
          <div class="chart-title">
            <span class="chart-name">{{ chartOptions[nowCharts].name }}</span>
            <span class="chart-desc">{{ chartOptions[nowCharts].desc }}</span>
          </div>
          <div class="card-header">
            <el-select v-model="nowCharts" class="m-2" placeholder="请选择图表" size="large" @change="showChart" style="width: 200px;">
              <el-option v-for="(item, index) in chartOptions" :key="index" :label="item.name" :value="index" />
            </el-select>
            <el-button type="primary" @click="downloadChart" :icon="Download">图表下载</el-button>
          </div>
        </template>
        <el-tabs type="border-card" @tab-click="tabClick" v-model="nowTabs">
          <el-tab-pane :label="item.groupName" :name="gIndex" v-for="(item, gIndex) in groupList" :key="gIndex" />
          <charts :initOption="option" v-if="groupList && groupList.length > 0" ref="chartRef" />
          <el-empty description="请前往数据管理添加用户数据" v-else style="height:350px;" />
        </el-tabs>
      </el-card>
    </div>
  </el-scrollbar>

  <div class="fixed-bug" @click="solveTimeBug">起 始</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { QuestionFilled } from '@element-plus/icons-vue'
import charts from '../components/echarts.vue'
import { ElMessageBox } from 'element-plus'
import {
  Download
} from "@element-plus/icons-vue";
import { divide } from 'lodash'

// ========== interface 定义 ==========
interface HistoryItem {
  level_id: number
  enter_time: number
  pass_time: number
  contribute_rate: number
}

interface BattleInfo {
  map_figure_url?: string
  map_name?: string
  status?: number | string
  name1?: string
  name2?: string
  history: HistoryItem[]
}

interface PeopleData {
  name: string
  uid: number
  message?: string
  profile: {
    battle_info: {
      history: BattleInfo[]
    }
  }
}

interface GroupItem {
  groupName: string
  group: PeopleData[]
}

interface ChartOptionItem {
  name: string
  desc: string
}

interface HistoryArrItem {
  label: string
  value: number
}

// ========== 生命周期和变量 ==========
const groupList = ref<GroupItem[]>()
const mapUrl = ref('')
const mapName = ref('')
const resultStatus = ref()
const redSquare = ref('')
const blueSquare = ref('')
const startTime = ref(0)
const nowCharts = ref<'bar' | 'line'>('line')
const fullLoading = ref(false)
const historyId = ref(0);
// let nowTabs = 0
const nowTabs = ref(0)
const chartRef = ref()

// 图表显示配置
const option = ref()

const chartOptions = ref<Record<string, ChartOptionItem>>({
  bar: {
    name: '柱状图',
    desc: 'X轴为小队成员；Y轴为所用总时间；可查看成员贡献效率'
  },
  line: {
    name: '折线图',
    desc: 'X轴为进点时间；Y轴为进攻点位；可对比成员打点情况'
  }
})
// 图表配置
const graphic = [{
  type: 'group',
  left: 50,
  bottom: 40,
  z: 100,
  children: [
    {
      type: 'rect',
      left: 'center',
      top: 'center',
      z: 100,
      shape: {
        width: 100,
        height: 30
      },
      style: {
        fill: 'rgba(0,0,0,0.3)'
      }
    },
    {
      type: 'text',
      left: 'center',
      top: 'center',
      z: 100,
      style: {
        fill: '#fff',
        text: 'BBTools',
        font: 'bold 14px sans-serif'
      }
    }
  ]
}]
// 图表选项
const chartGrid = {
  left: '5%',
  right: '5%',
  top: 100,
  bottom: 100
}

// ========== 工具函数 ==========
const formatTime = (times: number) => {
  const m = Math.floor(times / 60)
  const s = times % 60
  return m + '分' + s + '秒'
}

// 进攻点位对应字母
const letter: Record<number, string> = {
  1401: 'A', 1402: 'B', 1403: 'C', 1404: 'D', 1405: 'E', 1406: 'F', 1407: 'G', 1408: 'H', 1409: 'I',
  1411: 'A', 1412: 'B', 1413: 'C', 1414: 'D', 1415: 'E', 1416: 'F', 1417: 'G', 1418: 'H', 1419: 'I',
  1420: 'J', 1421: 'K', 1422: 'A', 1423: 'B', 1424: 'C', 1425: 'D', 1426: 'E', 1427: 'F', 1428: 'G',
  1429: 'A', 1430: 'B', 1431: 'C', 1432: 'D', 1433: 'E', 1434: 'F', 1435: 'G', 1436: 'H',
  1437: 'A', 1438: 'B', 1439: 'C', 1440: 'D', 1441: 'E', 1442: 'F', 1443: 'G', 1444: 'H', 1445: 'I',
  1446: 'A', 1447: 'B', 1448: 'C', 1449: 'D', 1450: 'E', 1451: 'F', 1452: 'G', 1453: 'H', 1454: 'I',
  1455: 'J'
}

// 贡献计算
const contributeCompute = (a: number) => {
  return divide(a, 10)
}

// ========== 功能函数 ==========
const solveTimeBug = () => {
  const regPos = /^[0-9]+.?[0-9]*/
  ElMessageBox.prompt('解决官方时间超长bug，这里输入初始时间（单位：分钟）。详见：帮助-常见问题-5', '解决官方时间超长问题', {
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  }).then(({ value }) => {
    if (value && regPos.test(value)) {
      startTime.value = Number(value) * 60
      showChart()
    }
  }).catch(() => {
    // 用户取消操作，不做处理
  })
}

// ========== 事件函数 ==========

// 获取团战数据
const historyArr = ref<HistoryArrItem[]>([])
const getHistoryArr = () => {
  // 类似获取地图信息，获取的是第一个角色的团战数据
  if (groupList.value && groupList.value.length > 0) {
    const historyObj = groupList.value[0].group[0].profile.battle_info.history
    for (let i = 0; i < historyObj.length; i++) {
      let name = historyObj[i].name1 + ' VS ' + historyObj[i].name2
      historyArr.value.push({
        label: name,
        value: i
      })
    }
  }
}

const checkHistory = () => {
  // 地图信息清空
  fullLoading.value = true
  mapUrl.value = ''
  mapName.value = ''
  resultStatus.value = ''
  redSquare.value = ''
  showChart()
  // 500ms后关闭loading，给用户一个视觉提示
  setTimeout(() => {
    fullLoading.value = false
  }, 500)
}

// 切换图表
const tabClick = (tab: any) => {
  nowTabs.value = tab.props.name
  showChart()
}

// 显示图表
const showChart = () => {
  option.value = null
  if (!groupList.value || groupList.value.length === 0) return
  let chartData
  if (nowCharts.value === 'bar') {
    chartData = showBarChart(groupList.value[nowTabs.value])
  } else {
    chartData = showLineChart(groupList.value[nowTabs.value])
  }
  option.value = chartData
}

// 图表下载
const downloadChart = () => {
  if (option.value && groupList.value) {
    let picName = `${redSquare.value} VS ${blueSquare.value} ${mapName.value}-${groupList.value[nowTabs.value].groupName}`
    chartRef.value.downloadChart(picName)
  }
}

// 获取地图信息
const getMapInfo = (historyObj: BattleInfo) => {
  if (
    historyObj &&
    historyObj.history &&
    historyObj.history.length > 0 &&
    !mapUrl.value
  ) {
    try {
      mapUrl.value = historyObj.map_figure_url || ''
      mapName.value = historyObj.map_name || ''
      resultStatus.value = historyObj.status || ''
      redSquare.value = historyObj.name1 || ''
      blueSquare.value = historyObj.name2 || ''
    } catch (error) {
      mapUrl.value = ''
      mapName.value = ''
      resultStatus.value = ''
      redSquare.value = ''
      blueSquare.value = ''
    }
  }
}

// 柱状图
const showBarChart = (res: GroupItem) => {
  const barColor: Record<string, string> = {
    A: '#5470c6',
    B: '#91cc75',
    C: '#fac858',
    D: '#ee6666',
    E: '#73c0de',
    F: '#3ba272',
    G: '#fc8452',
    H: '#9a60b4',
    I: '#ea7ccc'
  }

  const labelOption = {
    show: true,
    fontSize: 10,
    formatter(params: any) {
      if (params.data?.message) {
        return '{message|错误...}'
      } else {
        return `${params.data?.pass_time}秒 ${params.name}点`
      }
    },
    rich: {
      message: {
        fontSize: 12
      }
    }
  }

  const barTooltip = {
    formatter(params: any) {
      if (!params.data) return ''
      return params.data.message
        ? params.data.message
        : `用时${params.data.pass_time}秒 攻占${params.name}点，获得${contributeCompute(params.data.contribute_rate)}% 同调率`
    }
  }

  const groupData: any = {
    backgroundColor: '#fff',
    grid: chartGrid,
    dataZoom: {
      type: 'inside'
    },
    xAxis: {
      name: '成员',
      axisLabel: {
        interval: 0,
        rotate: 45
      },
      data: []
    },
    yAxis: {
      name: '总参与时间（单位：秒）'
    },
    tooltip: barTooltip,
    series: [],
    graphic
  }

  for (let i = 0; i < res.group.length; i++) {
    const oneMember = res.group[i]
    const historyObj = oneMember.profile.battle_info.history[historyId.value]
    groupData.xAxis.data.push(oneMember?.name || '成员占位')

    // 获取地图信息
    getMapInfo(historyObj)

    if (historyObj?.history?.length) {
      for (let j = 0; j < historyObj.history.length; j++) {
        if (!groupData.series[j]) {
          groupData.series[j] = {
            data: [],
            type: 'bar',
            barGap: '20%',
            label: labelOption,
            barMinHeight: 10,
            itemStyle: {
              color(params: any) {
                return barColor[params.name] || '#5470c6'
              },
              borderType: 'solid',
              borderColor: '#fff'
            },
            stack: 'x'
          }
        }
        const historyItem = historyObj.history[j]
        const level_id = letter[historyItem.level_id]

        groupData.series[j].data[i] = {
          name: level_id,
          value:
            historyObj.history[j + 1]
              ? historyObj.history[j + 1].enter_time - historyItem.enter_time
              : 30,
          contribute_rate: historyItem.contribute_rate,
          enter_time: historyItem.enter_time - startTime.value,
          pass_time: historyItem.pass_time
        }
      }
    } else {
      if (!groupData.series[0]) {
        groupData.series[0] = {
          data: [],
          type: 'bar',
          barGap: '20%',
          label: labelOption,
          itemStyle: {
            color(params: any) {
              return barColor[params.name] || '#5470c6'
            },
            borderType: 'solid',
            borderColor: '#fff'
          },
          stack: 'x'
        }
      }
      groupData.series[0].data[i] = {
        value: 30,
        message: oneMember.message
          ? `请求报错：${oneMember.message}`
          : '暂无参团数据或数据报错'
      }
    }
  }
  return groupData
}

// 折线图
const showLineChart = (res: GroupItem) => {

  const lineTooltip = {
    trigger: 'axis',
    formatter(params: any) {
      let text = ''
      for (const item of params) {
        if (!item.data) return ''
        if (!text) text += `<p>${formatTime(item.axisValue)}</p>`
        if (item.data.message) {
          text += item.data.message
        } else {
          text += `<p style="color: ${item.color}">
            ${item.seriesName}：用时${item.data.pass_time}秒
            攻占${item.name}点，获得${contributeCompute(item.data.contribute_rate)}% 同调率
          </p>`
        }
      }
      return text
    }
  }

  const lineData: any = {
    backgroundColor: '#fff',
    grid: chartGrid,
    legend: {
      data: <string[]>[],
      top: '4%',
      textStyle: {
        color: '#1FC3CE',
        fontSize: 14
      }
    },
    tooltip: lineTooltip,
    xAxis: {
      type: 'value',
      name: '进点时间',
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      name: '进攻点位',
      boundaryGap: false,
      splitLine: {
        show: true
      },
      alignTicks: true,
      splitNumber: 14,
      max: 11,
      axisLabel: {
        formatter(value: number) {
          const dataMap = ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']
          return dataMap[value] || ''
        }
      }
    },
    series: <any>[],
    graphic
  }

  for (let i = 0; i < res.group.length; i++) {
    const peopleData = res.group[i]
    const historyObj = peopleData.profile.battle_info.history[historyId.value]
    lineData.legend.data[i] = peopleData.name

    // 初始化地图信息
    getMapInfo(historyObj)

    const line: any[] = []
    if (historyObj?.history?.length) {
      for (const historyData of historyObj.history) {
        const level_id = letter[historyData.level_id]
        line.push({
          name: level_id,
          value: [historyData.enter_time - startTime.value, level_id.charCodeAt(0) - 64],
          contribute_rate: historyData.contribute_rate,
          enter_time: historyData.enter_time - startTime.value,
          pass_time: historyData.pass_time
        })
      }
    }

    lineData.series[i] = {
      name: peopleData.name,
      type: 'line',
      data: line
    }
  }

  return lineData
}

const downloadDataToExcel = () => {
  if (groupList.value && groupList.value.length > 0) {
    const data = groupList.value.map((group) => {
      let headerArr = ['昵称']
      let headerNum = 0
      let groupData = group.group.map((people) => {
        const historyObj = people.profile.battle_info.history[historyId.value]
        if (historyObj?.history?.length) {
          let historyData = [people.name]

          for (let i=0; i<historyObj.history.length-1; i++) {
            let history = historyObj.history[i]
            if (headerNum <= i) {
              headerArr.push('进点时间', '所进关卡', '通关时间', '同步率')
            }
            headerNum++
            // 设置颜色
            historyData.push(
              formatTime(history.enter_time - startTime.value),
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
    console.log('downloadDataToExcel----------')
    console.log(data)
    // 通过saveExcel
    window.ipcRenderer.sendSync('saveExcel', data, '团战数据')
  }
}

onMounted(() => {
  const groupDataString = window.localStorage.getItem('groupData')
  if (groupDataString) {
    groupList.value = JSON.parse(groupDataString)
    getHistoryArr()
  }
  if (groupList.value && groupList.value.length > 0) {
    showChart()
  }
})
</script>

<style scoped>
.analysis-box {
  margin: 16px;
}

.map-box {
  background-color: #fafafa;
  padding: 12px;
  margin-bottom: 12px;
}

.select-box{
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.map-name {
  font-weight: bold;
  margin-bottom: 8px;
}

.fail {
  color: red;
}

.square {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  width: 100%;
  padding: 0 20px;
  margin-bottom: 4px;
}

.box-card {
  margin-top: 20px;
}

.card-header{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chart-title{
  margin-bottom: 6px;
}

.fixed-bug {
  position: fixed;
  bottom: 100px;
  right: 50px;
  background-color: #409eff;
  color: #fff;
  width: 50px;
  height: 50px;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: 50%;
}
</style>