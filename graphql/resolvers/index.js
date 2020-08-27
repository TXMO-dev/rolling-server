const UserResolver = require('./users/user.resolver');
const CarResolver = require('./cars/cars.resolvers');

const resolvers = {
    Query:{
        ...UserResolver.Query
    },
    Mutation:{
        ...UserResolver.Mutation,
        ...CarResolver.Mutation   
    }
}
  
module.exports = resolvers;