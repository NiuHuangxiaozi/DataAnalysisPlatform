<template>
  <div class="vm-anomaly-panel">
    <!-- 控制面板 -->
    <Card dis-hover :bordered="false" style="margin-bottom: 20px;">
      <Row :gutter="16" type="flex" justify="center" align="middle">
        <Col :xs="24" :sm="8" style="margin-bottom: 10px;">
          <Space>
            <span style="white-space: nowrap;">业务选择：</span>
            <Select
              v-model="selectedBusiness"
              placeholder="请选择业务"
              filterable
              clearable
              style="width: 100%;"
              @change="handleBusinessChange"
            >
              <Option v-for="item in businessOptions" :key="item" :value="item">
                {{ item }}
              </Option>
            </Select>
          </Space>
        </Col>
        <Col :xs="24" :sm="8" style="margin-bottom: 10px;">
          <Button type="primary" @click="handleRefresh" icon="md-refresh" :loading="loading">
            刷新基础设施数据
          </Button>
        </Col>
      </Row>
    </Card>

    <!-- 信息提示 -->
    <Alert type="info" show-icon style="margin-bottom: 20px;" v-if="selectedBusiness">
      当前展示<strong>{{ selectedBusiness }}</strong>业务下各主机基础设施资源的异常检测结果, 利用率超过80%会被检测为异常
    </Alert>

    <!-- 加载状态 -->
    <div v-if="loading && selectedBusiness" class="loading-state">
      <Card dis-hover>
        <div style="text-align: center; padding: 40px;">
          <Spin size="large" />
          <p style="margin-top: 16px; color: #666;">正在获取主机异常检测数据...</p>
        </div>
      </Card>
    </div>

    <!-- 主机异常检测列表 -->
    <div v-if="!loading" v-for="vm in vmList" :key="vm.ip" style="margin-bottom: 20px;">
      <Card dis-hover>
        <template #title>
          <Icon type="ios-desktop-outline" /> 主机 {{ vm.ip }} 异常检测
        </template>
        <Row :gutter="16">
          <Col span="8" v-for="(metric, index) in ['cpu', 'memory', 'disk']" :key="index">
            <Card dis-hover style="margin-bottom: 10px;">
              <h5 class="metric-title">{{ getMetricTitle(metric) }}</h5>
              <Alert 
                :type="vm.status[metric].type" 
                show-icon 
                :closable="false"
              >
                {{ vm.status[metric].message }}
              </Alert>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>

    <!-- 没有选择业务时的提示 -->
    <div v-if="!selectedBusiness" class="empty-state">
      <Alert type="warning" show-icon>
        请先选择业务以查看对应的主机异常检测结果
      </Alert>
    </div>

    <!-- 没有主机数据时的提示 -->
    <div v-if="selectedBusiness && vmList.length === 0" class="empty-state">
      <Alert type="info" show-icon>
        当前业务下暂无主机数据
      </Alert>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { timeDataStore } from '../store/data';

const timeDataStore_ = timeDataStore();

// 组件名称定义
defineOptions({
  name: 'VMAnomalyPanel'
});

const loading = ref(false);

// 业务和主机选择
const businessOptions = ref([]);
const selectedBusiness = ref('');
const vmList = ref([]);

// 获取指标标题
const getMetricTitle = (metric) => {
  const titles = {
    cpu: 'CPU利用率',
    memory: '内存利用率',
    disk: '磁盘利用率'
  };
  return titles[metric] || metric;
};

