import React, { useState, useEffect } from 'react';
import { formatDate, formatTime, getCurrentPeriod } from '../constants';
import { dbRefs, onValue } from '../services/firebase';

interface LayoutProps {
  children: React.ReactNode;
  onLogoClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogoClick }) => {
  const [currentDate, setCurrentDate] = useState(formatDate(new Date()));
  const [currentTime, setCurrentTime] = useState(formatTime(new Date()));
  const [currentPeriod, setCurrentPeriod] = useState("Luar Waktu PdP");
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentDate(formatDate(now));
      setCurrentTime(formatTime(now));
      const p = getCurrentPeriod();
      setCurrentPeriod(p ? p.code : "Luar Waktu PdP");
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Listen for pending notifications (formerly sahsiah)
    const unsubscribe = onValue(dbRefs.notifications, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const count = Object.values(data).filter((item: any) => item.status === 'pending').length;
        setNotificationCount(count);
      } else {
        setNotificationCount(0);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-50 md:py-8">
      <div className="max-w-2xl mx-auto bg-white min-h-screen md:min-h-0 md:rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Header Section */}
        <div className="pt-8 pb-6 px-6 bg-white relative">
          <div className="flex flex-col items-center justify-center cursor-pointer group" onClick={onLogoClick}>
            <div className="relative">
              <img 
                src="https://i.imgur.com/AfsVtVG.png" 
                alt="Logo SKSA" 
                className="w-20 h-20 rounded-full shadow-lg object-cover border-4 border-white group-hover:scale-105 transition-transform" 
              />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                  {notificationCount}
                </span>
              )}
            </div>
            <h1 className="mt-3 text-lg font-bold text-slate-800 tracking-wide text-center uppercase">
              Rekod Pemantauan<br/><span className="text-emerald-700">Kelas SKSA</span>
            </h1>
          </div>

          <div className="flex justify-center gap-3 mt-4 text-xs font-medium text-slate-500 flex-wrap">
            <div className="px-3 py-1 bg-slate-100 rounded-full flex items-center gap-1">
              📅 {currentDate}
            </div>
            <div className="px-3 py-1 bg-slate-100 rounded-full flex items-center gap-1">
              ⏰ {currentTime}
            </div>
            <div className={`px-3 py-1 rounded-full flex items-center gap-1 ${currentPeriod === 'Luar Waktu PdP' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
              🔔 {currentPeriod}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-12">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;