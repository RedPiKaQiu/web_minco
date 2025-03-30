import { Request, Response } from 'express';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
});

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { message } = req.body;

  try {
    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`
      },
      body: JSON.stringify({
        model: "qwen-max-2025-01-25",
        messages: [
          { role: "system", content: "你是一个友好的助手，名叫MinCo。" },
          { role: "user", content: message }
        ],
      })
    });

    const data = await response.json();
    res.status(200).json({ message: data.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: '对话出错了，请稍后再试' });
  }
} 