import React, { useContext,useEffect } from "react";
import './Sidebar.css'
import {assets} from '../../assets/assets'
import { useState } from "react";
import { Context } from "../../context/Context";

const Sidebar = ({ isCollapsed, toggleCollapse }) => {
  const [extended, setExtended] = useState(false)
  // 当 isCollapsed 改变时，更新 extended
  useEffect(() => {
    setExtended(!isCollapsed);
  }, [isCollapsed]);

  const { chatSessions, setCurrentChatId, currentChatId, createNewChat } = useContext(Context); // 获取聊天历史

  return (
    <div className="sidebar" style={{ width: isCollapsed ? '50px' : '200px' }}>
        <div className="top">
          {/* <button className="toggle-btn" onClick={toggleCollapse}>
          {isCollapsed ? 'Expand' : 'Collapse'}
        </button> */}
          <img 
            onClick={toggleCollapse}
            className="menu" 
            src={assets.menu_icon} 
            alt="" />
          <div className="new-chat" onClick={createNewChat}> 
            <img src={assets.plus_icon} alt="" />
            {extended?<p>New Chat</p>:null}
          </div>
          {extended ? (
            <div className="recent">
              <p className="recent-title">Recent</p>
              {chatSessions.length > 0 ? (
                chatSessions.map((chat, index) => (
                  <div
                    key={chat.id}
                    className={`recent-entry ${currentChatId === chat.id ? "active" : ""}`}
                    onClick={() => setCurrentChatId(chat.id)} // 切换会话
                  >
                    <img src={assets.message_icon} alt="message" />
                    <p>{chat.summary || "No summary available"}</p> {/* 显示摘要 */}
                  </div>
                ))
              ) : (
                <p className="no-history">No recent chats</p>
              )}
            </div>
          ) : null}
        </div>
        
        <div className="bottom">
          <div className="bottom-item recent-entry">
            <img src={assets.question_icon} alt="" />
            {extended?<p>Help</p>:null}
          </div>
          <div className="bottom-item recent-entry">
            <img src={assets.history_icon} alt="" />
            {extended?<p>Activity</p>:null}
          </div>
          <div className="bottom-item recent-entry">
            <img src={assets.setting_icon} alt="" />
            {extended?<p>Setting</p>:null}
          </div>
        </div>
    </div>
  )
}

export default Sidebar