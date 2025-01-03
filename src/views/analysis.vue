<template>
  <el-scrollbar >
    <div class="analysis-box">
      <el-row align="middle" justify="space-between">
        <el-col :lg="10" :xs="24">
          <div class="map-box">
            <p class="map-name">{{mapName}} 
              <span v-if="resultStatus == 1">胜利</span>
              <span v-else class="fail">失败</span>
            </p>
            <div class="square">
              <p>{{redSquare}}</p>
              <p>{{blueSquare}}</p>
            </div>
            <img :src="mapUrl" alt="团战地图" style="width:100%;" v-show="mapUrl">
          </div>
        </el-col>
        <el-col :lg="13" :xs="24" >
          <el-tabs type="border-card">
            <el-tab-pane :label="item.groupName" :name="gIndex" v-for="(item,gIndex) in groupList" :key="gIndex" v-if="groupList && groupList.length > 0">
              <el-tabs tab-position="left" style="height: 350px;" v-if="item.group && item.group.length > 0" :stretch='false'>
                <el-tab-pane  v-for="(people,pIndex) in item.group" :key="pIndex">
                  <template #label>
                    <p v-if="people" class="fixed-width">{{people.name}}</p>
                    <el-tooltip
                      v-else
                      class="box-item"
                      effect="light"
                      content="此位置有成员但未获取数据"
                      placement="top"
                    >
                      <p class="fixed-width">成员占位 <el-icon><question-filled /></el-icon></p>
                    </el-tooltip>
                  </template>
                  <el-scrollbar height="350px">
                    <p v-for="(battle,bIndex) in people.battle_info.history" v-if="people && people.battle_info && people.battle_info.history.length > 0">
                      在{{formatTime(battle.enter_time - startTime)}}进入了{{letter[battle.level_id]}}点，通关时间{{battle.pass_time}}秒，贡献了{{battle.contribute_rate}}%同步率
                    </p>
                    <p v-else-if="people && people.battle_info && people.battle_info.history.length < 1">暂无参团数据或数据报错</p>

                    <p v-else>{{people && people.message ? `请求报错：${people.message}` : '暂无数据'}}</p>
                  </el-scrollbar>
                </el-tab-pane>
              </el-tabs>
              <el-empty description="暂无本分组数据" v-else style="height:350px;" />
            </el-tab-pane>
            <el-empty description="请前往数据管理添加用户数据" v-else style="height:350px;" />
          </el-tabs>
        </el-col>
      </el-row>
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <div class="chart-box">
              <span class="chart-name">{{chartOptions[nowCharts]['name']}}</span>
              <span class="chart-desc">{{chartOptions[nowCharts]['desc']}}</span>
            </div>
              <el-select v-model="nowCharts" class="m-2" placeholder="请选择图表" size="large" @change='showChart'>
                <el-option
                  v-for="(item,index) in chartOptions"
                  :key="index"
                  :label="item.name"
                  :value="index"
                />
              </el-select>
          </div>
        </template>
          <el-tabs type="border-card" @tab-click="tabClick">
            <el-tab-pane :label="item.groupName" :name="gIndex" v-for="(item,gIndex) in groupList" :key="gIndex">
            </el-tab-pane>
            <testChart :initOption="option" v-if="groupList && groupList.length > 0"></testChart>
            <el-empty description="请前往数据管理添加用户数据" v-else style="height:350px;" />
          </el-tabs>
      </el-card>
    </div>
  </el-scrollbar>

  <div class="fixed-bug" @click="solveTimeBug">起始</div>

</template>

<script lang='ts'>
import { onMounted, ref } from "vue";
import { QuestionFilled } from "@element-plus/icons-vue";
import  testChart  from "../components/echarts-bar.vue";
import { ElMessageBox } from 'element-plus'

