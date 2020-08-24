
let error = {}
const email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

exports.validateRegistration = (full_name,email,username,password,confirmpassword,roles,createdAt) => {

    if(full_name.trim() === ''){
        error.full_name = 'Full name must not be Empty'
    }

    if(email.trim() === ''){
        error.email = 'email must not be Empty'
    } else if(!email.match(email)){
        error.email = 'please enter your email correctly'
    }

    if(password.trim() === ''){
        error.password = 'password must not be empty'
    } else if(password !== confirmpassword){
        error.password = 'passwords do not match'
    }

    if(roles.trim() === ''){
        error.roles = 'roles must not be empty'
    }else if(roles.trim() !== 'User' || roles.trim() !== 'Dealer'){
        error.roles = 'You must either be a User or a Dealer'
    }
    

    if(username.trim() === ''){
        error.username = 'username must not be empty';
    }

    return {
        error,
        valid:Object.keys(error).length < 1
    }

}

exports.validateLogin = (email,password) => {

    if(email.trim() === ''){
        error.email = 'Email must not be empty'
    }else if(!email.match(email)){
        error.email = 'please enter your email correctly'
    }

    if(password.trim() === ''){
        error.password = 'Password must not be empty'
    }else if(password !== confirmpassword){
        error.password = 'passwords do not match'
    }

    return {
        error,
        valid:Object.keys(error).length < 1
    }
}