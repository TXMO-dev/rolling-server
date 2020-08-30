const is_authenticated = require('./../../../utils/authHandler');
const Car = require('./../../../models/carModel');
const User = require('./../../../models/userModel');

const LikeResolver = {
    Query:{
        usersOfLikedPost:async (parent,{carId},context,info) => {
            const auth_user = await is_authenticated(context);
            if(auth_user){
                const car_post = await Car.findById(carId);
                if(!car_post) {
                    throw new Error("this car post does not exist");
                }
                const liked_users = car_post.likes.map(async likeObj =>await User.findOne({username:likeObj.username}));
                const resolved_users = await Promise.all(liked_users); 
                //console.log(resolved_users); 
                return resolved_users;   //IT RETURNS  
                
                 
            }
        }
    },
    Mutation:{
        createLike:async (parent,{carId},context,info) => {
            const user = await is_authenticated(context);
                const car = await Car.findById(carId);
                console.log(car);
                if(!car){
                    throw new Error('this car post does not exist');
                } 
                if(car.likes.find(c => c.username === user.username )){
                    car.likes = car.likes.filter(carObj => carObj.username !== user.username);
                    car.likeCount = car.likes.length;
                   
                    await car.save({validateBeforeSave:false}); 
                    return[...car.likes];
                }else {
                    car.likes.unshift({
                        username:user.username, 
                        createdAt:Date.now()    
                    }); 
                    car.likeCount = car.likes.length; 
                    await car.save({validateBeforeSave:false}); 
                    return[...car.likes];   // IT IS WORKING NOW  
                };  
        }
    }
}

module.exports = LikeResolver;