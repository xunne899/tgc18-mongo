const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
const MongoUtil = require("./MongoUtil.js");
const helpers = require("handlebars-helpers")({
  handlebars: hbs.handlebars
});

const ObjectId = require('mongodb').ObjectId;

require('dotenv').config()












async function main() {
  
/* 1. SETUP EXPRESS */
let app = express();

// 1B. SETUP VIEW ENGINE
app.set("view engine", "hbs");

// 1C. SETUP STATIC FOLDER
app.use(express.static("public"));

// 1D. SETUP WAX ON (FOR TEMPLATE INHERITANCE)
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// 1E. ENABLE FORMS
app.use(express.urlencoded({ extended: false }));

// 1F. Connect to Mongo
await MongoUtil.connect(process.env.MONGO_URL, 'cico');



// add food
app.get('/food/add', function(req,res){
    res.render('add_food')
})


// add food post
app.post("/food/add", (req, res) => {
    let {foodName, calories, tags} = req.body;
    let db = MongoUtil.getDB();    
    if (!Array.isArray(tags)) {
      tags = [tags];
    }

    db.collection("food").insertOne({
      foodName,
      calories,
      tags
    });
     res.send('Food has been added')
  });


// get foodlist
app.get("/food", async (req, res) => {
  let db = MongoUtil.getDB();
  let foodRecords = await db
    .collection("food")
    .find()
    .toArray();
  res.render("food", {
    foodRecords
  });
});


// get edit food
app.get('/food/:foodid/edit', async (req,res)=> {
  let db = MongoUtil.getDB();
  let foodRecord = await db.collection('food').findOne({
      '_id': ObjectId(req.params.foodid)
  });
  
  res.render('edit_food', {
      foodRecord
  })  
})


// post edit food
app.post("/food/:foodid/edit", async (req,res)=>{
  let db = MongoUtil.getDB();
  let { foodName, calories, tags } = req.body;

  if (!Array.isArray(tags)) {
      tags = [tags];
  }

  let foodid = req.params.foodid;
  db.collection('food').updateOne({
      _id:ObjectId(foodid)
  }, 
  {
      '$set' : {
        foodName, calories, tags
      }        
  })

  res.redirect('/food');
})

// get delete food

app.get('/food/:foodid/delete', async (req,res)=> {
  let db = MongoUtil.getDB();
  let foodRecord = await db.collection('food').findOne({
      '_id': ObjectId(req.params.foodid)
  });
  res.render('delete_food', {
    foodRecord
}) 
})


app.post('/food/:foodid/delete', async (req,res)=> {
  let db = MongoUtil.getDB();
  let foodRecord = await db.collection('food').deleteOne({
      '_id': ObjectId(req.params.foodid)
  });
  res.render('delete_food', {
    foodRecord
}) 

res.redirect('/food');
})


// app.post('/food/:foodid/delete', async (req,res)=> {
//   let db = MongoUtil.getDB();
//   let foodRecord = await db.collection('food').updateOne({
//     _id:ObjectId(foodid)
//   })
//   res.render('delete_food', {
//     foodRecord
// }) 
// })

  // app.get('/food/:foodid/delete', async(req,res)=>{
  //   let db = MongoUtil.getDB();
 
  //   let foodRecord = await db.collection('food').findOne({
  //     '_id': ObjectId(req.params.foodid)       
  //   });

  //   await db.collection('food').updateOne({
  //     '_id': ObjectId(foodRecord._id)
  //   },{
  //     '$pull':
  //       {
  //         '_id': ObjectId(req.params.foodid)
  //       }
      
  //   })
  //   res.redirect('/food')
  // })
  
//   res.render('edit_food', {
//       foodRecord
//   })  
// })


  // 3. RUN SERVER
  app.listen(3000, () => console.log("Server started"));
}

main();