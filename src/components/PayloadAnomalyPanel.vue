<template>
  <div class="payload-anomaly-panel">
    <!-- 控制面板 -->
    <Card dis-hover :bordered="false" style="margin-bottom: 20px;">
      <Row type="flex" justify="center" align="middle">
        <Button type="primary" @click="handleRefresh" icon="md-refresh" :loading="loading">
          刷新负载均衡数据
        </Button>
      </Row>
    </Card>

    <!-- 信息提示 -->
    <Alert type="info" show-icon style="margin-bottom: 20px;">
      当前展示各业务负载均衡资源的异常检测结果
    </Alert>

    <!-- 业务异常检测列表 -->
    <div v-for="business in businessList" :key="business.name" style="margin-bottom: 20px;">
      <Card dis-hover>
        <template #title>
          <Icon type="ios-business-outline" /> {{ business.name }} 业务异常检测
        </template>
        <Row :gutter="16">
          <Col span="8" v-for="(metric, index) in ['cpu', 'memory', 'disk']" :key="index">
            <Card dis-hover style="margin-bottom: 10px;">
              <h5 class="metric-title">{{ getMetricTitle(metric) }}</h5>
              <Alert 
                :type="business.status[metric].type" 
                show-icon 
                :closable="false"
              >
                {{ business.status[metric].message }}
              </Alert>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { timeDataStore } from '../store/data';

const timeDataStore_ = timeDataStore();

// 组件名称定义
defineOptions({
  name: 'PayloadAnomalyPanel'
});

const loading = ref(false);

// 业务列表
const businessList = ref([]);

// 获取指标标题
const getMetricTitle = (metric) => {
  const titles = {
    cpu: 'CPU利用率',
    memory: '内存利用率',
    disk: '磁盘利用率'
  };
  return titles[metric] || metric;
};

// 检查业务异常状态
const checkBusinessAnomalies = async (businessName) => {
  const status = {
    cpu: { type: 'success', message: '异常检测结果：当前CPU资源无异常' },
    memory: { type: 'success', message: '异常检测结果：当前内存资源无异常' },
    disk: { type: 'success', message: '异常检测结果：当前磁盘资源无异常' }
  };

  try {
    // 获取业务预测数据 - 使用小时级别数据
    const timeSeriesData = await timeDataStore_.get_bussiness_prediction('H', businessName);
    
    if (timeSeriesData && timeSeriesData.data && timeSeriesData.data.prediction) {
      const predData = timeSeriesData.data.prediction;
      
      // 检查预测数据是否存在
      if (predData.predict_series && predData.predict_series.DLinear) {
        const dlinearData = predData.predict_series.DLinear;
        
        // CPU异常检测
        if (dlinearData.CPU && dlinearData.CPU.length > 0) {
          const cpuValues = dlinearData.CPU.map(item => item[1]).filter(v => v !== null && !isNaN(v));
          if (cpuValues.length > 0) {
            const cpuMax = Math.max(...cpuValues);
            if (cpuMax > 30) {
              status.cpu.type = 'error';
              status.cpu.message = `异常检测结果：当前CPU资源存在异常(${cpuMax.toFixed(1)}% > 30%)，请注意！`;
            } else {
              status.cpu.message = `异常检测结果：当前CPU资源无异常(${cpuMax.toFixed(1)}%)`;
            }
          }
        }

        // 内存异常检测
        if (dlinearData.MEM && dlinearData.MEM.length > 0) {
          const memValues = dlinearData.MEM.map(item => item[1]).filter(v => v !== null && !isNaN(v));
          if (memValues.length > 0) {
            const memoryMax = Math.max(...memValues);
            if (memoryMax > 30) {
              status.memory.type = 'error';
              status.memory.message = `异常检测结果：当前内存资源存在异常(${memoryMax.toFixed(1)}% > 30%)，请注意！`;
            } else {
              status.memory.message = `异常检测结果：当前内存资源无异常(${memoryMax.toFixed(1)}%)`;
            }
          }
        }

        // 磁盘异常检测
        if (dlinearData.DISK && dlinearData.DISK.length > 0) {
          const diskValues = dlinearData.DISK.map(item => item[1]).filter(v => v !== null && !isNaN(v));
          if (diskValues.length > 0) {
            const diskMax = Math.max(...diskValues);
            if (diskMax > 30) {
              status.disk.type = 'error';
              status.disk.message = `异常检测结果：当前磁盘资源存在异常(${diskMax.toFixed(1)}% > 30%)，请注意！`;
            } else {
              status.disk.message = `异常检测结果：当前磁盘资源无异常(${diskMax.toFixed(1)}%)`;
            }
          }
        }
      }
    }
  } catch (error) {
    console.error(`获取业务 ${businessName} 预测数据失败:`, error);
    // 保持默认的正常状态
  }

  return status;
};



