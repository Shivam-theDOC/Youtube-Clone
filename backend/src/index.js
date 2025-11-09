import dotenv from "dotenv";
import dbConnection from "./db/dbConnection.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

dbConnection()
  .then(
    app.listen(process.env.PORT, () => {
      console.log(
        `connected succesfully....Listning to PORT :${process.env.PORT}`
      );
    })
  )
  .catch((error) => {
    console.log("DB connection failed ", error);
  });

/*
//? index file connection approach
import express from "express";
import mongoose from "mongoose";
import { DB_Name } from "./constants.js";

const app = express();
//! semicolon is added to terminate the previous process in case the editor forgot to place it but the editor always places it.
(async () => {
  try {
    const connect = await mongoose.connect(
      `${process.env.dbConnectionURL}/${DB_Name}`
    );
    app.on("error", (error) => {
      console.log("Connection to the database failed", error);
      throw error;
    });
    app.listen(process.env.PORT, (res, req) => {
      console.log(`DB Connected.... listening to PORT ${process.env.PORT}`);
    });
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
})();
*/
