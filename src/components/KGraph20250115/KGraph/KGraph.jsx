import React, { useState, useEffect, useRef,useContext } from 'react';
import { Spin, Button, Input, Select, message, Card,Popover } from 'antd';
import * as d3 from 'd3';
import axios from 'axios';
import { Context } from '../../context/Context'
import { EdgeEvent, Graph, NodeEvent } from '@antv/g6';
import { getInDegree } from '@antv/algorithm';
// import G6 from '@antv/g6';
// import { degree } from '@antv/algorithm'
// import { findShortestPath } from '@antv/algorithm';
import './KGraph.css';
import data from './nodeData.json'
// import data from './output.json'
import data2 from './nodeData2.json'
import outputdata from './output.json'

import Editor, { DiffEditor, useMonaco, loader } from '@monaco-editor/react';

// import { Popover } from "antd";
// const { Option } = Select;
let graph; // 全局图变量
let kgdata; // 全局图数据
let transformedData;

const qinyaodata = {
  nodes: [
    {
      id: "entity_PlatON",
      data: {
        cluster: "entity",
      }
    },
    {
      id: "entity_Rich_Kim",
      data: {
        cluster: "entity",
      }
    }
  ],
  edges: [
    {
      source: "entity_PlatON",
      target: "entity_Rich_Kim",
      edge_type: "funded_by"
    }
  ]
}

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
  const graphRef = useRef(null);

  useEffect(() => {
    // 请求图数据
    const fetchGraphData = async () => {
      // setALoading(true);
      // try {
        const response = await axios.post('http://localhost:8081/ngql/getNodesAndEdgesByNGQL', { query: 'match (v1)-[e]->(v2) return id(v1), e, v2 limit 30' });
        console.log('response.data.data = ' ,response.data.data);
        const data = response.data.data;
        console.log(data);
    };
    try {
      let test1 = fetchGraphData();
      console.log(test1);
      
    }  catch(err) {
      console.log('这里',err);
    }
    // 转换 nodes
    const transformedNodes = outputdata.nodes.map(node => ({
      id: node.id,
      data: { cluster: node.type }
    }));

    // 转换 edges
    const transformedEdges = outputdata.edges.map(edge => ({
      source: edge.source,
      target: edge.target,
      edge_type: edge.type, // 重命名 type 为 edge_type
    }));

    // 组合成新的数据结构
    transformedData = {
      nodes: transformedNodes,
      edges: transformedEdges,
    };

    // 输出转换结果
    // console.log(JSON.stringify(transformedData, null, 2));
    // console.log(typeof transformedData);
    // console.log(typeof data);
    // console.log(JSON.stringify(transformedData, null, 2));


    if (!containerRef.current) return;
    
    const nodes = transformedData.nodes;
    
    // randomize the node size
    nodes.forEach((node) => {
      node.size = Math.random() * 20 + 6;
    });
    // console.log('节点',nodes);


    graph = new Graph({
      container: containerRef.current,
      animation: false,
      width: 700, // 初始宽度
      height: 700, // 初始高度
      // width: 500, // 初始宽度
      // height: 500, // 初始高度
      // autoResize: true,
      data: transformedData,
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

    graph.on(EdgeEvent.POINTER_ENTER, (event,items) => {
      // const { target } = event;
      // console.log('边HOVER：',event,items);
      
      // graph.updateEdgeData([
      //   { id: target.id, style: { labelText: target+'Hovered', stroke: 'lightgreen', labelFill: 'lightgreen', lineWidth: 3 } },
      // ]);
      // graph.draw();
    });
    
    graph.on(NodeEvent.POINTER_OUT, (event) => {
      // const { target } = event;
      // graph.updateNodeData([{ id: target.id, style: { labelText: 'Hover me!', fill: '#5B8FF9', labelFill: 'black' } }]);
      // graph.draw();
    });
    
    graph.on(EdgeEvent.POINTER_OUT, (event) => {
      // const { target } = event;
      // graph.updateEdgeData([
      //   { id: target.id, style: { labelText: 'Hover me!', stroke: '#5B8FF9', labelFill: 'black', lineWidth: 1 } },
      // ]);
      // graph.draw();
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
    

    // const container = containerRef.current;
    //  // 响应式调整函数
    //  const handleResize = () => {
    //   const width = containerRef.current.offsetWidth;
    //   const height = containerRef.current.offsetHeight;
    //   graph.changeSize(width, height); // 更新画布大小
    // };

    
    // // 使用 ResizeObserver 监听容器变化
    // const resizeObserver = new ResizeObserver(handleResize);
    // resizeObserver.observe(containerRef.current);
    // 创建 ResizeObserver 实例
    // const container = containerRef.current;
    // const resizeObserver = new ResizeObserver((entries) => {
    //   for (let entry of entries) {
    //     // graph.render();

    //     const { width, height } = entry.contentRect; // 获取元素大小
    //     console.log("Container resized:", { width, height });
    //     graph.resize(width,height)
    //     // 在这里可以根据宽高重新渲染图形或执行其他逻辑
    //     // e.g., 调用 G6 的 changeSize 方法调整画布
        
    //   }
    // });

    // // 开始监听容器
    // resizeObserver.observe(container);

    // 清理逻辑，防止多次渲染
    return () => {
      // resizeObserver.disconnect(); // 停止监听
      graph.destroy();
      // graphRef.current = null;
    };

    
  }, []);

  /**********************改变画布大小****************************** */
  useEffect(() => {
    const resizeGraph = () => {
      // console.log('isSidebarCollapsed == ',isSidebarCollapsed);
      // console.log('isMainCollapsed == ',isMainCollapsed);
      if(isMainCollapsed && isSidebarCollapsed) {
        // console.log('都折叠了');
        graph.resize
        graph.resize(1300,800);
      } else if(!isMainCollapsed && isSidebarCollapsed) {
        // console.log('Sidebar折叠  Main不折叠');    
        graph.resize(1200,800);
      } else if(isMainCollapsed && !isSidebarCollapsed) {
        // console.log('Main折叠  Sidebar不折叠');  
        graph.resize(1200,800);
      } else {
        // console.log('都不不不不');
        graph.resize(600,800);
      }
      graph.render();
      // console.log('Graph size:', graph.width, graph.Height);
      // console.log('containerRef.current.offsetWidth', containerRef.current.offsetWidth, containerRef.current.offsetHeight);
    };

    // 在状态变化时重新调整大小
    resizeGraph();
  }, [isSidebarCollapsed, isMainCollapsed]);

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
    transformedData.nodes.forEach((node) => {
      graph.setElementState(node.id, [])
      // console.log("Node ID:", node.id);
    });

    console.log(`当前点击类型: ${selectedCluster}`);
    // 从 data 中筛选符合条件的节点
    const filteredNodes = transformedData.nodes.filter(
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

  return (
    <div className="graph">
      <button>数据库</button>
       <div className="hoverBox" ref={hoverBox}>
        <div className="legendTitle">
          Node Types
        </div>
        <div className="legend">
          {Object.entries(TypeColors).map(([type, color]) => (
            <div className="legend-item" key={type} onClick={() => handleClick(type)}>
              <span className="color-circle" style={{ backgroundColor: color }}></span>
              <span>{type.replace(/_/g, " ")}</span>
            </div>
          ))}
        </div>
      </div>
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
    </div>
  );
};

export default KGraph;
