import React, { useState, useEffect } from 'react';
import { dbRefs, push, set, get } from '../services/firebase';
import { TEMPAT_OPTIONS, MP_OPTIONS, SAHSIAH_BAIK_CATS, SAHSIAH_JAHAT_CATS, TOTAL_WAKTU, getCurrentPeriod, formatDate, formatTime } from '../constants';
import { ClassData } from '../types';

interface RecordFormProps {
  onSuccess: () => void;
}

const RecordForm: React.FC<RecordFormProps> = ({ onSuccess }) => {
  // Form State
  const [namaGuru, setNamaGuru] = useState('');
  const [guruGanti, setGuruGanti] = useState(false);
  const [jenisKelas, setJenisKelas] = useState<'penuh' | 'pecahan'>('penuh');
  const [mataPelajaran, setMataPelajaran] = useState('');
  const [kelas, setKelas] = useState('');
  const [tempat, setTempat] = useState('');
  const [waktuMengajar, setWaktuMengajar] = useState(1);
  const [jumlahMurid, setJumlahMurid] = useState<string>(''); // This is 'presentMurid'
  const [catatanKeberadaan, setCatatanKeberadaan] = useState('');

  // Sahsiah State
  const [sahsiahMode, setSahsiahMode] = useState<'baik' | 'jahat' | null>('baik');
  const [amalanBaik, setAmalanBaik] = useState('');
  const [perincianAmalan, setPerincianAmalan] = useState('');
  const [keteranganAmalan, setKeteranganAmalan] = useState('');
  const [kategoriKes, setKategoriKes] = useState('');
  const [puncaKes, setPuncaKes] = useState('');
  const [keteranganKes, setKeteranganKes] = useState('');
  
  // Data Options
  const [allClassData, setAllClassData] = useState<ClassData>({});
  const [classList, setClassList] = useState<string[]>([]);
  const [studentList, setStudentList] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);

  // Load Classes on mount
  useEffect(() => {
    get(dbRefs.classes).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setAllClassData(data);
        setClassList(Object.keys(data).sort());
      }
    });
  }, []);

  // Load Students when Class changes
  useEffect(() => {
    if (!kelas) {
      setStudentList([]);
      return;
    }
    
    // Get students from cached data
    if (allClassData[kelas]) {
      setStudentList(allClassData[kelas]);
    } else {
      setStudentList([]);
    }
    
    // Default jumlahMurid to total students if empty? 
    // No, let user input. But we can hint.
  }, [kelas, allClassData]);

  const toggleStudent = (name: string) => {
    setSelectedStudents(prev => 
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  };

  const handleReset = () => {
    setNamaGuru('');
    setGuruGanti(false);
    setJenisKelas('penuh');
    setMataPelajaran('');
    setKelas('');
    setTempat('');
    setWaktuMengajar(1);
    setJumlahMurid('');
    setCatatanKeberadaan('');
    setSelectedStudents([]);
    setAmalanBaik('');
    setPerincianAmalan('');
    setKeteranganAmalan('');
    setKategoriKes('');
    setPuncaKes('');
    setKeteranganKes('');
  };

  const handleSubmit = async () => {
    if (!namaGuru || !kelas || !tempat || jumlahMurid === '') {
      alert("Sila lengkapkan Nama Guru, Kelas, Tempat dan Jumlah Murid.");
      return;
    }

    if (jenisKelas === 'pecahan' && !mataPelajaran) {
        alert("Sila pilih Mata Pelajaran untuk kelas pecahan.");
        return;
    }

    const now = new Date();
    const p = getCurrentPeriod();
    if (!p) {
      alert("Anda berada di luar waktu PdP.");
      return;
    }

    const currentWaktuIndex = parseInt(p.code.replace('W', '')) - 1;
    if (currentWaktuIndex + waktuMengajar > TOTAL_WAKTU) {
       alert("Waktu mengajar melebihi waktu persekolahan.");
       return;
    }

    // Determine Time Block
    const waktuMula = p.code;
    const waktuAkhir = `W${currentWaktuIndex + waktuMengajar}`;
    
    // Stats
    const presentCount = parseInt(jumlahMurid);
    const totalCount = allClassData[kelas] ? allClassData[kelas].length : presentCount;

    // Prepare Sahsiah Data
    const hasSahsiah = selectedStudents.length > 0;
    let sahsiahData: any = null;

    if (hasSahsiah) {
        if (sahsiahMode === 'baik') {
            if (!amalanBaik) { alert("Sila pilih Kategori Amalan."); return; }
            sahsiahData = {
                jenis: 'baik',
                kategori: perincianAmalan ? `${amalanBaik} - ${perincianAmalan}` : amalanBaik,
                keterangan: keteranganAmalan
            };
        } else {
            if (!kategoriKes) { alert("Sila pilih Kategori Kes."); return; }
            sahsiahData = {
                jenis: 'jahat',
                kategori: kategoriKes,
                keterangan: [puncaKes, keteranganKes].filter(Boolean).join(" | ")
            };
        }
    }

    // Generate Records for each period
    const tarikh = formatDate(now);
    const masaRekod = formatTime(now);
    const namaMuridText = selectedStudents.join(", ");

    const savePromises = [];

    // Loop through duration to save multiple Kawalan records (one per period)
    for(let i=0; i<waktuMengajar; i++) {
        const wCode = `W${currentWaktuIndex + 1 + i}`;
        
        const newRecord = {
            tarikh,
            masaRekod,
            namaGuru,
            guruGanti,
            kelas,
            tempat,
            jenisKelas,
            mataPelajaran: jenisKelas === 'pecahan' ? mataPelajaran : null,
            
            // Attendance
            jumlahMurid: presentCount,
            presentMurid: presentCount,
            totalMurid: totalCount,
            catatanKeberadaan: catatanKeberadaan || null,
            
            // Time logic
            waktu: wCode,
            waktuMula,
            waktuAkhir,
            waktuMengajar,

            // Embed sahsiah if exists (Attached to every period record of this session)
            ...(sahsiahData || {}),
            namaMurid: hasSahsiah ? namaMuridText : null,
            namaMuridList: hasSahsiah ? selectedStudents : null
        };
        
        // Save to 'kawalan'
        savePromises.push(set(push(dbRefs.kawalan), newRecord));
    }

    // Save ONE record to 'notifications' if there is sahsiah (for admin alert)
    if (hasSahsiah && sahsiahData) {
        const notificationRecord = {
            ...sahsiahData,
            tarikh,
            masa: masaRekod,
            kelas,
            tempat,
            namaGuru,
            namaMurid: namaMuridText,
            status: 'pending',
            createdAt: Date.now()
        };
        savePromises.push(push(dbRefs.notifications, notificationRecord));
    }

    await Promise.all(savePromises);
    onSuccess();
    handleReset();
  };

  return (
    <div className="space-y-6">
      {/* Main Info Card */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        
        {/* Guru */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Guru <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            value={namaGuru}
            onChange={(e) => setNamaGuru(e.target.value)}
            placeholder="Contoh: Cikgu Sufian" 
            className="w-full rounded-xl border-slate-300 py-2.5 px-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <div className="mt-2 flex items-center">
            <input 
              type="checkbox" 
              id="guruGanti"
              checked={guruGanti}
              onChange={(e) => setGuruGanti(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="guruGanti" className="ml-2 text-xs font-medium text-slate-600">Saya Guru Ganti</label>
          </div>
        </div>

        {/* Jenis Kelas */}
        <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2">Jenis Kelas <span className="text-red-500">*</span></label>
            <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input 
                        type="radio" 
                        name="jenisKelas" 
                        checked={jenisKelas === 'penuh'} 
                        onChange={() => setJenisKelas('penuh')}
                        className="text-emerald-600 focus:ring-emerald-500" 
                    />
                    <span>Kelas Penuh</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input 
                        type="radio" 
                        name="jenisKelas" 
                        checked={jenisKelas === 'pecahan'} 
                        onChange={() => setJenisKelas('pecahan')}
                        className="text-emerald-600 focus:ring-emerald-500" 
                    />
                    <span>Kelas Pecahan</span>
                </label>
            </div>
            
            {jenisKelas === 'pecahan' && (
                <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-2">
                    <label className="block text-xs font-semibold text-blue-700 mb-1">Mata Pelajaran <span className="text-red-500">*</span></label>
                    <select 
                        value={mataPelajaran}
                        onChange={(e) => setMataPelajaran(e.target.value)}
                        className="w-full rounded-lg border-blue-200 bg-white py-2 px-3 text-sm focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="">Sila Pilih</option>
                        {MP_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            )}
        </div>

        {/* Kelas & Tempat */}
        <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Kelas <span className="text-red-500">*</span></label>
                <select 
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="w-full rounded-xl border-slate-300 py-2.5 px-3 text-sm focus:ring-2 focus:ring-emerald-500"
                >
                    <option value="">Pilih</option>
                    {classList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Tempat <span className="text-red-500">*</span></label>
                <select 
                    value={tempat}
                    onChange={(e) => setTempat(e.target.value)}
                    className="w-full rounded-xl border-slate-300 py-2.5 px-3 text-sm focus:ring-2 focus:ring-emerald-500"
                >
                    <option value="">Pilih</option>
                    {TEMPAT_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
        </div>

        {/* Waktu & Jumlah */}
        <div className="grid grid-cols-2 gap-3">
             <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Jam Kredit <span className="text-red-500">*</span></label>
                <select 
                    value={waktuMengajar}
                    onChange={(e) => setWaktuMengajar(Number(e.target.value))}
                    className="w-full rounded-xl border-slate-300 py-2.5 px-3 text-sm focus:ring-2 focus:ring-emerald-500"
                >
                    {[1,2,3,4].map(n => <option key={n} value={n}>{n} Waktu</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Kehadiran (Semasa) <span className="text-red-500">*</span></label>
                <div className="relative">
                    <input 
                        type="number"
                        min="0"
                        value={jumlahMurid}
                        onChange={(e) => setJumlahMurid(e.target.value)}
                        placeholder="0"
                        className="w-full rounded-xl border-slate-300 py-2.5 px-3 text-sm focus:ring-2 focus:ring-emerald-500 pr-12"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400">
                        / {studentList.length || '-'}
                    </span>
                </div>
            </div>
        </div>
        
        {/* Catatan if needed */}
        <div>
             <label className="block text-xs font-semibold text-slate-500 mb-1">Catatan Keberadaan (Jika ada)</label>
             <textarea 
                value={catatanKeberadaan}
                onChange={(e) => setCatatanKeberadaan(e.target.value)}
                placeholder="Contoh: Ali sakit di bilik rawatan"
                className="w-full rounded-xl border-slate-300 py-2 px-3 text-sm min-h-[60px]"
             />
        </div>
        
        <button 
            onClick={handleSubmit}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 rounded-full shadow-lg shadow-emerald-200 transition-all active:scale-95"
        >
            HANTAR REKOD
        </button>
      </div>

      {/* Sahsiah Section */}
      <div className="pt-4 border-t border-slate-200">
        <h3 className="font-semibold text-slate-700 mb-3 text-sm">Maklumat Sahsiah (Pilihan)</h3>
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
             {/* Multi Select Murid */}
             <div className="relative">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Murid</label>
                <div 
                    className="w-full min-h-[42px] rounded-xl border border-slate-300 bg-slate-50 py-2 px-3 text-sm cursor-pointer"
                    onClick={() => setIsStudentDropdownOpen(!isStudentDropdownOpen)}
                >
                    {selectedStudents.length === 0 
                        ? <span className="text-slate-400">Pilih murid terlibat...</span> 
                        : <span className="text-slate-800">{selectedStudents.length} murid dipilih</span>
                    }
                </div>
                {isStudentDropdownOpen && (
                    <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto p-2">
                        {studentList.length === 0 ? (
                            <div className="text-center text-xs text-slate-400 py-2">Sila pilih kelas dahulu</div>
                        ) : (
                            studentList.map(student => (
                                <label key={student} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedStudents.includes(student)}
                                        onChange={() => toggleStudent(student)}
                                        className="rounded text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span className="text-sm text-slate-700">{student}</span>
                                </label>
                            ))
                        )}
                    </div>
                )}
             </div>

             {/* Toggle Mode */}
             <div className="flex p-1 bg-slate-100 rounded-full">
                <button 
                    onClick={() => setSahsiahMode('baik')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-full transition-colors ${sahsiahMode === 'baik' ? 'bg-white shadow text-emerald-700' : 'text-slate-500'}`}
                >
                    Amalan Baik
                </button>
                <button 
                    onClick={() => setSahsiahMode('jahat')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-full transition-colors ${sahsiahMode === 'jahat' ? 'bg-white shadow text-red-700' : 'text-slate-500'}`}
                >
                    Salah Laku
                </button>
             </div>

             {sahsiahMode === 'baik' ? (
                <div className="space-y-3 animate-in fade-in">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Kategori</label>
                        <select className="w-full rounded-xl border-slate-300 text-sm py-2" value={amalanBaik} onChange={e=>setAmalanBaik(e.target.value)}>
                             <option value="">Sila Pilih</option>
                             {SAHSIAH_BAIK_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Perincian</label>
                        <select className="w-full rounded-xl border-slate-300 text-sm py-2" value={perincianAmalan} onChange={e=>setPerincianAmalan(e.target.value)}>
                             <option value="">Sila Pilih</option>
                             {["Menghargai Diri", "Menghormati Guru", "Sopan", "Rajin"].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <input type="text" placeholder="Keterangan..." className="w-full rounded-xl border-slate-300 text-sm py-2" value={keteranganAmalan} onChange={e=>setKeteranganAmalan(e.target.value)} />
                </div>
             ) : (
                <div className="space-y-3 animate-in fade-in">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Kategori Kes</label>
                        <select className="w-full rounded-xl border-slate-300 text-sm py-2" value={kategoriKes} onChange={e=>setKategoriKes(e.target.value)}>
                             <option value="">Sila Pilih</option>
                             {SAHSIAH_JAHAT_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <input type="text" placeholder="Punca..." className="w-full rounded-xl border-slate-300 text-sm py-2" value={puncaKes} onChange={e=>setPuncaKes(e.target.value)} />
                    <textarea placeholder="Keterangan..." className="w-full rounded-xl border-slate-300 text-sm py-2" value={keteranganKes} onChange={e=>setKeteranganKes(e.target.value)} />
                </div>
             )}
        </div>
      </div>

      <div className="flex justify-center">
         <button onClick={handleReset} className="text-xs text-slate-400 hover:text-slate-600 underline">Reset Borang</button>
      </div>
    </div>
  );
};

export default RecordForm;