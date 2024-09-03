const nodemailer = require('nodemailer')
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host:process.env.SMTP_HOST,
    port:process.env.SMTP_PORT,
    secure:false,
    requireTLS:true,
    service: 'gmail',
    auth:{
        user:process.env.SMTP_MAIL,
        pass:process.env.SMTP_PASSWORD
    }

});

const sendMail = async(email,subject,content)=>{

    try {
       var  mailOptions={
            from:process.env.SMTP_MAIL,
            to:email,
            subject:subject,
            html:content
        };

        transporter.sendMail(mailOptions,(error,info)=>{
            if(error){
                console.log(error);
                return; 
            }
            console.log('Mail sent',info.messageId);
        });
    } catch (error) {
        console.log(error.message);
    }
}
module.exports={
    sendMail
}