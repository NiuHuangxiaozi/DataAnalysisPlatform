<template>
  <div class="resource-page p-4">
    <h1 class="mb-4">资源分配建议</h1>

    <Card class="mb-4">
      <p>
        在本次监控服务中，我们对所有业务涉及的100台虚拟机进行了全面且细致的监控。我们对每台虚拟机的资源使用情况进行了实时跟踪和分析，包括CPU使用率、内存占用、磁盘I/O等多个关键指标。经过详细的数据分析，我们发现其中有15台虚拟机的资源使用率已经接近或达到了其当前配置的上限。与此同时，有9台虚拟机的资源使用率远低于其当前配置，这些机器可能存在过度配置的情况，需要进行资源缩容。我们建议对以上虚拟机进行资源扩容与缩容操作，以优化资源配置，提高资源利用率。
      </p>
    </Card>

    <!-- 机器选择 -->
    <Form inline style="display: flex; justify-content: center; align-items: center; gap: 16px;" class="mb-4">

      <FormItem label="选择对应的业务：">
        <Select v-model="selectedBusiness" style="width:200px" @on-change="handleMachineChange">
          <Option v-for="business in BusinessOptions" :key="business" :value="business">
            {{ business }}
          </Option>
        </Select>
      </FormItem>

      <FormItem label="选择机器：">
        <Select v-model="selectedVM" style="width:200px">
        <Option v-for="vm in VMOptions" :key="vm" :value="vm">
          {{ vm }}
        </Option>
        </Select>
      </FormItem>    
    </Form>

    <button type="button"  style="width:200px" @click="showAdvice">
          确认
    </button>

    <!-- CPU 资源分配建议 -->
    <Card class="mb-4">
      <h2 class="mb-3">CPU 资源分配建议</h2>
      <p class="mb-1">{{ cpuText }}</p>
    </Card>

    <!-- 内存资源分配建议 -->
    <Card class="mb-4">
      <h2 class="mb-3">内存资源分配建议</h2>
      <p class="mb-1">{{ memText }}</p>
    </Card>

    <!-- 磁盘资源分配建议 -->
    <Card class="mb-4">
      <h2 class="mb-3">磁盘资源分配建议</h2>
      <p class="mb-1">{{ diskText }}</p>
    </Card>

    <!-- 模型结构与处理图 -->
    <Card class="text-center">
      <h4 class="mb-4">模型结构与处理图</h4>
      <img src="../assets/tan.png" alt="模型结构与处理图" class="img-fluid" style="max-width: 100%; height: auto;" />
    </Card>
  </div>
</template>

<script setup>

import { ref, onMounted, onBeforeUnmount } from 'vue'
import {timeDataStore} from '../store/data'

// 全局访问数据库
const time_data_store = timeDataStore()


// 选择的业务
const BusinessOptions = ref([])
const selectedBusiness = ref('')

// 选择的机器
const VMOptions = ref([])
const selectedVM = ref('');

// 默认检测的算法
const algorithm_name = ref('MEMA')
const scale = ref('H')

// 建议的文本
const cpuText = ref()
const memText = ref()
const diskText = ref()


// 拉取的时间数据，原本可以用全局变量存储，这里解耦一下，防止以后有更大的bug
const data = ref([])

const columns = [
  { title: '资源分配建议', key: 'advice', align: 'center' }
]


