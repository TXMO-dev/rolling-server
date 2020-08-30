const is_authenticated = require('./../../../utils/authHandler');
const User = require('./../../../models/userModel');
const FollowResolver = {
    Query:{
        followers:async (parent,args,context,info) => {
            const auth_user = await is_authenticated(context);
            if(auth_user){
                const all_users = await User.find();
              
                const followers = all_users.filter(each_user => each_user.following.find(followObj => followObj.username === auth_user.username));
                auth_user.followerCount = followers.length;
                await auth_user.save();
                return followers;
                  
            }
                
        }

    },
    Mutation:{
        createFollow: async (parent,{userId},context,info) => {
            const auth_user = await is_authenticated(context);
            if(auth_user){
                const found_user = await User.findById(userId);
                //console.log(found_user);

                if(auth_user.following.find(currentObj => currentObj.username === found_user.username )){
                    auth_user.following = auth_user.following.filter(c => c.username !== found_user.username);
                    await auth_user.save();
                }else{
                    auth_user.following.unshift({
                        username:found_user.username,
                        user_image:found_user.user_image.path,
                        user_description:found_user.description,
                        createdAt:Date.now().toString()

                    });
                    auth_user.followingCount = auth_user.following.length;
                    await auth_user.save();
                }
                
                //return auth_user;
            }
        }
    }
}

module.exports = FollowResolver;