<template>
    <div ref="chartRef" style="width: 100%; height: 400px;"></div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue'
  import * as echarts from 'echarts'
  
  // 假设后端数据 props 或者通过 API 获取
  const dataA = ref([
    { timestamp: new Date('2025-11-12T10:00:00Z').getTime(), value: 100 },
    { timestamp: new Date('2025-11-12T10:30:00Z').getTime(), value: 110 },
    { timestamp: new Date('2025-11-12T11:00:00Z').getTime(), value: 105 },
    { timestamp: new Date('2025-11-12T11:30:00Z').getTime(), value: 115 }
    ])

    const dataB = ref([
    { timestamp: new Date('2025-11-12T10:20:00Z').getTime(), value: 200 },
    { timestamp: new Date('2025-11-12T10:50:00Z').getTime(), value: 210 },
    { timestamp: new Date('2025-11-12T11:10:00Z').getTime(), value: 205 },
    { timestamp: new Date('2025-11-12T11:40:00Z').getTime(), value: 215 }
    ])

    const dataC = ref([
    { timestamp: new Date('2025-11-12T10:10:00Z').getTime(), value: 300 },
    { timestamp: new Date('2025-11-12T10:40:00Z').getTime(), value: 310 },
    { timestamp: new Date('2025-11-12T11:20:00Z').getTime(), value: 305 },
    { timestamp: new Date('2025-11-12T11:50:00Z').getTime(), value: 315 }
    ])
  
  const chartRef = ref(null)
  let chartInstance = null
  
  // 将后端数据转换为 [时间, 值] 格式
  function convertSeries(raw) {
    return raw.map(item => {
      return [item.timestamp, item.value]
    })
  }
  
  onMounted(() => {
    chartInstance = echarts.init(chartRef.value)
  
    const option = {
      tooltip: {
        trigger: 'axis',
        // 可选：显示每条 series 的值
      },
      legend: {
        data: ['A','B','C']
      },
      xAxis: {
        type: 'time',
        axisLabel: {
          formatter: value => {
            const date = new Date(value)
            const hh = String(date.getHours()).padStart(2,'0')
            const mm = String(date.getMinutes()).padStart(2,'0')
            return hh + ':' + mm
          }
        },
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'A',
          type: 'line',
          data: convertSeries(dataA.value)
        },
        {
          name: 'B',
          type: 'line',
          data: convertSeries(dataB.value)
        },
        {
          name: 'C',
          type: 'line',
          data: convertSeries(dataC.value)
        }
      ]
    }
  
    chartInstance.setOption(option)
  })
  
  // 如果 dataA/dataB/dataC 是异步获取的，监听变化
  watch([dataA, dataB, dataC], () => {
    if (chartInstance) {
      chartInstance.setOption({
        series: [
          { name:'A', data: convertSeries(dataA.value) },
          { name:'B', data: convertSeries(dataB.value) },
          { name:'C', data: convertSeries(dataC.value) },
        ]
      })
    }
  })
  </script>
  