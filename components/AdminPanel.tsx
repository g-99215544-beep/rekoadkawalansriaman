import React, { useEffect, useState } from 'react';
import { dbRefs, onValue, update } from '../services/firebase';
import { NotificationRecord } from '../types';

interface AdminPanelProps {
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'sahsiah' | 'semak'>('sahsiah');
  const [sahsiahRecords, setSahsiahRecords] = useState<NotificationRecord[]>([]);

  useEffect(() => {
    // Read from notifications for pending sahsiah/reports
    const unsubscribe = onValue(dbRefs.notifications, (snapshot) => {
        const data = snapshot.val();
        if(data) {
            const arr = Object.keys(data).map(key => ({id: key, ...data[key]}));
            // Sort by createdAt descending
            arr.sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
            setSahsiahRecords(arr);
        } else {
            setSahsiahRecords([]);
        }
    });
    return () => unsubscribe();
  }, []);

  const handleConfirm = (id?: string) => {
    if(!id) return;
    update(dbRefs.notifications, { [`${id}/status`]: 'confirmed' });
  };

  return (
    <div className="bg-red-50 p-4 rounded-3xl min-h-[60vh]">
        <div className="flex justify-between items-center mb-6 bg-white p-3 rounded-2xl shadow-sm border border-red-100">
            <h2 className="font-bold text-red-800 flex items-center gap-2">
                🔒 Admin Panel
            </h2>
            <button onClick={onLogout} className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded-full font-bold hover:bg-red-200">
                Log Keluar
            </button>
        </div>

        <div className="flex gap-2 mb-4">
            <button 
                onClick={() => setActiveTab('sahsiah')}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'sahsiah' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-white text-red-800'}`}
            >
                Laporan Sahsiah
            </button>
             {/* Placeholder for future expansion */}
            <button 
                onClick={() => setActiveTab('semak')}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'semak' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-white text-red-800'}`}
            >
                Semak Data
            </button>
        </div>

        {activeTab === 'sahsiah' && (
            <div className="space-y-3">
                {sahsiahRecords.length === 0 && <div className="text-center text-slate-400 py-10">Tiada laporan.</div>}
                {sahsiahRecords.map(rec => (
                    <div key={rec.id} className={`bg-white p-4 rounded-2xl shadow-sm border border-slate-100 ${rec.status === 'confirmed' ? 'opacity-60' : ''}`}>
                        <div className="flex justify-between items-start mb-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${rec.jenis === 'baik' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {rec.jenis === 'baik' ? 'Amalan Baik' : 'Salah Laku'}
                            </span>
                            {rec.status === 'pending' ? (
                                <button onClick={() => handleConfirm(rec.id)} className="bg-emerald-600 text-white text-[10px] px-3 py-1 rounded-full font-bold shadow hover:bg-emerald-700">
                                    SAHKAN
                                </button>
                            ) : (
                                <span className="text-slate-400 text-[10px] font-bold">DISAHKAN</span>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-slate-600 mb-2">
                            <div><span className="font-semibold">Tarikh:</span> {rec.tarikh}</div>
                            <div><span className="font-semibold">Kelas:</span> {rec.kelas}</div>
                            <div className="col-span-2"><span className="font-semibold">Guru:</span> {rec.namaGuru}</div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg text-xs mb-2">
                            <div className="font-bold text-slate-700">{rec.kategori}</div>
                            <div className="text-slate-500 italic">{rec.keterangan}</div>
                        </div>
                         {rec.namaMurid && (
                            <div className="text-[10px] text-slate-500 border-t pt-2">
                                <strong>Murid:</strong> {rec.namaMurid}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}
        
        {activeTab === 'semak' && (
             <div className="text-center py-12 text-slate-400 text-sm">
                 Fungsi semakan analisis kehadiran akan datang tidak lama lagi.
             </div>
        )}
    </div>
  );
};

export default AdminPanel;