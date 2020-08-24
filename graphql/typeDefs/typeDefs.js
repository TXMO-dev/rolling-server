const {gql} = require('apollo-server');


const typeDefs = gql`
    
    type User{
        id:ID!
        full_name:String!
        email:String!
        username:String!
        password:String!
        confirmPassword:String!
        token:String
        roles:String!
        following:[User]
        followers:[User]
        user_image:String
        description:String
        license_file:String
        starred:[Star]
        createdAt:String!
    }

    type Star{
        id:ID!
        username:String!
        createdAt:String!
    }

    type Review{
        id:ID!
        username:String!
        body:String!
        createdAt:String!
    }

    type Like{
        id:ID!
        username:String!
        createdAt:String!
    }

    type Car{
        id:ID!
        name:String!
        description:String!
        category:String!
        price:Float!
        reviews:[Review]
        likes:[Like]
        condition:String!
        Deal:String!
        Image:String!
        Images:[String]
        createdAt:String!

    }

    input RegisterInput{
        full_name:String!
        email:String!
        username:String!  
        password:String!
        confirmPassword:String!
        roles:String!
    }

    input LoginInput{
        email: String!
        password: String!
    }

    type Mutation{
        register(registerInput:RegisterInput): User
        login(loginInput:LoginInput): User
    }

    type Query{
        getUsers: [User]
    }

`;

module.exports = typeDefs;  