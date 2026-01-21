
import React, { useState, useEffect } from 'react';
import { User, NotificationPreferences, NotificationChannel } from '../types';
import { XIcon, SettingsIcon, BellIcon, MailIcon } from './Icons';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (preferences: NotificationPreferences) => void;
}

const PreferencesModal: React.FC<PreferencesModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const [prefs, setPrefs] = useState<NotificationPreferences>(user.preferences);

  useEffect(() => {
    setPrefs(user.preferences);
  }, [user.preferences, isOpen]);
  
  if (!isOpen) return null;

  const handleSave = () => {
    onSave(prefs);
    onClose();
  };
  
  const handleToggle = (
      category: keyof NotificationPreferences, 
      channel: keyof NotificationChannel
  ) => {
      setPrefs(prev => ({
          ...prev,
          [category]: {
              ...prev[category],
              [channel]: !prev[category][channel]
          }
      }));
  };

  const notificationSettings = [
      { key: 'newCompetitions', label: 'Novas Competições', description: 'Receber um alerta sempre que uma nova competição for agendada.' },
      { key: 'rsvpChanges', label: 'Alterações de RSVP', description: 'Receber um alerta quando a sua confirmação numa competição é registada ou alterada.' },
      { key: 'paymentUpdates', label: 'Atualizações de Pagamento', description: 'Receber um alerta quando o estado financeiro de uma competição muda.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><SettingsIcon /></div>
            <h2 className="text-xl font-bold font-outfit text-slate-800">
              Preferências & Notificações
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <XIcon />
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto custom-scrollbar">
            {notificationSettings.map(setting => (
                <div key={setting.key} className="py-6 border-b border-slate-100 last:border-b-0">
                    <h4 className="font-bold text-slate-800">{setting.label}</h4>
                    <p className="text-xs text-slate-500 mb-4">{setting.description}</p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl w-full sm:w-auto">
                            <input 
                                type="checkbox" 
                                id={`${setting.key}-toast`} 
                                checked={prefs[setting.key as keyof NotificationPreferences].toast}
                                onChange={() => handleToggle(setting.key as keyof NotificationPreferences, 'toast')}
                                className="w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor={`${setting.key}-toast`} className="text-sm font-medium text-slate-600 flex items-center gap-2 cursor-pointer"><BellIcon /> Notificação na App</label>
                        </div>
                         <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl w-full sm:w-auto">
                            <input 
                                type="checkbox" 
                                id={`${setting.key}-email`} 
                                checked={prefs[setting.key as keyof NotificationPreferences].email}
                                onChange={() => handleToggle(setting.key as keyof NotificationPreferences, 'email')}
                                className="w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor={`${setting.key}-email`} className="text-sm font-medium text-slate-600 flex items-center gap-2 cursor-pointer"><MailIcon /> Email</label>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <div className="p-6 bg-slate-50 border-t flex justify-end gap-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border border-slate-200 text-slate-500 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
          >
            Guardar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferencesModal;
