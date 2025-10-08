<template>
  <div class="page-container">
    <!-- 主标题 -->
    <h1>云资源数据相关性分析展示</h1>

    <!-- 信息提示行 -->
    <div class="info-line">
      <h2>当前展示的是营销管理系统Dlinear数据相关性分析 </h2>
    </div>

    <!-- DLinear 图表 -->
    <div class="chart-card">
      <div class="chart-title">Dlinear数据相关性分析图表展示</div>
      <div ref="chartRef" class="chart"></div>
    </div>

    <div class="info-line">
      <h2>当前展示的是营销管理系统MEMA数据相关性分析 </h2>
    </div>

    <!-- MEMA 图表 -->
    <div class="chart-card">
      <div class="chart-title">MEMA数据相关性分析图表展示</div>
      <div ref="MEMA_chartRef" class="chart"></div>
    </div>

    <!-- 热力图区域 -->
    <div class="p-4 space-y-8 w-full" style="width: 800px; height: 800px;">
      <div
        v-for="(matrixObj, key) in heatmaps"
        :key="key"
        class="space-y-4 w-full"
        style="height: 420px; margin-bottom: 15px;"
      >
        <h2 class="text-xl font-bold">{{ key }} 相关矩阵</h2>
        <div
          :ref="el => (chartRefs[key] = el)"
          class="w-full h-[400px]"
          style="width: 400px; height: 400px;"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import * as echarts from "echarts";
import { timeDataStore } from "../store/data";
import {
  select_data_from_cor_time_series,
} from "../utils/time_series_analysis";
import {
  set_dlinear_chart_option,
  set_MEMA_chart_option,
} from "../utils/chart_options";

const time_data_store = timeDataStore();
const cor_time_series_data = ref([]);

// ===== DLinear 与 MEMA 主图 =====
const chartRef = ref(null);
let chartInstance = null;
const chartOption = ref({});

const MEMA_chartRef = ref(null);
let MEMA_chartInstance = null;
const MEMA_chartOption = ref({});

// 更新主图
const updateChart = async () => {
  try {
    const cor_time_series = await time_data_store.get_cor_data();
    cor_time_series_data.value = select_data_from_cor_time_series(cor_time_series);
  } catch (e) {
    console.error("更新主表格的时候出错", e);
  }

  set_dlinear_chart_option(chartOption, cor_time_series_data);
  set_MEMA_chart_option(MEMA_chartOption, cor_time_series_data);

  await nextTick();
  initChart();
  initMEMAChart();
};

// 初始化主图
const initChart = () => {
  if (!chartRef.value) return;
  if (!chartInstance) chartInstance = echarts.init(chartRef.value);
  chartInstance.setOption(chartOption.value);
};

// 初始化 MEMA 图
const initMEMAChart = () => {
  if (!MEMA_chartRef.value) return;
  if (!MEMA_chartInstance) MEMA_chartInstance = echarts.init(MEMA_chartRef.value);
  MEMA_chartInstance.setOption(MEMA_chartOption.value);
};

// ============== 画热力图 =============================
const chartRefs = ref({});
const heatmaps = ref({});

// 构建矩阵
function buildMatrix(data) {
  const keys = Array.from(
    new Set(Object.keys(data).map((k) => k.split("&")).flat())
  );
  const matrix = keys.map((row) =>
    keys.map((col) => {
      if (row === col) return 1;
      const v1 = data[`${row}&${col}`];
      const v2 = data[`${col}&${row}`];
      return v1 ?? v2 ?? 0;
    })
  );
  return { keys, matrix };
}

// 绘制热力图
async function draw_heatmap() {
  const response = await time_data_store.get_cors();
  const seriesData = response.data.corr.H["6"].series;
  const memaData = response.data.corr.H["6"].predict_series.MEMA;
  const dlinearData = response.data.corr.H["6"].predict_series.DLinear;

  heatmaps.value = {
    历史序列: buildMatrix(seriesData),
    MEMA预测: buildMatrix(memaData),
    DLinear预测: buildMatrix(dlinearData),
  };

  // 等待 DOM 渲染完成
  await nextTick();

  Object.entries(heatmaps.value).forEach(([key, { keys, matrix }]) => {
    const el = chartRefs.value[key];
    if (!el) return;

    // 保证容器有宽高
    el.style.width = "100%";
    el.style.height = "400px";

    const chart = echarts.init(el);

    chart.setOption({
        tooltip: { position: "top" },
        grid: {
            left: "10%",     // 给左边标签留空间
            right: "5%",
            top: "15%",
            bottom: "25%",   // 给下方标签 + x 轴留更多空间
        },
        xAxis: {
            type: "category",
            data: keys,
            axisLabel: {
            rotate: 45,
            hideOverlap: true,
            interval: "auto",
            // formatter: (value) => {
            //     // 如果标签太长就截断 + “…”
            //     return value.length > 12 ? value.slice(0, 12) + "…" : value;
            // },
            },
        },
        yAxis: {
            type: "category",
            data: keys,
            axisLabel: {
            // formatter: (value) => {
            //     return value.length > 12 ? value.slice(0, 12) + "…" : value;
            // },
            },
        },
        visualMap: {
            show: true,  // 或者设 false 隐藏色条显示
            min: -1,
            max: 1,
            calculable: true,
            orient: "horizontal",
            left: "center",
            bottom: "0%",  // 放在底部但要避免遮挡轴标签
            inRange: {
            color: ["#2166ac", "#f7f7f7", "#b2182b"],
            },
        },
        series: [
            {
            name: "相关系数",
            type: "heatmap",
            data: matrix.flatMap((row, i) =>
                row.map((v, j) => [keys[j], keys[i], v])
            ),
            label: {
                show: true,
                formatter: ({ value }) => {
                return value && value.length >= 3 ? value[2].toFixed(2) : "";
                },
                fontSize: 10,
            },
            },
        ],
        });

    // 自动适应窗口变化
    window.addEventListener("resize", () => chart.resize());
  });
}

// ===== 生命周期 =====
onMounted(async () => {
  await updateChart();
  await draw_heatmap();

  const handleWheel = (e) => {
    if (e.ctrlKey) e.preventDefault();
  };
  window.addEventListener("wheel", handleWheel, { passive: false });

  onBeforeUnmount(() => {
    window.removeEventListener("wheel", handleWheel);
  });
});
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  padding: 40px 20px;
  background-color: #fff;
  color: #4a4a4a;
  box-sizing: border-box;
}
h1 {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 24px;
  text-align: center;
}
.info-line {
  width: 100%;
  max-width: 1000px;
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}
.chart-card {
  width: 100%;
  max-width: 1200px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #fff;
  padding: 5px;
  box-sizing: border-box;
}
.chart-title {
  text-align: center;
  font-weight: bold;
  font-size: 18px;
  color: #333;
  margin-bottom: 10px;
}
.chart {
  width: 100%;
  height: 400px;
}
</style>
