// App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TicketsPage } from './pages/TicketsPage';
import { FaqPage } from './pages/FaqPage';
import { AdminPage } from './pages/AdminPage';

import { Navbar } from './components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  useEffect(() => {
    const requestNotificationPermission = async () => {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Уведомления разрешены');
      } else {
        console.log('Уведомления отклонены');
      }
    };

    requestNotificationPermission();
  }, []);

  return (
    <Router basename="/">
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<TicketsPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;