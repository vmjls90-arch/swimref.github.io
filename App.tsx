

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Competition, RSVP, RSVPStatus, User, UserRole, NotificationPreferences, 
  UserStatus, CRAMember, CRAConfig, CompetitionDocument, Notification
} from './types';
import { 
  PlusIcon, MapPinIcon, CalendarIcon, WavesIcon, TrashIcon, EditIcon, SearchIcon,
  ListIcon, UserIcon, BookOpenIcon, CheckCircleIcon, XIcon, BanknoteIcon, 
  SettingsIcon, MailIcon, PhoneIcon, ShieldIcon, LogOutIcon, UploadIcon, DownloadIcon, 
  FileTextIcon, CalendarDaysIcon, GoogleIcon, ActivityIcon
} from './components/Icons';
import AdminPanel from './components/AdminPanel';
import CompetitionModal from './components/CompetitionModal';
import ConfirmationModal from './components/ConfirmationModal';
import PreferencesModal from './components/PreferencesModal';
import ProfileModal from './components/ProfileModal';
import ProfileDropdown from './components/ProfileDropdown';
import CalendarPage from './components/CalendarPage';
import NotificationsDropdown from './components/NotificationsDropdown';
import Dashboard from './components/Dashboard';

const DEFAULT_PREFERENCES: NotificationPreferences = {
  newCompetitions: { toast: true, email: false },
  rsvpChanges: { toast: true, email: true },
  paymentUpdates: { toast: true, email: true },
};

const INITIAL_CRA_MEMBERS: CRAMember[] = [
  { id: 'cra1', name: "Alexandre Alves", role: "Presidente do CRA", email: "alexandre.alves@natacao.pt", phone: "912 345 678" },
  { id: 'cra2', name: "Maria Leonor Ribeiro", role: "Vice-Presidente do CRA", email: "maria.ribeiro@natacao.pt", phone: "934 567 890" },
  { id: 'cra3', name: "Vasco Lopes da Silva", role: "Vogal do CRA", email: "vasco.silva@natacao.pt", phone: "967 890 123" }
];

const INITIAL_CRA_CONFIG: CRAConfig = {
  technicalEmail: 'ana@natacao.pt',
  administrativeEmail: 'conselho.arbitragem@natacao.pt'
};

const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Administrador Principal', email: 'admin@swimref.pt', role: 'Administrador', status: UserStatus.APPROVED, preferences: { ...DEFAULT_PREFERENCES } },
  { id: 'u2', name: 'João Silva', email: 'ref@swimref.pt', role: 'Árbitro', status: UserStatus.APPROVED, preferences: { ...DEFAULT_PREFERENCES } },
];

const INITIAL_COMPETITIONS: Competition[] = [
  {
    id: 'c1',
    name: 'Campeonato Regional de Inverno 2024',
    date: '2024-12-15',
    location: 'Complexo de Piscinas do Jamor',
    description: 'Campeonato regional de natação pura para categorias de juvenis e seniores. Briefing obrigatório às 08h30.',
    level: 'Nacional',
    modality: 'Natação Pura',
    isPaid: true,
    paymentHistory: [],
    rsvps: [],
    documents: [],
    craResponsible: 'Alexandre Alves'
  }
];

