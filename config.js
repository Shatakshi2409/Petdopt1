import firebase from 'firebase';
require('@firebase/firestore')

var firebaseConfig = {
  apiKey: "AIzaSyD9H4OWIQYyoJddJbN9-H-7KcsdqVNbpzA",
  authDomain: "petdopt-98946.firebaseapp.com",
  projectId: "petdopt-98946",
  storageBucket: "petdopt-98946.appspot.com",
  messagingSenderId: "33624275873",
  appId: "1:33624275873:web:f349eeb13a3d7f574c29e0"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase.firestore();
