import winston from 'winston';
import { MongoClient, MongoClientOptions } from 'mongodb';

import { IApplicationService } from '../providers/ApplicationServiceProvider';
import { CreateProductDto } from '../dto/product';

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

  async saveProduct(product: CreateProductDto): Promise<void> {
    try {
      this._logger.info(`Inserting new Product: ${JSON.stringify(product)}`);
      const db = this._connection?.db(this._config.database);
      const collection = db?.collection(this._config.collection);
      await collection.insertOne(product);
    } catch (err) {
      this._logger.error(`Insert Product error: ${err.toString()}`);
      throw err;
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
