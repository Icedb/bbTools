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
          <user-info :groupList="groupList" :historyId="historyId" :startTime="startTime" v-model="nowTabs" groupType="battle" @tabClick="tabClick" />
        </el-col>
      </el-row>
      <user-echart :groupList="groupList" :mapName="mapName" :historyId="historyId" :startTime="startTime" 
      :redSquare="redSquare" :blueSquare="blueSquare" groupType="battle"
      v-model="nowTabs" @tabClick="tabClick" @getMapInfo="getMapInfo" ref="userEchartRef" />
    </div>
  </el-scrollbar>

  <div class="fixed-bug" @click="solveTimeBug">起 始</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import {
  Download
} from "@element-plus/icons-vue";
import userInfo from '@/components/userInfo.vue';
import userEchart from '@/components/userEchart.vue';
import { handleExcelData } from '@/utils/index'

import { GroupItem, HistoryArrItem, BattleInfo } from '@/types/analysis'

// ========== 生命周期和变量 ==========
const groupList = ref<GroupItem[]>()
const mapUrl = ref('')
const mapName = ref('')
const resultStatus = ref()
const redSquare = ref('')
const blueSquare = ref('')
const startTime = ref(0)
const fullLoading = ref(false)
const historyId = ref();
// let nowTabs = 0
const nowTabs = ref(0)

// 图表显示配置
const userEchartRef = ref()

// ========== 功能函数 ==========
const solveTimeBug = () => {
  const regPos = /^[0-9]+.?[0-9]*/
  ElMessageBox.prompt('解决官方时间超长bug，这里输入初始时间（单位：分钟）。详见：帮助-常见问题-5', '解决官方时间超长问题', {
    confirmButtonText: '确认',
    cancelButtonText: '取消'
  }).then(({ value }) => {
    if (value && regPos.test(value)) {
      startTime.value = Number(value) * 60
      // showChart()
      userEchartRef.value.showChart()
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
    const historyObj = groupList.value[0].group[0]?.profile?.battle_info?.history || []
    for (let i = 0; i < historyObj.length; i++) {
      let name = historyObj[i].name1 + ' VS ' + historyObj[i].name2
      historyArr.value.push({
        label: name,
        value: i
      })
      if (historyId.value === undefined) {
        historyId.value = i
      }
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
  // showChart()
  userEchartRef.value.showChart()
  // 500ms后关闭loading，给用户一个视觉提示
  setTimeout(() => {
    fullLoading.value = false
  }, 500)
}

// 切换图表
const tabClick = (tab: any) => {
  nowTabs.value = tab.props.name
  // showChart()
  userEchartRef.value.showChart()
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


const downloadDataToExcel = () => {
  // 后期优化：数据层数太多，不好判断是否有数据，需要增加一个判断
  if (groupList.value && groupList.value.length > 0) {
    const {data, name} = handleExcelData(groupList.value, startTime.value, historyId.value)
    window.ipcRenderer.send('saveExcel', data, name)
  }
}

onMounted(() => {
  const groupDataString = window.localStorage.getItem('groupData')
  if (groupDataString) {
    groupList.value = JSON.parse(groupDataString)
    getHistoryArr()
  }
  if (groupList.value && groupList.value.length > 0) {
    // showChart()
    userEchartRef.value.showChart()
  }
})
</script>

<style scoped lang="scss">
.analysis-box {
  margin: 16px;

  .map-box {
    background-color: #fafafa;
    padding: 12px;
    margin-bottom: 12px;

    .select-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .map-name {
      font-weight: bold;
      margin-bottom: 8px;

      span {
        color: var(--el-color-success);

        &.fail {
          color: var(--el-color-danger);
        }
      }
    }

    .square {
      display: flex;
      gap: 16px;
      justify-content: space-between;
      width: 100%;
      padding: 0 20px;
      margin-bottom: 4px;
    }
  }
}

.fixed-bug {
  position: fixed;
  bottom: 100px;
  right: 50px;
  background-color: var(--el-color-primary);
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