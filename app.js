const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true, useUnifiedTopology:true, useFindAndModify: false });

const itemsSchema = {
  name:String
};

const Item = mongoose.model ("Item", itemsSchema);

const customList = new Item ({
  name:"Go to url and add a custom-list-name after the: /"
});
// homwork.save();

const addItem = new Item ({
  name:"Press + to add item"
});
// Press + to add item.save();

const removeItem = new Item ({
  name:"<-- Click to remove item from list"
});
// <-- Click to remove item from list.save();

const defaultItems = [customList,addItem,removeItem];

const listSchema =  {
  name:String,
  items:[itemsSchema]
}

const List = mongoose.model ("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, (err, foundItems) => {
    if(foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if(err){
          console.log(err);
        } else{
          res.redirect("/");
          console.log("Inserted default items");
        }
      });
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems:foundItems
      });
    }
  })

});

app.get("/:userList", (req, res) => {
  const userList = _.capitalize(req.params.userList);

  const list = new List ({
    name:userList,
    items: defaultItems
  });

  List.findOne({name:userList}, (err, found) => {
    if (found) {
      res.render("list", {
        listTitle: found.name,
        newListItems:found.items
      });
    } else {
      list.save();
      res.redirect("/" + userList);
    }
  });
});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listTitle = req.body.list;

  const addedItem = new Item ({
    name:itemName
  });

  if (listTitle === "Today"){
    addedItem.save();
    res.redirect("/")
  } else {
    List.findOne({name:listTitle}, (err, found) => {
        found.items.push(addedItem);
        found.save();
        res.redirect("/" + listTitle);
    });
  }
});

app.post("/delete", (req, res) => {
  const deletedItem = req.body.checkbox;
  const listTitle = req.body.listTitle;

  if (listTitle === "Today") {
  Item.deleteOne({_id:deletedItem}, (err) => {
    if(err) {
      console.log(err);
    } else {
      console.log("Checked Item Deleted");
      res.redirect("/")
    }
  })
  } else {
    List.findOneAndUpdate({name: listTitle}, {$pull: {items: {_id:deletedItem}}}, (err, found) => {
      if (!err) {
        res.redirect("/" + listTitle);
      }
    });
  }
});

app.get("/work", function(req, res) {
  res.render("list", {listTitle: "Work List", newListItems: workItems});
})

app.get("/about", function(req, res) {
  res.render("about")
})

app.listen(3000, function() {
  console.log("Listening on port 3000");
});

// if (currentDay === 6 || currentDay === 0) {
//   day = today.toString().split(" ")[0];
//   res.render("list", {})[0];
// } else {
//   day = today.toString().split(" ")[0];
// }

// switch (currentDay) {
//   case 0:
//     day = "Sunday"
//     break;
//   case 1:
//     day = "Monday"
//     break;
//   case 2:
//     day = "Tuesday"
//     break;
//   case 3:
//     day = "Wednesday"
//     break;
//   case 4:
//     day = "Thursday"
//     break;
//   case 5:
//     day = "Friday"
//     break;
//   case 6:
//     day = "Saturday"
//     break;
//   default:
//   console.log("Error: current day is equal to: " + currentDay);
// }
