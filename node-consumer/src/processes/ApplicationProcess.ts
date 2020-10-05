import { ApplicationServiceProvider } from '../providers/ApplicationServiceProvider';
import winston from 'winston';
import { AbstractConsumerProcess } from './AbstractConsumerProcess';
import { ConsumerGlobalConfig } from 'node-rdkafka';
import { MessageHandler } from '../libs/core/messageHandler';

export interface IProcessConfig {
  process: { exitTimeout: number; topic: string; consumer: ConsumerGlobalConfig };
  handler: MessageHandler;
}

export class ApplicationProcess extends AbstractConsumerProcess {
  constructor(processConfig: IProcessConfig, serviceProvider: ApplicationServiceProvider, logger: winston.Logger) {
    super(processConfig, serviceProvider, logger);
  }

  get topic(): string {
    return this._config.process.topic;
  }

  get exitTimeout(): number {
    return this._config.process.exitTimeout;
  }

  private gracefulShutdown(): void {
    this._serviceProvider.logger.info('Received SIGINT or SIGTERM. Shutting down gracefully...');

    this.stop().finally(() => {
      setTimeout(() => {
        process.exit();
      }, this.exitTimeout);
    });
  }


  private bindProcess() {
    process.on('SIGTERM', this.gracefulShutdown);

    process.on('SIGINT', this.gracefulShutdown);

    process.on('exit', (code) => {
      this._serviceProvider.logger.info(`Process ${this.topic} exited with code ${code}`);
    });

    /** Error events */
    process.on('uncaughtException', (err) => {
      this._serviceProvider.logger.error(`Uncaught Exception: ${err.message}`);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      this._serviceProvider.logger.error('Unhandled rejection at', promise, `reason: ${reason}`);
      process.exit(1);
    });
  }

  async spawn(): Promise<void> {
    try {
      this.bindProcess();
      this._logger.info('Starting application services...');
      await this._serviceProvider.startServices();
      this._logger.info('Starting application process...');
      await this.start();
    } catch (err) {
      this._logger.error('Application process failed', err);
      setTimeout(() => this.destroy(), this._config.process.exitTimeout);
    }
  }

  async destroy(): Promise<void> {
    try {
      this._logger.info('Stopping application services...');
      await this._serviceProvider.stopServices();
      process.exit(0);
    } catch (err) {
      this._logger.info('Failed to stop application services', err);
    }
  }
}
