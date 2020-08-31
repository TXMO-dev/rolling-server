const {gql} = require('apollo-server');
const express = require('express');
const hpp = require('hpp');
const app = express();

app.use(hpp());


const typeDefs = gql`
   
    type File{
        #id:ID!
        filename:String,
        mimetype:String,
        path:String,
        uploaded_at:String

    }

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
        user_image:File
        description:String
        license_file:String
        tags:[String]
        passwordResetToken:String
        passwordResetCreatedAt:String
        passwordResetTokenExp:String
        createdAt:String!   
        active:Boolean!
        verified:Boolean!
        license_check:Boolean!
        license_send:Boolean!
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
        reviews:[Review]!
        likes:[Like]!
        condition:String!
        dealer:String!
        Images:[File]!  
        Deal:String!
        reviewCount:Int!
        likeCount:Int!
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

    input ResetChangeInput{
        reset_token:String!
        new_password:String!
        confirm_new_password:String!
    }

    input UpdateInput{
        current_password:String!
        new_password:String!
        confirm_new_password:String!
    }

    input ProfileUpdate{
        full_name:String
        username:String
        email:String
        description:String
    }

    input CarDetails{
        name:String!
        description:String!
        category:String!
        price:Float!
        condition:String! 
        deal:String!
    }

    type Mutation{
        register(registerInput:RegisterInput): User
        login(loginInput:LoginInput): User
        resetPassword(email:String!): User
        resetChangePassword(resetChangeInput:ResetChangeInput): User
        deleteAccount: User
        updateMyPassword(updateInput:UpdateInput): User 
        updateMyProfile(profileUpdate:ProfileUpdate): User
        updatePhoto(file: Upload!): File #now this upload returns an object of {createReadStream,filename,mimetype,encoded}
        createCar(carDetails:CarDetails): Car
        createCarPhoto(Image: Upload!,id:String!): File    
        deleteCarPhoto(carId:String!,imageId:String!): Car
        createReview(carId:String!,body:String!): [Review]
        deleteReview(carId:String!,reviewId:String!): [Review] 
        updateReview(carId:String!,reviewId:String!,body:String!): Review 
        createLike(carId:ID!): [Like] 
        createFollow(userId:String!): [User]
         
    }

    type Query{
        getUsers: [User]
        getMe: User
        getUser(userId:String!): User
        files:[File!]
        getPhoto(photoId:String!): File 
        followers: [User]
        usersOfLikedPost(carId:String!): [User]
        getUserByTags: [User] #this will be used for recommendations 
    }

`;

module.exports = typeDefs;  