import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Menu, Edit, Plus, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AiChatPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const suggestions = [
    '看看这周有什么任务',
    '感觉目前状态有点卡住',
    '需要一点动力'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 添加用户消息
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
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
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-tr-none'
                    : 'bg-white text-gray-800 rounded-tl-none shadow-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && <div className="text-gray-500">AI正在思考...</div>}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 建议提示 - 只在初始状态显示 */}
      {messages.length === 0 && (
        <div className="px-4 py-2">
          <div className="flex flex-col items-end space-y-2">
            {suggestions.map((suggestion, index) => (
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
        <form onSubmit={handleSubmit} className="flex items-center bg-white rounded-full shadow-sm">
          <button className="p-3 text-gray-500">
            <Plus size={24} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-3 py-3 bg-transparent focus:outline-none"
            placeholder="和MinCo聊聊吧"
          />
          <button
            type="submit"
            disabled={loading}
            className={`p-3 rounded-full ${
              loading ? 'text-gray-400' : 'text-blue-500'
            }`}
          >
            <Send size={24} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiChatPage; 