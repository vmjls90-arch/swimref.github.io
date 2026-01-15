
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Competition, RSVP, RSVPStatus, User, UserRole, Notification, PaymentLog, NotificationPreferences, CompetitionDocument, UserStatus, CRAMember, CRAConfig } from './types';
import { 
  PlusIcon, 
  MapPinIcon, 
  CalendarIcon, 
  WavesIcon,
  TrashIcon,
  EditIcon,
  SearchIcon,
  FilterIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ListIcon,
  CalendarDaysIcon,
  UserIcon,
  BookOpenIcon,
  CheckCircleIcon,
  BellIcon,
  XIcon,
  BanknoteIcon,
  SunIcon,
  MoonIcon,
  ActivityIcon,
  TrendingUpIcon,
  SettingsIcon,
  MailIcon,
  PhoneIcon,
  UsersIcon,
  ShieldIcon,
  UploadIcon,
  DownloadIcon,
  FileTextIcon,
  CameraIcon,
  GoogleIcon,
  LogOutIcon
} from './components/Icons';
import AdminPanel from './components/AdminPanel';

const DEFAULT_PREFERENCES: NotificationPreferences = {
  newCompetitions: true,
  rsvpChanges: true,
  paymentUpdates: true,
  channels: {
    toast: true,
    email: false
  }
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
  { id: 'u1', name: 'Alex Johnson', email: 'admin@poolref.com', role: 'Administrador', status: UserStatus.APPROVED, preferences: { ...DEFAULT_PREFERENCES }, profilePictureUrl: undefined },
  { id: 'u2', name: 'Sarah Thompson', email: 'sarah@poolref.com', role: 'Árbitro', status: UserStatus.APPROVED, preferences: { ...DEFAULT_PREFERENCES }, profilePictureUrl: undefined },
  { id: 'u3', name: 'Miguel Silva', email: 'miguel@poolref.com', role: 'Árbitro', status: UserStatus.APPROVED, preferences: { ...DEFAULT_PREFERENCES }, profilePictureUrl: undefined },
  { id: 'u4', name: 'Joana Ferreira', email: 'joana@poolref.com', role: 'Árbitro', status: UserStatus.PENDING, preferences: { ...DEFAULT_PREFERENCES }, profilePictureUrl: undefined },
  { id: 'u5', name: 'Ricardo Santos', email: 'ricardo@poolref.com', role: 'Árbitro', status: UserStatus.APPROVED, preferences: { ...DEFAULT_PREFERENCES }, profilePictureUrl: undefined },
];

