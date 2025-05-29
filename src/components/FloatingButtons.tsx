import { useState } from 'react';
import { Plus, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TaskAddDrawer from './TaskAddDrawer';

const FloatingButtons = () => {
  const navigate = useNavigate();
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);

  const handleAddTask = () => {
    setIsTaskDrawerOpen(true);
  };

  const handleAIChat = () => {
    navigate('/ai-chat');
  };

  return (
    <>
      <div className="floating-buttons">
        <div className="flex flex-col space-y-3">
          {/* AI聊天按钮 */}
          <button
            onClick={handleAIChat}
            className="w-14 h-14 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition-all duration-200 flex items-center justify-center touch-target no-tap-highlight"
          >
            <MessageCircle size={24} />
          </button>
          
          {/* 添加任务按钮 */}
          <button
            onClick={handleAddTask}
            className="w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all duration-200 flex items-center justify-center touch-target no-tap-highlight"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      <TaskAddDrawer 
        isOpen={isTaskDrawerOpen}
        onClose={() => setIsTaskDrawerOpen(false)}
      />
    </>
  );
};

export default FloatingButtons; 