const is_authenticated = require('./authHandler');
const {createWriteStream} = require('fs');
const shortid = require('shortid');
const { UserInputError } = require('apollo-server');
const sharp = require('sharp');
const Car = require('./../models/carModel');



exports.processing = async (file,context) => {
    try{
        const {filename,mimetype,encoding,createReadStream} = await file;
        const stream = createReadStream();
        const upload =await fileupload({stream,filename,mimetype},context);
        return upload;
    }catch(err){
        throw new Error('we could not process')
    }
    
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
            let path = `${__dirname}/users/image/user-${id}-${filename}`;
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