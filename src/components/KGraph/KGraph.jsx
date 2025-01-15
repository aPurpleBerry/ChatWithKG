import React, { useState, useEffect, useRef,useContext } from 'react';
import { Spin, Button, Input, Select, message, Card,Popover } from 'antd';
import * as d3 from 'd3';
import axios from 'axios';
import { Context } from '../../context/Context'
import { EdgeEvent, Graph, NodeEvent } from '@antv/g6';
import { findShortestPath,getDegree } from '@antv/algorithm';
// import G6 from '@antv/g6';
// import { degree } from '@antv/algorithm'
// import { findShortestPath } from '@antv/algorithm';
import './KGraph.css';
import data from './nodeData.json'
// import data from './output.json'
import data2 from './nodeData2.json'
import outputdata from './graph_example.json'
// import outputdata from './output.json'

import Editor, { DiffEditor, useMonaco, loader } from '@monaco-editor/react';

let graph; // 全局图变量

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
  const fetchGraphData =  async () => {
    console.log('fetchGraphData');
    
    try {
      /****************调取后端********************/
      // const response = await axios.post('http://localhost:8081/ngql/getNodesAndEdgesByNGQL', {
      //   query: 'match (v1)-[e]->(v2) return id(v1), e, v2 limit 50',
      // });
      // const data = response.data.data;

      // // 转换数据为 Graph 需要的格式
      // const transformedData = {
      //   nodes: data.nodes.map((node) => ({
      //     id: node.id,
      //     data: { cluster: node.type },
      //   })),
      //   edges: data.edges.map((edge) => ({
      //     source: edge.source,
      //     target: edge.target,
      //     edge_type: edge.type,
      //   })),
      // };
      // transformedData.nodes.forEach((node) => {
      //   node.size = Math.random() * 20 + 6;
      // });

      /****************假数据********************/
      const data = outputdata;
      const transformedData = data;
      transformedData.nodes.forEach((node) => {
        node.size = Math.random() * 20 + 6;
      });

      // 给每一条边加一个ID
      // transformedData.edges = data.edges.map((edge, index) => ({
      //   ...edge,
      //   id: `edge-${index}`, // 生成唯一 id，例如 edge-0, edge-1
      // }));
      // console.log('假数据在此！',transformedData);
      
      /****************假数据********************/

      // 更新图数据状态
      setGraphData(transformedData); 
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
      // width: 500, // 初始宽度
      // height: 500, // 初始高度
      // autoResize: true,
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
        // palette: {
        //   type: 'group',
        //   field: 'cluster',
        //   color: (d)=>{
        //     console.log(d.id);
            
        //   }
        // },
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
          // Prevent nodes from overlapping by specifying a collision radius for each node.
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
        },
        // 图例
        // {
        //   type: 'legend',
        //   nodeField: 'cluster',
        //   // edgeField: 'edge_type',
        //   titleText: 'Nodes Type',
        //   trigger: 'click',
        //   position: 'top',
        //   // container: hoverBox.current,
        //   gridCol: 3,
        //   itemLabelFontSize: 12,
        // }
      ]
    });

    /****************************HOVER************************************ */
    graph.on(NodeEvent.POINTER_ENTER, (event) => {
      // const { target } = event;
      // graph.updateNodeData([
      //   { id: target.id, style: { fill: 'lightgreen', labelFill: 'lightgreen' } },
      // ]);
      // graph.draw();
    });

    graph.on(EdgeEvent.POINTER_ENTER, (event) => {
    });
    
    graph.on(NodeEvent.POINTER_OUT, (event) => {
    });
    
    graph.on(EdgeEvent.POINTER_OUT, (event) => {
    });

    // 动态调整节点大小
    // data.nodes.forEach((node) => {
    //   const degree = graph.getNodeDegree(node.id); // 获取节点的总度
    //   node.size = 20 + degree * 10; // 根据度动态调整大小，最小为20，增加与度成正比
    // });
    // 动态调整节点大小
    // console.log('degree == ',degree);
    
    // data.nodes.forEach((node) => {
    //   log
    //   const degree = graph.degree(node.id); // 获取节点的总度
    //   node.size = 20 + degree * 10; // 根据度动态调整大小，最小为20，增加与度成正比
    // });

    // 加载数据
    // graph.data(data);
    // setTimeout(()=>{
    //   console.log('getNodeData == ',graph.getNodeData());
    //   console.log(' getInDegree() == ' ,getInDegree(data, '32'));
    //   // console.log();
      
    //   // graph.setNode({id: '7',style:{fill: 'black'}}) // 所有一起设置，但很慢
    //   // graph.updateNodeData([{ id: '1', style: { fill: 'black' } }]) // 不生效啊
    // },3000)

    console.log('?????');
    

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
    // console.log(graph.getData());
    // console.log(graph.getPlugins()); //获取该图的插件
    // console.log(graph.getElementDataByState('node', 'selected')); // 
    // graph.setElementState('entity_Monad','selected')
    console.log(graph.getElementState('entity_Monad'));
    
    // graph.clear()
  }
  const handle3 = () => {
    // graph = new Graph
    console.log(graph.getData());
    console.log(graph.getNodeData());
    // graph.render()
  }
  // setTimeout(()=>{
  //   graph.addEdgeData([{ source: '15', target: '17' }])
  //   graph.draw()
  // },1000)
  // setTimeout(()=>{
  //   graph.addEdgeData([{ source: '8', target: '17' }])
  //   graph.draw()
  // },2000)
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
    
  }
  return (

    <div className="graph">
    <Spin tip="Loading" spinning={loading} style={{marginTop: '300px'}}>
      <Button onClick={handleFindShortestPath}>最短路径</Button>
      <Button onClick={downloadJson}>下载JSON数据</Button>
      {/* <Button onClick={testG6}>测试G6按钮</Button> */}
      {/* 图例 */}
       <div className="hoverBox" ref={hoverBox}>
        <div className="legendTitle">
          Node Types
        </div>
        {/* <div className="legend">
          {Object.entries(TypeColors).map(([type, color]) => (
            <div className="legend-item" key={type} onClick={() => handleClick(type)}>
              <span className="color-circle" style={{ backgroundColor: color }}></span>
              <span>{type.replace(/_/g, " ")}</span>
            </div>
          ))}
        </div> */}
        {/* <div className="legend">
          {nodeCategories.map((category) => (
            <div
              key={category}
              className="legend-item"
              onClick={() => handleClick(category)}
            >
              <span
                className="color-circle"
                style={{ backgroundColor: TypeColors[category] }}
              ></span>
              <span>{category.replace(/_/g, ' ')}</span>
            </div>
          ))}
        </div> */}
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
      {/* <Input></Input> */}
      {/* <div className="inputContainer">
      <input
        type="text"
        value={content} // 与状态绑定
        onFocus={handleFocus} // 聚焦事件
        onBlur={handleBlur} // 失焦事件
        onChange={handleInputChange} // 输入框内容变化
        placeholder="请输入内容"
        style={{
          width: "100%",
          padding: "10px",
          fontSize: "16px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />
      <Popover
        content={
          <Editor
            width="300px"
            height="300px"
            defaultLanguage="sql"
            value={content} // 与状态绑定
            onChange={handleEditorChange} // 编辑器输入时更新状态
            options={{
              automaticLayout: true,
              minimap: { enabled: false },
            }}
          />
        }
        placement="bottom"
        trigger="click" // 让 Popover 在聚焦时显示
        open={isPopoverVisible} // 控制显示状态
      ></Popover>
      </div> */}
      {/* <Editor defaultLanguage="sql" defaultValue="// 请输入Nebulagraph图数据库语言" />; */}
      {/* <button onClick={handle}>testtest</button>
      <button onClick={handle2}>子图</button>
      <button onClick={handle3}>子图</button> */}
      <div id="web3graph" ref={containerRef}></div>
    </Spin>

    </div>

  );
};

export default KGraph;
