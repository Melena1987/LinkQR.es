import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

// Cast import.meta to any to resolve TS error: Property 'env' does not exist on type 'ImportMeta'
const env = (import.meta as any).env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const app = firebase.app();
export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();
export const googleProvider = new firebase.auth.GoogleAuthProvider();

export default firebase;