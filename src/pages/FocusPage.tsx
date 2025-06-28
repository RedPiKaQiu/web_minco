/**
 * 专注模式页面，提供专注执行单个任务的计时和管理功能
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useTaskCompletion } from '../hooks/useItemCompletion';
import { ArrowLeft, Play, Pause, Square } from 'lucide-react';

const FocusPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { state } = useAppContext();
  const { toggleTaskCompletion } = useTaskCompletion();
  
  const [isRunning, setIsRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0); // 秒数

  const task = state.tasks.find(t => t.id === taskId);

  useEffect(() => {
    let interval: number;
    
    if (isRunning) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setTimeElapsed(0);
  };

  const handleComplete = async (e: React.MouseEvent) => {
    if (!task) return;
    
    e.stopPropagation();

    // 如果任务未完成，显示烟花特效
    if (!task.completed) {
      // 烟花特效
      const button = e.currentTarget as HTMLElement;
      for (let i = 0; i < 25; i++) {
        const particle = document.createElement('div');
        const colors = ['#FF5252', '#FFD740', '#64FFDA', '#448AFF', '#E040FB'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        particle.className = 'absolute rounded-full';
        particle.style.backgroundColor = color;
        particle.style.width = `${2 + Math.random() * 3}px`;
        particle.style.height = `${2 + Math.random() * 3}px`;
        button.appendChild(particle);

        const angle = Math.random() * Math.PI * 2;
        const distance = 30 + Math.random() * 50;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        particle.animate([
          { transform: 'translate(0, 0) scale(1)', opacity: 1 },
          { transform: `translate(${x}px, ${y}px) scale(0)`, opacity: 0 }
        ], {
          duration: 800 + Math.random() * 700,
          easing: 'cubic-bezier(0, .9, .57, 1)'
        });

        setTimeout(() => particle.remove(), 1500);
      }
    }

    try {
      // 使用标准的任务完成逻辑
      await toggleTaskCompletion(task.id, task.completed);
      
      // 任务完成后导航回首页
      navigate('/home');
    } catch (error) {
      console.error('❌ 专注页面：任务完成操作失败', error);
      // 即使失败也导航回首页，因为本地状态可能已更新
      navigate('/home');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!task) {
    return (
      <div className="page-content safe-area-top flex items-center justify-center">
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="text-6xl mb-4">😅</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">事项不存在</h2>
          <p className="text-gray-600 mb-6">该事项可能已被删除</p>
          <button
            onClick={() => navigate('/home')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            回到首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      {/* 头部 */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <button onClick={handleBack} className="p-2 touch-target no-tap-highlight">
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-lg font-medium">专注模式</h1>
          <button
            onClick={handleComplete}
            className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm touch-target no-tap-highlight hover:bg-green-600 transition-colors"
          >
            完成
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* 事项信息 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">{task.icon || "📌"}</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">{task.title}</h2>
            {task.duration && (
              <p className="text-gray-600">预计用时：{task.duration}</p>
            )}
          </div>
        </div>

        {/* 计时器 */}
        <div className="p-8 bg-white rounded-lg shadow-sm mb-6">
          <div className="text-center">
            <div className="text-6xl font-mono font-bold text-gray-900 mb-8">
              {formatTime(timeElapsed)}
            </div>
            
            <div className="flex justify-center space-x-4">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors touch-target no-tap-highlight"
                >
                  <Play size={24} />
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="w-16 h-16 bg-yellow-500 text-white rounded-full flex items-center justify-center hover:bg-yellow-600 transition-colors touch-target no-tap-highlight"
                >
                  <Pause size={24} />
                </button>
              )}
              
              <button
                onClick={handleStop}
                className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors touch-target no-tap-highlight"
              >
                <Square size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* 子事项 */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900">子事项</h3>
            <div className="mt-3 space-y-2">
              {task.subtasks.map((subtask, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <button 
                    onClick={() => {
                      // 这里可以添加切换子事项完成状态的逻辑
                    }}
                    className={`h-4 w-4 rounded border ${
                      subtask.completed ? "bg-green-100 border-green-500" : "border-gray-300"
                    } flex items-center justify-center`}
                  >
                    {subtask.completed && <div className="h-2 w-2 bg-green-500 rounded"></div>}
                  </button>
                  <span className={`flex-1 ${
                    subtask.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                  }`}>
                    {subtask.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 白噪音控制 */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">白噪音</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-3 bg-gray-100 rounded-lg text-center touch-target no-tap-highlight">
                🌧️ 雨声
              </button>
              <button className="p-3 bg-gray-100 rounded-lg text-center touch-target no-tap-highlight">
                🌊 海浪
              </button>
              <button className="p-3 bg-gray-100 rounded-lg text-center touch-target no-tap-highlight">
                🔥 篝火
              </button>
              <button className="p-3 bg-gray-100 rounded-lg text-center touch-target no-tap-highlight">
                🎵 轻音乐
              </button>
            </div>
          </div>
        </div>

        {/* 专注提示 */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800 text-center">
            保持专注，你正在做得很好！💪
          </p>
        </div>
      </div>
    </div>
  );
};

export default FocusPage; 