import React,{useEffect } from 'react'
import './Main.css'
import {assets} from '../../assets/assets'
import { useContext } from 'react'
import { Context } from '../../context/Context'
 
const Main = () => {
  // const {onSent, recentPrompt, showResult, loading, resultData, input, setInput }  = useContext(Context)
  // const { onSent, chatHistory, showResult, loading, input, setInput } = useContext(Context);
  const { onSent, currentChat,createNewChat, showResult, loading, input, setInput } = useContext(Context);
  
  useEffect(() => {
    if (!currentChat || !currentChat.messages) {
      createNewChat();
    }
  }, [currentChat]); // 确保当 currentChat 不存在时创建新会话

  return (
    <div className="main">
      {/* nav */}
      <div className="nav">
        <p>SuperScopeChat</p>
        <img src={assets.user_icon} alt="" />
      </div>
      {/* main-container */}
      <div className="main-container">
        {
          !showResult
          ?  
          <>
            <div className="greet">
              <p><span>Hello, Dev.</span></p>
              <p style={{fontSize: "40px"}}>How can I support you with your Web3 needs today?</p>
            </div>
            
            <div className="cards">
              <div className="card">
                <p>Suggest beautiful places to see on an upcoming road trip</p>
                <img src={assets.compass_icon} alt="" />
              </div>
              <div className="card">
                <p>Briefly summarize this concept: urban planninig</p>
                <img src={assets.bulb_icon} alt="" />
              </div>
              <div className="card">
                <p>Brainstorm team bonding activities for our work retreat</p>
                <img src={assets.message_icon} alt="" />
              </div>
              <div className="card">
                <p>Improve the readabilitu of the following code </p>
                <img src={assets.code_icon} alt="" />
              </div>
            </div>
          </> : 
          (
            <div className="result">
              <div className="result-title">
                <img src={assets.user_icon} alt="" />
                <p>Chat </p>
              </div>
              <div className="result-data">
                {
                  currentChat.messages.map((chat, index) => (
                    <div key={index} className="chat-item">
                      <div className="chat-user">
                        <img src={assets.user_icon} alt="user" />
                        <p>{chat.user}</p>
                      </div>
                      <div className="chat-bot">
                        <img src={assets.gemini_icon} alt="bot" />
                        <p dangerouslySetInnerHTML={{ __html: chat.bot }}></p>
                      </div>
                    </div>
                  ))
                }
                {loading && (
                  <div className="loader">
                    <hr />
                    <hr />
                    <hr />
                  </div>
                )}

                 {/* 推荐问题区域 */}
                {currentChat.recommendations && !loading && (
                  <div className="recommendations">
                    {/* <h3>Recommended Questions</h3> */}
                    <ul>
                      {currentChat.recommendations.map((rec, idx) => (
                        <li key={idx} onClick={() => setInput(rec)}>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )
        }
        

        <div className="main-bottom">
          <div className="search-box">
            <input 
              onChange={(e)=>setInput(e.target.value)} 
              value={input} 
              type="text" 
              placeholder="Enter a prompt here" />
            <div>
              <img src={assets.gallery_icon} alt="" />
              <img src={assets.mic_icon} alt="" />
              <img onClick={()=>onSent()} src={assets.send_icon} alt="" />
            </div>
          </div>
          <p className="bottom-info">
            SuperScopeChat may display inaccurate info, including about people,
          </p>
        </div>

      </div>

    </div>
  )
}

export default Main