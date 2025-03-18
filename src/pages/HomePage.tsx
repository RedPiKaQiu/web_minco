import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import TaskItem from '../components/TaskItem';
import CompletedTasks from '../components/CompletedTasks';
import QuickAddTask from '../components/QuickAddTask';
import SailingButton from '../components/SailingButton';
import { Anchor, Clock } from 'lucide-react';

const HomePage = () => {
  const { state } = useAppContext();
  const [currentDate] = useState(new Date());
  
  const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  
  const formattedDate = `${months[currentDate.getMonth()]}${currentDate.getDate()}日，${days[currentDate.getDay()]}`;
  
  const activeTasks = state.tasks.filter(task => !task.completed);
  const anytimeTasks = activeTasks.filter(task => task.isAnytime);
  const scheduledTasks = activeTasks.filter(task => !task.isAnytime);

  return (
    <div className="pb-20">
      {/* 顶部状态栏 */}
      <div className="bg-ocean-50 p-4 rounded-b-3xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-bold">海况稳定，可以放心启航 ☀️</h1>
            <p className="text-gray-600 text-sm">{formattedDate}</p>
          </div>
        </div>
        
        {/* 快速操作区 */}
        <div className="bg-ocean-100 rounded-xl p-4 mb-2">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <Anchor className="text-ocean-600 mr-2" size={18} />
              <span className="text-sm font-medium">收集PPT相关数据资料</span>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <Clock size={14} className="mr-1" />
              <span>15分钟</span>
            </div>
          </div>
          
          <div className="flex justify-between">
            <div className="flex items-center">
              <span className="text-xs text-gray-500">#完成PPT制作</span>
            </div>
            <SailingButton text="启航" />
          </div>
        </div>
      </div>
      
      {/* 今日聚焦 */}
      <div className="px-4 mt-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-medium text-gray-900">今日聚焦</h2>
          <div className="flex items-center text-xs text-gray-500">
            <span>时间轴</span>
            <span className="mx-2">|</span>
            <span>随时可做</span>
          </div>
        </div>
        
        {/* 时间轴任务 */}
        <div className="space-y-2 mb-4">
          {scheduledTasks.map(task => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
        
        {/* 随时可做任务 */}
        {anytimeTasks.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm text-gray-500 mb-2">随时</h3>
            <div className="space-y-2">
              {anytimeTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}
        
        {/* 已完成任务 */}
        <CompletedTasks />
        
        {/* 添加任务按钮 */}
        <div className="mt-6 flex justify-center">
          <QuickAddTask />
        </div>
      </div>
    </div>
  );
};

export default HomePage; 