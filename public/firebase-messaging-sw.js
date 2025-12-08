/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging-compat.js');

const config = {
  apiKey: 'AIzaSyDdGb8pIwTgrIFtr8AwxYpiBz1KhDD_ztk',
  authDomain: 'xntv-npsc.firebaseapp.com',
  projectId: 'xntv-npsc',
  storageBucket: 'xntv-npsc.firebasestorage.app',
  messagingSenderId: '1075150774605',
  appId: '1:1075150774605:web:22445969339d6c3e3e5704',
  measurementId: 'G-491Y8BY1EJ',
};

firebase.initializeApp(config);
const messaging = firebase.messaging();
const channel = new BroadcastChannel('f0f33934-1272-4d31-928f-71226e35ccd8');
messaging.onBackgroundMessage((payload) => {
  channel.postMessage(JSON.parse(payload.data.data || '{}'));
});