export default {
  components: { 
    testChart,
    QuestionFilled
  },
  setup() {
    onMounted(() => {
      // 获取缓存值
      let groupData = <any>window.localStorage.getItem('groupData')
      // console.log(groupData)
      if (groupData) {
        groupList.value = JSON.parse(groupData)
      }
      if (groupList.value && groupList.value.length > 0) {
        // 视图加载
        showChart()
      }
    })
    // 工具

    // 引入初始时间，用来对抗官方数据初始时间过长问题
    const startTime = ref(0)


    const formatTime = function (times:number) {
      // if (times > 20*60 && startTime < 1) {
      //   startTime = times - times%60
      // }
      let m = Math.floor(times/60)
      let s = times%60
      return m + '分' + s + '秒'
    }

    // 变量
    const mapUrl = ref('')
    const mapName = ref('')
    const resultStatus = ref('')
    const redSquare = ref('')
    const blueSquare = ref('')
    const option =  ref();
    const letter:any = {
          1401: "A",
          1402: "B",
          1403: "C",
          1404: "D",
          1405: "E",
          1406: "F",
          1407: "G",
          1408: "H",
          1409: "I",
          1411: "A",
          1412: "B",
          1413: "C",
          1414: "D",
          1415: "E",
          1416: "F",
          1417: "G",
          1418: "H",
          1419: "I",
          1420: "J",
          1421: "K",
          1422: "A",
          1423: "B",
          1424: "C",
          1425: "D",
          1426: "E",
          1427: "F",
          1428: "G",
          1429: "A",
          1430: "B",
          1431: "C",
          1432: "D",
          1433: "E",
          1434: "F",
          1435: "G",
          1436: "H",
          1437: "A",
          1438: "B",
          1439: "C",
          1440: "D",
          1441: "E",
          1442: "F",
          1443: "G",
          1444: "H",
          1445: "I",
          1446: "A",
          1447: "B",
          1448: "C",
          1449: "D",
          1450: "E",
          1451: "F",
          1452: "G",
          1453: "H",
          1454: "I",
          1455: "J"
      }
    const groupList = ref()




    // 图表与介绍
    const chartOptions = ref({
      'bar': {
        name: '柱状图',
        desc: 'X轴为小队成员；Y轴为所用总时间；可以清晰查看成员贡献效率（总参与时间为估算值，米游社数据上，中途退出算0时间）'
      },
      'line': {
        name: '折线图',
        desc: 'X轴为进点时间；Y轴为进攻点位；通过小队成员间折线图对比可以清晰看出谁打错了'
      }
    })
    // 当前选择查看的分队
    let nowTabs = 0;
    // 当前选择的图表
    const nowCharts = ref('line')


    // 解决时间bug
    let regPos = /^[0-9]+.?[0-9]*/
    const solveTimeBug = function () {
      ElMessageBox.prompt('解决官方时间超长bug，这里输入初始时间（单位：分钟）。详见：帮助-常见问题-5', '解决官方时间超长问题', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
      }).then(({ value }) => {
          // 添加分组
          if (value && regPos.test(value)) {
            startTime.value = Number(value) * 60;
            showChart()
          }
        })
        .catch(() => {
          // ElMessage({
          //   type: 'info',
          //   message: 'Input canceled',
          // })
        })
    }


    // 图表设置

    // 控制图表距离上下左右边距的
    const chartGrid = {
      left: '5%',
      right: '5%',
      top: 100,
      bottom: 100
    }

    // 柱状图提示框
    const barTooltip = {
      formatter: function (params:any, ticket:any, callback:any) {
          // console.log(params);
          // console.log(ticket)
        if (!params.data) {
          return ''
        }
        if (params.data.message) {
          return params.data.message
          } else {
          return `用时${params.data.pass_time}秒 攻占${params.name}点，获得${params.data.contribute_rate}% 同调率`
        }
      }
    }

    // 折线图提示框
    const lineTooltip = {
      trigger: 'axis',
      formatter: function (params:any, ticket:any, callback:any) {
          // console.log(params);
          // console.log(ticket)
        let text = ''
        for (let i in params) {
          if (!params[i].data) {
            return ''
          }
          text += text ? '' : `<p>${formatTime(params[i].axisValue)}</p>`;
          if (params[i].data.message) {
            text += params[i].data.message
            } else {
            text += `<p style="color: ${params[i].color}">${params[i].seriesName}：用时${params[i].data.pass_time}秒 攻占${params[i].name}点，获得${params[i].data.contribute_rate}% 同调率</p>`
          }
        }
        // console.log(text)
        return text
      }
    }
    // 水印
    const graphic = [{
      type: 'group',
      // rotation: Math.PI / 4,
      bounding: 'raw',
      left: 200,
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
    // 背景颜色
    const barColor:any = {
      'A': "#5470c6",
      'B': "#91cc75",
      'C': "#fac858",
      'D': "#ee6666",
      'E': "#73c0de",
      'F': "#3ba272",
      'G': "#fc8452",
      'H': "#9a60b4",
      'I': "#ea7ccc",

    }

    // 方法
    // 图表显示
    const showChart = function () {
      let barData

      switch (nowCharts.value) {
        case 'bar':
          barData = showBarChart(groupList.value[nowTabs])
          break;
        case 'line':
          barData = showLineChart(groupList.value[nowTabs])
          break;
        default:
          break;
      }
      // 赋予charts
      option.value = barData
    }
    // 修改状态，切换图表
    const tabClick = function (tab: any) {
      // console.log(tab.props.name)
      nowTabs = tab.props.name

      showChart()
    }
    // 格式化数据为折线图数据
    const showLineChart = function (res:any) {

      // 所需要的数据格式如下：
      // let lineData = {
      //   xAxis: {
      //       type: 'value',
      //       boundaryGap: false
      //   },
      //   yAxis: {
      //       type: 'value',
      //       boundaryGap: false,
      //       splitLine: {
      //         show: true
      //       },
      //       axisLabel: {
      //         formatter: function (value:string, index:number) {
      //           let data = ['A','B','C','D','E','F','G','H','I']
      //           return data[index]
      //             // 格式化成月/日，只在第一个刻度显示年份
      //             // var date = new Date(value);
      //             // var texts = [(date.getMonth() + 1), date.getDate()];
      //             // if (index === 0) {
      //             //     texts.unshift(date.getYear());
      //             // }
      //             // return texts.join('/');
      //         }
      //       }
      //   },
      //   series: [{
      //       data: [
      //         [25,2],
      //         [56,5],
      //         [78,1],
      //         [99,4],
      //         [120,2],
      //       ],
      //       type: 'line'
      //   }]
      // }

      let lineData = {
        backgroundColor: "#fff",
        grid: chartGrid,
        legend: {
            data: <any>[],
            top: "4%",
            textStyle: {
                color: "#1FC3CE",
                fontSize: 14
            },
            selected: {'昨日使用率': false} // 不需要显示的设置为false
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
              // interval: 0,
              formatter: function (value:number, index:number) {
                let data = ['','A','B','C','D','E','F','G','H','I','J','K']
                return data[value]
              }
            }
        },
        series: <any>[],
        graphic: graphic
      }

      // 遍历数据，把每一个成员的数据放在 series 的 data 内
      // console.log(res)
      for (let i in res['group']) {
        let peopleData = res['group'][i]
        // 遍历 
        let line = []
        lineData['legend']['data'][i] = peopleData['name']
        if (peopleData['battle_info'] && peopleData['battle_info']['history'] && peopleData['battle_info']['history'].length > 0) {
          // 这里表述 肯定有数据，获取团战地图
          if (!mapUrl.value) {
            try {
              mapUrl.value = peopleData['battle_info']['map_figure_url']
              mapName.value = peopleData['battle_info']['map_name']
              resultStatus.value = peopleData['battle_info']['status']
              redSquare.value = peopleData['battle_info']['name1']
              blueSquare.value = peopleData['battle_info']['name2']
            } catch (error) {
              // console.log(error)
              mapUrl.value = ''
              mapName.value = ''
              resultStatus.value =  ''
              redSquare.value = ''
              blueSquare.value = ''
            }
          }
          
          for (let j in peopleData['battle_info']['history']) {
            let historyData = peopleData['battle_info']['history'][j]
            let level_id = letter[historyData['level_id']]
            line.push({
              name: level_id,
              value: [(historyData['enter_time'] - startTime.value),level_id.charCodeAt()-64],
              contribute_rate: historyData['contribute_rate'],
              enter_time: historyData['enter_time'] - startTime.value,
              pass_time: historyData['pass_time']
            })
          }
        }


        lineData['series'][i] = {
          name: peopleData['name'],
          type: 'line',
          // stack: '总量',
          data: line
        }
      }
      // console.log(lineData)

      return lineData  
    }


    // 格式化数据为柱状图数据
    const showBarChart = function (res:any) {
      // 根据获取的数据处理成能用情况
      let labelOption = {
        show: true,
        // rotate: 90,
        formatter: function (params:any) {
          // console.log(params)
          if (params.data.message) {
            // console.log(1212)
            return `{message|错误...}`
            } else {
            return `${params.data.pass_time}秒 ${params.name}点`
          }
        },
        // formatter: '{c}秒 {b}',
        fontSize: 10,
        rich: {
          message: {
            fontSize: 12,
          }
        }
      };


      // 问题：TS不应该大量使用any,后期需要改
      let groupData = {
        backgroundColor: "#fff",
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
          data:<any> []
        },
        yAxis: {
          // type: 'time',
          name: '总参与时间（单位：秒）'
        },
        tooltip: barTooltip,
        series:<any> [],
        graphic: graphic
      }
      // 分组
      // groupData[group] = barData
      let groups = res['group']
      // console.log(groupData)
      // console.log(group)
      for (let people:number=0;people<groups.length;people++) {
        // 单人
        // console.log(groupData[group])
        // console.log(group)
        // console.log(people)
        if (!groups[people]) {
          groupData['xAxis']['data'].push('成员占位')
          continue;
        }
        groupData['xAxis']['data'].push(groups[people]['name'])

        if (groups[people]['battle_info'] && groups[people]['battle_info']['history'] && groups[people]['battle_info']['history'].length > 0) {
          let history = groups[people]['battle_info']['history']
          // 这里表述 肯定有数据，获取团战地图
          if (!mapUrl.value) {
            try {
              mapUrl.value = groups[people]['battle_info']['map_figure_url']
              mapName.value = groups[people]['battle_info']['map_name']
              resultStatus.value = groups[people]['battle_info']['status']
              redSquare.value = groups[people]['battle_info']['name1']
              blueSquare.value = groups[people]['battle_info']['name2']
            } catch (error) {
              console.log(error)
              mapUrl.value = ''
              mapName.value = ''
              resultStatus.value = ''
              redSquare.value = ''
              blueSquare.value = ''
            }
          }
          for (let info:number=0;info<history.length;info++) {
            
            let level_id = letter[history[info]['level_id']]

            // 加一个数据：数据为用户初始时间值
            // console.log(level_id)
            // console.log(barColor[level_id])
            // console.log('======================')
            if (!groupData['series'][info]) {
              groupData['series'][info] = {
                data: [],
                type: 'bar',
                barGap: '20%',
                label: labelOption,
                barMinHeight: 10,
                itemStyle:{
                  // 每个点位不同颜色标注
                  color:function (params:any) {
                    return barColor[params.name]
                  },
                  borderType: 'solid',
                  borderColor: '#fff'
                },
                stack: 'x'
              }
            }
            // 每条数据
            // console.log(groupData)
            // console.log(people)
            // 第一条数据为首次开始起始时间

              groupData['series'][info]['data'][people] = {
                name: level_id,
                value: history[info + 1] ? history[info + 1]['enter_time']-history[info]['enter_time'] : 30,
                contribute_rate: history[info]['contribute_rate'],
                enter_time: history[info]['enter_time'] - startTime.value,
                pass_time: history[info]['pass_time']
              }

          }
        } else {
          // console.log('我报错啦，救我')
          // console.log(groupData)
          // console.log(group)
          // console.log(people)

          if (!groupData['series'][people]) {
            groupData['series'][people] = {
              data: [],
              type: 'bar',
              barGap: '20%',
              label: labelOption,
              itemStyle:{
                // 每个点位不同颜色标注
                color:function (params:any) {
                  return barColor[params.name]
                },
                borderType: 'solid',
                borderColor: '#fff'
              },
              stack: 'x'
            }
          }
          groupData['series'][0]['data'][people] = {
            value: 30,
            message: groups[people]['message'] ? `请求报错：${groups[people]['message']}` : '暂无参团数据或数据报错'
          } 
          //  groupData[group]['series'][info]['data'][people]
          // console.log(groupData[group]['series'])
          // groupData[group]['series'][people]['data'] = []
        }
      }
      // console.log(seriesData)
      // console.log(barData)
      // console.dir(groupData)

      return groupData
      // option.value = groupData[0]
      // return {
      //   uid: userObj.uid,
      //   name: userObj.name,
      //   battle_info: res.data.profile.battle_info.history[0]
      // }
    }


    return {
      startTime,
      solveTimeBug,
      tabClick,
      showChart,
      nowCharts,
      chartOptions,
      letter,
      groupList,
      // serverList,
      formatTime,
      mapUrl,
      mapName,
      resultStatus,
      redSquare,
      blueSquare,
      option
    }
  }
}
</script>

<style lang='scss' scoped>

.analysis-box{
  // padding: torem(20) torem(50) torem(10);
}
.map-box{
  width: 100%;
  .map-name{
    width: 100%;
    font-size: 28px;
    font-weight: 700;
    text-align: center;
    margin-bottom: 10px;
    span{
      color: #edb646;
      &.fail{
        color: #b4b1b0;
      }
    }
  }
  .square{
    display: flex;
    align-items: center;
    font-size: 20px;
    justify-content: space-between;
  }
}
.box-card{
  margin-top: 50px;
  .card-header{
    display: flex;
    align-items: center;
    justify-content: space-between;
    .chart-box{
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .chart-name{
        font-size: 26px;
        font-weight: 700;
      }
      .chart-desc{
        font-size: 16px;
      }
    }
  }
}
.fixed-bug{
  position: fixed;
  bottom: 160px;
  right: 60px;
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background: #edb646;
  line-height: 60px;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
}
</style>