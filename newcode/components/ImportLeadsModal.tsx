
import React, { useState } from 'react';
import { Lead, LeadSource, LeadStage, Project, Unit, ChannelPartner } from '../types';
import { X, UploadCloud, ArrowRight, CheckCircle, AlertTriangle, FileSpreadsheet, Users, LayoutGrid, Briefcase, Download, FileText } from 'lucide-react';

export type ImportType = 'leads' | 'inventory' | 'partners';

interface ImportLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[], type: ImportType) => void;
  projects: Project[];
  existingLeads: Lead[];
}

const ImportLeadsModal: React.FC<ImportLeadsModalProps> = ({ isOpen, onClose, onImport, projects, existingLeads }) => {
  const [step, setStep] = useState<'type' | 'upload' | 'map' | 'review'>('type');
  const [importType, setImportType] = useState<ImportType>('leads');
  const [rawCsv, setRawCsv] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [importSummary, setImportSummary] = useState({ valid: 0, errors: 0, total: 0 });
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<{row: number, msg: string}[]>([]);

  // Field Definitions per Type
  const FIELDS: Record<ImportType, { value: string, label: string, required?: boolean }[]> = {
      leads: [
          { value: 'name', label: 'Full Name', required: true },
          { value: 'mobile', label: 'Mobile Number', required: true },
          { value: 'email', label: 'Email Address' },
          { value: 'project', label: 'Interested Project' },
          { value: 'source', label: 'Lead Source' },
          { value: 'remarks', label: 'Legacy Remarks' },
          { value: 'date', label: 'Inquiry Date (YYYY-MM-DD)' }
      ],
      inventory: [
          { value: 'unitNumber', label: 'Unit Number', required: true },
          { value: 'floor', label: 'Floor No', required: true },
          { value: 'type', label: 'Type (2BHK, 3BHK)', required: true },
          { value: 'tower', label: 'Tower Name', required: true },
          { value: 'area', label: 'Carpet Area (sqft)', required: true },
          { value: 'price', label: 'Base Price' },
          { value: 'status', label: 'Status (Available/Sold)' }
      ],
      partners: [
          { value: 'firmName', label: 'Firm Name', required: true },
          { value: 'name', label: 'Owner Name', required: true },
          { value: 'mobile', label: 'Mobile Number', required: true },
          { value: 'rera', label: 'RERA ID' },
          { value: 'tier', label: 'Tier (Silver/Gold)' }
      ]
  };

  const handleDownloadTemplate = () => {
      const fields = FIELDS[importType].map(f => f.label);
      const dummyRow = FIELDS[importType].map(f => {
          if(f.value === 'mobile') return '9876543210';
          if(f.value === 'date') return '2024-01-01';
          if(f.value === 'price' || f.value === 'area') return '1000';
          return `Sample ${f.label}`;
      });
      
      const csvContent = "data:text/csv;charset=utf-8," 
          + fields.join(",") + "\n" 
          + dummyRow.join(",");
          
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${importType}_import_template.csv`);
      document.body.appendChild(link);
      link.click();
  };

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
      
      // Smart Auto-Map Logic
      const initialMap: Record<string, string> = {};
      const targetFields = FIELDS[importType];
      
      headerRow.forEach((h, idx) => {
          const lowerH = h.toLowerCase();
          const key = String(idx);
          // Fuzzy match
          const match = targetFields.find(f => {
              const labelLower = f.label.toLowerCase();
              const valLower = f.value.toLowerCase();
              return lowerH.includes(valLower) || lowerH.includes(labelLower) || 
                     (f.value === 'mobile' && (lowerH.includes('phone') || lowerH.includes('contact'))) ||
                     (f.value === 'unitNumber' && (lowerH.includes('flat') || lowerH.includes('unit'))) ||
                     (f.value === 'remarks' && (lowerH.includes('note') || lowerH.includes('comment')));
          });
          
          if (match) initialMap[key] = match.value;
          else initialMap[key] = 'skip';
      });
      
      setMappings(initialMap);
      setStep('map');
  };

  const handleProcess = () => {
      const dataToImport: any[] = [];
      const errors: {row: number, msg: string}[] = [];
      
      const fieldIndices: Record<string, number> = {};
      Object.entries(mappings).forEach(([idx, field]) => {
          if (field !== 'skip') fieldIndices[field] = Number(idx);
      });

      // Check Required Fields Mapping
      const fieldsForType = FIELDS[importType];
      const missingRequired = fieldsForType.filter(f => f.required && fieldIndices[f.value] === undefined);
      
      if (missingRequired.length > 0) {
          alert(`Mapping Error: Please map required fields: ${missingRequired.map(f => f.label).join(', ')}`);
          return;
      }

      parsedRows.forEach((row, rowIndex) => {
          if (row.length === 0 || (row.length === 1 && row[0] === '')) return;

          const item: any = {};
          let isValid = true;
          let errorMsg = '';

          // Extract Data
          // Use Object.entries to avoid using string key index on fieldIndices which can cause TS errors in some configs
          Object.entries(fieldIndices).forEach(([key, idx]) => {
              // Fix: explicitly cast idx to number to avoid 'unknown' index error
              if(row[Number(idx)] !== undefined) item[key] = row[Number(idx)];
          });

          // Validation Logic Based on Type
          if (importType === 'leads') {
              const mobile = item.mobile?.replace(/\D/g, '').slice(-10) || '';
              if (mobile.length !== 10) { isValid = false; errorMsg = 'Invalid Mobile'; }
              else if (existingLeads.some(l => l.mobile === mobile)) { isValid = false; errorMsg = 'Duplicate Mobile'; }
              
              if (isValid) {
                  // Construct Lead Object
                  dataToImport.push({
                      id: `IMP-${Date.now()}-${rowIndex}`,
                      createdAt: item.date ? new Date(item.date).toISOString() : new Date().toISOString(),
                      name: item.name || 'Unknown',
                      mobile: mobile,
                      email: item.email,
                      project: item.project || projects[0]?.name,
                      source: item.source || 'Migration Import',
                      stage: LeadStage.NEW,
                      remarksHistory: item.remarks ? [{ timestamp: new Date().toISOString(), text: `Legacy Note: ${item.remarks}`, author: 'Migration' }] : [],
                      campaign: 'Bulk Import'
                  });
              }
          } 
          else if (importType === 'inventory') {
              if (!item.unitNumber) { isValid = false; errorMsg = 'Missing Unit No'; }
              
              if (isValid) {
                  // Construct Unit Object
                  const pid = projects.find(p => p.name === item.tower) ? projects.find(p => p.name === item.tower)?.id : projects[0].id;
                  dataToImport.push({
                      id: `${pid}-${item.tower}-${item.unitNumber}`,
                      unitNumber: item.unitNumber,
                      floor: item.floor,
                      tower: item.tower,
                      type: item.type,
                      status: item.status || 'Available',
                      carpetArea: Number(item.area),
                      basePrice: Number(item.price || 0)
                  });
              }
          }
          else if (importType === 'partners') {
              if (!item.mobile) { isValid = false; errorMsg = 'Missing Mobile'; }
              
              if (isValid) {
                  dataToImport.push({
                      id: `CP-IMP-${rowIndex}`,
                      firmName: item.firmName,
                      name: item.name,
                      mobile: item.mobile,
                      reraId: item.rera || 'Pending',
                      tier: item.tier || 'Silver',
                      status: 'Active',
                      totalSalesValue: 0,
                      commissionEarned: 0
                  });
              }
          }

          if (!isValid) {
              errors.push({ row: rowIndex + 2, msg: errorMsg || 'Validation Failed' }); // +2 for header and 0-index
          }
      });

      setPreviewData(dataToImport);
      setValidationErrors(errors);
      setImportSummary({
          valid: dataToImport.length,
          errors: errors.length,
          total: parsedRows.length
      });
      setStep('review');
  };

  const finalizeImport = () => {
      onImport(previewData, importType);
      onClose();
      // Reset
      setStep('type');
      setRawCsv('');
      setPreviewData([]);
      setValidationErrors([]);
  };

  const handleDownloadErrorLog = () => {
      const content = "Row,Error\n" + validationErrors.map(e => `${e.row},${e.msg}`).join("\n");
      const blob = new Blob([content], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'migration_errors.csv';
      a.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <FileSpreadsheet className="w-6 h-6 text-blue-600" /> Universal Migration Wizard
              </h2>
              <p className="text-slate-500 text-sm">Import legacy data from Excel/CSV in 4 easy steps.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition"><X className="w-5 h-5 text-slate-500" /></button>
        </div>

        {/* Progress Stepper */}
        <div className="flex border-b border-slate-100 bg-white">
            {['Select Type', 'Upload Data', 'Smart Map', 'Pre-Flight Check'].map((label, i) => {
                const stepIdx = ['type', 'upload', 'map', 'review'].indexOf(step);
                const active = i === stepIdx;
                const completed = i < stepIdx;
                return (
                    <div key={label} className={`flex-1 py-3 text-center text-xs font-bold uppercase border-b-4 transition-all ${active ? 'border-blue-600 text-blue-600' : completed ? 'border-green-500 text-green-600' : 'border-transparent text-slate-300'}`}>
                        <span className="flex items-center justify-center gap-2">
                            {completed && <CheckCircle className="w-3 h-3" />} {i+1}. {label}
                        </span>
                    </div>
                );
            })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
            
            {/* STEP 1: TYPE SELECTION */}
            {step === 'type' && (
                <div className="max-w-3xl mx-auto">
                    <h3 className="text-center text-lg font-bold text-slate-700 mb-8">What data are you migrating today?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { id: 'leads', icon: Users, label: 'Customer Leads', desc: 'Contact info, Source, History' },
                            { id: 'inventory', icon: LayoutGrid, label: 'Unit Inventory', desc: 'Flats, Towers, Pricing, Status' },
                            { id: 'partners', icon: Briefcase, label: 'Channel Partners', desc: 'Brokers, Agencies, RERA IDs' }
                        ].map((opt) => (
                            <div 
                                key={opt.id}
                                onClick={() => { setImportType(opt.id as ImportType); setStep('upload'); }}
                                className="bg-white p-6 rounded-xl border-2 border-slate-100 hover:border-blue-500 hover:shadow-xl cursor-pointer transition group text-center"
                            >
                                <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-50 transition">
                                    <opt.icon className="w-8 h-8 text-slate-400 group-hover:text-blue-600" />
                                </div>
                                <h4 className="font-bold text-slate-800 mb-1">{opt.label}</h4>
                                <p className="text-xs text-slate-500">{opt.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* STEP 2: UPLOAD */}
            {step === 'upload' && (
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-700">Upload {importType.charAt(0).toUpperCase() + importType.slice(1)} CSV</h3>
                        <button onClick={handleDownloadTemplate} className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline">
                            <Download className="w-4 h-4" /> Download Template
                        </button>
                    </div>
                    
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-white hover:bg-slate-50 transition">
                        <UploadCloud className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-600 font-medium">Paste your CSV data here</p>
                        <p className="text-xs text-slate-400 mb-4">Or drag and drop .csv file (Simulated)</p>
                        <textarea 
                            value={rawCsv}
                            onChange={(e) => setRawCsv(e.target.value)}
                            className="w-full h-64 p-4 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-slate-50"
                            placeholder={`Paste CSV content here...\nExample:\nName,Mobile,Source\nRahul,9988776655,Facebook`}
                        />
                    </div>
                    <div className="flex justify-between">
                        <button onClick={() => setStep('type')} className="text-slate-500 font-bold hover:text-slate-800 px-4">Back</button>
                        <button onClick={handleParse} disabled={!rawCsv} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-200 transition">
                            Analyze Data <ArrowRight className="w-4 h-4 inline ml-2" />
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 3: MAPPING */}
            {step === 'map' && (
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                        <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-blue-800 text-sm">Smart Mapping Active</h4>
                            <p className="text-xs text-blue-600">We've auto-matched columns based on your header names. Please verify.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2">
                        {headers.map((header, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <div className="w-1/3">
                                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">Your File Column</p>
                                    <p className="font-mono text-sm font-bold text-slate-700 truncate" title={header}>{header}</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-300" />
                                <div className="flex-1">
                                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">System Field</p>
                                    <select 
                                        value={mappings[String(idx)] || 'skip'} 
                                        onChange={(e) => setMappings({...mappings, [String(idx)]: e.target.value})}
                                        className={`w-full p-2 border rounded-lg text-sm font-medium outline-none ${mappings[String(idx)] === 'skip' ? 'bg-slate-100 text-slate-500' : 'bg-white border-green-500 text-green-700'}`}
                                    >
                                        <option value="skip">-- Skip Column --</option>
                                        {FIELDS[importType].map(f => <option key={f.value} value={f.value}>{f.label} {f.required ? '*' : ''}</option>)}
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between pt-4">
                        <button onClick={() => setStep('upload')} className="text-slate-500 font-bold hover:text-slate-800 px-4">Back</button>
                        <button onClick={handleProcess} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition">
                            Run Pre-Flight Check
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 4: REVIEW & VALIDATE */}
            {step === 'review' && (
                <div className="space-y-8 max-w-4xl mx-auto">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl border-b-4 border-green-500 shadow-sm text-center">
                            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                            <p className="text-3xl font-bold text-slate-800">{importSummary.valid}</p>
                            <p className="text-xs text-slate-500 uppercase font-bold">Ready to Import</p>
                        </div>
                        <div className={`bg-white p-6 rounded-2xl border-b-4 shadow-sm text-center ${importSummary.errors > 0 ? 'border-red-500' : 'border-slate-200'}`}>
                            <AlertTriangle className={`w-8 h-8 mx-auto mb-2 ${importSummary.errors > 0 ? 'text-red-500' : 'text-slate-300'}`} />
                            <p className={`text-3xl font-bold ${importSummary.errors > 0 ? 'text-red-600' : 'text-slate-300'}`}>{importSummary.errors}</p>
                            <p className="text-xs text-slate-500 uppercase font-bold">Errors / Duplicates</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border-b-4 border-slate-300 shadow-sm text-center">
                            <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-3xl font-bold text-slate-800">{importSummary.total}</p>
                            <p className="text-xs text-slate-500 uppercase font-bold">Total Rows</p>
                        </div>
                    </div>

                    {/* Action Area */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 flex justify-between items-center">
                        <div>
                            <h4 className="font-bold text-slate-800 text-lg">Validation Report</h4>
                            <p className="text-sm text-slate-500">
                                {importSummary.errors > 0 
                                ? "Some rows have errors. You can download the log, fix them, and re-upload later." 
                                : "All data looks clean and ready for migration."}
                            </p>
                        </div>
                        {importSummary.errors > 0 && (
                            <button onClick={handleDownloadErrorLog} className="text-red-600 font-bold text-sm border border-red-200 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition flex items-center gap-2">
                                <Download className="w-4 h-4" /> Download Error Log
                            </button>
                        )}
                    </div>

                    {/* Preview Table */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 font-bold text-xs text-slate-500 uppercase">
                            Preview (First 5 Valid Records)
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white text-slate-500 border-b border-slate-100">
                                <tr>
                                    {FIELDS[importType].slice(0,4).map(f => <th key={f.value} className="p-3">{f.label}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {previewData.slice(0, 5).map((row, i) => (
                                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                                        {FIELDS[importType].slice(0,4).map(f => (
                                            <td key={f.value} className="p-3 text-slate-700">
                                                {row[f.value] || '-'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button onClick={() => setStep('map')} className="text-slate-500 font-bold hover:bg-slate-100 px-6 py-3 rounded-xl transition">Back</button>
                        <button 
                            onClick={finalizeImport} 
                            disabled={importSummary.valid === 0} 
                            className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 disabled:opacity-50 transition flex items-center gap-2"
                        >
                            <CheckCircle className="w-5 h-5" /> Confirm Migration
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
