const Email = require('./emailHandler');
const reset_util = async (user,token_email,token_reset,RESET_SUBJECT,{req}) => {
    user.passwordResetToken = token_email;
    user.passwordResetCreatedAt = new Date().toString();   
    user.passwordResetTokenExp = user.passwordResetCreatedAt + 600
    await user.save({validateBeforeSave: false});
    const token_url = `${req.protocol}://${req.get('host')}/${token_reset}`;
    await new Email(user,token_url).sendReset('reset',RESET_SUBJECT);   
}

module.exports = reset_util;