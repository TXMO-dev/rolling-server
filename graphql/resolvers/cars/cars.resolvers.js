const Car = require('./../../../models/carModel');
const is_authenticated = require('./../../../utils/authHandler');

const CarResolver = {
    Query:{

    },
    Mutation:{
        createCar: async (parent,{carDetails:{name,description,category,price,deal,image,images}},context,info) => {
            const user = is_authenticated(context);
            if(user){
                const car = await Car.create({
                    name,
                    description,
                    category,
                    price,
                    deal,
                    dealer:{
                        id:user.id,
                        username:user.username,
                        email:user.email
                    },

                })
            }
        }
    }
}

module.exports = CarResolver;