<template>
  <div class="anomaly-container">
    <!-- 标题 -->
    <Card dis-hover :bordered="false" style="margin-bottom: 20px;">
      <h2 style="text-align: center; margin: 0; color: #2d8cf0;">异常检测中心</h2>
    </Card>

    <!-- 标签页 -->
    <Tabs v-model="activeTab" type="card" style="margin-bottom: 20px;">
      <TabPane label="业务异常检测" name="business">
        <BusinessAnomalyPanel />
      </TabPane>
      <TabPane label="负载均衡异常检测" name="payload">
        <PayloadAnomalyPanel />
      </TabPane>
      <TabPane label="基础设施异常检测" name="vm">
        <VMAnomalyPanel />
      </TabPane>
    </Tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import BusinessAnomalyPanel from '../components/BusinessAnomalyPanel.vue';
import PayloadAnomalyPanel from '../components/PayloadAnomalyPanel.vue';
import VMAnomalyPanel from '../components/VMAnomalyPanel.vue';

// 组件名称定义
defineOptions({
  name: 'AnomalyDetection'
});

// 当前活跃的标签页
const activeTab = ref('business');
</script>

<style scoped>
.anomaly-container {
  padding: 20px;
  background: #f5f7f9;
  min-height: 100vh;
}

/* iView 样式覆盖 */
:deep(.ivu-card) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.ivu-card:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

:deep(.ivu-tabs-card > .ivu-tabs-bar .ivu-tabs-tab) {
  border-radius: 6px 6px 0 0;
  margin-right: 5px;
}

:deep(.ivu-tabs-content) {
  margin-top: 0;
}
</style>
