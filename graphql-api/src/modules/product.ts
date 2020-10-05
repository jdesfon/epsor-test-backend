import { Inject } from 'typedi';
import { Resolver, Mutation, Arg, Query } from 'type-graphql';
import { ApplicationServiceProvider } from '../providers/ApplicationServiceProvider';
import { Product, CreateProductInput } from '../entities/product';

@Resolver(Product)
export class ProductResolver {
  @Inject('serviceProvider')
  private _serviceProvider: ApplicationServiceProvider;

  @Query(() => [Product])
  async products() {
    try {
      return await this._serviceProvider.mongoDb.getProducts();
    } catch (err) {
      this._serviceProvider.logger.error(err);
    }
  }

  @Mutation(() => String)
  async createProduct(
    @Arg("createProductData") createProductData: CreateProductInput
  ): Promise<string> {
    try {
      const product = await this._serviceProvider.producer.sendCreateProductEvent(createProductData)
      return product.uuid;
    } catch (err) {
      this._serviceProvider.logger.error(err);
    }
  }
}
