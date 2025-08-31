declare module 'sql.js' {
  interface SqlDatabase {
    run(sql: string, params?: (string | number | Uint8Array | null | boolean)[]): void;
    prepare(sql: string): {
      step(): boolean;
      getAsObject(): Record<string, string | number | Uint8Array | null | boolean>;
      bind(params: (string | number | Uint8Array | null | boolean)[]): void;
      free(): void;
    };
    export(): Uint8Array;
    close(): void;
  }

  interface SqlJs {
    Database: new (data?: Uint8Array) => SqlDatabase;
  }

  interface SqlJsConfig {
    locateFile?: (file: string) => string;
  }

  declare function initSqlJs(config?: SqlJsConfig): Promise<SqlJs>;
  export default initSqlJs;
  export = initSqlJs;
}
