const {Schema,model} = require('mongoose');


const userSchema = new Schema({
    full_name:String,
    username:String,
    email:String,
    password:String,
    roles:{
        type:String,
    },
    description:String,
    user_image:String,
    license_file:String,
    starred:[
        {
            id:String,
            username:String,
            createdAt:String
        }
    ]
})

const User = model('User',userSchema);

module.exports = User