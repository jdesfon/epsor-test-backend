import { MongoDbClient, IMongoDbConfig } from '../clients/MongoDbClient';
import winston from 'winston';

export interface IApplicationService {
  start: () => Promise<boolean>;
  stop: () => Promise<boolean>;
}

interface IServiceContainer {
  mongoDb: MongoDbClient;
}

interface IApplicationConfig {
  mongoDb: IMongoDbConfig;
}

export class ApplicationServiceProvider {
  private readonly _serviceContainer: IServiceContainer;
  private readonly _config: IApplicationConfig;
  private readonly _logger: winston.Logger;

  constructor(appConfig: IApplicationConfig, logger: winston.Logger) {
    this._config = appConfig;
    this._logger = logger;

    this._serviceContainer = {
      mongoDb: new MongoDbClient(this._config.mongoDb, logger),
    };
  }

  get mongoDb(): MongoDbClient {
    return this._serviceContainer.mongoDb;
  }

  get logger(): winston.Logger {
    return this._logger;
  }

  async startServices(): Promise<boolean> {
    try {
      const promises = Object.values(this._serviceContainer).map((service) => service.start());
      await Promise.all(promises);
      return true;
    } catch (err) {
      this._logger.error('Start services failed', err);
      await this.stopServices();
      return false;
    }
  }

  async stopServices(): Promise<boolean> {
    try {
      this._logger.error('Stopping all services');
      const promises = Object.values(this._serviceContainer).map((service) => service.stop());
      await Promise.all(promises);
      return true;
    } catch (err) {
      this._logger.error('Stop services failed', err);
      return false;
    }
  }
}
