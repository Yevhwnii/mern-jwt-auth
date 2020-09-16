import { compare, hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import {
  Arg,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import { User } from './entity/User';

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

  @Query(() => [User])
  users() {
    return User.find();
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

  @Mutation(() => LoginResponse)
  async login(
    // What user actually passes under email arg in body is assigned to our variable email
    @Arg('email') email: string,
    @Arg('password') password: string
  ): Promise<LoginResponse> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Invalid login');
    }
    const isValid = compare(password, user.password);
    if (!isValid) {
      throw new Error('Bad password');
    }
    // Login successful

    return {
      accessToken: sign({ userId: user.id }, 'secret', { expiresIn: '15m' }),
    };
  }
}
