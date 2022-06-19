const express = require("express");
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const MongoUtil = require("./MongoUtil")
// const MongoClient = require("mongodb").MongoClient;
const mongoUrl = process.env.MONGO_URI;

let app = express();

app.use(express.json())

app.use(cors());

async function main(){
 
    let db  = await MongoUtil.connect(mongoUrl,"food_sightings")


app.post("/free_food_sighting", async (req, res) => {
    // the document must have
    // description: a brief of description what the free food has
    // food: an array of short phrases (no more than 100 characters) about what the free food has
    // datetime: when is it sighted (default to the NOW -- current date time, must be the YYYY-MM-DD format)
    let description = req.body.description;
    let food = req.body.food;
    let datetime = new Date(req.body.datetime) || new Date();

    try {
      // tell mongo to insert the document
      let result = await db.collection("free_food_sightings").insertOne({
        description: description,
        food: food,
        datetime: datetime
      });
      res.status(200);
      res.send(result);
    } catch (e) {
      res.status(500);
      res.send({
        error: "Internal server error. Please contact administrator"
      });
      console.log(e);
    }
  });

  app.get("/free_food_sightings", async (req, res) => {

    let criteria = {};

    if (req.query.description) {
        criteria['description'] = {$regex: req.query.description, $options:"i"}
    }

    if (req.query.food) {
        criteria['food'] = {
            '$in': [req.query.food]
        }
    }

    let results = await db
      .collection("free_food_sightings")
      .find(criteria)
      .toArray();

    res.status(200);
    res.send(results);
  });


  app.put("/free_food_sighting/:id", async (req, res) => {
    // when we do put, we assume is to client update ALL the KEYS in the document
  let description = req.body.description;
  let food = req.body.food;
  let datetime = new Date(req.body.datetime) || new Date();
  let results = await db.collection('free_food_sightings').updateOne({
      _id: ObjectId(req.params.id)
  }, {
      '$set': {
          description:description,
          food:food,
          datetime:datetime
      }
  })
  res.send(results);
});
}





// START SERVER
app.listen(3000, () => {
  console.log("Server has started");
});


main();