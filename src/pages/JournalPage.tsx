import { BookOpen } from 'lucide-react';

const JournalPage = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center p-4">
      <BookOpen size={64} className="text-gray-300 mb-4" />
      <h1 className="text-xl font-bold text-gray-700 mb-2">航海日志</h1>
      <p className="text-gray-500 text-center">
        这里将记录您的航海历程和成就，敬请期待！
      </p>
    </div>
  );
};

export default JournalPage; 