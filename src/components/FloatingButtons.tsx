/**
 * 浮动按钮组件，提供快速添加任务和AI对话的悬浮操作按钮
 */
import { Plus, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FloatingButtonsProps {
  onOpenItemDrawer: () => void;
}

const FloatingButtons = ({ onOpenItemDrawer: onOpenItemDrawer }: FloatingButtonsProps) => {
  const navigate = useNavigate();

  const handleAddTaskNavigation = () => {
    onOpenItemDrawer();
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