// 从后端相关性时间序列里面提取相关数据

import { normalizeTwoArrays } from "./tools"



const Timestamps2TimeLabel = (time_stamp)=>{
  let time_date = new Date(time_stamp * 1000)
  const label = `${time_date.getFullYear()}/${time_date.getMonth() + 1}/${time_date.getDate()}/${time_date.getHours()}:00`
  return label
}

// 给定序列然后提取预测的历史数据
function getData_from_different_method(series, target , times, index){
    // 加载预测数据
    series.forEach(element => {
      target[index] = element[1]
      if(times != null)
        times[index]=Timestamps2TimeLabel(element[0])
      index = index + 1
    })
}



// 相关系数时间序列数据分析
export function select_data_from_cor_time_series(time_series_entry){
    // 统计序列长度
    let history_lengh = time_series_entry.data.data.H["6"].series.CPU.length
    let prediction_length = time_series_entry.data.data.H["6"].predict_series.DLinear.CPU.length
    console.log("[COR]: history_lengh" ,history_lengh)
    console.log("[COR]: prediction_length" ,prediction_length)

    let total_length = history_lengh + prediction_length
    console.log("[COR]: total_length" ,total_length)


    // 定义数据结构
    const times = Array.from({ length: total_length }, () => '') // 时间数组：默认空字符串
    
    // 7种序列的历史数据
    const cpu = Array.from({ length: total_length }, () => null) // CPU数组：默认0（数值类型）
    const memory = Array.from({ length: total_length }, () => null) // 内存数组：默认0
    const disk = Array.from({ length: total_length }, () => null) // 磁盘数组：默认0
    const apdex = Array.from({ length: total_length }, () => null) 
    const average_response_time = Array.from({ length: total_length }, () => null)
    const request_failed_rate = Array.from({ length: total_length }, () => null) 
    const request_total_count = Array.from({ length: total_length }, () => null) 
    
    
    // 在Dlinear算法下面的预测数据
    const dlinear_cpuPred = Array.from({ length: total_length }, () => null) // CPU预测数组：默认0
    const dlinear_memoryPred = Array.from({ length: total_length }, () => null) // 内存预测数组：默认0
    const dlinear_diskPred = Array.from({ length: total_length }, () => null) // 磁盘预测数组：默认0
    const dlinear_apdexPred = Array.from({ length: total_length }, () => null) 
    const dlinear_average_response_time_Pred = Array.from({ length: total_length }, () => null) 
    const dlinear_request_failed_rate_Pred = Array.from({ length: total_length }, () => null)
    const dlinear_request_total_count_Pred = Array.from({ length: total_length }, () => null)

    // 在MEMA下面的预测数据
    const MEMA_cpuPred = Array.from({ length: total_length }, () => null) // CPU预测数组：默认0
    const MEMA_memoryPred = Array.from({ length: total_length }, () => null) // 内存预测数组：默认0
    const MEMA_diskPred = Array.from({ length: total_length }, () => null) // 磁盘预测数组：默认0
    const MEMA_apdexPred = Array.from({ length: total_length }, () => null) 
    const MEMA_average_response_time_Pred = Array.from({ length: total_length }, () => null) 
    const MEMA_request_failed_rate_Pred = Array.from({ length: total_length }, () => null)
    const MEMA_request_total_count_Pred = Array.from({ length: total_length }, () => null)


    // 加载历史序列
    let cpu_idx = 0 
    let disk_idx = 0
    let mem_idx = 0
    let apdex_idx = 0 
    let average_response_time_idx = 0
    let request_failed_rate_idx = 0
    let request_total_count_idx = 0

    let history_lists = time_series_entry.data.data.H["6"].series
    let predict_lists = time_series_entry.data.data.H["6"].predict_series

    // 归一化



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
    
    history_lists.apdex.forEach(element => {
        apdex[apdex_idx] = element[1]
        apdex_idx = apdex_idx + 1
    });

    // 平均响应时间
    history_lists.average_response_time.forEach(element => {
        average_response_time[average_response_time_idx] = element[1]
        average_response_time_idx = average_response_time_idx + 1
    });

    // 请求错误率
    history_lists.request_failed_rate.forEach(element => {
        request_failed_rate[request_failed_rate_idx] = element[1]
        request_failed_rate_idx = request_failed_rate_idx + 1
    })
    
    // 吞吐量
    history_lists.request_total_count.forEach(element => {
        request_total_count[request_total_count_idx] = element[1]
        request_total_count_idx = request_total_count_idx + 1
    })

    
    // 为了保证预测数据和历史数据的衔接，这里我们的Pred后缀结尾的数组要保留一个历史真实数据
    dlinear_cpuPred[cpu_idx-1] = history_lists.CPU[cpu_idx-1][1]
    dlinear_memoryPred[mem_idx-1] = history_lists.MEM[mem_idx-1][1]
    dlinear_diskPred[disk_idx-1] = history_lists.DISK[disk_idx-1][1]
    dlinear_apdexPred[apdex_idx-1] = history_lists.apdex[apdex_idx-1][1]
    dlinear_average_response_time_Pred[average_response_time_idx-1] = history_lists.average_response_time[average_response_time_idx-1][1]
    dlinear_request_failed_rate_Pred[request_failed_rate_idx-1] = history_lists.request_failed_rate[request_failed_rate_idx-1][1]
    dlinear_request_total_count_Pred[request_total_count_idx-1] = history_lists.request_total_count[request_total_count_idx-1][1]

    MEMA_cpuPred[cpu_idx-1] = history_lists.CPU[cpu_idx-1][1]
    MEMA_memoryPred[mem_idx-1] = history_lists.MEM[mem_idx-1][1]
    MEMA_diskPred[disk_idx-1] = history_lists.DISK[disk_idx-1][1]
    MEMA_apdexPred[apdex_idx-1] = history_lists.apdex[apdex_idx-1][1]
    MEMA_average_response_time_Pred[average_response_time_idx-1] = history_lists.average_response_time[average_response_time_idx-1][1]
    MEMA_request_failed_rate_Pred[request_failed_rate_idx-1] = history_lists.request_failed_rate[request_failed_rate_idx-1][1]
    MEMA_request_total_count_Pred[request_total_count_idx-1] = history_lists.request_total_count[request_total_count_idx-1][1]



    // Dlinear
    getData_from_different_method(predict_lists.DLinear.CPU, dlinear_cpuPred, times, cpu_idx)
    getData_from_different_method(predict_lists.DLinear.MEM, dlinear_memoryPred, null, mem_idx)
    getData_from_different_method(predict_lists.DLinear.DISK, dlinear_diskPred, null, disk_idx)
    getData_from_different_method(predict_lists.DLinear.apdex, dlinear_apdexPred, null, apdex_idx)
    getData_from_different_method(predict_lists.DLinear.average_response_time, dlinear_average_response_time_Pred, null, average_response_time_idx)
    getData_from_different_method(predict_lists.DLinear.request_failed_rate, dlinear_request_failed_rate_Pred, null, request_failed_rate_idx)
    getData_from_different_method(predict_lists.DLinear.request_total_count, dlinear_request_total_count_Pred, null, request_total_count_idx)


    // MEMA
    getData_from_different_method(predict_lists.MEMA.CPU, MEMA_cpuPred, null, cpu_idx)
    getData_from_different_method(predict_lists.MEMA.MEM, MEMA_memoryPred, null, mem_idx)
    getData_from_different_method(predict_lists.MEMA.DISK, MEMA_diskPred, null, disk_idx)
    getData_from_different_method(predict_lists.MEMA.apdex, MEMA_apdexPred, null, apdex_idx)
    getData_from_different_method(predict_lists.MEMA.average_response_time, MEMA_average_response_time_Pred, null, average_response_time_idx)
    getData_from_different_method(predict_lists.MEMA.request_failed_rate, MEMA_request_failed_rate_Pred, null, request_failed_rate_idx)
    getData_from_different_method(predict_lists.MEMA.request_total_count, MEMA_request_total_count_Pred, null, request_total_count_idx)



    // 归一化
    let dlinear_cpu = Array.from(cpu);
    let dlinear_memory = Array.from(memory);
    let dlinear_disk = Array.from(disk);
    let dlinear_apdex = Array.from(apdex);
    let dlinear_average_response_time = Array.from(average_response_time);
    let dlinear_request_failed_rate = Array.from(request_failed_rate);
    let dlinear_request_total_count = Array.from(request_total_count);

    let MEMA_cpu = Array.from(cpu);
    let MEMA_memory = Array.from(memory);
    let MEMA_disk = Array.from(disk);
    let MEMA_apdex = Array.from(apdex);
    let MEMA_average_response_time = Array.from(average_response_time);
    let MEMA_request_failed_rate = Array.from(request_failed_rate);
    let MEMA_request_total_count = Array.from(request_total_count);

    const { normalized1: normalized_dlinear_cpu, normalized2: normalized_dlinear_cpuPred, min: cpuMin, max: cpuMax } =
    normalizeTwoArrays(dlinear_cpu, dlinear_cpuPred);

    const { normalized1: normalized_dlinear_memory, normalized2: normalized_dlinear_memoryPred } =
        normalizeTwoArrays(dlinear_memory, dlinear_memoryPred);

    const { normalized1: normalized_dlinear_disk, normalized2: normalized_dlinear_diskPred } =
        normalizeTwoArrays(dlinear_disk, dlinear_diskPred);

    const { normalized1: normalized_dlinear_apdex, normalized2: normalized_dlinear_apdexPred } =
        normalizeTwoArrays(dlinear_apdex, dlinear_apdexPred);

    const { normalized1: normalized_dlinear_average_response_time, normalized2: normalized_dlinear_average_response_time_Pred } =
        normalizeTwoArrays(dlinear_average_response_time, dlinear_average_response_time_Pred);

    const { normalized1: normalized_dlinear_request_failed_rate, normalized2: normalized_dlinear_request_failed_rate_Pred } =
        normalizeTwoArrays(dlinear_request_failed_rate, dlinear_request_failed_rate_Pred);

    const { normalized1: normalized_dlinear_request_total_count, normalized2: normalized_dlinear_request_total_count_Pred } =
        normalizeTwoArrays(dlinear_request_total_count, dlinear_request_total_count_Pred);

    // MEMA 部分，也做同样的归一化（假设你有对应的 MEMA_xxxPred）
    const { normalized1: normalized_MEMA_cpu, normalized2: normalized_MEMA_cpuPred } =
        normalizeTwoArrays(MEMA_cpu, MEMA_cpuPred);

    const { normalized1: normalized_MEMA_memory, normalized2: normalized_MEMA_memoryPred } =
        normalizeTwoArrays(MEMA_memory, MEMA_memoryPred);

    const { normalized1: normalized_MEMA_disk, normalized2: normalized_MEMA_diskPred } =
        normalizeTwoArrays(MEMA_disk, MEMA_diskPred);

    const { normalized1: normalized_MEMA_apdex, normalized2: normalized_MEMA_apdexPred } =
        normalizeTwoArrays(MEMA_apdex, MEMA_apdexPred);

    const { normalized1: normalized_MEMA_average_response_time, normalized2: normalized_MEMA_average_response_time_Pred } =
        normalizeTwoArrays(MEMA_average_response_time, MEMA_average_response_time_Pred);

    const { normalized1: normalized_MEMA_request_failed_rate, normalized2: normalized_MEMA_request_failed_rate_Pred } =
        normalizeTwoArrays(MEMA_request_failed_rate, MEMA_request_failed_rate_Pred);

    const { normalized1: normalized_MEMA_request_total_count, normalized2: normalized_MEMA_request_total_count_Pred } =
        normalizeTwoArrays(MEMA_request_total_count, MEMA_request_total_count_Pred);


    return {
        times,
        
        // 归一化后的 dlinear 数组
        normalized_dlinear_cpu,
        normalized_dlinear_cpuPred,
        normalized_dlinear_memory,
        normalized_dlinear_memoryPred,
        normalized_dlinear_disk,
        normalized_dlinear_diskPred,
        normalized_dlinear_apdex,
        normalized_dlinear_apdexPred,
        normalized_dlinear_average_response_time,
        normalized_dlinear_average_response_time_Pred,
        normalized_dlinear_request_failed_rate,
        normalized_dlinear_request_failed_rate_Pred,
        normalized_dlinear_request_total_count,
        normalized_dlinear_request_total_count_Pred,

        // 归一化后的 MEMA 数组
        normalized_MEMA_cpu,
        normalized_MEMA_cpuPred,
        normalized_MEMA_memory,
        normalized_MEMA_memoryPred,
        normalized_MEMA_disk,
        normalized_MEMA_diskPred,
        normalized_MEMA_apdex,
        normalized_MEMA_apdexPred,
        normalized_MEMA_average_response_time,
        normalized_MEMA_average_response_time_Pred,
        normalized_MEMA_request_failed_rate,
        normalized_MEMA_request_failed_rate_Pred,
        normalized_MEMA_request_total_count,
        normalized_MEMA_request_total_count_Pred,
     };
}