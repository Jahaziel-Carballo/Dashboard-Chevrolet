// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDhp-2G-fjgSEZPJg3x210WkPkvy62SZAU",
  authDomain: "dashboard-auth-ea87e.firebaseapp.com",
  projectId: "dashboard-auth-ea87e",
  storageBucket: "dashboard-auth-ea87e.appspot.com",
  messagingSenderId: "987231433379",
  appId: "1:987231433379:web:7c6b7a9b4c8e5d1f8a4c2c"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Authentication y exportarlo
export const auth = getAuth(app);
export default app;