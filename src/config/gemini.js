// const apiKey = "--iKtUA"
// pnpm install @google/generative-ai
// import {
//   GoogleGenerativeAI,
//   HarmCategory,
//   HarmBlockThreshold,
// } from "@google/generative-ai");

// // AIzaSyAFCLWF48o3KJHrUMPatjUD98Qe--iKtUA
// const apiKey = "AIzaSyAFCLWF48o3KJHrUMPatjUD98Qe";
// const genAI = new GoogleGenerativeAI(apiKey);

// const model = genAI.getGenerativeModel({
//   model: "gemini-2.0-flash-exp",
// });

// const generationConfig = {
//   temperature: 1,
//   topP: 0.95,
//   topK: 40,
//   maxOutputTokens: 8192,
//   responseMimeType: "text/plain",
// };

// async function run(prompt) {
//   const chatSession = model.startChat({
//     generationConfig,
//     history: [
//     ],
//   });

//   const result = await chatSession.sendMessage(prompt);
//   console.log(result.response.text());
// }

// // run();
// export default run;



/**************************QIANWEN****************************8 */
import axios from "axios";

// 替换为你的实际 API Key
const apiKey = import.meta.env.VITE_API_KEY;
const baseURL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'

const generationConfig = {
  model: "qwen-plus", // 模型列表：https://help.aliyun.com/zh/model-studio/getting-started/models
  messages: [],
};

async function run(prompt) {
  console.log("qianwen");

  try {
    const response = await axios.post(
      baseURL,
      {
        ...generationConfig,
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const result = response.data.choices[0].message.content;
    console.log('这里是Gemini.js，我的回答是：',result);
    return result;
  } catch (error) {
    console.error(`错误信息：${error.message}`);
    console.error("请参考文档：https://help.aliyun.com/zh/model-studio/developer-reference/error-code");
    return null;
  }
}


async function recommendQ(promptQ) {
  console.log("qianwen");

  try {
    const response = await axios.post(
      baseURL,
      {
        ...generationConfig,
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: '根据刚才我向你提问的内容'+promptQ+'，简短地返回3个你觉得我可能感兴趣的问题，保存在长度为3的数组中' },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const result = response.data.choices[0].message.content;
    // console.log('这里是recommendQ  我的回答是：',result);
    return result;
  } catch (error) {
    console.error(`错误信息：${error.message}`);
    console.error("请参考文档：https://help.aliyun.com/zh/model-studio/developer-reference/error-code");
    return null;
  }
}

// export default for use in other modules

export {run ,recommendQ};