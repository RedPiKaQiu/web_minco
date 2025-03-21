import { Calendar, Plus } from 'lucide-react';

const EmptySchedulePage = () => {
  return (
    <div className="h-screen bg-white flex flex-col px-4 pt-10 pb-20">
      {/* 顶部状态栏 */}
      <div className="bg-ocean-50 p-4 rounded-b-3xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-bold">Shell, 早上好 ☀️</h1>
            <p className="text-gray-600 text-sm">3月8日，星期六</p>
          </div>
        </div>
      </div>
      
      {/* 空日程内容 */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="bg-gray-100 rounded-full p-6 mb-4">
            <Calendar size={48} className="text-gray-400" />
          </div>
          
          <h2 className="text-xl font-medium text-gray-800 mb-2">今天还没有日程哦～</h2>
          <p className="text-gray-500 text-center mb-8">
            点击下方按钮，快速添加
          </p>
          
          {/* 添加按钮 */}
          <button className="bg-gradient-to-r from-ocean-400 to-ocean-500 text-white py-3 px-6 rounded-full flex items-center justify-center shadow-md">
            <Plus size={20} className="mr-2" />
            <span>添加任务</span>
          </button>
        </div>
      </div>
      
      {/* 底部装饰 */}
      <div className="w-full">
        <svg viewBox="0 0 1440 120" className="w-full">
          <path fill="#38bdf8" fillOpacity="0.7" d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,53.3C672,43,768,21,864,26.7C960,32,1056,64,1152,69.3C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          <path fill="#7dd3fc" fillOpacity="0.5" d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,58.7C672,64,768,96,864,96C960,96,1056,64,1152,53.3C1248,43,1344,53,1392,58.7L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          <path fill="#bae6fd" fillOpacity="0.3" d="M0,96L48,90.7C96,85,192,75,288,69.3C384,64,480,64,576,69.3C672,75,768,85,864,85.3C960,85,1056,75,1152,69.3C1248,64,1344,64,1392,64L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default EmptySchedulePage; 