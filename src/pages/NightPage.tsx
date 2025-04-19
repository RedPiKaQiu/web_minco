import { useEffect, useMemo } from 'react';

const NightPage = () => {
  // 使用useMemo确保星星位置只生成一次
  const starPositions = useMemo(() => {
    return Array.from({ length: 20 }).map((_, index) => ({
      top: `${(index * 7) % 100}%`,
      left: `${(index * 13) % 100}%`,
      delay: `${(index * 0.5) % 5}s`,
      duration: `${3 + (index % 3)}s`,
      opacity: 0.5 + (index % 10) / 10,
      size: 1 + (index % 3)
    }));
  }, []);

  // 星星动画效果
  useEffect(() => {
    // 不再需要计时器数组，因为不再有自动返回首页功能
    return () => {
      // 清理函数保持为空或移除
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0c2d6b] text-white flex flex-col justify-center items-center relative overflow-hidden">
      {/* 星星背景动画 */}
      <div className="stars-container absolute inset-0">
        {starPositions.map((position, index) => (
          <div 
            key={index}
            className="star"
            style={{
              top: position.top,
              left: position.left,
              animationDelay: position.delay,
              animationDuration: position.duration,
              opacity: position.opacity,
              width: `${position.size}px`,
              height: `${position.size}px`
            }}
          ></div>
        ))}
      </div>
      
      {/* 晚安消息 */}
      <div className="bg-[#123a7c]/80 rounded-lg p-6 mx-8 backdrop-blur-sm z-10">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 mr-3 relative">
            <div className="w-8 h-8 bg-yellow-300 rounded-full absolute top-0 left-0"></div>
            <div className="w-6 h-6 bg-[#0c2d6b] rounded-full absolute top-1 left-4 border-2 border-yellow-300"></div>
          </div>
          <h2 className="text-xl font-bold">晚安！</h2>
        </div>
        <p className="text-blue-100 text-sm leading-relaxed">
          今天已经没有需要再关注的日程啦，带着专注的成果和情绪的觉察，安心睡个好觉吧~
        </p>
      </div>
      
      {/* 底部图片装饰 */}
      <div className="absolute bottom-0 left-0 right-0 h-40 z-10 flex justify-between items-end">
        <div className="relative left-10 bottom-4">
          <div className="w-24 h-12 bg-[#195387] rounded-t-lg relative">
            <div className="absolute top-2 left-4 w-16 h-3 bg-[#4896d3] rounded-full"></div>
            <div className="absolute top-6 left-8 w-8 h-3 bg-[#4896d3] rounded-full"></div>
          </div>
        </div>
        <div className="relative right-0 bottom-0">
          <div className="w-40 h-24 bg-[#28744c] rounded-tl-full"></div>
          <div className="absolute right-10 bottom-8 w-8 h-20 bg-[#164426] rounded-t-lg transform rotate-12"></div>
          <div className="absolute right-20 bottom-10 w-8 h-24 bg-[#195e3d] rounded-t-lg"></div>
        </div>
      </div>
    </div>
  );
};

export default NightPage; 