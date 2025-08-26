// src/lib/logger.ts
// Logger modulaire pour le frontend TypeScript

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  enabled?: boolean;
  level?: LogLevel;
  context?: string;
}

const LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error'];

function format(level: LogLevel, message: string, context?: string) {
  const ts = new Date().toISOString();
  return `[${ts}] [${level.toUpperCase()}]${context ? ` [${context}]` : ''} ${message}`;
}

export class Logger {
  private enabled: boolean;
  private level: LogLevel;
  private context?: string;

  constructor(options?: LoggerOptions) {
    this.enabled = options?.enabled ?? true;
    this.level = options?.level ?? 'debug';
    this.context = options?.context;
  }

  private shouldLog(level: LogLevel) {
    return this.enabled && LEVELS.indexOf(level) >= LEVELS.indexOf(this.level);
  }

  debug(msg: string) {
    if (this.shouldLog('debug')) console.debug(format('debug', msg, this.context));
  }
  info(msg: string) {
    if (this.shouldLog('info')) console.info(format('info', msg, this.context));
  }
  warn(msg: string) {
    if (this.shouldLog('warn')) console.warn(format('warn', msg, this.context));
  }
  error(msg: string) {
    if (this.shouldLog('error')) console.error(format('error', msg, this.context));
  }
}

export const logger = new Logger({
  enabled: true,
  level: 'debug',
});
