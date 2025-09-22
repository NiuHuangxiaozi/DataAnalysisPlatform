<template>
  <div class="prediction-container">
    <!-- 标题 -->
    <Card dis-hover :bordered="false" style="margin-bottom: 20px;">
      <h2 style="text-align: center; margin: 0; color: #2d8cf0;">业务应用数据预测</h2>
    </Card>

    <!-- 控制面板 -->
    <Card dis-hover :bordered="false" style="margin-bottom: 20px;">
      <Row :gutter="16" type="flex" justify="center" align="middle">
        <Col :xs="24" :sm="6" style="margin-bottom: 10px;">
          <Space>
            <span style="white-space: nowrap;">业务选择：</span>
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
          </Space>
        </Col>

        <Col :xs="24" :sm="6" style="margin-bottom: 10px;">
          <Space>
            <span style="white-space: nowrap;">应用选择：</span>
              <Select
                v-model="selectedApp"
                placeholder="请选择应用"
                filterable
                clearable
                style="width: 100%;"
              >
                <Option v-for="item in appOptions" :key="item" :value="item">
                  {{ item }}
                </Option>
              </Select>
          </Space>
        </Col>

        <Col :xs="24" :sm="6" style="margin-bottom: 10px;">
          <Space>
            <span style="white-space: nowrap;">模型选择：</span>
            
            <Select
            v-model="selectedAlgorithm"
            placeholder="选择算法"
            style="width: 100px;"
          >
            <Option
              v-for="item in algorithms"
              :key="item.name"
              :value="item.name"
            >{{ item.name }}</Option>
          </Select>
          
          
          </Space>
        </Col>
        
        <Col :xs="24" :sm="6" style="margin-bottom: 10px;">
          <Space>
            <span style="white-space: nowrap;">视图选择：</span>
            <Select v-model="selectedTime" style="width: 120px;">
              <Option value="H">小时</Option>
              <Option value="D">天</Option>
              <Option value="M">月</Option>
            </Select>
          </Space>
        </Col>
        
        <Col :xs="24" :sm="4" style="margin-bottom: 10px;">
          <Button type="primary" @click="handleConfirm" icon="md-checkmark">
            确定
          </Button>
        </Col>
      </Row>
    </Card>

    <!-- 信息提示 -->
    <Alert type="info" show-icon style="margin-bottom: 20px;">
      当前展示业务为<strong>{{ selectedBusiness }}</strong>的负载数据，并展示算法<strong>{{ selectedAlgorithm }}</strong>的预测分析与资源分配建议
    </Alert>

    <!-- 图表网格 -->
    <Row :gutter="16">
      <Col :xs="24" :md="12" style="margin-bottom: 16px;">
        <Card dis-hover>
          <template #title>
            <Icon type="ios-timer-outline" /> 平均响应时间预测与检测
          </template>
          <div ref="responseTimeChart" class="chart-container"></div>
          <Alert type="success" show-icon :closable="false" style="margin-top: 10px;">
            异常检测结果：当前响应时间无异常
          </Alert>
        </Card>
      </Col>

      <Col :xs="24" :md="12" style="margin-bottom: 16px;">
        <Card dis-hover>
          <template #title>
            <Icon type="ios-analytics-outline" /> apdex预测与检测
          </template>
          <div ref="memChart" class="chart-container"></div>
          <Alert type="success" show-icon :closable="false" style="margin-top: 10px;">
            异常检测结果：当前apdex无异常
          </Alert>
        </Card>
      </Col>

      <Col :xs="24" :md="12" style="margin-bottom: 16px;">
        <Card dis-hover>
          <template #title>
            <Icon type="ios-close-circle-outline" /> 当前错误率预测与检测
          </template>
          <div ref="diskChart" class="chart-container"></div>
          <Alert type="success" show-icon :closable="false" style="margin-top: 10px;">
            异常检测结果：当前错误率为正常状态
          </Alert>
        </Card>
      </Col>

      <Col :xs="24" :md="12" style="margin-bottom: 16px;">
        <Card dis-hover>
          <template #title>
            <Icon type="ios-pulse" /> 吞吐量预测与检测
          </template>
          <div ref="networkChart" class="chart-container"></div>
          <Alert type="success" show-icon :closable="false" style="margin-top: 10px;">
            异常检测结果：当前吞吐量无异常
          </Alert>
        </Card>
      </Col>
    </Row>

    <Algorithm/>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import * as echarts from 'echarts';
import Algorithm from '../components/Algorithm.vue';
import {timeDataStore} from '../store/data'
const time_data_store = timeDataStore()


