
import React from 'react';
import { User, Competition, Notification, RSVPStatus } from '../types';
import { AwardIcon, CalendarIcon, CheckCircleIcon, ClipboardListIcon, BellIcon, MapPinIcon } from './Icons';

interface DashboardProps {
    currentUser: User;
    competitions: Competition[];
    notifications: Notification[];
    onNavigateToCompetition: (competitionId: string) => void;
}

const NotificationIcon: React.FC<{ category?: string }> = ({ category }) => {
    switch (category) {
        case 'newCompetition': return <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600"><CalendarIcon /></div>;
        case 'rsvpChange': return <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600"><CheckCircleIcon /></div>;
        case 'paymentUpdate': return <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600"><BellIcon /></div>;
        default: return <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 text-slate-500"><BellIcon /></div>;
    }
};

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    let interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)}d atrás`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)}h atrás`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)}m atrás`;
    return 'Agora';
};

const Dashboard: React.FC<DashboardProps> = ({ currentUser, competitions, notifications, onNavigateToCompetition }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingConfirmed = competitions
        .filter(c => new Date(c.date) >= today && c.rsvps.some(r => r.userId === currentUser.id && r.status === RSVPStatus.ATTENDING))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);
        
    const pendingInvitations = competitions
        .filter(c => new Date(c.date) >= today && !c.rsvps.some(r => r.userId === currentUser.id))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const recentNotifications = notifications.slice(0, 2);

    const attendedThisYear = competitions.filter(c => 
        new Date(c.date).getFullYear() === today.getFullYear() &&
        c.rsvps.some(r => r.userId === currentUser.id && r.status === RSVPStatus.ATTENDING)
    ).length;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 font-outfit">Bem-vindo de volta, {currentUser.name.split(' ')[0]}!</h1>
                <p className="text-slate-500">Este é o seu resumo de atividade e próximas tarefas.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><AwardIcon /></div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">{attendedThisYear}</p>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Competições este Ano</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircleIcon /></div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">{upcomingConfirmed.length}</p>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Competições Confirmadas</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><ClipboardListIcon /></div>
                    <div>
                        <p className="text-2xl font-bold text-slate-800">{pendingInvitations.length}</p>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Convites Pendentes</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Próximas Competições Confirmadas</h3>
                    <div className="space-y-4">
                        {upcomingConfirmed.length > 0 ? upcomingConfirmed.map(comp => (
                            <button key={comp.id} onClick={() => onNavigateToCompetition(comp.id)} className="w-full text-left p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all group">
                                <p className="font-bold text-sm text-slate-800">{comp.name}</p>
                                <div className="flex items-center gap-4 text-[10px] text-slate-400 font-medium mt-1">
                                    <span className="flex items-center gap-1.5"><CalendarIcon /> {new Date(comp.date).toLocaleDateString('pt-PT')}</span>
                                    <span className="flex items-center gap-1.5"><MapPinIcon /> {comp.location}</span>
                                </div>
                            </button>
                        )) : (
                            <div className="text-center py-10">
                                <p className="text-sm text-slate-500">Não tem competições futuras confirmadas.</p>
                                <p className="text-xs text-slate-400 mt-1">Consulte os seus convites pendentes.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Atividade Recente</h3>
                        <div className="space-y-4">
                            {recentNotifications.length > 0 ? recentNotifications.map(n => (
                                <div key={n.id} className="flex items-start gap-3">
                                    <NotificationIcon category={n.category} />
                                    <div>
                                        <p className="text-xs font-bold text-slate-700 leading-tight">{n.title}</p>
                                        <p className="text-xs text-slate-500">{formatTimeAgo(n.timestamp)}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-xs text-center text-slate-400 py-4">Não há atividade recente.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Convites Pendentes</h3>
                 <div className="space-y-3">
                    {pendingInvitations.length > 0 ? pendingInvitations.map(comp => (
                        <button key={comp.id} onClick={() => onNavigateToCompetition(comp.id)} className="w-full text-left flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-all shadow-sm">
                            <div>
                                <p className="font-bold text-sm text-slate-800">{comp.name}</p>
                                <p className="text-[10px] text-slate-400 font-medium">{comp.location}</p>
                            </div>
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">Ver Detalhes</span>
                        </button>
                    )) : (
                         <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl">
                            <p className="text-sm font-bold text-emerald-600">Está tudo em dia!</p>
                            <p className="text-xs text-slate-400 mt-1">Não existem convites pendentes de resposta.</p>
                        </div>
                    )}
                 </div>
            </div>
        </div>
    );
};

export default Dashboard;
