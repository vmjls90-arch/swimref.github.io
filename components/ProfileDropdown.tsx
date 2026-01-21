
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { UserIcon, SettingsIcon, LogOutIcon, ChevronDownIcon } from './Icons';

interface ProfileDropdownProps {
  user: User;
  onOpenProfile: () => void;
  onOpenPreferences: () => void;
  onLogout: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user, onOpenProfile, onOpenPreferences, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 pr-3 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors border border-slate-200"
      >
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-500 overflow-hidden">
          {user.profilePictureUrl ? (
            <img src={user.profilePictureUrl} alt="Perfil" className="w-full h-full object-cover" />
          ) : (
            <UserIcon />
          )}
        </div>
        <span className="text-xs font-bold text-slate-700 hidden sm:inline">{user.name}</span>
        <ChevronDownIcon />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 origin-top-right z-40">
          <div className="p-4 border-b border-slate-100">
            <p className="font-bold text-sm text-slate-800 truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
          <div className="p-2">
            <button onClick={() => { onOpenProfile(); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              <UserIcon />
              <span>O Meu Perfil</span>
            </button>
            <button onClick={() => { onOpenPreferences(); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
              <SettingsIcon />
              <span>Preferências</span>
            </button>
          </div>
          <div className="p-2 border-t border-slate-100">
            <button onClick={onLogout} className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-rose-500 hover:bg-rose-50 transition-colors">
              <LogOutIcon />
              <span>Terminar Sessão</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
