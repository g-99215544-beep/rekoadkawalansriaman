export interface Period {
  code: string;
  start: string;
  end: string;
}

export interface ClassRecord {
  id?: string;
  // Core Info
  tarikh: string; // DD/MM/YYYY
  masaRekod: string; // HH:mm:ss
  namaGuru: string;
  kelas: string;
  tempat: string;
  
  // Class details
  guruGanti: boolean;
  jenisKelas: 'penuh' | 'pecahan';
  mataPelajaran?: string;
  
  // Attendance Stats
  jumlahMurid: number; // Kept as alias for present
  presentMurid: number;
  totalMurid: number;
  
  // Time Slot Info
  waktu: string; // The specific period for this record (e.g. W3)
  waktuMula?: string; // The start of the block (e.g. W3)
  waktuAkhir?: string; // The end of the block (e.g. W4)
  waktuMengajar: number; // Duration in periods
  
  catatanKeberadaan?: string;

  // Sahsiah / Behavior (Optional in Kawalan, but exists if incident happened)
  jenis?: 'baik' | 'jahat';
  kategori?: string;
  keterangan?: string;
  namaMurid?: string; // Comma separated string
  namaMuridList?: string[]; // Array of strings
}

// Maps to "notifications" node in new structure
export interface NotificationRecord {
  id?: string;
  createdAt?: number;
  tarikh: string;
  masa: string;
  
  kelas: string;
  tempat: string;
  namaGuru: string;
  
  jenis: 'baik' | 'jahat';
  kategori: string;
  keterangan: string;
  namaMurid: string; // String list
  
  status: 'pending' | 'confirmed';
}

export interface ClassData {
  [className: string]: string[]; // Map class name to array of student names
}