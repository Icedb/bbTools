<template>
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import charts from './echarts.vue'
import { Download } from '@element-plus/icons-vue'
import { GroupItem, ChartOptionItem, PeopleData } from '@/types/analysis'
import { battleLetter, levelLetter, formatTime, contributeCompute } from '@/utils/index'

const props = defineProps({
  groupList: {
    type: Array as () => GroupItem[],
    default: () => []
  },
  mapName: {
    type: String,
    default: ''
  },
  historyId: {
    type: Number,
    default: 0
  },
  startTime: {
    type: Number,
    default: 0
  },
  redSquare: {
    type: String,
    default: ''
  },
  blueSquare: {
    type: String,
    default: ''
  },
  modelValue: {
    type: Number,
    default: 0
  },
  groupType: {
    type: String,
    default: 'battle'
  }
})

const emit = defineEmits(['tabClick', 'update:modelValue', 'getMapInfo'])

const nowTabs = computed({
  get: () => props.modelValue,
  set: val => {
    emit("update:modelValue", val);
  },
});

const tabClick = (tab: any) => {
  emit('tabClick', tab)
  // showChart()
}

const getGroupData = (people: PeopleData) => {
  if (props.groupType === 'battle') {
    return people.profile?.battle_info?.history[props.historyId] || [];
  } else {
    return people.profile?.level_info || [];
  }
};

const letter = computed(() => {
  if (props.groupType === 'battle') {
    return battleLetter
  } else {
    return levelLetter
  }
})

// 显示图表
const showChart = () => {
  // 赋值时机问题导致，数值更改后并不能同时赋值props内容，所以加个等待时间，之后优化
  setTimeout(() => {
    option.value = null
    if (!props.groupList || props.groupList.length === 0) return
    let chartData
    if (nowCharts.value === 'bar') {
      chartData = showBarChart(props.groupList[nowTabs.value])
    } else {
      chartData = showLineChart(props.groupList[nowTabs.value])
    }
    option.value = chartData
  }, 1)
}
// showChart开放给父组件
defineExpose({ showChart })


const option = ref()
const chartRef = ref()
const nowCharts = ref<'bar' | 'line'>('line')
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
        width: 200,
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
        text: 'BBTools：请勿过度责怪团员',
        font: 'bold 14px sans-serif'
      }
    }
  ]
}]
// 图表选项
const chartGrid = {
  left: 30,
  right: 70,
  top: 100,
  bottom: 100
}



// 图表下载
const downloadChart = () => {
  if (option.value && props.groupList) {
    let picName = `${props.redSquare} VS ${props.blueSquare} ${props.mapName}-${props.groupList[nowTabs.value].groupName}`
    chartRef.value.downloadChart(picName)
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
    I: '#ea7ccc',
    '1': '#5470c6',
    '2': '#91cc75',
    '3': '#fac858',
    '4': '#ee6666',
    '5': '#73c0de',
    '6': '#3ba272',
    '7': '#fc8452',
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
    // const historyObj = oneMember.profile?.battle_info?.history[props.historyId] || { history: [] }
    const historyObj = getGroupData(oneMember)
    groupData.xAxis.data.push(oneMember?.name || '成员占位')

    // 获取地图信息
    // getMapInfo(historyObj)
    emit('getMapInfo', historyObj)

    if (historyObj.history && historyObj.history.length > 0) {
      for (let j = 0; j < historyObj?.history.length; j++) {
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
        const historyItem = historyObj?.history[j]
        const level_id = letter.value[historyItem.level_id]

        groupData.series[j].data[i] = {
          name: level_id,
          value:
            historyObj?.history[j + 1]
              ? historyObj?.history[j + 1].enter_time - historyItem.enter_time
              : 30,
          contribute_rate: historyItem.contribute_rate,
          enter_time: historyItem.enter_time - props.startTime,
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
          let dataMap = []
          if (props.groupType === 'battle') {
            dataMap = ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']
          } else {
            dataMap = ['', '1', '2', '3', '4', '5', '6', '7']
          }
          return dataMap[value] || ''
        }
      }
    },
    series: <any>[],
    graphic
  }

  for (let i = 0; i < res.group.length; i++) {
    const peopleData = res.group[i]
    const historyObj = getGroupData(peopleData)
    lineData.legend.data[i] = peopleData.name

    // 初始化地图信息
    // getMapInfo(historyObj)
    emit('getMapInfo', historyObj)

    const line: any[] = []
    if (historyObj.history && historyObj?.history.length > 0) {
      for (const historyData of historyObj?.history) {
        const level_id = letter.value[historyData.level_id]
        let yValue = props.groupType === 'battle' ? level_id.charCodeAt(0) - 64 : Number(level_id)
        line.push({
          name: level_id,
          value: [historyData.enter_time - props.startTime, yValue],
          contribute_rate: historyData.contribute_rate,
          enter_time: historyData.enter_time - props.startTime,
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

</script>

<style scoped lang="scss">
.box-card {
  margin-top: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .chart-title {
    margin-bottom: 6px;
  }
}
</style>