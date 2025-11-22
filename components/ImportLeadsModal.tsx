
import React, { useState } from 'react';
import { Lead, LeadSource, LeadStage, Project, CsvMapping } from '../types';
import { X, UploadCloud, ArrowRight, CheckCircle, AlertTriangle, FileSpreadsheet } from 'lucide-react';

interface ImportLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (leads: Lead[]) => void;
  projects: Project[];
  existingLeads: Lead[];
}

const ImportLeadsModal: React.FC<ImportLeadsModalProps> = ({ isOpen, onClose, onImport, projects, existingLeads }) => {
  const [step, setStep] = useState<'upload' | 'map' | 'review'>('upload');
  const [rawCsv, setRawCsv] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [importSummary, setImportSummary] = useState({ valid: 0, duplicates: 0, total: 0 });
  const [previewLeads, setPreviewLeads] = useState<Lead[]>([]);

  const availableFields = [
      { value: 'name', label: 'Full Name' },
      { value: 'mobile', label: 'Mobile Number' },
      { value: 'email', label: 'Email Address' },
      { value: 'project', label: 'Interested Project' },
      { value: 'source', label: 'Lead Source' },
      { value: 'skip', label: 'Skip Column' }
  ];

  const handleParse = () => {
      if (!rawCsv.trim()) return;
      const rows = rawCsv.trim().split('\n').map(row => row.split(',').map(c => c.trim()));
      if (rows.length < 2) {
          alert("Invalid CSV. Need at least header + 1 row.");
          return;
      }
      const headerRow = rows[0];
      setHeaders(headerRow);
      setParsedRows(rows.slice(1));
      
      // Auto-guess mappings
      const initialMap: Record<string, string> = {};
      headerRow.forEach((h, idx) => {
          const lowerH = h.toLowerCase();
          if (lowerH.includes('name')) initialMap[idx] = 'name';
          else if (lowerH.includes('mobile') || lowerH.includes('phone') || lowerH.includes('contact')) initialMap[idx] = 'mobile';
          else if (lowerH.includes('email')) initialMap[idx] = 'email';
          else if (lowerH.includes('project')) initialMap[idx] = 'project';
          else if (lowerH.includes('source')) initialMap[idx] = 'source';
          else initialMap[idx] = 'skip';
      });
      setMappings(initialMap);
      setStep('map');
  };

  const normalizeMobile = (raw: string) => {
      if (!raw) return '';
      return raw.replace(/\D/g, '').slice(-10); // Keep only last 10 digits
  };

  const normalizeName = (raw: string) => {
      if (!raw) return 'Unknown';
      return raw.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()); // Title Case
  };

  const handleProcess = () => {
      const leadsToImport: Lead[] = [];
      let duplicates = 0;
      
      // Identify index for each field
      const fieldIndices: Record<string, number> = {};
      Object.entries(mappings).forEach(([idx, field]) => {
          if (field !== 'skip') fieldIndices[field] = Number(idx);
      });

      const nameIdx = fieldIndices['name'];
      const mobileIdx = fieldIndices['mobile'];
      const emailIdx = fieldIndices['email'];
      const projectIdx = fieldIndices['project'];
      const sourceIdx = fieldIndices['source'];

      if (nameIdx === undefined || mobileIdx === undefined) {
          alert("Mapping Error: Name and Mobile are required fields.");
          return;
      }

      parsedRows.forEach(row => {
          if (row.length < headers.length) return; // Skip malformed rows

          // Robust index access check: check if index is valid number AND row has that index
          const rawMobile = (mobileIdx !== undefined && row[mobileIdx] !== undefined) ? row[mobileIdx] : '';
          const mobile = normalizeMobile(rawMobile);
          
          // Duplicate Check
          if (existingLeads.some(l => l.mobile === mobile) || leadsToImport.some(l => l.mobile === mobile)) {
              duplicates++;
              return;
          }

          if (mobile.length !== 10) return; // Invalid mobile

          const nameStr = (nameIdx !== undefined && row[nameIdx] !== undefined) ? row[nameIdx] : '';
          const name = normalizeName(nameStr);
          
          const email = (emailIdx !== undefined && row[emailIdx] !== undefined) ? row[emailIdx] : undefined;
          
          const projectRaw = (projectIdx !== undefined && row[projectIdx] !== undefined) ? row[projectIdx] : projects[0]?.name;
          // Fuzzy match project or default
          const project = projects.find(p => p.name.toLowerCase() === String(projectRaw).toLowerCase())?.name || String(projectRaw) || projects[0]?.name;
          
          const sourceRaw = (sourceIdx !== undefined && row[sourceIdx] !== undefined) ? row[sourceIdx] : LeadSource.CSV_IMPORT;
          
          const newLead: Lead = {
              id: `IMP-${Date.now()}-${Math.floor(Math.random()*1000)}`,
              createdAt: new Date().toISOString(),
              campaign: 'Bulk Import',
              name,
              mobile,
              email,
              project,
              source: sourceRaw || LeadSource.CSV_IMPORT,
              stage: LeadStage.NEW,
              subStage: 'Fresh',
              followUpDate: new Date().toISOString().split('T')[0],
              followUpTime: '10:00',
              agentName: 'Unassigned',
              callCount: 0,
              remarksHistory: [{
                  timestamp: new Date().toISOString(),
                  text: 'Imported via Bulk CSV Wizard.',
                  author: 'System'
              }]
          };
          leadsToImport.push(newLead);
      });

      setPreviewLeads(leadsToImport);
      setImportSummary({
          valid: leadsToImport.length,
          duplicates: duplicates,
          total: parsedRows.length
      });
      setStep('review');
  };

  const finalizeImport = () => {
      onImport(previewLeads);
      onClose();
      setStep('upload');
      setRawCsv('');
      setPreviewLeads([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-green-600" /> Bulk Import Wizard
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
        </div>

        {/* Steps Indicator */}
        <div className="flex border-b border-slate-100">
            <div className={`flex-1 py-2 text-center text-xs font-bold uppercase border-b-2 ${step === 'upload' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>1. Upload Data</div>
            <div className={`flex-1 py-2 text-center text-xs font-bold uppercase border-b-2 ${step === 'map' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>2. Map Columns</div>
            <div className={`flex-1 py-2 text-center text-xs font-bold uppercase border-b-2 ${step === 'review' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>3. Review & Import</div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
            {step === 'upload' && (
                <div className="space-y-4">
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50">
                        <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600 font-medium">Paste your CSV data here</p>
                        <p className="text-xs text-slate-400 mb-4">Header row is required. Format: Name, Mobile, Project...</p>
                        <textarea 
                            value={rawCsv}
                            onChange={(e) => setRawCsv(e.target.value)}
                            className="w-full h-48 p-4 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            placeholder="Name,Mobile,Project,Source&#10;Rahul Sharma,9876543210,Tower A,Facebook&#10;Sneha Gupta,9988776655,Tower B,Google"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button onClick={handleParse} disabled={!rawCsv} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50">Next: Map Columns</button>
                    </div>
                </div>
            )}

            {step === 'map' && (
                <div className="space-y-6">
                    <p className="text-sm text-slate-600">Map the columns from your CSV to the CRM fields.</p>
                    <div className="grid grid-cols-1 gap-4 max-h-64 overflow-y-auto pr-2">
                        {headers.map((header, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-slate-50 p-3 rounded border border-slate-200">
                                <div className="w-1/3 font-mono text-sm font-bold text-slate-700 truncate" title={header}>{header}</div>
                                <ArrowRight className="w-4 h-4 text-slate-400" />
                                <select 
                                    value={mappings[idx] || 'skip'} 
                                    onChange={(e) => setMappings({...mappings, [idx]: e.target.value})}
                                    className="flex-1 p-2 border border-slate-300 rounded text-sm"
                                >
                                    {availableFields.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setStep('upload')} className="text-slate-500 font-bold hover:bg-slate-100 px-4 py-2 rounded-lg">Back</button>
                        <button onClick={handleProcess} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700">Next: Processing</button>
                    </div>
                </div>
            )}

            {step === 'review' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
                            <p className="text-xs font-bold text-green-600 uppercase">Ready to Import</p>
                            <p className="text-2xl font-bold text-green-800">{importSummary.valid}</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-center">
                            <p className="text-xs font-bold text-orange-600 uppercase">Duplicates Skipped</p>
                            <p className="text-2xl font-bold text-orange-800">{importSummary.duplicates}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                            <p className="text-xs font-bold text-slate-500 uppercase">Total Rows</p>
                            <p className="text-2xl font-bold text-slate-700">{importSummary.total}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-sm text-slate-700 mb-2">Preview (First 3 Records)</h3>
                        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 text-slate-500">
                                    <tr>
                                        <th className="p-2">Name</th>
                                        <th className="p-2">Mobile</th>
                                        <th className="p-2">Project</th>
                                        <th className="p-2">Source</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewLeads.slice(0, 3).map((l, i) => (
                                        <tr key={i} className="border-t border-slate-100">
                                            <td className="p-2 font-medium">{l.name}</td>
                                            <td className="p-2 font-mono">{l.mobile}</td>
                                            <td className="p-2">{l.project}</td>
                                            <td className="p-2">{l.source}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setStep('map')} className="text-slate-500 font-bold hover:bg-slate-100 px-4 py-2 rounded-lg">Back</button>
                        <button onClick={finalizeImport} disabled={importSummary.valid === 0} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 shadow-lg shadow-green-200 disabled:opacity-50">
                            Confirm Import
                        </button>
                    </div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default ImportLeadsModal;
