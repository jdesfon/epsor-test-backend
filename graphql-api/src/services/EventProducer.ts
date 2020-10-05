import Kafka, { Producer } from 'node-rdkafka';
import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';

import { IApplicationService } from '../providers/ApplicationServiceProvider';
import { Product, CreateProductInput } from '../entities/product';

export interface IEventProducerConfig {
  topic: string;
  producer: Kafka.ProducerGlobalConfig;
}

export class EventProducer implements IApplicationService {
  private readonly config: IEventProducerConfig;
  private readonly producer: Producer;
  private readonly logger: winston.Logger;
  private pollInterval: NodeJS.Timeout | undefined;
  public isStarted = false;

  constructor(config: IEventProducerConfig, logger: winston.Logger) {
    this.config = config;
    this.logger = logger;

    this.producer = new Kafka.Producer(config.producer, { 'request.required.acks': 1 });
  }

  setPollInterval(): void {
    this.pollInterval = setInterval(() => {
      this.producer.poll();
    }, 1000);
  }

  bindEvents(): void {
    this.producer.on('event.error', (err) => {
      this.logger.error('event.error', err);
    });
  }

  start(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.isStarted) {
        this.producer.connect({}, (err) => {
          if (err) {
            reject(this.isStarted);
          }
          this.logger.info('Producer successfully connected')
        });

        this.producer.on('ready', () => {
          this.setPollInterval();
          this.bindEvents();
          this.isStarted = true;
        });
      }
      resolve(this.isStarted);
    });
  }

  stop(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.isStarted) {
        clearInterval(this.pollInterval);
        this.producer.disconnect((err) => {
          if (err) {
            reject(this.isStarted);
          }

          resolve(this.isStarted);
        });
      }

      resolve(this.isStarted);
    });
  }

  sendCreateProductEvent(event: CreateProductInput): Promise<CreateProductInput> {
    return new Promise((resolve, _) => {
      this.producer.produce(
        this.config.topic,
        null,
        Buffer.from(JSON.stringify(event)),
        uuidv4(),
        Date.now(),
      );

      this.producer.on('delivery-report', (err, report) => {
        if (err) {
          this.logger.error(err);
        }
        this.logger.info(report.key.toString());
        resolve({ ...event } as Product);
      });
    });
  }
}
