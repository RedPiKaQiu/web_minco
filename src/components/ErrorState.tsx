import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  isLoading?: boolean;
}

const ErrorState = ({ error, onRetry, isLoading = false }: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center px-6">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        获取数据失败
      </h3>
      
      <p className="text-gray-500 mb-6 max-w-sm">
        {error}
      </p>
      
      <button
        onClick={onRetry}
        disabled={isLoading}
        className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? '重试中...' : '重试'}
      </button>
    </div>
  );
};

export default ErrorState; 