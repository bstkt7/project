import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TicketsPage } from './pages/TicketsPage';
import { FaqPage } from './pages/FaqPage';
import { AdminPage } from './pages/AdminPage';
import { ChatPage } from './pages/ChatPage';
import { Navbar } from './components/Navbar';

function App() {
  return (
    <Router basename="/">
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<TicketsPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/chat" element={<ChatPage />} />
            {/* Редирект для несуществующих путей */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;