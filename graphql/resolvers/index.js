const Userresolver = require('./users/user.resolver');
const UserResolver = require('./users/user.resolver');

const resolvers = {
    Query:{
        ...UserResolver.Query
    },
    Mutation:{
        ...UserResolver.Mutation  
    }
}

module.exports = resolvers;