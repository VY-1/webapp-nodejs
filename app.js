//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongoose connection to mongodb
// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");
mongoose.connect("mongodb+srv://usefortesting510:134567890@cluster0.zhrcwre.mongodb.net/todolistDB");

// item schema
const itemsSchema = new mongoose.Schema({
  name: String
});
//Model of the item table
const Item = mongoose.model("Item", itemsSchema);

// new document for item
const item1 = new Item({ name: "Welcome to your todolist!" });

const item2 = new Item({ name: "Hit the + button to add new item"});

const item3 = new Item({ name: "<-- Hit this to delete an item"});
const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


const workItems = [];

app.get("/", async function(req, res) {

  let itemList=await Item.find({});
  

  //If the itemList is empty add default list, and redirect root for refresh
  if (itemList.length === 0){
    Item.insertMany(defaultItems);
    res.redirect("/");
  }

  res.render("list", {listTitle: "Today", newListItems: itemList});

});

app.get("/:customListName", async function(req, res){
  //Use lodash to capitalize first character
  const listName = _.capitalize(req.params.customListName);

  let findListName = await List.findOne({ name: listName}).exec();
  console.log(listName);
  console.log(findListName);
  // console.log(findListName.name);
  // console.log(findListName.items);

  if (findListName === null){
    const list = new List({ name: listName, items: defaultItems});
    list.save();
    res.redirect("/" + listName);
  }else{

    res.render("list", {listTitle: listName, newListItems: findListName.items});
  }

  

});

app.post("/", async function(req, res){

  const listName = req.body.list;
  const itemName = req.body.newItem;
  console.log(listName);
  console.log(itemName);

  //Insert one new item
  const item = new Item({ name: itemName});

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    const foundList = await List.findOne({name: listName}).exec();
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  }

  
  
});

app.post("/delete", function(req, res){
  console.log("Inside Delete Post");
  console.log(req.body);
  const listName = req.body.listName;
  const checkedItemId = req.body.checkedItem;
  console.log(checkedItemId);
  console.log(listName);
  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId).exec();
  res.redirect("/");
  }else{
    //remove items array and pull it out of the items
    const list_Name = List.findOneAndUpdate({name : listName}, {$pull: {items:{_id: checkedItemId}}}).exec();
    //list_Name.items.findByIdAndUpdate({name : listName},checkedItemId).exec();
    res.redirect("/" + listName);
  }
  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
