import { NavLink } from 'react-router-dom';

const IconGrid = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="1" y="1" width="6" height="6" rx="1.5" />
    <rect x="9" y="1" width="6" height="6" rx="1.5" />
    <rect x="1" y="9" width="6" height="6" rx="1.5" />
    <rect x="9" y="9" width="6" height="6" rx="1.5" />
  </svg>
);

const IconBrain = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M8 2C6 2 4.5 3.5 4.5 5.5c0 .8.3 1.5.7 2.1C4.4 8.1 4 9 4 10c0 1.7 1.3 3 3 3h2c1.7 0 3-1.3 3-3 0-1-.4-1.9-1.2-2.4.4-.6.7-1.3.7-2.1C11.5 3.5 10 2 8 2z" />
    <path d="M8 6v7M6 8.5H4.5M11.5 8.5H10" strokeLinecap="round" />
  </svg>
);

const IconHex = () => (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" />
  </svg>
);

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <IconHex />
        </div>
        <div className="sidebar-brand-name">Order System</div>
        <div className="sidebar-brand-sub">command center</div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-nav-label">Navigation</div>

        <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <IconGrid />
          Dashboard
        </NavLink>

        <NavLink to="/insights" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <IconBrain />
          Intelligence
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-status">
          <span className="status-dot" />
          <span className="status-text">services online</span>
        </div>
      </div>
    </aside>
  );
}
