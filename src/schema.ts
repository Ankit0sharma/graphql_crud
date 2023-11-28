import { makeExecutableSchema } from "@graphql-tools/schema";
import { applyMiddleware } from "graphql-middleware";
import { shield, rule, and } from "graphql-shield";

import resolvers from "./resolvers";
import typeDefs from "./typedefs";

import jwt from "jsonwebtoken";

function getUserFromToken(token: string) {
  try {
    return jwt.verify(token, process.env.SECRET_KEY!);
  } catch (error) {
    return null;
  }
}

const isAuthenticated = async (
  resolve: any,
  root: any,
  args: any,
  context: any,
  info: any
) => {
  let decoded: any;
  decoded = getUserFromToken(context.req.get("Authorization"));
  context.req.user = decoded;
  const user = await resolve(root, args, context, info);
  return user;
};

const isValid = rule({ cache: "contextual" })(
  async (_parent: any, _args: any, ctx: any, _info: any) => {
    console.log(ctx.req.user);
    return ctx.req.user !== null;
  }
);

const isAdmin = rule({ cache: "contextual" })(
  async (_parent, _args, ctx, _info) => {
    return ctx.req.user.user.role.includes("admin");
  }
);

const middlewares = {
  Query: {
    users: isAuthenticated,
  },
  Mutation: {
    updateUser: isAuthenticated,
  },
};

const permissions = shield({
  Query: {
    users: and(isValid, isAdmin),
  },
});

const schema = makeExecutableSchema({
  resolvers: [resolvers],
  typeDefs: [typeDefs],
});

export const schemaWithMiddleware = applyMiddleware(
  schema,
  //middlewares,
  //permissions
);
