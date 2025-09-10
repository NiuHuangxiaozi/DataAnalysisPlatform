<template>
  <div class="image-container">
    <h1>模型结构</h1>

    <!-- iView 风格按钮切换 -->
    <div class="button-group">
      <Button
        v-for="model in modelList"
        :key="model.key"
        type="primary"
        @click="switchModel(model.key)"
      >
        {{ model.label }}
      </Button>
    </div>

    <!-- iView 风格的画图布局 -->
    <Row :gutter="16" class="charts-grid-model" style="margin-top: 30px;">
      <Col span="10">
        <Card >
          <h4>当前模型输入</h4>
          <canvas ref="realCanvas" max-width="40px" max-height="25px"></canvas>
        </Card>
      </Col>
      <Col span="10">
        <Card >
          <div class="canvas-container">
            <h4>当前预测输出</h4>
            <canvas ref="predictCanvas" max-width="25px" max-height="25px" ></canvas>
          </div>
        </Card>
      </Col>
    </Row>

    <!-- 模型结构示意图 -->
    <div class="image-wrapper">
      <img :src="modelImage" :alt="`${currentModel} 图示`" class="custom-image" />
    </div>
    <Card class="description-card" style="margin-top: 20px;">
      <p>{{ modelDescription }}</p>
    </Card>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import Chart from 'chart.js/auto';
import { Row, Col, Card, Button } from 'view-ui-plus';  // iView 风格组件导入

const props = defineProps({
  father_component: String,
});

// 模型列表与对应显示文案
const modelList = [
  { key: 'transformer', label: '基于时序趋势分解的多变量预测模型' },
  { key: 'DLinear', label: '基于通道子模式关联的时序预测模型' },
  { key: 'MEMA', label: '基于多视图多任务学习的预测算法 MEMA' }
];

// 模型对应图片路径（可替换为 import 引入方式）
const modelImages = {
  transformer: '/src/assets/models/transformer.png',
  MEMA: '/src/assets/models/patchTST.png',
  DLinear: '/src/assets/models/dlinear.png'
};

// 模型对应文字说明
const modelDescriptions = {
  "transformer": "基于时序趋势分解的多变量预测模型: 模型基于输入数据进行多头自注意力块的构建，实现负载序列的预测。输入数据通过一个分解模块进行处理，提取出季节性和长期趋势。编码器包含一个多头自注意力机制，用于捕捉输入数据中的复杂依赖关系。分解模块提取的季节性和长期趋势信息被送入另一个 Transformer 编码器。解码器包含多头自注意力机制和前馈传播模块，用于生成预测输出。解码器的输出与编码器的输出进行加权求和，生成最终的预测输出。",
  "DLinear": "基于通道子模式关联的时序预测模型: 输入阶段将多变量时间序列按通道（channel‑independence）划分，每个通道独立看作一个一维序列，并切成多个长度为 P 的 Patch 片段。处理阶段，用 Transformer Encoder 处理这些 Patch 片段，Patch 提高了并行性并捕获局部语义，将序列长度从 L 降为约 L/S（S 为步长）。可选地使用自监督预训练（mask 重建）。输出端经过线性层，成未来 h 步的预测值。该方法在长程 forecasting 上表现优异",
  "MEMA": "基于多视图多任务学习的预测算法 MEMA: 该模型将固定长度的历史 VM 负载（CPU、内存等）输入模型，先用滑动平均把序列拆分为“趋势”和“残差”两部分，两部分分别通过轻量线性映射后相加，直接输出未来一段时刻的负载预测。结构极其简洁高效，它不仅速度飞快、计算资源轻，还能直观解释趋势与波动, 适合云环境中的实时监控和弹性调度。"

};

const currentModel = ref('transformer');
const modelImage = ref(modelImages[currentModel.value]);
const modelDescription = ref(modelDescriptions[currentModel.value]);

function switchModel(modelKey) {
  currentModel.value = modelKey;
  modelImage.value = modelImages[modelKey];
  modelDescription.value = modelDescriptions[modelKey] || '暂无该模型的描述信息';
}

// Canvas refs for Chart.js
const realCanvas = ref(null);
const predictCanvas = ref(null);
let realChart = null;
let predictChart = null;

// 模拟不同模型的输入/预测数据：真实使用时替换为实际数据获取逻辑
function getDataByModel(modelKey) {
  const labels = ['T1', 'T2', 'T3', 'T4', 'T5'];
  const randArray = () => labels.map(() => Math.random() * 1);
  return { labels, dataInput: randArray(), dataPredict: randArray() };
}

// 创建或更新图表的函数
function buildOrUpdateCharts() {
  const { labels, dataInput, dataPredict } = getDataByModel(currentModel.value);

  const cfgInput = {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: '输入', data: dataInput, borderColor: '#42b983', fill: false }
      ]
    },
    options: { responsive: false, maintainAspectRatio: false }
  };
  const cfgPredict = {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: '预测输出', data: dataPredict, borderColor: '#ff7300', fill: false }
      ]
    },
    options: { responsive: false, maintainAspectRatio: false }
  };

  if (realChart) {
    realChart.data = cfgInput.data;
    realChart.options = cfgInput.options;
    realChart.update();
  } else {
    realChart = new Chart(realCanvas.value.getContext('2d'), cfgInput);
  }

  if (predictChart) {
    predictChart.data = cfgPredict.data;
    predictChart.options = cfgPredict.options;
    predictChart.update();
  } else {
    predictChart = new Chart(predictCanvas.value.getContext('2d'), cfgPredict);
  }
}

// 监听模型切换，并初始化更新图表
watch(
  currentModel,
  async () => {
    await nextTick();
    buildOrUpdateCharts();
  },
  { immediate: true }
);
</script>

<style scoped>
.button-group {
  text-align: center;
  margin: 40px 20px;
}
.charts-grid-model {
  display: flex;
  justify-content: space-around;
  margin-left: 0;
  margin-right: 0;
}
.image-wrapper {
  text-align: center;
  margin-top: 25px;
}
.custom-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.description-card {
  margin-top: 20px;
}


/* 输出序列靠右 */
.canvas-container {
  display: flex;
  justify-content: flex-end;
}
</style>
