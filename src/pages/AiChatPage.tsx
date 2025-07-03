/**
 * AI对话页面，提供与AI助手进行智能对话的功能界面
 * 支持用户级别的会话隔离和安全的上下文管理
 */
import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Menu, Edit, Plus, Send, Loader, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { chatWithAi, type AiChatRequest, type AiChatResponse, type SuggestedAction } from '../api/ai';
import { ApiError } from '../api';
import { useAiChat } from '../hooks/useAiChat';

type Message = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  suggestedActions?: SuggestedAction[];
  quickReplies?: string[];
};

const AiChatPage = () => {
  const navigate = useNavigate();
  const { 
    getUserContext, 
    getRecommendedQuestions, 
    isAuthenticated, 
    userInfo,
    generateSecureSessionId 
  } = useAiChat();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  
  const quickQuestions = getRecommendedQuestions;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初始化安全会话ID
  useEffect(() => {
    if (isAuthenticated && !sessionId) {
      const newSessionId = generateSecureSessionId();
      setSessionId(newSessionId);
      console.log('🔐 初始化用户会话:', {
        userId: userInfo?.id,
        sessionPrefix: newSessionId.substr(0, 15) + '...'
      });
    }
  }, [isAuthenticated, sessionId, generateSecureSessionId, userInfo]);

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

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // 检查用户登录状态
    if (!isAuthenticated) {
      setError('请先登录以使用AI聊天功能');
      return;
    }

    // 清除之前的错误
    setError(null);

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // 确保有会话ID
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        currentSessionId = generateSecureSessionId();
        setSessionId(currentSessionId);
      }

      // 准备AI聊天请求
      const userContext = getUserContext();
      const chatRequest: AiChatRequest = {
        message: text,
        context: {
          ...userContext,
          user_mood: userContext.user_mood || 'focused',
          available_time: userContext.available_time || 30
        },
        session_id: currentSessionId
      };

      console.log('📤 发送AI聊天请求:', {
        userId: userInfo?.id,
        messageLength: text.length,
        sessionId: currentSessionId.substr(0, 15) + '...',
        hasContext: Object.keys(userContext).length > 0
      });

      // 调用AI聊天API
      const aiResponse: AiChatResponse = await chatWithAi(chatRequest);

      console.log('📥 收到AI回复:', {
        replyLength: aiResponse.reply.length,
        hasSuggestedActions: aiResponse.suggested_actions && aiResponse.suggested_actions.length > 0,
        hasQuickReplies: aiResponse.quick_replies && aiResponse.quick_replies.length > 0,
        sessionId: aiResponse.session_id.substr(0, 15) + '...'
      });

      // 更新会话ID
      if (aiResponse.session_id !== currentSessionId) {
        setSessionId(aiResponse.session_id);
        console.log('🔄 会话ID已更新');
      }

      // 添加AI回复消息
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.reply,
        isUser: false,
        timestamp: new Date(),
        suggestedActions: aiResponse.suggested_actions,
        quickReplies: aiResponse.quick_replies
      };
      
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('❌ AI聊天失败:', error);
      
      let errorMessage = '抱歉，我暂时无法回复您的消息。';
      
      if (error instanceof ApiError) {
        if (error.statusCode === 401) {
          errorMessage = '登录已过期，请重新登录后再试。';
          // 可以考虑自动跳转到登录页
          // navigate('/login');
        } else {
          errorMessage = error.message || errorMessage;
        }
      }

      setError(errorMessage);

      // 添加错误回复消息
      const errorBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: errorMessage,
        isUser: false,
        timestamp: new Date(),
        quickReplies: ['重新尝试', '查看任务']
      };
      
      setMessages(prev => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    await sendMessage(inputText);
  };

  const handleKeyPress = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await handleSendMessage();
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    await sendMessage(suggestion);
  };

  const handleActionClick = async (action: SuggestedAction) => {
    // 根据不同的建议操作类型执行相应的操作
    switch (action.type) {
      case 'task_breakdown':
        await sendMessage(`请帮我拆解这个任务：${action.label}`);
        break;
      case 'create_task':
        await sendMessage(`我想创建一个新任务：${action.label}`);
        break;
      case 'view_tasks':
        await sendMessage('看看我的任务列表');
        break;
      case 'start_focus':
        await sendMessage('开始专注模式');
        break;
      default:
        await sendMessage(action.label);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-ocean-50">
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-100">
        <button onClick={handleGoBack} className="flex items-center">
          <ChevronLeft size={24} />
          <span className="ml-1 text-lg">返回</span>
        </button>
        <div className="flex items-center space-x-2">
          {/* 显示用户信息（仅在登录时） */}
          {isAuthenticated && userInfo && (
            <span className="text-sm text-gray-600">
              {userInfo.username}
            </span>
          )}
          <button className="p-2">
            <Menu size={24} />
          </button>
          <button className="p-2">
            <Edit size={24} />
          </button>
        </div>
      </div>

      {/* 聊天主体 */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* 默认欢迎消息 */}
        {messages.length === 0 && (
          <div className="py-6">
            <h1 className="text-2xl font-bold mb-2">
              {isAuthenticated ? `嗨${userInfo?.username ? ', ' + userInfo.username : ''}！想聊点什么？😇` : '请先登录使用AI聊天功能'}
            </h1>
            {isAuthenticated && (
              <p className="text-gray-600 text-sm">
                🔒 您的对话完全私密，其他用户无法访问
              </p>
            )}
          </div>
        )}

        {/* 消息列表 */}
        <div className="space-y-4">
          {messages.map(message => (
            <div key={message.id} className="space-y-2">
              <div
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

              {/* 建议操作按钮 */}
              {message.suggestedActions && message.suggestedActions.length > 0 && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] space-y-2">
                    {message.suggestedActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleActionClick(action)}
                        disabled={isLoading}
                        className="block w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm transition-colors disabled:opacity-50"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 快速回复 */}
              {message.quickReplies && message.quickReplies.length > 0 && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] flex flex-wrap gap-2">
                    {message.quickReplies.map((reply, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(reply)}
                        disabled={isLoading}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors disabled:opacity-50"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* 加载指示器 */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 rounded-lg rounded-tl-none shadow-sm p-3 flex items-center space-x-2">
                <Loader className="animate-spin" size={16} />
                <span>正在思考中...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 建议提示 - 只在初始状态显示且用户已登录 */}
      {messages.length === 0 && isAuthenticated && (
        <div className="px-4 py-2">
          <div className="flex flex-col items-end space-y-2">
            {quickQuestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => !isLoading && handleSuggestionClick(suggestion)}
                className={`inline-block bg-white p-3 rounded-lg text-right shadow-sm cursor-pointer hover:bg-gray-50 transition-opacity ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 错误信息显示 */}
      {error && (
        <div className="px-4 py-2">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2 text-red-700">
            <AlertCircle size={20} />
            <span className="text-sm">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 底部输入框 */}
      <div className="p-4 bg-gray-100 border-t border-gray-200">
        <div className="flex items-center bg-white rounded-full shadow-sm">
          <button 
            className="p-3 text-gray-500"
            disabled={isLoading || !isAuthenticated}
          >
            <Plus size={24} />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              !isAuthenticated 
                ? "请先登录使用AI聊天"
                : isLoading 
                  ? "AI正在回复中..." 
                  : "和MinCo聊聊吧"
            }
            disabled={isLoading || !isAuthenticated}
            className="flex-1 px-3 py-3 bg-transparent focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading || !isAuthenticated}
            className={`p-3 rounded-full transition-colors ${
              inputText.trim() && !isLoading && isAuthenticated
                ? 'text-blue-500 hover:text-blue-600' 
                : 'text-gray-400'
            }`}
          >
            {isLoading ? <Loader className="animate-spin" size={24} /> : <Send size={24} />}
          </button>
        </div>
        
        {/* 用户登录状态提示 */}
        {!isAuthenticated ? (
          <div className="mt-2 text-center text-sm text-red-500">
            请先登录以获得完整的AI体验和数据隔离保护
          </div>
        ) : (
          <div className="mt-2 text-center text-sm text-gray-500">
            🔒 您的对话数据受到完全保护，仅您可见
          </div>
        )}
      </div>
    </div>
  );
};

export default AiChatPage; 