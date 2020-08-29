const Car = require('./../../../models/carModel');
const is_authenticated = require('./../../../utils/authHandler');
const { UserInputError } = require('apollo-server');
const {mkdir} = require('fs');
const {processing_2} = require('./../../../utils/sendAndProcess');

const CarResolver = {
    Query:{

    },
    Mutation:{
        createCar: async (parent,{carDetails:{name,description,category,price,condition,deal}},context,info) => {
            try{
                const user = await is_authenticated(context);
                
            if(user){  
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