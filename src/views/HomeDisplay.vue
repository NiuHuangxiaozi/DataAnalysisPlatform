<template>
  <!--
    云资源预测平台概览

    本组件基于 Vue 3 和 View UI Plus（即 iView 的 Vue 3 版）实现，
    用于展示云资源利用率的实时与预测信息。页面整体采用居中布局，
    使用简洁的配色和充足的留白。点击“确定”按钮后会根据用户
    选择请求后端数据（此处以模拟数据代替），然后刷新提示文案
    和折线图。
  -->
  <div class="page-container">
    <!-- 主标题 -->
    <h1>云资源预测平台概览</h1>

    <!-- 业务选择与操作区 -->
    <Row class="operation-row" align="middle" justify="start" gutter=16>
      <!-- 业务输入 -->
      <Col :span="8" class="form-item">
        <span class="label">业务选择：</span>
        <!-- clearable 表示的是拥有一键清除的功能 -->
        <Select
          v-model="selectedBusiness"
          placeholder="请选择业务"
          filterable
          clearable
          style="width: 100%;"
        >
        <Option v-for="item in businessOptions" :key="item" :value="item">
          {{ item }}
        </Option>
        </Select>
      </Col>
      <!-- 预测算法选择 -->
      <div>
        <Col :span="5" class="form-item">
          <span class="label">预测算法：</span>
          <Select
            v-model="selectedAlgorithm"
            placeholder="选择算法"
            style="width: 200px;"
          >
            <Option
              v-for="item in algorithms"
              :key="item.name"
              :value="item.name"
            >{{ item.name }}</Option>
          </Select>
        </Col>
      </div>
      <!-- 粒度选择 -->
      <div>
        <Col :span="4" class="form-item">
          <span class="label">粒度选择：</span>
          <Select
            v-model="selectedGranularity"
            placeholder="粒度选择"
            style="width: 100px;"
          >
            <Option
              v-for="item in granularities"
              :key="item.value"
              :value="item.value"
            >{{ item.label }}</Option>
          </Select>
        </Col>
      </div>
      <!-- 确认按钮 -->
      <Col :span="3" class="form-item">
        <Button type="default" @click="handleConfirm" long>确定</Button>
      </Col>
      <!-- 设置图标 -->
      <Col :span="1" class="form-item settings">
        <Button
          type="text"
          @click="handleSettings"
          style="padding: 0;"
        >
          <Icon type="ios-settings" :size="20" />
        </Button>
      </Col>
    </Row>

    <!-- 信息提示行 -->
    <div class="info-line">
      当前展示的业务为 <span class="highlight">{{ currentBusiness }}</span>
      的负载数据，并展示算法 <span class="highlight">{{ currentMethod }}</span>
      的预测分析与资源分配建议
    </div>

    <!-- 资源利用率图表区 -->
    <div class="chart-card">
      <div class="chart-title">资源利用率综合图</div>
      <!-- 图表容器 -->
      <div ref="chartRef" class="chart"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount  } from 'vue';
import { Row, Col, Select, Option, Button, Icon, Message } from 'view-ui-plus';
import * as echarts from 'echarts';
import {timeDataStore} from '../store/data'

const time_data_store = timeDataStore()
// 业务名称
const businessOptions = ref([])
const selectedBusiness = ref('');
// 预测算法
let algorithms = ref([]);
const selectedAlgorithm = ref('');

// 粒度选择
const selectedGranularity = ref('hour');
const granularities = [
  { value: 'H', label: '小时' },
  { value: 'D', label: '天' },
  { value: 'M', label: '月' }
];

// 当前业务名称用于文案展示
const currentBusiness = ref('');
const currentMethod = ref('')

// 引用 ECharts 实例的 DOM,就是给图表找一个位置
const chartRef = ref(null);
let chartInstance;



