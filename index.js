const express=require('express')
const app=express();
const port=process.env.PORT || 5000
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors=require('cors');
const jwt=require('jsonwebtoken');

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

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.TOKEN, function (err, decoded ) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded  = decoded ;
        next();
    })

}
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
    const result=await userCollection.find(query).toArray()
    res.send(result);
   })
   app.get('/users/admin/:email',async(req,res)=>{
    const email =req.params.email
    const query={
        email:email
    }
    const admin =await userCollection.findOne(query)
    res.send({isAdmin:admin?.userRoll==="admin"});    
    
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
  
     app.get('/addedproducts',verifyJWT,async(req,res)=>{
        const email=req.query.email 
        const decodedEmail=req.decoded.email
        if(email !==decodedEmail){
            return res.status(403).send({message:"forbiddedn access"})
        }

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
    app.get('/bookings',async(req,res)=>{
        const email=req.query.email
        const bookings=await bookingCollection.find({}).toArray()
        const match=bookings.filter(book=>book?.buyer?.email===email)       
        res.send(match);

    })
    app.post('/booking',async(req,res)=>{
        const booking=req.body
        const id =req.body.booking_id
        const email=req.body.buyer_email
        const query={
            booking_id:id,
            buyer_email:email,
        }
        console.log(id,"line,132")
        const oldBooking=await bookingCollection.find(query).toArray()       
        const message="you have alredy booking the items go to my order"
        if(oldBooking.length){
            return res.send({acknowledged:false,message})
        }        
        const result=await bookingCollection.insertOne(booking);
        res.send(result);
    })
    app.delete('/bookings/:postid',async(req,res)=>{
        const id =req.params.postid      
        const query={_id:ObjectId(id)}
        const result=await bookingCollection.deleteOne(query); 
        res.send(result);
    })
    app.post('/wishlists',async(req,res)=>{
        const products=req.body;     
        const id=req.body.product_id 
        const email=req.body.buyer_email   
        const query={
            product_id :id,
            buyer_email:email

        }    
        const alredyAdded=await wishlistCollecton.find(query).toArray()          
        const message='You alredy added this product'
        if(alredyAdded.length){            
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
    app.delete('/wishlist/:postid',async(req,res)=>{
        const  id =req.params.postid;
        const query=({_id:id})
        const result=await wishlistCollecton.deleteOne(query);
        res.send(result)
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
        const query1={_id:id}      
        const result=await producCollection.deleteOne(query);
        const result1=await addvertiseCollection.deleteOne(query1);      
        res.send({result,result1});
    })
    app.get('/jwt',async(req,res)=>{
        const email=req.query.email
        const query={email:email
        }
        const user=await userCollection.find(query).toArray();
        console.log(user);
        if(user){
            console.log(user)
            const token=jwt.sign({email},process.env.TOKEN, {expiresIn: '5h'})
            return res.send({token:token})
        }
            res.status(403).send({token:' '})
           
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