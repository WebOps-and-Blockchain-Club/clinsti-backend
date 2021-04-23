CREATE TABLE admin(
  admin_id uuid DEFAULT uuid_generate_v4() UNIQUE,
  admin_name VARCHAR(255) NOT NULL,
  admin_email VARCHAR(255) NOT NULL UNIQUE,
  admin_password VARCHAR(255) NOT NULL,
  PRIMARY KEY(admin_id)
);

insert into admin(admin_name, admin_email, admin_password) values('xx', 'xx@yy.com', 'XXX')