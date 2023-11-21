const { mergeResolvers } = require("@graphql-tools/merge");
import { userResolvers } from "./user.resolver";

const resolvers = mergeResolvers([userResolvers]);

export default resolvers;
