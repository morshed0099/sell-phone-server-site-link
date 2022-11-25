const express=require('express')
const app=express();
const port=process.env.PORT || 5000
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors=require('cors')

app.use(cors())
app.use(express.json())

console.log(process.env.DB_USER,process.env.DB_PASS);



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1m4kiwj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const userCollection =client.db('sellPhoneDb').collection('users')
const categoryCollect =client.db('sellPhoneDb').collection('category')

async function run(){
   try{
     app.get('/users',async (req,res)=>{
        const qurey={}
        const result=await userCollection.find(qurey).toArray();
        res.send(result);
     })
     app.get('/categories',async (req,res)=>{
        const qurey={}
        const result=await categoryCollect.find(qurey).toArray()
        res.send(result);
     })
    app.post('/users',async (req,res)=>{
        const user=req.body;
        console.log(user)
        const result=await userCollection.insertOne(user);
        res.send(result);
    })
  
   }finally{

   }
}run().catch(err=>console.error(err))

app.get('/',(req,res)=>{
    res.send('server run')
})

app.listen(port,()=>{
    console.log('server running 5000')
})