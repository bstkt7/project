// FileUpload.tsx
import React, { useState, useCallback } from 'react';
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

export function FileUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isYandexAuthorized, setIsYandexAuthorized] = useState<boolean | null>(null);

  React.useEffect(() => {
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

    checkYandexToken();
  }, []);

  const uploadFile = async (file: File, index: number) => {
    if (isYandexAuthorized === false) {
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'error', error: 'Яндекс.Диск недоступен' } : f
      ));
      return;
    }

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

  if (isYandexAuthorized === null) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-center items-center">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          <span className="ml-2">Проверка подключения...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Загрузка файлов в Обмен</h2>
      
      {isYandexAuthorized === false ? (
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-600">Ошибка подключения к Яндекс.Диску</p>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}