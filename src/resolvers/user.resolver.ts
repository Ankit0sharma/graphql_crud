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

interface PostInput {
  title: string;
  content: string;
  userId: number;
}

const pubSub = new PubSub();
const USER_CREATED = "USER_CREATED";

export const userResolvers = {
  Query: {
    users: async (_: any, args: any) => {
      try {
        const filterField = "name";
        const users = await prisma.user.findMany({
          skip: (args.page - 1) * args.pageSize,
          take: args.pageSize,
          where: {
            [filterField]: {
              contains: args.filterValue,
            },
          },
        });
        return users;
      } catch (error: any) {
        throw new Error(`Error fetching users: ${error.message}`);
      }
    },
    posts: async (_: any, args: any) => {
      try {
        const users = await prisma.user.findMany({
          include: {
            posts: {
              select: {
                id: true,
                title: true,
                content: true,
              },
            },
          },
        });
        return users;
      } catch (error: any) {
        throw new Error(`Error fetching users: ${error.message}`);
      }
    },
  },
  Mutation: {
    createUser: async (_: any, { name, email, password, role }: UserInput) => {
      try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const user = await prisma.user.create({
          data: { name, email, password: hashedPassword, role },
        });
        await pubSub.publish(USER_CREATED, { userCreated: user });
        return user;
      } catch (error: any) {
        throw new Error(`Error creating user: ${error.message}`);
      }
    },
    updateUser: async (_: any, { id, name, email }: UserInput) => {
      try {
        const updatedUser = await prisma.user.update({
          where: { id },
          data: { name, email },
        });
        return updatedUser;
      } catch (error: any) {
        throw new Error(`Error updating user: ${error.message}`);
      }
    },
    deleteUser: async (_: any, { id }: UserInput) => {
      try {
        const deletedUser = await prisma.user.delete({
          where: { id },
        });
        return deletedUser;
      } catch (error: any) {
        throw new Error(`Error deleting user: ${error.message}`);
      }
    },
    signIn: async (_: any, { email, password }: UserInput, context: any) => {
      try {
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
      } catch (error: any) {
        throw new Error(`Error signing in: ${error.message}`);
      }
    },
    createPost: async (_: any, { title, content, userId }: PostInput) => {
      try {
        const post = await prisma.post.create({
          data: {
            title,
            content,
            userId,
          },
        });
        return post;
      } catch (error: any) {
        throw new Error(`Error creating post: ${error.message}`);
      }
    },
  },
  Subscription: {
    userCreated: {
      subscribe: () => pubSub.asyncIterator(USER_CREATED),
    },
  },
};

// getAllNotifications: async(_parent: any, args: any, context: any)=>{
//   const userId = parseInt(context.req.user.id)
//   const take = applyTakeConstraints(args.take);
//   let  notifications = await prisma.notificationLog.findMany({
//     take,
//     skip: args.skip,
//     orderBy:{
//       id:'desc'
//     },
//     where:{
//       userId: userId
//     }
//   })
//   let totalCount = prisma.notificationLog.count({
//     where:{
//       userId: userId
//     }
//   })
//   return { notifications, totalCount }
// }
