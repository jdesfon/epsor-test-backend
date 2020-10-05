# Node Consumer

## Description

This application is a kafka consumer listening the `products` topic. It retrieves products data from the message and saves a product document in a MongoDb database.


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