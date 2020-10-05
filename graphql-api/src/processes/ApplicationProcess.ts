import { AbstractWebProcess, IWebProcessConfig } from './AbstractWebProcess';
import { ApplicationServiceProvider } from '../providers/ApplicationServiceProvider';
import Logger from '../libs/logger';

interface IProcesConfig {
  name: string;
  exitTimeout: number;
}

export interface IApplicationProcessConfig {
  process: IProcesConfig;
  web: IWebProcessConfig;
}

export class ApplicationProcess extends AbstractWebProcess {
  private readonly _processConfig: IProcesConfig;
  constructor(serviceProvider: ApplicationServiceProvider, config: IApplicationProcessConfig) {
    super(serviceProvider, config.web);
    this._processConfig = config.process;
  }

  get name(): string {
    return this._processConfig.name;
  }

  get exitTimeout(): number {
    return this._processConfig.exitTimeout;
  }

  gracefulShutdown(): void {
    this._serviceProvider.logger.info('Received SIGINT or SIGTERM. Shutting down gracefully...');

    this.stop().finally(() => {
      setTimeout(() => {
        process.exit();
      }, this.exitTimeout);
    });
  }

  bindProcess(): void {
    // A process monitor will send a SIGTERM signal to successfully terminate a process
    process.on('SIGTERM', this.gracefulShutdown);

    // Its emitted when the process is interrupted (^C)
    process.on('SIGINT', this.gracefulShutdown);

    process.on('exit', (code) => {
      Logger.info(`Process ${this.name} exited with code ${code}`);
    });

    /** Error events */
    process.on('uncaughtException', (err) => {
      Logger.error(`Uncaught Exception: ${err.message}`);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      Logger.error('Unhandled rejection at', promise, `reason: ${reason}`);
      process.exit(1);
    });
  }

  async spawn(): Promise<boolean> {
    try {
      this.bindProcess();
      await this._serviceProvider.startServices();
      await this.start();
      return true;
    } catch (err) {
      throw err;
    }
  }
}
