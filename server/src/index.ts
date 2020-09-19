import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { UserResolver } from './UserResolver';
import { createConnection } from 'typeorm';
import cookieParser from 'cookie-parser';
import { verify } from 'jsonwebtoken';
import { User } from './entity/User';
import {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
} from './auth';

(async () => {
  const app = express();
  // parsing cookie to object
  app.use(cookieParser());

  app.get('/', (_req, res) => {
    res.send('hello');
  });

  app.post('/refresh_token', async (req, res, next) => {
    const token = req.cookies.jid;

    if (!token) {
      return res.send({ ok: false, accessToken: '' });
    }
    let payload: any = null;
    try {
      payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
    } catch (error) {
      console.log(error);

      return res.send({ ok: false, accessToken: '' });
    }

    // at this point token is valid and we can send back an access token
    const user = await User.findOne({ id: payload.userId });
    if (!user) {
      return res.send({ ok: false, accessToken: '' });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.send({ ok: false, accessToken: '' });
    }
    // ensure that user can stay logged in for more than 7days if they continiously use website
    sendRefreshToken(res, createRefreshToken(user));

    return res.send({ ok: true, accessToken: createAccessToken(user) });
  });

  await createConnection();
  const apolloServer = new ApolloServer({
    // Takes resolver and creates graphql schema for its equivalent
    schema: await buildSchema({
      resolvers: [UserResolver],
    }),
    // passing req and res inside apolloserver, will be passed to the resolver on every request
    context: ({ req, res }) => ({ req, res }),
  });

  // Adding graphql routes as a middleware to express
  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log('Server has started');
  });
})();
