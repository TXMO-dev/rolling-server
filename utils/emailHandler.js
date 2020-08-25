const nodemailer = require('nodemailer');
const pug = require('pug');
const {UserInputError} = require('apollo-server');

module.exports = class Email{
    //this is the constructor that we used to send information when this class has been instantiated.
    constructor(user,url){
        this.to= user.email
        this.from=process.env.EMAIL_FROM
        this.url=url
        this.firstName = user.full_name.split(' ')[0]
    }

    //this is what i will used to send the mail with a method sendMail which receives some mail options which
    //is a promise...
    async newtransporter(options){
        try {
            if(process.env.NODE_ENV==='production'){
                //this is where we set our transporter when we are going to send in production
                return 1;
            }
    
            const transport = nodemailer.createTransport({
                host:process.env.SMTP_HOST,
                port:process.env.SMTP_PORT,
                auth:{
                    user:process.env.SMTP_USERNAME,
                    pass:process.env.SMTP_PASSWORD   
                }
            });
    
            await transport.sendMail(options);
        }catch(err){
            throw new UserInputError(err);
        }
        

    } 


    //this is the global send method that will send emails based on their template render
    //and also their subject
    async send(template,subject){
        try{
            const template_file = pug.renderFile(`${__dirname}/../views/email/${template}.pug`,{
                subject,   
                url:this.url,
                firstName:this.firstName   
            });

    
            const mailOptions = {
                from:this.from,
                to:this.to,
                subject,
                html:template_file
            }
    
            await this.newtransporter(mailOptions);
        }catch(err){
            throw new UserInputError(err);
        }
       
    }

    async sendWelcome(temp_welcome,temp_welcome_subject){
        try {
            await this.send(temp_welcome,temp_welcome_subject);  
        }catch(err){
            throw new UserInputError(err)
        }  
    }

    async sendReset(temp_reset,temp_reset_subject){
        try {
            await this.send(temp_reset,temp_reset_subject);  
        }catch(err){
            throw new UserInputError(err)
        } 
    }
    async sendResetSuccess(temp_s_reset,temp_s_reset_subject){
        try {
            await this.send(temp_s_reset,temp_s_reset_subject);     
        }catch(err){
            throw new UserInputError(err)
        } 
    }
}