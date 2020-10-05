import Kafka, { KafkaConsumer } from 'node-rdkafka';
import winston from 'winston';
import { IProcessConfig } from './ApplicationProcess';
import { ApplicationServiceProvider } from '../providers/ApplicationServiceProvider';
import { reject } from 'lodash';

export abstract class AbstractConsumerProcess {
  protected readonly _config: IProcessConfig;
  protected readonly _logger: winston.Logger;
  protected readonly _serviceProvider: ApplicationServiceProvider;
  private readonly _consumer: KafkaConsumer;

  protected constructor(
    consumerConfig: IProcessConfig,
    serviceProvider: ApplicationServiceProvider,
    logger: winston.Logger,
  ) {
    this._config = consumerConfig;
    this._logger = logger;
    this._serviceProvider = serviceProvider;
    this._consumer = new Kafka.KafkaConsumer(this._config.process.consumer, {
      'auto.commit.enable': false,
      'enable.auto.commit': false,
    });
  }


  protected async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._consumer.connect({}, (err) => {
        if (err) {
          this._logger.error('Consumer connection error', err);
          reject(err);
        } else {
          this._logger.info('Consumer successfully connected');
        }
      });

      this._consumer.on('ready', () => {
        this._consumer.subscribe([this._config.process.topic]);
        this._consumer.consume();
        this._logger.info('Consumer ready to received messaged');
        resolve();
      });

      this._consumer.on('data', async (message: Kafka.Message) => {
        await this._config.handler(message, this._serviceProvider);
        this._consumer.commit();
      });
    });
  }

  protected async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._consumer.unsubscribe();

      this._consumer.disconnect((err) => {
        if (err) {
          this._logger.error('Consumer failed to disconnect');
          reject(err);
        } else {
          resolve();
        }
      })
    })
  }
}
