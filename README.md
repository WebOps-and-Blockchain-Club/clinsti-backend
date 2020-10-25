Note do not edit the db folder, it lead to unforseen consequences
Delete all instances of postgres already installed on your pc and then proceed

To setup the database with postgres run the following command in the root directory
docker-compose up -d

Add a env file in prisma directory containing the
DATABASE_URL="postgresql://admin:secret@localhost:5432/blockchain_cfi?schema=public"
In the above line make sure to change localhost to the ip address of your docker toolbox (in windows), if you're using linux please find the proper ip address at which docker is running and replace localhost with it.

The above commands will also setup pgadmin on localhost:8080 (again replace localhost with appropriate ip address)
Pgadmin can be used for visualizing the postgres
The credentials for pgadmin is as follows
email: admin@blockchain_cfi.com
password: secret

Add a env file in the root directory containing the JWT_SECRET

1. yarn migrate (Press yes, if asked to create a new database)
2. yarn generate
3. yarn dev
