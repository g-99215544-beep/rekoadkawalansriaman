import React, { useEffect, useState } from 'react';
import { dbRefs, onValue, query, orderByChild, equalTo } from '../services/firebase';
import { formatDate, TOTAL_WAKTU, PERIODS } from '../constants';
import { ClassRecord } from '../types';

interface TodayViewProps {
  onRecordClick: (records: ClassRecord[]) => void;
}

const TodayView: React.FC<TodayViewProps> = ({ onRecordClick }) => {
  const [data, setData] = useState<Record<string, Record<string, ClassRecord[]>>>({});
  const [loading, setLoading] = useState(true);
  const [classList, setClassList] = useState<string[]>([]);

  useEffect(() => {
    // 1. Fetch Class List First
    onValue(dbRefs.classes, (snap) => {
        if(snap.exists()) setClassList(Object.keys(snap.val()).sort());
    });

    // 2. Fetch Today's Records from 'kawalan'
    const today = formatDate(new Date());
    const q = query(dbRefs.kawalan, orderByChild('tarikh'), equalTo(today));

    const unsubscribe = onValue(q, (snapshot) => {
      const records = snapshot.val();
      const newData: Record<string, Record<string, ClassRecord[]>> = {};

      if (records) {
        Object.values(records).forEach((rec: any) => {
            const k = rec.kelas;
            const w = rec.waktu;
            if(!newData[k]) newData[k] = {};
            if(!newData[k][w]) newData[k][w] = [];
            newData[k][w].push(rec);
        });
      }
      setData(newData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="text-center py-10 text-slate-400">Memuatkan jadual...</div>;

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-slate-700">Jadual Hari Ini</h3>
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-emerald-700 text-white">
              <th className="p-2 border border-emerald-800 sticky left-0 bg-emerald-700 z-10">Kelas</th>
              {PERIODS.map(p => (
                <th key={p.code} className="p-1 min-w-[60px] border border-emerald-600">
                    <div className="font-bold">{p.code}</div>
                    <div className="text-[9px] opacity-80">{p.start}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {classList.map((cls, idx) => (
                <tr key={cls} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-2 font-bold text-slate-700 border border-slate-200 sticky left-0 bg-inherit z-10">{cls}</td>
                    {PERIODS.map((p, i) => {
                        const records = data[cls]?.[p.code];
                        const isRehat = (['1','2','3'].some(y=>cls.startsWith(y)) && i===4) || (['4','5','6'].some(y=>cls.startsWith(y)) && i===6);

                        if(isRehat) {
                            return <td key={p.code} className="bg-emerald-100 text-emerald-800 text-center font-bold border border-slate-200 text-[10px]">R</td>;
                        }

                        return (
                            <td 
                                key={p.code} 
                                className={`border border-slate-200 p-1 align-top h-12 cursor-pointer transition-colors hover:bg-emerald-50 ${records ? 'bg-white' : 'bg-yellow-50/50'}`}
                                onClick={() => records && onRecordClick(records)}
                            >
                                {records ? (
                                    <div className="flex flex-col gap-1">
                                        {records.map((r, ri) => (
                                            <div key={ri} className="leading-tight">
                                                <div className="font-semibold text-slate-800 truncate w-16 text-[10px]">{r.namaGuru}</div>
                                                <div className="text-[9px] text-slate-500">{r.tempat}</div>
                                                {r.mataPelajaran && <span className="inline-block px-1 rounded bg-blue-100 text-blue-800 text-[8px]">{r.mataPelajaran}</span>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-slate-300">-</div>
                                )}
                            </td>
                        );
                    })}
                </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex gap-2 text-[10px] text-slate-500 justify-center">
         <span>Singkatan: </span>
         <span className="bg-blue-100 text-blue-800 px-1 rounded">BC: B.Cina</span>
         <span className="bg-pink-100 text-pink-800 px-1 rounded">BA: B.Arab</span>
         <span className="bg-green-100 text-green-800 px-1 rounded">PEM: Pemulihan</span>
      </div>
    </div>
  );
};

export default TodayView;