# GraphQl Api

## Description

This api is an [Apollo GraphQl](www.apollographql.com) express server used for creating and fetching **Products**.

### Mutation

- **createProduct**: this mutation calls a kafka producer to send a createProduct event in the `products` topic.

```js
mutation createProduct($uuid: String!, $name: String!, $quantity: Int!) {
  createProduct(
    createProductData: { uuid: $uuid, name: $name, quantity: $quantity }
  )
}
```

### Query

- **products**: this query retrieves all the products saved by the node-consumer in the MongoDb database.

```js
query {
  products {
    _id
    uuid
    name
    quantity
  }
}
```

## Schema

Product

 ```json
 {
     "_id": "<ObjectId>",
     "uuid": "string",
     "name": "string",
     "quantity": "integer"
 }
 ```