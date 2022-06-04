// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC1FtCFCuUflbHTl-47IZYNFqmMX9Xu9IQ",
  authDomain: "clone-de9fd.firebaseapp.com",
  projectId: "clone-de9fd",
  storageBucket: "clone-de9fd.appspot.com",
  messagingSenderId: "1003557224960",
  appId: "1:1003557224960:web:f0dd63f9939bee97958ee5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider()
const db = getFirestore(app)

export { auth, provider, db }