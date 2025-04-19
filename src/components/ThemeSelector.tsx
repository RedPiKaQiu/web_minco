import { useTheme } from '../context/ThemeContext';
import { ThemeType } from '../types';

const ThemeSelector = () => {
  const { userSelectedTheme, setUserSelectedTheme, isAutoThemeEnabled } = useTheme();

  const themes: { id: ThemeType; name: string }[] = [
    { id: 'default', name: '默认' },
    { id: 'sunset', name: '落日' },
    { id: 'forest', name: '森林' },
    { id: 'dark', name: '暗黑' }
  ];

  return (
    <select
      value={userSelectedTheme}
      onChange={(e) => setUserSelectedTheme(e.target.value as ThemeType)}
      disabled={isAutoThemeEnabled}
      className={`bg-card text-app border border-app-border rounded-lg px-2 py-1 text-sm ${
        isAutoThemeEnabled ? 'opacity-70 cursor-not-allowed' : ''
      }`}
    >
      {themes.map(({ id, name }) => (
        <option key={id} value={id}>
          {name}
        </option>
      ))}
    </select>
  );
};

export default ThemeSelector; 