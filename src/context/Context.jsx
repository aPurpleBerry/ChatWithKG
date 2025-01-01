import { createContext,useState,useEffect } from "react";
import { run, recommendQ } from '../config/gemini'

export const Context = createContext();

const ContextProvider = (props) => {

  const [input, setInput] = useState("");// 用户输入
  const [chatSessions, setChatSessions] = useState([]); // 所有聊天记录组
  const [currentChatId, setCurrentChatId] = useState(1); // 当前会话 ID
  const [loading, setLoading] = useState(false); // 加载状态
  const [showResult, setShowResult] = useState(false) // 显示结果状态
  
  // 初始化默认会话
  useEffect(() => {
    if (chatSessions.length === 0) {
      createNewChat();
    }
  }, [chatSessions]);

  // 获取当前聊天记录
  const currentChat = chatSessions.find((chat) => chat.id === currentChatId) || { messages: [] };
  console.log('currentChat=',currentChat);
  
  const delayPara = (index, nextWord) => {
    setTimeout(function() {
      setResultData(prev => prev + nextWord);
    }, 75*index)
  }

   // 发送消息方法
   const onSent = async () => {
    console.log('发送了消息11', loading);
    
    if (!input.trim()) return; // 防止空输入

    const userMessage = input; // 保存当前用户输入
    setInput(""); // 清空输入框
    setLoading(true); // 设置加载状态
    console.log('发送了消息222', loading);

    let recommendations = [
      "What is Web3 technology?",
      "How does blockchain work?",
      "Tell me about smart contracts."
    ]; // 示例推荐问题，可根据业务逻辑生成


    try {
      // const response = await run(userMessage); // 调用 API 获取回复
      // const formattedResponse = formatResponse(response); // 格式化机器人回复
      
      const formattedResponse = await run(userMessage); // 调用 API 获取回复
      // const formattedResponse = formatResponse(response); // 格式化机器人回复
      const reQ = await recommendQ(userMessage);
      try {

        // 使用正则表达式提取中括号内的内容
        const match = reQ.match(/\[.*?\]/);

        if (match) {
          // 将提取的字符串解析为数组
          const questionsArray = JSON.parse(match[0]);
          console.log(questionsArray);
          // 输出: ["什么是人工智能？", "如何构建一个聊天机器人？", "AI技术在未来会有哪些应用？"]

          // 提取前三个问题
          const firstThreeQuestions = questionsArray.slice(0, 3);
          console.log(firstThreeQuestions);
          recommendations = firstThreeQuestions;
          // 输出: ["什么是人工智能？", "如何构建一个聊天机器人？", "AI技术在未来会有哪些应用？"]
        } else {
          console.log("未找到符合格式的中括号内容");
        }
        // console.log('推荐',reQ);
        
        // console.log('我是recommendQ111',JSON.parse(reQ));
        // console.log('我是recommendQ2222',typeof JSON.parse(reQ));
      } catch (error) {
        console.log(error);
        
      }
      

      // 更新当前聊天记录
      setChatSessions((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: [...chat.messages, { user: userMessage, bot: formattedResponse }],
                summary: generateSummary([...chat.messages, { user: userMessage, bot: formattedResponse }]),
                recommendations, // 推荐问题
              }
            : chat
          )
        );
        console.log('setChatSessions = ',chatSessions);
        
        setShowResult(true); // 确保成功后显示结果
      } catch (error) {
        console.error("Error during API call:", error);
        setShowResult(false); // API 调用失败时不显示结果
      } finally {
        setLoading(false);
      }
    };

  // 创建新聊天窗口
  const createNewChat = () => {
    const newId = chatSessions.length ? Math.max(...chatSessions.map((chat) => chat.id)) + 1 : 1;
    setChatSessions((prev) => [...prev, { id: newId, messages: [], summary: "New conversation" }]);
    setCurrentChatId(newId); // 切换到新聊天窗口
    setShowResult(false); // 确保新建聊天时不显示结果
  };


  // 格式化机器人回复（处理 ** 和 * 等标记）
  const formatResponse = (response) => {
    let responseArray = response.split("**");
    let formatted = "";

    for (let i = 0; i < responseArray.length; i++) {
      if (i % 2 === 1) {
        formatted += `<b>${responseArray[i]}</b>`;
      } else {
        formatted += responseArray[i];
      }
    }

    return formatted.split("*").join("<br/>"); // 替换 * 为换行
  };

  // 生成摘要
  const generateSummary = (messages) => {
    if (!messages.length) return "New conversation";
    const firstMessage = messages[0].user;
    return firstMessage.length > 30 ? `${firstMessage.slice(0, 30)}...` : firstMessage;
  };


  // const onSent = async () => {
  //   if (!input.trim()) return; // 防止空输入
  //   setResultData("")
  //   setLoading(true)
  //   setShowResult(true)
  //   setRecentPrompt(input)
  //   setPrevPrompts(prev => [...prev, input])
  //   const response = await run(input)
  //   let responseArray = response.split("**")
  //   let newResponse;
  //   for(let i = 0; i < responseArray.length; i++) {
  //     if(i === 0 || i % 2 !== 1) {
  //       newResponse += responseArray[i]
  //     } else {
  //       newResponse += '<b>' + responseArray[i] + '</b>'
  //     }
  //   }
  //   let newResponse2 = newResponse.split("*").join("</br>")
  //   let newResponseArray = newResponse2.split(" ");
  //   for(let i = 0; i < newResponseArray.length; i++) {
  //     const nextWord = newResponseArray[i]
  //     delayPara(i, nextWord + " ")
  //   }
  //   // setResultData(newResponse)
  //   setLoading(false)
  //   setInput("")
  // }

  // onSent("介绍一下react")

  // const contextValue = {
  //   prevPrompts,
  //   setPrevPrompts,
  //   onSent,
  //   recentPrompt,
  //   setRecentPrompt,
  //   showResult,
  //   loading,
  //   resultData,
  //   input,
  //   setInput
  // }

  // 上下文值
  const contextValue = {
    chatSessions, // 所有聊天会话
    currentChatId, // 当前聊天 ID
    setCurrentChatId, // 切换聊天窗口
    // currentChat, // 当前聊天记录
    currentChat: chatSessions.find((chat) => chat.id === currentChatId) || { messages: [] }, // 当前聊天记录
    input, // 用户输入
    setInput, // 设置用户输入
    onSent, // 发送消息方法
    loading, // 加载状态
    showResult,
    createNewChat, // 创建新聊天窗口
  };

  return (
    <Context.Provider value={contextValue}>
      {props.children}
    </Context.Provider>
  )
}

export default ContextProvider