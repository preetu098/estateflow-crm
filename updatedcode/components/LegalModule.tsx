
import React from 'react';
import { Scale, Gavel, FileText, AlertTriangle } from 'lucide-react';

const LegalModule: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-slate-50 p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Scale className="w-8 h-8 text-slate-600"/> Legal & Compliance Vault</h2>
            <p className="text-slate-500 text-sm">Manage litigation, land records, and RERA compliance.</p>
        </div>
        <button className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900">
            + Add New Case
        </button>
      </div>

      {/* STATUS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-full text-red-600"><AlertTriangle className="w-6 h-6" /></div>
              <div>
                  <h3 className="text-2xl font-bold text-slate-800">2</h3>
                  <p className="text-xs text-slate-500 uppercase font-bold">High Priority Cases</p>
              </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Gavel className="w-6 h-6" /></div>
              <div>
                  <h3 className="text-2xl font-bold text-slate-800">14</h3>
                  <p className="text-xs text-slate-500 uppercase font-bold">Active Litigations</p>
              </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full text-green-600"><FileText className="w-6 h-6" /></div>
              <div>
                  <h3 className="text-2xl font-bold text-slate-800">100%</h3>
                  <p className="text-xs text-slate-500 uppercase font-bold">RERA Compliance</p>
              </div>
          </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-700">Upcoming Hearings</div>
          <table className="w-full text-sm text-left">
              <thead className="text-slate-500 font-medium border-b border-slate-100 bg-white">
                  <tr>
                      <th className="p-4">Case No.</th>
                      <th className="p-4">Court</th>
                      <th className="p-4">Opposing Party</th>
                      <th className="p-4">Next Hearing</th>
                      <th className="p-4">Status</th>
                  </tr>
              </thead>
              <tbody>
                  <tr className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="p-4 font-mono text-blue-600">LC-2023-899</td>
                      <td className="p-4">High Court, Mumbai</td>
                      <td className="p-4 font-bold">Local Municipality</td>
                      <td className="p-4 text-red-600 font-bold">Tomorrow, 10:00 AM</td>
                      <td className="p-4"><span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold">Argument Stage</span></td>
                  </tr>
                   <tr className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="p-4 font-mono text-blue-600">CONS-445</td>
                      <td className="p-4">Consumer Forum</td>
                      <td className="p-4 font-bold">Mr. Sharma (Customer)</td>
                      <td className="p-4">15 Dec 2025</td>
                      <td className="p-4"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">Evidence</span></td>
                  </tr>
              </tbody>
          </table>
      </div>
    </div>
  );
};

export default LegalModule;
