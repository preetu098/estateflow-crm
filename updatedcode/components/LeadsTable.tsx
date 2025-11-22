
import React, { useState } from 'react';
import { Lead, LeadStage, LeadSource, Project, Agent } from '../types';
import { STAGE_COLORS } from '../constants';
import { Phone, Search, Filter, Calendar, Edit2, Trash2, ChevronDown, MessageSquare, Smartphone, User, Upload, Lock } from 'lucide-react';
import CommunicationModal from './CommunicationModal';

interface LeadsTableProps {
  leads: Lead[];
  projects: Project[];
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onAddLead: (lead: Lead) => void; 
  currentUser: Agent;
  onOpenImportWizard: () => void; // New Prop
}

const LeadsTable: React.FC<LeadsTableProps> = ({ leads, projects, onEdit, onDelete, onAddLead, currentUser, onOpenImportWizard }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState<string>('All');
  const [filterProject, setFilterProject] = useState<string>('All');
  
  const [commModal, setCommModal] = useState<{ isOpen: boolean; type: 'whatsapp'|'sms'; lead: Lead|null }>({
    isOpen: false, type: 'whatsapp', lead: null
  });

  // Permission Check
  const canDelete = currentUser.role === 'SuperAdmin' || currentUser.role === 'TeamLeader';

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      lead.mobile.includes(searchTerm) ||
      lead.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStage = filterStage === 'All' || lead.stage === filterStage;
    const matchesProject = filterProject === 'All' || lead.project === filterProject;

    return matchesSearch && matchesStage && matchesProject;
  });

  const handleCommClick = (lead: Lead, type: 'whatsapp'|'sms') => {
    setCommModal({ isOpen: true, type, lead });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full animate-fade-in">
      
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search by name, mobile, ID..." 
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative">
             <select 
               className="appearance-none pl-4 pr-10 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
               value={filterProject}
               onChange={(e) => setFilterProject(e.target.value)}
             >
               <option value="All">All Projects</option>
               {projects.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
             </select>
             <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>

          <div className="relative">
             <select 
               className="appearance-none pl-4 pr-10 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
               value={filterStage}
               onChange={(e) => setFilterStage(e.target.value)}
             >
               <option value="All">All Stages</option>
               {Object.values(LeadStage).map(s => <option key={s} value={s}>{s}</option>)}
             </select>
             <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>

          <button 
             onClick={onOpenImportWizard}
             className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition border border-slate-200"
          >
              <Upload className="w-4 h-4" /> Import CSV
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div className="overflow-auto flex-1">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 whitespace-nowrap">ID / Date</th>
              <th className="px-6 py-3">Prospect</th>
              <th className="px-6 py-3">Project / Source</th>
              <th className="px-6 py-3">Stage</th>
              <th className="px-6 py-3">Assigned To</th>
              <th className="px-6 py-3">Follow-up</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLeads.map(lead => (
              <tr key={lead.id} className="hover:bg-slate-50 transition group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-mono text-xs text-slate-500">{lead.id}</div>
                  <div className="text-xs text-slate-400 mt-1">{new Date(lead.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{lead.name}</div>
                  <div className="flex items-center text-xs text-slate-500 mt-1">
                    <Phone className="w-3 h-3 mr-1" /> {lead.mobile}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-slate-800">{lead.project}</div>
                  <div className="text-xs text-slate-500 bg-slate-100 inline-block px-2 py-0.5 rounded mt-1">{lead.source}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border border-transparent ${STAGE_COLORS[lead.stage] || 'bg-gray-100 text-gray-800'}`}>
                    {lead.stage}
                  </span>
                   {lead.aiScore !== undefined && (
                     <div className="mt-1 text-xs font-semibold text-purple-600 flex items-center gap-1">
                       AI Score: {lead.aiScore}
                     </div>
                  )}
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs">
                            <User className="w-3 h-3" />
                        </div>
                        <span className="text-slate-700 font-medium text-xs">{lead.agentName || 'Unassigned'}</span>
                    </div>
                </td>
                <td className="px-6 py-4">
                  {lead.followUpDate ? (
                    <div className={`flex items-center ${new Date(lead.followUpDate) < new Date() && lead.stage !== LeadStage.LOST && lead.stage !== LeadStage.BOOKED ? 'text-red-500 font-medium' : 'text-slate-600'}`}>
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      {new Date(lead.followUpDate).toLocaleDateString()} <span className="text-xs ml-1 opacity-70">{lead.followUpTime}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-xs">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleCommClick(lead, 'whatsapp')}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded transition"
                      title="WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleCommClick(lead, 'sms')}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition"
                      title="SMS"
                    >
                      <Smartphone className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-slate-300 mx-1 my-auto"></div>
                    
                    <button 
                      onClick={() => onEdit(lead)} 
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                      title="Edit Lead"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    
                    {canDelete ? (
                        <button 
                        onClick={() => onDelete(lead.id)} 
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                        title="Delete Lead"
                        >
                        <Trash2 className="w-4 h-4" />
                        </button>
                    ) : (
                        <button className="p-1.5 text-slate-300 cursor-not-allowed" title="Restricted">
                             <Lock className="w-4 h-4" />
                        </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredLeads.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">
                  <div className="flex flex-col items-center">
                    <Search className="w-8 h-8 mb-2 opacity-20" />
                    No leads found matching criteria.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <CommunicationModal 
        isOpen={commModal.isOpen} 
        onClose={() => setCommModal(prev => ({...prev, isOpen: false}))} 
        lead={commModal.lead}
        type={commModal.type}
      />
    </div>
  );
};

export default LeadsTable;
