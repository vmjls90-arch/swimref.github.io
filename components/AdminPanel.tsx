
import React, { useState, useMemo, useEffect } from 'react';
import { Competition, User, UserRole, RSVPStatus, UserStatus, CRAMember, CRAConfig } from '../types';
import { ShieldIcon, EditIcon, ChevronLeftIcon, ChevronRightIcon, DownloadIcon, TrendingUpIcon, TrashIcon, XIcon, CheckCircleIcon, UserIcon, MailIcon, PhoneIcon, CameraIcon } from './Icons';

interface AdminPanelProps {
  competitions: Competition[];
  users: User[];
  craMembers: CRAMember[];
  craConfig: CRAConfig;
  onUpdateUser: (user: User) => void;
  onUpdateCRAMember: (member: CRAMember) => void;
  onUpdateCRAConfig: (config: CRAConfig) => void;
  onDeleteUser: (userId: string) => void;
  onApproveUser: (userId: string) => void;
  currentUser: User | null;
}

// Reusable Pagination Component
interface PaginationControlsProps {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    const handlePrev = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems);

    return (
        <div className="flex items-center justify-between mt-4 text-xs">
            <span className="font-medium text-slate-500">
                A mostrar <span className="font-bold text-slate-700">{startIndex}</span>-<span className="font-bold text-slate-700">{endIndex}</span> de <span className="font-bold text-slate-700">{totalItems}</span>
            </span>
            <div className="inline-flex items-center gap-1">
                <button 
                    onClick={handlePrev} 
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Página Anterior"
                >
                    <ChevronLeftIcon />
                </button>
                 <span className="text-slate-500 font-semibold">
                    {currentPage} / {totalPages}
                </span>
                <button 
                    onClick={handleNext} 
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Próxima Página"
                >
                    <ChevronRightIcon />
                </button>
            </div>
        </div>
    );
};


const AdminPanel: React.FC<AdminPanelProps> = ({ competitions, users, craMembers, craConfig, onUpdateUser, onUpdateCRAMember, onUpdateCRAConfig, onDeleteUser, onApproveUser, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'competitions' | 'users' | 'cra' | 'statistics'>('competitions');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [statsSelectedYear, setStatsSelectedYear] = useState<string>('all');

  const [competitionsPage, setCompetitionsPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<User | null>(null);

  const [editingCraId, setEditingCraId] = useState<string | null>(null);
  const [craFormData, setCraFormData] = useState<CRAMember | null>(null);

  const [editingGlobalConfig, setEditingGlobalConfig] = useState(false);
  const [globalConfigData, setGlobalConfigData] = useState<CRAConfig>(craConfig);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    setCompetitionsPage(1);
  }, [selectedYear]);

  const handleEditUser = (user: User) => {
    setEditingUserId(user.id);
    setEditFormData({ ...user });
  };

  const handleCancelUserEdit = () => {
    setEditingUserId(null);
    setEditFormData(null);
  };

  const handleSaveUserEdit = () => {
    if (editFormData) {
      onUpdateUser(editFormData);
    }
    setEditingUserId(null);
    setEditFormData(null);
  };

  const handleEditCra = (member: CRAMember) => {
    setEditingCraId(member.id);
    setCraFormData({ ...member });
    setEditingGlobalConfig(false);
  };

  const handleCancelCraEdit = () => {
    setEditingCraId(null);
    setCraFormData(null);
  };

  const handleSaveCraEdit = () => {
    if (craFormData) {
      onUpdateCRAMember(craFormData);
    }
    setEditingCraId(null);
    setCraFormData(null);
  };

  const handleSaveGlobalConfig = () => {
    onUpdateCRAConfig(globalConfigData);
    setEditingGlobalConfig(false);
  };

  const handleCraPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !craFormData) return;
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCraFormData({
          ...craFormData,
          photoUrl: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDelete = () => {
    if (userToDelete) {
      onDeleteUser(userToDelete.id);
    }
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const competitionYears = useMemo(() => {
    if (!competitions) return ['all'];
    const years = new Set<string>(competitions.map(c => new Date(c.date).getFullYear().toString()));
    return ['all', ...Array.from(years).sort((a: string, b: string) => parseInt(b) - parseInt(a))];
  }, [competitions]);

  const filteredCompetitions = useMemo(() => {
    if (selectedYear === 'all' || !competitions) {
      return competitions || [];
    }
    return competitions.filter(c => new Date(c.date).getFullYear().toString() === selectedYear);
  }, [competitions, selectedYear]);

  const paginatedCompetitions = useMemo(() => {
      const startIndex = (competitionsPage - 1) * ITEMS_PER_PAGE;
      return filteredCompetitions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCompetitions, competitionsPage]);

  const paginatedUsers = useMemo(() => {
      const startIndex = (usersPage - 1) * ITEMS_PER_PAGE;
      return (users || []).slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [users, usersPage]);
  
  const statisticsData = useMemo(() => {
    if (!competitions || !users) return [];

    const seasons = [...new Set<string>(competitions.map(c => new Date(c.date).getFullYear().toString()))].sort((a: string, b: string) => parseInt(b) - parseInt(a));
    const referees = users.filter(u => u.role === 'Árbitro');

    return referees.map(referee => {
      const seasonalStats = seasons.map(season => {
        const compsInSeason = competitions.filter(c => new Date(c.date).getFullYear().toString() === season);
        if (compsInSeason.length === 0) {
          return { season, percentage: 0, attended: 0, total: 0 };
        }

        const attendedComps = compsInSeason.filter(c =>
          c.rsvps.some(rsvp => rsvp.userId === referee.id && rsvp.status === RSVPStatus.ATTENDING)
        ).length;

        const percentage = Math.round((attendedComps / compsInSeason.length) * 100);

        return {
          season,
          percentage,
          attended: attendedComps,
          total: compsInSeason.length,
        };
      });

      return {
        refereeId: referee.id,
        refereeName: referee.name,
        seasonalStats,
      };
    });
  }, [competitions, users]);
  
  const filteredStatisticsData = useMemo(() => {
      if (statsSelectedYear === 'all') {
          return statisticsData;
      }
      return statisticsData.map(refereeStats => ({
          ...refereeStats,
          seasonalStats: refereeStats.seasonalStats.filter(s => s.season === statsSelectedYear)
      })).filter(ref => ref.seasonalStats.length > 0);
  }, [statisticsData, statsSelectedYear]);


  const exportToCsv = (filename: string, data: any[]) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.map(h => h.toUpperCase()).join(','),
      ...data.map(row => headers.map(header => {
        const val = row[header] === null || row[header] === undefined ? '' : String(row[header]);
        return `"${val.replace(/"/g, '""')}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToPdf = (title: string, headers: string[], keys: string[], data: any[]) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let tableContent = '';
    data.forEach(row => {
        tableContent += '<tr>';
        keys.forEach(key => {
            tableContent += `<td>${row[key] || ''}</td>`;
        });
        tableContent += '</tr>';
    });

    printWindow.document.write(`
        <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: sans-serif; padding: 20px; color: #333; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 12px 8px; text-align: left; font-size: 12px; }
                    th { background-color: #f8fafc; font-weight: bold; text-transform: uppercase; color: #64748b; }
                    h1 { text-align: center; font-family: 'Outfit', sans-serif; color: #1e293b; }
                    .footer { margin-top: 30px; font-size: 10px; color: #94a3b8; text-align: right; }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                <table>
                    <thead>
                        <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
                    </thead>
                    <tbody>
                        ${tableContent}
                    </tbody>
                </table>
                <div class="footer">Gerado em: ${new Date().toLocaleString('pt-PT')}</div>
            </body>
        </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
    }, 500);
  };
  
  const handleExportCompetitions = (format: 'csv' | 'pdf') => {
    const dataToExport = filteredCompetitions.map(c => ({
        nome: c.name,
        local: c.location,
        data: new Date(c.date).toLocaleDateString('pt-PT'),
        responsavel: c.craResponsible,
        pago: c.isPaid ? 'Sim' : 'Não'
    }));

    const headers = ['Nome', 'Local', 'Data', 'Responsável CRA', 'Pago'];
    const keys = ['nome', 'local', 'data', 'responsavel', 'pago'];
    
    if (format === 'csv') {
        exportToCsv('competicoes.csv', dataToExport);
    } else {
        exportToPdf('Lista de Competições', headers, keys, dataToExport);
    }
  };

  const handleExportUsers = (format: 'csv' | 'pdf') => {
    const dataToExport = users.map(u => ({
        nome: u.name,
        email: u.email,
        funcao: u.role,
        estado: u.status
    }));

    const headers = ['Nome', 'Email', 'Função', 'Estado'];
    const keys = ['nome', 'email', 'funcao', 'estado'];

    if (format === 'csv') {
        exportToCsv('utilizadores.csv', dataToExport);
    } else {
        exportToPdf('Lista de Árbitros', headers, keys, dataToExport);
    }
  };


  return (
    <>
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 animate-in fade-in">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-slate-100 rounded-2xl text-slate-600">
              <ShieldIcon />
          </div>
          <div>
              <h2 className="text-3xl font-bold text-slate-900 font-outfit">Painel de Administração</h2>
              <p className="text-slate-500">Gestão de competições, oficiais e membros do conselho.</p>
          </div>
        </div>

        <div className="border-b border-slate-200 mb-6">
          <nav className="flex gap-4 -mb-px">
            <button 
              onClick={() => setActiveTab('competitions')}
              className={`py-4 px-1 border-b-2 text-sm font-bold transition-colors ${activeTab === 'competitions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
            >
              Gestão de Competições
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 text-sm font-bold transition-colors ${activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
            >
              Gestão de Árbitros
            </button>
            <button 
              onClick={() => setActiveTab('cra')}
              className={`py-4 px-1 border-b-2 text-sm font-bold transition-colors ${activeTab === 'cra' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
            >
              Gestão CRA
            </button>
            <button 
              onClick={() => setActiveTab('statistics')}
              className={`py-4 px-1 border-b-2 text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === 'statistics' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
            >
              <TrendingUpIcon /> Estatísticas
            </button>
          </nav>
        </div>

        <div>
          {activeTab === 'competitions' && (
            <div className="animate-in fade-in-5">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => handleExportCompetitions('csv')} className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"><DownloadIcon /> Exportar CSV</button>
                  <button onClick={() => handleExportCompetitions('pdf')} className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"><DownloadIcon /> Exportar PDF</button>
                </div>
                <select 
                  value={selectedYear} 
                  onChange={e => setSelectedYear(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {competitionYears.map(year => (
                    <option key={year} value={year}>{year === 'all' ? 'Todos os Anos' : year}</option>
                  ))}
                </select>
              </div>
              <div className="overflow-x-auto rounded-2xl border">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="py-3.5 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nome da Prova</th>
                      <th scope="col" className="py-3.5 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Local</th>
                      <th scope="col" className="py-3.5 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Responsável CRA</th>
                      <th scope="col" className="py-3.5 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Data</th>
                      <th scope="col" className="py-3.5 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Pagamento</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {paginatedCompetitions.length > 0 ? paginatedCompetitions.map(comp => (
                      <tr key={comp.id}>
                        <td className="whitespace-nowrap py-4 px-4 text-sm font-medium text-slate-800">{comp.name}</td>
                        <td className="whitespace-nowrap py-4 px-4 text-sm text-slate-500">{comp.location}</td>
                        <td className="whitespace-nowrap py-4 px-4 text-sm text-slate-500 font-medium text-blue-600">{comp.craResponsible}</td>
                        <td className="whitespace-nowrap py-4 px-4 text-sm text-slate-500">{new Date(comp.date).toLocaleDateString('pt-PT')}</td>
                        <td className="whitespace-nowrap py-4 px-4 text-sm">
                          <span className={`px-2 inline-flex text-[10px] leading-5 font-semibold rounded-full ${comp.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {comp.isPaid ? 'Pago' : 'Pendente'}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-sm text-slate-400">Nenhuma competição encontrada para o ano selecionado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
               <PaginationControls
                  totalItems={filteredCompetitions.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  currentPage={competitionsPage}
                  onPageChange={setCompetitionsPage}
              />
            </div>
          )}

          {activeTab === 'users' && (
            <div className="animate-in fade-in-5">
               <div className="flex justify-start mb-4">
                   <div className="flex items-center gap-2">
                      <button onClick={() => handleExportUsers('csv')} className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"><DownloadIcon /> Exportar CSV</button>
                      <button onClick={() => handleExportUsers('pdf')} className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"><DownloadIcon /> Exportar PDF</button>
                  </div>
              </div>
              <div className="overflow-x-auto rounded-2xl border">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="py-3.5 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nome do Árbitro</th>
                      <th scope="col" className="py-3.5 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                      <th scope="col" className="py-3.5 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Função</th>
                      <th scope="col" className="py-3.5 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Estado</th>
                      <th scope="col" className="py-3.5 px-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {(paginatedUsers || []).length > 0 ? paginatedUsers.map(user => (
                      <tr key={user.id} className="h-[65px]">
                        {editingUserId === user.id && editFormData ? (
                          <>
                            <td className="whitespace-nowrap py-2 px-4">
                              <input type="text" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                            </td>
                            <td className="whitespace-nowrap py-2 px-4">
                              <input type="email" value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                            </td>
                            <td className="whitespace-nowrap py-2 px-4">
                              <select value={editFormData.role} onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as UserRole })} className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="Administrador">Administrador</option>
                                <option value="Árbitro">Árbitro</option>
                              </select>
                            </td>
                            <td className="whitespace-nowrap py-4 px-4 text-sm">{/* Status column empty in edit mode */}</td>
                            <td className="whitespace-nowrap py-2 px-4 text-sm space-x-4">
                              <button onClick={handleSaveUserEdit} className="font-semibold text-blue-600 hover:text-blue-800 transition-colors">Guardar</button>
                              <button onClick={handleCancelUserEdit} className="font-semibold text-slate-500 hover:text-slate-700 transition-colors">Cancelar</button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="whitespace-nowrap py-4 px-4 text-sm font-medium text-slate-800">{user.name}</td>
                            <td className="whitespace-nowrap py-4 px-4 text-sm text-slate-500">{user.email}</td>
                            <td className="whitespace-nowrap py-4 px-4 text-sm text-slate-500">{user.role}</td>
                            <td className="whitespace-nowrap py-4 px-4 text-sm">
                                <span className={`px-2 inline-flex text-[10px] leading-5 font-semibold rounded-full ${user.status === UserStatus.APPROVED ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                  {user.status}
                                </span>
                            </td>
                            <td className="whitespace-nowrap py-4 px-4 text-sm">
                                <div className="flex items-center gap-4">
                                  {user.status === UserStatus.PENDING ? (
                                    <button onClick={() => onApproveUser(user.id)} className="font-semibold text-emerald-600 hover:text-emerald-800 transition-colors flex items-center gap-2">
                                      <CheckCircleIcon /> Aprovar
                                    </button>
                                  ) : (
                                    <button onClick={() => handleEditUser(user)} className="font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2">
                                      <EditIcon /> Editar
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => openDeleteModal(user)} 
                                    className="font-semibold text-rose-600 hover:text-rose-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={user.id === currentUser?.id}
                                    title={user.id === currentUser?.id ? "Não pode remover a sua própria conta" : "Remover utilizador"}
                                  >
                                    <TrashIcon /> Remover
                                  </button>
                                </div>
                            </td>
                          </>
                        )}
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-sm text-slate-400">Nenhum utilizador encontrado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
               <PaginationControls
                  totalItems={users.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  currentPage={usersPage}
                  onPageChange={setUsersPage}
              />
            </div>
          )}

          {activeTab === 'cra' && (
            <div className="animate-in fade-in-5 space-y-10">
                {/* Gestão de Membros Individuais */}
                <div className="space-y-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Membros do Conselho</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {craMembers.map(member => (
                            <div key={member.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-blue-600 mb-4 shadow-sm overflow-hidden border border-slate-200">
                                    {member.photoUrl ? (
                                        <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon />
                                    )}
                                </div>
                                <h3 className="font-bold text-slate-800">{member.name}</h3>
                                <p className="text-xs text-slate-500 mb-4">{member.role}</p>
                                <button onClick={() => handleEditCra(member)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all">
                                    <EditIcon /> Editar Dados
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {editingCraId && craFormData && (
                    <div className="p-8 bg-blue-50/50 rounded-3xl border border-blue-100 animate-in slide-in-from-top-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Editar Membro: {craFormData.name}</h3>
                            <button onClick={handleCancelCraEdit} className="text-slate-400 hover:text-slate-600"><XIcon /></button>
                        </div>
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nome Completo</label>
                                    <input 
                                        type="text" 
                                        value={craFormData.name} 
                                        onChange={e => setCraFormData({...craFormData, name: e.target.value})}
                                        className="w-full p-4 bg-white border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email</label>
                                    <input 
                                        type="email" 
                                        value={craFormData.email} 
                                        onChange={e => setCraFormData({...craFormData, email: e.target.value})}
                                        className="w-full p-4 bg-white border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Telefone</label>
                                    <input 
                                        type="text" 
                                        value={craFormData.phone} 
                                        onChange={e => setCraFormData({...craFormData, phone: e.target.value})}
                                        className="w-full p-4 bg-white border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fotografia</label>
                                    <div className="flex items-center gap-4">
                                        <input 
                                            type="file" 
                                            id="craPhotoUpload" 
                                            className="hidden" 
                                            accept="image/*"
                                            onChange={handleCraPhotoUpload}
                                        />
                                        <label htmlFor="craPhotoUpload" className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-xs cursor-pointer hover:bg-slate-50 transition-all shadow-sm">
                                            <CameraIcon />
                                            <span>Fazer Upload da Foto</span>
                                        </label>
                                        {craFormData.photoUrl && (
                                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200">
                                                <img src={craFormData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={handleCancelCraEdit} className="px-6 py-3 bg-white text-slate-500 rounded-2xl font-bold text-sm border border-slate-200 hover:bg-slate-100 transition-colors">Cancelar</button>
                                <button type="button" onClick={handleSaveCraEdit} className="px-10 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-colors">Guardar Alterações</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* E-mails Institucionais Globais */}
                <div className="space-y-6 pt-6 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">E-mails Institucionais</h3>
                        {!editingGlobalConfig && (
                            <button onClick={() => { setEditingGlobalConfig(true); setEditingCraId(null); }} className="text-xs font-bold text-blue-600 hover:underline">Editar E-mails Globais</button>
                        )}
                    </div>
                    
                    {editingGlobalConfig ? (
                        <div className="p-8 bg-emerald-50/50 rounded-3xl border border-emerald-100 animate-in slide-in-from-top-4">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-900">Editar E-mails Institucionais</h3>
                                <button onClick={() => setEditingGlobalConfig(false)} className="text-slate-400 hover:text-slate-600"><XIcon /></button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Associação de Natação do Alentejo</label>
                                    <input 
                                        type="email" 
                                        value={globalConfigData.technicalEmail} 
                                        onChange={e => setGlobalConfigData({...globalConfigData, technicalEmail: e.target.value})}
                                        className="w-full p-4 bg-white border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Conselho Regional de Arbitragem</label>
                                    <input 
                                        type="email" 
                                        value={globalConfigData.administrativeEmail} 
                                        onChange={e => setGlobalConfigData({...globalConfigData, administrativeEmail: e.target.value})}
                                        className="w-full p-4 bg-white border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-6">
                                <button type="button" onClick={() => setEditingGlobalConfig(false)} className="px-6 py-3 bg-white text-slate-500 rounded-2xl font-bold text-sm border border-slate-200 hover:bg-slate-100 transition-colors">Cancelar</button>
                                <button type="button" onClick={handleSaveGlobalConfig} className="px-10 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-colors">Guardar E-mails</button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Associação de Natação do Alentejo</p>
                                    <p className="text-sm font-bold text-slate-700">{craConfig.technicalEmail}</p>
                                </div>
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><MailIcon /></div>
                            </div>
                            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conselho Regional de Arbitragem</p>
                                    <p className="text-sm font-bold text-slate-700">{craConfig.administrativeEmail}</p>
                                </div>
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><MailIcon /></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="animate-in fade-in-5">
              <div className="flex justify-end mb-4">
                <select 
                  value={statsSelectedYear} 
                  onChange={e => setStatsSelectedYear(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {competitionYears.map(year => (
                    <option key={year} value={year}>{year === 'all' ? 'Todas as Épocas' : `Época ${year}`}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredStatisticsData.map(stat => (
                      <div key={stat.refereeId} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6">
                          <h3 className="font-bold text-slate-800 mb-4">{stat.refereeName}</h3>
                          <div className="space-y-4">
                              {stat.seasonalStats.map(seasonStat => (
                                  <div key={seasonStat.season}>
                                      <div className="flex justify-between items-center text-xs mb-1">
                                          <span className="font-bold text-slate-600">Época {seasonStat.season}</span>
                                          <span className="text-slate-500">{seasonStat.attended} / {seasonStat.total} provas</span>
                                      </div>
                                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                                          <div 
                                              className="bg-blue-600 h-2.5 rounded-full" 
                                              style={{ width: `${seasonStat.percentage}%` }}
                                              title={`${seasonStat.percentage}% de participação`}
                                          ></div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className="p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <TrashIcon />
              </div>
              <h2 className="text-2xl font-bold font-outfit mt-4 text-slate-900">Remover Utilizador</h2>
              <p className="text-sm text-slate-500 mt-2">Tem a certeza que quer remover a conta de <span className="font-bold">{userToDelete.name}</span>? Esta ação não pode ser revertida.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 p-6 bg-slate-50">
              <button onClick={() => setIsDeleteModalOpen(false)} className="py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-colors">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="py-3 bg-rose-600 text-white rounded-2xl font-bold text-sm hover:bg-rose-700 transition-colors">
                Confirmar Remoção
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPanel;
