import { Task } from '../types';
import { useAppContext } from '../context/AppContext';
import { Clock, Check } from 'lucide-react';

interface TaskItemProps {
  task: Task;
}

const TaskItem = ({ task }: TaskItemProps) => {
  const { dispatch } = useAppContext();

  const handleComplete = () => {
    dispatch({ type: 'COMPLETE_TASK', payload: task.id });
  };

  return (
    <div className="p-[var(--spacing-card)] rounded-[var(--radius-medium)] shadow-[var(--shadow-sm)] bg-card">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="text-sm text-gray-500 mb-1">
            {task.isAnytime ? (
              '随时'
            ) : (
              <>
                {task.startTime} {task.endTime ? `– ${task.endTime}` : ''}
              </>
            )}
          </div>
          <h3 className="font-medium text-gray-800">{task.title}</h3>
        </div>

        <div className="flex items-center self-center">
          <div className="flex items-center text-xs text-gray-500 mr-3">
            <Clock size={14} className="mr-1" />
            <span>{task.isAnytime ? '暂定' : (task.duration || '')}</span>
          </div>
          
          <button 
            onClick={handleComplete}
            className={`w-5 h-5 rounded-full border ${
              task.completed 
                ? 'bg-primary border-primary' 
                : 'border-gray-300'
            } flex items-center justify-center`}
          >
            {task.completed && <Check size={12} className="text-white" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem; 