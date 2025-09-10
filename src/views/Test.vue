<template>
  <div class="resource-page p-4">
    <h1 class="mb-4">资源分配建议</h1>

    <Card class="mb-4">
      <p>
        在本次监控服务中，我们对所有业务涉及的100台虚拟机进行了全面且细致的监控。我们对每台虚拟机的资源使用情况进行了实时跟踪和分析，包括CPU使用率、内存占用、磁盘I/O等多个关键指标。经过详细的数据分析，我们发现其中有15台虚拟机的资源使用率已经接近或达到了其当前配置的上限。与此同时，有9台虚拟机的资源使用率远低于其当前配置，这些机器可能存在过度配置的情况，需要进行资源缩容。我们建议对以上虚拟机进行资源扩容与缩容操作，以优化资源配置，提高资源利用率。
      </p>
    </Card>

    <!-- 机器选择 -->
    <Form inline class="mb-4">
      <FormItem label="选择机器：">
        <Select v-model="selectedMachine" style="width:200px" @on-change="handleMachineChange">
          <Option v-for="i in 100" :key="i" :value="`VM${i}`">VM_{{ i }}</Option>
        </Select>
      </FormItem>
    </Form>

    <!-- CPU 资源分配建议 -->
    <Card class="mb-4">
      <h2 class="mb-3">CPU 资源分配建议</h2>
      <Table :columns="columns" :data="cpuData" border stripe />
    </Card>

    <!-- 内存资源分配建议 -->
    <Card class="mb-4">
      <h2 class="mb-3">内存资源分配建议</h2>
      <Table :columns="columns" :data="memoryData" border stripe />
    </Card>

    <!-- 磁盘资源分配建议 -->
    <Card class="mb-4">
      <h2 class="mb-3">磁盘资源分配建议</h2>
      <Table :columns="columns" :data="diskData" border stripe />
    </Card>

    <!-- 模型结构与处理图 -->
    <Card class="text-center">
      <h4 class="mb-4">模型结构与处理图</h4>
      <!-- <img src="static/pictures/tan.png" alt="模型结构与处理图" class="img-fluid" style="max-width: 100%; height: auto;" /> -->
    </Card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

const selectedMachine = ref(localStorage.getItem('selectedMachine') || 'VM1')

const columns = [
  { title: '时间范围', key: 'time', align: 'center', width: 150 },
  { title: '资源分配建议', key: 'advice', align: 'center' }
]

const cpuData = ref([])
const memoryData = ref([])
const diskData = ref([])

function handleMachineChange(value) {
  localStorage.setItem('selectedMachine', value)
  fetchCSVData()
}

function generateAdvice(value) {
  if (value > 0) return `检测未来资源利用率上升，建议提升资源分配量的 ${value}%`
  if (value < 0) return `检测未来资源利用率下降，建议缩减资源分配量的 ${Math.abs(value)}%`
  return '无需调整资源'
}

async function fetchCSVData() {
  const filename = `prediction-data/${selectedMachine.value}_allocation.csv`
  try {
    const response = await fetch(filename)
    if (!response.ok) throw new Error(`文件 ${filename} 不存在`)
    const text = await response.text()
    const rows = text.trim().split('\n').map(r => r.split(','))

    const headers = rows[0]
    const cpuIndex = headers.indexOf('cpu利用率')
    const memoryIndex = headers.indexOf('内存利用率')
    const diskIndex = headers.indexOf('磁盘利用率')

    const cpuList = []
    const memoryList = []
    const diskList = []

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      const cpuValue = parseFloat(row[cpuIndex])
      const memoryValue = parseFloat(row[memoryIndex])
      const diskValue = parseFloat(row[diskIndex])

      cpuList.push({ time: `未来 ${i} 月内`, advice: generateAdvice(cpuValue) })
      memoryList.push({ time: `未来 ${i} 月内`, advice: generateAdvice(memoryValue) })
      diskList.push({ time: `未来 ${i} 月内`, advice: generateAdvice(diskValue) })
    }

    cpuData.value = cpuList
    memoryData.value = memoryList
    diskData.value = diskList
  } catch (error) {
    console.error('CSV 读取失败:', error)
    cpuData.value = []
    memoryData.value = []
    diskData.value = []
  }
}

onMounted(fetchCSVData)
</script>

<style scoped>
.resource-page {
  background: #f9f9f9;
}
h1, h2, h4 {
  font-weight: 600;
}
</style>
