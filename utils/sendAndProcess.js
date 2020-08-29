const is_authenticated = require('./authHandler');
const {createWriteStream} = require('fs');
const shortid = require('shortid');
const { UserInputError } = require('apollo-server');
const sharp = require('sharp');
const Car = require('./../models/carModel');



exports.processing = async (file,context) => {
    try{
        const user = await is_authenticated(context);
        const {filename,mimetype,encoding,createReadStream} = await file;
        const stream = createReadStream();
        if(user){
            const upload =await fileupload({stream,filename,mimetype},context);
            return upload;
        }

        
    }catch(err){
        throw new Error(err);
    }
    
}

exports.processing_2 = async (file,id,context) => {
    try{
        const {filename,mimetype,encoding,createReadStream} = await file;
        const stream = createReadStream();   
        const car_upload = await carupload({stream,filename,mimetype},context,id);
        return car_upload;   
            
        
    }catch(err){
        throw new Error(err);  
    }
    
}

const carupload = async ({stream,filename,mimetype},context,id) => {
        const user = await is_authenticated(context);
        const car = await Car.findById(id);
        const image_id = shortid.generate();
        if(user){   
            if(mimetype.split('/')[0] === 'image'){
                const path = `${__dirname}/cars/image/${id}/car-${image_id}-${filename}`;
                if(car.Images.length === 5){   
                    throw new UserInputError('you have reached the maximum number of uploads!!!');  
                }
                car.Images.forEach(itemObj => {
                    if(itemObj.filename === filename){
                        throw new UserInputError(
                            'An image with this name already exists. delete existing post in order to upload latest '
                            );
                    } 
                })
                car.Images = [{filename,mimetype,path},...car.Images];    
                await car.save();
                console.log(car);
                return new Promise((resolve,reject) => {  
                    const transformer = sharp().resize({
                        width:600,
                        height:600,
                        fit:sharp.fit.cover,
                        position:sharp.strategy.entropy
                    });  
    
                    stream
                    .pipe(transformer)//we are resizing before uploading to path
                    .pipe(createWriteStream(path))
                    .on("finish",() => resolve({filename,mimetype,path}))  
                    .on("error",reject);  
                })
                
                
            }    

            
            
        }  
        //await car.save();
         
}

const fileupload = async ({stream,filename,mimetype},context) => {
      
   try{
    const user = await is_authenticated(context); 
    
    if(filename === user.user_image.filename){
        throw new UserInputError('this image already exists');
    }   
    if(user){
        const id = shortid.generate();
        if(mimetype.split('/')[0] === 'image'){
            const path = `${__dirname}/users/image/${user.id}/user-${id}-${filename}`;  
            const user_image = user.user_image;
            user_image.filename = filename;
            user_image.mimetype = mimetype;  
            user_image.path = path;  
            await user.save();
            return new Promise((resolve,reject) => {  
                const transformer = sharp().resize({
                    width:200,
                    height:200,
                    fit:sharp.fit.cover,
                    position:sharp.strategy.entropy
                });  

                stream
                .pipe(transformer)//we are resizing before uploading to path
                .pipe(createWriteStream(path))
                .on("finish",() => resolve({id,filename,mimetype,path}))  
                .on("error",reject);  
            })
            
            
        }
    }
   }catch(err){
       throw new Error('sorry we could not upload file')
   }
    
    
    
}