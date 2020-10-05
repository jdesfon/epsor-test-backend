import { IsInt, Min, Length, validateOrReject } from 'class-validator';

export class CreateProductDto {
  uuid: string;

  @Length(1, 100)
  name: string;

  @IsInt()
  @Min(0)
  quantity: number;
}

export async function createProduct(uuid: string, name: string, quantity: number): Promise<CreateProductDto> {
  const product = new CreateProductDto();
  product.uuid = uuid;
  product.name = name;
  product.quantity = quantity;

  await validateOrReject(product);
  return product;
}
