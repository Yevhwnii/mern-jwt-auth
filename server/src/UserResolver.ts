import { Query, Resolver } from 'type-graphql';

// type-graphql allows to check both type of graphqk and ts types at same time
@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return 'hi!';
  }
}
