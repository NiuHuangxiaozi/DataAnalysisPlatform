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
              v-model="selectedService" 
              filterable 
              placeholder="搜索业务"
              style="width: 200px;"
            >
              <Option 
                v-for="(vm, service) in serviceVMMap" 
                :key="service" 
                :value="service"
              >
                {{ service }}
              </Option>
            </Select>
          </Space>
        </Col>
        
        <Col :xs="24" :sm="6" style="margin-bottom: 10px;">
          <Space>
            <span style="white-space: nowrap;">模型选择：</span>
            <Select v-model="selectedModel" style="width: 280px;">
              <Option value="MEMA">基于多视图多任务学习的预测算法 MEMA</Option>
              <Option value="Algo3">基于时序趋势分解的多变量预测模型</Option>
              <Option value="Algo4">基于通道子模式关联的时序预测模型</Option>
            </Select>
          </Space>
        </Col>
        
        <Col :xs="24" :sm="6" style="margin-bottom: 10px;">
          <Space>
            <span style="white-space: nowrap;">视图选择：</span>
            <Select v-model="selectedTime" style="width: 120px;">
              <Option value="hour">小时</Option>
              <Option value="day">日</Option>
              <Option value="month">月份</Option>
              <Option value="season">季度</Option>
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
      当前展示业务为<strong>{{ selectedService }}</strong>的负载数据，并展示算法<strong>{{ getModelName(selectedModel) }}</strong>的预测分析与资源分配建议
    </Alert>

    <!-- 图表网格 -->
    <Row :gutter="16">
      <Col :xs="24" :md="12" style="margin-bottom: 16px;">
        <Card dis-hover>
          <template #title>
            <Icon type="ios-timer-outline" /> 平均响应时间预测与检测
          </template>
          <div ref="cpuChart" class="chart-container"></div>
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
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import Algorithm from '../components/Algorithm.vue';

// 组件名称定义
defineOptions({
  name: 'PredictionDashboard'
});

// 响应式数据
const selectedService = ref('人工智能平台');
const selectedModel = ref('MEMA');
const selectedTime = ref('month');
const currentModelView = ref('dlinear');

// 图表实例引用
const cpuChart = ref(null);
const memChart = ref(null);
const diskChart = ref(null);
const networkChart = ref(null);
const realAllChart = ref(null);
const predictAllChart = ref(null);

// 图表实例
let cpuChartInstance = null;
let memChartInstance = null;
let diskChartInstance = null;
let networkChartInstance = null;
let realAllChartInstance = null;
let predictAllChartInstance = null;

// 虚拟数据
const serviceVMMap = ref({
  '人工智能平台': 'ai_platform',
  '数据分析平台': 'data_analysis',
  '云存储服务': 'cloud_storage',
  '容器服务': 'container_service',
  '微服务网关': 'microservice_gateway'
});

const modelButtons = [
  { key: 'transformer', name: '基于时序趋势分解的多变量预测模型' },
  { key: 'patchTST', name: '基于通道子模式关联的时序预测模型' },
  { key: 'dlinear', name: '基于多视图多任务学习的预测算法 MEMA' }
];

const modelImages = {
  transformer: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjIwIiBmaWxsPSIjOTk5Ij5UcmFuc2Zvcm1lciBNb2RlbDwvdGV4dD48L3N2Zz4=',
  patchTST: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjIwIiBmaWxsPSIjOTk5Ij5QYXRjaFRTVCBNb2RlbDwvdGV4dD48L3N2Zz4=',
  dlinear: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjIwIiBmaWxsPSIjOTk5Ij5ETGluZWFyIE1vZGVsPC90ZXh0Pjwvc3ZnPg=='
};

