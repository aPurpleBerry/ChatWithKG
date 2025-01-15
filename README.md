# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh


# aliyun
https://developer.aliyun.com/article/1437958

G6官网：https://g6.antv.antgroup.com/zh/examples/algorithm/case/#pattern-matching


antvg6自定义节点类的颜色

所有节点信息：graph.getNodeData()

入度出度 getInDegree(data, '32')

draw方法 仅执行元素绘制，不会重新布局
const handle = () => {
    graph.addEdgeData([{ source: '15', target: '17' }])
    // graph.render()
    graph.updateData({
      nodes: [{ id: '1', style: { x: 100, y: 100 } }],
    });
    graph.draw()
  }


  # 做子图
  首先我发现了 graph配置中有一个图例，点击它会使得对应的节点变亮

  {
  type: 'legend',
  nodeField: 'cluster',
  // edgeField: 'edge_type',
  titleText: 'Nodes Type',
  trigger: 'click',
  position: 'top',
  // container: hoverBox.current,
  gridCol: 3,
  itemLabelFontSize: 12,
}

我在本地源码中搜索不到具体暴露的方法
所以去GitHub上全局搜索文件，找到了。
https://github.com/antvis/G6/blob/v5/packages/g6/src/plugins/legend.ts
里面的container 方法（图例挂载的容器，无则挂载到 Graph 所在容器） 我试过，不符合我的要求
我希望图例悬浮在 canvas上，所以只能自己封装图例。

然后我找到了本地源码中的几个有关状态的有用方法：
getElementState 获取元素状态，经实验可知 未选中的状态为空，选中的叫selected
setElementState(id, state) 比如setElementState("01","selected")

这样就可以做到，点击图例-> 数据方法对 对应的type遍历 设置 “选中” 状态

### js知识点
点击事件->事件委托
选择对应类节点->filter
遍历数组->foreach


## 找到算法所有暴露的函数了
V:\Web\SuperScopeChat\superscopechat2.0_react\node_modules\.pnpm\@antv+algorithm@0.1.26\node_modules\@antv\algorithm\lib\index.d.ts