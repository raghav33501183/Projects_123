//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const multer = require("multer");
const ejs = require("ejs");
const path = require("path");
const _ = require("lodash");

const app = express();

app.use(express.static("public"));

if(typeof localStorage === "undefined" || localStorage === null){
  const LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

const Storage = multer.diskStorage({
  destination:"./public/uploads/",
  filename:(req,file,cb)=>{
    cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname))
  }
});

const upload = multer({
  storage:Storage
}).single('file');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/EventDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const reviewSchema = {
  review: String,
};

const Review = mongoose.model("Review", reviewSchema);

const itemsSchema = {
  Event_Organzation_Name: String,
  Event_Speciality: String,
  City: String,
  Venue_Type: String,
  Fare_Per_Hour: String,
  Office_Phone_Number: String,
  Office_Email_ID: String,
  Venue: String,
  Rating: Number,
  Rating_Number: Number,
  Reviews: [reviewSchema],
  Image: String,
};

const Item = mongoose.model("Item", itemsSchema);

const uploadSchema = {
  ImageName: String,
};

const File = mongoose.model("File", uploadSchema);

var imageData = File.find({});

const customerSchema = {
  full_name: String,
  address: String,
  phone_num: String,
  event_date: Date,
  Event_Organzation_Name: String,
};

const Customer = mongoose.model("Customer", customerSchema);

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});



const User = mongoose.model("User", userSchema);

var k='1';
var c='0';

app.post('/upload', upload, function(req,res) {
    var imageFile = req.file.filename;
    var success = req.file.filename + "uploaded successfully";
    var imageDetails = new Item({
      ImageName:imageFile
    });
    imageDetails.save(function(err, doc){
      if(err)
        throw err;
      imageData.exec(function(err, data){
        if(err)
          throw err;
        res.render('upload-file', {title: 'Upload File', records:data, success:'success' });
      });
    });
});

app.get('/upload', upload, function(req,res) {
  imageData.exec(function(err,data){
    if(err)
      throw err;
      res.render('upload-file', {title: 'Upload File', records:data, success:'success' })
    });
})

app.get("/register", function(req, res) {
  res.render("register", {vary: k});
});

app.get("/blog", function(req, res) {
  res.render("blog", {vary: k});
});

app.get("/login", function(req, res) {
  res.render("login", {vary: k});
});

app.get("/signup", function(req, res) {
  res.render("signup", {vary: k});
});

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems){
    if(err) {
      console.log(error);
    }
    else {
      res.render("list", {newListItems: foundItems, vary: k});
    }
  });
});

app.post("/", upload, function(req, res) {
  const item1 = new Item({
    Event_Organzation_Name: req.body.one,
    Event_Speciality: req.body.two,
    City: req.body.three,
    Venue_Type: req.body.four,
    Fare_Per_Hour: req.body.five,
    Office_Phone_Number: req.body.six,
    Office_Email_ID: req.body.seven,
    Venue: req.body.eight,
    Image: req.file.filename,
  });
  console.log(item1);
  item1.save();
  res.redirect("/");
});

app.post("/user", function(req, res){
  bcrypt.hash(req.body.psw, saltRounds, function(err, hash) {
    const uname = req.body.uname;
    const user1 = new User({
      username: req.body.uname,
      password: hash,
    });
    User.findOne({username: uname}, function(error, exist) {
      if(error) {
        console.log(error);
      } else {
        if (exist) {
          res.render("signup", {title: 'POST user', vary:'ccc'});
        } else {
          if(req.body.psw == req.body.repsw) {
            user1.save();
            res.redirect("/");
          } else {
            res.render("signup", {title: 'POST user', vary:'ddd'});
          }
        }
      }
    });
  });

});


app.post("/signin", function(req, res) {

      const uname = req.body.uname;
      const psw = req.body.psw;
      User.findOne({username: uname}, function(error, foundItems) {
      if(error) {
        console.log(error);
      } else {
        if (foundItems) {
          bcrypt.compare(req.body.psw, foundItems.password, function(err, result) {
            if(result==true) {
              Item.find({}, function(err, foundItems){
                if(err) {
                  console.log(error);
                }
                else {
                  res.render("list", {title: 'POST signin', newListItems: foundItems, vary: 'fff'});
                }
              });
            }
            else {
                  res.render("login", {title: 'POST signin', vary:'aaa'});
                }
              });
          }
        else {
          res.render("login", {title: 'POST signin', vary:'bbb'});
        }
      }
    });
});


app.post("/confirm", function(req, res){
  const buttonItemId = req.body.custId;
  console.log(buttonItemId);
  Item.findById(buttonItemId, function(err, foundItems){
    if(err) {
      console.log(err);
    }
    else {
      res.render("booknow", {newListItems: foundItems, vary: k});
    }
  });
});

app.get("/options", function(req, res){
  Item.find({}, function(err, foundItems){
    if(err) {
      console.log(err);
    } else {
      res.render("options", {newListItems:foundItems, vary: k});
    }
  });
});

