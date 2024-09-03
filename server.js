
const userRoutes = require('./routes/userRoute.js')
const authRoutes = require('./routes/authRoutes.js')
require(`dotenv`).config();
const bodyParser = require('body-parser');

// const mongoose = require(mongoose)
const express = require('express');
const { default: mongoose } = require('mongoose');
const app = express();

app.set('view engine','ejs');
app.set('views','./views');

app.use(bodyParser.json());

const port = process.env.SERVER_PORT || 3000;  

app.use('/api',userRoutes);
app.use('/',authRoutes)

const connectDB = async()=>{
    try{
         await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`)
        console.log("Mongodb connected !");
    } catch(error){
       console.log("Mongo Connection Failed",error);
    }
}
connectDB()
.then(()=>{
    app.listen(port, ()=>{
        console.log(`server is Listening on port ${port}`)
    })
 
})
.catch((err) =>{
    console.log("connection failed!!!!",err)
})
