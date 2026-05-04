import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useTheme } from '../../contexts/ThemeContext';

const IconSun = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="8" cy="8" r="3" />
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.2 3.2l1.4 1.4M11.4 11.4l1.4 1.4M3.2 12.8l1.4-1.4M11.4 4.6l1.4-1.4" strokeLinecap="round" />
  </svg>
);

const IconMoon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M13.5 10A6 6 0 0 1 6 2.5a6 6 0 1 0 7.5 7.5Z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function Layout() {
  const { theme, toggle } = useTheme();

  return (
    <div className="app-layout">
      <Sidebar />
      <button
        className="theme-toggle-fixed"
        onClick={toggle}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? <IconSun /> : <IconMoon />}
      </button>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
