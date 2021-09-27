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

client.connect()
  .then(async () => {
    console.log("Connected to database");

    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    //create user table
    await client.query(`CREATE TABLE IF NOT EXISTS users(
      user_id uuid DEFAULT uuid_generate_v4() UNIQUE,
      user_name VARCHAR(255) NOT NULL,
      user_email VARCHAR(255) NOT NULL UNIQUE,
      user_password VARCHAR(255) NOT NULL,
      password_otp VARCHAR(10),
      user_verified BOOLEAN DEFAULT '0' NOT NULL,
      user_verification_uuid uuid DEFAULT uuid_generate_v4() UNIQUE,
      PRIMARY KEY(user_id)
      );
    `);

    await client.query(`CREATE TABLE IF NOT EXISTS "admin"(
      admin_id uuid DEFAULT uuid_generate_v4() UNIQUE,
      admin_name VARCHAR(255) NOT NULL,
      admin_email VARCHAR(255) NOT NULL UNIQUE,
      admin_password VARCHAR(255) NOT NULL,
      PRIMARY KEY(admin_id)
      );
    `);

    await client.query(`CREATE TABLE IF NOT EXISTS complaints(
      user_id uuid not null,
      complaint_id serial primary key,
      description text not null,
      _location text not null,
      waste_type text,
      zone text,
      status text not null,
      created_time timestamp with time zone not null,
      registered_time timestamp with time zone,
      work_started_time timestamp with time zone,
      completed_time timestamp with time zone,
      images text[],
      foreign key (user_id) references users(user_id),
      feedback_rating int check(feedback_rating between 1 and 5),
      feedback_remark text,
      admin_remark text
      );
    `);

    await client.query(`CREATE TABLE IF NOT EXISTS feedback(
        user_id uuid not null,
        feedback_id serial primary key,
        created_time timestamp with time zone not null,
        feedback text NOT NULL,
        feedback_type text NOT NULL,
	      foreign key (user_id) references users(user_id)
      );
    `);

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
    app.listen(process.env.PORT,  () => console.log(`Listening on port ${process.env.PORT}!`));
  })
  .catch((e) => {console.log(e)});
