import Kafka from 'node-rdkafka';
import { IMongoDbConfig } from '../clients/MongoDbClient';

export default {
  applicationProcess: {
    process: {
      name: 'application process',
      exitTimeout: 3000,
    },
    web: {
      port: 5000,
    },
  },
  services: {
    mongoDb: {
      uri: 'mongodb://mongo:27017/epsor',
      database: 'epsor',
      collection: 'products',
      options: {
        useUnifiedTopology: true,
      },
    } as IMongoDbConfig,
    producer: {
      topic: 'test',
      producer: {
        'client.id': '1',
        'metadata.broker.list': 'kafka:9092',
        'compression.codec': 'gzip',
        'retry.backoff.ms': 200,
        'message.send.max.retries': 10,
        'socket.keepalive.enable': true,
        'queue.buffering.max.messages': 100000,
        'queue.buffering.max.ms': 1000,
        'batch.num.messages': 1000000,
        'dr_msg_cb': true
      } as Kafka.ProducerGlobalConfig,
    },
  },
  logs: {
    level: process.env.LOG_LEVEL || 'silly',
  },
};
