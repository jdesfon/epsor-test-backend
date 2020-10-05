import Kafka from 'node-rdkafka';

export default {
  process: {
    exitTimeout: 3000,
    topic: 'test',
    consumer: {
      'group.id': 'epsor',
      'metadata.broker.list': 'kafka:9092',
      'socket.keepalive.enable': true,
      'enable.auto.commit': false,
    } as Kafka.ConsumerGlobalConfig,
  },
  services: {
    mongoDb: {
      uri: 'mongodb://mongo:27017/epsor',
      database: 'epsor',
      collection: 'products',
      options: {
        useUnifiedTopology: true,
      },
    },
  },
  logs: {
    level: process.env.LOG_LEVEL || 'silly',
  },
};
