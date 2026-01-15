import { Period } from './types';

export const TOTAL_WAKTU = 13;

export const PERIODS: Period[] = [
  {code:"W1",start:"7.40",end:"8.10"},
  {code:"W2",start:"8.10",end:"8.40"},
  {code:"W3",start:"8.40",end:"9.10"},
  {code:"W4",start:"9.10",end:"9.40"},
  {code:"W5",start:"9.40",end:"10.10"},
  {code:"W6",start:"10.10",end:"10.40"},
  {code:"W7",start:"10.40",end:"11.10"},
  {code:"W8",start:"11.10",end:"11.40"},
  {code:"W9",start:"11.40",end:"12.10"},
  {code:"W10",start:"12.10",end:"12.40"},
  {code:"W11",start:"12.40",end:"13.10"},
  {code:"W12",start:"13.10",end:"13.40"},
  {code:"W13",start:"13.40",end:"14.10"}
];

export const TEMPAT_OPTIONS = [
  "KELAS", "MAKMAL KOMPUTER", "KANTIN", "SURAU", "DEWAN",
  "BILIK JQAF", "BILIK MUZIK", "BILIK BC", "BILIK BA", 
  "BILIK PEMULIHAN", "LAIN-LAIN"
];

export const MP_OPTIONS = ["BC", "BA", "PEMULIHAN"];

export const SAHSIAH_BAIK_CATS = [
  "Adab dan Berbudi Bahasa", "Akhlak Mulia", 
  "Kebersihan Diri & Persekitaran", "Keselamatan Diri"
];

export const SAHSIAH_JAHAT_CATS = [
  "Barang Larangan", "Kekemasan Diri", "Kenakalan", 
  "Ponteng / Lewat Hadir", "Kes Khas", "Kesalahan Asrama"
];

export const ADMIN_PASSWORD = "admin123";

// Helper to convert time "HH.MM" to minutes for comparison
export const timeToMinutes = (str: string) => {
  const [h, m] = str.split(".").map(Number);
  return h * 60 + m;
};

export const getCurrentPeriod = (): Period | null => {
  const now = new Date();
  const mn = now.getHours() * 60 + now.getMinutes();
  for (const p of PERIODS) {
    const s = timeToMinutes(p.start), e = timeToMinutes(p.end);
    if (mn >= s && mn < e) return p;
  }
  return null;
};

export const formatDate = (d: Date) => {
  return String(d.getDate()).padStart(2, "0") + "/" + 
         String(d.getMonth() + 1).padStart(2, "0") + "/" + 
         d.getFullYear();
};

export const formatTime = (d: Date) => {
  return String(d.getHours()).padStart(2, "0") + ":" + 
         String(d.getMinutes()).padStart(2, "0") + ":" + 
         String(d.getSeconds()).padStart(2, "0");
};