const generateGoogleCalendarUrl = (competition: Competition): string => {
  const baseUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
  
  const title = encodeURIComponent(competition.name);
  
  const startDate = new Date(competition.date);
  startDate.setUTCHours(0, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setUTCDate(startDate.getUTCDate() + 1);
  
  const formatDate = (date: Date) => date.toISOString().split('T')[0].replace(/-/g, '');
  
  const dates = `${formatDate(startDate)}/${formatDate(endDate)}`;
  
  const details = encodeURIComponent(
    `${competition.description}\n\nLocal: ${competition.location}`
  );
  
  const location = encodeURIComponent(competition.location);
  
  return `${baseUrl}&text=${title}&dates=${dates}&details=${details}&location=${location}`;
};


const AuthPage: React.FC<{ 
  users: User[]; 
  onLoginSuccess: (user: User) => void;
  onRegister: (user: Omit<User, 'id'>) => void;
  onGoogleLogin: () => { status: 'approved' | 'pending_existing' | 'pending_new'; user?: User };
}> = ({ users, onLoginSuccess, onRegister, onGoogleLogin }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'pending'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (user) {
      if (user.status === UserStatus.PENDING) {
        setError('A sua conta está pendente de aprovação por um administrador.');
        return;
      }
      onLoginSuccess(user);
    } else {
      setError('Utilizador não encontrado. Tente admin@swimref.pt ou ref@swimref.pt');
    }
  };
  
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
      setError('Este email já está registado.');
      return;
    }
    onRegister({
      name: name.trim(),
      email: email.trim(),
      role: 'Árbitro',
      status: UserStatus.PENDING,
      preferences: { ...DEFAULT_PREFERENCES },
    });
    setMode('pending');
  };

  const handleGoogleLoginClick = () => {
    const result = onGoogleLogin();
    if (result.status === 'approved' && result.user) {
      onLoginSuccess(result.user);
    } else if (result.status === 'pending_existing') {
      setError('A sua conta (associada a este login Google) já existe e está pendente de aprovação.');
    } else if (result.status === 'pending_new') {
      setMode('pending');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-200">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-3xl mb-4 text-blue-600 shadow-sm"><WavesIcon /></div>
          <h1 className="text-4xl font-bold font-outfit text-slate-900">SwimRef</h1>
          <p className="text-slate-500 mt-2">Plataforma Oficial de Arbitragem</p>
        </div>
        {mode === 'pending' ? (
          <div className="text-center animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6"><CheckCircleIcon /></div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Registo Submetido</h2>
            <p className="text-slate-500 text-sm mb-8">A sua conta aguarda aprovação pelo CRA.</p>
            <button onClick={() => setMode('login')} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold">Voltar ao Login</button>
          </div>
        ) : (
          <div className="space-y-6">
            <button
              type="button"
              onClick={handleGoogleLoginClick}
              className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm"
            >
              <GoogleIcon />
              <span>Entrar com Google</span>
            </button>

            <div className="flex items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-xs font-bold text-slate-400 uppercase">Ou</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>
            
            <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-6">
              {mode === 'register' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Nome Completo</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Como deseja ser chamado" />
                </div>
              )}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email de Acesso</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="exemplo@swimref.pt" />
              </div>
              {error && <div className="p-3 bg-rose-50 text-rose-500 text-[10px] font-bold rounded-xl text-center uppercase tracking-wider">{error}</div>}
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-[0.98]">
                {mode === 'login' ? 'Entrar' : 'Solicitar Registo'}
              </button>
              <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="w-full text-center text-xs font-bold text-blue-600 hover:underline">
                {mode === 'login' ? 'Não tem conta? Solicite aqui' : 'Já tem conta? Faça Login'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('swimref-users-list');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('swimref-current-user');
    return saved ? JSON.parse(saved) : null;
  });

  const [competitions, setCompetitions] = useState<Competition[]>(() => {
    const saved = localStorage.getItem('swimref-competitions-list');
    return saved ? JSON.parse(saved) : INITIAL_COMPETITIONS;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('swimref-notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [viewMode, setViewMode] = useState<'dashboard' | 'list' | 'calendar' | 'admin' | 'contacts'>('dashboard');
  const [selectedCompId, setSelectedCompId] = useState<string | null>(competitions[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [craMembers, setCraMembers] = useState<CRAMember[]>(INITIAL_CRA_MEMBERS);
  const [craConfig, setCraConfig] = useState<CRAConfig>(INITIAL_CRA_CONFIG);
  
  const [isCompModalOpen, setCompModalOpen] = useState(false);
  const [editingComp, setEditingComp] = useState<Competition | null>(null);
  const [isPrefsModalOpen, setIsPrefsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDeleteCompModalOpen, setIsDeleteCompModalOpen] = useState(false);
  const [compToDeleteId, setCompToDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { localStorage.setItem('swimref-users-list', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('swimref-competitions-list', JSON.stringify(competitions)); }, [competitions]);
  useEffect(() => { localStorage.setItem('swimref-notifications', JSON.stringify(notifications)); }, [notifications]);

  useEffect(() => { 
    if (currentUser) localStorage.setItem('swimref-current-user', JSON.stringify(currentUser));
    else localStorage.removeItem('swimref-current-user');
  }, [currentUser]);

  const isAdmin = currentUser?.role === 'Administrador';

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `n${Date.now()}-${notification.recipientId}`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleRSVP = (status: RSVPStatus, competitionId: string) => {
    if (!currentUser) return;
    const comment = prompt('Observações (opcional):') || '';
    
    setCompetitions(prev => prev.map(c => {
      if (c.id === competitionId) {
        const filteredRsvps = c.rsvps.filter(r => r.userId !== currentUser.id);
        const newRsvp: RSVP = {
          id: `r${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          status,
          comment,
          timestamp: new Date().toISOString()
        };
        addNotification({
          recipientId: currentUser.id,
          title: 'Confirmação Registada',
          message: `O seu estado para "${c.name}" é agora: ${status}.`,
          type: 'success',
          category: 'rsvpChange',
          linkTo: c.id
        });
        return { ...c, rsvps: [...filteredRsvps, newRsvp] };
      }
      return c;
    }));
  };

  const handleSaveCompetition = (comp: Competition) => {
    const isNew = !competitions.some(p => p.id === comp.id);

    if (isNew) {
      setCompetitions(prev => [comp, ...prev]);
      users.filter(u => u.role !== 'Administrador').forEach(user => {
        addNotification({
          recipientId: user.id,
          title: 'Nova Competição Agendada',
          message: `A competição "${comp.name}" foi adicionada.`,
          type: 'info',
          category: 'newCompetition',
          linkTo: comp.id,
        });
      });
    } else {
      const oldComp = competitions.find(p => p.id === comp.id);
      setCompetitions(prev => prev.map(p => p.id === comp.id ? comp : p));
      
      if (oldComp && oldComp.isPaid !== comp.isPaid) {
        const attendingUserIds = comp.rsvps.filter(r => r.status === RSVPStatus.ATTENDING).map(r => r.userId);
        users.filter(u => attendingUserIds.includes(u.id)).forEach(user => {
           addNotification({
              recipientId: user.id,
              title: 'Atualização de Pagamento',
              message: `O pagamento da competição "${comp.name}" foi ${comp.isPaid ? 'confirmado' : 'marcado como pendente'}.`,
              type: comp.isPaid ? 'success' : 'warning',
              category: 'paymentUpdate',
              linkTo: comp.id,
            });
        });
      }
    }
    setSelectedCompId(comp.id);
  };

  const handleOpenDeleteCompModal = (competitionId: string) => {
    setCompToDeleteId(competitionId);
    setIsDeleteCompModalOpen(true);
  };

  const handleDeleteCompetition = () => {
      if (!compToDeleteId) return;

      setCompetitions(prev => prev.filter(c => c.id !== compToDeleteId));
      
      if (selectedCompId === compToDeleteId) {
          setSelectedCompId(competitions.length > 1 ? competitions.filter(c => c.id !== compToDeleteId)[0].id : null);
      }

      setIsDeleteCompModalOpen(false);
      setCompToDeleteId(null);
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !selectedCompId) return;

    const file = event.target.files[0];
    const fileToBase64 = (file: File): Promise<string> => 
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });

    try {
        const base64Url = await fileToBase64(file);
        const newDocument: CompetitionDocument = {
            id: `doc${Date.now()}`,
            name: file.name,
            type: file.type,
            size: file.size,
            url: base64Url,
            timestamp: new Date().toISOString(),
        };

        setCompetitions(prev => prev.map(c => {
            if (c.id === selectedCompId) {
                return {
                    ...c,
                    documents: [...(c.documents || []), newDocument]
                };
            }
            return c;
        }));

    } catch (error) {
        console.error("Error uploading document:", error);
        alert("Falha ao carregar o documento.");
    }
    event.target.value = ''; 
  };

  const handleDocumentDelete = (documentId: string) => {
      if (!selectedCompId || !confirm('Tem a certeza que quer eliminar este documento?')) return;

      setCompetitions(prev => prev.map(c => {
          if (c.id === selectedCompId) {
              return {
                  ...c,
                  documents: (c.documents || []).filter(doc => doc.id !== documentId)
              };
          }
          return c;
      }));
  };

  const formatBytes = (bytes: number, decimals = 2) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  const handleUpdatePreferences = (newPreferences: NotificationPreferences) => {
      if (!currentUser) return;
      
      const updatedUser = { ...currentUser, preferences: newPreferences };
      setCurrentUser(updatedUser);
      
      setUsers(prevUsers => 
          prevUsers.map(u => u.id === currentUser.id ? updatedUser : u)
      );
  };
  
  const handleUpdateProfile = (updatedData: Partial<User>) => {
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser, ...updatedData };
    setCurrentUser(updatedUser);
    
    setUsers(prevUsers => 
        prevUsers.map(u => u.id === currentUser.id ? updatedUser : u)
    );
  };

  const handleMarkNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
  };

  const handleMarkAllNotificationsAsRead = () => {
    if (!currentUser) return;
    setNotifications(prev => prev.map(n => n.recipientId === currentUser.id ? { ...n, isRead: true } : n));
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.linkTo) {
      setViewMode('list');
      setSelectedCompId(notification.linkTo);
    }
    handleMarkNotificationAsRead(notification.id);
  };
  
  const performGoogleLogin = (): { status: 'approved' | 'pending_existing' | 'pending_new'; user?: User } => {
    // This is a simulated Google Login flow
    const googleUserEmail = 'google.user@swimref.pt';
    let user = users.find(u => u.email.toLowerCase() === googleUserEmail);

    if (user) {
      if (user.status === UserStatus.APPROVED) {
        return { status: 'approved', user };
      } else {
        return { status: 'pending_existing' };
      }
    } else {
      // User doesn't exist, create a new one with a pending status
      const newUser: User = {
        id: `u${Date.now()}`,
        name: 'Utilizador Google',
        email: googleUserEmail,
        role: 'Árbitro',
        status: UserStatus.PENDING, // Require admin approval
        preferences: { ...DEFAULT_PREFERENCES },
        profilePictureUrl: 'https://lh3.googleusercontent.com/a/ACg8ocJ9_c93ve2n2iQ_m_1q2_4-sQ_j8cZ-g8sX_Q=s96-c' // Generic avatar
      };
      setUsers(prev => [...prev, newUser]);
      return { status: 'pending_new' };
    }
  };


  if (!currentUser) return <AuthPage users={users} onLoginSuccess={setCurrentUser} onRegister={(u) => setUsers(prev => [...prev, { ...u, id: `u${Date.now()}` }])} onGoogleLogin={performGoogleLogin} />;

  const selectedComp = competitions.find(c => c.id === selectedCompId);
  const filteredCompetitions = competitions.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const userNotifications = notifications.filter(n => n.recipientId === currentUser.id);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-inter">
      <CompetitionModal isOpen={isCompModalOpen} onClose={() => setCompModalOpen(false)} onSave={handleSaveCompetition} editingCompetition={editingComp} />
      {currentUser && (
          <PreferencesModal 
              isOpen={isPrefsModalOpen}
              onClose={() => setIsPrefsModalOpen(false)}
              user={currentUser}
              onSave={handleUpdatePreferences}
          />
      )}
      {currentUser && (
        <ProfileModal 
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            user={currentUser}
            onSave={handleUpdateProfile}
        />
      )}
      <ConfirmationModal 
          isOpen={isDeleteCompModalOpen}
          onClose={() => setIsDeleteCompModalOpen(false)}
          onConfirm={handleDeleteCompetition}
          title="Eliminar Competição?"
          message={
              <p>
                  Tem a certeza que quer eliminar permanentemente esta competição? 
                  <br />
                  <strong>Todos os dados associados serão perdidos.</strong> Esta ação não pode ser revertida.
              </p>
          }
          confirmText="Sim, Eliminar"
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleDocumentUpload}
        className="hidden"
      />
       
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <button onClick={() => setViewMode('dashboard')} className="flex items-center gap-3 group">
            <WavesIcon />
            <span className="text-2xl font-bold font-outfit text-slate-900 group-hover:text-blue-600 transition-colors">SwimRef</span>
          </button>
          
          <div className="flex items-center gap-2">
            <nav className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
               <button onClick={() => setViewMode('list')} className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                <ListIcon /> <span className="hidden sm:inline">Competições</span>
              </button>
              <button onClick={() => setViewMode('calendar')} className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                <CalendarDaysIcon /> <span className="hidden sm:inline">Calendário</span>
              </button>
              <button onClick={() => setViewMode('contacts')} className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'contacts' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                <PhoneIcon /> <span className="hidden sm:inline">Contactos</span>
              </button>
              {isAdmin && (
                <button onClick={() => setViewMode('admin')} className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'admin' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                  <ShieldIcon /> <span className="hidden sm:inline">Admin</span>
                </button>
              )}
            </nav>
            <NotificationsDropdown 
              notifications={userNotifications}
              onNotificationClick={handleNotificationClick}
              onMarkAllAsRead={handleMarkAllNotificationsAsRead}
            />
            <ProfileDropdown 
                user={currentUser}
                onOpenProfile={() => setIsProfileModalOpen(true)}
                onOpenPreferences={() => setIsPrefsModalOpen(true)}
                onLogout={() => setCurrentUser(null)}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full animate-in fade-in duration-500">
        {viewMode === 'dashboard' && (
          <Dashboard 
            currentUser={currentUser}
            competitions={competitions}
            notifications={userNotifications}
            onNavigateToCompetition={(compId) => {
              setViewMode('list');
              setSelectedCompId(compId);
            }}
          />
        )}
        
        {viewMode === 'list' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Coluna da Esquerda: Lista */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400"><SearchIcon /></div>
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Procurar competição..." className="w-full pl-11 pr-4 py-3.5 bg-slate-50 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
                {isAdmin && (
                  <button onClick={() => { setEditingComp(null); setCompModalOpen(true); }} className="w-full bg-blue-600 text-white py-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all">
                    <PlusIcon /> Agendar Nova Competição
                  </button>
                )}
              </div>
              
              <div className="space-y-4 max-h-[calc(100vh-320px)] overflow-y-auto pr-2 custom-scrollbar">
                {filteredCompetitions.map(comp => {
                  const userRsvp = comp.rsvps.find(r => r.userId === currentUser.id);
                  return (
                    <button 
                      key={comp.id} 
                      onClick={() => setSelectedCompId(comp.id)} 
                      className={`w-full text-left p-6 rounded-[2rem] border-2 transition-all relative overflow-hidden group ${selectedCompId === comp.id ? 'border-blue-500 bg-blue-50/30 shadow-md' : 'border-white bg-white hover:border-slate-100'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-slate-800 text-sm leading-tight pr-4">{comp.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${comp.level === 'Nacional' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>{comp.level}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium"><CalendarIcon /> {new Date(comp.date).toLocaleDateString('pt-PT')}</div>
                      
                      {userRsvp && (
                        <div className={`mt-4 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider ${userRsvp.status === RSVPStatus.ATTENDING ? 'text-emerald-600' : 'text-rose-500'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${userRsvp.status === RSVPStatus.ATTENDING ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                          {userRsvp.status}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Coluna da Direita: Detalhe */}
            <div className="lg:col-span-8">
              {selectedComp ? (
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10 space-y-10 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div>
                      <h1 className="text-4xl font-bold text-slate-900 font-outfit mb-3">{selectedComp.name}</h1>
                      <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-400">
                        <span className="flex items-center gap-1.5"><MapPinIcon /> {selectedComp.location}</span>
                        <span className="flex items-center gap-1.5"><ActivityIcon /> {selectedComp.modality}</span>
                        <span className="flex items-center gap-1.5"><UserIcon /> Responsável do CRA: {selectedComp.craResponsible || 'TBD'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {isAdmin && (
                        <>
                          <button onClick={() => { setEditingComp(selectedComp); setCompModalOpen(true); }} className="p-4 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all border border-slate-100"><EditIcon /></button>
                          <button onClick={() => handleOpenDeleteCompModal(selectedComp.id)} className="p-4 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all border border-slate-100"><TrashIcon /></button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-8">
                      <section>
                        <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Informações Técnicas</h4>
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                          <p className="text-sm text-slate-600 leading-relaxed italic">"{selectedComp.description || 'Sem notas técnicas adicionais.'}"</p>
                        </div>
                      </section>
                      
                      <section>
                          <div className="flex justify-between items-center mb-4">
                              <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Documentos da Competição</h4>
                              {isAdmin && (
                                  <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold hover:bg-slate-200 transition-colors">
                                      <UploadIcon /> Adicionar Documento
                                  </button>
                              )}
                          </div>
                          <div className="space-y-3">
                              {(selectedComp.documents && selectedComp.documents.length > 0) ? selectedComp.documents.map(doc => (
                                  <div key={doc.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-slate-200 transition-all group">
                                      <div className="flex items-center gap-3">
                                          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><FileTextIcon /></div>
                                          <div>
                                              <p className="text-xs font-bold text-slate-800 truncate max-w-xs">{doc.name}</p>
                                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{formatBytes(doc.size)}</p>
                                          </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <a href={doc.url} download={doc.name} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><DownloadIcon /></a>
                                        {isAdmin && (
                                          <button onClick={() => handleDocumentDelete(doc.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><TrashIcon /></button>
                                        )}
                                      </div>
                                  </div>
                              )) : (
                                  <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-3xl">
                                      <p className="text-xs text-slate-400 italic">Nenhum documento adicionado a esta competição.</p>
                                  </div>
                              )}
                          </div>
                      </section>

                      <section>
                        <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Escala Confirmada ({selectedComp.rsvps.filter(r => r.status === RSVPStatus.ATTENDING).length})</h4>
                        <div className="space-y-3">
                          {selectedComp.rsvps.length > 0 ? selectedComp.rsvps.map(rsvp => (
                            <div key={rsvp.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-slate-200 transition-all">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400"><UserIcon /></div>
                                <div>
                                  <p className="text-xs font-bold text-slate-800">{rsvp.userName}</p>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{rsvp.userRole}</p>
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded text-[9px] font-bold ${rsvp.status === RSVPStatus.ATTENDING ? 'text-emerald-600 bg-emerald-50' : 'text-rose-500 bg-rose-50'}`}>{rsvp.status}</span>
                            </div>
                          )) : (
                            <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-3xl">
                              <p className="text-xs text-slate-400 italic">A aguardar confirmações...</p>
                            </div>
                          )}
                        </div>
                      </section>
                    </div>

                    <aside className="space-y-6">
                       <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl sticky top-28">
                         <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2"><CheckCircleIcon /> Sua Confirmação</h4>
                         <div className="space-y-4">
                            <div className="flex gap-3">
                              <button onClick={() => handleRSVP(RSVPStatus.ATTENDING, selectedComp.id)} className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl text-xs font-bold transition-all shadow-lg shadow-emerald-900/20">Confirmar Presença</button>
                              <button onClick={() => handleRSVP(RSVPStatus.NOT_ATTENDING, selectedComp.id)} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-xs font-bold transition-all border border-slate-700">Indisponível</button>
                            </div>
                            <p className="text-[10px] text-slate-500 text-center px-4">Ao confirmar, o seu nome será adicionado à lista de escala para esta competição.</p>
                         </div>
                       </div>
                       
                       <div className="p-8 border border-slate-100 rounded-[2.5rem] bg-white">
                         <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Estado Financeiro</h4>
                         <div className="flex items-center gap-3">
                           <div className={`p-3 rounded-xl ${selectedComp.isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}><BanknoteIcon /></div>
                           <div>
                             <p className="text-sm font-bold text-slate-800">{selectedComp.isPaid ? 'Verbas Atribuídas' : 'Pagamento Pendente'}</p>
                             <p className="text-[10px] text-slate-400">Processado pelo Conselho Regional</p>
                           </div>
                         </div>
                       </div>
                       
                       <div className="p-8 border border-slate-100 rounded-[2.5rem] bg-white">
                         <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Agenda Pessoal</h4>
                         <button 
                            onClick={() => {
                                const url = generateGoogleCalendarUrl(selectedComp);
                                window.open(url, '_blank', 'noopener,noreferrer');
                            }}
                            className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-colors shadow-sm"
                         >
                            <GoogleIcon />
                            <span>Adicionar ao Google Calendar</span>
                         </button>
                       </div>

                    </aside>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-8 animate-pulse"><BookOpenIcon /></div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-3">Selecione uma Competição</h2>
                  <p className="text-slate-500 max-w-sm text-sm">Escolha uma competição na lista lateral para gerir a sua escala e visualizar detalhes técnicos.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'calendar' && (
          <CalendarPage 
            competitions={competitions}
            currentUser={currentUser}
          />
        )}

        {viewMode === 'contacts' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500 space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <h1 className="text-5xl font-bold text-slate-900 font-outfit mb-4 tracking-tight">Contactos do CRA</h1>
              <p className="text-slate-500 text-lg">Suporte institucional e coordenação técnica.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {craMembers.map(member => (
                <div key={member.id} className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col items-center text-center hover:shadow-xl transition-all group">
                   <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition-transform shadow-inner">
                      {member.photoUrl ? <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover rounded-[2rem]" /> : <UserIcon />}
                   </div>
                   <h3 className="text-2xl font-bold text-slate-800 mb-1">{member.name}</h3>
                   <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-8">{member.role}</p>
                   <div className="w-full space-y-3">
                      <a href={`mailto:${member.email}`} className="flex items-center justify-center gap-3 p-4 bg-slate-50 rounded-2xl text-slate-600 hover:bg-blue-600 hover:text-white transition-all font-medium text-sm">
                        <MailIcon /> {member.email}
                      </a>
                      <a href={`tel:${member.phone}`} className="flex items-center justify-center gap-3 p-4 bg-slate-50 rounded-2xl text-slate-600 hover:bg-blue-600 hover:text-white transition-all font-medium text-sm">
                        <PhoneIcon /> {member.phone}
                      </a>
                   </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 rounded-[3rem] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
               <div className="space-y-4 relative z-10">
                  <h2 className="text-4xl font-bold font-outfit tracking-tight">Canais Oficiais</h2>
                  <p className="text-slate-400">Para envio de relatórios e questões administrativas de grande prioridade.</p>
               </div>
               <div className="flex flex-col md:flex-row gap-6 relative z-10">
                  <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 w-full md:w-80">
                     <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Relatórios Técnicos</p>
                     <p className="font-bold text-lg">{craConfig.technicalEmail}</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 w-full md:w-80">
                     <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">Secretariado CRA</p>
                     <p className="font-bold text-lg">{craConfig.administrativeEmail}</p>
                  </div>
               </div>
            </div>
          </div>
        )}

        {viewMode === 'admin' && isAdmin && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
            <AdminPanel 
              competitions={competitions}
              users={users}
              craMembers={craMembers}
              craConfig={craConfig}
              onUpdateUser={(u) => setUsers(prev => prev.map(old => old.id === u.id ? u : old))}
              onUpdateCRAMember={(m) => setCraMembers(prev => prev.map(old => old.id === m.id ? m : old))}
              onUpdateCRAConfig={setCraConfig}
              onDeleteUser={(id) => setUsers(prev => prev.filter(u => u.id !== id))}
              onApproveUser={(id) => setUsers(prev => prev.map(u => u.id === id ? { ...u, status: UserStatus.APPROVED } : u))}
              currentUser={currentUser}
            />
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-100 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <WavesIcon />
            <span className="text-xl font-bold text-slate-300 font-outfit tracking-tight">SwimRef</span>
          </div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.2em]">Conselho Regional de Arbitragem · © 2024</p>
          <div className="flex items-center gap-8">
            <button className="text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-widest">Sobre</button>
            <button className="text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-widest">Suporte</button>
            <button className="text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-widest">Privacidade</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;