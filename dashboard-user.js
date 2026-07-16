import { initializeApp, getApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const firebaseConfig = {
  apiKey: 'AIzaSyArtybAAgMFeLv1K9b_0GhSh66oYWuDLco',
  authDomain: 'news-82329.firebaseapp.com',
  projectId: 'news-82329',
  storageBucket: 'news-82329.firebasestorage.app',
  messagingSenderId: '29851688400',
  appId: '1:29851688400:web:7a9c17b2bf758ca76aadd5'
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const userChip = document.getElementById('dashboardUser');
const userPhoto = document.getElementById('dashboardUserPhoto');
const userName = document.getElementById('dashboardUserName');
const userEmail = document.getElementById('dashboardUserEmail');

onAuthStateChanged(auth, (user) => {
  if (!user) {
    userChip.hidden = true;
    return;
  }
  userName.textContent = user.displayName || 'Hirauli member';
  userEmail.textContent = user.email || 'Signed in';
  userPhoto.src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'Hirauli')}`;
  userPhoto.alt = `${user.displayName || 'User'} profile photo`;
  userChip.hidden = false;
});
