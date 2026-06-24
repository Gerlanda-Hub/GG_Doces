import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}
      title={theme === 'light' ? 'Tema Escuro' : 'Tema Claro'}
      className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 ${
        theme === 'light'
          ? 'bg-rosa-50 text-rosa-500 hover:bg-rosa-100'
          : 'bg-dourado-500/20 text-dourado-400 hover:bg-dourado-500/30'
      } ${className}`}
    >
      {theme === 'light' ? (
        <Moon className="w-4.5 h-4.5" />
      ) : (
        <Sun className="w-4.5 h-4.5" />
      )}
    </button>
  );
}
