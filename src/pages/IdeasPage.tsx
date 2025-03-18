import { Package } from 'lucide-react';

const IdeasPage = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center p-4">
      <Package size={64} className="text-gray-300 mb-4" />
      <h1 className="text-xl font-bold text-gray-700 mb-2">想法仓库</h1>
      <p className="text-gray-500 text-center">
        这里将是您存储和整理想法的地方，敬请期待！
      </p>
    </div>
  );
};

export default IdeasPage; 