<template>
  <el-scrollbar v-loading="fullLoading">
    <div class="analysis-box">
      <el-row align="middle" justify="space-between">
        <el-col :lg="10" :xs="24">
          <div class="map-box">
            <div class="select-box">
              <p>{{ mapName }}</p>
              <el-link type="primary" @click="downloadDataToExcel" :icon="Download">下载团本数据</el-link>
            </div>
            <img :src="mapUrl" alt="团战地图" style="width:100%;" v-show="mapUrl">
          </div>
        </el-col>
        <el-col :lg="13" :xs="24">
          <user-info :groupList="groupList" :startTime="startTime" v-model="nowTabs" groupType="level" @tabClick="tabClick" />
        </el-col>
      </el-row>
      <user-echart :groupList="groupList" :mapName="mapName" :startTime="startTime" groupType="level"
      v-model="nowTabs" @tabClick="tabClick" @getMapInfo="getMapInfo" ref="userEchartRef" />
    </div>
  </el-scrollbar>

  <!-- <div class="fixed-bug" @click="solveTimeBug">起 始</div> -->
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import {
  Download
} from "@element-plus/icons-vue";
import userInfo from '@/components/userInfo.vue';
import userEchart from '@/components/userEchart.vue';
import { levelLetter, formatTime, contributeCompute } from '@/utils/index'

import { GroupItem, BattleInfo } from '@/types/analysis'

// ========== 生命周期和变量 ==========
const groupList = ref<GroupItem[]>()
const mapUrl = ref('')
const mapName = ref('')
const resultStatus = ref()
const startTime = ref(0)
const fullLoading = ref(false)
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
    } catch (error) {
      mapUrl.value = ''
      mapName.value = ''
      resultStatus.value = ''
    }
  }
}


const downloadDataToExcel = () => {
  // 后期优化：数据层数太多，不好判断是否有数据，需要增加一个判断
  let teamName = ''
  if (groupList.value && groupList.value.length > 0) {
    const data = groupList.value.map((group) => {
      let headerArr = ['昵称']
      let headerNum = 0
      let groupData = group.group.map((people) => {
        const historyObj = people.profile?.level_info?.history || []
        if (!teamName) {
          teamName = people.profile?.name || ''
        }
        if (historyObj.length) {
          let historyData = [people.name]

          for (let i=0; i<historyObj.length-1; i++) {
            let history = historyObj[i]
            if (headerNum <= i) {
              headerArr.push('进点时间', '所进关卡', '通关时间', '同步率')
            }
            headerNum++
            // 设置颜色
            historyData.push(
              formatTime(history.enter_time - startTime.value),
              levelLetter[history.level_id],
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
    // 名字
    let name = `${teamName}${mapName.value}团本数据`
    // 通过saveExcel
    window.ipcRenderer.send('saveExcel', data, name)
  }
}

onMounted(() => {
  const groupDataString = window.localStorage.getItem('groupData')
  if (groupDataString) {
    groupList.value = JSON.parse(groupDataString)
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
      margin-bottom: 10px;
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