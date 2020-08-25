const {promisify} = require('util');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken')
const {AuthenticationError} = require('apollo-server');

const is_authenticated = async ({req}) => {
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        const token = req.headers.authorization.split(' ')[1];
        if(!token){
            throw new AuthenticationError('token doesnt exist')
        }
        const decoded_user = await promisify(jwt.verify)(token,process.env.JWT_SECRET);
        if(decoded_user.exp * 1000 < Date.now()){
            throw new AuthenticationError('this user has expired');
        }
        const user = await User.findById(decoded_user.id);
        await user.save({validateBeforeSave:false});
        if(user.active === false){
            throw new AuthenticationError('sorry this user has been deleted!!!');
        }
        if(!user){
            throw new AuthenticationError('this user does not exist');  
        }
        return user;
    }
}

module.exports = is_authenticated;