// 加载业务列表和异常状态
const loadBusinessData = async () => {
  try {
    const res = await timeDataStore_.get_business_list();
    const businesses = res.data?.available_business || ['营销管理系统', '客户管理系统', '订单管理系统'];

    // 为每个业务异步获取异常检测状态
    const businessPromises = businesses.map(async (name) => ({
      name,
      status: await checkBusinessAnomalies(name)
    }));

    const businessData = await Promise.all(businessPromises);

    // 对业务列表进行排序：异常的负载显示在前面，正常的列在后面
    // 检查业务是否有任何异常（CPU、内存、磁盘任一指标异常）
    const hasAnomaly = (business) => {
      return business.status.cpu.type === 'error' ||
             business.status.memory.type === 'error' ||
             business.status.disk.type === 'error';
    };

    // 按异常状态排序：异常的在前，正常的在后
    businessList.value = businessData.sort((a, b) => {
      const aHasAnomaly = hasAnomaly(a);
      const bHasAnomaly = hasAnomaly(b);

      // 如果 a 有异常而 b 无异常，a 排在前面
      if (aHasAnomaly && !bHasAnomaly) return -1;
      // 如果 b 有异常而 a 无异常，b 排在前面
      if (!aHasAnomaly && bHasAnomaly) return 1;
      // 如果两者状态相同，保持原有顺序
      return 0;
    });

  } catch (error) {
    console.error('获取业务列表失败:', error);
    // 使用默认业务列表并异步获取状态
    const defaultBusinesses = ['营销管理系统', '客户管理系统', '订单管理系统'];
    const businessPromises = defaultBusinesses.map(async (name) => ({
      name,
      status: await checkBusinessAnomalies(name)
    }));

    const businessData = await Promise.all(businessPromises);

    // 对默认业务列表也进行相同的排序
    const hasAnomaly = (business) => {
      return business.status.cpu.type === 'error' ||
             business.status.memory.type === 'error' ||
             business.status.disk.type === 'error';
    };

    businessList.value = businessData.sort((a, b) => {
      const aHasAnomaly = hasAnomaly(a);
      const bHasAnomaly = hasAnomaly(b);

      if (aHasAnomaly && !bHasAnomaly) return -1;
      if (!aHasAnomaly && bHasAnomaly) return 1;
      return 0;
    });
  }
};

// 刷新数据
const handleRefresh = async () => {
  loading.value = true;
  
  try {
    await loadBusinessData();
  } catch (error) {
    console.error('刷新数据失败:', error);
  } finally {
    loading.value = false;
  }
};

// 生命周期
onMounted(() => {
  loadBusinessData();
});
</script>

<style scoped>
.payload-anomaly-panel {
  width: 100%;
}

.metric-title {
  font-weight: 600;
  margin-bottom: 10px;
  text-align: center;
  color: #333;
  font-size: 14px;
}

/* iView 样式覆盖 */
:deep(.ivu-card) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.ivu-card:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

:deep(.ivu-alert) {
  border-radius: 4px;
}

:deep(.ivu-divider) {
  margin: 16px 0;
}
</style>
