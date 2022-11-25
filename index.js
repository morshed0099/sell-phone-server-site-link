const express= require('express')
const app =express()
const port=process.env.PORT || 5000

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
app.use(express())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1m4kiwj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
 const userCollection =client.db('sellPhone').collection('users');
async function run(){
try{
   
}
finally{

}
}run().catch(error=>console.error(error))

app.get('/',(req,res)=>{
 res.send('server is working');
})

app.post('/users',async(req,res)=>{
    const user =req.body;
    // const id=req.params.id
    // const up=({_id:ObjectId(id)})
    const result=await userCollection.insertOne(user);
    res.send(result);
   })

app.listen(port,()=>{
    console.log('server is working 5000 ')
})