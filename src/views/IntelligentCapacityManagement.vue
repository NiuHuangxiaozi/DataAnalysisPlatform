<template>
  <div class="container">
    <h1>模块化资源推荐</h1>

    <!-- 选择器 -->
    <div class="selector-container">
      <div class="selector-row">
        <div class="selector-item">
          <label for="businessSelector">业务系统：</label>
          <select id="businessSelector" v-model="selectedBusiness">
            <option value="">请选择业务系统</option>
            
            <!--  -->
              <option
                  v-for="biz in businessOptions"
                  :key="biz"
                  :value="biz"
                >
                  {{ biz }}
              </option>`

            <!--  -->
          </select>
        </div>
      </div>
    </div>

    <!-- 可视化部分 -->
    <div class="visualization">
      <div ref="chartRef" class="chart-container"></div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>资源类型</th>
              <th>配置推荐</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>处理器 (vCPU)</td>
              <td v-html="vcpuValue"></td>
            </tr>
            <tr>
              <td>内存 (Memory)</td>
              <td v-html="memoryValue"></td>
            </tr>
            <tr>
              <td>存储 (Storage)</td>
              <td v-html="storageValue"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 模型算法架构 -->
    <div style="text-align: center; margin-top: 40px;">
      <h2 style="color: #1a5fb4;">模型的算法架构</h2>
      <img
        src="../assets/recommend_resource.png"
        alt="模型的算法架构"
        style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import * as echarts from "echarts";
import {timeDataStore} from '../store/data'
const time_data_store = timeDataStore()


// 这里存储从后端拉来的所有业务名字
const businessOptions = ref([])

const selectedBusiness = ref("");
const selectedFunction = ref("");
const chartRef = ref(null);
let myChart = null;

const vcpuValue = ref("-");
const memoryValue = ref("-");
const storageValue = ref("-");

// 功能模块资源配置数据,这里是静态的数据
const marketingFunctionsData = {
  "营销管理系统_营销管理系统": { vCPU: 16, Memory: 32, Storage: 200 }
};

// 更新可视化
async function updateVisualization(newBusiness, data) {


  // 通过business name向后端索要数据
  const resource_data = await time_data_store.get_resource_data(newBusiness)
  const data_dict = resource_data.data.recommend_config[newBusiness]

  console.log("data from bachend ", data_dict)


  // 
  vcpuValue.value = `<span class="resource-highlight">${data_dict["CPU"]}</span> 核`;
  memoryValue.value = `<span class="resource-highlight">${data_dict["MEM"]/1024}</span> GB`;
  storageValue.value = `<span class="resource-highlight">${data_dict["DISK"]}</span> GB`;

  const option = {
    title: {
      text: `${newBusiness} 资源配置推荐`,
      left: "center",
      textStyle: { fontSize: 16, fontWeight: "normal" },
    },
    tooltip: { trigger: "axis", formatter: "{b}: {c}" },
    xAxis: {
      type: "category",
      data: ["处理器 (vCPU)", "内存 (GB)", "存储 (GB)"],
    },
    yAxis: {
      type: "value",
      name: "数量",
      nameLocation: "middle",
      nameGap: 40,
    },
    series: [
      {
        name: "资源数量",
        type: "bar",
        data: [
          { value: data_dict["CPU"], itemStyle: { color: "#5470c6" } },
          { value: data_dict["MEM"]/1024, itemStyle: { color: "#91cc75" } },
          { value: data_dict["DISK"], itemStyle: { color: "#fac858" } },
        ],
        label: { show: true, position: "top" },
      },
    ],
    grid: { containLabel: true, left: "3%", right: "4%", bottom: "8%", top: "15%" },
  };

  myChart.setOption(option);
}

// 重置可视化
function resetVisualization() {
  vcpuValue.value = "-";
  memoryValue.value = "-";
  storageValue.value = "-";

  myChart.setOption({
    title: { text: "请选择业务系统和功能模块查看资源配置", left: "center" },
    series: [{ data: [] }],
  });
}




// 监听业务的变化
watch(selectedBusiness, (newVal) => {
  if (!newVal) {
    selectedFunction.value = "";
    resetVisualization();
  }
  else{
    updateVisualization(newVal)
  }
});

onMounted(async () => {
  myChart = echarts.init(chartRef.value);
  resetVisualization();

  // 加载所有业务对用的应用信息
  const yw_business = await time_data_store.get_yw_business()
  console.log(" 资源推荐的业务", yw_business.data.available_business)
  businessOptions.value = yw_business.data.available_business
  
  window.addEventListener("resize", () => myChart.resize());
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", () => myChart.resize());
  myChart.dispose();
});
</script>

<style scoped>
body {
  font-family: "Microsoft YaHei", Arial, sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #f5f7fa;
  color: #333;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}
h1 {
  text-align: center;
  color: #1a5fb4;
  margin-bottom: 30px;
  font-size: 28px;
}
.selector-container {
  margin-bottom: 30px;
  text-align: center;
}
.selector-row {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}
.selector-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
label {
  font-size: 16px;
  font-weight: 500;
  white-space: nowrap;
}
select {
  padding: 10px 15px;
  width: 350px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  background-color: #fff;
  cursor: pointer;
}
select:disabled {
  background-color: #f2f2f2;
  cursor: not-allowed;
}
.visualization {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}
.chart-container {
  flex: 1;
  height: 400px;
  border-radius: 6px;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}
.table-container {
  flex: 1;
  border-radius: 6px;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  padding: 15px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
table th,
table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}
table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #1a5fb4;
}
.resource-highlight {
  color: #1a5fb4;
  font-weight: 600;
}
</style>
