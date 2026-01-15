import React, { useState } from 'react';
import Layout from './components/Layout';
import RecordForm from './components/RecordForm';
import TodayView from './components/TodayView';
import AdminPanel from './components/AdminPanel';
import { ADMIN_PASSWORD } from './constants';
import { ClassRecord } from './types';

function App() {
  const [currentTab, setCurrentTab] = useState<'form' | 'today' | 'admin'>('form');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  
  // Modal State
  const [selectedRecordDetails, setSelectedRecordDetails] = useState<ClassRecord[] | null>(null);

  const handleLogoClick = () => {
    if (isAdmin) {
      setCurrentTab('admin');
    } else {
      setShowLoginModal(true);
    }
  };

  const attemptLogin = () => {
    if (loginPassword === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowLoginModal(false);
      setCurrentTab('admin');
      setLoginPassword('');
    } else {
      alert("Kata laluan salah");
    }
  };

  return (
    <Layout onLogoClick={handleLogoClick}>
      {/* Navigation Tabs */}
      {!isAdmin && currentTab !== 'admin' && (
        <div className="flex p-1 bg-emerald-50 rounded-full mb-6 mx-4 md:mx-0">
          <button 
            onClick={() => setCurrentTab('form')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${currentTab === 'form' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-emerald-800 hover:bg-emerald-100/50'}`}
          >
            Isi Rekod
          </button>
          <button 
            onClick={() => setCurrentTab('today')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${currentTab === 'today' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-emerald-800 hover:bg-emerald-100/50'}`}
          >
            Jadual Hari Ini
          </button>
        </div>
      )}

      {/* Main Views */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {currentTab === 'form' && <RecordForm onSuccess={() => alert("Rekod berjaya disimpan!")} />}
        {currentTab === 'today' && <TodayView onRecordClick={(recs) => setSelectedRecordDetails(recs)} />}
        {currentTab === 'admin' && <AdminPanel onLogout={() => { setIsAdmin(false); setCurrentTab('form'); }} />}
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-2">🔐 Akses Admin</h3>
            <p className="text-sm text-slate-500 mb-4">Masukkan kata laluan pentadbir.</p>
            <input 
              type="password" 
              className="w-full rounded-xl border-slate-300 mb-4 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Kata Laluan"
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
               <button onClick={() => setShowLoginModal(false)} className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 rounded-lg">Batal</button>
               <button onClick={attemptLogin} className="px-5 py-2 text-sm font-bold bg-emerald-600 text-white rounded-lg shadow-lg shadow-emerald-200 hover:bg-emerald-700">Masuk</button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedRecordDetails && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedRecordDetails(null)}>
          <div className="bg-white rounded-3xl p-0 w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-emerald-600 p-4 text-white flex justify-between items-center">
                <h3 className="font-bold">Maklumat Rekod</h3>
                <button onClick={() => setSelectedRecordDetails(null)} className="text-white/80 hover:text-white text-xl">&times;</button>
            </div>
            <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
                {selectedRecordDetails.map((rec, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                         <div className="text-xs text-emerald-600 font-bold mb-2 uppercase tracking-wider">{rec.waktu} &bull; {rec.kelas}</div>
                         <div className="space-y-2 text-sm text-slate-700">
                             <p><span className="font-semibold">Guru:</span> {rec.namaGuru} {rec.guruGanti && <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded-full ml-1">GANTI</span>}</p>
                             <p><span className="font-semibold">Tempat:</span> {rec.tempat}</p>
                             <p><span className="font-semibold">Kehadiran:</span> {rec.jumlahMurid} Orang</p>
                             {rec.catatanKeberadaan && (
                                <div className="bg-yellow-50 p-2 rounded text-xs mt-2 border border-yellow-100">
                                    <span className="font-bold block text-yellow-800">Catatan:</span> {rec.catatanKeberadaan}
                                </div>
                             )}
                         </div>
                    </div>
                ))}
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}

export default App;