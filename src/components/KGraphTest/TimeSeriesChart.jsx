import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import axios from 'axios';

const TimeSeriesChart = () => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    axios.get('/nebula/queryAllNodes')
      .then((response) => {
        const inputArray = response.data.data;

        const resultArray = inputArray.map(item => {
          const cluster = item.values?.find(v => v.field === 12)?.value?.values?.[0]?.value || "entity";
          const time_step = item.values?.find(v => v.field === 9)?.value?.tags?.[0]?.props?.txtimestamp?.value || 1;
          const amount = item.values?.find(v => v.field === 9)?.value?.tags?.[0]?.props?.amount?.value || 0;

          return {
            time_step: Math.floor(time_step / 1000), // 转换时间单位
            amount: amount,
            cluster: cluster
          };
        });

        // 只保留 Transaction 交易的数据
        const filteredData = resultArray.filter(item => item.cluster === "Transaction");

        // 合并相同 time_step 的金额
        const mergedResult = filteredData.reduce((acc, item) => {
          const existingItem = acc.find(entry => entry.time_step === item.time_step);
          if (existingItem) {
            existingItem.amount += item.amount;
          } else {
            acc.push({ time_step: item.time_step, amount: item.amount });
          }
          return acc;
        }, []);

        // **排序：按照 time_step 从小到大排序**
        mergedResult.sort((a, b) => a.time_step - b.time_step);

        console.log('时间序列图数据:', mergedResult);

        // 更新状态
        setChartData(mergedResult);
      })
      .catch((error) => console.error('请求数据失败:', error));
  }, []);

  // 将数据格式转换为 ECharts 可识别格式
  const formattedData = chartData.map(item => [
    item.time_step * 1000, // 转换为毫秒时间戳
    item.amount
  ]);

  // ECharts 配置
  const option = {
    tooltip: {
      trigger: 'axis',
      position: (pt) => [pt[0], '10%']
    },
    toolbox: {
      feature: {
        dataZoom: { yAxisIndex: 'none' },
        restore: {},
        saveAsImage: {}
      }
    },
    xAxis: { type: 'time', boundaryGap: false },
    yAxis: { type: 'value', boundaryGap: [0, '100%'] },
    dataZoom: [{ type: 'inside', start: 0, end: 100 }, { start: 0, end: 100 }],
    series: [{
      name: '交易金额',
      type: 'line',
      smooth: true,
      symbol: 'none',
      areaStyle: {},
      data: formattedData
    }]
  };

  return <ReactECharts option={option} style={{ height: 300, width: '100%' }} />;
};

export default TimeSeriesChart;
