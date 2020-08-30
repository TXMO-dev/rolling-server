const UserResolver = require('./users/user.resolver');
const CarResolver = require('./cars/cars.resolvers');
const ReviewResolver = require('./reviews/review.resolver');
const LikeResolver = require('./Like/like.resolver');
const FollowResolver = require('./Follow/follow.resolver');

const resolvers = {
   
    Query:{
        ...UserResolver.Query,
        ...FollowResolver.Query,
        ...CarResolver.Query
    },
    Mutation:{
        ...UserResolver.Mutation,
        ...CarResolver.Mutation,
        ...ReviewResolver.Mutation,
        ...LikeResolver.Mutation,
        ...FollowResolver.Mutation    
    }
}
  
module.exports = resolvers;