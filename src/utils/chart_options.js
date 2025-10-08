



export function set_dlinear_chart_option(chartOption, cor_time_series_data) {
    
    // chartOption 是表格的装饰
    // cor_time_series_data是相关性分析的时间序列数据
    chartOption.value = {
        color: [
        '#4CB4B6',
        '#007AFF',
        '#FF9900',
        '#A1D8D9',
        '#7FBFFF',
        '#FFD666',
        '#66ff91ff',
        '#ff6666ff',
        '#928f89ff',
        '#71572fff',
        '#124205ff',
        '#af0808ff',
        '#120f0bff',
        '#372303ff',
        ],
        backgroundColor: '#fff',
        tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'cross',
            label: {
            backgroundColor: '#6a7985'
            }
        }
        },
        legend: {
        top: 10,
        left: 'center',
        data: [
            'CPU利用率(%)',
            '内存利用率(%)',
            '磁盘利用率(%)',
            'CPU利用率预测(%)',
            '内存利用率预测(%)',
            '磁盘利用率预测(%)',
            '用户满意度',
            '平均响应时间',
            '请求错误率',
            '平均请求次数',
            '用户满意度预测',
            '平均响应时间预测',
            '请求错误率预测',
            '平均请求次数预测',

        ],
        selectedMode: 'multiple',
        itemWidth: 12,
        itemHeight: 8,
        textStyle: {
            fontSize: 12,
            color: '#333'
        }
        },
        grid: {
        top: 80,
        left: '5%',
        right: '5%',
        bottom: 40,
        containLabel: true
        },
        xAxis: {
        type: 'category',
        boundaryGap: false,
        data: cor_time_series_data.value.times,
        axisLine: {
            lineStyle: {
            color: '#666',
            width: 1.5
            }
        },
        axisTick: {
            alignWithLabel: true,
            length: 6,
            lineStyle: {
            color: '#666'
            }
        },
        axisLabel: {
            color: '#333',
            fontSize: 12,
            interval: 'auto'
        },
        splitLine: {
            show: true,
            lineStyle: {
            color: '#f0f0f0',
            type: 'dashed'
            }
        }
        },
        yAxis: {
        type: 'value',
        name: '利用率',
        nameTextStyle: {
            color: '#333',
            fontSize: 13,
            padding: [0, 0, 0, 10]
        },
        min: 0,
        max: 1,
        interval: 10, // ✅ 设置合适的间隔，比如10%
        axisLine: {
            show: true,
            lineStyle: {
            color: '#666',
            width: 1.5
            }
        },
        axisTick: {
            show: true,
            length: 6,
            lineStyle: {
            color: '#666'
            }
        },
        axisLabel: {
            show: true, // ✅ 确保显示刻度文字
            color: '#333',
            fontSize: 12,
            formatter: function (value) {
                return value.toFixed(2) + '%';
            }
        },
        splitLine: {
            show: true,
            lineStyle: {
            color: '#e0e0e0',
            type: 'dashed'
            }
        }
        },
        series: [
        {
            name: 'CPU利用率(%)',
            type: 'line',
            smooth: false,
            data: cor_time_series_data.value.normalized_dlinear_cpu,
            symbolSize: 4
        },
        {
            name: '内存利用率(%)',
            type: 'line',
            smooth: false,
            data: cor_time_series_data.value.normalized_dlinear_memory,
            symbolSize: 4
        },
        {
            name: '磁盘利用率(%)',
            type: 'line',
            smooth: false,
            data: cor_time_series_data.value.normalized_dlinear_disk,
            symbolSize: 4
        },
        {
            name: '用户满意度',
            type: 'line',
            smooth: false,
            data: cor_time_series_data.value.normalized_dlinear_apdex,
            symbolSize: 4
        },
        {
            name: '平均响应时间',
            type: 'line',
            smooth: false,
            data: cor_time_series_data.value.normalized_dlinear_average_response_time,
            symbolSize: 4
        },
        {
            name: '请求错误率',
            type: 'line',
            smooth: false,
            data: cor_time_series_data.value.normalized_dlinear_request_failed_rate,
            symbolSize: 4
        },
        {
            name: '平均请求次数',
            type: 'line',
            smooth: false,
            data: cor_time_series_data.value.normalized_dlinear_request_total_count,
            symbolSize: 4
        },

        //   dinear的预测
        {
            name: 'CPU利用率预测(%)',
            type: 'line',
            smooth: false,
            data: cor_time_series_data.value.normalized_dlinear_cpuPred,
            symbolSize: 4,
            lineStyle: { type: 'dashed' }
        },
        {
            name: '内存利用率预测(%)',
            type: 'line',
            smooth: false,
            data: cor_time_series_data.value.normalized_dlinear_memoryPred,
            symbolSize: 4,
            lineStyle: { type: 'dashed' }
        },
        {
            name: '磁盘利用率预测(%)',
            type: 'line',
            smooth: false,
            data: cor_time_series_data.value.normalized_dlinear_diskPred,
            symbolSize: 4,
            lineStyle: { type: 'dashed' }
        },

        {
            name: '用户满意度预测',
            type: 'line',
            smooth: false,
            data: cor_time_series_data.value.normalized_dlinear_apdexPred,
            symbolSize: 4,
            lineStyle: { type: 'dashed' }
        },
        
        {
            name: '平均响应时间预测',
            type: 'line',
            smooth: false,
            data: cor_time_series_data.value.normalized_dlinear_average_response_time_Pred,
            symbolSize: 4,
            lineStyle: { type: 'dashed' }
        },
        {
            name: '请求错误率预测',
            type: 'line',
            smooth: false,
            data: cor_time_series_data.value.normalized_dlinear_request_failed_rate_Pred,
            symbolSize: 4,
            lineStyle: { type: 'dashed' }
        },
        {
            name: '平均请求次数预测',
            type: 'line',
            smooth: false,
            data: cor_time_series_data.value.normalized_dlinear_request_total_count_Pred,
            symbolSize: 4,
            lineStyle: { type: 'dashed' }
        },

        ]
    };
}




