import { PubSub } from "graphql-subscriptions";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

interface UserInput {
  id?: number;
  name: string;
  email: string;
  password: string;
  role: string;
}

const pubSub = new PubSub();
const USER_CREATED = "USER_CREATED";

export const userResolvers = {
  //TODO retrieve is implemented here
  Query: {
    users: async () => {
      const users = await prisma.user.findMany();
      return users;
    },
  },
  //TODO CUD is implemented here
  Mutation: {
    createUser: async (_: any, { name, email, password, role }: UserInput) => {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword, role },
      });
      await pubSub.publish(USER_CREATED, { userCreated: user });
      return user;
    },
    updateUser: (_: any, { id, name, email }: UserInput) =>
      prisma.user.update({
        where: { id },
        data: { name, email },
      }),
    deleteUser: (_: any, { id }: UserInput) =>
      prisma.user.delete({
        where: { id },
      }),
    signIn: async (_: any, { email, password }: UserInput, context: any) => {
      const user = await context.prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new Error("No such user found");
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new Error("Invalid password");
      }
      const token = jwt.sign({ user: user }, process.env.SECRET_KEY!, {
        expiresIn: "7d",
      });
      return {
        token,
        user,
      };
    },
  },
  //TODO added subscription for create user Mutation
  Subscription: {
    userCreated: {
      subscribe: () => pubSub.asyncIterator(USER_CREATED),
    },
  },
};
