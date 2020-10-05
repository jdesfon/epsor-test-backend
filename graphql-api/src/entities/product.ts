import { InputType, Field, ObjectType, ID, Int } from 'type-graphql';
import { Min } from 'class-validator';

@ObjectType()
export class Product {
    @Field()
    _id?: string;

    @Field(() => ID)
    uuid: string;

    @Field()
    name: string;

    @Field(() => Int)
    quantity: number;
}

@InputType()
export class CreateProductInput implements Partial<Product> {
    @Field()
    uuid: string;

    @Field()
    name: string;

    @Field(() => Int, { defaultValue: 0 })
    @Min(0)
    quantity: number;
}