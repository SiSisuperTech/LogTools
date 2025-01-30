import React from 'react';
import { AlertTriangle, AlertCircle, Clock, Activity, BarChart3 } from 'lucide-react';
import { LogSummary } from '../types';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chart.js/auto';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface LogSummaryViewProps {
  summary: LogSummary;
}

export function LogSummaryView({ summary }: LogSummaryViewProps) {
  // Prepare data for error trend chart
  const errorsByDay = new Map<string, number>();
  const warningsByDay = new Map<string, number>();
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  summary.recentErrors.forEach(error => {
    const day = error.timestamp.toISOString().split('T')[0];
    errorsByDay.set(day, (errorsByDay.get(day) || 0) + 1);
  });

  const trendData = {
    labels: last30Days,
    datasets: [
      {
        label: 'Errors',
        data: last30Days.map(day => errorsByDay.get(day) || 0),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  // Prepare data for error types distribution
  const errorTypesData = {
    labels: Object.keys(summary.errorsByType),
    datasets: [{
      data: Object.values(summary.errorsByType),
      backgroundColor: [
        'rgb(239, 68, 68)',
        'rgb(249, 115, 22)',
        'rgb(234, 179, 8)',
        'rgb(59, 130, 246)',
        'rgb(168, 85, 247)',
      ],
    }]
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-red-50 p-6 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-red-700">Total Errors</h3>
              <p className="text-2xl font-bold text-red-600">{summary.totalErrors}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 p-6 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-yellow-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-700">Total Warnings</h3>
              <p className="text-2xl font-bold text-yellow-600">{summary.totalWarnings}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-blue-700">Last Updated</h3>
              <p className="text-sm text-blue-600">
                {summary.lastUpdated.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Activity className="w-6 h-6 text-gray-500 mr-2" />
            <h3 className="text-lg font-semibold">Error Trend (Last 30 Days)</h3>
          </div>
          <div className="h-64">
            <Line
              data={trendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  },
                  x: {
                    ticks: {
                      maxRotation: 45,
                      minRotation: 45
                    }
                  }
                },
                plugins: {
                  legend: {
                    position: 'top' as const,
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-6 h-6 text-gray-500 mr-2" />
            <h3 className="text-lg font-semibold">Error Types Distribution</h3>
          </div>
          <div className="h-64">
            <Doughnut
              data={errorTypesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right' as const,
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Errors</h3>
        <div className="space-y-4">
          {summary.recentErrors.map((error, index) => (
            <div key={index} className="border-l-4 border-red-500 pl-4 py-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>{error.timestamp.toLocaleString()}</span>
              </div>
              <p className="text-gray-800 mt-1">{error.message}</p>
              {error.details && (
                <pre className="mt-2 text-sm bg-gray-50 p-2 rounded overflow-x-auto">
                  {error.details}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>

      <footer className="flex items-center justify-between p-4 border-t mt-8">
        <div className="flex items-center space-x-4">
          <a 
            href="https://www.allisone.ai" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <img
              src="https://cdn.prod.website-files.com/631227b270907aee551e1be7/631227b270907a46f11e1d2d_6297b1fc9b01428b8aeca276_616d28040c6cdfc86851f1f3_logo%20%2B%20name%20Dark%20blue-p-500.png"
              alt="AllIsOne Logo"
              className="h-6 w-auto object-contain"
            />
          </a>
          <span className="text-sm text-gray-500 border-l pl-4">Log Analyzer</span>
        </div>
        <div className="text-xs text-gray-400">@sisi</div>
      </footer>
    </div>
  );
}