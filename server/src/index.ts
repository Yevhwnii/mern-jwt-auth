import 'reflect-metadata';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { UserResolver } from './UserResolver';

(async () => {
  const app = express();
  app.get('/', (_req, res, next) => {
    res.send('hello');
  });
  const apolloServer = new ApolloServer({
    // Takes resolver and creates graphql schema for its equivalent
    schema: await buildSchema({
      resolvers: [UserResolver],
    }),
  });

  // Adding graphql routes as a middleware to express
  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log('Server has started');
  });
})();

// createConnection().then(async connection => {

//     console.log("Inserting a new user into the database...");
//     const user = new User();
//     user.firstName = "Timber";
//     user.lastName = "Saw";
//     user.age = 25;
//     await connection.manager.save(user);
//     console.log("Saved a new user with id: " + user.id);

//     console.log("Loading users from the database...");
//     const users = await connection.manager.find(User);
//     console.log("Loaded users: ", users);

//     console.log("Here you can setup and run express/koa/any other framework.");

// }).catch(error => console.log(error));