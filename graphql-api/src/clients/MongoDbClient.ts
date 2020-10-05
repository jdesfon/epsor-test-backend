import winston from 'winston';
import { MongoClient, MongoClientOptions, Cursor } from 'mongodb';

import { IApplicationService } from '../providers/ApplicationServiceProvider';
import { Product } from '../entities/product';

export interface IMongoDbConfig {
  uri: string;
  database: string;
  collection: string;
  options: MongoClientOptions;
}

export class MongoDbClient implements IApplicationService {
  public isStarted = false;
  private readonly _logger: winston.Logger;
  private readonly _config: IMongoDbConfig;
  private _connection: MongoClient | undefined;

  constructor(config: IMongoDbConfig, logger: winston.Logger) {
    this._config = config;
    this._logger = logger;
  }

  async getProducts(): Promise<Product[]> {
    try {
      const db = this._connection?.db(this._config.database);
      const collection = db?.collection<Product>(this._config.collection);
      return collection.find({}).toArray();
    } catch (err) {
      this._logger.error('Get Products error', err);
    }
  }

  async start(): Promise<boolean> {
    try {
      if (!this.isStarted) {
        this._logger.info(`Starting MongoDbClient: ${JSON.stringify(this._config)}`);
        this._connection = await MongoClient.connect(this._config.uri, this._config.options);
        this._logger.info(`MongoDbClient connection established`);
        this.isStarted = true;
      }
      return this.isStarted;
    } catch (err) {
      this._logger.error(`MongoDbClient connection error: ${err.toString()}`);
    } finally {
      return this.isStarted;
    }
  }

  async stop(): Promise<boolean> {
    try {
      if (this.isStarted) {
        await this._connection?.close();
        this.isStarted = false;
      }
      return true;
    } catch (err) {
      this._logger.error(`MongoDbClient connection close err: ${err.toString()}`);
    } finally {
      return this.isStarted;
    }
  }
}
