export interface LogEntry {
  timestamp: Date;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  details?: string;
}

export interface LogSummary {
  totalErrors: number;
  totalWarnings: number;
  errorsByType: Record<string, number>;
  recentErrors: LogEntry[];
  lastUpdated: Date;
  errorsByDay?: Record<string, number>;
  warningsByDay?: Record<string, number>;
}