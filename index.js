const express=require('express');
const app =express();
const port =process.env.PORT || 5000
const cors=require('cors');
app.use(cors());
app.use(express());

app.get('/',(req,res)=>{
    res.send('server working');
})

app.listen(port,
    console.log('server run port 5000')
)