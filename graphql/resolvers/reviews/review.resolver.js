const is_authenticated = require('./../../../utils/authHandler');
const Car = require('./../../../models/carModel');
const { UserInputError } = require('apollo-server');
const reviewResolver = {
    Mutation:{
        createReview: async (parent,{carId,body},context,info) => {
            const user = is_authenticated(context);
            if(user){
                const car = await Car.findById(carId);
                console.log(car);
                if(!car){
                    throw new UserInputError('this post no longer exists.');
                }
                const reviewObj = {
                    username:user.username,
                    body
                }
                const car_filter = car.reviews.filter(reviewObj => reviewObj.username === user.username);
                if(car_filter){
                    throw new UserInputError('you have already put in your input on this post,you may either delete the already existing post or update it.')
                }
                car.reviews = [reviewObj,...car.reviews];
                await car.save();
            }
        }
    }
}

module.exports = reviewResolver;