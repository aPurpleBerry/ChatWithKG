import React, { useState, useEffect } from "react";
import Sidebar from "./components/Siderbar/Sidebar";
import Main from "./components/Main/Main";
import Graph from "./components/Graph/Graph";
import './App.css'

const App = () => {
  // State to manage the width of Sidebar and Main
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMainCollapsed, setMainCollapsed] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    const sidebarState = localStorage.getItem('isSidebarCollapsed');
    const mainState = localStorage.getItem('isMainCollapsed');
    if (sidebarState) setSidebarCollapsed(JSON.parse(sidebarState));
    if (mainState) setMainCollapsed(JSON.parse(mainState));
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('isSidebarCollapsed', isSidebarCollapsed);
    localStorage.setItem('isMainCollapsed', isMainCollapsed);
  }, [isSidebarCollapsed, isMainCollapsed]);

  return (
    // <div className="app-container">
    //   <Sidebar></Sidebar>
    //   <Main></Main>
    //   <Graph></Graph>
    // </div>
    <div className="app-container">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setSidebarCollapsed(!isSidebarCollapsed)}
      />
      <Main
        isCollapsed={isMainCollapsed}
        toggleCollapse={() => setMainCollapsed(!isMainCollapsed)}
      />
      <Graph />
    </div>
  )
}

export default App