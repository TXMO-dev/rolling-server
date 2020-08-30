const is_authenticated = require('./../../../utils/authHandler');
const Car = require('./../../../models/carModel');
const User = require('./../../../models/userModel');

const LikeResolver = {
    Mutation:{
        createLike:async (parent,{carId},context,info) => {
            const user = await is_authenticated(context);
            if(user){
                const car = await Car.findById(carId);
                console.log(car);
                if(!car) throw new Error('this car post does not exist');
                if(car.likes.find(c => c.username === user.username)){
                    car.likes = car.likes.filter(carObj => carObj.username !== user.username);
                    car.likeCount = car.likes.length;
                }else {
                    car.likes.push({
                        username:user.username   
                    }); 
                    car.likeCount = car.likes.length;   
                }

                await car.save({validateBeforeSave:false});   
            }

        }
    }
}

module.exports = LikeResolver;