import { compare, hash } from 'bcryptjs';
import {
  Arg,
  Ctx,
  Field,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { getConnection } from 'typeorm';
import {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
} from './auth';
import { Context } from './context/context';
import { User } from './entity/User';
import { isAuth } from './middleware/isAuth';

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;
}

// type-graphql allows to check both type of graphqk and ts types at same time
@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return 'hi!';
  }

  @Query(() => String)
  @UseMiddleware(isAuth)
  bye(@Ctx() { payload }: Context) {
    console.log(payload);

    return `your user id is: ${payload!.userId}`;
  }

  @Query(() => [User])
  users() {
    return User.find();
  }

  // if user forgot password or whatever, we can revoke tokens which will increment versions of all token by 1
  // and afterwards they wont pass check in refresh_token route since versions will be not equal
  @Mutation(() => Boolean)
  async revokeRefreshTokensForUser(@Arg('userId', () => Int) userId: number) {
    await getConnection()
      .getRepository(User)
      .increment({ id: userId }, 'tokenVersion', 1);
    return true;
  }

  @Mutation(() => Boolean)
  async register(
    // What user actually passes under email arg in body is assigned to our variable email
    @Arg('email') email: string,
    @Arg('password') password: string
  ) {
    try {
      const hashedPassword = await hash(password, 12);
      await User.insert({
        email,
        password: hashedPassword,
      });
    } catch (error) {
      console.log(error);
      return false;
    }
    return true;
  }

  //        return type of query/mutation
  @Mutation(() => LoginResponse)
  async login(
    // What user actually passes under email arg in body is assigned to our variable email
    @Arg('email') email: string,
    @Arg('password') password: string,
    // Access to the context
    @Ctx() { req, res }: Context
  ): Promise<LoginResponse> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Invalid login');
    }
    const isValid = await compare(password, user.password);
    if (!isValid) {
      throw new Error('Bad password');
    }
    // at this point login is successful

    // Setting cookie on response with refresh token inside of it
    sendRefreshToken(res, createRefreshToken(user));

    return {
      accessToken: createAccessToken(user),
    };
  }
}