// 组件名称定义
defineOptions({
  name: 'PredictionDashboard'
});


// 业务的选择列表
const businessOptions = ref([])
// 你选择的业务
const selectedBusiness = ref('');


// 应用的选择列表
const appOptions = ref([])
// 你选择的应用
const selectedApp = ref('')



// 预测算法
let algorithms = ref([]);
const selectedAlgorithm = ref('');

// 选取的时间戳
const selectedTime = ref('');


// 加载的数据
const loaded_app_data = ref([])




// 图表实例引用
const responseTimeChart = ref(null);
const memChart = ref(null);
const diskChart = ref(null);
const networkChart = ref(null);
const realAllChart = ref(null);
const predictAllChart = ref(null);

// 图表实例
let responseTimeChartInstance = null;
let memChartInstance = null;
let diskChartInstance = null;
let networkChartInstance = null;
let realAllChartInstance = null;
let predictAllChartInstance = null;



// 生成时间标签
const generateTimeLabels = (timeSelection) => {
  const labels = [];
  const now = new Date();
  
  if (timeSelection === 'hour') {
    for (let i = -9; i <= 5; i++) {
      const date = new Date(now.getTime() + i * 3600 * 1000);
      labels.push(`${date.getHours().toString().padStart(2, '0')}:00`);
    }
  } else if (timeSelection === 'day') {
    for (let i = -9; i <= 5; i++) {
      const date = new Date(now.getTime() + i * 24 * 3600 * 1000);
      labels.push(`${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`);
    }
  } else if (timeSelection === 'month') {
    for (let i = -9; i <= 5; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i);
      labels.push(`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`);
    }
  } else if (timeSelection === 'season') {
    const seasons = ['Q1', 'Q2', 'Q3', 'Q4'];
    const currentSeasonIndex = Math.floor(now.getMonth() / 3);
    for (let i = -9; i <= 5; i++) {
      const totalSeasons = currentSeasonIndex + i;
      const year = now.getFullYear() + Math.floor(totalSeasons / 4);
      const seasonIndex = ((totalSeasons % 4) + 4) % 4;
      labels.push(`${year}-${seasons[seasonIndex]}`);
    }
  }
  
  return labels;
};

// 生成模拟数据,展示算法的时候使用
const generateMockData = (length, min, max) => {
  return Array.from({ length }, () => Math.random() * (max - min) + min);
};

const Timestamps2TimeLabel = (time_stamp)=>{

  let time_date = new Date(time_stamp * 1000)
  const label = `${time_date.getFullYear()}/${time_date.getMonth() + 1}/${time_date.getDate()}/${time_date.getHours()}:00`
  return label
}

