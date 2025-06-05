import { useState, useEffect } from 'react';
import { X, Trash2, Plus, Check, Clock, Calendar } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Project } from '../types';

interface ProjectDetailModalProps {
  project: Project;
  onClose: () => void;
}

const ProjectDetailModal = ({ project, onClose }: ProjectDetailModalProps) => {
  const { state, dispatch } = useAppContext();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [tempTitle, setTempTitle] = useState(project.title);
  const [tempDescription, setTempDescription] = useState(project.description);
  const [tempNotes, setTempNotes] = useState(project.notes || '');

  // 获取项目相关的事项
  const projectTasks = (state.tasks || []).filter(task => task.project === project.title);
  const completedTasks = projectTasks.filter(task => task.completed);
  const incompleteTasks = projectTasks.filter(task => !task.completed);

  // 更新临时状态
  useEffect(() => {
    setTempTitle(project.title);
    setTempDescription(project.description);
    setTempNotes(project.notes || '');
  }, [project]);

  // 编辑处理函数
  const handleTitleSave = () => {
    if (tempTitle.trim() !== '') {
      dispatch({
        type: 'UPDATE_PROJECT',
        payload: {
          id: project.id,
          updates: { title: tempTitle.trim() }
        }
      });
    }
    setIsEditingTitle(false);
  };

  const handleDescriptionSave = () => {
    dispatch({
      type: 'UPDATE_PROJECT',
      payload: {
        id: project.id,
        updates: { description: tempDescription.trim() }
      }
    });
    setIsEditingDescription(false);
  };

  const handleNotesSave = () => {
    dispatch({
      type: 'UPDATE_PROJECT',
      payload: {
        id: project.id,
        updates: { notes: tempNotes.trim() }
      }
    });
    setIsEditingNotes(false);
  };

  const handleDeleteProject = () => {
    if (confirm('确定要删除这个项目吗？此操作无法撤销。')) {
      dispatch({
        type: 'DELETE_PROJECT',
        payload: project.id
      });
      onClose();
    }
  };

  const handleCompleteTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'COMPLETE_TASK', payload: taskId });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div 
          className="p-6 border-b border-gray-200"
          style={{ 
            borderLeft: `6px solid ${project.color || '#e5e7eb'}`,
            background: `linear-gradient(135deg, ${project.color}10, white)`
          }}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-start space-x-4 flex-1">
              <div className="text-3xl">{project.icon || '📁'}</div>
              <div className="flex-1">
                {isEditingTitle ? (
                  <input
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTitleSave();
                      if (e.key === 'Escape') {
                        setTempTitle(project.title);
                        setIsEditingTitle(false);
                      }
                    }}
                    className="text-2xl font-bold w-full border-b-2 border-blue-500 focus:outline-none bg-transparent"
                    autoFocus
                  />
                ) : (
                  <h1 
                    className="text-2xl font-bold cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    {project.title}
                  </h1>
                )}
                
                {isEditingDescription ? (
                  <textarea
                    value={tempDescription}
                    onChange={(e) => setTempDescription(e.target.value)}
                    onBlur={handleDescriptionSave}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleDescriptionSave();
                      }
                      if (e.key === 'Escape') {
                        setTempDescription(project.description);
                        setIsEditingDescription(false);
                      }
                    }}
                    className="text-gray-600 mt-2 w-full border-b border-blue-500 focus:outline-none bg-transparent resize-none"
                    rows={2}
                    autoFocus
                  />
                ) : (
                  <p 
                    className="text-gray-600 mt-2 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => setIsEditingDescription(true)}
                  >
                    {project.description || '点击添加项目描述...'}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDeleteProject}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="删除项目"
              >
                <Trash2 className="h-5 w-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* 项目信息 */}
          <div className="flex items-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                {project.category}
              </span>
            </div>
            
            <div className="text-sm text-gray-500">
              {projectTasks.length} 个事项
            </div>
            
            {project.dueDate && (
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                截止: {project.dueDate}
              </div>
            )}
          </div>

          {/* 进度条 */}
          {project.hasProgress && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">项目进度</span>
                <span className="font-medium">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${project.progress}%`,
                    backgroundColor: project.color || '#3b82f6'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 内容区域 */}
        <div className="overflow-y-auto max-h-[60vh]">
          {/* 事项列表 */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">项目事项</h3>
              <button className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                <Plus className="h-4 w-4 mr-1" />
                添加事项
              </button>
            </div>

            {/* 未完成事项 */}
            {incompleteTasks.length > 0 && (
              <div className="space-y-2 mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  待完成 ({incompleteTasks.length})
                </h4>
                {incompleteTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={(e) => handleCompleteTask(task.id, e)}
                        className="w-5 h-5 rounded-full border-2 border-gray-300 hover:border-green-500 transition-colors flex items-center justify-center"
                      >
                        {task.completed && <Check className="h-3 w-3 text-green-500" />}
                      </button>
                      <span className="text-lg">{task.icon || '📌'}</span>
                      <div>
                        <h5 className="font-medium">{task.title}</h5>
                        {task.duration && (
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {task.duration}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 已完成事项 */}
            {completedTasks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  已完成 ({completedTasks.length})
                </h4>
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg opacity-75"
                  >
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={(e) => handleCompleteTask(task.id, e)}
                        className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
                      >
                        <Check className="h-3 w-3 text-white" />
                      </button>
                      <span className="text-lg">{task.icon || '📌'}</span>
                      <div>
                        <h5 className="font-medium line-through text-gray-600">{task.title}</h5>
                        {task.duration && (
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {task.duration}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {projectTasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">还没有事项，开始添加吧</p>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  添加第一个事项
                </button>
              </div>
            )}
          </div>

          {/* 项目笔记 */}
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4">项目笔记</h3>
            {isEditingNotes ? (
              <textarea
                value={tempNotes}
                onChange={(e) => setTempNotes(e.target.value)}
                onBlur={handleNotesSave}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setTempNotes(project.notes || '');
                    setIsEditingNotes(false);
                  }
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
                placeholder="添加项目笔记..."
                autoFocus
              />
            ) : (
              <div
                onClick={() => setIsEditingNotes(true)}
                className="w-full p-3 min-h-[100px] border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors"
              >
                {tempNotes ? (
                  <div className="whitespace-pre-wrap text-gray-700">{tempNotes}</div>
                ) : (
                  <div className="text-gray-400">点击添加项目笔记...</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailModal; 