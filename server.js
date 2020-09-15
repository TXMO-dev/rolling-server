const mongoose = require('mongoose');
const dotenv = require('dotenv');
const {ApolloServer,PubSub, AuthenticationError} = require('apollo-server')
const typeDefs = require('./graphql/typeDefs/typeDefs');
const resolvers = require('./graphql/resolvers');
const is_authenticated = require('./utils/authHandler');
const firebase = require('firebase');
const firebaseConfig = require('./firebase/firebase.config');
firebase.initializeApp(firebaseConfig); 
   



//const the_upload = upload.single('photo')

dotenv.config({path:'./config.env'});

  
const DB = process.env.MONGODB_ATLAS.replace('<password>',process.env.MONGODB_PASSWORD);
const pubsub = new PubSub();

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context:({req,res}) => ({req,res,pubsub}),
    subscriptions:{
        onConnect:async (connectionParams,webSocket) => {
            try{
                  
            }catch(err){
                throw new AuthenticationError(err);
            }
        }
    }      
})  

const PORT = process.env.PORT || 5000;
(async _ => {
    console.log('firebase has successfully been initialized');
    await mongoose.connect(DB,{
        useNewUrlParser: true,
        useUnifiedTopology: true,        
        useFindAndModify: false,
        useCreateIndex: true
    })
    console.log('database connected successfully...');

    const serve = await server.listen(PORT);
    console.log(`the server is deployed on ${serve.url}`);
    console.log(`subscription server is deployed on ${serve.subscriptionsUrl}`)
})();