import React from "react";
import Sidebar from "./components/Siderbar/Sidebar";
import Main from "./components/Main/Main";
import Graph from "./components/Graph/Graph";
import './App.css'

const App = () => {
  return (
    <div className="app-container">
      <Sidebar></Sidebar>
      <Main></Main>
      <Graph></Graph>
    </div>
  )
}

export default App