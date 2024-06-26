CREATE DATABASE complaints_cfi;

CREATE TABLE users(
  user_id uuid DEFAULT uuid_generate_v4() UNIQUE,
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL UNIQUE,
  user_password VARCHAR(255) NOT NULL,
  password_otp VARCHAR(10),
  user_verified BOOLEAN DEFAULT '0' NOT NULL,
  user_verification_uuid uuid DEFAULT uuid_generate_v4() UNIQUE,
  PRIMARY KEY(user_id)
);

insert into users(user_name, user_email, user_password) values('xx', 'xx@yy.com', 'XXX')