// 从后端的一堆东西中提取数据
function SelectUsefulData(time_series_entry){


    console.log(time_series_entry)
    // 统计序列长度
    let history_lengh = time_series_entry.data.prediction.series.apdex.series.length
    let prediction_length = time_series_entry.data.prediction.predict_series.DLinear.average_response_time.length

    console.log("prediction_length" ,prediction_length)
    let total_length = history_lengh + prediction_length

    // 定义数据结构
    const times = Array.from({ length: total_length }, () => '') // 时间数组：默认空字符串

    const apdex = Array.from({ length: total_length }, () => null) 
  
    const average_response_time = Array.from({ length: total_length }, () => null)

    const request_failed_rate = Array.from({ length: total_length }, () => null) 

    const request_total_count = Array.from({ length: total_length }, () => null) 

    const apdexPred = Array.from({ length: total_length }, () => null) 

    const average_response_time_Pred = Array.from({ length: total_length }, () => null) 
    
    const request_failed_rate_Pred = Array.from({ length: total_length }, () => null)

    const request_total_count_Pred = Array.from({ length: total_length }, () => null)



    let history_lists = time_series_entry.data.prediction.series
    let predict_lists = time_series_entry.data.prediction.predict_series

    // 加载历史序列
    let apdex_idx = 0 
    let average_response_time_idx = 0
    let request_failed_rate_idx = 0
    let request_total_count_idx = 0
    
    // apdex
    history_lists.apdex.series.forEach(element => {
        apdex[apdex_idx] = element[1]
        apdex_idx = apdex_idx + 1
    });

    // 平均响应时间
    history_lists.average_response_time.series.forEach(element => {
        average_response_time[average_response_time_idx] = element[1]
        times[average_response_time_idx]=Timestamps2TimeLabel(element[0])
        average_response_time_idx = average_response_time_idx + 1
    });

    console.log("average_response_time", average_response_time)

    // 请求错误率
    history_lists.request_failed_rate.series.forEach(element => {
        request_failed_rate[request_failed_rate_idx] = element[1]
        request_failed_rate_idx = request_failed_rate_idx + 1
    })
    
    // 吞吐量
    history_lists.request_total_count.series.forEach(element => {
        request_total_count[request_total_count_idx] = element[1]
        request_total_count_idx = request_total_count_idx + 1
    })


    let apdex_pred_list;
    let average_response_time_pred_list;
    let request_failed_rate_pred_list;
    let request_total_count_list;

    
    // 加载某一种算法的预测序列
    if(selectedAlgorithm.value == "DLinear"){
      console.log("算法转化为DLinear")
      average_response_time_pred_list = predict_lists.DLinear.average_response_time
      request_failed_rate_pred_list = predict_lists.DLinear.request_failed_rate
      request_total_count_list = predict_lists.DLinear.request_total_count

    }
    else if (selectedAlgorithm.value == "MEMA"){
      console.log("算法转化为MEMA")
      average_response_time_pred_list = predict_lists.MEMA.average_response_time
      request_failed_rate_pred_list = predict_lists.MEMA.request_failed_rate
      request_total_count_list = predict_lists.MEMA.request_total_count
    }

    // 为了保证预测数据和历史数据的衔接，这里我们的Pred后缀结尾的数组要保留一个历史真实数据
    average_response_time_Pred[average_response_time_idx-1] = history_lists.average_response_time.series[average_response_time_idx-1][1]
    request_failed_rate_Pred[request_failed_rate_idx-1] = history_lists.request_failed_rate.series[request_failed_rate_idx-1][1]
    request_total_count_Pred[request_total_count_idx-1] = history_lists.request_total_count.series[request_total_count_idx-1][1]

    
    // 加载预测数据
    // 响应预测数据
    average_response_time_pred_list.forEach(element => {
      average_response_time_Pred[average_response_time_idx] = element[1]
      times[average_response_time_idx]=Timestamps2TimeLabel(element[0])
      average_response_time_idx = average_response_time_idx + 1
    })


    // 错误率预测数据
    request_failed_rate_pred_list.forEach(element =>{
      request_failed_rate_Pred[request_failed_rate_idx] = element[1]
      request_failed_rate_idx = request_failed_rate_idx + 1
    })

    // 吞吐量预测数据
    request_total_count_list.forEach(element => {
      request_total_count_Pred[request_total_count_idx] = element[1]
      request_total_count_idx = request_total_count_idx + 1
    })



    // y刻度的范围,// 求出最大值和最小值, 方便y轴渲染
    let apdex_range= [0,0]
    let average_response_time_range = [0,0]
    let request_failed_rate_range = [0,0]
    let request_total_count_range = [0,0]

    let tmp_apdex = [
      ...apdex.filter(v => v !== null && !Number.isNaN(v)),
      ...apdexPred.filter(v => v !== null && !Number.isNaN(v)),
    ]
    
    let tmp_average_response_time = [
      ...average_response_time.filter(v => v !== null && !Number.isNaN(v)),
      ...average_response_time_Pred.filter(v => v !== null && !Number.isNaN(v)),
    ]

    let tmp_request_failed_rate = [
      ...request_failed_rate.filter(v => v !== null && !Number.isNaN(v)),
      ...request_failed_rate_Pred.filter(v => v !== null && !Number.isNaN(v)),
    ]

    let tmp_request_total_count = [
      ...request_total_count.filter(v => v !== null && !Number.isNaN(v)),
      ...request_total_count_Pred.filter(v => v !== null && !Number.isNaN(v)),
    ]
    apdex_range[0]=Math.min(...tmp_apdex)
    apdex_range[1]=Math.max(...tmp_apdex)

    average_response_time_range[0]=Math.min(...tmp_average_response_time)
    average_response_time_range[1]=Math.max(...tmp_average_response_time)

    request_failed_rate_range[0]=Math.min(...tmp_request_failed_rate)
    request_failed_rate_range[1]=Math.max(...tmp_request_failed_rate)

    request_total_count_range[0]=Math.min(...tmp_request_total_count)
    request_total_count_range[1]=Math.max(...tmp_request_total_count)


    return { times,
             apdex,
             request_total_count,
             average_response_time,
             request_failed_rate,
             apdexPred,
             request_total_count_Pred,
             average_response_time_Pred,
             request_failed_rate_Pred, 
             apdex_range,
             average_response_time_range,
             request_failed_rate_range,
             request_total_count_range};
}

