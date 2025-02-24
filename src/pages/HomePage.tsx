import React, { useEffect, useState, useCallback } from 'react';
import { TicketForm } from '../components/TicketForm';
import { RecentTickets } from '../components/RecentTickets';
import { UsefulLinks } from '../components/UsefulLinks';
import { Upload, FileUp, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

interface YandexDiskUploadResponse {
  href: string;
}

const YANDEX_TOKEN = "y0__xDF1u-PARjblgMg24y4khIlBeidpFbnhxA4Vw55vy3IvfvjPQ";

export function HomePage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isYandexAuthorized, setIsYandexAuthorized] = useState<boolean | null>(null); // null = loading
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Request notification permission
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);

        // Check Yandex token
        await checkYandexToken();
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsLoading(false);
      }

      const handleBeforeInstallPrompt = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
        console.log('beforeinstallprompt event fired');
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };

    initialize();
  }, []);

  const checkYandexToken = async () => {
    try {
      const response = await fetch('https://cloud-api.yandex.net/v1/disk/', {
        headers: { Authorization: `OAuth ${YANDEX_TOKEN}` }
      });
      setIsYandexAuthorized(response.ok);
      console.log('Yandex authorization status:', response.ok);
    } catch (error) {
      setIsYandexAuthorized(false);
      console.error('Yandex token check error:', error);
    }
  };

  const uploadFile = async (file: File, index: number) => {
    try {
      await fetch('https://cloud-api.yandex.net/v1/disk/resources?path=Обмен', {
        method: 'PUT',
        headers: { Authorization: `OAuth ${YANDEX_TOKEN}` }
      });

      const uploadResponse = await fetch(
        `https://cloud-api.yandex.net/v1/disk/resources/upload?path=Обмен/${file.name}&overwrite=true`,
        {
          headers: { Authorization: `OAuth ${YANDEX_TOKEN}` }
        }
      );

      const uploadData: YandexDiskUploadResponse = await uploadResponse.json();

      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'uploading' } : f
      ));

      const uploadResult = await fetch(uploadData.href, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      });

      if (uploadResult.ok) {
        setFiles(prev => prev.map((f, i) => 
          i === index ? { ...f, status: 'success', progress: 100 } : f
        ));
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'error', error: 'Ошибка загрузки' } : f
      ));
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending' as const,
      progress: 0
    }));
    setFiles(prev => [...prev, ...newFiles]);
    acceptedFiles.forEach((file, index) => uploadFile(file, files.length + index));
  }, [files.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  });

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'uploading': return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default: return <FileUp className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        console.log(choiceResult.outcome === 'accepted' 
          ? 'User accepted the A2HS prompt' 
          : 'User dismissed the A2HS prompt');
        setDeferredPrompt(null);
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Добро пожаловать на главную страницу!</h1>
      <p className="mt-4">Здесь вы можете найти информацию о тикетах, FAQ и чате.</p>

      <div className="grid md:grid-cols-3 gap-8 mt-8">
        <div className="md:col-span-2 space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Создать тикет</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <TicketForm />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Загрузка файлов в Обмен</h2>
            {isYandexAuthorized === false ? (
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-600">Ошибка подключения к Яндекс.Диску</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                    transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Перетащите файлы сюда или кликните для выбора</p>
                  <p className="text-sm text-gray-500 mt-2">PDF, PNG, JPG, DOC, DOCX</p>
                </div>

                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          {getStatusIcon(file.status)}
                          <div>
                            <p className="text-sm font-medium text-gray-800">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} МБ
                            </p>
                            {file.error && <p className="text-xs text-red-500">{file.error}</p>}
                          </div>
                        </div>
                        {file.status === 'uploading' && (
                          <div className="w-24">
                            <div className="h-1 bg-gray-200 rounded-full">
                              <div
                                className="h-1 bg-blue-500 rounded-full transition-all duration-300"
                                style={{ width: `${file.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">История тикетов</h2>
            <RecentTickets />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Полезные ссылки</h2>
            <UsefulLinks />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleInstallClick}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Установить приложение
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Графика</h2>
        <ul className="list-disc pl-5">
          <li>
            <a href="/files/logo.svg" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              logo.svg
            </a>
          </li>
          <li>
            <a href="/files/logo.png" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              logo.png
            </a>
          </li>
        </ul>
      </div>

      {/* Debug Info */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold">Debug Info</h3>
        <pre className="text-sm">
          {JSON.stringify({
            isLoading,
            isYandexAuthorized,
            filesCount: files.length,
            deferredPrompt: !!deferredPrompt
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}