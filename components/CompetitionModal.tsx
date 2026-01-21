
import React, { useState, useEffect } from 'react';
import { Competition, CompetitionModality, RSVPStatus } from '../types';
import { XIcon, CheckCircleIcon } from './Icons';

interface CompetitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (competition: Competition) => void;
  editingCompetition?: Competition | null;
}

const INITIAL_FORM: Omit<Competition, 'id' | 'rsvps' | 'paymentHistory'> = {
  name: '',
  date: new Date().toISOString().split('T')[0],
  location: '',
  description: '',
  level: 'Regional',
  modality: 'Natação Pura',
  isPaid: false,
  craResponsible: ''
};

const CompetitionModal: React.FC<CompetitionModalProps> = ({ isOpen, onClose, onSave, editingCompetition }) => {
  const [formData, setFormData] = useState(INITIAL_FORM);

  useEffect(() => {
    if (editingCompetition) {
      setFormData({
        name: editingCompetition.name,
        date: editingCompetition.date,
        location: editingCompetition.location,
        description: editingCompetition.description,
        level: editingCompetition.level,
        modality: editingCompetition.modality || 'Natação Pura',
        isPaid: editingCompetition.isPaid,
        craResponsible: editingCompetition.craResponsible
      });
    } else {
      setFormData(INITIAL_FORM);
    }
  }, [editingCompetition, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const competitionData: Competition = {
      ...formData,
      id: editingCompetition?.id || `c${Date.now()}`,
      rsvps: editingCompetition?.rsvps || [],
      paymentHistory: editingCompetition?.paymentHistory || [],
      documents: editingCompetition?.documents || []
    };
    onSave(competitionData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold font-outfit text-slate-800">
            {editingCompetition ? 'Editar Competição' : 'Nova Competição'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <XIcon />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Nome da Competição</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Ex: Campeonato Regional de Infantis"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Data</label>
              <input 
                type="date" 
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Localização</label>
              <input 
                type="text" 
                required
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Cidade / Complexo"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Nível</label>
              <select 
                value={formData.level}
                onChange={e => setFormData({...formData, level: e.target.value as any})}
                className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Clube">Clube</option>
                <option value="Regional">Regional</option>
                <option value="Nacional">Nacional</option>
                <option value="Internacional">Internacional</option>
              </select>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Modalidade</label>
                <select 
                    value={formData.modality}
                    onChange={e => setFormData({...formData, modality: e.target.value as CompetitionModality})}
                    className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="Natação Pura">Natação Pura</option>
                    <option value="Águas Abertas">Águas Abertas</option>
                    <option value="Natação Adaptada">Natação Adaptada</option>
                </select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Responsável CRA</label>
              <input 
                type="text" 
                value={formData.craResponsible}
                onChange={e => setFormData({...formData, craResponsible: e.target.value})}
                className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Nome do Juiz Árbitro"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Estado de Pagamento</label>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <input 
                  type="checkbox" 
                  id="isPaid"
                  checked={formData.isPaid}
                  onChange={e => setFormData({...formData, isPaid: e.target.checked})}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isPaid" className="text-sm font-medium text-slate-700">Competição Paga / Verbas Atribuídas</label>
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Descrição / Observações</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full p-4 bg-slate-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]" 
                placeholder="Detalhes adicionais sobre a competição..."
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 border border-slate-200 text-slate-500 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
            >
              {editingCompetition ? 'Guardar Alterações' : 'Criar Competição'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompetitionModal;