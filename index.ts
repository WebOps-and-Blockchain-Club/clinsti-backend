import express from "express";
import * as dotenv from "dotenv";
dotenv.config();
import client from "./postgres";
import userRouter from "./src/routers/user"
import complaintRouter from "./src/routers/complaint"

const app = express();

client.connect().then(() => {
  console.log("Connected to database");
  app.use(express.json())
  app.use(userRouter)
  app.use(complaintRouter)
  app.listen(3000, () => console.log("Listening on port 3000!"));
});