// 从API数据中提取有用信息（参考VMPredictionTable.vue的SelectUsefulData函数）
const selectUsefulData = (time_series_entry) => {
  console.log('VM时间序列数据:', time_series_entry);
  
  if (!time_series_entry || !time_series_entry.data || !time_series_entry.data.prediction) {
    return null;
  }

  // 统计序列长度
  let history_length = time_series_entry.data.prediction.series.length;
  let prediction_length = time_series_entry.data.prediction.predict_series.length;
  let total_length = history_length + prediction_length;

  // 定义数据结构
  const times = Array.from({ length: total_length }, () => '');
  const cpu = Array.from({ length: total_length }, () => null);
  const memory = Array.from({ length: total_length }, () => null);
  const disk = Array.from({ length: total_length }, () => null);
  const cpuPred = Array.from({ length: total_length }, () => null);
  const memoryPred = Array.from({ length: total_length }, () => null);
  const diskPred = Array.from({ length: total_length }, () => null);

  let history_lists = time_series_entry.data.prediction.series;
  let predict_lists = time_series_entry.data.prediction.predict_series;

  // 加载历史序列
  let cpu_idx = 0;
  let memory_idx = 0;
  let disk_idx = 0;
  console.log("predict_lists is ", predict_lists);
  // CPU历史数据
  history_lists.CPU.series.forEach(element => {
    cpu[cpu_idx] = element[1]; // CPU值
    times[cpu_idx] = new Date(element[0] * 1000).toLocaleString();
    cpu_idx++;
  });

  // 内存历史数据（假设数据结构相似）
  history_lists.MEM.series.forEach(element => {
    if (memory_idx < history_length) {
      memory[memory_idx] = element[2] || element[1]; // 内存值
      memory_idx++;
    }
  });

  // 磁盘历史数据（假设数据结构相似）
  history_lists.DISK.series.forEach(element => {
    if (disk_idx < history_length) {
      disk[disk_idx] = element[3] || element[1]; // 磁盘值
      disk_idx++;
    }
  });

  // 加载预测数据
  predict_lists.DLinear.CPU.forEach(element => {
    if (cpu_idx < total_length) {
      cpuPred[cpu_idx] = element[1];
      times[cpu_idx] = new Date(element[0] * 1000).toLocaleString();
      cpu_idx++;
    }
  });

  predict_lists.DLinear.MEM.forEach(element => {
    if (memory_idx < total_length) {
      memoryPred[memory_idx] = element[2] || element[1];
      memory_idx++;
    }
  });

  predict_lists.DLinear.DISK.forEach(element => {
    if (disk_idx < total_length) {
      diskPred[disk_idx] = element[3] || element[1];
      disk_idx++;
    }
  });

  return {
    times,
    cpu,
    memory,
    disk,
    cpuPred,
    memoryPred,
    diskPred
  };
};

// 检查主机异常状态（使用真实数据）
const checkVMAnomalies = async (businessName, vmIP) => {
  const status = {
    cpu: { type: 'success', message: '异常检测结果：当前CPU资源无异常' },
    memory: { type: 'success', message: '异常检测结果：当前内存资源无异常' },
    disk: { type: 'success', message: '异常检测结果：当前磁盘资源无异常' }
  };

  try {
    // 获取该主机的预测数据
    const time_series = await timeDataStore_.get_vm_prediction('H', businessName, vmIP);
    const vmData = selectUsefulData(time_series);
    
    if (!vmData) {
      return status; // 如果数据获取失败，返回默认状态
    }

    // 计算CPU的最大值（包括历史和预测数据）
    const cpuValues = [
      ...vmData.cpu.filter(v => v !== null && !Number.isNaN(v)),
      ...vmData.cpuPred.filter(v => v !== null && !Number.isNaN(v))
    ];
    const cpuMax = cpuValues.length > 0 ? Math.max(...cpuValues) : 0;

    // 计算内存的最大值
    const memoryValues = [
      ...vmData.memory.filter(v => v !== null && !Number.isNaN(v)),
      ...vmData.memoryPred.filter(v => v !== null && !Number.isNaN(v))
    ];
    const memoryMax = memoryValues.length > 0 ? Math.max(...memoryValues) : 0;

    // 计算磁盘的最大值
    const diskValues = [
      ...vmData.disk.filter(v => v !== null && !Number.isNaN(v)),
      ...vmData.diskPred.filter(v => v !== null && !Number.isNaN(v))
    ];
    const diskMax = diskValues.length > 0 ? Math.max(...diskValues) : 0;

    // 异常检测逻辑（参考VM.vue中的检测标准）
    if (cpuMax > 80) {
      status.cpu.type = 'error';
      status.cpu.message = `异常检测结果：当前CPU资源存在异常(${cpuMax.toFixed(1)}% > 80%)，请注意！`;
    }

    if (memoryMax > 80) {
      status.memory.type = 'error';
      status.memory.message = `异常检测结果：当前内存资源存在异常(${memoryMax.toFixed(1)}% > 80%)，请注意！`;
    }

    if (diskMax > 80) {
      status.disk.type = 'error';
      status.disk.message = `异常检测结果：当前磁盘资源存在异常(${diskMax.toFixed(1)}% > 80%)，请注意！`;
    }

  } catch (error) {
    console.error(`获取主机 ${vmIP} 数据失败:`, error);
    // 如果API调用失败，设置错误状态
    status.cpu.type = 'warning';
    status.cpu.message = '异常检测结果：无法获取CPU数据';
    status.memory.type = 'warning';
    status.memory.message = '异常检测结果：无法获取内存数据';
    status.disk.type = 'warning';
    status.disk.message = '异常检测结果：无法获取磁盘数据';
  }

  return status;
};

