# EPSOR TEST BACKEND

## Requirements

Having [docker](https://docs.docker.com/get-docker/) installed and running.

## How to use

From the directory containing the `docker-compose.yml`  

```
docker-compose build
docker-compose up
```

Go to [http://localhost:5000/graphql](http://localhost:5000/graphql)

*run `docker-compose down` to stop the application.*

- Perform a mutation to create a product

```js
mutation createProduct($uuid: String!, $name: String!, $quantity: Int!) {
  createProduct(
    createProductData: { uuid: $uuid, name: $name, quantity: $quantity }
  )
}
```

- Query the list of products

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


### Files structure

```
├── README.md
├── docker-compose.yml
├── graphql-api
│   ├── Dockerfile
│   ├── README.md
│   ├── package.json
│   ├── src
│   │   ├── app.ts
│   │   ├── clients   -> Database client
│   │   ├── config
│   │   ├── entities
│   │   ├── libs
│   │   ├── modules   -> GraphQl Product resolver
│   │   ├── processes -> Web process
│   │   ├── providers -> Services provider (logger, mongo...)
│   │   └── services  -> Kafka event producer
│   ├── tsconfig.json
│   └── yarn.lock
└── node-consumer
    ├── Dockerfile
    ├── README.md
    ├── package.json
    ├── src
    │   ├── app.ts
    │   ├── clients    -> Database client
    │   ├── config
    │   ├── entities
    │   ├── libs       -> message handler
    │   ├── processes  -> Kafka consumer process
    │   └── providers  -> Services provider (logger, mongo...)
    ├── tsconfig.json
    └── yarn.lock
```