const INITIAL_COMPETITIONS: Competition[] = [
  {
    id: 'c1',
    name: 'Campeonato Regional de Inverno 2024',
    date: '2024-06-15',
    location: 'Complexo de Piscinas do Jamor',
    poolType: '50m',
    description: 'Campeonato regional de natação pura para categorias de juvenis e seniores.',
    level: 'Nacional',
    isPaid: true,
    paymentHistory: [
      { id: 'pl-init-1', userName: 'Alex Johnson', status: true, timestamp: '2024-05-10T10:00:00Z' }
    ],
    rsvps: [
      { id: 'r1', userId: 'u1', userName: 'Alex Johnson', userRole: 'Administrador', status: RSVPStatus.ATTENDING, comment: '', timestamp: '2024-05-10T10:00:00Z' },
      { id: 'r2', userId: 'u3', userName: 'Miguel Silva', userRole: 'Árbitro', status: RSVPStatus.ATTENDING, comment: 'Disponível tarde', timestamp: '2024-05-11T10:00:00Z' }
    ],
    documents: [],
    craResponsible: 'Alexandre Alves'
  },
  {
    id: 'c2',
    name: 'Torneio de Abertura de Infantis',
    date: '2024-07-02',
    location: 'Piscinas Municipais de Alvalade',
    poolType: '25m',
    description: 'Prova de abertura de época para o escalão de infantis, focada em distâncias curtas.',
    level: 'Clube',
    isPaid: false,
    paymentHistory: [],
    rsvps: [],
    documents: [],
    craResponsible: 'Maria Leonor Ribeiro'
  }
];

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const AuthPage: React.FC<{ 
  users: User[]; 
  onLoginSuccess: (user: User) => void;
  onRegister: (user: Omit<User, 'id'>) => void;
}> = ({ users, onLoginSuccess, onRegister }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'pending'>('login');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = users.find(u => u.email === email);
    if (user) {
      if (user.status === UserStatus.PENDING) {
        setError('A sua conta está pendente de aprovação por um administrador.');
        return;
      }
      if (user.status === UserStatus.APPROVED) {
        onLoginSuccess(user);
        return;
      }
    }
    setError('Credenciais inválidas. Por favor, tente novamente.');
  };
  
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (users.some(u => u.email === email)) {
      setError('Este endereço de email já está a ser utilizado.');
      return;
    }
    onRegister({
      name,
      email,
      role: 'Árbitro',
      status: UserStatus.PENDING,
      preferences: DEFAULT_PREFERENCES,
    });
    setMode('pending');
  };

  const handleGoogleLogin = () => {
    const approvedUser = users.find(u => u.status === UserStatus.APPROVED);
    if (approvedUser) onLoginSuccess(approvedUser);
  };

  const renderContent = () => {
    if (mode === 'pending') {
      return (
        <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Registo Submetido</h2>
            <p className="text-slate-500 text-sm mb-6">A sua conta foi criada com sucesso e está agora pendente de aprovação por um administrador. Será notificado quando a sua conta for ativada.</p>
            <button onClick={() => setMode('login')} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">
                Voltar ao Login
            </button>
        </div>
      );
    }

    return (
      <>
        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-6">
          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nome</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                placeholder="O seu nome completo"
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
              placeholder="exemplo@email.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Palavra-passe</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-xs text-rose-500 font-bold text-center">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-100 transition-all active:scale-95">
            {mode === 'login' ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
          <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-slate-400">ou</span></div>
        </div>
        <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 py-3 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all">
          <GoogleIcon /><span>Entrar com Google</span>
        </button>
      </>
    );
  };


  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-md mb-4"><WavesIcon /></div>
          <h1 className="text-4xl font-bold font-outfit text-slate-900">Bem-vindo ao SwimRef</h1>
          <p className="text-slate-500 mt-2">A sua plataforma de gestão de árbitros de natação.</p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200/50">
          {renderContent()}
        </div>
        {mode !== 'pending' && (
          <div className="text-center mt-6 text-xs">
            {mode === 'login' ? (
              <>
                Não tem uma conta? <button onClick={() => { setMode('register'); setError('')}} className="font-bold text-blue-600 hover:underline">Registe-se</button>
              </>
            ) : (
              <>
                Já tem uma conta? <button onClick={() => { setMode('login'); setError('')}} className="font-bold text-blue-600 hover:underline">Entre aqui</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Tenta carregar o utilizador do localStorage ao iniciar
    const savedUser = localStorage.getItem('swimref-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [competitions, setCompetitions] = useState<Competition[]>(INITIAL_COMPETITIONS);
  const [craMembers, setCraMembers] = useState<CRAMember[]>(INITIAL_CRA_MEMBERS);
  const [craConfig, setCraConfig] = useState<CRAConfig>(INITIAL_CRA_CONFIG);
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [compToDeleteId, setCompToDeleteId] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'profile' | 'settings' | 'admin' | 'contacts'>('list');
  const [viewDate, setViewDate] = useState(new Date());

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeToast, setActiveToast] = useState<Notification | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  const [editProfile, setEditProfile] = useState({
    name: currentUser?.name || '',
    role: currentUser?.role || 'Árbitro'
  });
  const [isProfileUpdated, setIsProfileUpdated] = useState(false);
  
  useEffect(() => {
    if (currentUser) {
      // Guarda o utilizador no localStorage sempre que ele muda
      localStorage.setItem('swimref-user', JSON.stringify(currentUser));
      setEditProfile({ name: currentUser.name, role: currentUser.role });
    } else {
      // Remove o utilizador do localStorage se ele fizer logout
      localStorage.removeItem('swimref-user');
    }
  }, [currentUser]);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const isAdmin = currentUser?.role === 'Administrador';
  const canManage = isAdmin;

  const [newComp, setNewComp] = useState<Partial<Competition>>({
    name: '',
    date: '',
    location: '',
    poolType: '50m',
    level: 'Clube',
    description: '',
    isPaid: false,
    craResponsible: craMembers[0]?.name || ''
  });

  const [editComp, setEditComp] = useState<Partial<Competition>>({});

  const [rsvpForm, setRsvpForm] = useState({
    status: RSVPStatus.ATTENDING,
    comment: ''
  });

  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => setActiveToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  const addNotification = (
    title: string, 
    message: string, 
    type: 'info' | 'success' | 'warning' = 'info', 
    category?: 'newCompetition' | 'rsvpChange' | 'paymentUpdate'
  ) => {
    if (!currentUser) return;
    const prefs = currentUser.preferences;
    if (category) {
      if (category === 'newCompetition' && !prefs.newCompetitions) return;
      if (category === 'rsvpChange' && !prefs.rsvpChanges) return;
      if (category === 'paymentUpdate' && !prefs.paymentUpdates) return;
    }

    const newNotif: Notification = {
      id: `n${Date.now()}`,
      title,
      message,
      timestamp: new Date().toISOString(),
      isRead: false,
      type,
      category
    };

    setNotifications(prev => [newNotif, ...prev]);
    if (prefs.channels.toast) setActiveToast(newNotif);
  };
  
  const handleRegisterUser = (newUser: Omit<User, 'id'>) => {
    const userWithId = { ...newUser, id: `u${Date.now()}` };
    setUsers(prev => [...prev, userWithId]);
  };
  
  const handleApproveUser = (userId: string) => {
    const userToApprove = users.find(u => u.id === userId);
    if (!userToApprove) return;
    
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: UserStatus.APPROVED } : u));
    addNotification('Conta Aprovada', `A conta de ${userToApprove.name} foi aprovada.`, 'success');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(currentUsers =>
      currentUsers.map(u => (u.id === updatedUser.id ? updatedUser : u))
    );
    if (currentUser && currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
    addNotification('Utilizador Atualizado', `Os dados de ${updatedUser.name} foram atualizados.`, 'success');
  };

  const handleUpdateCRAMember = (updatedMember: CRAMember) => {
    setCraMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    addNotification('Membro CRA Atualizado', `Os dados de ${updatedMember.name} foram atualizados.`, 'success');
  };

  const handleUpdateCRAConfig = (updatedConfig: CRAConfig) => {
    setCraConfig(updatedConfig);
    addNotification('Configurações CRA Atualizadas', 'Os e-mails institucionais foram atualizados.', 'success');
  };
  
  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete || !isAdmin || userId === currentUser?.id) return;

    setUsers(prev => prev.filter(u => u.id !== userId));

    setCompetitions(prev => 
        prev.map(comp => ({
            ...comp,
            rsvps: comp.rsvps.filter(rsvp => rsvp.userId !== userId)
        }))
    );
    
    addNotification('Utilizador Removido', `A conta de ${userToDelete.name} foi removida com sucesso.`, 'warning');
  };

  const togglePaymentStatus = (compId: string) => {
    if (!canManage || !currentUser) return;
    setCompetitions(prev => prev.map(c => {
      if (c.id === compId) {
        const newPaidStatus = !c.isPaid;
        const logEntry: PaymentLog = {
          id: `pl-${Date.now()}`,
          userName: currentUser.name,
          status: newPaidStatus,
          timestamp: new Date().toISOString()
        };
        
        addNotification(
          'Estado de Pagamento Alterado',
          `A prova ${c.name} foi marcada como ${newPaidStatus ? 'Paga' : 'Pendente'} por ${currentUser.name}.`,
          newPaidStatus ? 'success' : 'warning',
          'paymentUpdate'
        );

        return { ...c, isPaid: newPaidStatus, paymentHistory: [logEntry, ...(c.paymentHistory || [])] };
      }
      return c;
    }));
  };

  const filteredCompetitions = useMemo(() => {
    return competitions.filter(comp => {
      const matchesSearch = comp.name.toLowerCase().includes(searchQuery.toLowerCase()) || comp.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [competitions, searchQuery]);

  const selectedComp = competitions.find(c => c.id === selectedCompId);

  const userRsvpHistory = useMemo(() => {
    if (!currentUser) return [];
    return competitions
      .map(comp => ({ comp, rsvp: comp.rsvps.find(r => r.userId === currentUser.id) }))
      .filter(item => item.rsvp !== undefined)
      .sort((a, b) => new Date(b.comp.date).getTime() - new Date(a.comp.date).getTime());
  }, [competitions, currentUser?.id]);

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  }, [viewDate]);

  const changeMonth = (offset: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  const handleCreateCompetition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage || !currentUser) return;
    const competition: Competition = {
      ...newComp as Competition,
      id: `c${Date.now()}`,
      isPaid: newComp.isPaid || false,
      paymentHistory: newComp.isPaid ? [{ id: `pl-${Date.now()}`, userName: currentUser.name, status: true, timestamp: new Date().toISOString() }] : [],
      rsvps: [],
      documents: []
    };
    setCompetitions(prev => [...prev, competition]);
    setShowCreateModal(false);
    setNewComp({ name: '', date: '', location: '', poolType: '50m', level: 'Clube', description: '', isPaid: false, craResponsible: craMembers[0]?.name || '' });
    addNotification('Nova Competição', `${competition.name} adicionada.`, 'success', 'newCompetition');
  };

  const handleUpdateCompetition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage || !editComp.id) return;
    setCompetitions(prev => prev.map(c => c.id === editComp.id ? { ...c, ...editComp } as Competition : c));
    setShowEditModal(false);
    addNotification('Competição Atualizada', `Alterações guardadas em ${editComp.name}.`, 'info');
  };

  const handleDeleteCompetition = () => {
    if (!isAdmin || !compToDeleteId) return;

    const compToDelete = competitions.find(c => c.id === compToDeleteId);
    if (!compToDelete) return;

    setCompetitions(prev => prev.filter(c => c.id !== compToDeleteId));
    
    if (selectedCompId === compToDeleteId) {
        setSelectedCompId(null);
    }

    setShowDeleteModal(false);
    setCompToDeleteId(null);
    addNotification('Competição Removida', `A competição "${compToDelete.name}" foi removida.`, 'warning');
  };

  const handleRSVP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompId || !currentUser) return;
    const newRsvp: RSVP = {
      id: `r${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      status: rsvpForm.status,
      comment: rsvpForm.comment,
      timestamp: new Date().toISOString()
    };
    setCompetitions(prev => prev.map(c => {
      if (c.id === selectedCompId) {
        const filteredRsvps = c.rsvps.filter(r => r.userId !== currentUser.id);
        addNotification('Resposta de RSVP', `Confirmaste a tua presença para ${c.name}.`, 'success', 'rsvpChange');
        return { ...c, rsvps: [...filteredRsvps, newRsvp] };
      }
      return c;
    }));
    setRsvpForm({ status: RSVPStatus.ATTENDING, comment: '' });
  };

  const handleEditClick = () => {
    if (!selectedComp) return;
    setEditComp(selectedComp);
    setShowEditModal(true);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...editProfile };
    setCurrentUser(updatedUser);
    handleUpdateUser(updatedUser);
    setIsProfileUpdated(true);
    setTimeout(() => setIsProfileUpdated(false), 3000);
  };

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCurrentUser(prevUser => prevUser ? ({
          ...prevUser,
          profilePictureUrl: event.target?.result as string,
        }) : null);
      };
      reader.readAsDataURL(file);
    }
  };


  const updatePreference = (key: keyof Omit<NotificationPreferences, 'channels'> | 'toast' | 'email', value: boolean) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const newPrefs = { ...prev.preferences };
      if (key === 'toast' || key === 'email') newPrefs.channels = { ...newPrefs.channels, [key]: value };
      else (newPrefs as any)[key] = value;
      return { ...prev, preferences: newPrefs };
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, compId: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onload = (event) => {
        const newDocument: CompetitionDocument = {
            id: `doc-${Date.now()}`,
            name: file.name,
            type: file.type,
            size: file.size,
            url: event.target?.result as string,
            timestamp: new Date().toISOString(),
        };

        setCompetitions(prevComps => prevComps.map(comp => {
            if (comp.id === compId) {
                return {
                    ...comp,
                    documents: [...(comp.documents || []), newDocument]
                };
            }
            return comp;
        }));
        
        addNotification('Documento Adicionado', `${file.name} foi carregado com sucesso.`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleFileDownload = (doc: CompetitionDocument) => {
      const link = document.createElement('a');
      link.href = doc.url;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleFileDelete = (docId: string, compId: string) => {
      if (!isAdmin) return;
      setCompetitions(prevComps => prevComps.map(comp => {
          if (comp.id === compId) {
              return {
                  ...comp,
                  documents: (comp.documents || []).filter(doc => doc.id !== docId),
              };
          }
          return comp;
      }));
      addNotification('Documento Removido', 'O documento foi removido com sucesso.', 'warning');
  };

  if (!currentUser) {
    return <AuthPage users={users} onLoginSuccess={setCurrentUser} onRegister={handleRegisterUser} />;
  }

  const renderProfile = () => (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-4 mb-8">
        <div className="relative group">
          <input 
            type="file" 
            id="profilePictureInput" 
            className="hidden" 
            accept="image/*"
            onChange={handleProfilePictureUpload}
          />
          <label htmlFor="profilePictureInput" className="cursor-pointer">
            {currentUser.profilePictureUrl ? (
              <img src={currentUser.profilePictureUrl} alt="Foto de Perfil" className="w-20 h-20 rounded-3xl object-cover shadow-sm" />
            ) : (
              <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600 font-bold text-3xl shadow-sm">
                {currentUser.name.charAt(0)}
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <CameraIcon />
            </div>
          </label>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 font-outfit">O Meu Perfil</h2>
          <p className="text-slate-500">{currentUser.role}</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nome Completo</label>
            <input 
              type="text" 
              value={editProfile.name} 
              onChange={e => setEditProfile({...editProfile, name: e.target.value})}
              className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cargo / Função</label>
            <select 
              value={editProfile.role} 
              onChange={e => setEditProfile({...editProfile, role: e.target.value as UserRole})}
              className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              disabled={!isAdmin}
            >
              <option value="Administrador">Administrador</option>
              <option value="Árbitro">Árbitro</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-100 transition-all active:scale-95">
              Atualizar Perfil
            </button>
            <button type="button" onClick={handleLogout} className="flex items-center gap-2 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors">
              <LogOutIcon />
              Sair
            </button>
          </div>
          {isProfileUpdated && (
            <p className="text-emerald-500 text-center text-xs font-bold animate-in fade-in">Perfil atualizado com sucesso!</p>
          )}
        </form>
      </div>

      <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100">
        <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2"><BookOpenIcon /> Histórico de RSVPs</h3>
        <div className="space-y-4">
          {userRsvpHistory.length === 0 ? (
            <p className="text-blue-600/60 text-xs italic">Ainda não respondeste a nenhuma convocatória.</p>
          ) : (
            userRsvpHistory.map(({ comp, rsvp }) => (
              <div key={comp.id} className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm">
                <div>
                  <p className="font-bold text-sm text-slate-800">{comp.name}</p>
                  <p className="text-[10px] text-slate-400">{new Date(comp.date).toLocaleDateString('pt-PT')}</p>
                </div>
                {rsvp && (
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase ${rsvp.status === RSVPStatus.ATTENDING ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {rsvp.status}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-3xl font-bold text-slate-900 font-outfit flex items-center gap-3"><SettingsIcon /> Ajustes de Notificação</h2>
      
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 space-y-8">
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Preferências de Alerta</h3>
            <div className="space-y-4">
              {[
                { key: 'newCompetitions', label: 'Novas Competições', desc: 'Sê o primeiro a saber quando uma nova prova é adicionada.' },
                { key: 'rsvpChanges', label: 'Alterações de RSVP', desc: 'Recebe alertas sobre atualizações nas equipas técnicas.' },
                { key: 'paymentUpdates', label: 'Atualizações de Pagamento', desc: 'Sabe quando os honorários de uma prova são processados.' }
              ].map(pref => (
                <div key={pref.key} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{pref.label}</p>
                    <p className="text-xs text-slate-500">{pref.desc}</p>
                  </div>
                  <button 
                    onClick={() => updatePreference(pref.key as any, !currentUser.preferences[pref.key as keyof Omit<NotificationPreferences, 'channels'>])}
                    className={`w-12 h-6 rounded-full transition-all relative ${currentUser.preferences[pref.key as keyof Omit<NotificationPreferences, 'channels'>] ? 'bg-blue-600' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${currentUser.preferences[pref.key as keyof Omit<NotificationPreferences, 'channels'>] ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Canais de Comunicação</h3>
            <div className="space-y-4">
              {[
                { key: 'toast', label: 'Notificações In-App (Toasts)', icon: <BellIcon /> },
                { key: 'email', label: 'Notificações por E-mail', icon: <MailIcon /> }
              ].map(channel => (
                <div key={channel.key} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-xl text-slate-500">{channel.icon}</div>
                    <p className="font-bold text-slate-800 text-sm">{channel.label}</p>
                  </div>
                  <button 
                    onClick={() => updatePreference(channel.key as any, !currentUser.preferences.channels[channel.key as 'toast' | 'email'])}
                    className={`w-12 h-6 rounded-full transition-all relative ${currentUser.preferences.channels[channel.key as 'toast' | 'email'] ? 'bg-blue-600' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${currentUser.preferences.channels[channel.key as 'toast' | 'email'] ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-slate-100 rounded-2xl border border-slate-200">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-white rounded-xl text-amber-500 border border-amber-100"><ShieldIcon /></div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Privacidade de Dados</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">Os teus dados são processados localmente e as interações de IA (briefings e guias) não são utilizadas para treino de modelos externos.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCalendarView = () => (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 animate-in fade-in">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors"><ChevronLeftIcon /></button>
        <h2 className="text-2xl font-bold font-outfit text-slate-900">{viewDate.toLocaleString('pt-PT', { month: 'long', year: 'numeric' })}</h2>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors"><ChevronRightIcon /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => <div key={day} className="py-2">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} className="border-t border-slate-100"></div>;
          const dayComps = competitions.filter(c => new Date(c.date).toDateString() === day.toDateString());
          const isToday = day.toDateString() === new Date().toDateString();
          return (
            <div key={index} className="border-t border-slate-100 p-2 h-36 overflow-y-auto custom-scrollbar">
              <div className="flex justify-center">
                <span className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${isToday ? 'bg-blue-600 text-white' : 'text-slate-600'}`}>{day.getDate()}</span>
              </div>
              <div className="space-y-1 mt-2">
                {dayComps.map(comp => (
                  <button key={comp.id} onClick={() => { setViewMode('list'); setSelectedCompId(comp.id); }} className="w-full text-left text-[10px] p-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-semibold truncate transition-colors">
                    {comp.name}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderContacts = () => {
    return (
      <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 font-outfit mb-2">Conselho Regional de Arbitragem</h2>
          <p className="text-slate-500 max-w-lg mx-auto">Informação de contacto direta com os membros do conselho para questões técnicas e administrativas.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {craMembers.map((member) => (
            <div key={member.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center group hover:border-blue-300 transition-all hover:shadow-xl hover:shadow-blue-50">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform overflow-hidden shadow-inner">
                {member.photoUrl ? (
                  <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon />
                )}
              </div>
              <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1">{member.name}</h3>
              <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-6">{member.role}</p>
              
              <div className="w-full space-y-3">
                <a href={`mailto:${member.email}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  <MailIcon />
                  <span className="text-[11px] font-medium truncate">{member.email}</span>
                </a>
                <a href={`tel:${member.phone.replace(/\s/g, '')}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                  <PhoneIcon />
                  <span className="text-[11px] font-medium">{member.phone}</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* E-mails Institucionais Globais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-slate-200">
           <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <MailIcon />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Associação de Natação do Alentejo</p>
                <a href={`mailto:${craConfig.technicalEmail}`} className="font-bold text-slate-800 hover:text-blue-600 transition-colors">{craConfig.technicalEmail}</a>
              </div>
           </div>
           <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <MailIcon />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conselho Regional de Arbitragem</p>
                <a href={`mailto:${craConfig.administrativeEmail}`} className="font-bold text-slate-800 hover:text-emerald-600 transition-colors">{craConfig.administrativeEmail}</a>
              </div>
           </div>
        </div>
      </div>
    );
  };

  const renderDetails = (selectedComp: Competition) => {
    const counts = {
      attending: selectedComp.rsvps.filter(r => r.status === RSVPStatus.ATTENDING).length,
      declined: selectedComp.rsvps.filter(r => r.status === RSVPStatus.NOT_ATTENDING).length,
      pending: selectedComp.rsvps.filter(r => r.status === RSVPStatus.PENDING).length,
    };

    const handleGetDirections = () => {
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedComp.location)}`;
        window.open(mapsUrl, '_blank', 'noopener,noreferrer');
    };

    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-slate-900 font-outfit leading-tight">{selectedComp.name}</h1>
                <button onClick={() => togglePaymentStatus(selectedComp.id)} className={`ml-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 ${selectedComp.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  <BanknoteIcon /> {selectedComp.isPaid ? 'Pago' : 'Pendente'}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-slate-500 text-xs mb-4">
                <span className="flex items-center gap-1" title="Localização"><MapPinIcon />{selectedComp.location}</span>
                <span className="flex items-center gap-1" title="Data da Prova"><CalendarIcon />{new Date(selectedComp.date).toLocaleDateString('pt-PT', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded font-bold uppercase tracking-tighter">Piscina {selectedComp.poolType}</span>
                <span className="flex items-center gap-1 text-blue-600 font-medium" title="Responsável do CRA"><ShieldIcon /> {selectedComp.craResponsible}</span>
              </div>
              <p className="text-slate-600 text-sm italic leading-relaxed">{selectedComp.description}</p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {canManage && <button onClick={handleEditClick} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all border border-transparent hover:border-blue-100" title="Editar Competição"><EditIcon /></button>}
              {isAdmin && <button onClick={() => { setCompToDeleteId(selectedComp.id); setShowDeleteModal(true); }} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100" title="Eliminar Competição"><TrashIcon /></button>}
              <button onClick={handleGetDirections} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-100">
                <MapPinIcon />
                <span>Obter Direções</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center">
              <span className="block text-2xl font-bold text-emerald-700">{counts.attending}</span>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Confirmados</span>
            </div>
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-center">
              <span className="block text-2xl font-bold text-rose-700">{counts.declined}</span>
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Indisponíveis</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center">
              <span className="block text-2xl font-bold text-slate-700">{counts.pending}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pendentes</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h4 className="font-bold text-slate-900 mb-6 flex items-center justify-between">Painel de Presenças <span className="text-xs font-normal text-slate-400">{selectedComp.rsvps.length} Oficiais</span></h4>
              <div className="space-y-4">
                {selectedComp.rsvps.length === 0 ? <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed text-slate-400 text-xs">Aguardando respostas...</div> : 
                  selectedComp.rsvps.map(r => (
                    <div key={r.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                      <div className="flex justify-between items-start mb-2">
                        <div><span className="font-bold text-slate-800 text-sm mr-2">{r.userName}</span><span className="text-[10px] text-slate-400 font-medium uppercase">{r.userRole}</span></div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${r.status === RSVPStatus.ATTENDING ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{r.status}</span>
                      </div>
                      {r.comment && <p className="text-xs text-slate-500 italic">"{r.comment}"</p>}
                    </div>
                  ))
                }
              </div>
            </div>
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 h-fit">
              <h4 className="font-bold text-slate-900 mb-6">Registar Disponibilidade</h4>
              <form onSubmit={handleRSVP} className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setRsvpForm(f => ({ ...f, status: RSVPStatus.ATTENDING }))} className={`py-3 rounded-2xl text-xs font-bold border-2 transition-all ${rsvpForm.status === RSVPStatus.ATTENDING ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500'}`}>Vou participar</button>
                  <button type="button" onClick={() => setRsvpForm(f => ({ ...f, status: RSVPStatus.NOT_ATTENDING }))} className={`py-3 rounded-2xl text-xs font-bold border-2 transition-all ${rsvpForm.status === RSVPStatus.NOT_ATTENDING ? 'bg-rose-600 border-rose-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500'}`}>Não disponível</button>
                </div>
                <textarea value={rsvpForm.comment} onChange={(e) => setRsvpForm(f => ({ ...f, comment: e.target.value }))} placeholder="Notas adicionais (ex: limitação horária)..." className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-xs outline-none min-h-[100px] focus:ring-2 focus:ring-blue-500 transition-all" />
                <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-bold transition-all shadow-xl">Submeter Resposta</button>
              </form>
            </div>
          </div>
          
          <div className="border-t border-slate-100 pt-10 mt-10">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold text-slate-900 flex items-center gap-2"><FileTextIcon /> Documentos da Prova</h4>
              {isAdmin && (
                <>
                  <input
                    type="file"
                    id="fileUpload"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, selectedComp.id)}
                  />
                  <label htmlFor="fileUpload" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-all">
                    <UploadIcon />
                    Adicionar Documento
                  </label>
                </>
              )}
            </div>
            <div className="space-y-3">
              {(selectedComp.documents || []).length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed text-slate-400 text-xs">Ainda não foram adicionados documentos a esta prova.</div>
              ) : (
                (selectedComp.documents || []).map(doc => (
                  <div key={doc.id} className="p-4 flex items-center justify-between bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-slate-200 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileTextIcon /></div>
                      <div>
                        <p className="font-bold text-sm text-slate-800">{doc.name}</p>
                        <p className="text-[10px] text-slate-400">{formatBytes(doc.size)} · {new Date(doc.timestamp).toLocaleDateString('pt-PT')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleFileDownload(doc)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><DownloadIcon /></button>
                      {isAdmin && (
                        <button onClick={() => handleFileDelete(doc.id, selectedComp.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><TrashIcon /></button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border border-dashed border-slate-200 min-h-[450px]">
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-8 animate-pulse"><WavesIcon /></div>
      <h3 className="text-2xl font-bold text-slate-900 mb-2 font-outfit">Preparar equipa de arbitragem</h3>
      <p className="text-slate-400 text-sm max-w-sm">Seleciona uma prova no calendário ou na lista lateral para gerir oficiais e briefings.</p>
    </div>
  );

  const renderMainContent = () => {
    switch (viewMode) {
      case 'list':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="relative"><div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><SearchIcon /></div><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Procurar prova..." className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs outline-none focus:ring-2 focus:ring-blue-500 transition-all" /></div>
              </div>
              <div className="space-y-4 max-h-[calc(100vh-320px)] overflow-y-auto pr-1 custom-scrollbar">
                {filteredCompetitions.length === 0 ? <div className="text-center py-10 text-xs text-slate-400 italic">Sem resultados.</div> : 
                  filteredCompetitions.map(comp => (
                    <button key={comp.id} onClick={() => setSelectedCompId(comp.id)} className={`w-full text-left p-6 rounded-3xl border-2 transition-all ${selectedCompId === comp.id ? 'border-blue-500 bg-blue-50/50 shadow-lg' : 'border-white bg-white hover:border-slate-100'}`}>
                      <div className="flex justify-between items-start mb-2"><span className="text-[9px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full uppercase tracking-widest">{comp.level}</span><span className="text-[10px] text-slate-400 font-medium">{new Date(comp.date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}</span></div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight mb-3">{comp.name}</h3>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400"><MapPinIcon /> {comp.location}</div>
                    </button>
                  ))
                }
              </div>
            </div>
            <div className="lg:col-span-8">{selectedComp ? renderDetails(selectedComp) : renderEmptyState()}</div>
          </div>
        );
      case 'calendar':
        return renderCalendarView();
      case 'profile':
        return renderProfile();
      case 'settings':
        return renderSettings();
      case 'admin':
        return <AdminPanel competitions={competitions} users={users} craMembers={craMembers} craConfig={craConfig} onUpdateUser={handleUpdateUser} onUpdateCRAMember={handleUpdateCRAMember} onUpdateCRAConfig={handleUpdateCRAConfig} currentUser={currentUser} onDeleteUser={handleDeleteUser} onApproveUser={handleApproveUser} />;
      case 'contacts':
        return renderContacts();
      default:
        return renderEmptyState();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col transition-colors duration-300">
      {activeToast && (
        <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-right-10">
          <div className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-4 max-w-xs ${activeToast.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-blue-600 border-blue-500 text-white'}`}>
            <div className="shrink-0 p-1 bg-white/20 rounded-lg"><BellIcon /></div>
            <div className="flex-1"><h5 className="font-bold text-xs">{activeToast.title}</h5><p className="text-[10px] opacity-90">{activeToast.message}</p></div>
            <button onClick={() => setActiveToast(null)} className="p-1 hover:bg-white/10 rounded"><XIcon /></button>
          </div>
        </div>
      )}

      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={() => setViewMode('list')} className="flex items-center gap-3 group transition-all">
            <div className="p-2 bg-blue-50 rounded-2xl group-hover:scale-110 transition-transform"><WavesIcon /></div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-outfit">SwimRef</span>
          </button>
          <div className="flex items-center gap-4">
            <nav className="flex items-center bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50">
              <button onClick={() => setViewMode('list')} className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-[11px] font-bold ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}><ListIcon /><span className="hidden lg:inline">Agenda</span></button>
              <button onClick={() => setViewMode('calendar')} className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-[11px] font-bold ${viewMode === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}><CalendarDaysIcon /><span className="hidden lg:inline">Calendário</span></button>
              <button onClick={() => setViewMode('contacts')} className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-[11px] font-bold ${viewMode === 'contacts' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}><PhoneIcon /><span className="hidden lg:inline">CRA</span></button>
              <button onClick={() => setViewMode('settings')} className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-[11px] font-bold ${viewMode === 'settings' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}><SettingsIcon /><span className="hidden lg:inline">Ajustes</span></button>
              {isAdmin && (
                <button onClick={() => setViewMode('admin')} className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-[11px] font-bold ${viewMode === 'admin' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}><ShieldIcon /><span className="hidden lg:inline">Admin</span></button>
              )}
            </nav>
            <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
              <button title={currentUser.name} onClick={() => setViewMode('profile')} className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-bold text-xs shadow-sm cursor-pointer hover:scale-105 transition-transform overflow-hidden">
                {currentUser.profilePictureUrl ? (
                  <img src={currentUser.profilePictureUrl} alt={currentUser.name} className="w-full h-full object-cover"/>
                ) : (
                  currentUser.name.charAt(0)
                )}
              </button>
            </div>
            {isAdmin && <button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl font-bold text-xs shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center gap-2"><PlusIcon /> Criar</button>}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
        {renderMainContent()}
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className="p-8 border-b flex items-center justify-between"><h2 className="text-2xl font-bold font-outfit">Adicionar Competição</h2><button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600"><XIcon /></button></div>
            <form onSubmit={handleCreateCompetition} className="p-8 space-y-5">
              <input required type="text" placeholder="Nome da Prova" value={newComp.name || ''} onChange={e => setNewComp({...newComp, name: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm outline-none" />
              <input required type="text" placeholder="Localização" value={newComp.location || ''} onChange={e => setNewComp({...newComp, location: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm outline-none" />
              <textarea placeholder="Descrição da Prova" value={newComp.description || ''} onChange={e => setNewComp({...newComp, description: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm outline-none min-h-[100px]" />
              <div className="grid grid-cols-2 gap-4">
                <input required type="date" value={newComp.date || ''} onChange={e => setNewComp({...newComp, date: e.target.value})} className="p-4 bg-slate-50 border-none rounded-2xl text-sm outline-none" />
                <select value={newComp.level} onChange={e => setNewComp({...newComp, level: e.target.value as any})} className="p-4 bg-slate-50 border-none rounded-2xl text-sm outline-none"><option value="Clube">Clube</option><option value="Regional">Regional</option><option value="Nacional">Nacional</option><option value="Internacional">Internacional</option></select>
                <select value={newComp.poolType} onChange={e => setNewComp({...newComp, poolType: e.target.value as any})} className="p-4 bg-slate-50 border-none rounded-2xl text-sm outline-none"><option value="25m">25m</option><option value="50m">50m</option></select>
                <select value={newComp.craResponsible} onChange={e => setNewComp({...newComp, craResponsible: e.target.value})} className="p-4 bg-slate-50 border-none rounded-2xl text-sm outline-none">
                  {craMembers.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                </select>
                <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-2xl">
                    <input type="checkbox" id="isPaidCreate" checked={newComp.isPaid || false} onChange={e => setNewComp({...newComp, isPaid: e.target.checked})} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="isPaidCreate" className="text-sm text-slate-600">Prova Paga</label>
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-100">Criar Competição</button>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editComp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className="p-8 border-b flex items-center justify-between"><h2 className="text-2xl font-bold font-outfit">Editar Competição</h2><button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600"><XIcon /></button></div>
            <form onSubmit={handleUpdateCompetition} className="p-8 space-y-5">
              <input required type="text" placeholder="Nome da Prova" value={editComp.name || ''} onChange={e => setEditComp({...editComp, name: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm outline-none" />
              <input required type="text" placeholder="Localização" value={editComp.location || ''} onChange={e => setEditComp({...editComp, location: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm outline-none" />
              <textarea placeholder="Descrição da Prova" value={editComp.description || ''} onChange={e => setEditComp({...editComp, description: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm outline-none min-h-[100px]" />
              <div className="grid grid-cols-2 gap-4">
                <input required type="date" value={editComp.date || ''} onChange={e => setEditComp({...editComp, date: e.target.value})} className="p-4 bg-slate-50 border-none rounded-2xl text-sm outline-none" />
                <select value={editComp.level} onChange={e => setEditComp({...editComp, level: e.target.value as any})} className="p-4 bg-slate-50 border-none rounded-2xl text-sm outline-none"><option value="Clube">Clube</option><option value="Regional">Regional</option><option value="Nacional">Nacional</option><option value="Internacional">Internacional</option></select>
                <select value={editComp.poolType} onChange={e => setEditComp({...editComp, poolType: e.target.value as any})} className="p-4 bg-slate-50 border-none rounded-2xl text-sm outline-none"><option value="25m">25m</option><option value="50m">50m</option></select>
                <select value={editComp.craResponsible} onChange={e => setEditComp({...editComp, craResponsible: e.target.value})} className="p-4 bg-slate-50 border-none rounded-2xl text-sm outline-none">
                  {craMembers.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                </select>
                <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-2xl">
                    <input type="checkbox" id="isPaidEdit" checked={editComp.isPaid || false} onChange={e => setEditComp({...editComp, isPaid: e.target.checked})} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="isPaidEdit" className="text-sm text-slate-600">Prova Paga</label>
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-100">Guardar Alterações</button>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className="p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                <TrashIcon />
              </div>
              <h2 className="text-2xl font-bold font-outfit mt-4 text-slate-900">Eliminar Competição</h2>
              <p className="text-sm text-slate-500 mt-2">Tem a certeza que quer eliminar esta competição? Esta ação não pode ser revertida.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 p-6 bg-slate-50">
              <button onClick={() => setShowDeleteModal(false)} className="py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-colors">
                Cancelar
              </button>
              <button onClick={handleDeleteCompetition} className="py-3 bg-rose-600 text-white rounded-2xl font-bold text-sm hover:bg-rose-700 transition-colors">
                Confirmar Eliminação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
