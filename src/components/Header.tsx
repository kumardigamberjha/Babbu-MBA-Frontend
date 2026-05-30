import React from 'react';
import { Search, LogOut, User as UserIcon, BookOpen, Shield } from 'lucide-react';
import { User } from '../lib/api';

interface HeaderProps {
  user: User | null;
  onLoginClick: () => void;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isAdminView?: boolean;
  onAdminToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLoginClick,
  onLogout,
  searchQuery,
  setSearchQuery,
  isAdminView = false,
  onAdminToggle,
}) => {
  return (
    <header className="glass sticky top-0 z-40 w-full border-b border-slate-200/50 dark:border-slate-800/50 px-6 py-4 flex items-center justify-between transition-colors duration-300">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.reload()}>
        <div className="bg-primary-500 text-white p-2 rounded-xl shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform duration-300">
          <BookOpen className="h-6 w-6" />
        </div>
        <div>
          <span className="font-heading font-extrabold text-2xl tracking-tight bg-gradient-to-r from-primary-600 to-indigo-500 bg-clip-text text-transparent dark:from-primary-500 dark:to-indigo-400">
            MBA <span className="text-slate-800 dark:text-white">HUB</span>
          </span>
          <p className="text-[10px] font-sans font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500 -mt-1">
            GeeksforGeeks for Business
          </p>
        </div>
      </div>

      {/* Navigation & Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors duration-200">
            <Search className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Search courses, chapters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {user?.is_staff && onAdminToggle && (
          <button
            onClick={onAdminToggle}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors duration-300 ${isAdminView ? 'bg-primary-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-primary-100 dark:hover:bg-primary-900/40'}`}
          >
            <Shield className="w-4 h-4" />
            {isAdminView ? 'Exit Admin' : 'Admin Panel'}
          </button>
        )}


        {/* Auth / User Control */}
        {user ? (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
            <div className="hidden lg:block text-right">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">{user.email}</p>
            </div>
            
            <div className="h-9 w-9 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm shadow-inner shadow-primary-500/5">
              <UserIcon className="h-4 w-4" />
            </div>

            <button
              onClick={onLogout}
              className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 transition-colors duration-300"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onLoginClick}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-indigo-500 hover:from-primary-700 hover:to-indigo-600 shadow-md shadow-primary-500/10 hover:shadow-primary-500/20 transition-all duration-300 scale-100 hover:scale-[1.02]"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
