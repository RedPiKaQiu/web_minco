import { Task } from '../types';
import { useAppContext } from '../context/AppContext';
import { Check } from 'lucide-react';

interface CompletedTaskItemProps {
  task: Task;
}

const CompletedTaskItem = ({ task }: CompletedTaskItemProps) => {
  const { dispatch } = useAppContext();

  const handleComplete = () => {
    dispatch({ type: 'COMPLETE_TASK', payload: task.id });
  };

  return (
    <div className="flex items-center justify-between px-3 py-2.5">
      <div className="flex-1">
        <h3 className="text-gray-400 line-through text-sm">{task.title}</h3>
      </div>
      <button 
        onClick={handleComplete}
        className="w-5 h-5 rounded-full bg-gray-200 border-gray-200 flex items-center justify-center"
      >
        <Check size={12} className="text-white" />
      </button>
    </div>
  );
};

export default CompletedTaskItem; 