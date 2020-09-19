import { Field, Int, ObjectType } from 'type-graphql';
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

// Saying to graphql that this is object which can be refered as a type
@ObjectType()
// Satying it is table in db
@Entity('users')
// Base class BaseEntity allows to use methods like save() and so on
export class User extends BaseEntity {
  // Choosing fields to expose, cant infer number type so we have to explicitely set it as int
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  email: string;

  @Column()
  password: string;

  @Column('int', { default: 0 })
  tokenVersion: number;
}
