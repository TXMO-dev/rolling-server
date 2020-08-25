const crypto = require('crypto');
const User = require('./../../../models/userModel');
const bcrypt = require('bcryptjs');
const {UserInputError,AuthenticationError} = require('apollo-server');
const {validateRegistration,validateLogin} = require('./../../../utils/validate');
const jwt = require('jsonwebtoken');
const Email = require('./../../../utils/emailHandler');
const authenticated_user = require('./../../../utils/authHandler');


const UserResolver = {
    Query:{
        getUsers:async () => {
            try{
                const all_users = await User.find();
                return all_users;
            }catch(err){
                throw new Error(err.message);
            }
        },
        getMe: async (parent,args,context,info) => {
            try {
                const user = await authenticated_user(context);
                const me = await User.findById(user.id);
                return me;
            }catch(err){
                throw new Error(err.message);   
            }
            
        },
        getUser: async (parent,{userId},context,info) => {
            try{
                await authenticated_user(context);
                const user = await User.findById(userId);
                return user;
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

        register: async (_,{registerInput:{full_name,email,username,password,confirmPassword,roles,createdAt}},{req},info) => {
            /*
                TODO:register the user into the database           
            */
            try{
                const {error,valid} = validateRegistration(full_name,email,username,password,confirmPassword,roles);
                if(!valid){
                    console.log(error);
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
                const settings_url = `${req.protocol}://${req.get('host')}/settings`; 
                const welcome = 'welcome'; 
                const subject = 'WELCOME TO ROLLING LOUD'
                await new Email(register_user,settings_url).sendWelcome(welcome,subject);   
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
        },
        
        resetPassword: async (_,{email},{req},info) => {
            try{
                const user = await User.findOne({email});  
                if(!user){
                    throw new AuthenticationError('this user does not exist');  
                }

                const reset_token = crypto.randomBytes(32).toString('hex');
                const email_token = crypto.createHash('sha256').update(reset_token).digest('hex');
                user.passwordResetToken = email_token;
                user.passwordResetCreatedAt = new Date().toString();   
                user.passwordResetTokenExp = user.passwordResetCreatedAt + 600
                await user.save({validateBeforeSave: false});
                const token_url = `${req.protocol}://${req.get('host')}/${reset_token}`
                await new Email(user,token_url).sendReset('reset','PLEASE RESET YOUR PASSWORD(valid for 10 mins)');
                req.user = user;
            }catch(err){
                throw new UserInputError(err.message);
            }
        
        },

        resetChangePassword: async (_,{resetChangeInput:{reset_token,new_password,confirm_new_password}},{req},info) => {
            /*
                TODO: make sure the input reset token matches with the one in the user schema
                TODO: if it matches then we reset the password to the new password
                TODO: then after that we set the user reset token to undefined
            */
            try{
                const encrypted_token = crypto.createHash('sha256').update(reset_token).digest('hex');
                const user = await User.findOne({passwordResetToken:encrypted_token})
                if(user){
                    if(new_password !== confirm_new_password) throw new UserInputError('passwords do not match');
                    new_password = await bcrypt.hash(new_password,12);
                    user.password = new_password;
                    user.passwordResetToken = undefined;
                    user.passwordResetTokenExp = undefined;
                    user.passwordResetCreatedAt = undefined;
                    await user.save({validateBeforeSave: false})
                    console.log('password updated successfully');
                    const success_url = `${req.protocol}://${req.get('host')}/login`
                    await new Email(user,success_url).sendResetSuccess('reset_success','PASSWORD RESET SUCCESSFUL')
            }
            }catch(err){
                throw new UserInputError(err);
            }
           

        }
    }
}

module.exports = UserResolver