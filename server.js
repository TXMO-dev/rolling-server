const mongoose = require('mongoose');
const dotenv = require('dotenv');
const {ApolloServer} = require('apollo-server')
const typeDefs = require('./graphql/typeDefs/typeDefs');
const resolvers = require('./graphql/resolvers');



dotenv.config({path:'./config.env'});


const DB = process.env.MONGODB_ATLAS.replace('<password>',process.env.MONGODB_PASSWORD);

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context:({req}) => ({req})

})

const PORT = process.env.PORT || 5000;
(async _ => {
    await mongoose.connect(DB,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    })
    console.log('database connected successfully...');

    const serve = await server.listen(PORT);
    console.log(`the server is deployed on ${serve.url}`)
})();