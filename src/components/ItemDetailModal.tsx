/**
 * 任务详情弹窗组件，显示任务的详细信息和操作按钮
 */
import { X, Clock, Calendar, Tag, Target, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Task } from '../types';

interface ItemDetailModalProps {
  task: Task;
  onClose: () => void;
}

const ItemDetailModal = ({ task, onClose }: ItemDetailModalProps) => {
  const navigate = useNavigate();

  const handleStartFocus = () => {
    onClose();
    navigate(`/focus/${task.id}`);
  };

  const handleEdit = () => {
    onClose();
    navigate('/new-task', { state: { editTask: task } });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-end justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-t-lg w-full max-w-md max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        <div className="sticky top-0 bg-white border-b z-10">
          <div className="flex justify-end items-center p-4">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors touch-target no-tap-highlight"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Task Title and Icon */}
          <div className="flex items-start space-x-3">
            <div className="text-3xl">{task.icon || "📌"}</div>
            <div className="flex-grow">
              <h3 className="text-xl font-semibold">{task.title}</h3>
            </div>
          </div>

          {/* Task Details */}
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center space-x-3">
              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
              }`}>
                {task.completed && <div className="h-2 w-2 bg-white rounded-full"></div>}
              </div>
              <div>
                <div className="font-medium">状态</div>
                <div className="text-sm text-gray-600">
                  {task.completed ? '已完成' : '待完成'}
                </div>
              </div>
            </div>

            {/* Due Date */}
            {task.dueDate && (
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="font-medium">截止日期</div>
                  <div className="text-sm text-gray-600">{task.dueDate}</div>
                </div>
              </div>
            )}

            {/* Start Time */}
            {task.startTime && (
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="font-medium">开始时间</div>
                  <div className="text-sm text-gray-600">{task.startTime}</div>
                </div>
              </div>
            )}

            {/* Duration */}
            {task.duration && (
              <div className="flex items-center space-x-3">
                <Target className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="font-medium">预计用时</div>
                  <div className="text-sm text-gray-600">{task.duration}</div>
                </div>
              </div>
            )}

            {/* Category and Type */}
            <div className="flex items-center space-x-3">
              <Tag className="h-5 w-5 text-gray-400" />
              <div>
                <div className="font-medium">分类</div>
                <div className="flex items-center space-x-2 mt-1">
                  {task.category && (
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {task.category}
                    </span>
                  )}
                  {task.type && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      {task.type}
                    </span>
                  )}
                  {task.priority && (
                    <span className={`px-2 py-1 rounded text-xs ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {task.priority === 'high' ? '高优先级' :
                       task.priority === 'medium' ? '中优先级' : '低优先级'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Anytime flag */}
            {task.isAnytime && (
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="font-medium">时间安排</div>
                  <div className="text-sm text-gray-600">随时可做</div>
                </div>
              </div>
            )}
          </div>

          {/* Subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">子事项</h4>
              <div className="space-y-2">
                {task.subtasks.map((subtask, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div
                      className={`h-4 w-4 rounded border flex items-center justify-center ${
                        subtask.completed ? "bg-green-100 border-green-500" : "border-gray-300"
                      }`}
                    >
                      {subtask.completed && <div className="h-2 w-2 bg-green-500 rounded"></div>}
                    </div>
                    <span className={subtask.completed ? "line-through text-gray-500" : ""}>
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!task.completed && (
            <div className="flex space-x-3 pt-4 border-t">
              <button
                onClick={handleStartFocus}
                className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 touch-target no-tap-highlight"
              >
                <Play className="h-4 w-4" />
                <span>开始专注</span>
              </button>
              <button
                onClick={handleEdit}
                className="flex-1 border border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors touch-target no-tap-highlight"
              >
                编辑事项
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetailModal; 