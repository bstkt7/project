import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Auth({ setIsAuthenticated, setUserName }: { setIsAuthenticated: (value: boolean) => void; setUserName: (name: string) => void; }) {
  const [userName, setUserNameInput] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: userName,
      password,
    });

    if (error) {
      setError(error.message);
      setSuccessMessage('');
    } else {
      setIsAuthenticated(true);
      setUserName(userName);
      setError('');
      setSuccessMessage('');

      setTimeout(() => {
        navigate('/');
      }, 3000);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
      email: userName,
      password,
    });

    if (error) {
      setError(error.message);
      setSuccessMessage('');
    } else {
      setIsAuthenticated(true);
      setUserName(userName);
      setError('');
      setSuccessMessage('');

      setTimeout(() => {
        navigate('/');
      }, 3000);
    }
  };

  return (
    <div className="max-w-md mx-auto" style={{ marginTop: '20px' }}>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-center mb-6">{isRegistering ? 'Регистрация' : 'Вход'}</h1>
        <form onSubmit={isRegistering ? handleRegister : handleLogin}>
          <div className="flex items-center border rounded mb-4">
            <User className="w-5 h-5 text-gray-400 ml-2" />
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserNameInput(e.target.value)}
              placeholder="Введите ваш email"
              className="w-full px-4 py-2 rounded border focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex items-center border rounded mb-4">
            <Lock className="w-5 h-5 text-gray-400 ml-2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              className="w-full px-4 py-2 rounded border focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {successMessage && <p className="text-green-500 text-sm mt-2">{successMessage}</p>}
          <button
            type="submit"
            className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            {isRegistering ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </form>
        <p className="text-center mt-4">
          {isRegistering ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-blue-600 hover:underline"
          >
            {isRegistering ? ' Войти' : ' Зарегистрироваться'}
          </button>
        </p>
      </div>
    </div>
  );
}