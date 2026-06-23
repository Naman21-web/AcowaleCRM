import { useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import UserWindow from './pages/UserWindow.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminConsole from './pages/AdminConsole.jsx';
import { getToken } from './api/client.js';

function Topbar() {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-dot" />
        Acodash
      </div>
      <nav style={{ display: 'flex', gap: 6 }}>
        <NavLink to="/" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} end>
          Give feedback
        </NavLink>
        <NavLink to="/admin" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          Admin
        </NavLink>
      </nav>
    </header>
  );
}

function RequireAuth({ children, isAuthed, onLogin }) {
  if (!isAuthed) {
    return <AdminLogin onLogin={onLogin} />;
  }
  return children;
}

export default function App() {
  const [isAuthed, setIsAuthed] = useState(Boolean(getToken()));

  return (
    <div className="app-shell">
      <Topbar />
      <Routes>
        <Route path="/" element={<UserWindow />} />
        <Route
          path="/admin"
          element={
            <RequireAuth isAuthed={isAuthed} onLogin={() => setIsAuthed(true)}>
              <AdminConsole onLogout={() => setIsAuthed(false)} />
            </RequireAuth>
          }
        />
      </Routes>
    </div>
  );
}
