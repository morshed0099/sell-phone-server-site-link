const express=require('express')
const app=express();
const port=process.env.PORT || 5000
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors=require('cors');

app.use(cors())
app.use(express.json())

console.log(process.env.DB_USER,process.env.DB_PASS);



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1m4kiwj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const userCollection =client.db('sellPhoneDb').collection('users')
const categoryCollection =client.db('sellPhoneDb').collection('category')
const producCollection =client.db('sellPhoneDb').collection('products')
const bookingCollection =client.db('sellPhoneDb').collection('bookings')

async function run(){
   try{
     app.get('/users',async (req,res)=>{
        const qurey={}
        const result=await userCollection.find(qurey).toArray();
        res.send(result);
     })
     app.get('/categories',async (req,res)=>{
        const qurey={}
        const result=await categoryCollection.find(qurey).toArray()
        res.send(result);
     })
     app.get('/products',async(req,res)=>{
        const qurey={}
        const cursor=producCollection.find(qurey)
        const products=await cursor.limit(3).toArray()
        res.send(products)
     })
     app.get('/category/:id',async(req,res)=>{
        const id=req.params.id
        console.log(id);
        const query=({category_id:id})
        const products=await producCollection.find(query).toArray();
        res.send(products);
     })
     app.get('/product/:id',async(req,res)=>{
        const id=req.params.id
        const query=({_id:ObjectId(id)})
        const result=await producCollection.find(query).toArray()
        res.send(result)
     })
    app.post('/users',async (req,res)=>{ 
        const user=req.body;  
        const email=req.body.email      
        const roll=req.body.userRoll
        const neme=req.body.userName
        const match={
            email:email,
            userRoll:roll,
            userName:neme
        }
        const users =await userCollection.find(match).toArray()
        const message='your email have alrey used'
        if(users.length){
            console.log(message)
            return res.send({acknowledged:false, message})
        }
        const result=await userCollection.insertOne(user);
        res.send(result);
    })
    app.post('/products',async(req,res)=>{
        const product=req.body;
        const result=await producCollection.insertOne(product)
        res.send(result);
    })
    app.post('/booking',async(req,res)=>{
        const booking=req.body
        const result=await bookingCollection.insertOne(booking)
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