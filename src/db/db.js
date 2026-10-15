import mongoose from 'mongoose';
import {dbName} from "../constants.js";
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${dbName}`);
        console.log(`MongoDB Connected!! DB host: ${connectionInstance.connection.host}`);        
    } catch (error) {
        console.log("Connection failed", error)
        process.exit(1);
    }
}

export default connectDB;