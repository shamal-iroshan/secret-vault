import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

declare global {
  interface Window {
    __APP_CONFIG__: {
      firebaseApiKey: string;
      firebaseAuthDomain: string;
      firebaseProjectId: string;
      firebaseStorageBucket: string;
      firebaseMessagingSenderId: string;
      firebaseAppId: string;
    };
  }
}

const config = window.__APP_CONFIG__;

const firebaseConfig = {
  apiKey: config.firebaseApiKey,
  authDomain: config.firebaseAuthDomain,
  projectId: config.firebaseProjectId,
  storageBucket: config.firebaseStorageBucket,
  messagingSenderId: config.firebaseMessagingSenderId,
  appId: config.firebaseAppId,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
