
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { XIcon, UserIcon, CameraIcon } from './Icons';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (updatedUser: Partial<User>) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const [name, setName] = useState(user.name);
  const [profilePicture, setProfilePicture] = useState<string | null>(user.profilePictureUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setProfilePicture(user.profilePictureUrl || null);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handlePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave({
      name,
      profilePictureUrl: profilePicture || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><UserIcon /></div>
            <h2 className="text-xl font-bold font-outfit text-slate-800">
              O Meu Perfil
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <XIcon />
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto custom-scrollbar space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-32 h-32 rounded-full group">
              {profilePicture ? (
                <img src={profilePicture} alt="Foto de Perfil" className="w-full h-full object-cover rounded-full border-4 border-white shadow-md" />
              ) : (
                <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border-4 border-white shadow-md">
                  <UserIcon />
                </div>
              )}
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <CameraIcon />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handlePictureUpload}
              />
            </div>
            <p className="text-xs text-slate-400">Clique na imagem para alterar</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Nome Completo</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Como deseja ser chamado"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
            <input 
              type="email" 
              readOnly
              value={user.email}
              className="w-full p-4 bg-slate-100 rounded-2xl text-sm outline-none text-slate-400 cursor-not-allowed" 
            />
          </div>
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

export default ProfileModal;
