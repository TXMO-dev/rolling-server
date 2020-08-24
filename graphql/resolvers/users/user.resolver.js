const User = require('./../../../models/userModel');
const bcrypt = require('bcryptjs');
const {UserInputError} = require('apollo-server');
const {validateRegistration,validateLogin} = require('./../../../utils/validate');
const jwt = require('jsonwebtoken');


const UserResolver = {
    Query:{
        getUsers:async () => {
            try{
                const all_users = await User.find();
                return all_users;
            }catch(err){
                throw new Error(err.message);
            }
        }
    },
    Mutation:{
        login: async (_,{loginInput:{email,password},context,info}) => {
            const {error,valid} = validateLogin(email,password);
            if(!valid) throw new UserInputError('Errors',{error});
            
            const user = await User.findOne({email});
            if(!user) throw new UserInputError('Wrong User Credentials');

            const compare_password = await bcrypt.compare(password,user.password);
            if(!compare_password) throw new UserInputError('Wrong User Credentials');

            const token = jwt.sign({id:user.id,email,username:user.username,roles:user.roles},process.env.JWT_SECRET,{expiresIn:"90d"});  
            return {
                ...user._doc,
                id:user._id,
                token  
            } 
        },

        register: async (_,{registerInput:{full_name,email,username,password,confirmPassword,roles,createdAt}},context,info) => {
            /*
                TODO:register the user into the database           
            */
            try{
                const {error,valid} = validateRegistration(full_name,email,username,password,confirmPassword,roles,createdAt);
                if(!valid){
                    throw new UserInputError('Errors',{error})
                }   
                //in order to encrypt the password before installing it.
                password = await bcrypt.hash(password,12);
                const compare_password = await bcrypt.compare(confirmPassword,password);
                if(!compare_password) throw new UserInputError('Passwords do not match');

                const register_user = await User.create({
                    full_name,
                    email,
                    username,  
                    password,
                    confirmPassword,
                    roles,
                    createdAt //it should be in this format [mon March 2020]   
                });
                const token = jwt.sign({id:register_user.id,email,username,roles},process.env.JWT_SECRET,{expiresIn:"90d"});
                
                return {
                    ...register_user._doc,
                    id:register_user._id, 
                    token,
                    createdAt:new Date().toISOString()  
                }//this is the :User
            }catch(err){
                throw new UserInputError(err.message);
            }
        }    
    }
}

module.exports = UserResolver