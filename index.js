const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config('cors');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.txagv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// console.log(uri);

async function run() {
      try {
            await client.connect();
            // console.log('Database connected');
            const database = client.db('Panda_Shop');
            const productCollection = database.collection('products');
            const orderCollection = database.collection('orders');

            //GET products API
            app.get('/products', async (req, res) => {
                  // console.log(req.query);
                  const cursor = productCollection.find({});
                  //pagination load data
                  const page = req.query.page;
                  const size = parseInt(req.query.size);
                  let products;
                  const count = await cursor.count();

                  if (page) {
                        products = await cursor.skip(page * size).limit(size).toArray();
                  }
                  else {
                        products = await cursor.toArray();
                  }

                  res.send({
                        count,
                        products
                  });
            });

            //Use POST to get data by keys
            app.post('/products/byKeys', async (req, res) => {
                  const keys = req.body;
                  // console.log(req.body);
                  const query = { key: { $in: keys } }
                  const products = await productCollection.find(query).toArray();
                  // res.send('Hitting post');
                  res.json(products);

            });

            //Add Orders API
            app.get('/orders', async(req,res)=>{
                  const cursor = orderCollection.find({});
                  const orders = await cursor.toArray();
                  res.json(orders);
            })
            app.post('/orders', async (req, res) => {
                  const order = req.body;
                  order.createAt = new Date();
                  // console.log('order', order);
                  const result = await orderCollection.insertOne(order);
                  res.json(result);
            })

      }
      finally {
            // await client.close();
      }
}

run().catch(console.dir);

app.get('/', (req, res) => {
      res.send('Panda Shop Server is running');

});

app.listen(port, () => {
      console.log('Server running at port', port);
});

/*
one time:
1. nodemon globally install
2. mongodb atlas user, access
3. Network access (ip address allow)
Every projects:
1. install mongodb, express, cors, dotenv
2. import (require), mongodb
3. copy uri (connection string)
4. create the client (copy code from atlas)
5. Create or get database access credentials (username, password)
6. create .env file and add DB_USER and DB_PASS as environment variable
7. Make sure you require (import) dotenv
8. Convert URI string to a template string.
9. Add DB_USER and DB_PASS in the connection URI string.
10. Check URI string by using console.log
11. Create async function run and call it by using run().catch(console.dir)
12. add try and finally inside the run function.
13. comment out await client.close() to keep the connection alive
14. add await client.connect(); inside the try block
15. use a console.log after the client.connect to ensure database is connected
*/