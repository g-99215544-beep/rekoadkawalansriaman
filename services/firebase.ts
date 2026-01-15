import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, set, update, onValue, query, orderByChild, equalTo, get, DatabaseReference } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDbCgDz2vK2BZUpwM3iDWJcPQSptVcNkv4",
  authDomain: "kehadiran-murid-6ece0.firebaseapp.com",
  databaseURL: "https://kehadiran-murid-6ece0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kehadiran-murid-6ece0",
  storageBucket: "kehadiran-murid-6ece0.firebasestorage.app",
  messagingSenderId: "223849234784",
  appId: "1:223849234784:web:e1471ded7ea17ba60bde05",
  measurementId: "G-4DY138HKTW"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

export const dbRefs = {
  kawalan: ref(db, 'kawalan'),
  notifications: ref(db, 'notifications'), // Used for pending sahsiah/admin alerts
  kehadiran: ref(db, 'kehadiran'),
  absenceStatus: ref(db, 'absenceStatus'),
  classes: ref(db, 'config/classes/classData'),
  holidays: ref(db, 'holidays')
};

export { ref, push, set, update, onValue, query, orderByChild, equalTo, get };
export type { DatabaseReference };