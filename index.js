require('dotenv').config()
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

// mongodb 

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.elzgrcu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const carCollection = client.db('carDB').collection('services');
    const bookingCollection = client.db('carDB').collection('booking');


    app.get("/services", async (req, res) => {
      const cursor = carCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const options = {

        projection: { title: 1, service_id: 1, price: 1, img: 1 },
      };

      const result = await carCollection.findOne(query, options);
      res.send(result)
    })

    // Booking 

    app.get("/myBooking", async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result)
    })
    app.delete("/booking/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.send(result)

    })
    app.patch("/booking/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateBooking = req.body;
      console.log(updateBooking);
      const updatedDoc = {
        $set: {
          status: updateBooking.status
        }
      }
      const result = await bookingCollection.updateOne(filter, updatedDoc);
      res.send(result)
    })
    app.post("/booking", async (req, res) => {
      const bookingInfo = req.body;
      // console.log(bookingInfo);
      const result = await bookingCollection.insertOne(bookingInfo);
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


app.get("/", (req, res) => {
  res.send("Server is Running")
})

app.listen(port, () => {
  console.log(`Running port is ${port}`);
})