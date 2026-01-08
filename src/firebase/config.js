import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration with direct values (for local development)
// NOTE: These will be replaced with environment variables for production deployment
const firebaseConfig = {
    apiKey: "AIzaSyAdhJTVXwC-6zN8Ox8Y9m1-OoyhPqsLkkE",
    authDomain: "smart-issueboard-d2e07.firebaseapp.com",
    projectId: "smart-issueboard-d2e07",
    storageBucket: "smart-issueboard-d2e07.firebasestorage.app",
    messagingSenderId: "962825326498",
    appId: "1:962825326498:web:70a759b9d252ceb3512cfb",
    measurementId: "G-E5KM142R7L"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
