const UserResolver = require('./users/user.resolver');
const CarResolver = require('./cars/cars.resolvers');
const ReviewResolver = require('./reviews/review.resolver');
const LikeResolver = require('./Like/like.resolver');
const FollowResolver = require('./Follow/follow.resolver');

const resolvers = {
   
    Query:{
        ...UserResolver.Query,
        ...FollowResolver.Query,
        ...CarResolver.Query,
        ...LikeResolver.Query
    },
    Mutation:{
        ...UserResolver.Mutation,
        ...CarResolver.Mutation,
        ...ReviewResolver.Mutation,
        ...LikeResolver.Mutation,
        ...FollowResolver.Mutation    
    },
    Subscription:{
        ...CarResolver.Subscription,
        ...FollowResolver.Subscription,
        ...LikeResolver.Subscription,
        ...ReviewResolver.Subscription
    }
}
  
module.exports = resolvers;