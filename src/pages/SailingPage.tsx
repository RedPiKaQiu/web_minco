import { useState, useEffect } from 'react';
import { Pause, Play, Music, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SailingPage = () => {
  const [isSailing, setIsSailing] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(5); // 5秒倒计时
  const [showDetails, setShowDetails] = useState(false); // 控制任务详情显示
  
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
  
  useEffect(() => {
    let interval: number | undefined;
    
    if (isRunning && time > 0) {
      interval = window.setInterval(() => {
        setTime(prevTime => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      setIsRunning(false);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, time]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const startSailing = () => {
    setIsSailing(true);
    setTime(5);
    setIsRunning(true);
  };
  
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };
  
  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };
  
  if (!isSailing) {
    // 初始页面 - 显示开始航行按钮
    return (
      <div className="h-screen bg-white flex flex-col px-4 pt-10">
        {/* 任务标题 */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">收集PPT相关数据资料</h1>
        
        <div className="flex items-center mt-2 mb-4 justify-center">
          <div className="text-gray-600 mr-2">主任务</div>
          <div className="bg-blue-50 px-3 py-1 rounded-full text-sm">完成PPT制作</div>
        </div>
        
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center text-gray-500">
            <Clock size={14} className="mr-1" />
            <span>预计15分钟</span>
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
                  <h3 className="font-medium text-lg mb-2">完成PPT制作</h3>
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
      <h1 className="text-3xl font-bold text-center text-gray-800 mt-16 mb-12">收集PPT相关数据资料</h1>
      
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