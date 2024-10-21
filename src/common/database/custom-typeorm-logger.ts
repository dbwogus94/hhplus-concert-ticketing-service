/* eslint-disable @typescript-eslint/no-unused-vars */
import { CustomLoggerService } from 'src/global';
import {
  LogLevel,
  QueryRunner,
  Logger as TypeOrmLogger,
  LoggerOptions as TypeOrmLoggerOptions,
} from 'typeorm';

export class CustomTypeormLogger implements TypeOrmLogger {
  static logLevelParser(loggings: any): TypeOrmLoggerOptions {
    const levels = [
      'query',
      'schema',
      'error',
      'warn',
      'info',
      'log',
      'migration',
    ];

    if (typeof loggings === 'boolean') return loggings;
    if (loggings === 'all') return loggings;
    if (typeof loggings === 'string') {
      const arr = loggings.split(',');
      const logLevels = arr.filter((item) => levels.includes(item.trim()));
      return logLevels as LogLevel[];
    }
  }

  constructor(
    private readonly _logger: CustomLoggerService,
    private readonly _options: TypeOrmLoggerOptions,
  ) {
    _logger.setTarget(`TypeORM`);
  }

  /**
   * Logs query and parameters used in it.
   */
  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
    if (
      this._options === 'all' ||
      this._options === true ||
      (this._options instanceof Array && this._options.indexOf('query') !== -1)
    ) {
      const sql =
        query +
        (parameters && parameters.length
          ? ' -- PARAMETERS: ' + this.stringifyParams(parameters)
          : '');
      this._logger.log('query' + ': ' + sql);
    }
  }

  /**
   * Logs query that is failed.
   */
  logQueryError(
    error: string,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ) {
    if (
      this._options === 'all' ||
      this._options === true ||
      (this._options instanceof Array && this._options.indexOf('error') !== -1)
    ) {
      const sql =
        query +
        (parameters && parameters.length
          ? ' -- PARAMETERS: ' + this.stringifyParams(parameters)
          : '');
      this._logger.error(`query failed: ` + sql);
      this._logger.error(error);
    }
  }

  /**
   * Logs query that is slow.
   */
  logQuerySlow(
    time: number,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ) {
    const sql =
      query +
      (parameters && parameters.length
        ? ' -- PARAMETERS: ' + this.stringifyParams(parameters)
        : '');
    this._logger.warn(`query is slow: ` + sql);
    this._logger.warn(`execution time: ` + time);
  }

  /**
   * Logs events from the schema build process.
   */
  logSchemaBuild(message: string, queryRunner?: QueryRunner) {
    if (
      this._options === 'all' ||
      (this._options instanceof Array && this._options.indexOf('schema') !== -1)
    ) {
      this._logger.log(message);
    }
  }

  /**
   * Logs events from the migrations run process.
   */
  logMigration(message: string, queryRunner?: QueryRunner) {
    this._logger.log(message);
  }

  /**
   * Perform logging using given logger, or by default to the this._logger.
   * Log has its own level and message.
   */
  log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner) {
    switch (level) {
      case 'log':
        if (
          this._options === 'all' ||
          (this._options instanceof Array &&
            this._options.indexOf('log') !== -1)
        )
          this._logger.log(message);
        break;
      case 'info':
        if (
          this._options === 'all' ||
          (this._options instanceof Array &&
            this._options.indexOf('info') !== -1)
        )
          this._logger.debug(message);
        break;
      case 'warn':
        if (
          this._options === 'all' ||
          (this._options instanceof Array &&
            this._options.indexOf('warn') !== -1)
        )
          this._logger.warn(message);
        break;
    }
  }

  /**
   * Converts parameters to a string.
   * Sometimes parameters can have circular objects and therefor we are handle this case too.
   */
  protected stringifyParams(parameters: any[]) {
    try {
      return JSON.stringify(parameters);
    } catch (error) {
      // most probably circular objects in parameters
      return parameters;
    }
  }
}
