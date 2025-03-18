import { User } from 'lucide-react';

const ProfilePage = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center p-4">
      <User size={64} className="text-gray-300 mb-4" />
      <h1 className="text-xl font-bold text-gray-700 mb-2">个人资料</h1>
      <p className="text-gray-500 text-center">
        这里将是您的个人设置和偏好，敬请期待！
      </p>
    </div>
  );
};

export default ProfilePage; 