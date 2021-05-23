const express = require('express')
const cors = require('cors')
require('dotenv').config()
const MongoClient = require('mongodb').MongoClient;
const { ObjectID } = require('mongodb')
// "start": "node index.js",


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.z6ers.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const app = express()
const port = process.env.PORT || 5000
app.use(cors())
app.use(express.json())


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const servicesCollection = client.db("carRentalDB").collection("services");
  const rentCollection = client.db("carRentalDB").collection("rents");
  const adminsCollection = client.db("carRentalDB").collection("admins");
  const reviewsCollection = client.db("carRentalDB").collection("reviews");
  console.log('database connected')
  // perform actions on the collection object

  app.post('/addServices', (req, res) => {
    const newServices = req.body;
    // console.log('adding new services: ', newServices)
    servicesCollection.insertOne(newServices)
      .then(result => {
        // console.log('inserted count', result.insertedCount);
        res.send(result.insertedCount > 0)

      })
  })

  app.get('/services', (req, res) => {

    servicesCollection.find({})
      .toArray((err, services) => {

        res.send(services)
      })
  })


  app.get('/checkOut/:id', (req, res) => {

    const id = ObjectID(req.params.id)
    // console.log(id)
    servicesCollection.find({ _id: id }).toArray((err, documents) => {
      res.send(documents[0])
    })

  })



  app.post('/addRent', (req, res) => {
    const newRent = req.body;
    // console.log('adding new event: ', newRent)
    rentCollection.insertOne(newRent)
      .then(result => {
        // console.log('inserted count', result.insertedCount);
        res.send(result.insertedCount > 0)

      })
      .catch(err => console.log(err))
  })



  app.get('/userRents', (req, res) => {
    const queryEmail = req.query.email;
    console.log('user Rents', queryEmail)
    rentCollection.find({ email: queryEmail })
      .toArray((err, documents) => {
        console.log(documents)
        res.send(documents)
      })
  })





  app.get('/allRents', (req, res) => {

    rentCollection.find({})
      .toArray((err, documents) => {
        // console.log(documents)
        res.send(documents)
      })
  })


  app.post('/addAdmin', (req, res) => {
    const newAdmin = req.body;
    // console.log('new admin', newAdmin)
    adminsCollection.insertOne(newAdmin)
      .then(result => {
        // console.log('inserted count', result.insertedCount);
        res.send(result.insertedCount > 0)

      })
      .catch(err => console.log(err))
  })





  app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    console.log('admin checking email', email)
    adminsCollection.find({ email: email })
      .toArray((err, admins) => {
        console.log(admins)
        res.send(admins.length > 0);
      })
  })




  app.post('/addReviews', (req, res) => {
    const newReviews = req.body;
    console.log('new Reviews', newReviews)
    reviewsCollection.insertOne(newReviews)
      .then(result => {
        // console.log('inserted count', result.insertedCount);
        res.send(result.insertedCount > 0)

      })
      .catch(err => console.log(err))
  })



  app.get('/reviews', (req, res) => {

    reviewsCollection.find({})
      .toArray((err, reviews) => {
        console.log(reviews)
        res.send(reviews)
      })
  })

  app.delete('/delete/:id', (req, res) => {
    servicesCollection.deleteOne({ _id: ObjectID(req.params.id) })
      .then(result => {
        console.log('deleted', result.deletedCount)
        res.send(result.deletedCount > 0)
      })
  })



  app.patch('/update/:id', (req, res) => {
    console.log(req.body);
    const { type, price, description, imageURL } = req.body

    servicesCollection.updateOne(
      { _id: ObjectID(req.params.id) },
      {
        $set: { type, price, description, imageURL }

      }
    )
      .then(result => {
        console.log(result);
        res.send(result.modifiedCount > 0)
      })
      .catch(err => console.log(err))

  })


  app.patch('/statusUpdate/:id', (req, res) => {
    console.log(req.body);
    // console.log(req.params.id);
    


    rentCollection.updateOne(
      { _id: ObjectID(req.params.id) },
      {
        $set: { rentStatus:req.body.status }
      }
    )
      .then(result => {
        console.log(result);
        res.send(result.modifiedCount > 0)
      })
      .catch(err => console.log(err))

  })




//adding rentStatus field with the value of 'Pending' in all documents of rentCollection 
  // rentCollection.updateMany({}, { $set: { "rentStatus": "Pending" } }).then(result => {
  //   console.log(result);
  // })
  //   .catch(err => console.log(err))


// removing isOpen field from rentCollection those documents have rentStatus field
  // rentCollection.updateMany(
  //   { rentStatus: "Pending" },
  //   {
  //     $unset: { isOpen: false }
  //   }
  // ).then(result => {
  //   console.log(result);
  // })
  //   .catch(err => console.log(err))




  //   client.close();
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`)
})