import { Anchor, Clock, Book } from 'lucide-react';
import SailingButton from './SailingButton';
import { Task } from '../types';
import { useNavigate } from 'react-router-dom';

interface QuickActionAreaProps {
  task: Task;
  isNightReview?: boolean;
}

const QuickActionArea = ({ task, isNightReview = false }: QuickActionAreaProps) => {
  const navigate = useNavigate();
  
  const handleReviewStart = () => {
    navigate('/review');
  };
  
  // 回顾模式
  if (isNightReview) {
    return (
      <div className="
        bg-gradient-to-br 
        from-[#1e3a8a] 
        to-[#1e40af] 
        rounded-[var(--radius-large)]
        p-[var(--spacing-card)]
        shadow-[var(--shadow-md)]
        text-white
      ">
        <h3 className="text-xl font-bold mb-2">快速回顾今日航行日志</h3>
        <p className="text-sm mb-6">今天辛苦啦，我们一起来回顾一下吧～</p>
        
        <div className="flex justify-center">
          <button
            onClick={handleReviewStart}
            className="flex items-center justify-center bg-white/20 rounded-full py-3 px-8 text-white"
          >
            <Book className="mr-2" size={18} />
            <span>开始回顾</span>
          </button>
        </div>
      </div>
    );
  }
  
  // 默认模式
  return (
    <div className="
      bg-gradient-to-br 
      from-[var(--color-quick-action-gradient-from)] 
      to-[var(--color-quick-action-gradient-to)] 
      rounded-[var(--radius-large)]
      p-[var(--spacing-card)]
      shadow-[var(--shadow-md)]
    ">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <Anchor className="text-[var(--color-quick-action-icon)] mr-2" size={18} />
          <span className="text-sm font-medium text-[var(--color-quick-action-text)]">{task.title}</span>
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <Clock size={14} className="mr-1" />
          <span>{task.duration || '10分钟'}</span>
        </div>
      </div>
      
      <div className="flex justify-between">
        <div className="flex items-center">
          <span className="text-xs text-gray-500">
            {task.startTime && task.endTime 
              ? `${task.startTime} - ${task.endTime}`
              : (task.isAnytime ? '随时' : '')}
          </span>
        </div>
        <SailingButton text="启航" task={task} />
      </div>
    </div>
  );
};

export default QuickActionArea; 