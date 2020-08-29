const UserResolver = require('./users/user.resolver');
const CarResolver = require('./cars/cars.resolvers');
const ReviewResolver = require('./reviews/review.resolver');

const resolvers = {
    Query:{
        ...UserResolver.Query
    },
    Mutation:{
        ...UserResolver.Mutation,
        ...CarResolver.Mutation,
        ...ReviewResolver.Mutation      
    }
}
  
module.exports = resolvers;