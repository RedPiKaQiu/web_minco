/**
 * AI对话页面，提供与AI助手进行智能对话的功能界面
 */
import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Menu, Edit, Plus, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Message = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
};

const AiChatPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const quickQuestions = [
    '今天有什么重要的事情要做？',
    '帮我安排一下今天的时间',
    '看看这周有什么事项',
    '我想完成一个新项目',
    '给我一些提高效率的建议'
  ];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 隐藏底部导航栏
  useEffect(() => {
    // 隐藏底部导航栏
    document.body.classList.add('hide-navigation');

    // 组件卸载时恢复底部导航栏
    return () => {
      document.body.classList.remove('hide-navigation');
    };
  }, []);

  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // 模拟机器人自动回复
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '好的',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const handleSendMessage = () => {
    sendMessage(inputText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <div className="flex flex-col h-screen bg-ocean-50">
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-100">
        <button onClick={handleGoBack} className="flex items-center">
          <ChevronLeft size={24} />
          <span className="ml-1 text-lg">返回</span>
        </button>
        <div className="flex">
          <button className="p-2">
            <Menu size={24} />
          </button>
          <button className="p-2 ml-2">
            <Edit size={24} />
          </button>
        </div>
      </div>

      {/* 聊天主体 */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* 默认欢迎消息 */}
        {messages.length === 0 && (
          <div className="py-6">
            <h1 className="text-2xl font-bold mb-2">嗨！想聊点什么？😇</h1>
          </div>
        )}

        {/* 消息列表 */}
        <div className="space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.isUser
                    ? 'bg-blue-500 text-white rounded-tr-none'
                    : 'bg-white text-gray-800 rounded-tl-none shadow-sm'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 建议提示 - 只在初始状态显示 */}
      {messages.length === 0 && (
        <div className="px-4 py-2">
          <div className="flex flex-col items-end space-y-2">
            {quickQuestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="inline-block bg-white p-3 rounded-lg text-right shadow-sm cursor-pointer hover:bg-gray-50"
              >
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 底部输入框 */}
      <div className="p-4 bg-gray-100 border-t border-gray-200">
        <div className="flex items-center bg-white rounded-full shadow-sm">
          <button className="p-3 text-gray-500">
            <Plus size={24} />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="和MinCo聊聊吧"
            className="flex-1 px-3 py-3 bg-transparent focus:outline-none"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className={`p-3 rounded-full ${
              inputText.trim() ? 'text-blue-500' : 'text-gray-400'
            }`}
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiChatPage; 