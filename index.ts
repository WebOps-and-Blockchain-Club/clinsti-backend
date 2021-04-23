import express from "express";
import * as dotenv from "dotenv";
const cookieParser = require('cookie-parser');
dotenv.config();
import client from "./postgres";
import userRouter from "./src/client-routers/user"
import adminRouter from "./src/admin-routers/admin"
import complaintRouter from "./src/client-routers/complaint"
import adminComplaintRouter from './src/admin-routers/complaint'
import feedbackRouter from "./src/client-routers/feedback"
const cors = require('cors');


const app = express();

client.connect().then(() => {
  console.log("Connected to database");
  app.use(cors({
    credentials:true,
    origin:"http://localhost:3001"
  }));
  app.use(express.json())
  app.use(cookieParser())
  app.use(userRouter)
  app.use(adminRouter)
  app.use(complaintRouter)
  app.use(adminComplaintRouter)
  app.use(feedbackRouter)
  app.listen(3001/*,'192.168.43.104'*/, () => console.log("Listening on port 3000!"));
});