const updateCharts = async () => {

  console.log("current business  is ", selectedBusiness.value)
  console.log("current app  is ", selectedApp.value)
  console.log("current scale  is ", selectedTime.value)
  console.log("current algorithm is", selectedAlgorithm.value)

  try{

    const time_series = await time_data_store.get_app_prediction(selectedBusiness.value, selectedApp.value,selectedTime.value)
    console.log("time series is ", time_series)
    loaded_app_data.value = SelectUsefulData(time_series);
    console.log("loaded app data is ", loaded_app_data.value)
  }
  catch(e){
    console.error("拉取应用对应的数据",e)
  }


  const timeLabels = generateTimeLabels(selectedTime.value);
  
  // 
  if (responseTimeChart.value) {
    responseTimeChartInstance = echarts.init(responseTimeChart.value);
    responseTimeChartInstance.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['当前响应时间', '预测响应时间'] },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: loaded_app_data.value.times },
      yAxis: { type: 'value', name: '响应时间(ms)' },
      series: [
        {
          name: '当前响应时间',
          type: 'line',
          data: loaded_app_data.value.average_response_time,
          smooth: true,
          itemStyle: { color: '#2d8cf0' },
          areaStyle: { opacity: 0.3 }
        },
        {
          name: '预测响应时间',
          type: 'line',
          data: loaded_app_data.value.average_response_time_Pred,
          smooth: true,
          itemStyle: { color: '#19be6b' },
          lineStyle: { type: 'dashed' }
        }
      ]
    });
  }

  // Memory图表
  if (memChart.value) {
    memChartInstance = echarts.init(memChart.value);
    memChartInstance.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['当前apdex', '预测apdex'] },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: loaded_app_data.value.times },
      yAxis: { type: 'value', name: 'apdex', min: loaded_app_data.value.apdex_range[0] , max: loaded_app_data.value.apdex_range[1] },
      series: [
        {
          name: '当前apdex',
          type: 'line',
          data: loaded_app_data.value.apdex,
          smooth: true,
          itemStyle: { color: '#ff9900' },
          areaStyle: { opacity: 0.3 }
        },
        {
          name: '预测apdex',
          type: 'line',
          data: loaded_app_data.value.apdexPred,
          smooth: true,
          itemStyle: { color: '#ed4014' },
          lineStyle: { type: 'dashed' }
        }
      ]
    });
  }

  // Disk图表
  if (diskChart.value) {
    diskChartInstance = echarts.init(diskChart.value);
    diskChartInstance.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['当前错误率', '预测错误率'] },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: loaded_app_data.value.times },
      yAxis: { type: 'value', name: '错误率(%)', min: loaded_app_data.value.request_failed_rate_range[0], max: loaded_app_data.value.request_failed_rate_range[1] },
      series: [
        {
          name: '当前错误率',
          type: 'line',
          data: loaded_app_data.value.request_failed_rate,
          smooth: true,
          itemStyle: { color: '#9b59b6' },
          areaStyle: { opacity: 0.3 }
        },
        {
          name: '预测错误率',
          type: 'line',
          data: loaded_app_data.value.request_failed_rate_Pred,
          smooth: true,
          itemStyle: { color: '#e74c3c' },
          lineStyle: { type: 'dashed' }
        }
      ]
    });
  }

  // Network图表
  if (networkChart.value) {
    networkChartInstance = echarts.init(networkChart.value);
    networkChartInstance.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['当前吞吐量', '预测吞吐量'] },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: loaded_app_data.value.times },
      yAxis: { type: 'value', name: '吞吐量',   min:loaded_app_data.value.request_total_count_range[0], max: loaded_app_data.value.request_total_count_range[1] },
      series: [
        {
          name: '当前吞吐量',
          type: 'line',
          data: loaded_app_data.value.request_total_count,
          smooth: true,
          itemStyle: { color: '#1abc9c' },
          areaStyle: { opacity: 0.3 }
        },
        {
          name: '预测吞吐量',
          type: 'line',
          data: loaded_app_data.value.request_total_count_Pred,
          smooth: true,
          itemStyle: { color: '#3498db' },
          lineStyle: { type: 'dashed' }
        }
      ]
    });
  }

  // 输入图表
  if (realAllChart.value) {
    realAllChartInstance = echarts.init(realAllChart.value);
    realAllChartInstance.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['响应时间', 'apdex', '错误率'] },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: timeLabels.slice(0, 10) },
      yAxis: { type: 'value', name: '真实值' },
      series: [
        {
          name: '响应时间',
          type: 'line',
          data: generateMockData(10, 20, 80),
          smooth: true,
          itemStyle: { color: '#2d8cf0' }
        },
        {
          name: 'apdex',
          type: 'line',
          data: generateMockData(10, 85, 95),
          smooth: true,
          itemStyle: { color: '#ff9900' }
        },
        {
          name: '错误率',
          type: 'line',
          data: generateMockData(10, -0.2, 0.5),
          smooth: true,
          itemStyle: { color: '#9b59b6' }
        }
      ]
    });
  }

  // 输出图表
  if (predictAllChart.value) {
    predictAllChartInstance = echarts.init(predictAllChart.value);
    predictAllChartInstance.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['响应时间预测', 'apdex预测', '错误率预测'] },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: timeLabels.slice(-5) },
      yAxis: { type: 'value', name: '预测值' },
      series: [
        {
          name: '响应时间预测',
          type: 'line',
          data: generateMockData(5, 25, 75),
          smooth: true,
          itemStyle: { color: '#19be6b' }
        },
        {
          name: 'apdex预测',
          type: 'line',
          data: generateMockData(5, 86, 94),
          smooth: true,
          itemStyle: { color: '#ed4014' }
        },
        {
          name: '错误率预测',
          type: 'line',
          data: generateMockData(5, -0.1, 0.4),
          smooth: true,
          itemStyle: { color: '#e74c3c' }
        }
      ]
    });
  }
};


