import { useState, useEffect } from 'react';
import { ArrowLeft, Pause, Play, SkipForward } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const SailingPage = () => {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(25 * 60); // 25分钟倒计时
  
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
  
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };
  
  const resetTimer = () => {
    setIsRunning(false);
    setTime(25 * 60);
  };
  
  return (
    <div className="h-screen bg-gradient-to-b from-ocean-50 to-ocean-100 flex flex-col">
      {/* 顶部导航 */}
      <div className="p-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600"
        >
          <ArrowLeft size={20} className="mr-1" />
          <span>返回</span>
        </button>
      </div>
      
      {/* 主要内容 */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* 任务标题 */}
          <h1 className="text-xl font-bold text-center mb-8">收集PPT相关数据资料</h1>
          
          {/* 计时器 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="text-5xl font-bold text-center mb-8">
              {formatTime(time)}
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={toggleTimer}
                className="w-14 h-14 bg-ocean-600 rounded-full flex items-center justify-center text-white shadow-md"
              >
                {isRunning ? <Pause size={24} /> : <Play size={24} />}
              </button>
              
              <button
                onClick={resetTimer}
                className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 shadow-md"
              >
                <SkipForward size={24} />
              </button>
            </div>
          </div>
          
          {/* 航行动画 */}
          <div className="relative h-32 bg-ocean-200 rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-ocean-300 to-ocean-200 opacity-50"></div>
            
            <motion.div
              className="absolute bottom-2 left-4"
              animate={{
                x: isRunning ? [0, 20, 0] : 0,
                y: isRunning ? [0, -5, 0] : 0,
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: "easeInOut",
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 12C2 12 5.5 7 12 7C18.5 7 22 12 22 12" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12C2 12 5.5 17 12 17C18.5 17 22 12 22 12" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 7V17" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 12H17" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SailingPage; 