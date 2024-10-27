import express from 'express';
import connectDB from './connectDB/connectDB.js'
import router from './routes/route.js';
import dotenv from 'dotenv'

dotenv.config()
const app = express();
// PORT
const PORT = process.env.PORT || 8000
// global route
app.use('/api/stock', router)

// server is listen
app.listen(PORT, ()=>{
    console.log(`server is running ${PORT}`)
    connectDB()
})