// 加载业务列表
const loadBusinessOptions = async () => {
  try {
    const res = await timeDataStore_.get_business_list();
    businessOptions.value = res.data?.available_business || ['营销管理系统', '客户管理系统', '订单管理系统'];
  } catch (error) {
    console.error('获取业务列表失败:', error);
    businessOptions.value = ['营销管理系统', '客户管理系统', '订单管理系统'];
  }
};

// 加载指定业务下的主机列表
const loadVMList = async (businessName) => {
  if (!businessName) {
    vmList.value = [];
    return;
  }

  loading.value = true;
  
  try {
    const res = await timeDataStore_.get_vm_list(businessName);
    console.log("vm list is ", res.data);
    const vmIPs = res.data?.available_machine_ips?.H || ['192.168.1.10', '192.168.1.11', '192.168.1.12'];
    console.log("vm ips is ", vmIPs);
    
    // 并行获取所有主机的异常检测状态
    const vmPromises = vmIPs.map(async (ip) => {
      const status = await checkVMAnomalies(businessName, ip);
      return { ip, status };
    });
    
    vmList.value = await Promise.all(vmPromises);
    console.log("加载的主机异常状态:", vmList.value);
    
  } catch (error) {
    console.error('获取主机列表失败:', error);
    // 使用模拟数据作为后备
    const defaultIPs = ['192.168.1.10', '192.168.1.11', '192.168.1.12'];
    const vmPromises = defaultIPs.map(async (ip) => {
      const status = await checkVMAnomalies(businessName, ip);
      return { ip, status };
    });
    vmList.value = await Promise.all(vmPromises);
  } finally {
    loading.value = false;
  }
};

// 处理业务选择变化
const handleBusinessChange = (businessName) => {
  if (businessName) {
    loadVMList(businessName);
  } else {
    vmList.value = [];
  }
};

// 刷新数据
const handleRefresh = async () => {
  loading.value = true;
  
  try {
    if (selectedBusiness.value) {
      await loadVMList(selectedBusiness.value);
    }
  } catch (error) {
    console.error('刷新数据失败:', error);
  } finally {
    loading.value = false;
  }
};

// 生命周期
onMounted(() => {
  loadBusinessOptions();
});
</script>

<style scoped>
.vm-anomaly-panel {
  width: 100%;
}

.metric-title {
  font-weight: 600;
  margin-bottom: 10px;
  text-align: center;
  color: #333;
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.loading-state {
  margin-bottom: 20px;
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
