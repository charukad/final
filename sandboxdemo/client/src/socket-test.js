// Simple socket connection test
import { io } from 'socket.io-client';

// Use the same URL and parameters as the app
const SERVER_URL = 'http://localhost:5001';
const token = localStorage.getItem('token') || sessionStorage.getItem('token');

console.log('Starting socket connection test...');
console.log('Token available:', !!token);

// Create a socket connection
const socket = io(SERVER_URL, {
  auth: { token },
  timeout: 8000,
  transports: ['websocket', 'polling']
});

// Monitor connection events
socket.on('connect', () => {
  console.log('Socket connected successfully!');
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error.message);
  console.error('Error details:', error);
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
});

// Test for 10 seconds then disconnect
setTimeout(() => {
  console.log('Test completed, disconnecting socket');
  socket.disconnect();
}, 10000); 