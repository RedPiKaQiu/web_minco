import { useTheme } from '../context/ThemeContext';
import { ThemeType } from '../types';

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  const themes: { id: ThemeType; name: string }[] = [
    { id: 'default', name: '默认' },
    { id: 'sunset', name: '落日' },
    { id: 'forest', name: '森林' },
    { id: 'dark', name: '暗黑' }
  ];

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value as ThemeType)}
      className="bg-card text-app border border-app-border rounded-lg px-2 py-1 text-sm"
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