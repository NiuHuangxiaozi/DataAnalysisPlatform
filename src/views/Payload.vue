<template>
    


    <HomeDisplay />

    <!-- 下面展示三个小的图表 -->
      <div class="charts-page p-4">
        <Row :gutter="20">
          <Col span="8" v-for="(config, index) in chartConfigs" :key="index">
            <Card dis-hover>
              <h4 class="mb-2">{{ config.title }}</h4>
              <div class="chart-wrapper">
                <canvas :id="config.id"></canvas>
              </div>
              <Divider />
              <Alert type="success" show-icon>
                {{ statusMap[config.id] }}
              </Alert>
            </Card>
          </Col>
        </Row>
      </div>
      <!-- 资源分配建议 -->
      
      
      <!-- 算法模型展示 -->
      <Algorithm />
</template>

<script setup>
import { ref, computed, onMounted, watch, reactive } from 'vue';
import { Row, Col, Input, Select, Option, Button, Icon, Message } from 'view-ui-plus';
import * as echarts from 'echarts';
import Chart from 'chart.js/auto'
import HomeDisplay from "./HomeDisplay.vue";
import Algorithm  from '../components/Algorithm.vue';

import {timeDataStore} from '../store/data'
const time_data_store = timeDataStore()


// 从全局存储中拿时间序列的数据
const time_series_data = time_data_store.selectedData


const chart_instances = ref({})
const chartConfigs = [
  { 
  id: 'cpu-chart',
  title: 'CPU利用率预测与检测',
  label: 'CPU利用率(%)',
  color: 'rgba(75, 192, 192, 1)',
  predictedColor: 'rgba(255, 99, 132, 1)',
  y_min:0,
  y_max:100
  },
  { 
    id: 'mem-chart',
    title: '内存利用率预测与检测',
    label: '内存利用率(%)',
    color: 'rgba(54, 162, 235, 1)',
    predictedColor: 'rgba(255, 159, 64, 1)',
    y_min:0,
    y_max:100
  },
  { 
    id: 'disk-chart',
    title: '磁盘利用率预测与检测',
    label: '磁盘利用率(%)',
    color: 'rgba(255, 206, 86, 1)',
    predictedColor: 'rgba(153, 102, 255, 1)',
    y_min:0,
    y_max:100
  }
]


const statusMap = reactive({
  'cpu-chart': '异常检测结果：当前CPU资源无异常',
  'mem-chart': '异常检测结果：当前内存资源无异常',
  'disk-chart': '异常检测结果：当前磁盘资源无异常',
})


// 模拟数据
const timeLabels = ref([])

const datasets = ref({
  'cpu-chart': { 
          real: null,
          pred: null,
          y_min: null,
          y_max: null
        },
  'mem-chart': { 
          real: null,
          pred: null,
          y_min: null,
          y_max: null
         },
  'disk-chart': {
          real: null,
          pred: null,
          y_min: null,
          y_max: null
         },
})