const Timestamps2TimeLabel = (time_stamp)=>{

  let time_date = new Date(time_stamp * 1000)
  const label = `${time_date.getFullYear()}/${time_date.getMonth() + 1}/${time_date.getDate()}/${time_date.getHours()}:00`
  return label
}
// 从后端的一堆东西中提取数据
function SelectUsefulData(time_series_entry){


    console.log(time_series_entry)
    // 统计序列长度
    let history_lengh = time_series_entry.data.prediction.series.length
    let prediction_length = time_series_entry.data.prediction.predict_series.DLinear.CPU.length
    console.log("prediction_length" ,prediction_length)
    let total_length = history_lengh + prediction_length

    // 定义数据结构
    const times = Array.from({ length: total_length }, () => '') // 时间数组：默认空字符串

    const cpu = Array.from({ length: total_length }, () => null) // CPU数组：默认0（数值类型）
  
    const memory = Array.from({ length: total_length }, () => null) // 内存数组：默认0

    const disk = Array.from({ length: total_length }, () => null) // 磁盘数组：默认0
    const cpuPred = Array.from({ length: total_length }, () => null) // CPU预测数组：默认0

    const memoryPred = Array.from({ length: total_length }, () => null) // 内存预测数组：默认0
    
    const diskPred = Array.from({ length: total_length }, () => null) // 磁盘预测数组：默认0

    // y刻度的范围
    let y_range = [0,100]


    let history_lists = time_series_entry.data.prediction.series
    let predict_lists = time_series_entry.data.prediction.predict_series

    // 加载历史序列
    let cpu_idx = 0 
    let disk_idx = 0
    let mem_idx = 0
    
    // cpu历史序列
    history_lists.CPU.forEach(element => {
        cpu[cpu_idx] = element[1]
        times[cpu_idx]=Timestamps2TimeLabel(element[0])
        cpu_idx = cpu_idx + 1
    });

    history_lists.DISK.forEach(element => {
        disk[disk_idx] = element[1]
        disk_idx = disk_idx + 1
    });

    history_lists.MEM.forEach(element => {
        memory[mem_idx] = element[1]
        mem_idx = mem_idx + 1
    })
    
    let cpu_pred_list;
    let disk_pred_list
    let mem_pred_list
    // 加载某一种算法的预测序列
    if(currentMethod.value == "DLinear"){
      console.log("算法转化为DLinear")
      cpu_pred_list = predict_lists.DLinear.CPU
      disk_pred_list = predict_lists.DLinear.DISK
      mem_pred_list = predict_lists.DLinear.MEM
    }
    else if (currentMethod.value == "MEMA"){
      console.log("算法转化为MEMA")

      cpu_pred_list = predict_lists.MEMA.CPU
      disk_pred_list = predict_lists.MEMA.DISK
      mem_pred_list = predict_lists.MEMA.MEM
    }

    // 为了保证预测数据和历史数据的衔接，这里我们的Pred后缀结尾的数组要保留一个历史真实数据
    cpuPred[cpu_idx-1] = history_lists.CPU[cpu_idx-1][1]
    diskPred[disk_idx-1] = history_lists.DISK[disk_idx-1][1]
    memoryPred[mem_idx-1] = history_lists.MEM[mem_idx-1][1]

    // 加载预测数据
    cpu_pred_list.forEach(element => {
      cpuPred[cpu_idx] = element[1]
      times[cpu_idx]=Timestamps2TimeLabel(element[0])
      cpu_idx = cpu_idx + 1
    })

    disk_pred_list.forEach(element =>{
      diskPred[disk_idx] = element[1]
      disk_idx = disk_idx + 1
    })

    mem_pred_list.forEach(element => {
      memoryPred[mem_idx] = element[1]
      mem_idx = mem_idx + 1
    })


    // 

    // 求出最大值和最小值
    let tmp_array = [...cpu.filter(v => v !== null && !Number.isNaN(v)),
                     ...disk.filter(v => v !== null && !Number.isNaN(v)),
                     ...memory.filter(v => v !== null && !Number.isNaN(v)),
                     ...cpuPred.filter(v => v !== null && !Number.isNaN(v)),
                     ...diskPred.filter(v => v !== null && !Number.isNaN(v)),
                     ...memoryPred.filter(v => v !== null && !Number.isNaN(v))]
    
    y_range[0]=Math.min(...tmp_array)
    y_range[1]=Math.max(...tmp_array)


    return { times, cpu, memory, disk, cpuPred, memoryPred, diskPred, y_range };
}

// chartOption 作为响应式对象
const chartOption = ref({});

// 初始化和刷新图表
// 如果你想要修改图表中的数据，你需要修改chartOption 这个ref对象
const initChart = () => {
  // 看一下图表的位置找好没
  if (!chartRef.value) return;

  // 如果chart实例没有创建就初始化表格
  if (!chartInstance) {
    //创建图表挂载图标
    chartInstance = echarts.init(chartRef.value);
  }
  // 如果图标已经找到了位置并且实例已经存在，那么就刷新数据
  console.log("更新表格")
  chartInstance.setOption(chartOption.value);
};


