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