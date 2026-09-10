import { useEffect, useRef, useState } from 'react';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/contexts/AuthContext';

export const UserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const firstItemRef = useRef(null);

  const closeMenu = () => {
    setIsOpen(false);
    menuRef.current?.focus();
  };

  const handleToggle = () => {
    if (isOpen) {
      closeMenu();
      return;
    }
    setIsOpen(true);
  };

  const handleNavigate = (path) => {
    closeMenu();
    navigate(path);
  };

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (!isOpen) return;

    firstItemRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeMenu();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={menuRef}
        onClick={handleToggle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Open user menu"
        className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-800 transition-colors"
      >
        <img
          src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
          alt={user?.name}
          className="w-8 h-8 rounded-full object-cover border border-indigo-500/30"
        />
        <span className="hidden lg:flex items-center gap-1">
          <span className="max-w-28 text-xs font-medium text-slate-300 truncate">{user?.name}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={closeMenu}
          />
          <div
            role="menu"
            aria-label="User menu"
            className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50"
          >
            <div className="flex items-center gap-3 p-3 border-b border-slate-800/80">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user?.name}
                className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-100 truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>

            <div className="pt-1 pb-1">
              <button
                ref={firstItemRef}
                onClick={() => handleNavigate('/account')}
                role="menuitem"
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-indigo-400 transition-colors text-left"
              >
                <User className="w-4 h-4" />
                <span>Account Settings</span>
              </button>
            </div>

            <div className="border-t border-slate-800/80 pt-1">
              <button
                onClick={handleLogout}
                role="menuitem"
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};