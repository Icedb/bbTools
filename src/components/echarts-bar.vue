<template>
  <div ref="chartRef" style="width: 100%; height: 600px"></div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, ref, watch } from "vue";
import * as echarts from "echarts/core";
import { BarChart, LineChart } from "echarts/charts";
import {
  TooltipComponent,
  LegendComponent,
  GraphicComponent,
  GridComponent,
  DataZoomComponent,
} from "echarts/components";
import { LabelLayout } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";

export default defineComponent({
  name: "TestChart",
  props: {
    initOption: {
      type: Object
    }
  },
  setup(props) {
    const chartRef = ref<HTMLDivElement>();
    let chart: echarts.ECharts ;
    echarts.use([
      BarChart,
      LineChart,
      GraphicComponent,
      TooltipComponent,
      LegendComponent,
      GridComponent,
      DataZoomComponent,
      LabelLayout,
      CanvasRenderer,
    ]);

    // const { initOption } = useChartData();

    const resizeHandler = () => {
      chart?.resize();
    };


    watch(() => props.initOption,(count, prevCount) => {
      // console.log('watch----')
      if (count) {
        chart.setOption(count,true);

      }

    });
    let op = <any>props.initOption
    onMounted(() => {
      // 初始化
      // console.log('onMounted')
      chart = echarts.init(chartRef.value as HTMLDivElement);
      if (op) {
        chart.setOption(op);
      }

      window.addEventListener("resize", resizeHandler);

      // console.log(chartRef.value)
      // console.log(props.initOption)
      // chart = echarts.init(chartRef.value as HTMLDivElement);

      // window.addEventListener("resize", resizeHandler);
    });
    

    onBeforeUnmount(() => {
      window.removeEventListener("resize", resizeHandler);
      chart?.dispose();
    });

    return {
      chartRef,
    };
  },
});
</script>
