const is_authenticated = require('./authHandler');
const {createWriteStream} = require('fs');
const shortid = require('shortid');
const { UserInputError } = require('apollo-server');



exports.processing = async (file,context) => {
    const {filename,mimetype,encoding,createReadStream} = await file;
    const stream = createReadStream();
    const upload =await fileupload({stream,filename,mimetype},context);
    return upload;
}

const fileupload = async ({stream,filename,mimetype},context) => {
      
    const user = await is_authenticated(context);
    if(filename === user.user_image.filename){
        throw new UserInputError('this user already exists');
    }   
    if(user){
        const id = shortid.generate();
        if(mimetype.split('/')[0] === 'image'){
            const path = `${__dirname}/users/image/user-${id}-${filename}`;
            const user_image = user.user_image;
            user_image.filename = filename;
            user_image.mimetype = mimetype;  
            user_image.path = path;
            await user.save();
            return new Promise((resolve,reject) => {    
                stream.pipe(createWriteStream(path))
                .on("finish",() => resolve({id,filename,mimetype,path}))
                .on("error",reject);  
            })
            
            
        }
    }
    
    
    
}