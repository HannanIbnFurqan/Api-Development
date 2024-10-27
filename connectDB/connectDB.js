import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

const dataBase = process.env.connectDB
const connectDB = async () =>{
    try {
      await  mongoose.connect(dataBase)
      console.log('connection successfully')

    } catch (error) {
        console.log(error)
    }
}

export default connectDB