import { Message } from 'node-rdkafka';
import { ApplicationServiceProvider } from '../../providers/ApplicationServiceProvider';
import { CreateProductDto, createProduct } from '../../dto/product';

export type MessageHandler = (message: Message, serviceProvider: ApplicationServiceProvider) => Promise<void>;

export default async (message: Message, serviceProvider: ApplicationServiceProvider): Promise<void> => {
  const { logger, mongoDb } = serviceProvider;
  try {
    logger.info(`Message received ${message.key}`);
    const event = JSON.parse(message.value.toString());
    const product: CreateProductDto = await createProduct(event.uuid, event.name, event.quantity);
    await mongoDb.saveProduct(product);
    logger.info('Message successfully handled');
  } catch (err) {
    logger.error(`Message handler error: ${err}`);
  }
};