const modelDescriptions = {
  transformer: '基于时序趋势分解的多变量预测模型: 模型基于输入数据进行多头自注意力块的构建，实现负载序列的预测。输入数据通过一个分解模块进行处理，提取出季节性和长期趋势。编码器包含一个多头自注意力机制，用于捕捉输入数据中的复杂依赖关系。',
  patchTST: '基于通道子模式关联的时序预测模型: 输入阶段将多变量时间序列按通道划分，每个通道独立看作一个一维序列，并切成多个长度为 P 的 Patch 片段。处理阶段，用 Transformer Encoder 处理这些 Patch 片段。',
  dlinear: '基于多视图多任务学习的预测算法 MEMA: 该模型将固定长度的历史 VM 负载输入模型，先用滑动平均把序列拆分为"趋势"和"残差"两部分，两部分分别通过轻量线性映射后相加，直接输出未来一段时刻的负载预测。'
};

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

// 生成模拟数据
const generateMockData = (length, min, max) => {
  return Array.from({ length }, () => Math.random() * (max - min) + min);
};

// 初始化图表
const initCharts = () => {
  const timeLabels = generateTimeLabels(selectedTime.value);
  
  // CPU图表
  if (cpuChart.value) {
    cpuChartInstance = echarts.init(cpuChart.value);
    cpuChartInstance.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['当前响应时间', '预测响应时间'] },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: timeLabels },
      yAxis: { type: 'value', name: '响应时间(ms)' },
      series: [
        {
          name: '当前响应时间',
          type: 'line',
          data: generateMockData(15, 20, 80),
          smooth: true,
          itemStyle: { color: '#2d8cf0' },
          areaStyle: { opacity: 0.3 }
        },
        {
          name: '预测响应时间',
          type: 'line',
          data: generateMockData(15, 25, 75),
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
      xAxis: { type: 'category', data: timeLabels },
      yAxis: { type: 'value', name: 'apdex', min: 80, max: 100 },
      series: [
        {
          name: '当前apdex',
          type: 'line',
          data: generateMockData(15, 85, 95),
          smooth: true,
          itemStyle: { color: '#ff9900' },
          areaStyle: { opacity: 0.3 }
        },
        {
          name: '预测apdex',
          type: 'line',
          data: generateMockData(15, 86, 94),
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
      xAxis: { type: 'category', data: timeLabels },
      yAxis: { type: 'value', name: '错误率(%)', min: -0.5, max: 1.5 },
      series: [
        {
          name: '当前错误率',
          type: 'line',
          data: generateMockData(15, -0.2, 0.5),
          smooth: true,
          itemStyle: { color: '#9b59b6' },
          areaStyle: { opacity: 0.3 }
        },
        {
          name: '预测错误率',
          type: 'line',
          data: generateMockData(15, -0.1, 0.4),
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
      xAxis: { type: 'category', data: timeLabels },
      yAxis: { type: 'value', name: '吞吐量', max: 4000 },
      series: [
        {
          name: '当前吞吐量',
          type: 'line',
          data: generateMockData(15, 1000, 3500),
          smooth: true,
          itemStyle: { color: '#1abc9c' },
          areaStyle: { opacity: 0.3 }
        },
        {
          name: '预测吞吐量',
          type: 'line',
          data: generateMockData(15, 1200, 3300),
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
    service: selectedService.value,
    model: selectedModel.value,
    time: selectedTime.value
  });
  
  // 重新初始化图表
  initCharts();
};

// 切换模型显示
const switchModel = (modelKey) => {
  currentModelView.value = modelKey;
};

// 获取模型名称
const getModelName = (modelValue) => {
  const modelMap = {
    'MEMA': 'MEMA',
    'Algo3': '时序趋势分解模型',
    'Algo4': '通道子模式关联模型'
  };
  return modelMap[modelValue] || modelValue;
};

// 处理窗口大小变化
const handleResize = () => {
  if (cpuChartInstance) cpuChartInstance.resize();
  if (memChartInstance) memChartInstance.resize();
  if (diskChartInstance) diskChartInstance.resize();
  if (networkChartInstance) networkChartInstance.resize();
  if (realAllChartInstance) realAllChartInstance.resize();
  if (predictAllChartInstance) predictAllChartInstance.resize();
};

// 生命周期
onMounted(() => {
  nextTick(() => {
    initCharts();
    window.addEventListener('resize', handleResize);
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (cpuChartInstance) cpuChartInstance.dispose();
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