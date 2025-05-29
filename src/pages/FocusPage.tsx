import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Play, Pause, Square, Check } from 'lucide-react';

const FocusPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  
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

  const handleComplete = () => {
    if (task) {
      dispatch({ type: 'COMPLETE_TASK', payload: task.id });
      navigate('/home');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!task) {
    return (
      <div className="page-content safe-area-top flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">任务不存在</h2>
          <button
            onClick={() => navigate('/home')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg touch-target"
          >
            返回首页
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
            className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm touch-target no-tap-highlight"
          >
            完成
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* 任务信息 */}
        <div className="p-6 bg-white rounded-lg shadow-sm mb-6">
          <div className="text-center">
            <div className="text-4xl mb-3">{task.icon || '📌'}</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{task.title}</h2>
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

        {/* 子任务 */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900">子任务</h3>
            </div>
            <div className="p-4 space-y-3">
              {task.subtasks.map(subtask => (
                <div key={subtask.id} className="flex items-center">
                  <button
                    onClick={() => {
                      // 这里可以添加切换子任务完成状态的逻辑
                    }}
                    className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center touch-target no-tap-highlight ${
                      subtask.completed 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-gray-300'
                    }`}
                  >
                    {subtask.completed && <Check size={12} />}
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