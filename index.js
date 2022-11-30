const express=require('express')
const app=express();
const port=process.env.PORT || 5000
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors=require('cors');
const { query } = require('express');

app.use(cors())
app.use(express.json())

console.log(process.env.DB_USER,process.env.DB_PASS);



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1m4kiwj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const userCollection =client.db('sellPhoneDb').collection('users')
const categoryCollection =client.db('sellPhoneDb').collection('category')
const producCollection =client.db('sellPhoneDb').collection('products')
const bookingCollection =client.db('sellPhoneDb').collection('bookings')
const wishlistCollecton=client.db('sellPhoneDb').collection('wishlists')
const addvertiseCollection=client.db('sellPhoneDb').collection('advertise')
async function run(){
   try{
     app.get('/users/seller',async (req,res)=>{
        const qurey={userRoll:'seller'}        
        const result=await userCollection.find(qurey).toArray();
        res.send(result);
     })
    //  app.get('/users',async(req,res)=>{
    //     const query={}
    //     const result=await userCollection.find(query).toArray()
    //     res.send(result)
    //  })
   app.get('/users',async(req,res)=>{
    const email=req.query.email;    
    const query={email:email}
    const result=await userCollection.findOne(query)
    res.send(result);
   })
     app.get('/users/buyer',async (req,res)=>{
        const qurey={userRoll:'buyer'}        
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
     app.get('/advertises',async(req,res)=>{        
        const cursor= addvertiseCollection.find({})
        const result=await cursor.limit(6).toArray();        
        res.send(result)
     })

     app.post('/advertise',async(req,res)=>{
        const addvertise=req.body
        const id=addvertise._id        
        const match=await addvertiseCollection.find({}).toArray()
        const added=match.filter(pdt=>pdt._id===id)
        const message='alredy added'
        if(added.length){
            return res.send({acknowledged:false, message})
        }
        const result=await addvertiseCollection.insertOne(addvertise);
        res.send(result)
     })
  
     app.get('/addedproducts',async(req,res)=>{
        const email=req.query.email       
        const allProducts=await producCollection.find({}).toArray() 
        const addedProduct=allProducts.filter(produt=>produt.seller[0].email===email)
         res.send(addedProduct);
              
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
    app.post('/wishlists',async(req,res)=>{
        const products=req.body;     
        const id=products._id
        console.log(products ,'line 109')       
        const alredyAdded=await wishlistCollecton.find({}).toArray()
        const added=alredyAdded.filter(add=>add._id===id)
        console.log(added,'line 112',added.length);
        const message='You alredy added this product'
        if(added.length){
            console.log(message,'line 115');
            return res.send({acknowledged:false, message})
           
        }
        const result= await wishlistCollecton.insertOne(products)
            res.send(result);
        
    })
    app.get('/wishlist',async(req,res)=>{
        const email=req.query.email        
        const wishlist=await wishlistCollecton.find({}).toArray()
        const match=wishlist.filter(wish=>wish.buyerIfo.email===email)
        res.send(match);

    })
    app.put('/users/buyer/:id',async(req,res)=>{
        const id=req.params.id
        const filter={_id:ObjectId(id)}
        const options = { upsert: true };
        const status=req.body 
        console.log(status)
        const updateDoc={
            $set:{
                status:true
           }  
          }
          const result= await userCollection.updateOne(filter,updateDoc,options)
          res.send(result);
    })
    app.put('/users/seller/:id',async(req,res)=>{
        const id=req.params.id
        const filter={_id:ObjectId(id)}
        const options = { upsert: true };
        const status=req.body 
        console.log(status)
        const updateDoc={
            $set:{
                status:true
           }  
          }
          const result= await userCollection.updateOne(filter,updateDoc,options)
          res.send(result);
    })
    app.delete('/users/buyer/:id',async(req,res)=>{
        const id =req.params.id;
        const query={_id:ObjectId(id)}
        const result=await userCollection.deleteOne(query);
        res.send(result);
    })
    app.delete('/users/seller/:id',async(req,res)=>{
        const id =req.params.id;
        const query={_id:ObjectId(id)}
        const result=await userCollection.deleteOne(query);
        res.send(result);
    })
    app.delete('/products/:id',async(req,res)=>{
        const id =req.params.id;
        const query={_id:ObjectId(id)}        
        const result=await producCollection.deleteOne(query);
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