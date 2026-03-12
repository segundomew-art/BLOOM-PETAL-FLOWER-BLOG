import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDp7xW1EI1aCu02LWzI8qtBnLZTDKvFEGQ",
  authDomain: "bloom-petalflower-blog.firebaseapp.com",
  databaseURL: "https://bloom-petalflower-blog-default-rtdb.firebaseio.com",
  projectId: "bloom-petalflower-blog",
  storageBucket: "bloom-petalflower-blog.firebasestorage.app",
  messagingSenderId: "125492654951",
  appId: "1:125492654951:web:1e4a0671bcada6887435c2"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);