function update_each_table(){
  
  timeLabels.value = time_series_data.value.times
   // 向datasets里面填充数据
  datasets.value['cpu-chart'].real = time_series_data.value.cpu
  datasets.value['cpu-chart'].pred = time_series_data.value.cpuPred
  datasets.value['cpu-chart'].y_min = Math.min([...time_series_data.value.cpu.filter(v => v !== null && !Number.isNaN(v)),
                                                ...time_series_data.value.cpuPred.filter(v => v !== null && !Number.isNaN(v))])
  datasets.value['cpu-chart'].y_max = Math.max([...time_series_data.value.cpu.filter(v => v !== null && !Number.isNaN(v)),
                                                ...time_series_data.value.cpuPred.filter(v => v !== null && !Number.isNaN(v))])

  datasets.value['mem-chart'].real = time_series_data.value.memory
  datasets.value['mem-chart'].pred = time_series_data.value.memoryPred
  datasets.value['mem-chart'].y_min = Math.min([...time_series_data.value.memory.filter(v => v !== null && !Number.isNaN(v)),
                                                ...time_series_data.value.memoryPred.filter(v => v !== null && !Number.isNaN(v))])
  datasets.value['mem-chart'].y_max = Math.max([...time_series_data.value.memory.filter(v => v !== null && !Number.isNaN(v)),
                                                ...time_series_data.value.memoryPred.filter(v => v !== null && !Number.isNaN(v))])

  datasets.value['disk-chart'].real = time_series_data.value.disk
  datasets.value['disk-chart'].pred = time_series_data.value.diskPred
  datasets.value['disk-chart'].y_min = Math.min([...time_series_data.value.disk.filter(v => v !== null && !Number.isNaN(v)),
                                                ...time_series_data.value.diskPred.filter(v => v !== null && !Number.isNaN(v))])
  datasets.value['disk-chart'].y_max = Math.max([...time_series_data.value.disk.filter(v => v !== null && !Number.isNaN(v)),
                                                ...time_series_data.value.diskPred.filter(v => v !== null && !Number.isNaN(v))])

  


  // 重新渲染表格
  chartConfigs.forEach(cfg => {

    // 拿到画布
    const ctx = document.getElementById(cfg.id).getContext('2d')
    
    // 在画布上面画画

    if(chart_instances.value[cfg.id]){
       chart_instances.value[cfg.id].destroy();
    }
    chart_instances.value[cfg.id] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: timeLabels.value,
        datasets: [
          {
            label: "历史"+cfg.label,
            data: datasets.value[cfg.id].real,
            borderColor: cfg.color,
            fill: true,
            tension: 0.1
          },
          {
            label: "未来"+cfg.label,
            data: datasets.value[cfg.id].pred,
            borderColor: cfg.predictedColor,
            fill: true,
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: '时间' } },
          y: { title: { display: true, text: '利用率(%)' }, min: datasets.value[cfg.id].y_min, max: datasets.value[cfg.id].y_max }
        }
      }
    })
  })

}

// 监听 time_series_data
watch(
  () => time_series_data.value,
  (newVal, oldVal) => {
    console.log('深层变动', newVal, oldVal);

    // 数据变动,重新渲染小图标和算法输入和输出

    // 更新小图表
    update_each_table()

  },
  { deep: true }
);


onMounted(() => {
  
  // // 初始化各个资源利用率图表
  // chartConfigs.forEach(cfg => {
  //   const ctx = document.getElementById(cfg.id).getContext('2d')
  //   new Chart(ctx, {
  //     type: 'line',
  //     data: {
  //       labels: timeLabels,
  //       datasets: [
  //         {
  //         label: cfg.label,
  //         data: datasets[cfg.id].real,
  //         borderColor: cfg.color,
  //         fill: false,
  //         tension: 0.1
  //         }
  //       ]
  //     },
  //     options: {
  //       responsive: true,
  //       maintainAspectRatio: false,
  //       scales: {
  //         x: { title: { display: true, text: '时间' } },
  //         y: { title: { display: true, text: '利用率(%)' }, min: 0, max: 100 }
  //       }
  //     }
  //   })
  // })

  
  })
</script>

<style scoped>
/* 全局字体和背景 */
.page-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  padding: 40px 20px;
  background-color: #fff;
  color: #4a4a4a;
  box-sizing: border-box;
}

h1 {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 24px;
  text-align: center;
}

.operation-row {
  width: 100%;
  max-width: 1000px;
  margin-bottom: 16px;
}

.form-item {
  display: flex;
  align-items: center;
}

.label {
  margin-right: 8px;
  color: #888;
  font-size: 14px;
  white-space: nowrap;
}

.settings {
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-line {
  width: 100%;
  max-width: 1000px;
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}

.info-line .highlight {
  color: #333;
  font-weight: bold;
}

.chart-card {
  width: 100%;
  max-width: 1000px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #fff;
  padding: 20px;
  box-sizing: border-box;
}

.chart-title {
  text-align: center;
  font-weight: bold;
  font-size: 18px;
  color: #333;
  margin-bottom: 10px;
}

.chart {
  width: 100%;
  height: 400px;

.charts-page {
background: #f9f9f9;
}
.chart-wrapper {
width: 100%;
height: 250px;
}
h4 {
font-weight: 600;
margin-bottom: 10px;
}
}
</style>