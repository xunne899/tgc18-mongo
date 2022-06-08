const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
const MongoUtil = require("./MongoUtil.js");

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

  // 3. RUN SERVER
  app.listen(3000, () => console.log("Server started"));
}

main();