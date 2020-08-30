const is_authenticated = require('./../../../utils/authHandler');
const Car = require('./../../../models/carModel');
const { UserInputError } = require('apollo-server');
const reviewResolver = {
    Mutation:{
        createReview: async (parent,{carId,body},context,info) => {
            const user = is_authenticated(context);
            if(user){
                const car = await Car.findById(carId);
                if(!car){
                    throw new UserInputError('this post no longer exists.');
                }
                const reviewObj = {
                    username:car.dealer,
                    body
                }
                //FIXME: I have to make sure that the user does not post a review twice....
                //SOLUTION:find a way of getting the username to show or populate into the database...
                car.reviews.forEach(car_review_obj => {
                    if(car_review_obj.username === car.dealer){
                        throw new UserInputError("Reviews can only be posted once, you can only update and delete single existing post");
                    }
                })

                    car.reviews = [reviewObj,...car.reviews];
                    car.reviewCount = car.reviews.length;
                
                await car.save();
                return car.reviews; //IT IS WORKING
            }
        },
        deleteReview: async (parent,{carId,reviewId},context,info) => {
            const user = is_authenticated(context);            
            if(user){  
                const car = await Car.findById(carId);   
                const real_car = car.reviews.reduce((accumulator,currentObj) => {
                    accumulator[currentObj._id] = currentObj;
                    return accumulator;
                },{});
                const obj_keys = real_car[reviewId];
                const carIndex = car.reviews.findIndex(reviewObj => reviewObj === obj_keys)
                car.reviews.splice(carIndex,1);
                car.reviewCount = car.reviews.length;
                await car.save({validateBeforeSave:false});
                return car.reviews; //IT IS WORKING
            }
           

        },

        updateReview: async (parent,{carId,reviewId,body},context,info) => {
            const user = is_authenticated(context);
            if(user){
                const car = await Car.findById(carId);
                const real_car = car.reviews.reduce((accumulator,currentObj) => {
                    accumulator[currentObj._id] = currentObj;
                    return accumulator;
                },{});
                const obj_keys = real_car[reviewId];
                obj_keys.body = body;
                await car.save({validateBeforeSave:false});
                return obj_keys //IT IS WORKING NOW
            }
        }

    }
}

module.exports = reviewResolver;