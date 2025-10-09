<template>
  <div class="business-anomaly-panel">
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
              style="width: 100%;"
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
            <span style="white-space: nowrap;">时间尺度：</span>
            <Select v-model="selectedTime" style="width: 100%;">
              <Option value="H">小时</Option>
              <Option value="D">天</Option>
              <Option value="M">月</Option>
            </Select>
          </Space>
        </Col>
      </Row>
      
      <Row type="flex" justify="center" style="margin-top: 10px;">
        <Button type="primary" @click="handleRefresh" icon="md-refresh" :loading="loading">
          刷新数据
        </Button>
      </Row>
    </Card>

    <!-- 信息提示 -->
    <Alert type="info" show-icon style="margin-bottom: 20px;" v-if="selectedBusiness && selectedApp">
      当前展示业务为<strong>{{ selectedBusiness }}</strong>的<strong>{{ selectedApp }}</strong>应用异常检测结果
    </Alert>

    <!-- 异常检测结果 -->
    <Row :gutter="16">
      <Col :xs="24" :md="12" style="margin-bottom: 16px;">
        <Card dis-hover>
          <template #title>
            <Icon type="ios-timer-outline" /> 平均响应时间异常检测
          </template>
          <div class="status-display">
            <Alert :type="responseTimeAlertType" show-icon :closable="false">
              {{ responseTimeAlertMessage }}
            </Alert>
          </div>
        </Card>
      </Col>

      <Col :xs="24" :md="12" style="margin-bottom: 16px;">
        <Card dis-hover>
          <template #title>
            <Icon type="ios-analytics-outline" /> Apdex异常检测
          </template>
          <div class="status-display">
            <Alert :type="apdexAlertType" show-icon :closable="false">
              {{ apdexAlertMessage }}
            </Alert>
          </div>
        </Card>
      </Col>

      <Col :xs="24" :md="12" style="margin-bottom: 16px;">
        <Card dis-hover>
          <template #title>
            <Icon type="ios-close-circle-outline" /> 错误率异常检测
          </template>
          <div class="status-display">
            <Alert :type="errorRateAlertType" show-icon :closable="false">
              {{ errorRateAlertMessage }}
            </Alert>
          </div>
        </Card>
      </Col>

      <Col :xs="24" :md="12" style="margin-bottom: 16px;">
        <Card dis-hover>
          <template #title>
            <Icon type="ios-pulse" /> 吞吐量异常检测
          </template>
          <div class="status-display">
            <Alert :type="throughputAlertType" show-icon :closable="false">
              {{ throughputAlertMessage }}
            </Alert>
          </div>
        </Card>
      </Col>
    </Row>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { timeDataStore } from '../store/data';

const timeDataStore_ = timeDataStore();

// 组件名称定义
defineOptions({
  name: 'BusinessAnomalyPanel'
});

// 选择项
const businessOptions = ref([]);
const selectedBusiness = ref('');
const appOptions = ref([]);
const selectedApp = ref('');
const algorithms = ref([]);
const selectedAlgorithm = ref('');
const selectedTime = ref('H');
const loading = ref(false);

// 移除图表相关引用

// 异常检测结果
const responseTimeAlertType = ref('success');
const responseTimeAlertMessage = ref('异常检测结果：当前响应时间无异常');
const apdexAlertType = ref('success');
const apdexAlertMessage = ref('异常检测结果：当前apdex无异常');
const errorRateAlertType = ref('success');
const errorRateAlertMessage = ref('异常检测结果：当前错误率为正常状态');
const throughputAlertType = ref('success');
const throughputAlertMessage = ref('异常检测结果：当前吞吐量无异常');

// 数据处理
const loaded_app_data = ref({});

// 时间戳转换
const Timestamps2TimeLabel = (time_stamp) => {
  let time_date = new Date(time_stamp * 1000);
  const label = `${time_date.getFullYear()}/${time_date.getMonth() + 1}/${time_date.getDate()}/${time_date.getHours()}:00`;
  return label;
};

