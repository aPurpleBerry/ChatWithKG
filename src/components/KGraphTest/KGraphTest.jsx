import React, { useState, useEffect, useRef,useContext } from 'react';
import { Spin, Button, Input, Select, message, Card,Popover,Slider } from 'antd';
import * as d3 from 'd3';
import axios from 'axios';
import { Context } from '../../context/Context'
import { EdgeEvent, Graph, NodeEvent } from '@antv/g6';
import { findShortestPath,getDegree } from '@antv/algorithm';
import './KGraphTest.css';
import timedata from './graph_time_data.json'


import Editor, { DiffEditor, useMonaco, loader } from '@monaco-editor/react';

let graph; // 全局图变量
let edgeDrawed = []; // 全局变量，记录已经绘制的边

// #FFB6C1
// #E0EDF9
const TypeColors = {
  entity: "#2D467B",
  fund_raising_event: "#A2CBEE",
  ecology: "#5591DC",
  project_tag: "#3763BE",
  news: "#2D467B"
};

const KGraph = ({ isSidebarCollapsed, isMainCollapsed }) => {
  const containerRef = useRef(null);
  const hoverBox =  useRef(null);
  const [graphData, setGraphData] = useState(null); // 状态保存图数据
  const [isGraphInitialized, setIsGraphInitialized] = useState(false);
  const [nodeCategories, setNodeCategories] = useState([]); // 保存统计的类别
  const [loading, setLoading] = useState(true); // 加载中

  // 获取图数据
  const fetchGraphData =   () => {
    try {
      /****************假数据********************/
      const data = timedata;

      const processedData = {
        nodes: JSON.parse(JSON.stringify(data.nodes)),
      };

      const transformedData = processedData;

      // transformedData.nodes.forEach((node) => {
      //   node.size = Math.random() * 20 + 6;
      // });
      /****************假数据********************/

      // 更新图数据状态
      setGraphData(processedData); 
      console.log('图例graphdata = ',graphData);
    } catch (error) {
      console.error('加载图数据失败:', error);
    }
  };

  const initializeGraph = (data) => {
    graph = new Graph({
      container: containerRef.current,
      animation: false,
      width: 700, // 初始宽度
      height: 700, // 初始高度
      data: data,
      node: {
        // type: 'rect',
        style: {
          radius: 4,
          size: (d) => d.size?d.size:10,
          ports: [],
          labelText: (d) => d.id,
          labelBackground: true,
          labelBackgroundFill: '#E0EDF9',
          labelBackgroundRadius: 4,
          labelFontFamily: 'Arial',
          labelPadding: [0, 4],
          fill: (d) => {
            if(d.data.cluster === 'entity') {
              return TypeColors.entity
            } else if(d.data.cluster === 'fund_raising_event') {
              return TypeColors.fund_raising_event
            } else if(d.data.cluster === 'ecology') {
              return TypeColors.ecology
            } else if(d.data.cluster === 'project_tag') {
              return TypeColors.project_tag
            } else if(d.data.cluster === 'news') {
              return TypeColors.news
            }
            
          }
        },
      },
      edge: {
        style: {
          endArrow: true,
        },
      },
      layout: {
        type: 'force',
        linkDistance: 50,
        clustering: true,
        nodeClusterBy: 'cluster',
        clusterNodeStrength: 70,
        collide: {
          radius: (d) => d.size / 2,
        },
      },
      behaviors: ['zoom-canvas','drag-element',
        { type: 'click-select', multiple: true, trigger: ['shift'] },
        {
          key: 'brush-select',
          type: 'brush-select',
          mode: 'diff',
          trigger: 'shift',
          style: {
            fill: '#00f',
            fillOpacity: 0.1,
            stroke: '#0ff',
          },
        }
      ],
      plugins: [
        { key: 'grid-line', type: 'grid-line', follow: false },
        {
          type: 'tooltip',
          getContent: (e, items) => {
            // console.log('getContent == ',e,items);
            
            let result = `<h4>Node Detail</h4>`;
            items.forEach((item) => {
              result += `<p>ID: ${item.id}</p>`;
              result += `<p>Type: ${item.data.cluster}</p>`;
            });
            return result;
          },
        }
      ]
    });

    try{
      graph.render();
    } catch(err) {
      console.log(err);
      
    }
  }

  useEffect(() => {
    fetchGraphData(); // 获取图数据
  }, []);

  useEffect(() => {
    if (graphData && !isGraphInitialized) {
      console.log('数据准备好了', graphData);
      setLoading(false); // 加载完毕
      initializeGraph(graphData); // 渲染图
      setIsGraphInitialized(true); // 标记图表已初始化

      // 图例类别
      const categories = Array.from(
        new Set(
          graphData.nodes
            .map((node) => node.data.cluster)
            .filter((cluster) => Object.keys(TypeColors).includes(cluster)) // 过滤无效类别
        )
      );
      setNodeCategories(categories); // 更新类别状态
      console.log('categories = ',categories);
      console.log('nodeCategories = ',nodeCategories);
      
    }
  }, [graphData, isGraphInitialized]);


  /**********************改变画布大小****************************** */
  useEffect(() => {
    const resizeGraph = () => {
      if (!graph) return; // 确保 graph 已被初始化
      if (isMainCollapsed && isSidebarCollapsed) {
        graph.resize(1300, 800);
      } else if (!isMainCollapsed && isSidebarCollapsed) {
        graph.resize(1200, 800);
      } else if (isMainCollapsed && !isSidebarCollapsed) {
        graph.resize(1200, 800);
      } else {
        graph.resize(650, 800);
      }
      graph.render();
    };
  
    // 当 graph 初始化后，以及折叠状态变化时执行调整
    if (graphData && isGraphInitialized) {
      resizeGraph();
    }
  }, [isSidebarCollapsed, isMainCollapsed, graphData, isGraphInitialized]);
  

  const handle = () => {
    graph.addEdgeData([{ source: '15', target: '17' }])
    // graph.render()
    graph.updateData({
      nodes: [{ id: '1', style: { x: 100, y: 100 } }],
    });
    graph.draw()
  }

  const handle2 = () => {
    console.log(graph.getElementState('entity_Monad'));
    
    // graph.clear()
  }
  const handle3 = () => {
    // graph = new Graph
    console.log(graph.getData());
    console.log(graph.getNodeData());
    // graph.render()
  }
  const handleClick = (selectedCluster) => {
    graphData.nodes.forEach((node) => {
      graph.setElementState(node.id, [])
      // console.log("Node ID:", node.id);
    });

    console.log(`当前点击类型: ${selectedCluster}`);
    // 从 data 中筛选符合条件的节点
    const filteredNodes = graphData.nodes.filter(
      (node) => node.data.cluster === selectedCluster
    );
    // console.log("Filtered Nodes:", filteredNodes);
    // 遍历并打印每个节点的 id
    filteredNodes.forEach((node) => {
      graph.setElementState(node.id, 'selected')
      // console.log("Node ID:", node.id);
    });
  };
  /********************************图数据库相关**************************** */
  
  
  /********************************输入******************************* */
  const [isActive, setIsActive] = useState(false); // 控制搜索框伸缩
  const [showDiv, setShowDiv] = useState(false); // 控制新 div 的显示

  const handleToggle = () => {
    setIsActive(!isActive);
    setShowDiv(!showDiv); // 切换新 div 的显示状态
  };

  function handleEditorChange(value, event) {
    console.log('here is the current model value:', JSON.stringify(value));
  }
  findShortestPath

  const find = (state = "selected") => {
    return graph.getElementDataByState('node', state)
  }

  const warning = (content) => {
    message.open({
      type: 'warning',
      content
    });
  };

  const handleFindShortestPath = () => {
    const selectedNodes = find()
    // console.log('当前节点们的状态 = ',find());
    
    if(selectedNodes.length !== 2 ) {
      warning('请选择两个节点，按shift键多选')
    } else {
      console.log('ok',selectedNodes);
      const { length, path } = findShortestPath(graphData, selectedNodes[0].id, selectedNodes[1].id);
      console.log('handleFindShortestPath = ',length,path);

      if(length !== Infinity ) {
        // 点亮路径
        const states = {};
        graphData.nodes.forEach(({ id }) => {
          if (path.includes(id)) states[id] = 'selected';
          else states[id] = '';
        });

        graphData.edges.forEach(({ id, source, target }) => {
          const sourceIndex = path.indexOf(source);
          const targetIndex = path.indexOf(target);
          if (sourceIndex === -1 || targetIndex === -1) return;
          if (Math.abs(sourceIndex - targetIndex) === 1) states[id] = 'selected';
          else states[id] = '';
        });

        console.log('states == ',states);
        

        graph.setElementState(states);
        graph.frontElement(path);
      } else {
        warning('两个节点没有路径')
      }
    }
  }

  const downloadJson = () => {
    if (!graphData) return;

    const json = JSON.stringify(graphData, null, 2); // 格式化 JSON 数据
    const blob = new Blob([json], { type: 'application/json' }); // 创建 Blob 对象
    const url = URL.createObjectURL(blob); // 创建 URL 对象

    // 创建下载链接
    const link = document.createElement('a');
    link.href = url;
    link.download = 'output.json'; // 指定文件名
    link.click();

    // 清理 URL 对象
    URL.revokeObjectURL(url);
  };
  
  const testG6 = () => {
    // getDegree返回所有结点的度数
    console.log('所有节点的度数',getDegree(graphData)); 
    console.log('所有节点的度数',Object.keys(getDegree(graphData)).length); 
    graph.removeEdgeData(['edge-1','edge-2'])
    graph.draw()
  }

  /**************************** range ****************************/
  const [rangeValue, setRangeValue] = React.useState([0, 1]);
  const [rangeMax , setRangeMax] = React.useState(6);
  const onRangeChange = (value) => {
    if (Number.isNaN(value)) {
      return;
    }
    console.log('范围变化',value);
    
    setRangeValue(value);
  };
  const onRangeChangeComplete = (value) => {
    console.log('范围完成：',value);
    // updateKGraph()
    const newGraphData = filterData(value);
    const {addedEdges,removedEdges} = newGraphData
    console.log('过滤边',addedEdges,removedEdges)
    const removedEdgeIds = removedEdges.map((edge) => edge.id);
    graph.addEdgeData(addedEdges)
    graph.removeEdgeData(removedEdgeIds)
    graph.draw()
    console.log(graphData);
  }

  // 改变渲染函数
  const updateKGraph = () => {
    graph.addEdgeData([{ source: '1', target: '2' }])
    graph.draw();
  }

  const filterData = (range) => {
    const [min, max] = range;

    // 1. 过滤节点
    const filteredNodes = timedata.nodes.filter(
      (node) => node.time_step >= min && node.time_step <= max
    );

    // 2. 提取过滤后节点的 id
    const nodeIds = filteredNodes.map((node) => node.id);

   // 3. 过滤边
    const filteredEdges = timedata.edges.filter(
      (edge) => nodeIds.includes(edge.source) && nodeIds.includes(edge.target)
    );

    // 4. 找出新增的边
    const addedEdges = filteredEdges.filter(
      (edge) => !edgeDrawed.some((e) => e.source === edge.source && e.target === edge.target)
    );

    // 5. 找出需要删除的边
    const removedEdges = edgeDrawed.filter(
      (edge) => !filteredEdges.some((e) => e.source === edge.source && e.target === edge.target)
    );

    // 6. 更新 edgeDrawed
    edgeDrawed = filteredEdges;

    // 返回节点、新增的边和需要删除的边
    return { nodes: filteredNodes, addedEdges, removedEdges };
  };
  return (
    <div className="graph">
    <Spin tip="Loading" spinning={loading} style={{marginTop: '300px'}}>
      <Button onClick={handleFindShortestPath}>最短路径</Button>
      <Button onClick={downloadJson}>下载JSON数据</Button>
      <Button onClick={testG6}>测试G6按钮</Button>
      {/* 图例 */}
       <div className="hoverBox" ref={hoverBox}>
        <div className="legendTitle">
          Node Types
        </div>
        
        <div className="legend">
        {nodeCategories.length > 0 ? (
          nodeCategories.map((category) => (
            <div
              key={category}
              className="legend-item"
              onClick={() => handleClick(category)}
            >
              <span
                className="color-circle"
                style={{ backgroundColor: TypeColors[category] }}
              ></span>
              <span>{category.replace(/_/g, " ")}</span>
            </div>
          ))
        ) : (
          <p>加载中...</p>
        )}
      </div>
      </div>
      {/* 搜索 */}
      <div className={`search ${isActive ? "active" : ""}`}>
        <input
          type="text"
          className="input"
          placeholder="请输入nebulagraph语言..."
          disabled
          onFocus={() => setIsActive(true)}
        />
        <button className="btn" onClick={handleToggle}>
          <svg
            className="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
          >
            <path
              d="M448 85.333333a362.666667 362.666667 0 1 0 207.189333 660.352l174.208 174.250667a64 64 0 1 0 90.538667-90.538667l-174.250667-174.208A362.666667 362.666667 0 0 0 448 85.333333zM213.333333 448a234.666667 234.666667 0 1 1 469.333334 0 234.666667 234.666667 0 0 1-469.333334 0z"
              fill="#000000"
            ></path>
          </svg>
        </button>
        {/* 点击按钮后显示的新 div */}
        {showDiv && (
          <div className="result-box">
            {/* <p>这里是动态生成的内容！</p> */}
            <Editor 
              defaultLanguage="sql" 
              defaultValue="// Nebulagraph" 
              onChange={handleEditorChange}
              scroll
            />
          </div>
        )}
      </div>
      {/* 时间 */}
      <div className="MyRangeSlider">
        <span>时间戳</span>
        <Slider 
          range={{ draggableTrack: true }} 
          value={rangeValue}
          max={rangeMax}
          onChange={onRangeChange}
          onChangeComplete={onRangeChangeComplete}
        ></Slider>
      </div>
      <div id="web3graph" ref={containerRef}></div>
    </Spin>

    </div>

  );
};

export default KGraph;
