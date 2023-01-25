const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === "production" ? true : false;
const uri = `mongodb+srv://gustavo:${process.env.DB_PASSWORD}@cluster0.kfflwab.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const dbName = isProd ? "ranking" : "ranking-dev";

app.use(cors());
app.use(express.json());

app.get("/", async function (req, res) {
  const connection = await client.connect();
  const db = await connection.db(dbName);
  const collection = await db.collection("users");
  const data = await collection
    .find({}, { projection: { _id: 0 } })
    .sort({ points: -1 })
    .limit(6)
    .toArray();
  connection.close();

  res.send(data);
});

app.post("/", async (req, res) => {
  const { name, points } = req.body;

  const connection = await client.connect();
  const db = await connection.db(dbName);
  const collection = await db.collection("users");
  const data = await collection.findOne({ name });
  if (data) {
    if (data.points < points) {
      await collection.updateOne({ _id: data._id }, { $set: { name, points } });
    }
  } else {
    await collection.insertOne({ name, points });
  }
  connection.close();

  res.send({ ok: true });
});

app.listen(PORT, () => {
  console.log("Server iniciado");
});

module.exports = app;
