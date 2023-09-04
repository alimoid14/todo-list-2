require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
//const date = require(__dirname + "/date.js");

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.set("view engine", "ejs");

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
})

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your to-do list!"
})

const item2 = new Item({
  name: "Hit the + button to add an item."
})

const item3 = new Item({
  name: "<-- Hit this to delete an item."
})

const defaultItems = [item1, item2, item3];

//Item.insertMany(defaultItems);

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);




// Item.deleteOne({name: "Hit the + button to add an item."}).then(function(){
//     console.log("Data deleted"); // Success
//   }).catch(function(error){
//     console.log(error); // Failure
//   });


//const items = [];
const workItems = [];

app.get("/", function (req, res) {
  //let day = date.getDate();

  Item.find().then(function(items){
  
    if(items.length === 0) {Item.insertMany(defaultItems);
    res.redirect("/");
    }else{
      res.render("list", { listTitle: "Today", newListItem: items });
    }
  
});
  

  //res.send();
});

app.post("/", function (req, res) {
  let itemName = req.body.newItem;

  const listName = req.body.list;


  const item = new Item({
    name: itemName
  })

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}).then(function(list){
      list.items.push(item);
      list.save();
    });

    res.redirect("/" + listName);
    
  }
  // Item.find({name: itemName}).then(function(item){

  // })

});

app.post("/delete", function(req, res){
  const checked = req.body.checkbox;
  const listName = req.body.listName;

  //console.log(checked)
  //console.log(listName)

  if(listName === "Today"){
    Item.findByIdAndRemove({_id: checked}).then(function(){
      //console.log("Data deleted"); // Success
      res.redirect("/");
    }).catch(function(error){
      console.log(error); // Failure
    });
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checked}}}).then(function(){
      res.redirect("/" + listName);
    }).catch(function(error){
      console.log(error); // Failure
    });
  }

  
});

 app.get("/:customListName", function (req, res) {
  
  const customListName = _.capitalize(req.params.customListName);
  

  List.findOne({name: customListName}).then(function(list){
    if(list !== null){
      //console.log("exists")

      res.render("list", {listTitle: list.name, newListItem: list.items})
    }else{
      //console.log("doesn't exists")
      const list = new List({
        name: customListName,
        items: defaultItems
      })
    
      list.save();

      res.redirect("/"+ customListName);
    }
  })

  

  // res.render("list", { listTitle: customListName, newListItem: workItems });
});

app.get("/about", function(req, res){
    res.render("about")
})

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
