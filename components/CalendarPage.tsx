
import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptLocale from '@fullcalendar/core/locales/pt';
import { Competition, User, RSVPStatus } from '../types';
import { GoogleIcon, CalendarDaysIcon, XIcon, MapPinIcon, WavesIcon, ActivityIcon } from './Icons';

interface CalendarPageProps {
  competitions: Competition[];
  currentUser: User;
}

const generateGoogleCalendarUrl = (competition: Competition): string => {
  const baseUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
  
  const title = encodeURIComponent(competition.name);
  
  const startDate = new Date(competition.date);
  startDate.setUTCHours(0,0,0,0);
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

const EventDetailModal: React.FC<{ competition: Competition, onClose: () => void }> = ({ competition, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold font-outfit text-slate-800">
            Detalhes da Competição
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <XIcon />
          </button>
        </div>
        <div className="p-8 overflow-y-auto custom-scrollbar space-y-6">
          <h3 className="text-2xl font-bold text-slate-900 font-outfit">{competition.name}</h3>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-500">
            <span className="flex items-center gap-2"><CalendarDaysIcon /> {new Date(competition.date).toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span className="flex items-center gap-2"><MapPinIcon /> {competition.location}</span>
            <span className="flex items-center gap-2"><ActivityIcon /> {competition.modality}</span>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <p className="text-sm text-slate-600 leading-relaxed italic">"{competition.description || 'Sem notas técnicas adicionais.'}"</p>
          </div>
        </div>
        <div className="p-6 bg-slate-50 border-t mt-auto">
            <button 
                onClick={() => {
                    const url = generateGoogleCalendarUrl(competition);
                    window.open(url, '_blank', 'noopener,noreferrer');
                }}
                className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-colors shadow-sm"
            >
                <GoogleIcon />
                <span>Adicionar ao Google Calendar</span>
            </button>
        </div>
      </div>
    </div>
  );
};


const CalendarPage: React.FC<CalendarPageProps> = ({ competitions, currentUser }) => {
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);

  const events = competitions.map(comp => {
    const userRsvp = comp.rsvps.find(r => r.userId === currentUser.id);
    let color = '#3b82f6'; // Default blue
    if (userRsvp?.status === RSVPStatus.ATTENDING) {
      color = '#10b981'; // Green for attending
    } else if (userRsvp?.status === RSVPStatus.NOT_ATTENDING) {
      color = '#64748b'; // Gray for not attending
    }

    return {
      id: comp.id,
      title: comp.name,
      start: comp.date,
      allDay: true,
      backgroundColor: color,
      borderColor: color,
    };
  });

  const handleEventClick = (clickInfo: any) => {
    const competition = competitions.find(c => c.id === clickInfo.event.id);
    if (competition) {
      setSelectedCompetition(competition);
    }
  };

  return (
    <>
      {selectedCompetition && (
        <EventDetailModal competition={selectedCompetition} onClose={() => setSelectedCompetition(null)} />
      )}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 animate-in fade-in">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-outfit">Calendário de Competições</h1>
            <p className="text-slate-500">Vista geral de todas as competições agendadas.</p>
          </div>
        </div>
        
        <div className="p-2 -mx-2">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            locale={ptLocale}
            height="auto"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek'
            }}
            eventClick={handleEventClick}
            eventDisplay="block"
          />
        </div>
      </div>
    </>
  );
};

export default CalendarPage;