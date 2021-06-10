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
import adminFeedbackRouter from "./src/admin-routers/feedback"

import cors from 'cors';

// PORT=3000        add to .env
// PROXY_LINK='http://localhost:3001'

const app = express();

client.connect().then(() => {
  console.log("Connected to database");
  app.use(cors({
    credentials:true,
    origin:process.env.PROXY_LINK
  }));
  app.use(express.json())
  app.use(cookieParser())
  app.use(userRouter)
  app.use(adminRouter)
  app.use(complaintRouter)
  app.use(adminComplaintRouter)
  app.use(feedbackRouter)
  app.use(adminFeedbackRouter)
  app.listen(process.env.PORT, () => console.log(`Listening on port ${process.env.PORT}!`));
});
