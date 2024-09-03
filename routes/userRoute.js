const userController = require('../controllers/userController')
const {registerValidator,sendMailVerificationValidator,passwordResetValidator,loginValidator,updateProfileValidator,otpMailValidator,verifyOtpValidator}=require('../helper/validation');
const express = require('express');
const router = express.Router();

router.use(express.json());

const path = require('path')
const multer = require('multer')

// const storage = multer.diskStorage({
//     destination:  'uploads',
//     filename:(req,file,cb)=>{

//         cb(null,file.originalname);
//     },
// });

const auth = require('../middleware/auth');


const storage = multer.diskStorage({
    destination:function(req,file,cb){
        if(file.mimetype === 'image/jpeg'||file.mimetype === 'image/png'){

            cb(null,path.join(__dirname,'../public/images'));
        }
     },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name)
    }
});

const fileFilter = (req,file,cb)=>{

    if(file.mimetype === 'image/jpeg'||file.mimetype === 'image/png'){
        cb(null,true);
    }else{
        cb(null,false);
    }
}

const upload = multer({
    storage:storage,
    fileFilter:fileFilter
}).single('image')


router.post('/register', upload, registerValidator, userController.userRegister);
router.post('/send-mail-verification', sendMailVerificationValidator, userController.sendMailVerification);
router.post('/forgot-password', passwordResetValidator, userController.forgotPassword);
router.post('/login', loginValidator, userController.loginUser);

// Authenticated routes
router.get('/profile', auth, userController.userProfile);
router.post('/update-profile', auth, upload, updateProfileValidator, userController.updateProfile);
router.get('/refresh-token',auth,userController.refreshToken)
router.get('/logout',auth,userController.logout)



//otp Verification router
router.post('/send-otp',otpMailValidator,userController.sendOtp)
router.post('/verify-otp',verifyOtpValidator,userController.verifyOtp)

module.exports = router;

// module.exports = router