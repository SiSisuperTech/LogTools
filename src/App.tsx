import React, { useState } from 'react';
import { LogUploader } from './components/LogUploader';
import { LogSummaryView } from './components/LogSummaryView';
import { parseLogFile } from './utils/logParser';
import { analyzeLogs } from './utils/logAnalyzer';
import { LogSummary } from './types';
import { FileText } from 'lucide-react';

function App() {
  const [summary, setSummary] = useState<LogSummary | null>(null);

  const handleFileUpload = (content: string) => {
    const logs = parseLogFile(content);
    const analysis = analyzeLogs(logs);
    setSummary(analysis);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Log Analyzer</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!summary ? (
          <div className="max-w-2xl mx-auto">
            <LogUploader onFileUpload={handleFileUpload} />
          </div>
        ) : (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Log Analysis Summary</h2>
              <button
                onClick={() => setSummary(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Analyze Another File
              </button>
            </div>
            <LogSummaryView summary={summary} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;