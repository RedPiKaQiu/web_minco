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
    <div className="task-item">
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{task.title}</h3>
        {(task.startTime || task.endTime) && (
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Clock size={14} className="mr-1" />
            <span>
              {task.startTime} {task.endTime ? `- ${task.endTime}` : ''}
            </span>
            {task.duration && <span className="ml-2">({task.duration})</span>}
          </div>
        )}
      </div>
      <button 
        onClick={handleComplete}
        className={`w-6 h-6 rounded-full border ${
          task.completed 
            ? 'bg-ocean-500 border-ocean-500' 
            : 'border-gray-300'
        } flex items-center justify-center`}
      >
        {task.completed && <Check size={14} className="text-white" />}
      </button>
    </div>
  );
};

export default TaskItem; 