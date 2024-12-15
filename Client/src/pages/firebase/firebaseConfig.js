// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCxddxhYH3tXuU8ydXNypF3Junm0h28G2M",
  authDomain: "cot-sbo-fee-collection-system.firebaseapp.com",
  projectId: "cot-sbo-fee-collection-system",
  storageBucket: "cot-sbo-fee-collection-system.firebasestorage.app",
  messagingSenderId: "191454366253",
  appId: "1:191454366253:web:43f0ebfe87a9f6d79306a4",
  measurementId: "G-WBXL5VM2ZX"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export { app, analytics };
export default app