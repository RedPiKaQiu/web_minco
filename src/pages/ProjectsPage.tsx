import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Check, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { TaskCategory, TASK_CATEGORIES } from '../types';

const ProjectsPage = () => {
  const { state, dispatch } = useAppContext();
  const [activeCategory, setActiveCategory] = useState<TaskCategory>(TaskCategory.LIFE);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    projects: true,
    tasks: true,
  });

  // 使用统一的分类配置
  const categories = TASK_CATEGORIES.map(category => ({
    id: category.label,
    label: category.label,
    emoji: category.emoji
  }));

  // 根据分类筛选事项
  const categoryTasks = state.tasks.filter(task => {
    if (!task.category) return false;
    return task.category === activeCategory;
  });

  const completedTasks = categoryTasks.filter(task => task.completed);
  const incompleteTasks = categoryTasks.filter(task => !task.completed);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'COMPLETE_TASK', payload: id });
  };

  return (
    <div className="page-content safe-area-top bg-gray-50">

      {/* Tab 标签栏 */}
      <div className="px-4 mb-6 pt-4">
        <div className="bg-white rounded-lg p-1 shadow-sm">
          <div className="grid grid-cols-6 gap-0">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.label as TaskCategory)}
                className={`py-3 px-1 text-xs rounded-md transition-colors ${
                  activeCategory === category.label
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span className="text-lg mb-1">{category.emoji}</span>
                  <span>{category.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* 项目部分 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleSection('projects')}
              className="flex items-center text-left"
            >
              <span className="text-sm font-medium text-gray-600">项目 (0)</span>
              <div className="ml-2">
                {expandedSections.projects ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </button>
            <button className="h-7 w-7 rounded-full hover:bg-gray-100 flex items-center justify-center">
              <Plus className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {expandedSections.projects && (
            <div className="bg-white rounded-lg border border-dashed border-gray-300 p-6 text-center">
              <p className="text-gray-500 mb-2">暂无{activeCategory}项目</p>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                <Plus className="h-4 w-4 mr-1" />
                创建第一个项目
              </button>
            </div>
          )}
        </div>

        {/* 事项部分 */}
        {incompleteTasks.length > 0 && (
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('tasks')}
              className="flex items-center w-full justify-start"
            >
              <span className="text-sm font-medium text-gray-600">事项 ({incompleteTasks.length})</span>
              <div className="ml-2">
                {expandedSections.tasks ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </button>

            {expandedSections.tasks && (
              <div className="space-y-2">
                {incompleteTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <span className="text-lg mr-2">{task.icon || "📌"}</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{task.title}</h4>
                          {task.startTime && (
                            <p className="text-xs text-gray-500 mt-1">{task.startTime}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {task.duration && (
                          <span className="px-2 py-1 bg-white border border-gray-200 rounded text-xs">
                            {task.duration}
                          </span>
                        )}
                        <button
                          onClick={(e) => handleComplete(task.id, e)}
                          className="h-6 w-6 rounded-full border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center"
                        >
                          {task.completed && <Check className="h-3 w-3 text-green-500" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 已完成事项部分 */}
        {completedTasks.length > 0 && (
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('completed')}
              className="flex items-center w-full justify-start"
            >
              <span className="text-sm font-medium text-gray-600">已完成 ({completedTasks.length})</span>
              <div className="ml-2">
                {expandedSections.completed ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </button>

            {expandedSections.completed && (
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-gray-50 rounded-lg p-3 opacity-60"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <span className="text-lg mr-2">{task.icon || "📌"}</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm line-through">{task.title}</h4>
                          {task.startTime && (
                            <p className="text-xs text-gray-500 mt-1">{task.startTime}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleComplete(task.id, e)}
                        className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center"
                      >
                        <Check className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 空状态 */}
        {incompleteTasks.length === 0 && completedTasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📋</div>
            <p>暂无{activeCategory}相关的项目或事项</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage; 