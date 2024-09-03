 const {check} =  require('express-validator')

 exports.registerValidator =[
    

    check('name','Name is required').not().isEmpty(),
    check('email','please include a valid email').isEmail().normalizeEmail({
        gmail_remove_dots:true
    }),
    check('mobile','mobile no should be contains 10 digits').isLength({
        min:10,
        max:10
    }),
    check('password','Password must be greater than 6 characters and contains at least one upper case letter, at least one lower case letter and one number,and one special character').isStrongPassword({
        minLength:6,
        minUppercase:1,
        minLowercase:1,
        minNumbers:1,

    }),
    check('image').custom((value,{req})=>{
        if(req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/png'){
            return true;

        }else{
            return false;
        }
    }).withMessage('please upload an image jpeg , png ')

 ];
    


 exports.sendMailVerificationValidator= [

    check('email','please include a valid email').isEmail().normalizeEmail({
        gmail_remove_dots:true
    }),
];


 exports.passwordResetValidator= [

    check('email','please include a valid email').isEmail().normalizeEmail({
        gmail_remove_dots:true
    }),

 ]; 

 exports.loginValidator = [
    check('email','please include a valid email').isEmail().normalizeEmail({gmail_remove_dots:true}),
    check('password','Password is required').not().isEmpty(),

 ];

 
 exports.updateProfileValidator =[
    

    check('name','Name is required').not().isEmpty(),
    check('mobile','mobile no should be contains 10 digits').isLength({
        min:10,
        max:10
    }),
  

 ];
    
 exports.otpMailValidator= [

    check('email','please include a valid email').isEmail().normalizeEmail({
        gmail_remove_dots:true
    }),
];

exports.verifyOtpValidator = [
   
    check('user_id','user_id is required').not().isEmpty(),
    check('otp','OTP is required').not().isEmpty(),

 ];