const Timestamps2TimeLabel = (time_stamp)=>{

  let time_date = new Date(time_stamp * 1000)
  const label = `${time_date.getFullYear()}/${time_date.getMonth() + 1}/${time_date.getDate()}/${time_date.getHours()}:00`
  return label
}
// 从后端的一堆东西中提取数据
function SelectUsefulData(time_series_entry, algorithm){


    console.log(time_series_entry)
    // 统计序列长度
    let history_lengh = time_series_entry.data.prediction.series.length
    let prediction_length = time_series_entry.data.prediction.predict_series.length
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
    history_lists.CPU.series.forEach(element => {
        cpu[cpu_idx] = element[1]
        times[cpu_idx]=Timestamps2TimeLabel(element[0])
        cpu_idx = cpu_idx + 1
    });

    history_lists.DISK.series.forEach(element => {
        disk[disk_idx] = element[1]
        disk_idx = disk_idx + 1
    });

    history_lists.MEM.series.forEach(element => {
        memory[mem_idx] = element[1]
        mem_idx = mem_idx + 1
    })
    
    let cpu_pred_list;
    let disk_pred_list
    let mem_pred_list
    // 加载某一种算法的预测序列
    if(algorithm.value == "DLinear"){
      console.log("算法转化为DLinear")
      cpu_pred_list = predict_lists.DLinear.CPU
      disk_pred_list = predict_lists.DLinear.DISK
      mem_pred_list = predict_lists.DLinear.MEM
    }
    else if (algorithm.value == "MEMA"){
      console.log("算法转化为MEMA")

      cpu_pred_list = predict_lists.MEMA.CPU
      disk_pred_list = predict_lists.MEMA.DISK
      mem_pred_list = predict_lists.MEMA.MEM
    }

    // 为了保证预测数据和历史数据的衔接，这里我们的Pred后缀结尾的数组要保留一个历史真实数据
    cpuPred[cpu_idx-1] = history_lists.CPU.series[cpu_idx-1][1]
    diskPred[disk_idx-1] = history_lists.DISK.series[disk_idx-1][1]
    memoryPred[mem_idx-1] = history_lists.MEM.series[mem_idx-1][1]

    // 加载预测数据
    console.log("cpu_pred_list is ", cpu_pred_list)
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


    // 求出最大值和最小值, 方便y轴渲染
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


// 加载对应ip
async function handleMachineChange() {
  if (!selectedBusiness.value)
  alert("业务不为空")
  updateVMOptions()
}
async function showAdvice() {
  

  if (!selectedBusiness.value && selectedVM.value){
    alert("请选择对应业务！！！")
    return
  }
  if (selectedBusiness.value && !selectedVM.value){
    alert("请选择对应机器！！！")
    return
  }
  
  // 获得对应的
  if (selectedBusiness.value && selectedVM.value) {
     
    // 拉去对应的数据
    try{
      
      const time_series = await time_data_store.get_vm_prediction(scale.value,
                                                                  selectedBusiness.value,
                                                                  selectedVM.value)
      data.value = SelectUsefulData(time_series, algorithm_name);
      }
    catch(e){
      console.error("拉取数据错误",e)
    }


    // 分析数据是否异常
    console.log(data.value.cpuPred)
    const cpuMaxValue = Math.max([...data.value.cpuPred.filter(v => v!==null && !Number.isNaN(v))])
    const memMaxValue = Math.max([...data.value.memoryPred.filter(v => v!==null && !Number.isNaN(v))])
    const diskMaxValue = Math.max([...data.value.diskPred.filter(v => v!==null && !Number.isNaN(v))])


    if(cpuMaxValue.value > 80){
      cpuText.value = "目前CPU的整体运行有风险，预计最大的负载会超过80%,请做好预警，及时增加资源！！！！"
    }
    else{
      cpuText.value = "目前CPU的整体运行平稳，预计最大的负载不会超过80%,系统正常。"
    }

    if(memMaxValue.value > 80){
      memText.value = "目前内存的整体运行有风险，预计最大的负载会超过80%,请做好预警，及时增加资源！！！！"
    }
    else{
      memText.value = "目前内存的整体运行平稳，预计最大的负载不会超过80%,系统正常。"
    }

    if(diskMaxValue.value > 80){
      diskText.value = "目前磁盘的整体运行有风险，预计最大的负载会超过80%,请做好预警，及时增加资源！！！！"
    }
    else{
      diskText.value = "目前磁盘的整体运行平稳，预计最大的负载不会超过80%,系统正常。"
    }

    console.log("建议处理完毕", cpuText,memText,diskText)
  }
}




// 从后端拿到对应的所有的业务
const updateBusinessOptions = async ()=>{
  try {

      const res = await time_data_store.get_business_list()
      BusinessOptions.value = res.data.available_business || []

  } catch (e) {
      console.error('[ResourceElasticScaling]:获取业务数据失败:', e)
  }
}

// 从后端拿到目前存在的业务
const updateVMOptions = async ()=>{
  try {

      console.log("[ResourceElasticScaling]:bussiness name ", selectedBusiness.value)
      const res = await time_data_store.get_vm_list(selectedBusiness.value)
      VMOptions.value = res.data.available_machine_ips.H  || []
      console.log("vm list is ", VMOptions.value)
      
  } catch (e) {
      console.error('[ResourceElasticScaling]: 获取业务主机数据失败:', e)
  }
}

// 在组件挂载时初始化默认数据
async function initVM() {

  // 获得所有的业务
  await updateBusinessOptions();

  // // 获得业务下所有的主机
  // await updateVMOptions();

}
onMounted(()=>{
  // 显示默认的数据
  initVM();
  
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

})
</script>

<style scoped>
.resource-page {
  background: #f9f9f9;
}
h1, h2, h4 {
  font-weight: 600;
}
</style>