// 根据选择更新图表数据
const updateChart = async () => {

  console.log("selectedGranularity.value", selectedGranularity.value)
  console.log("currentBusiness.value", currentBusiness.value)
  try{
    const time_series = await time_data_store.get_bussiness_prediction(selectedGranularity.value, currentBusiness.value)
    console.log("selectedData ", time_series)
    time_data_store.selectedData.value = SelectUsefulData(time_series);
  }
  catch(e){
    console.error("更新主表格的时候出错",e)
  }

  chartOption.value = {
    color: [
      '#4CB4B6',
      '#007AFF',
      '#FF9900',
      '#A1D8D9',
      '#7FBFFF',
      '#FFD666'
    ],
    backgroundColor: '#fff',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      top: 10,
      left: 'center',
      data: [
        'CPU利用率(%)',
        '内存利用率(%)',
        '磁盘利用率(%)',
        'CPU利用率预测(%)',
        '内存利用率预测(%)',
        '磁盘利用率预测(%)'
      ],
      selectedMode: 'multiple',
      itemWidth: 12,
      itemHeight: 8,
      textStyle: {
        fontSize: 12,
        color: '#333'
      }
    },
    grid: {
      top: 80,
      left: '5%',
      right: '5%',
      bottom: 40,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: time_data_store.selectedData.value.times,
      axisLine: {
        lineStyle: {
          color: '#666',
          width: 1.5
        }
      },
      axisTick: {
        alignWithLabel: true,
        length: 6,
        lineStyle: {
          color: '#666'
        }
      },
      axisLabel: {
        color: '#333',
        fontSize: 12,
        interval: 'auto'
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '利用率',
      nameTextStyle: {
        color: '#333',
        fontSize: 13,
        padding: [0, 0, 0, 10]
      },
      min: time_data_store.selectedData.value.y_range[0],
      max: time_data_store.selectedData.value.y_range[1],
      interval: 10, // ✅ 设置合适的间隔，比如10%
      axisLine: {
        show: true,
        lineStyle: {
          color: '#666',
          width: 1.5
        }
      },
      axisTick: {
        show: true,
        length: 6,
        lineStyle: {
          color: '#666'
        }
      },
      axisLabel: {
        show: true, // ✅ 确保显示刻度文字
        color: '#333',
        fontSize: 12,
        formatter: function (value) {
            return value.toFixed(2) + '%';
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#e0e0e0',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: 'CPU利用率(%)',
        type: 'line',
        smooth: false,
        data: time_data_store.selectedData.value.cpu,
        symbolSize: 4
      },
      {
        name: '内存利用率(%)',
        type: 'line',
        smooth: false,
        data: time_data_store.selectedData.value.memory,
        symbolSize: 4
      },
      {
        name: '磁盘利用率(%)',
        type: 'line',
        smooth: false,
        data: time_data_store.selectedData.value.disk,
        symbolSize: 4
      },
      {
        name: 'CPU利用率预测(%)',
        type: 'line',
        smooth: false,
        data: time_data_store.selectedData.value.cpuPred,
        symbolSize: 4,
        lineStyle: { type: 'dashed' }
      },
      {
        name: '内存利用率预测(%)',
        type: 'line',
        smooth: false,
        data: time_data_store.selectedData.value.memoryPred,
        symbolSize: 4,
        lineStyle: { type: 'dashed' }
      },
      {
        name: '磁盘利用率预测(%)',
        type: 'line',
        smooth: false,
        data: time_data_store.selectedData.value.diskPred,
        symbolSize: 4,
        lineStyle: { type: 'dashed' }
      }
    ]
  };
  // 刷新图表
  initChart();
};

// 点击确认按钮后的操作
const handleConfirm = () => {
  // 触发后端请求，可根据 selectedBusiness 等参数向后端获取数据。
  // 此处以模拟数据代替请求。
  if (!selectedBusiness.value) {
    Message.warning('请输入要查询的业务名称');
    return;
  }
  // 更新文案中的机器编号，可根据具体业务返回的机器列表取值
  currentBusiness.value = selectedBusiness.value;
  currentMethod.value = selectedAlgorithm.value
  updateChart();
};

// 点击设置按钮，预留扩展
const handleSettings = () => {
  Message.info('打开设置面板（待实现）');
};


// 从后端拿到目前存在的业务
const updatebusinessOptions = async ()=>{
  try {

      const res = await time_data_store.get_business_list()
      businessOptions.value = res.data.available_business || []

  } catch (e) {
      console.error('获取业务数据失败:', e)
  }
}
const update_model_choice = async () => {
  try{
    const methodlist = await time_data_store.get_methods()
    algorithms.value = methodlist.data.available_models

  }
  catch(e){
    console.error("获取预测方法失败",e)
  }
}
// 在组件挂载时初始化默认数据
onMounted(() => {
  updatebusinessOptions();
  update_model_choice();

  // 初始化的时候默认选择一个情况
  console.log("businessOptions")
  console.log(businessOptions.value)

  currentBusiness.value = "营销管理系统";
  currentMethod.value = "MEMA"
  selectedGranularity.value = 'H'

  updateChart();


  // 防止缩放页面
  const handleWheel = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  };
  window.addEventListener('wheel', handleWheel, { passive: false });

  onBeforeUnmount(() => {
    window.removeEventListener('wheel', handleWheel);
  });
});

// // 当粒度选择变化时自动刷新数据
// watch(selectedGranularity, () => {
//   updateChart();
// });


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
  display: flex;
  justify-content: space-between;
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
  width: 150%;
  max-width: 1200px;
  border: 1px solid #e0e0e0;
  border-radius: 1px;
  background-color: #fff;
  padding: 5px;
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
}
</style>