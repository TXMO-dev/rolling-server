const {mkdir} = require('fs');
const crypto = require('crypto');
const User = require('./../../../models/userModel');
const bcrypt = require('bcryptjs');
const {UserInputError,AuthenticationError} = require('apollo-server');
const {validateRegistration,validateLogin} = require('./../../../utils/validate');
const jwt = require('jsonwebtoken');
const Email = require('./../../../utils/emailHandler');
const authenticated_user = require('./../../../utils/authHandler');
const reset_util = require('./../../../utils/reset_util');
const {processing} = require('./../../../utils/sendAndProcess');
const is_authenticated = require('./../../../utils/authHandler');





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
        },

        getUserByTags:async (parent,args,context,info) => {
            const auth_user = await is_authenticated(context);  
            const user = await User.find();
            if(auth_user){     
                if(auth_user.tags === []){
                    return await User.find().slice(0,10);  
                    
                }
                return user.filter(userObj => userObj.tags
                    .find(user_obj_tags => user_obj_tags === auth_user.tags
                    .forEach(auth_user_tags => auth_user_tags)));
            }
        }
    },
    Mutation:{
        login: async (_,{loginInput:{email,password},context,info}) => {
            const {error,valid} = validateLogin(email,password);
            if(!valid) throw new UserInputError('Errors',{error});     

            const user = await User.findOne({email});
            if(!user) throw new UserInputError('Wrong User Credentials');
            if(user.active === false){
                throw new AuthenticationError('this user has been deleted.')
            }

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
                const {error,valid} = validateRegistration(full_name,email,username,password,confirmPassword,roles);
                if(!valid){
                    console.log(error);
                }   
                //in order to encrypt the password before installing it.
                password = await bcrypt.hash(password,12);
                const compare_password = await bcrypt.compare(confirmPassword,password);
                if(!compare_password) throw new UserInputError('Passwords do not match');
                const existing_user = await User.findOne({email});
                if(existing_user){
                    existing_user.active = true;
                    await existing_user.save();
                    const reset_token = crypto.randomBytes(32).toString('hex');
                    const email_token = `${context.req.protocol}://${context.req.get('host')}/${reset_token}`;
                    await reset_util(existing_user,email_token,reset_token,`WelcomeBack ${existing_user.full_name.split(' ')[0]},Kindly reset your Password valid for 10mins`,context); 
                    throw new UserInputError('This user once existed on this site. check your email to reset your password');
                    
                }
                const register_user = await User.create({
                    full_name,
                    email,
                    username,  
                    password,
                    confirmPassword,
                    roles,
                    user_image:{
                        filename:"user_default.jpeg",
                        mimetype:"image/jpeg",  
                        path:`${__dirname}/../../../utils/cars/image/default/user_default.jpeg`    
                    },
                    createdAt //it should be in this format [mon March 2020]   
                });
                
                const settings_url = `${context.req.protocol}://${context.req.get('host')}/settings`; 
                const welcome = 'welcome'; 
                const subject = 'WELCOME TO ROLLING LOUD';
                await new Email(register_user,settings_url).sendWelcome(welcome,subject);   
                const token = jwt.sign({id:register_user.id,email,username,roles},process.env.JWT_SECRET,{expiresIn:"90d"},context);
                
                
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
                await reset_util(user,email_token,reset_token,'Please Reset your Password? Valid for 10mins',context);  
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
           

        },

        deleteAccount: async (parents,args,context,info) => {
            const user = await authenticated_user(context);
            if(user.active === true){  
                user.active = false;
                await user.save();   
            }
        },
        updateMyPassword: async (parent,{updateInput:{current_password,new_password,confirm_new_password}},context,info) => {
            //TODO: we need to check if the current password matches with what is in the database
            //TODO: we then need to update the password but then we also check if the confirm password matches withe the new password
            //TODO: and then we save it.
            const user = await authenticated_user(context);
    
            if(user){
                const compare_password = await bcrypt.compare(current_password,user.password);
                if(!compare_password){
                    throw new UserInputError('password does not match with your current password');
                }
                if(new_password !== confirm_new_password){
                    throw new UserInputError('passwords do not match!')
                }
                new_password = await bcrypt.hash(new_password,12);
                user.password = new_password
                await user.save();
               
            }
        },
        updateMyProfile: async (parent,{profileUpdate:{full_name,username,email,description}},context,info) => {
            //TODO: check if the user is authenticated and then update the details
            //TODO: if the user tries to update the roles or password we get an error
            //TODO: We do not want to leave any null values so if there are null values we set the old value to it
            //FIXME: But then come to think of it i think graphql has already helped with that since we are choosing what to specifically update
            try{
                const user = await authenticated_user(context);
                //console.log(context.upload.storage.getFilename().filename()); 
                console.log(context);  
                if(user){
                    const updated_user = await User.findById(user.id);
                    const the_license_file = process.env.BITCOIN_ADDRESS;  
                    const encrypted_license = await bcrypt.hash(the_license_file,12);
                    updated_user.full_name = full_name;
                    updated_user.username =username;
                    updated_user.email = email;
                    updated_user.description = description;
                    updated_user.license_file = encrypted_license;
                    updated_user.passwordResetCreatedAt = undefined;
                    updated_user.passwordResetToken = undefined;
                    updated_user.passwordResetTokenExp = undefined;
                    if(updated_user.license_file){    
                        if(updated_user.license_send === true){ 
                            // license_send has to be set to false we will change it when we use REACT
                            //so a button will be responsible for that to work...
                             await new Email(user,the_license_file).sendLicenseFile('license','LICENSE_REQUEST')
                        }
                            if(updated_user.following.length >= 150000 || updated_user.license_check === true){
                                user.verified = true;      
                            }
                        }
                           
                            await updated_user.save();  
                            return updated_user;  
                           
                    } 
                }catch(err){
                throw new UserInputError(err);   
            }
            
        },

        updatePhoto: async (parent,{file},context,info) => {
            //TODO: Change the actual storage directory to a bucket in the cloud...
            const user = is_authenticated(context);
                mkdir(`${__dirname}/../../../utils/users/image/${user.id}`,{recursive:true},err => {   
                    if(err){
                        throw new UserInputError('could not create the folder');
                    }  
                    //console.log('folder created successfully')
                })
                const processed = await processing(file,context);            
                
                return processed;
        
                 
            
        }
        
    }   
}

module.exports = UserResolver   