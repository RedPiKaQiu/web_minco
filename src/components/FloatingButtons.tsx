import { Plus, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FloatingButtons = () => {
  const navigate = useNavigate();

  const handleAddTaskNavigation = () => {
    navigate('/new-task');
  };

  const handleChat = () => {
    navigate('/ai-chat');
  };

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col space-y-3">
      {/* AI聊天按钮 */}
      <button
        onClick={handleChat}
        className="floating-button bg-purple-500 text-white w-12 h-12 rounded-full shadow-lg hover:bg-purple-600 transition-colors flex items-center justify-center"
      >
        <MessageCircle size={24} />
      </button>
      
      {/* 添加事项按钮 */}
      <button
        onClick={handleAddTaskNavigation}
        className="floating-button bg-primary text-white w-12 h-12 rounded-full shadow-lg hover:bg-primary-dark transition-colors flex items-center justify-center"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default FloatingButtons; 