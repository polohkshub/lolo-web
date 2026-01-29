import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBGPtrGIJKsOIPe7cZTDsn0fGSNLHQt8UY",
  authDomain: "lolo-sobre-ruedas.firebaseapp.com",
  projectId: "lolo-sobre-ruedas",
  storageBucket: "lolo-sobre-ruedas.firebasestorage.app",
  messagingSenderId: "501717933768",
  appId: "1:501717933768:web:aec8a9fde1408927830ffd"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);