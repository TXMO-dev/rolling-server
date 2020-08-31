const Car = require('./../../../models/carModel');
const is_authenticated = require('./../../../utils/authHandler');
const { UserInputError } = require('apollo-server');
const {mkdir} = require('fs');
const {processing_2} = require('./../../../utils/sendAndProcess');

const CarResolver = {
    Query:{
        getCars:async (parent,args,context,info) => {
            const auth_user = is_authenticated(context);
            if(auth_user){
                const all_cars = await Car.find();   
                return all_cars;
            }
        },
        getCar:async (parent,{carId},context,info) => {
            const auth_user = is_authenticated(context);
            if(auth_user){
                const car = await Car.findById(carId);
                return car;  
            }
        }
    },
    Mutation:{
        createCar: async (parent,{carDetails:{name,description,category,price,condition,deal}},context,info) => {
            try{
                const user = await is_authenticated(context);
                
            if(user){  
                if(user.roles !== 'Dealer') throw new Error('Sorry only dealers are able to publish car posts.')
                const car = await Car.create({
                    name,
                    description,
                    category,
                    price,
                    condition,
                    deal,
                    dealer:user.username,
                    Images:[
                        {
                            filename:'default.jpg',
                            mimetype:"image/jpeg",
                            path:`${__dirname}/../../../utils/cars/image/default/default.jpg`
                        }
                    ] 
                    

                });
                
                return car;
            }
            }catch(err){
                throw new UserInputError(err);   
            }
            
        },
        createCarPhoto: async (parent,{Image,id},context,info) => {
            try{
                const user = await is_authenticated(context);
                console.log(context.req.params);
                if(user){
                    if(user.roles !== 'Dealer') throw new Error('sorry only dealers are allowed to create car photo...');
                    mkdir(`${__dirname}/../../../utils/cars/image/${id}`,{recursive:true},err => {  
                        if(err){
                            throw new Error("directory could not be created");
                        }
                        console.log("directory has successfully been created!!!");   
                    });
                    const processed = await processing_2(Image,id,context);
                    return processed;
                }     
                
            }catch(err){
                throw new UserInputError(err);
            }
        },

        deleteCarPhoto: async (parent,{carId,imageId},context,info) => {
            const user = is_authenticated(context);
            if(user){
                if(user.roles !== 'Dealer') throw new Error('Only delers have permission to delete car photo');
                const car = await Car.findById(carId);
                if(!car) throw new Error('this car post no longer exists');
                const new_car = car.Images.map(async imageObj => {
                    if(imageObj.id === imageId || imageObj.id === null){
                         imageObj.id = undefined;
                         imageObj = undefined;   
                    }
                    return imageObj;
                });
                console.log(new_car);
                //const filtered_car = car.Images.filter(elementObj => elementObj !== null);
                //console.log(filtered_car);
                car.Images = new_car;
                await car.save({validateBeforeSave:false});
                const nullIndex = car.Images.findIndex(el => el === null);
                car.Images.splice(nullIndex,1);
                await car.save({validateBeforeSave:false});
                console.log("deletion happened successfully");     
            }
        }
    }
}

module.exports = CarResolver;