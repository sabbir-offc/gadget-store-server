const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5001;



//middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.klmlttn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const productCollection = client.db("brandShopDB").collection("product");
        const adCollection = client.db("brandShopDB").collection("ad");
        const addedCartCollection = client.db("brandShopDB").collection("cart");
        const userCollection = client.db("brandShopDB").collection("users");


        //userList

        app.get('/users', async (req, res) => {
            const query = await userCollection.find().toArray();
            res.send(query);
        })
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        })


        app.get('/products', async (req, res) => {
            const query = await productCollection.find().toArray();
            res.send(query);
        })
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.send(result)
        });
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productCollection.findOne(query);
            res.send(result)
        })

        app.get('/advertise', async (req, res) => {
            const query = await adCollection.find().toArray();
            res.send(query);
        })
        app.post('/advertise', async (req, res) => {
            const ad = req.body;
            const result = await adCollection.insertOne(ad);
            res.send(result);
        })

        //user cart
        app.get('/user-cart', async (req, res) => {
            const query = await addedCartCollection.find().toArray();
            res.send(query);
        })
        app.get('/user-cart/:userId', async (req, res) => {
            const userId = req.params.userId
            const query = { userId };
            const result = await addedCartCollection.find(query).toArray();
            res.send(result)
        });

        app.post('/user-cart', async (req, res) => {
            const cart = req.body;
            const result = await addedCartCollection.insertOne(cart);
            res.send(result);
        })


        //cart product delete

        app.delete('/user-cart/:userId/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await addedCartCollection.deleteOne(query);
            res.send(result);

        })


        app.get('/brands/:brandName', async (req, res) => {
            const brandName = req.params.brandName;
            const query = { brandName: brandName };
            const result = await productCollection.find(query).toArray()
            res.send(result)
        })








        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Brand Shop Server is running');
});

app.listen(port, () => {
    console.log(`App running on the PORT: ${port}`)
})
