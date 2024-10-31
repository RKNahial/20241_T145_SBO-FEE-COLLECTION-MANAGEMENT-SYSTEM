// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAziALsbDdnnDYcP9u6JwGm9oHv7Y3OR2c",
  authDomain: "api-8cff5.firebaseapp.com",
  projectId: "api-8cff5",
  storageBucket: "api-8cff5.appspot.com",
  messagingSenderId: "816908034033",
  appId: "1:816908034033:web:7af600b928ad86a930ae50",
  measurementId: "G-528R7EP8RF"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export default app