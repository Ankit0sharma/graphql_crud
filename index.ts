import dotenv from "dotenv";
dotenv.config();
import { createYoga } from "graphql-yoga";
import { schemaWithMiddleware } from "./src/schema";
import { PrismaClient } from "@prisma/client";
import express from "express";

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 5001;

const yoga = createYoga({
  schema: schemaWithMiddleware,
  context: ({ request }) => {
    return {
      ...request,
      prisma,
    };
  },
});
app.use("/graphql", yoga);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
