import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAgHJNZ0hPdK9QUaXdxKLTX9ku8szsmdFI",
  authDomain: "flix-net-bd1.firebaseapp.com",
  databaseURL: "https://flix-net-bd1-default-rtdb.firebaseio.com",
  projectId: "flix-net-bd1",
  storageBucket: "flix-net-bd1.firebasestorage.app",
  messagingSenderId: "277577167146",
  appId: "1:277577167146:web:4787722732514dd20aae53",
  measurementId: "G-LWGY452H4L",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);

export { app, db };
