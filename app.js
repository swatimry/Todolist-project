//here all modules are imported first
const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");//for making pagetitle consistent

//required setting for all modules
const app = express();
app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect("mongodb://127.0.0.1:27017/tododb", { useNewUrlParser: true });


//schema for default list
const ischema = { name: String };
const imodel = mongoose.model("item", ischema);//default model
const i1 = new imodel({ name: "hey there" });
const i2 = new imodel({ name: "get up" });
const i3 = new imodel({ name: "fuel up" });

//schema for variable lists
const listschema = {
  name: String,
  items: [ischema]
};
const lmodel = mongoose.model("list", listschema);//variable list model

//default route
app.get("/", function (req, res) {
  imodel.find().then((ans) => {
  if (ans.length === 0) {
      imodel.insertMany([i1, i2, i3]);
      res.redirect("/");
    }
    res.render("index", { tasks:ans, daykind: "Today" });})
})


//dynamic link route
 app.get("/:anylink", function (req, res) {
  const pagename = _.capitalize(req.params.anylink); //making title consistent to avoid duplicates

  lmodel.find({name:pagename}).then(function(ans){
        if(ans.length===0){
        //if page doesnt exist already
        const newitem=new lmodel({
          name:pagename,
          items:[i1,i2,i3]})
        newitem.save();
        res.redirect("/"+pagename);//go to current route in this case the dynamic route
      }
      else{
        //if page already exists
        res.render("index",{tasks:ans[0].items,daykind:ans[0].name});
      }
    })
})


//to add data post requests for all routes
app.post("/", function (req, res) {
  const listfrom=req.body.postfrom;//from where
  const itemname=req.body.task;//what to add
  const i4 = new imodel({ name: req.body.task });//default model
  //if to add in default list
  if(listfrom==="today"){
    i4.save();
    res.redirect ("/");
  }
  //to add in dynamic list
  else{
    lmodel.findOne({name:listfrom}).then(function(ans){
      console.log(ans);
      ans.items.push(i4);
      ans.save();
      res.redirect("/"+listfrom);
    })
  }

})

//to delete from all routes
app.post("/delete", function (req, res) {
  const todel = req.body.checkbox;
  const listname=req.body.listfrom;
  if(listname==="today"){
    imodel.findByIdAndRemove(todel).then((err) => {
      console.log("deleted", err);
    });
    res.redirect("/");
  }
  else{
    lmodel.findOneAndUpdate({name:listname},{$pull:{items:{_id:todel}}})//pull is monggodb function
    .then(function(ans){
      res.redirect("/"+listname);
    })
 }
})

app.listen(3000, function () {
  console.log("listening");
})