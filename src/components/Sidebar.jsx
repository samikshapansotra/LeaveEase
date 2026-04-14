import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  if (!user) return null;

  const initials = user.name.split('(')[0].trim();

  const isActive = (path) => location.pathname === path ? 'active' : '';
  const isActivePrefix = (prefix) => location.pathname.startsWith(prefix) ? 'active' : '';

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowLogoutModal(false);
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">✦</div>
          <div className="logo-text">LeaveFlow</div>
        </div>

        <nav className="nav-links">
          {isAdmin ? (
            <>
              <Link to="/admin/dashboard" className={`nav-link ${isActive('/admin/dashboard')}`}>
                <span className="nav-icon">📊</span>
                <span>Reports</span>
              </Link>
              <Link to="/admin/manage-teachers" className={`nav-link ${isActive('/admin/manage-teachers')}`}>
                <span className="nav-icon">👥</span>
                <span>Teachers</span>
              </Link>
              <Link to="/admin/timetable" className={`nav-link ${isActive('/admin/timetable')}`}>
                <span className="nav-icon">📅</span>
                <span>Timetable</span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
                <span className="nav-icon">📊</span>
                <span>Dashboard</span>
              </Link>
              <Link to="/apply-leave" className={`nav-link ${isActive('/apply-leave')}`}>
                <span className="nav-icon">✨</span>
                <span>Apply Leave</span>
              </Link>
              <Link to="/my-leaves" className={`nav-link ${isActive('/my-leaves')}`}>
                <span className="nav-icon">📄</span>
                <span>My Leaves</span>
              </Link>
              <Link to="/incoming-requests" className={`nav-link ${isActive('/incoming-requests')}`}>
                <span className="nav-icon">📨</span>
                <span>Requests</span>
              </Link>
            </>
          )}
        </nav>

        <div className="sidebar-user">
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, cursor: 'pointer' }}
            onClick={() => navigate(isAdmin ? '/admin/profile' : '/profile')}
            title="View Profile"
          >
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-role-badge">
                {isAdmin ? '🛡️ Admin' : '👨‍🏫 Teacher'}
              </div>
            </div>
          </div>
          <button 
            className="signout-btn" 
            onClick={() => setShowLogoutModal(true)} 
            title="Sign Out"
          >
            <span className="signout-icon">⏻</span>
            <span className="signout-text">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '380px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👋</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Sign Out?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Are you sure you want to sign out of LeaveFlow?
            </p>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setShowLogoutModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
