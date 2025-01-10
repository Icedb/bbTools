<template>
  <div ref="chartRef" style="width: 100%; height: 600px"></div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch, defineProps, defineExpose, defineOptions } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import {
  TooltipComponent,
  LegendComponent,
  GraphicComponent,
  GridComponent,
  DataZoomComponent
} from 'echarts/components'
import { LabelLayout } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

// 设置组件名
defineOptions({
  name: 'TestChart'
})

// 定义 Props
const props = defineProps<{
  initOption?: Record<string, any>;
}>()

// 暴露函数给父组件调用
function downloadChart(picName: string) {
  if (!chart) return
  const base64 = chart.getDataURL({
    type: 'png',
    pixelRatio: 2,
    backgroundColor: '#fff'
  })
  const a = document.createElement('a')
  a.href = base64
  a.download = picName + '.png'
  a.click()
}

// 将 downloadChart 方法暴露出去
defineExpose({
  downloadChart
})

// 使用 ECharts
echarts.use([
  BarChart,
  LineChart,
  GraphicComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  LabelLayout,
  CanvasRenderer
])

const chartRef = ref<HTMLDivElement>()
// const chart = ref<echarts.ECharts | null>(null)
let chart: echarts.ECharts ;

// 监听窗口大小变化
const resizeHandler = () => {
  chart?.resize()
}

// 监听 props.initOption 变化，动态设置图表
watch(
  () => props.initOption,
  (val) => {
    if (val && chart) {
      chart.setOption(val, true)
    }
  }
)

// 初始化图表
onMounted(() => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  if (props.initOption) {
    chart.setOption(props.initOption)
  }
  window.addEventListener('resize', resizeHandler)
})

// 卸载前清理
onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeHandler)
  chart?.dispose()
})
</script>