// 处理确定按钮点击
const handleConfirm = () => {
  // 这里可以添加数据刷新逻辑
  console.log('确定按钮被点击', {
    service: selectedBusiness.value,
    model: selectedAlgorithm.value,
    time: selectedTime.value
  });
  if(selectedBusiness.value == '')
  {
    alert("请指定对应的业务！");
    return;
  }
  if(selectedApp.value == '')
  {
    alert("请指定对应的应用！");
    return;
  }
  if(selectedAlgorithm.value == '')
  {
    alert("请指定对应的算法！");
    return;
  }
  if(selectedTime.value == '')
  {
    alert("请指定对应的尺度！");
    return;
  }


  // 重新初始化图表
  updateCharts();
};


// 处理窗口大小变化
const handleResize = () => {
  if (responseTimeChartInstance) responseTimeChartInstance.resize();
  if (memChartInstance) memChartInstance.resize();
  if (diskChartInstance) diskChartInstance.resize();
  if (networkChartInstance) networkChartInstance.resize();
  if (realAllChartInstance) realAllChartInstance.resize();
  if (predictAllChartInstance) predictAllChartInstance.resize();
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


const updateappOptions = async (business_name)=>{
  try {

      const res = await time_data_store.get_app_data(business_name)
      appOptions.value = res.data.available_app["H"] || []

  } catch (e) {
      console.error('获取应用数据失败:', e)
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



// 当选择了一个业务之后给出相关的应用
watch(
  () => selectedBusiness.value,
 async  (newVal, oldVal) => {
    console.log('深层变动', newVal, oldVal);

    // 加载业务选择
    await updateappOptions(newVal)
    console.log(appOptions.value)
    if(appOptions.value.length == 0){
      selectedApp.value=''
    }
  },
  { deep: true }
);

// 生命周期
onMounted(() => {


    // 更新业务选择
    updatebusinessOptions();

    // 更新模型
    update_model_choice();

    // 从后端读取数据，然后显示到四个表格里面
    selectedBusiness.value = "营销管理系统"
    selectedApp.value = "yingxiaoguanli"
    selectedTime.value = "H"
    selectedAlgorithm.value ="DLinear"
    updateCharts()
    window.addEventListener('resize', handleResize);

});



onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (responseTimeChartInstance) responseTimeChartInstance.dispose();
  if (memChartInstance) memChartInstance.dispose();
  if (diskChartInstance) diskChartInstance.dispose();
  if (networkChartInstance) networkChartInstance.dispose();
  if (realAllChartInstance) realAllChartInstance.dispose();
  if (predictAllChartInstance) predictAllChartInstance.dispose();
});
</script>






<style scoped>
.prediction-container {
  padding: 20px;
  background: #f5f7f9;
  min-height: 100vh;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.model-display {
  text-align: center;
  padding: 20px;
}

.model-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.model-description {
  text-align: left;
  line-height: 1.8;
  color: #515a6e;
  font-size: 14px;
  max-width: 900px;
  margin: 0 auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chart-container {
    height: 250px;
  }
}

/* iView 样式覆盖 */
:deep(.ivu-card) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.ivu-card:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

:deep(.ivu-card-head) {
  border-bottom: 1px solid #e8eaec;
  padding: 14px 16px;
}

:deep(.ivu-alert) {
  border-radius: 4px;
}

:deep(.ivu-btn-group) {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

:deep(.ivu-select) {
  border-radius: 4px;
}
</style>