export function set_MEMA_chart_option(chartOption, cor_time_series_data) {
    
    // chartOption 是表格的装饰
    // cor_time_series_data是相关性分析的时间序列数据
    chartOption.value = {
        color: [
        '#4CB4B6',
        '#007AFF',
        '#FF9900',
        '#A1D8D9',
        '#7FBFFF',
        '#FFD666',
        '#66ff91ff',
        '#ff6666ff',
        '#928f89ff',
        '#71572fff',
        '#124205ff',
        '#af0808ff',
        '#120f0bff',
        '#372303ff',
        ],
        backgroundColor: '#fff',
        tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'cross',
            label: {
            backgroundColor: '#6a7985'
            }
        }
        },
        legend: {
        top: 10,
        left: 'center',
        data: [
            'CPU利用率(%)',
            '内存利用率(%)',
            '磁盘利用率(%)',
            'CPU利用率预测(%)',
            '内存利用率预测(%)',
            '磁盘利用率预测(%)',
            '用户满意度',
            '平均响应时间',
            '请求错误率',
            '平均请求次数',
            '用户满意度预测',
            '平均响应时间预测',
            '请求错误率预测',
            '平均请求次数预测',

        ],
        selectedMode: 'multiple',
        itemWidth: 12,
        itemHeight: 8,
        textStyle: {
            fontSize: 12,
            color: '#333'
        }
        },
        grid: {
        top: 80,
        left: '5%',
        right: '5%',
        bottom: 40,
        containLabel: true
        },
        xAxis: {
        type: 'category',
        boundaryGap: false,
        data: cor_time_series_data.value.times,
        axisLine: {
            lineStyle: {
            color: '#666',
            width: 1.5
            }
        },
        axisTick: {
            alignWithLabel: true,
            length: 6,
            lineStyle: {
            color: '#666'
            }
        },
        axisLabel: {
            color: '#333',
            fontSize: 12,
            interval: 'auto'
        },
        splitLine: {
            show: true,
            lineStyle: {
            color: '#f0f0f0',
            type: 'dashed'
            }
        }
        },
        yAxis: {
        type: 'value',
        name: '利用率',
        nameTextStyle: {
            color: '#333',
            fontSize: 13,
            padding: [0, 0, 0, 10]
        },
        min: 0,
        max: 1,
        interval: 10, // ✅ 设置合适的间隔，比如10%
        axisLine: {
            show: true,
            lineStyle: {
            color: '#666',
            width: 1.5
            }
        },
        axisTick: {
            show: true,
            length: 6,
            lineStyle: {
            color: '#666'
            }
        },
        axisLabel: {
            show: true, // ✅ 确保显示刻度文字
            color: '#333',
            fontSize: 12,
            formatter: function (value) {
                return value.toFixed(2) + '%';
            }
        },
        splitLine: {
            show: true,
            lineStyle: {
            color: '#e0e0e0',
            type: 'dashed'
            }
        }
        },
        series: [
        {
            name: 'CPU利用率(%)',
            type: 'line',
            smooth: false,
            data: cor_time_series_data.value.normalized_MEMA_cpu,
            symbolSize: 4
        },
        {
            name: '内存利用率(%)',
            type: 'line',
            smooth: false,
            data: cor_time_series_data.value.normalized_MEMA_memory,
            symbolSize: 4
        },
        {
            name: '磁盘利用率(%)',
            type: 'line',
            smooth: false,
            data: cor_time_series_data.value.normalized_MEMA_disk,
            symbolSize: 4
        },
        {
            name: '用户满意度',
            type: 'line',
            smooth: false,
            data: cor_time_series_data.value.normalized_MEMA_apdex,
            symbolSize: 4
        },
        {
            name: '平均响应时间',
            type: 'line',
            smooth: false,
            data: cor_time_series_data.value.normalized_MEMA_average_response_time,
            symbolSize: 4
        },
        {
            name: '请求错误率',
            type: 'line',
            smooth: false,
            data: cor_time_series_data.value.normalized_MEMA_request_failed_rate,
            symbolSize: 4
        },
        {
            name: '平均请求次数',
            type: 'line',
            smooth: false,
            data: cor_time_series_data.value.normalized_MEMA_request_total_count,
            symbolSize: 4
        },

        //   dinear的预测
        {
            name: 'CPU利用率预测(%)',
            type: 'line',
            smooth: false,
            data: cor_time_series_data.value.normalized_MEMA_cpuPred,
            symbolSize: 4,
            lineStyle: { type: 'dashed' }
        },
        {
            name: '内存利用率预测(%)',
            type: 'line',
            smooth: false,
            data: cor_time_series_data.value.normalized_MEMA_memoryPred,
            symbolSize: 4,
            lineStyle: { type: 'dashed' }
        },
        {
            name: '磁盘利用率预测(%)',
            type: 'line',
            smooth: false,
            data: cor_time_series_data.value.normalized_MEMA_diskPred,
            symbolSize: 4,
            lineStyle: { type: 'dashed' }
        },

        {
            name: '用户满意度预测',
            type: 'line',
            smooth: false,
            data: cor_time_series_data.value.normalized_MEMA_apdexPred,
            symbolSize: 4,
            lineStyle: { type: 'dashed' }
        },
        
        {
            name: '平均响应时间预测',
            type: 'line',
            smooth: false,
            data: cor_time_series_data.value.normalized_MEMA_average_response_time_Pred,
            symbolSize: 4,
            lineStyle: { type: 'dashed' }
        },
        {
            name: '请求错误率预测',
            type: 'line',
            smooth: false,
            data: cor_time_series_data.value.normalized_MEMA_request_failed_rate_Pred,
            symbolSize: 4,
            lineStyle: { type: 'dashed' }
        },
        {
            name: '平均请求次数预测',
            type: 'line',
            smooth: false,
            data: cor_time_series_data.value.normalized_MEMA_request_total_count_Pred,
            symbolSize: 4,
            lineStyle: { type: 'dashed' }
        },

        ]
    };
}