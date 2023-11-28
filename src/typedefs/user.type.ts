export const userTypeDefinitions = `
    type Query {
      users(page: Int!, pageSize: Int!, filterValue: String!): [User!]!
    }
    type Query {
      posts: [User!]!
    }
    type User {
      id: Int!
      name: String!
      email: String!
      password: String!
      role: String!
      posts: [Post!]!
    }
    type AuthPayload {
        token: String!
        user: User!
    }
    type Mutation {
        createUser(name: String!, email: String!, password: String!, role: String!): User!
        updateUser(id: Int!, name: String, email: String): User!
        deleteUser(id: Int!): User!
        signIn(email: String!, password: String!): AuthPayload!
        createPost(title: String!, content: String, userId: Int!): Post
    }
    type Post {
        id: Int
        title: String
        content: String
        userId: Int!
        user: User
      }
    type Subscription {
        userCreated: User!
      }
`;
