import { useNavigate } from 'react-router-dom';
import { MapPin, Ship, Pencil } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useEffect, useState } from 'react';

const StartPage = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const [connectionStatus, setConnectionStatus] = useState<string>('');

  useEffect(() => {
    const testConnection = async () => {
      try {
        // 使用一个固定的 mock UUID
        const mockUuid = 'user-123';
        
        const response = await fetch('http://127.0.0.1:8000/api/test/connect_test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            uuid: mockUuid
          })
        });

        const data = await response.json();
        console.log('Connection test response:', data);

        if (data.status === 'success') {
          setConnectionStatus('连接成功');
          // 使用发送的 mock UUID
          dispatch({ type: 'SET_UUID', payload: mockUuid });
          localStorage.setItem('minco_uuid', mockUuid);
        } else {
          setConnectionStatus('连接失败');
        }
      } catch (error) {
        console.error('Connection test failed:', error);
        setConnectionStatus('连接失败');
      }
    };

    testConnection();
  }, [dispatch]);

  const handleStart = () => {
    navigate('/home');
  };
  
  const handleManualArrange = () => {
    dispatch({ type: 'CLEAR_ALL_TASKS' });
    navigate('/home');
  };

  // Get current time to determine greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '凌晨好';
    if (hour < 9) return '早上好';
    if (hour < 12) return '上午好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    if (hour < 22) return '晚上好';
    return '夜深了';
  };

  return (
    <div className="flex flex-col h-screen bg-white px-4 pt-16 pb-20">
      {/* 顶部问候语 */}
      <div className="text-left mb-32">
        <h1 className="text-3xl font-bold mb-2">
          {state.uuid ? `${state.uuid}，${getGreeting()}` : `${getGreeting()}`} 
          <span className="text-4xl">☀️</span>
        </h1>
        <p className="text-gray-600">
          {new Date().getMonth() + 1}月{new Date().getDate()}日，
          {['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][new Date().getDay()]}
        </p>
        {connectionStatus && (
          <p className={`text-sm mt-2 ${connectionStatus === '连接成功' ? 'text-green-500' : 'text-red-500'}`}>
            {connectionStatus}
          </p>
        )}
      </div>
      
      {/* 蓝色渐变卡片 */}
      <div className="bg-gradient-to-r from-ocean-200 to-ocean-300 rounded-3xl p-8 mb-6 shadow-md">
        <div className="flex items-start mb-4">
          <div className="bg-white/20 p-2 rounded-lg mr-2">
            <MapPin className="text-ocean-700" size={24} />
          </div>
          <h2 className="text-xl font-bold"> 快速规划今日航线</h2>
        </div>
        
        <p className="text-ocean-900 font-medium mb-1 ml-1">让MinCo帮你</p>
        
        <div className="mb-1 ml-1 flex items-center">
          <Ship className="text-ocean-700 mr-2" size={18} />
          <span>生成今日航程</span>
        </div>
        
        <div className="mb-1 ml-1 flex items-center">
          <Pencil className="text-orange-500 mr-2" size={18} />
          <span>明确三件最重要的事项</span>
        </div>
        
        <p className="text-ocean-800/80 mt-3 mb-6 text-sm ml-1">输入文字、语音、图片，都可以哦！</p>
        
        {/* 开始按钮 */}
        <button
          onClick={handleStart}
          className="w-full bg-white text-black py-3 rounded-full font-medium flex items-center justify-center"
        >
          <span className="text-2xl mr-2">📖</span> 开始
        </button>
      </div>
      
      {/* 手动安排 */}
      <div 
        className="text-center text-gray-500 mb-6 cursor-pointer"
        onClick={handleManualArrange}
      >
        手动安排
      </div>
      
      {/* 船的图示 */}
      <div className="mt-auto mb-0">
        <svg viewBox="0 0 400 150" className="w-full">
          <path d="M0,100 L100,100 L150,50 L200,100 L400,100" fill="none" stroke="#2B6CB0" strokeWidth="5" />
          <rect x="50" y="50" width="100" height="50" fill="#2C5282" rx="10" />
          <rect x="60" y="60" width="20" height="20" fill="#90CDF4" rx="5" />
          <rect x="90" y="60" width="20" height="20" fill="#90CDF4" rx="5" />
          <rect x="120" y="60" width="20" height="20" fill="#90CDF4" rx="5" />
          <path d="M0,130 C50,110 150,150 250,120 C350,90 400,130 400,130" fill="#3182CE" />
          <circle cx="330" cy="110" r="15" fill="#3182CE" />
          <path d="M330,110 L350,90 M330,110 L330,130" stroke="#4299E1" strokeWidth="3" />
        </svg>
      </div>
    </div>
  );
};

export default StartPage;