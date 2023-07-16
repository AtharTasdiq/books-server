require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

const cors = require('cors');

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hwouc.mongodb.net/redux-book-app?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    const db = client.db('redux-book-app');
    const bookCollection = db.collection('book');

    app.get('/books', async (req, res) => {
      const cursor = bookCollection.find({});
      const book = await cursor.toArray();

      res.send({ status: true, data: book });
    });

    app.post('/book', async (req, res) => {
      const book = req.body;

      const result = await bookCollection.insertOne(book);

      res.send(result);
    });
    // app.get('/books/:id', async (req, res) => {
    //   const id = req.params.id;
    //   console.log(id)
    //   const regexPattern = new RegExp(id, 'i');

    //   try {
    //     const result = await bookCollection.find({
    //       $or: [
    //         { genre: regexPattern },
    //         { title: regexPattern },
    //         { author: regexPattern },
    //       ],
    //     }).toArray();
    //     console.log(result);
    //     res.send(result);
    //   } catch (error) {
    //     console.error('Error executing find query:', error);
    //     res.status(500).send('Internal Server Error');
    //   }
    // });
    app.get('/book/:id', async (req, res) => {
      const id = req.params.id;

      const result = await bookCollection.findOne({ _id: ObjectId(id) });
      console.log(result);
      res.send(result);
    });


    app.put('/update-book/:id', async (req, res) => {
      const id = req.params.id;
      const updates = req.body;

      const result = await bookCollection.findOneAndUpdate(
        { _id: ObjectId(id) },
        { $set: updates },
        { returnDocument: 'after' }
      );
      console.log(result);
      res.send(result);
    });

    

    app.delete('/book/:id', async (req, res) => {
      const id = req.params.id;
      console.log('Received id:', id);
    
      try {
        const result = await bookCollection.deleteOne({ _id: ObjectId(id) });
        console.log(result);
        res.send(result);
      } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ error: 'An error occurred while deleting the book' });
      }
    });

    app.post('/review/:id', async (req, res) => {
      const bookId = req.params.id;
      const review = req.body.review;

      console.log(bookId);
      console.log(review);

      const result = await bookCollection.updateOne(
        { _id: ObjectId(bookId) },
        { $push: { reviews: review } }
      );

      console.log(result);

      if (result.modifiedCount !== 1) {
        console.error('Book not found or review not added');
        res.json({ error: 'Book not found or review not added' });
        return;
      }

      console.log('Review added successfully');
      res.json({ message: 'Review added successfully' });
    });

    app.get('/review/:id', async (req, res) => {
      const bookId = req.params.id;

      const result = await bookCollection.findOne(
        { _id: ObjectId(bookId) },
        { projection: { _id: 0, reviews: 1 } }
      );

      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: 'Book not found' });
      }
    });


    app.post('/wishlist/:id', async (req, res) => {
      const bookId = req.params.id;
      const wishlist = req.body.wishlist;

      console.log(bookId);
      console.log(wishlist);

      const result = await bookCollection.updateOne(
        { _id: ObjectId(bookId) },
        { $push: { wishlists: wishlist } }
      );

      console.log(result);

      if (result.modifiedCount !== 1) {
        console.error('Book not found or wishlist not added');
        res.json({ error: 'Book not found or wishlist not added' });
        return;
      }

      console.log('Wishlist added successfully');
      res.json({ message: 'Wishlist added successfully' });
    });

    app.post('/user', async (req, res) => {
      const user = req.body;

      const result = await userCollection.insertOne(user);

      res.send(result);
    });

    app.get('/user/:email', async (req, res) => {
      const email = req.params.email;

      const result = await userCollection.findOne({ email });

      if (result?.email) {
        return res.send({ status: true, data: result });
      }

      res.send({ status: false });
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
