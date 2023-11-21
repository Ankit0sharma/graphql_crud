const { mergeTypeDefs } = require("@graphql-tools/merge");
import { userTypeDefinitions } from "./user.type";

const typeDefs = mergeTypeDefs([userTypeDefinitions]);

export default typeDefs;
