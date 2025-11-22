
import React, { useState } from 'react';
import { ConstructionUpdate, Project } from '../types';
import { HardHat, Camera, CheckCircle, Clock, UploadCloud, MapPin } from 'lucide-react';

interface ConstructionModuleProps {
    projects: Project[];
    logs?: ConstructionUpdate[];
    setLogs?: React.Dispatch<React.SetStateAction<ConstructionUpdate[]>>;
}

const ConstructionModule: React.FC<ConstructionModuleProps> = ({ projects, logs = [], setLogs }) => {
  // Fallback if no props passed (legacy support)
  const [localLogs, setLocalLogs] = useState<ConstructionUpdate[]>([]);
  
  // Use props if available, else local state
  const activeLogsList = setLogs ? logs : localLogs;
  const setActiveLogsList = setLogs || setLocalLogs;

  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '');
  const [isUploadMode, setIsUploadMode] = useState(false);

  // Form State
  const [milestoneName, setMilestoneName] = useState('');
  const [towerName, setTowerName] = useState('');
  const [progress, setProgress] = useState(0);

  const handleSubmitUpdate = () => {
      const newLog: ConstructionUpdate = {
          id: `log-${Date.now()}`,
          projectId: selectedProject,
          towerName: towerName,
          milestoneName: milestoneName,
          percentageComplete: progress,
          updateDate: new Date().toISOString().split('T')[0],
          engineerName: 'Site Engineer', // Hardcoded for demo
          status: 'Pending Approval',
          photoUrl: '#'
      };
      setActiveLogsList([newLog, ...activeLogsList]);
      setIsUploadMode(false);
      alert("Update Submitted! Sent to Sales Head for approval.");
  };

  const filteredLogs = activeLogsList.filter(l => l.projectId === selectedProject);

  return (
    <div className="h-full flex bg-slate-50 animate-fade-in">
       {/* Sidebar */}
       <div className="w-72 bg-white border-r border-slate-200 p-6 flex flex-col">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
             <HardHat className="w-6 h-6 text-orange-600" /> Site Engineer
          </h2>
          
          <div className="space-y-2 mb-6">
             <label className="text-xs font-bold text-slate-500 uppercase">Select Project</label>
             <select 
               value={selectedProject}
               onChange={(e) => setSelectedProject(e.target.value)}
               className="w-full p-3 border border-slate-300 rounded-lg font-medium outline-none focus:border-orange-500"
             >
               {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
             </select>
          </div>

          <button 
            onClick={() => setIsUploadMode(true)}
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
          >
             <Camera className="w-5 h-5" /> Update Progress
          </button>

          <div className="mt-auto bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600">
             <p className="font-bold mb-1">Notice:</p>
             <p>Updates submitted here trigger "Demand Letters" in the Post-Sales module automatically upon approval.</p>
          </div>
       </div>

       {/* Main Content */}
       <div className="flex-1 p-8 overflow-y-auto">
           {isUploadMode ? (
               <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                   <h3 className="text-2xl font-bold text-slate-800 mb-6">New Site Progress Update</h3>
                   
                   <div className="space-y-6">
                       <div className="grid grid-cols-2 gap-6">
                           <div>
                               <label className="block text-sm font-bold text-slate-700 mb-2">Tower / Wing</label>
                               <select value={towerName} onChange={(e) => setTowerName(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg bg-white">
                                   <option value="">Select Tower</option>
                                   <option value="Wing A">Wing A</option>
                                   <option value="Wing B">Wing B</option>
                                   <option value="Clubhouse">Clubhouse</option>
                               </select>
                           </div>
                           <div>
                               <label className="block text-sm font-bold text-slate-700 mb-2">Milestone Reached</label>
                               <select value={milestoneName} onChange={(e) => setMilestoneName(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg bg-white">
                                   <option value="">Select Milestone</option>
                                   <option value="Plinth Level">Plinth Level</option>
                                   <option value="1st Slab">1st Slab</option>
                                   <option value="5th Slab">5th Slab</option>
                                   <option value="Terrace Slab">Terrace Slab</option>
                                   <option value="Brickwork">Brickwork</option>
                               </select>
                           </div>
                       </div>

                       <div>
                           <label className="block text-sm font-bold text-slate-700 mb-2">Completion Percentage (Cumulative)</label>
                           <input 
                             type="range" 
                             min="0" max="100" step="5"
                             value={progress}
                             onChange={(e) => setProgress(Number(e.target.value))}
                             className="w-full accent-orange-600"
                           />
                           <div className="text-right font-bold text-orange-600">{progress}%</div>
                       </div>

                       <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer transition">
                           <UploadCloud className="w-10 h-10 mb-2" />
                           <p className="font-medium">Click to upload site photos</p>
                           <p className="text-xs">JPG, PNG accepted</p>
                       </div>

                       <div className="flex gap-4 pt-4">
                           <button onClick={() => setIsUploadMode(false)} className="flex-1 py-3 border border-slate-300 text-slate-600 font-bold rounded-xl hover:bg-slate-50">Cancel</button>
                           <button onClick={handleSubmitUpdate} className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800">Submit Report</button>
                       </div>
                   </div>
               </div>
           ) : (
               <div>
                   <h3 className="text-xl font-bold text-slate-800 mb-6">Project Timeline & Logs</h3>
                   <div className="space-y-4">
                       {filteredLogs.map(log => (
                           <div key={log.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-6">
                               <div className="flex flex-col items-center min-w-[80px]">
                                   <span className="text-xs font-bold text-slate-400 uppercase mb-1">{log.updateDate}</span>
                                   <div className={`p-2 rounded-full ${log.status === 'Approved' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                       {log.status === 'Approved' ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                                   </div>
                               </div>
                               
                               <div className="flex-1">
                                   <h4 className="font-bold text-slate-800 text-lg">{log.milestoneName} <span className="text-slate-400 font-normal mx-2">|</span> {log.towerName}</h4>
                                   <div className="w-full bg-slate-100 rounded-full h-2 mt-2 mb-1 overflow-hidden">
                                       <div className="bg-green-500 h-full rounded-full" style={{ width: `${log.percentageComplete}%` }}></div>
                                   </div>
                                   <p className="text-xs text-slate-500">Progress: {log.percentageComplete}% • Engineer: {log.engineerName}</p>
                               </div>

                               <div>
                                   <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                       log.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                                   }`}>
                                       {log.status}
                                   </span>
                               </div>
                           </div>
                       ))}
                       
                       {filteredLogs.length === 0 && (
                           <div className="text-center py-12 text-slate-400">
                               <MapPin className="w-12 h-12 mx-auto mb-4 opacity-20" />
                               <p>No updates logged for this project yet.</p>
                           </div>
                       )}
                   </div>
               </div>
           )}
       </div>
    </div>
  );
};

export default ConstructionModule;