// 从后端数据中提取有用信息
function SelectUsefulData(time_series_entry) {
  console.log(time_series_entry);
  
  let history_length = time_series_entry.data.prediction.series.apdex.series.length;
  let prediction_length = time_series_entry.data.prediction.predict_series.DLinear.average_response_time.length;
  let total_length = history_length + prediction_length;

  // 定义数据结构
  const times = Array.from({ length: total_length }, () => '');
  const apdex = Array.from({ length: total_length }, () => null);
  const average_response_time = Array.from({ length: total_length }, () => null);
  const request_failed_rate = Array.from({ length: total_length }, () => null);
  const request_total_count = Array.from({ length: total_length }, () => null);
  const apdexPred = Array.from({ length: total_length }, () => null);
  const average_response_time_Pred = Array.from({ length: total_length }, () => null);
  const request_failed_rate_Pred = Array.from({ length: total_length }, () => null);
  const request_total_count_Pred = Array.from({ length: total_length }, () => null);

  let history_lists = time_series_entry.data.prediction.series;
  let predict_lists = time_series_entry.data.prediction.predict_series;

  // 加载历史序列
  let apdex_idx = 0;
  let average_response_time_idx = 0;
  let request_failed_rate_idx = 0;
  let request_total_count_idx = 0;

  // apdex
  history_lists.apdex.series.forEach(element => {
    apdex[apdex_idx] = element[1];
    apdex_idx = apdex_idx + 1;
  });

  // 平均响应时间
  history_lists.average_response_time.series.forEach(element => {
    average_response_time[average_response_time_idx] = element[1];
    times[average_response_time_idx] = Timestamps2TimeLabel(element[0]);
    average_response_time_idx = average_response_time_idx + 1;
  });

  // 请求错误率
  history_lists.request_failed_rate.series.forEach(element => {
    request_failed_rate[request_failed_rate_idx] = element[1];
    request_failed_rate_idx = request_failed_rate_idx + 1;
  });

  // 吞吐量
  history_lists.request_total_count.series.forEach(element => {
    request_total_count[request_total_count_idx] = element[1];
    request_total_count_idx = request_total_count_idx + 1;
  });

  let apdex_pred_list;
  let average_response_time_pred_list;
  let request_failed_rate_pred_list;
  let request_total_count_list;

  // 加载某一种算法的预测序列
  if (selectedAlgorithm.value == "DLinear") {
    apdex_pred_list = predict_lists.DLinear.apdex;
    average_response_time_pred_list = predict_lists.DLinear.average_response_time;
    request_failed_rate_pred_list = predict_lists.DLinear.request_failed_rate;
    request_total_count_list = predict_lists.DLinear.request_total_count;
  } else if (selectedAlgorithm.value == "MEMA") {
    apdex_pred_list = predict_lists.MEMA.apdex;
    average_response_time_pred_list = predict_lists.MEMA.average_response_time;
    request_failed_rate_pred_list = predict_lists.MEMA.request_failed_rate;
    request_total_count_list = predict_lists.MEMA.request_total_count;
  }

  // 为了保证预测数据和历史数据的衔接
  apdexPred[apdex_idx - 1] = history_lists.apdex.series[apdex_idx - 1][1];
  average_response_time_Pred[average_response_time_idx - 1] = history_lists.average_response_time.series[average_response_time_idx - 1][1];
  request_failed_rate_Pred[request_failed_rate_idx - 1] = history_lists.request_failed_rate.series[request_failed_rate_idx - 1][1];
  request_total_count_Pred[request_total_count_idx - 1] = history_lists.request_total_count.series[request_total_count_idx - 1][1];

  // 加载预测数据
  apdex_pred_list.forEach(element => {
    apdexPred[apdex_idx] = element[1];
    apdex_idx = apdex_idx + 1;
  });

  average_response_time_pred_list.forEach(element => {
    average_response_time_Pred[average_response_time_idx] = element[1];
    times[average_response_time_idx] = Timestamps2TimeLabel(element[0]);
    average_response_time_idx = average_response_time_idx + 1;
  });

  request_failed_rate_pred_list.forEach(element => {
    request_failed_rate_Pred[request_failed_rate_idx] = element[1];
    request_failed_rate_idx = request_failed_rate_idx + 1;
  });

  request_total_count_list.forEach(element => {
    request_total_count_Pred[request_total_count_idx] = element[1];
    request_total_count_idx = request_total_count_idx + 1;
  });

  // 计算预测数据的最大最小值用于异常检测
  let apdex_pred_max = Math.max(...apdexPred.filter(v => v !== null && !Number.isNaN(v)).slice(1));
  let average_response_time_pred_max = Math.max(...average_response_time_Pred.filter(v => v !== null && !Number.isNaN(v)).slice(1));
  let request_failed_rate_pred_max = Math.max(...request_failed_rate_Pred.filter(v => v !== null && !Number.isNaN(v)).slice(1));
  let request_total_count_pred_max = Math.max(...request_total_count_Pred.filter(v => v !== null && !Number.isNaN(v)).slice(1));

  let apdex_pred_min = Math.min(...apdexPred.filter(v => v !== null && !Number.isNaN(v)).slice(1));

  return {
    times,
    apdex,
    request_total_count,
    average_response_time,
    request_failed_rate,
    apdexPred,
    request_total_count_Pred,
    average_response_time_Pred,
    request_failed_rate_Pred,
    apdex_pred_max,
    average_response_time_pred_max,
    request_failed_rate_pred_max,
    request_total_count_pred_max,
    apdex_pred_min
  };
}

// 更新图表和异常检测
const updateCharts = async () => {
  if (!selectedBusiness.value || !selectedApp.value || !selectedAlgorithm.value || !selectedTime.value) {
    return;
  }

  loading.value = true;
  
  try {
    const time_series = await timeDataStore_.get_app_prediction(selectedBusiness.value, selectedApp.value, selectedTime.value);
    loaded_app_data.value = SelectUsefulData(time_series);
    
    // 异常检测逻辑
    if (loaded_app_data.value.apdex_pred_min < 0.6) {
      apdexAlertMessage.value = "请注意，当前用户性能指数(apdex)低于0.6，用户体验较差";
      apdexAlertType.value = "error";
    } else {
      apdexAlertMessage.value = "当前用户性能指数(apdex)正常，没有异常";
      apdexAlertType.value = "success";
    }

    if (loaded_app_data.value.average_response_time_pred_max > 1000) {
      responseTimeAlertMessage.value = "出现异常，当前业务应用平均响应时间超过1000ms，请及时检查";
      responseTimeAlertType.value = "error";
    } else {
      responseTimeAlertMessage.value = "没有异常，当前业务应用平均响应时间小于1000ms";
      responseTimeAlertType.value = "success";
    }

    if (loaded_app_data.value.request_failed_rate_pred_max > 0.2) {
      errorRateAlertMessage.value = "出现异常，当前业务应用请求错误率超过20%，请及时检查";
      errorRateAlertType.value = "error";
    } else {
      errorRateAlertMessage.value = "没有异常，当前业务应用请求错误率较低";
      errorRateAlertType.value = "success";
    }

    if (loaded_app_data.value.request_total_count_pred_max > 20000) {
      throughputAlertMessage.value = "出现异常，当前业务应用请求吞吐量超过20000次，应用服务负载较高，压力较大";
      throughputAlertType.value = "error";
    } else {
      throughputAlertMessage.value = "没有异常，当前业务应用负载压力小";
      throughputAlertType.value = "success";
    }

    // 不需要更新图表，只显示异常状态
    
  } catch (error) {
    console.error('拉取应用对应的数据', error);
  } finally {
    loading.value = false;
  }
};

// 移除图表渲染函数

// 处理刷新按钮
const handleRefresh = () => {
  if (!selectedBusiness.value) {
    alert("请指定对应的业务！");
    return;
  }
  if (!selectedApp.value) {
    alert("请指定对应的应用！");
    return;
  }
  if (!selectedAlgorithm.value) {
    alert("请指定对应的算法！");
    return;
  }
  if (!selectedTime.value) {
    alert("请指定对应的时间尺度！");
    return;
  }

  updateCharts();
};

// 移除窗口大小变化处理

// 从后端获取业务选项
const updateBusinessOptions = async () => {
  try {
    const res = await timeDataStore_.get_yw_business();
    businessOptions.value = res.data.available_business || [];
  } catch (e) {
    console.error('获取业务数据失败:', e);
  }
};

// 从后端获取应用选项
const updateAppOptions = async (business_name) => {
  try {
    const res = await timeDataStore_.get_app_data(business_name);
    appOptions.value = res.data.available_app["H"] || [];
  } catch (e) {
    console.error('获取应用数据失败:', e);
  }
};

// 从后端获取算法选项
const updateModelChoice = async () => {
  try {
    const methodlist = await timeDataStore_.get_methods();
    algorithms.value = methodlist.data.available_models;
  } catch (e) {
    console.error("获取预测方法失败", e);
  }
};

// 监听业务选择变化
watch(
  () => selectedBusiness.value,
  async (newVal, oldVal) => {
    console.log('业务选择变化', newVal, oldVal);
    await updateAppOptions(newVal);
    if (appOptions.value.length == 0) {
      selectedApp.value = '';
    }
  },
  { deep: true }
);

// 生命周期
onMounted(() => {
  updateBusinessOptions();
  updateModelChoice();
  
  // 设置默认值
  selectedBusiness.value = "营销管理系统";
  selectedApp.value = "yingxiaoguanli";
  selectedTime.value = "H";
  selectedAlgorithm.value = "DLinear";
  
  updateCharts();
});
</script>

<style scoped>
.business-anomaly-panel {
  width: 100%;
}

.status-display {
  padding: 20px;
  text-align: center;
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

:deep(.ivu-select) {
  border-radius: 4px;
}
</style>
