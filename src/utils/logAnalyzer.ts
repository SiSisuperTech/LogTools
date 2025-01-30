import { LogEntry, LogSummary } from '../types';

export function analyzeLogs(logs: LogEntry[]): LogSummary {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  // Filter logs from the last month
  const recentLogs = logs.filter(log => log.timestamp >= oneMonthAgo);

  const errorsByType: Record<string, number> = {};
  let totalErrors = 0;
  let totalWarnings = 0;

  recentLogs.forEach(log => {
    if (log.level === 'error') {
      totalErrors++;
      const errorType = getErrorType(log.message);
      errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
    } else if (log.level === 'warn') {
      totalWarnings++;
    }
  });

  const recentErrors = recentLogs
    .filter(log => log.level === 'error')
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10);

  return {
    totalErrors,
    totalWarnings,
    errorsByType,
    recentErrors,
    lastUpdated: new Date(),
  };
}

function getErrorType(message: string): string {
  // Extract error type from common patterns
  const errorTypeMatch = message.match(/^(\w+(?:Error|Exception))/);
  if (errorTypeMatch) {
    return errorTypeMatch[1];
  }
  
  // Fallback to categorizing by first few words
  return message.split(/[\s:]/)[0] || 'Unknown Error';
}