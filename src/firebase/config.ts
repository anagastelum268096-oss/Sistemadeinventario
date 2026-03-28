import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCPoPzefgRy9hQnN36CjY59-hEHQXY_opI",
  authDomain: "inventario-escolar-330c3.firebaseapp.com",
  projectId: "inventario-escolar-330c3",
  storageBucket: "inventario-escolar-330c3.firebasestorage.app",
  messagingSenderId: "78565193767",
  appId: "1:78565193767:web:f95cfdd18e8b1d853f3602"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
