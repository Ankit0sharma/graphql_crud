export const userTypeDefinitions = `
    type Query {
        users: [User!]!
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
    }
    type User {
        id: Int!
        name: String!
        email: String!
        password: String!
        role: String!
    }
    type Subscription {
        userCreated: User!
      }
`;
