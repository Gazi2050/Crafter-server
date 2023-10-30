const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qemc4ul.mongodb.net/?retryWrites=true&w=majority`;

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

        const database = client.db("productDB");
        const productCollection = database.collection("product");

        app.get('/products', async (req, res) => {
            const cursor = productCollection.find()
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const product = await productCollection.findOne(query);
            res.send(product);
        })

        app.post('/products', async (req, res) => {
            const product = req.body;
            console.log('new product', product);
            const result = await productCollection.insertOne(product);
            res.send(result);
        })

        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const product = req.body;
            console.log(id, product);
            const filter = { _id: new ObjectId(id) }
            const option = { upsert: true }
            const updateProduct = {
                $set: {
                    name: product.name,
                    brandName: product.brandName,
                    type: product.type,
                    price: product.price,
                    description: product.description,
                    rating: product.rating,
                    img: product.img,
                }
            }
            const result = await productCollection.updateOne(filter, updateProduct, option);
            res.send(result)
        })

        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            console.log('please delete from dataBase', id);
            const query = { _id: new ObjectId(id) }
            const result = await productCollection.deleteOne(query);
            res.send(result);
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


// Define the root route
app.get('/', (req, res) => {
    const mainPageContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Crafter Server</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f0f0f0;
                    text-align: center;
                }

                .container {
                    margin: 100px auto;
                    padding: 100px;
                    background-color: #ffffff;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
                }

                h1 {
                    color: #333;
                    font-size: 40px;
                }
                p {
                    font-size: 20px;
                    font-weight: bold;
                    margin: 30px;
                }
                .button-link {
                    text-decoration: none;
                    background-color: #007bff;
                    color: #fff;
                    padding: 10px 20px;
                    border-radius: 5px;
                    transition: background-color 0.3s; /* Add transition for smooth effect */
                }
                .button-link:hover {
                    background-color: #0056b3; /* Change background color on hover */
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Crafter Server Is Running...</h1>
                <p><a class="button-link" href="/products">Go to Product Page</a></p>
                <p><a class="button-link" href="/other-page">Go to Other Page</a></p>
            </div>
        </body>
        </html>
    `;

    res.send(mainPageContent);
});

// // Define a route for the other page
// app.get('/other-page', (req, res) => {
//     const otherPageContent = `<h1>Other-Page</h1>`;

//     res.send(otherPageContent);
// });

app.listen(port, () => {
    console.log(`Crafter Server Is Running On Port: ${port}`);
});
