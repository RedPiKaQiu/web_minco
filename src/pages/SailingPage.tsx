import { useState, useEffect } from 'react';
import { Pause, Play, Music, ChevronDown, ChevronUp, Clock, Book } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Task } from '../types';

interface LocationState {
  task?: Task;
}

const SailingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { task } = (location.state as LocationState) || {};
  
  const [isSailing, setIsSailing] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(5); // 默认5秒倒计时，将在开始时更新
  const [showDetails, setShowDetails] = useState(false); // 控制任务详情显示
  const [isCompleted, setIsCompleted] = useState(false); // 控制是否显示完成状态
  const [elapsedTimeText, setElapsedTimeText] = useState(''); // 记录航行用时
  
  // 提取任务信息，若无则使用默认值
  const taskTitle = task?.title || '收集PPT相关数据资料';
  const taskCategory = task?.category || '完成PPT制作';
  const taskDuration = task?.duration || '10分钟';
  
  // 解析任务持续时间（如"10分钟"、"1小时30分"）转换为秒数
  const parseTimeToSeconds = (timeStr: string): number => {
    // 默认为10分钟（600秒）
    if (!timeStr) return 600;
    
    let totalSeconds = 0;
    
    // 匹配小时
    const hourMatch = timeStr.match(/(\d+)\s*小时/);
    if (hourMatch) {
      totalSeconds += parseInt(hourMatch[1]) * 3600;
    }
    
    // 匹配分钟
    const minuteMatch = timeStr.match(/(\d+)\s*分钟/);
    if (minuteMatch) {
      totalSeconds += parseInt(minuteMatch[1]) * 60;
    }
    
    // 如果没有匹配到任何时间单位，默认为10分钟
    if (totalSeconds === 0) return 600;
    
    return totalSeconds;
  };
  
  // 通知App.tsx隐藏或显示底部导航栏
  useEffect(() => {
    if (isRunning) {
      document.body.classList.add('hide-navigation');
    } else {
      document.body.classList.remove('hide-navigation');
    }
    
    return () => {
      document.body.classList.remove('hide-navigation');
    };
  }, [isRunning]);
  
  // 记录初始任务时间，用于计算总用时
  const [initialTime, setInitialTime] = useState(0);
  
  useEffect(() => {
    let interval: number | undefined;
    
    if (isRunning && time > 0) {
      interval = window.setInterval(() => {
        setTime(prevTime => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      setIsRunning(false);
      setIsCompleted(true);
      
      // 计算用时
      const totalTimeSpent = initialTime;
      const minutes = Math.floor(totalTimeSpent / 60);
      const seconds = totalTimeSpent % 60;
      setElapsedTimeText(`${minutes}分${seconds < 10 ? '0' : ''}${seconds}`);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, time, initialTime]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const startSailing = () => {
    // 设置倒计时时间为任务持续时间
    const durationInSeconds = parseTimeToSeconds(taskDuration);
    setTime(durationInSeconds);
    setInitialTime(durationInSeconds);
    setIsSailing(true);
    setIsRunning(true);
  };
  
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };
  
  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };
  
  const handleChatWithMinCo = () => {
    navigate('/ai-chat');
  };
  
  const handleViewNextTask = () => {
    navigate('/home');
  };
  
  // 完成页面 - 显示完成状态和按钮
  if (isCompleted) {
    return (
      <div className="h-screen bg-white flex flex-col items-center px-6 pt-10">
        {/* 图章和完成标记 */}
        <div className="relative mb-6 mt-4">
          <img 
            src="/completed-stamp.png" 
            alt="Completed" 
            className="w-64 h-auto"
            onError={(e) => {
              // 如果图片加载失败，使用自定义SVG作为后备
              e.currentTarget.style.display = 'none';
              document.getElementById('fallback-stamp')?.classList.remove('hidden');
            }}
          />
          <div id="fallback-stamp" className="hidden">
            <svg viewBox="0 0 200 200" className="w-64 h-64">
              <g transform="translate(100 100)">
                <circle r="70" fill="#E2F1FA" />
                <circle r="60" fill="#FFFFFF" stroke="#5EB0DE" strokeWidth="5" />
                <path d="M-40,-5 L-15,20 L40,-30" stroke="#5EB0DE" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M-50,0 A50,50 0 1,1 50,0 A50,50 0 1,1 -50,0" fill="none" stroke="#5EB0DE" strokeWidth="2" strokeDasharray="2 2" />
                <g transform="translate(-45 -60)">
                  <rect width="90" height="25" rx="5" fill="#5EB0DE" />
                  <text x="45" y="17" textAnchor="middle" fill="white" fontWeight="bold" fontSize="14">Completed</text>
                </g>
              </g>
            </svg>
          </div>
        </div>
        
        {/* 任务标题 */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          {taskTitle}
        </h1>
        
        {/* 任务信息 */}
        <div className="flex items-center space-x-3 mb-1 text-gray-500">
          <span className="text-sm">主任务</span>
          <div className="bg-blue-50 px-3 py-1 rounded-full text-xs">
            {taskCategory}
          </div>
        </div>
        
        <div className="flex items-center mb-12 text-gray-500">
          <Clock size={14} className="mr-1" />
          <span className="text-sm">航行用时{elapsedTimeText}</span>
        </div>
        
        {/* 鼓励文本 */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">太棒了！一个好的开始</h2>
          <p className="text-gray-500 text-sm mb-8">给自己一个小奖励，休息片刻，继续加油哦～</p>
        </div>
        
        {/* 聊天按钮 */}
        <button 
          onClick={handleChatWithMinCo} 
          className="text-blue-500 text-lg mb-6"
        >
          和MinCo聊聊
        </button>
        
        {/* 查看下一个任务按钮 */}
        <button
          onClick={handleViewNextTask}
          className="flex items-center text-gray-600 mt-4"
        >
          <Book size={18} className="mr-2" />
          <span>查看下个子任务</span>
        </button>
      </div>
    );
  }
  
  if (!isSailing) {
    // 初始页面 - 显示开始航行按钮
    return (
      <div className="h-screen bg-white flex flex-col px-4 pt-10">
        {/* 任务标题 */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">{taskTitle}</h1>
        
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center text-gray-500">
            <Clock size={14} className="mr-1" />
            <span>预计{taskDuration}</span>
          </div>
        </div>
        
        {/* 开始按钮 */}
        <div className="mt-4 px-4">
          <button
            onClick={startSailing}
            className="w-full bg-gradient-to-r from-sky-300 to-sky-400 text-white py-4 rounded-full font-medium text-lg flex items-center justify-center shadow-md"
          >
            <span className="mr-2">🚢</span> 开始航行
          </button>
        </div>
        
        {/* 任务详情按钮 */}
        <div className="mt-4 flex justify-center">
          <button 
            onClick={toggleDetails}
            className="flex items-center text-gray-500"
          >
            <span>任务详情</span>
            {showDetails ? 
              <ChevronUp size={16} className="ml-1" /> : 
              <ChevronDown size={16} className="ml-1" />
            }
          </button>
        </div>
        
        {/* 任务详情内容 */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 overflow-hidden"
            >
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="mb-6">
                  <h3 className="font-medium text-lg mb-2">{taskCategory}</h3>
                  <p className="text-sm text-gray-600">
                    围绕当前设计行业的最新趋势展开分析，涵盖用户体验、视觉设计和交互设计三个方面
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm text-gray-500 mb-3">子任务</h4>
                  <ul className="space-y-4">
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-ocean-100 rounded-full flex items-center justify-center mr-3">
                        <div className="w-3 h-3 bg-ocean-400 rounded-full"></div>
                      </div>
                      <span className="text-ocean-500 font-medium">收集PPT相关数据资料</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 border border-gray-300 rounded-full mr-3"></div>
                      <span className="text-gray-700">整理数据分析结果</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 border border-gray-300 rounded-full mr-3"></div>
                      <span className="text-gray-700">撰写报告初稿</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 border border-gray-300 rounded-full mr-3"></div>
                      <span className="text-gray-700">PPT格式和外观设计</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* 船的图示 */}
        <div className="flex-grow flex items-end justify-center">
          <div className="w-full">
            <div className="relative h-56">
              {/* 太阳 */}
              <div className="absolute right-8 top-1/4">
                <div className="w-16 h-16 bg-yellow-300 rounded-full"></div>
                <div className="absolute inset-0 bg-yellow-200 rounded-full blur-md opacity-50"></div>
              </div>
              
              {/* 船 */}
              <div className="absolute left-4 bottom-12 w-3/4">
                <div className="bg-blue-800 h-20 rounded-br-3xl rounded-bl-sm"></div>
                <div className="absolute top-0 left-8 bg-blue-700 h-12 w-20 rounded-t-lg"></div>
                <div className="absolute top-4 left-12 bg-blue-300 h-4 w-4 rounded-sm"></div>
                <div className="absolute top-4 left-20 bg-blue-300 h-4 w-4 rounded-sm"></div>
              </div>
              
              {/* 波浪 */}
              <div className="absolute bottom-0 w-full">
                <svg viewBox="0 0 1440 120" className="w-full">
                  <path fill="#38bdf8" fillOpacity="0.7" d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,53.3C672,43,768,21,864,26.7C960,32,1056,64,1152,69.3C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
                  <path fill="#7dd3fc" fillOpacity="0.5" d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,58.7C672,64,768,96,864,96C960,96,1056,64,1152,53.3C1248,43,1344,53,1392,58.7L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
                  <path fill="#bae6fd" fillOpacity="0.3" d="M0,96L48,90.7C96,85,192,75,288,69.3C384,64,480,64,576,69.3C672,75,768,85,864,85.3C960,85,1056,75,1152,69.3C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // 航行中的页面 - 显示计时器（按照sail_2图片）
  return (
    <div className="h-screen bg-white flex flex-col items-center">
      {/* 音乐图标 */}
      <div className="absolute top-8 left-8 p-3 bg-gray-100 rounded-full">
        <Music size={20} className="text-gray-600" />
      </div>
      
      {/* 任务标题 */}
      <h1 className="text-3xl font-bold text-center text-gray-800 mt-16 mb-12">{taskTitle}</h1>
      
      {/* 计时器 */}
      <div className="text-7xl font-bold mb-24 text-gray-800">
        {formatTime(time)}
      </div>
      
      {/* 波浪和船动画 */}
      <div className="w-full mt-auto">
        <div className="relative h-72">
          {/* 太阳 */}
          <div className="absolute right-8 top-0">
            <div className="w-20 h-20 bg-yellow-300 rounded-full"></div>
            <div className="absolute inset-0 bg-yellow-200 rounded-full blur-sm opacity-50"></div>
          </div>
          
          {/* 船 */}
          <motion.div 
            className="absolute left-16 top-24 w-1/2"
            animate={{
              y: isRunning ? [0, -8, 0] : 0,
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut",
            }}
          >
            <div className="bg-blue-800 h-20 rounded-br-3xl rounded-bl-sm"></div>
            <div className="absolute top-0 left-8 bg-blue-700 h-12 w-20 rounded-t-lg"></div>
            <div className="absolute top-4 left-12 bg-blue-300 h-4 w-4 rounded-sm"></div>
            <div className="absolute top-4 left-20 bg-blue-300 h-4 w-4 rounded-sm"></div>
          </motion.div>
          
          {/* 波浪 - 更加明显的波浪动画 */}
          <div className="absolute bottom-0 w-full">
            <motion.div 
              animate={{
                y: isRunning ? [0, -5, 0] : 0,
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
              }}
            >
              <svg viewBox="0 0 1440 320" className="w-full">
                <path fill="#38bdf8" fillOpacity="0.7" d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,197.3C672,224,768,224,864,202.7C960,181,1056,139,1152,128C1248,117,1344,139,1392,149.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
              </svg>
            </motion.div>
            <motion.div 
              animate={{
                y: isRunning ? [0, -8, 0] : 0,
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: "easeInOut",
                delay: 0.2,
              }}
            >
              <svg viewBox="0 0 1440 320" className="w-full -mt-20">
                <path fill="#7dd3fc" fillOpacity="0.5" d="M0,224L48,224C96,224,192,224,288,213.3C384,203,480,181,576,154.7C672,128,768,96,864,85.3C960,75,1056,85,1152,85.3C1248,85,1344,75,1392,69.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
              </svg>
            </motion.div>
            <motion.div 
              animate={{
                y: isRunning ? [0, -6, 0] : 0,
              }}
              transition={{
                repeat: Infinity,
                duration: 2.5,
                ease: "easeInOut",
                delay: 0.4,
              }}
            >
              <svg viewBox="0 0 1440 320" className="w-full -mt-24">
                <path fill="#bae6fd" fillOpacity="0.3" d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,224C672,235,768,245,864,234.7C960,224,1056,192,1152,170.7C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
              </svg>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* 暂停/继续按钮 - 固定在底部 */}
      <div className="fixed bottom-8 w-full flex justify-center">
        <button
          onClick={toggleTimer}
          className="bg-white rounded-full p-5 shadow-xl"
        >
          {isRunning ? 
            <Pause size={32} className="text-gray-800" /> : 
            <Play size={32} className="text-gray-800 ml-1" />
          }
        </button>
      </div>
    </div>
  );
};

export default SailingPage; 