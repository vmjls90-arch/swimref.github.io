
import React, { useState, useEffect, useRef } from 'react';
import { Notification } from '../types';
import { BellIcon, CheckCircleIcon, BanknoteIcon, CalendarDaysIcon } from './Icons';

interface NotificationsDropdownProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onMarkAllAsRead: () => void;
}

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)} anos atrás`;
    
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)} meses atrás`;

    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)} dias atrás`;

    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)} horas atrás`;
    
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)} minutos atrás`;
    
    return 'Agora mesmo';
};


const NotificationIcon: React.FC<{ category?: string }> = ({ category }) => {
    switch (category) {
        case 'newCompetition':
            return <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600"><CalendarDaysIcon /></div>;
        case 'rsvpChange':
            return <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600"><CheckCircleIcon /></div>;
        case 'paymentUpdate':
            return <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600"><BanknoteIcon /></div>;
        default:
            return <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 text-slate-500"><BellIcon /></div>;
    }
};

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ notifications, onNotificationClick, onMarkAllAsRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
        className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors border border-slate-200 relative"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 origin-top-right z-40 flex flex-col">
          <div className="p-4 flex justify-between items-center border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-800">Notificações</h3>
            {unreadCount > 0 && (
              <button onClick={onMarkAllAsRead} className="text-xs font-bold text-blue-600 hover:underline">
                Marcar todas como lidas
              </button>
            )}
          </div>
          <div className="overflow-y-auto max-h-80 custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <button 
                  key={notification.id}
                  onClick={() => { onNotificationClick(notification); setIsOpen(false); }}
                  className="w-full text-left flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors border-b last:border-b-0 border-slate-100"
                >
                  <NotificationIcon category={notification.category} />
                  <div className="flex-1">
                    <p className="font-bold text-xs text-slate-700">{notification.title}</p>
                    <p className="text-xs text-slate-500 leading-tight mb-1">{notification.message}</p>
                    <p className="text-[10px] font-bold text-blue-500">{formatTimeAgo(notification.timestamp)}</p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1 shrink-0" title="Não lida"></div>
                  )}
                </button>
              ))
            ) : (
              <div className="p-10 text-center">
                <p className="text-sm text-slate-500">Não tem notificações.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
