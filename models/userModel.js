const {Schema,model} = require('mongoose');


const userSchema = new Schema({
    full_name:String,
    username:String,
    email:String,
    password:String,
    roles:{
        type:String,
        enum:['User','Dealer']
    },
    description:String,
    user_image:{
        filename:String,
        mimetype:String,
        path:String,
        uploaded_at:Date
    },
    license_file:{
        type:String,
        minlength:2,
        maxlength:100
    },
    following:[
        {
            id:String,
            username:String,
            user_image:{
                filename:String,
                mimetype:String,
                path:String
            }, 
            description:String,   
            createdAt:String
        }
    ],
    //Followers will be a query...
    followingCount:Number,
    followerCount:Number, 
    tags:[String],
    passwordResetToken:String,
    passwordResetCreatedAt:String,
    passwordResetTokenExp:String,
    active:{
        type:Boolean,
        default:true
    },
    verified:{
        type:Boolean,
        default:false
    },
    license_check:{
        type:Boolean,
        default:false
    },
    license_send:{
        type:Boolean,
        default:false
    }
})

const User = model('User',userSchema);

module.exports = User