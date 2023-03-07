const express = require('express')
const bodyparser = require('body-parser')
const mongoose = require('mongoose')
const _ = require('lodash')
const app = express()
app.use(bodyparser.urlencoded({extended: true}))
app.use(express.static('public'))
app.set('view engine','ejs')

mongoose.connect('mongodb+srv://dbpranav:test123@cluster0.you1xwz.mongodb.net/todoListDB',{useNewUrlParser:true,useUnifiedTopology: true})
main().catch(err => console.log(err));
 
async function main() {
  await mongoose.connect('mongodb+srv://dbpranav:test123@cluster0.you1xwz.mongodb.net/todoListDB',{useNewUrlParser:true,useUnifiedTopology: true});
  console.log("Connected");
}


const itemSchema = new mongoose.Schema({
  name:String,
})

const Item = new mongoose.model ("Item", itemSchema)

const item1 = new Item({
  name : "Welcome to your todolist!"
})

const item2  = new Item({
  name : "Hit the + button to add a new item."
})

const item3 = new Item({
  name : "<-- Hit this to delete an item"
})

const defaultItems = [item1, item2, item3];

const listschema = {
  name:String,
  items:[itemSchema]
}

const List = mongoose.model('list',listschema)

app.get('/',function(req,res){

    Item.find()
    .then(function(items){
      if (items.length===0){
        Item.insertMany(defaultItems)
            .then(function(){
              console.log('successfully saved to db')
            })
            .catch(function(err){
              console.log(err)
            })
      res.redirect('/')
      }else{
        res.render('list',{day:'Today' , newitemlist:items})
      }

    })
    .catch(function(err){
      console.log(err)
    })
})

app.get('/:customlistname',function(req,res){
  const customlistname = _.capitalize(req.params.customlistname)
  List.findOne({name:customlistname})
      .then(function(items){
        if (!items){
          const list = new List({
            name:customlistname,
            items:defaultItems
          })
          list.save()
          res.redirect('/'+customlistname)
        }else{
          res.render('list',{day:items.name , newitemlist:items.items})
        }
      })
      .catch(function(err){
        console.log(err)
      })
})


app.post('/',function(req,res){
    
    const itemName = req.body.newitem
    const listName = req.body.list
    const item = new Item({
          name:itemName
        })

    if (listName==='Today'){
      item.save()
      res.redirect('/')
    }else{
      List.findOne({name:listName})
          .then(function(items){
            items.items.push(item)
            items.save()
            res.redirect('/'+listName)
          })
          .catch(function(err){
            console.log(err)
          })
    }
})

app.post('/delete',function(req,res){
  const checkedItemId = req.body.checkbox
  const listName = req.body.listName

  if (listName==='Today'){
    Item.findByIdAndRemove(checkedItemId)
      .then(function(){
        console.log('successfully deleted')
        res.redirect('/')
      })
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}})
        .then(function(items){
          res.redirect('/'+listName)
        })
        .catch(function(err){
          console.log(err)
        })
  }

  
})



app.get('/about',function(req,res){
    res.render('about')
})
app.listen(3000,function(){
    console.log('server is running on port 3000')
})