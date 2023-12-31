const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const coockieParser = require('cookie-parser');
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5001;



//middleware
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'https://brand-shop-acfd4.web.app/'],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
}));
app.use(coockieParser())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.klmlttn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


//middleware;

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        const productCollection = client.db("brandShopDB").collection("product");
        const adCollection = client.db("brandShopDB").collection("ad");
        const addedCartCollection = client.db("brandShopDB").collection("cart");
        const userCollection = client.db("brandShopDB").collection("users");
        const brandDataCollection = client.db("brandShopDB").collection("brandData");

        const verifyToken = (req, res, next) => {
            try {
                const { token } = req.cookies
                if (!token) {
                    return res.status(401).send({ message: 'Unauthorized' })
                }
                jwt.verify(token, process.env.ACCESS_TOKEN, (err, decode) => {
                    if (err) {
                        return res.status(401).send({ message: 'Unauthorized' })

                    }
                    req.user = decode;
                    next()

                })
            } catch (error) {
                console.log(error.message)
            }
        }




        //auth related api
        app.post('/api/v1/auth/access-token', async (req, res) => {
            try {
                const { email } = req.body;
                console.log(email)
                const token = await jwt.sign({
                    email
                }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });

                res.cookie('token', token, {
                    httpOnly: true,
                    secure: false
                }).send({ success: true })
            } catch (error) {
                console.log(error.message)
            }
        })

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
        //product update
        app.put('/products/:id', async (req, res) => {
            try {
                const id = req.params.id
                const updateProduct = req.body
                const filter = { _id: new ObjectId(id) };
                const options = { upsert: true };
                const update = {
                    $set: {
                        image: updateProduct.image,
                        productName: updateProduct.productName,
                        brandName: updateProduct.brandName,
                        productType: updateProduct.productType,
                        price: updateProduct.price,
                        rating: updateProduct.rating,
                    },
                };
                const result = await productCollection.updateOne(filter, update, options);
                res.send(result)
            } catch (error) {
                return res.send({ error: true, message: error.message })
            }


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


        app.get('/user-cart', verifyToken, async (req, res) => {
            try {

                const userEmail = req.query?.email;
                const verifyEmail = req.user?.email;
                if (verifyEmail !== userEmail) {
                    return res.status(403).send({ message: 'forbidden access' })
                }
                let query = {};
                if (userEmail) {
                    query = { userEmail: userEmail }
                }
                const result = await addedCartCollection.find(query).toArray();
                res.send(result)
            } catch (error) {
                return res.send({ error: true, message: error.message });
            }
        })


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


        app.get('/brand-data', async (req, res) => {
            const query = await brandDataCollection.find().toArray();
            res.send(query);
        })
        app.post('/brand-data', async (req, res) => {
            const brandData = req.body;
            const result = await brandDataCollection.insertOne(brandData)
            res.send(result);
        })





        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
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
