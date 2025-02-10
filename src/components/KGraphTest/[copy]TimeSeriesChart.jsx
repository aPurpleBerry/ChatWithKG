import React, { useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import axios from 'axios'

const TimeSeriesChart = () => {
  // 你的数据
  const data = [
    { time_step: 1736154262, amount: 15 },
    { time_step: 1736154300, amount: 10 }
  ];

  // 转换数据格式
  const formattedData = data.map(item => [
    item.time_step * 1000, // 转换为毫秒时间戳
    item.amount // 金额
  ]);

  // ECharts 配置
  const option = {
    tooltip: {
      trigger: 'axis',
      position: function (pt) {
        return [pt[0], '10%'];
      }
    },
    // title: {
    //   left: 'center',
    //   text: '交易金额随时间变化'
    // },
    toolbox: {
      feature: {
        dataZoom: {
          yAxisIndex: 'none'
        },
        restore: {},
        saveAsImage: {}
      }
    },
    xAxis: {
      type: 'time', // 时间轴
      boundaryGap: false // 数据紧贴坐标轴
    },
    yAxis: {
      type: 'value',
      boundaryGap: [0, '100%']
    },
    dataZoom: [
      {
        type: 'inside', // 内部缩放
        start: 0, // 初始缩放范围
        end: 100
      },
      {
        start: 0,
        end: 100
      }
    ],
    series: [
      {
        name: '交易金额',
        type: 'line',
        smooth: true, // 平滑曲线
        symbol: 'none', // 不显示数据点
        areaStyle: {}, // 填充区域
        data: formattedData // 使用转换后的数据
      }
    ]
  };

  // 监听窗口大小变化，调整图表大小
  const chartRef = useRef(null);

  useEffect(() => {
    let inputArray;
    axios
      .get("/nebula/queryAllNodes")
      .then((response) => {
        // console.log("返回数据：", response);
        // console.log("返回数据2222：", response.data.data);
        inputArray = response.data.data;
        console.log(inputArray);

        const resultArray = inputArray.map(item => {
          // 提取 id
          const id = item.values?.find(v => v.field === 5)?.value || "000";
      
          // 提取 cluster
          const cluster = item.values?.find(v => v.field === 12)?.value?.values?.[0]?.value || "entity";
      
          // 根据 cluster 的值设置 type
          const type = cluster === "Transaction" ? "rect" : cluster === "Chain" ? "circle" : "unknown";
      
          // 提取 time_step
          const time_step = item.values?.find(v => v.field === 9)?.value?.tags?.[0]?.props?.txtimestamp?.value || 1;
      
          // 提取 txhash, amount, denom, fee
          const txhash = item.values?.find(v => v.field === 9)?.value?.tags?.[0]?.props?.txhash?.value || "";
          const amount = item.values?.find(v => v.field === 9)?.value?.tags?.[0]?.props?.amount?.value || 0;
          const denom = item.values?.find(v => v.field === 9)?.value?.tags?.[0]?.props?.denom?.value || "";
          const fee = item.values?.find(v => v.field === 9)?.value?.tags?.[0]?.props?.fee?.value || 0.0;
      
          return {
              id: id,
              type: type, // 动态添加 type 字段
              data: {
                  cluster: cluster,
                  txhash: txhash,
                  amount: amount,
                  denom: denom,
                  fee: fee
              },
              time_step: time_step
          };
        });
        
        // console.log('图数据库 节点 = ',resultArray);
        const result = resultArray
          .filter(item => item.data.cluster === "Transaction") // 筛选出 cluster 为 Transaction 的对象
          .map(item => ({
            time_step: Math.floor(item.time_step / 1000), // 提取时间
              amount: item.data.amount  // 提取金额
          }));

        // 使用 reduce 合并相同的 time_step
        const mergedResult = result.reduce((acc, item) => {
          const existingItem = acc.find(entry => entry.time_step === item.time_step);
          if (existingItem) {
              // 如果 time_step 已存在，累加 amount
              existingItem.amount += item.amount;
          } else {
              // 如果 time_step 不存在，添加新条目
              acc.push({ time_step: item.time_step, amount: item.amount });
          }
          return acc;
        }, []);

        // console.log(mergedResult);
        console.log('时间序列图 = ',mergedResult);

        // const json = JSON.stringify(resultArray, null, 2); // 格式化 JSON 数据
        // const blob = new Blob([json], { type: 'application/json' }); // 创建 Blob 对象
        // const url = URL.createObjectURL(blob); // 创建 URL 对象

        // // 创建下载链接
        // const link = document.createElement('a');
        // link.href = url;
        // link.download = 'output.json'; // 指定文件名
        // link.click();

        // // 清理 URL 对象
        // URL.revokeObjectURL(url);
        
      })
      .catch((error) => console.error("请求出错：", error));
    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.getEchartsInstance().resize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ReactECharts
      ref={chartRef}
      option={option}
      style={{ height: '300px', width: '100%' }}
      onEvents={{
        dataZoom: (event) => {
          const startValue = event.start;
          const endValue = event.end;
          console.log(startValue, endValue);
        }
      }}
    />
  );
};

export default TimeSeriesChart;