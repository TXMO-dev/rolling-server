
let error = {}


exports.validateRegistration = (full_name,email,username,password,confirmpassword,roles) => {
    const Email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if(full_name.trim() === ''){
        error.full_name = 'Full name must not be Empty'
    }

    if(email.trim() === ''){
        error.email = 'email must not be Empty'
    } else if(!email.match(Email)){
        error.email = 'please enter your email correctly'
    }

    if(confirmpassword.trim() === ''){
        error.confirmpassword = 'confirm password cannot be empty'
    }

    if(password.trim() === ''){
        error.password = 'password must not be empty'
    } else if(password !== confirmpassword){
        error.password = 'passwords do not match'
    }

    if(roles.trim() === ''){
        error.roles = 'roles must not be empty'
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
    const Email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if(email.trim() === ''){
        error.email = 'Email must not be empty'
    }else if(!email.match(Email)){
        error.email = 'please enter your email correctly'
    }

    if(password.trim() === ''){
        error.password = 'Password must not be empty'
    }

    return {
        error,
        valid:Object.keys(error).length < 1
    }
}