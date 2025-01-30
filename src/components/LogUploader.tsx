import React, { useCallback, useState } from 'react';
import { Upload, AlertTriangle } from 'lucide-react';

interface LogUploaderProps {
  onFileUpload: (content: string) => void;
}

export function LogUploader({ onFileUpload }: LogUploaderProps) {
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [onFileUpload]);

  const handleFile = (file: File) => {
    setError('');
    
    if (!file) {
      setError('No file selected');
      return;
    }

    if (!file.name.endsWith('.log') && !file.name.endsWith('.txt')) {
      setError('Please upload a .log or .txt file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content.trim()) {
        setError('The file appears to be empty');
        return;
      }
      onFileUpload(content);
    };
    reader.onerror = () => {
      setError('Error reading file. Please try again.');
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-500'}`}
      >
        <input
          type="file"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
          id="file-upload"
          accept=".log,.txt"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-600">
            Drop your log file here or click to upload
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Supports .log and .txt files
          </p>
        </label>
      </div>
      
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg">
          <AlertTriangle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}