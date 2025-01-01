import React, { useState, useEffect, useRef,useContext } from 'react';
import { Spin, Button, Input, Select, message, Card } from 'antd';
import * as d3 from 'd3';
import axios from 'axios';
import { Context } from '../../context/Context'

import './Graph.css';

const { Option } = Select;

const Graph = () => {
  const { onSent, setInput } = useContext(Context);

  // 图相关的
  const svgRef = useRef(null); // 用于存储 SVG 容器引用
  const colorRef = useRef(null); // 使用 useRef 持久化颜色比例尺

  const [Aloading, setALoading] = useState(true); // 控制图形加载状态
  const [query, setQuery] = useState("match (v1)-[e]->(v2) return id(v1), e, v2 limit 100"); // nGQL 查询语句
  const [nodeData, setNodeData] = useState(null); // 单个节点详情
  const graphRef = useRef(null); // 图形容器的引用

  // 确保这些数据在分类筛选和重新渲染的过程中不被修改
  const [originalNodes, setOriginalNodes] = useState([]); // 原始节点数据
  const [originalEdges, setOriginalEdges] = useState([]); // 原始边数据


  // 分类子图
  const [allNodes, setAllNodes] = useState([]); // 当前所有节点
  const [allEdges, setAllEdges] = useState([]); // 当前所有边
  const [types, setTypes] = useState([]); // 节点类型
  const [selectedType, setSelectedType] = useState(null); // 用户选择的类型

  
  // 宽高等 D3 变量
  let width, height, tooltip, simulation, edge, node;
  // let width, height, color, tooltip, simulation, edge, node;
  
  // 定义节点类型到形状的映射
  const shapeMap = {
    entity: "circle", // 圆形
    project_tag: "rect", // 矩形
    fund_raising_event: "path", // 三角形
    ecology: "diamond", // 
    news: "star" // 
  };

  const iconMap = {
    entity: "/icons/entity-icon.svg",
    project_tag: "/icons/project-icon.svg",
    fund_raising_event: "/icons/event-icon.svg",
    ecology: "/icons/ecology-icon.svg",
    news: "/icons/news-icon.svg",
  };
  
  // 初始化图形容器
  useEffect(() => {
    if (graphRef.current) {
      const rect = graphRef.current.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      // color = d3.scaleOrdinal(d3.schemeCategory10);
      // 初始化颜色比例尺
      colorRef.current = d3.scaleOrdinal(d3.schemeCategory10);

      tooltip = d3.select('body').append('div')
        .attr('class', 'd3-tooltip')
        .style('opacity', 0);

      svgRef.current = d3.select(graphRef.current).append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [-width / 2, -height / 2, width, height])
        .attr('style', 'max-width: 100%; height: auto;');

      fetchGraphData(query);
    }

    return () => {
      // 清理 D3 图形和 Tooltip
      d3.select(graphRef.current).selectAll('*').remove();
      d3.select('body').select('.d3-tooltip').remove();
    };
  }, [graphRef]);

  // 渲染图例
  const addLegend = (svg, colorScale, shapeMap) => {
    const legendData = [
      { type: "entity", label: "Entity" },
      { type: "project_tag", label: "Project Tag" },
      { type: "fund_raising_event", label: "Fund Raising Event" },
      { type: "ecology", label: "Ecology" },
      { type: "news", label: "News" },
    ];
  
    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", "translate(200, 120)"); // 调整图例位置
  
    legendData.forEach((item, index) => {
      const legendItem = legend
        .append("g")
        .attr("transform", `translate(0, ${index * 30})`); // 每项间隔 30px
  
      const shape = shapeMap[item.type];
      const color = colorScale(item.type); // 从颜色比例尺获取颜色
  
      if (shape === "circle") {
        legendItem
          .append("circle")
          .attr("r", 10)
          .attr("fill", color)
          .attr("cx", 0);
      } else if (shape === "rect") {
        legendItem
          .append("rect")
          .attr("width", 20)
          .attr("height", 20)
          .attr("x", -10)
          .attr("y", -10)
          .attr("fill", color);
      } else if (shape === "path") {
        legendItem
          .append("path")
          .attr("d", "M -10 10 L 10 10 L 0 -10 Z") // 三角形
          .attr("fill", color);
      } else if (shape === "diamond") {
        legendItem
          .append("path")
          .attr("d", "M 0 -10 L 10 0 L 0 10 L -10 0 Z") // 菱形
          .attr("fill", color);
      } else if (shape === "star") {
        legendItem
          .append("path")
          .attr(
            "d",
            "M 0 -10 L 2 -3 L 10 -3 L 4 2 L 6 10 L 0 6 L -6 10 L -4 2 L -10 -3 L -2 -3 Z"
          ) // 星形
          .attr("fill", color);
      }
  
      legendItem
        .append("text")
        .attr("x", 25) // 文本位置
        .attr("y", 5)
        .attr("font-size", "12px")
        .attr("fill", "#000")
        .text(item.label);
    });
  };

  // 请求图数据
  const fetchGraphData = async (nGQL) => {
    setALoading(true);
    try {
      const response = await axios.post('http://localhost:8081/ngql/getNodesAndEdgesByNGQL', { query: nGQL });
      console.log('response.data.data = ' ,response.data.data);
      const data = response.data.data;
      // 更新原始数据
      setOriginalNodes(data.nodes);
      setOriginalEdges(data.edges);

      // 更新当前展示数据
      setAllNodes(data.nodes); // 保存所有节点
      setAllEdges(data.edges); // 保存所有边

      // 提取节点类型
      extractTypes(data.nodes); 

      // 渲染图
      renderGraph(data);

      setALoading(false);
    } catch (error) {
      setALoading(false);
      message.error(error.response ? error.response.data.msg : error.message);
    }
  };

  // 提取节点类型
  const extractTypes = (nodes) => {
    const typesSet = new Set(nodes.map((node) => node.type));
    setTypes([...typesSet]);
  };

  // 恢复到原始数据
  const restoreOriginalGraph = () => {
    setAllNodes(originalNodes); // 恢复原始节点数据
    setAllEdges(originalEdges); // 恢复原始边数据
  
    renderGraph({ nodes: originalNodes, edges: originalEdges }); // 重新渲染图形
  };
  

  // 渲染图形
  const renderGraph = (data) => {
    const svg = svgRef.current; // 获取 SVG 引用
    const color = colorRef.current; // 从 ref 中获取颜色比例尺

    if (!svg) {
      console.error('SVG is not initialized');
      return;
    }

    if (!color) {
      console.error('Color scale is not initialized');
      return;
    }

    console.log('我是render');
    
    svg.selectAll('*').remove(); // 清空画布
    console.log('我是render222');

    svg.set

    const edges = data.edges.map(d => ({ ...d }));
    const nodes = data.nodes.map(d => ({ ...d }));

    if (simulation) {
      simulation.stop();
    }

    simulation = d3.forceSimulation(nodes)
      .force('edge', d3.forceLink(edges).id(d => d.id).distance(25))
      .force('charge', d3.forceManyBody())
      .force('collision', d3.forceCollide().radius(20))
      .force('x', d3.forceX())
      .force('y', d3.forceY());

    svg.append('defs').append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 18)
      .attr('refY', 5)
      .attr('markerWidth', 3)
      .attr('markerHeight', 3)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', '#999');

      edge = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(edges)
      .join("line")
      .attr("stroke-width", 3)
      .attr("marker-end", "url(#arrow)");

    // node = svg.append('g')
    //   .attr('stroke', '#fff')
    //   .attr('stroke-width', 1.5)
    //   .selectAll('circle')
    //   .data(nodes)
    //   .join('circle')
    //   .attr('r', 8)
    //   .attr('fill', d => color(d.type))
    //   .call(d3.drag()
    //     .on('start', dragStarted)
    //     .on('drag', dragged)
    //     .on('end', dragEnded));

    node = svg.append("g")
      .selectAll("g") // 使用 `<g>` 容器包裹节点
      .data(nodes)
      .join("g")
      .each(function (d) {
        // console.log(d.type);
        
        const g = d3.select(this); // 当前节点的 `<g>` 容器
        const shape = shapeMap[d.type] || "circle"; // 获取对应的形状，默认使用圆形
        // console.log('shape == ',shape);
        
        if (shape === "circle") {
          g.append("circle")
            .attr("r", 13) // 半径
            .attr("fill", color(d.type)); // 根据类型设置颜色
        } else if (shape === "rect") {
          g.append("rect")
            .attr("width", 30) // 宽度
            .attr("height", 30) // 高度
            .attr("x", -15) // 左上角 X 坐标
            .attr("y", -15) // 左上角 Y 坐标
            .attr("fill", color(d.type)); // 根据类型设置颜色
        } else if (shape === "path") {
          g.append("path")
            .attr("d", "M -15 15 L 15 15 L 0 -15 Z") // 三角形路径
            .attr("fill", color(d.type)); // 根据类型设置颜色
        } else if (shape === "diamond") {
          g.append("path")
            .attr("d", "M 0 -20 L 20 0 L 0 20 L -20 0 Z") // 增大菱形
            .attr("fill", color(d.type));
        } else if (shape === "star") {
          g.append("path")
            .attr(
              "d",
              "M 0 -20 L 4 -6 L 20 -6 L 8 6 L 12 20 L 0 12 L -12 20 L -8 6 L -20 -6 L -4 -6 Z"
            )
            .attr("fill", color(d.type));
        }

        // 添加图标
        if (iconMap[d.type]) {
          g.append("image")
            .attr("xlink:href", iconMap[d.type]) // SVG 文件路径
            .attr("x", -8) // 减小图标的左上角 X 坐标
            .attr("y", -8) // 减小图标的左上角 Y 坐标
            .attr("width", 16) // 减小图标宽度
            .attr("height", 16); // 减小图标高度
        }
      })
      .call(d3.drag().on("start", dragStarted).on("drag", dragged).on("end", dragEnded));



    node.on('mouseover', (event, d) => {
      tooltip.transition()
        .duration(200)
        .style('opacity', 1);
      tooltip.html(d.id)
        .style('left', `${event.pageX}px`)
        .style('top', `${event.pageY}px`);
    })
      .on('mouseout', () => {
        tooltip.transition()
          .duration(200)
          .style('opacity', 0);
      })
      .on('click', (event, d) => {
        console.log('节点被点击',event,d);
        
        fetchNodeData(d.id);
        handleNodeClick(d)
      });

    // simulation.on('tick', () => {
    //   edge
    //     .attr('x1', d => d.source.x)
    //     .attr('y1', d => d.source.y)
    //     .attr('x2', d => d.target.x)
    //     .attr('y2', d => d.target.y);

    //   node
    //     .attr('cx', d => d.x)
    //     .attr('cy', d => d.y);
    // });

    simulation.on('tick', () => {
      edge
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
    
      node
        .attr('transform', d => `translate(${d.x},${d.y})`); // 更新整个节点 `<g>` 的位置
    });
    
    // 调用渲染图例函数
    addLegend(svg, colorRef.current, shapeMap);
  };

  // 节点拖拽事件
  const dragStarted = (event) => {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  };

  const dragged = (event) => {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  };

  const dragEnded = (event) => {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  };

  // 渲染选中的子图
  const renderSubgraph = (type) => {
    // 筛选符合条件的节点
    const filteredNodes = allNodes.filter(node => node.type === type);
  
    // 筛选符合条件的边
    const filteredEdges = allEdges.filter(edge =>
      filteredNodes.some(node => node.id === edge.source) &&
      filteredNodes.some(node => node.id === edge.target)
    );
  
    // 调用 renderGraph 渲染子图
    renderGraph({ nodes: filteredNodes, edges: filteredEdges });
  };  


  // 请求节点数据 -> 卡片properties
  const fetchNodeData = async (id) => {
    setALoading(true);
    try {
      const response = await axios.post('http://localhost:8081/ngql/getNodeByVid', { vid: id });
      setNodeData(response.data.data);
      setALoading(false);
    } catch (error) {
      setALoading(false);
      message.error(error.response ? error.response.data.msg : error.message);
    }
  };

  // 处理节点点击事件
  const handleNodeClick = (nodeData) => {
    const message = `介绍一下这个节点的信息：${nodeData.id}`;
    setInput(message); // 设置输入框内容
    onSent(); // 触发对话
  };

  return (
    <div className="graph">
      <div className="toolbar">
      {/* 数据库语句 */}
      <Card
        title="Execute nGQL"
        bordered={false}
        style={{ width: 200, marginRight: "7px"
        }}
      >
        <Input.TextArea
          rows={4}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter nGQL query"
          style={{
            marginBottom: "10px",
            maxHeight: "70px", 
            overflow: "auto",  // 当内容超过最大高度时，允许滚动
          }}
        />
        <Button type="default" onClick={() => fetchGraphData(query)} disabled={Aloading}>
          Execute
        </Button>
      </Card>

      {/* 子图分类 */}
      <Card
        title="Classification"
        bordered={false}
        style={{
          width: 200, marginRight: "7px" 
        }}
      >
        <Select
          placeholder="Filter by type"
          style={{ width: 150, marginBottom: "10px"}}
          onChange={(value) => {
            setSelectedType(value); // 更新选中的类型到状态变量 selectedType
            renderSubgraph(value); // 渲染选中类型对应的子图
          }}
          allowClear
        >
          {types.map((type) => (
            <Option key={type} value={type}>
              {type}
            </Option>
          ))}
        </Select>
        <Button type="default" onClick={restoreOriginalGraph} disabled={Aloading}>
          Show All Nodes
        </Button>
      </Card>
        
      <Card
        title="Node Properties"
        bordered={false}
        style={{ width: 280, height: "230px" }} 
      >
        {nodeData ? (
          <div className="properties">
            {Object.entries(nodeData).map(([key, value]) => (
              <div key={key} style={{ marginBottom: "5px" }}>
                <strong>{key}:</strong> {String(value)}
              </div>
            ))}
          </div>
        ) : (
          <p>Click a node to fetch its properties</p>
        )}
      </Card>
        

      </div>

      <Spin spinning={Aloading} size="large">
        <div className="web3graph" ref={graphRef}></div>
      </Spin>
    </div>
  );
};

export default Graph;
