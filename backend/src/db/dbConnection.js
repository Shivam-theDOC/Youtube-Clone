import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const dbConnection = async () => {
  try {
    const connection = await mongoose.connect(
      `${process.env.dbConnectionURL}/${DB_NAME}`
    );
    console.log(`DB Connected with host : ${connection.connection.host}`);
  } catch (error) {
    console.log(error);
  }
};

export default dbConnection;