app.post("/options", function(req, res){
  const venuetype = req.body.venuetype;
  const place = req.body.place;
  const event = req.body.event;
  const k = req.body.login;
  // search using SHOW ALL VENUES option in the navbar
  if(venuetype=="xxx" && place=="yyy" && event=="zzz") {
    var mysort = {Rating: -1};
    Item.find({}, function(err, foundItems){
      if(err) {
        console.log(err);
      } else {
        res.render("options", {newListItems: foundItems, vary: k});
      }
    }).sort(mysort);
  }
  // search using the EVENTS dropdown in the navbar
  else if(venuetype=="xxx" && place=="yyy") {
    var mysort = {Rating: -1};
    Item.find({Event_Speciality: { $regex: event, $options: 'i' }}, function(err, foundItems){
      if(err) {
        console.log(err);
      } else {
        // console.log(foundItems);
        res.render("options", {newListItems: foundItems, vary: k});
      }
    }).sort(mysort);
  }
  // search by filling only PLACE input field in the search bar
  else if(venuetype=="xxx" && event=="") {
    var mysort = {Rating: -1};
    Item.find({City: { $regex: place, $options: 'i' }}, function(err, foundItems){
      if(err) {
        console.log(err);
      } else {
        res.render("options", {newListItems: foundItems, vary: k});
      }
    }).sort(mysort);
  }
  // search by filling only EVENT input field in the search bar
  else if(venuetype=="xxx" && place=="") {
    var mysort = {Rating: -1};
    Item.find({Event_Speciality: { $regex: event, $options: 'i' }}, function(err, foundItems){
      if(err) {
        console.log(err);
      } else {
        res.render("options", {newListItems: foundItems, vary: k});
      }
    }).sort(mysort);
  }
  // search by filling both PLACE & EVENT input field in the search bar
  else if(venuetype=="xxx") {
    var mysort = {Rating: -1};
    Item.find({Event_Speciality: { $regex: event, $options: 'i' }, City: { $regex: place, $options: 'i' }}, function(err, foundItems){
      if(err) {
        console.log(err);
      } else {
        res.render("options", {newListItems: foundItems, vary: k});
      }
    }).sort(mysort);
  }
  // search using SHOW MORE button below the four venuetypes stated above
  else if(place=="yyy" && event=="zzz") {
    var mysort = {Rating: -1};
    Item.find({Venue_Type: { $regex: venuetype, $options: 'i' }}, function(err, foundItems){
      if(err) {
        console.log(err);
      } else {
        res.render("options", {newListItems: foundItems, vary: k});
      }
    }).sort(mysort);
  }
});

app.post("/rating", function(req, res){
  const rating = req.body.rating;
  const buttonItemId= req.body.button;
  Item.findById(buttonItemId, function(err, foundItems2){
    if(err) {
      console.log(err);
    } else {
      if(foundItems2.Rating == undefined) {
        Item.findByIdAndUpdate(buttonItemId, {Rating_Number: 1}, function(err, foundItems1){
          if(!err) {
            Item.findByIdAndUpdate(buttonItemId, {Rating: Number(rating)}, function(err, foundItems){
              if(!err) {
                res.render("booknow", {newListItems: foundItems, vary: k})
              }
            });
          }
        });
      } else {
        Item.findByIdAndUpdate(buttonItemId, {Rating_Number: foundItems2.Rating_Number+1}, function(err, foundItems1){
          if(!err) {
            // console.log(foundItems1.Rating_Number);
            // console.log(foundItems1.Rating);
            Item.findByIdAndUpdate(buttonItemId, {Rating: ((foundItems1.Rating*(foundItems1.Rating_Number)+Number(rating))/(foundItems1.Rating_Number+1))}, function(err, foundItems){
              if(!err) {
                // console.log(foundItems1.Rating_Number);
                // console.log(foundItems1.Rating);
                // console.log(foundItems.Rating);
                res.render("booknow", {newListItems: foundItems, vary: k})
              }
            });
          }
        });
      }
    }
  });
});

app.post("/reviews", function(req, res){
  const reviews = req.body.reviews;
  const review1 = new Review({
    review: reviews,
  });
  review1.save();
  const buttonItemId = req.body.button;
  Item.findById(buttonItemId, function(err, foundItems){
    if(err) {
      console.log(err);
    } else {
      foundItems.Reviews.push(review1);
      foundItems.save();
      res.render("booknow", {newListItems: foundItems, vary: k})
    }
  });
});

app.post("/seereviews", function(req, res){
  const buttonItemId = req.body.button;
  Item.findById(buttonItemId, function(err, foundItems){
    console.log(foundItems);
    res.render("seereviews", {newListItems: foundItems.Reviews});
  });
});

app.post("/book", function(req, res){
  const fname = req.body.fname;
  const addr = req.body.addr;
  const pnum = req.body.pnum;
  const edate = req.body.doe
  const buttonItemId = req.body.button;
  Item.findById(buttonItemId, function(err, foundItems){
    if(err) {
      console.log(err);
    } else {
      const eoname = foundItems.Event_Organzation_Name;
      Customer.findOne({event_date: edate, Event_Organzation_Name: eoname}, function(err, exist){
        if(err) {
          console.log(err);
        } else {
          if(exist) {
            res.render("booknow", {newListItems: foundItems, vary: 'iii'});
          } else {
            const customer1 = new Customer({
              full_name: fname,
              address: addr,
              phone_num: pnum,
              event_date: edate,
              Event_Organzation_Name: eoname,
            });
            customer1.save();
            res.render("booknow", {newListItems: foundItems, vary: 'jjj'})
          }
        }
      });
    }
  });
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
