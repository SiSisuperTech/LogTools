import { LogEntry } from '../types';

export function parseLogFile(content: string): LogEntry[] {
  const lines = content.split('\n').filter(line => line.trim());
  const logs: LogEntry[] = [];
  
  // Extended set of log patterns to match more formats
  const patterns = [
    // ISO date + level + message
    /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)\s+(\w+)\s+(.+)$/,
    // Common date format + level + message
    /^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}(?:\.\d+)?)\s+(\w+)\s+(.+)$/,
    // Date with brackets + level + message
    /^\[(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}(?:\.\d+)?)\]\s+(\w+)\s+(.+)$/,
    // Timestamp + level + message
    /^(\d{10,13}(?:\.\d+)?)\s+(\w+)\s+(.+)$/,
    // Level + timestamp + message
    /^(\w+)\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}(?:\.\d+)?)\s+(.+)$/,
    // Simple level + message (uses current date)
    /^(\w+):\s+(.+)$/
  ];

  let unparsedLines = 0;
  
  lines.forEach((line, index) => {
    let parsed = false;

    // Try each pattern
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        let timestamp: Date;
        let level: string;
        let message: string;

        if (pattern.toString().includes('\\w+):\\s+')) {
          // Handle simple "level: message" format
          [, level, message] = match;
          timestamp = new Date();
        } else if (pattern.toString().includes('\\d{10,13}')) {
          // Handle Unix timestamp format
          const [, ts, lvl, msg] = match;
          timestamp = new Date(Number(ts) * (ts.length === 10 ? 1000 : 1));
          level = lvl;
          message = msg;
        } else if (pattern.toString().includes('(\\w+)\\s+(\\d{4}')) {
          // Handle "level timestamp message" format
          const [, lvl, ts, msg] = match;
          timestamp = new Date(ts);
          level = lvl;
          message = msg;
        } else {
          // Handle standard formats
          const [, ts, lvl, msg] = match;
          timestamp = new Date(ts);
          level = lvl;
          message = msg;
        }

        // Normalize log level
        const normalizedLevel = normalizeLogLevel(level.toLowerCase());
        
        if (isValidDate(timestamp)) {
          logs.push({
            timestamp,
            level: normalizedLevel,
            message: message.trim(),
            details: ''
          });
          parsed = true;
          break;
        }
      }
    }

    if (!parsed) {
      unparsedLines++;
      // Add as an info message if we couldn't parse it
      logs.push({
        timestamp: new Date(),
        level: 'info',
        message: line.trim(),
        details: ''
      });
    }
  });

  // Process multi-line error details
  for (let i = 0; i < logs.length; i++) {
    if (logs[i].level === 'error' && i + 1 < logs.length) {
      let details = '';
      let j = i + 1;
      
      // Collect lines that look like stack traces or error details
      while (j < logs.length && (
        logs[j].message.startsWith('  at ') || 
        logs[j].message.startsWith('    ') ||
        logs[j].message.match(/^\w+Error:/) ||
        logs[j].message.match(/^Caused by:/)
      )) {
        details += logs[j].message + '\n';
        j++;
      }
      
      if (details) {
        logs[i].details = details.trim();
        // Remove the detail lines from the main log array
        logs.splice(i + 1, j - (i + 1));
      }
    }
  }

  if (unparsedLines > 0) {
    console.warn(`Warning: ${unparsedLines} lines couldn't be parsed with standard patterns`);
  }

  return logs;
}

function normalizeLogLevel(level: string): LogEntry['level'] {
  // Map common log level variations to our standard levels
  const levelMap: Record<string, LogEntry['level']> = {
    error: 'error',
    err: 'error',
    fatal: 'error',
    warn: 'warn',
    warning: 'warn',
    info: 'info',
    information: 'info',
    debug: 'debug',
    trace: 'debug',
    verbose: 'debug'
  };

  return levelMap[level] || 'info';
}

function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}