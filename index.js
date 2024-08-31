const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ycbv1lf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server
    await client.connect();
    const userCollection = client.db('jobDB').collection('users');

    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.post('/users', async (req, res) => {
      try {
        const user = req.body;
        // don't let a user insert into the db if it already exists
        const query = { email: user.email };
        const existingUser = await userCollection.findOne(query);
        if (existingUser) {
          return res.send({ message: 'user already exists', insertedId: null });
        }
        const result = await userCollection.insertOne(user);
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: 'Error creating user', error: error.message });
      }
    });

    app.get('/userResume/:email', async(req,res)=>{
      const query = {email: req.params.email}
      const result = await userCollection.find(query).toArray();
      res.send(result);
    })

    // Ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // You may choose to close the client connection or leave it open
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('kudosware running');
});

app.listen(port, () => {
  console.log(`kudosware is running on port: ${port}`);
});
