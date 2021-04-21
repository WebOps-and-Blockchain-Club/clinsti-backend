import express from "express";
import * as dotenv from "dotenv";
dotenv.config();
import client from "./postgres";
import userRouter from "./src/routers/user"
import complaintRouter from "./src/routers/complaint"
import feedbackRouter from "./src/routers/feedback"
const cors = require('cors');


const app = express();
app.use(cors());

client.connect().then(() => {
  console.log("Connected to database");
  app.use(express.json())
  app.use(userRouter)
  app.use(complaintRouter)
  app.use(feedbackRouter)
  app.listen(3000/*,'192.168.43.104'*/, () => console.log("Listening on port 3000!"));
});
