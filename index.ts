import { ApolloServer } from "apollo-server";
import dotenv from "dotenv";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import resolvers from "./resolvers";

dotenv.config();

const startServer = async () => {
  const schema = await buildSchema({
    resolvers,
    validate: false,
  } as any);
  const server = new ApolloServer({
    schema,
    context: async () => {
      return {};
    },
    cors: {
      origin: ["http://localhost:3000"],
      credentials: true,
    },
    subscriptions: {
      path: "/",
    },
  });
  server.listen(9000).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
};

startServer();
