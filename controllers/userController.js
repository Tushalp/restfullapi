const User = require('../models/userModel');
const Blacklist = require('../models/blacklist.js')
const bcrypt = require('bcrypt');
const {validationResult} = require('express-validator')
const mailer = require('../helper/mailer.js')
const {deleteFile} = require('../helper/deleteFile.js')
const randomstring = require('randomstring');

const passwordReset = require('../models/passwordReset.js');
const Otp = require('../models/otp.js')

const {oneMinuteExpiry,threeMinuteExpiry} = require('../helper/otpValidate.js')

const jwt = require("jsonwebtoken")
const path = require('path');


const userRegister = async (req, res) => {
  try {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({
        success: false,
        msg: 'Errors',
       errors:errors.array()

      });

    }
    const { name, email, mobile, password } = req.body; // Destructure directly
    

    const isExist = await User.findOne({ email });

    if (isExist) {
      return res.status(400).json({
        success: false,
        msg: 'Email already Exists',
      });
    }

    const saltRounds = 10; // Adjust the number of rounds as needed
    const hashPassword = await bcrypt.hash(password, saltRounds);
    

    const user = new User({
      name,
      email,
      mobile,
      password: hashPassword,
      image: {
        data:req.file.filename,
        contentType:'image/png'
        }
    });

    const userData = await user.save();
    const msg = '<p>Hii, '+name+', please <a href="http://localhost:4000/mail-verification?id='+userData._id+'">verify</a> your email</p>';
    mailer.sendMail(email,'Email Verification',msg);

    return res.status(200).json({
      success: true,
      msg: "Registration successful",
      user: userData
    });
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      success: false,
      msg: error.message,
    }) ;
  }
};


const mailverification = async(req,res,)=>{

  try {

    if(req.query.id == undefined){
      return res.render('404');
    }
    const userData = await User.findOne({ _id: req.query.id})

    if(userData){

      if(userData.is_verified ==1){
        return res.render('mail_verfication',{message:'Your email already verified'});

      }
      await User.findByIdAndUpdate({_id:req.query.id},{
        $set:{
          is_verified: 1
        }
      });

      return res.render('mail_verfication',{message:'Mail has been verified successfully'});

    }else{
      return res.render('mail_verfication',{message:'User Not Found!'});
    }

    } catch (error) {

  console.log(error.message);
  return res.render('404')

  }
}



const sendMailVerification = async(req,res)=>{
  try {

    const error = validationResult(req);
    if(!error.isEmpty()){
      return res.status(400).json({
        success: false,
        msg: 'Errors',
       errors:error.array()

      });

    }
    const {email} = req.body
    const userData = await User.findOne({email:email});
    if(!userData){
      return res.status(400).json({
        success: false,
        msg: "Email doesn't exists!",
      });

    }


    if(userData.is_verified == 1){
      return res.status(400).json({
        success: false,
        msg:userData.email+" mail is already verified!"
      });
    }

    const msg = '<p>Hii, '+userData.name+', please <a href="http://localhost:4000/mail-verification?id='+userData._id+'">verify</a> your email</p>';
    mailer.sendMail(userData.email,'Email Verification',msg);

    return res.status(200).json({
      success: true,
      msg: "verification link sent to your email, please check  "
    });



  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
}


const forgotPassword = async(req,res)=>{
  try {
    
    // console.log(req.body)
    const error = validationResult(req);
    if(!error.isEmpty()){
      return res.status(400).json({
        success: false,
        msg: 'Errors',
       errors:error.array()

      });

    }
    const {email} = req.body
    const userData = await User.findOne({email:email});
    if(!userData){
      return res.status(400).json({
        success: false,
        msg: "Email doesn't exists!",
      });

    }
    
    const randomString = randomstring.generate();
    const msg = '<p>Hii, '+userData.name+', please  click <a href = " http://localhost:4000/reset-password?token='+randomString+'">here</a> to Reset your password.</p>';
    await passwordReset.deleteMany({user_id: userData._id})
    const PasswordReset = new passwordReset({
      user_id: userData._id,
      token: randomString
    });
    await PasswordReset.save();

    mailer.sendMail(userData.email,'Reset Password',msg);

    return res.status(201).json({
      success:true,
      msg:'Reset Passsword Link send to your email .please check!'
    }
    )


  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
    
  }
}



const resetPassword =  async(req,res)=>{
try {
  
  if(req.query.token == undefined){
    return res.render('404');

  }
  const resetData = await passwordReset.findOne({token: req.query.token})

  if(!resetData){

    return res.render('404');
  }

  return res.render('reset-password',{ resetData});


} catch (error) {
  return res.render('404')
}

}


const updatePassword = async(req,res)=>{
  try {
    
    const {user_id,password,c_password }= req.body;
    const resetData = await passwordReset.findOne({ user_id });
    // console.log(user_id);
    if(password != c_password){
      return res.render('reset-password',{ resetData, error:'Password not match!'}) 
     }

     const hashedPassword = await bcrypt.hash(c_password,10)

     await User.findByIdAndUpdate({ _id:user_id},{
      $set:{
        password:hashedPassword
      }
     });
     await passwordReset.deleteMany({user_id});

     return res.redirect('/reset-success');

  } catch (error) {
  return res.render('404');
  }
}


const resetSuccess= async(req,res)=>{

  try {

    return res.render('reset-success')
    
  } catch (error) {
    return res.render('404');
  }

}


const generateAccessToken = async(user)=>{
  const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:"2h" });
  return token;
}

const generateRefreshToken = async(user)=>{
  const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:"4h" });
  return token;
}


const loginUser = async(req,res)=>{
  try {
    
    const error = validationResult(req)

    if(!error.isEmpty()){
      return res.status(400).json({
        success:false,
        msg:'Errors',
        errors:error.array()
      })
    }

    const {email,password}=req.body;
    const userData = await User.findOne({email});
    if(!userData){
      return res.status(401).json({
        success: false,
        msg:'Email and password is Incorrect!'
      })
    }
    const passwordMatch = await bcrypt.compare(password,userData.password);
    if(!passwordMatch){
      return res.status(400).json({
        success: false, 
        msg: 'Email and Password is Incorrect!'
      })
    }

    if(userData.is_verified == 0){

      return res.status(400).json({
        success: false, 
        msg: 'Please verify your Account!'
      })
    }

   const accessToken = await generateAccessToken({user:userData});
   const refreshToken = await generateRefreshToken({user:userData});
   return res.status(200).json({
    success: true, 
    msg: 'Login Succesfully!',
    user:userData,
    accessToken:accessToken,
    refreshToken:refreshToken,
    tokenType:'Bearer'
  });

  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: error.message
    })
  }
}


const userProfile = async(req,res)=>{
  try {

    return res.status(200).json({
      success: true,
      msg: 'User Profile Data',
      data: req.user.user
    });

    
  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: error.message
    })
  }
}


const updateProfile = async(req,res)=>{
  try {
    console.log("body ", req.body);
    const error = validationResult(req)

    if(!error.isEmpty()){
      return res.status(400).json({
        success:false,
        msg:'Errors',
        errors:error.array()
      })
    }

    const {name,mobile}=req.body;

    const data ={
        name,
        mobile
      }
      const user_id = req.user.user._id;

      if(req.file !== undefined){
        data.image ='images/'+req.file.filename;

       const oldUser =  await User.findOne({_id:user_id});

       const oldFilePath = path.join(__dirname,'../public/'+oldUser.image)
       deleteFile(oldFilePath);
      }
      const userData = await User.findByIdAndUpdate({_id:user_id },{
        $set:data
      },{new:true});
      return res.status(200).json({
        success: true,
        msg: 'User Updated Succesfully',
        user:userData
      })

   } catch (error) {
   
    return res.status(400).json({
      success: false,
      msg: error.message,
    })
    
  }
}


const refreshToken = async(req,res)=>{
  try {


    const userId = req.user.user._id;

    const userData = await User.findOne({_id:userId})

   const accessToken =  await generateAccessToken({user:userData})
   const refreshToken =  await generateRefreshToken({user:userData})

   return res.status(200).json({
    success: true,
    msg: 'Token Refreshed',
    accessToken:accessToken,
    refreshToken:refreshToken

  })
    
  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: error.message,
    })
  }
}


const logout = async(req,res)=>{
  try {
    
    const token = req.body.token || req.query.token || req.headers["authorization"];
    const bearer = token.split(' ');
    const bearerToken = bearer[1];

    const newBlacklist = new Blacklist({
      token: bearerToken,
    });
    await newBlacklist.save();
    res.setHeader('Clear-Site-Data','"cookies","storage"')

    return res.status(200).json({
      success: true,
      msg: 'you are logged out!',
    })

  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: error.message,
    })
  }
}

const generateRandom4Digit = async()=>{
  return Math.floor(1000 + Math.random()*9000);
}

const sendOtp = async(req,res)=>{
  try {

    const error = validationResult(req);
    if(!error.isEmpty()){
      return res.status(400).json({
        success: false,
        msg: 'Errors',
       errors:error.array()

      });

    }
    const {email} = req.body
    const userData = await User.findOne({email:email});
    if(!userData){
      return res.status(400).json({
        success: false,
        msg: "Email doesn't exists!",
      });

    }


    if(userData.is_verified == 1){
      return res.status(400).json({
        success: false,
        msg:userData.email+" mail is already verified!"
      });
    }
       const g_otp = await generateRandom4Digit();

       const oldOtpData = await Otp.findOne({user_id:userData._id});

      if(oldOtpData){
          const sendNextOtp = await oneMinuteExpiry(oldOtpData.timestamp)

          if(!sendNextOtp){
            return res.status(400).json({
              success: false,
              msg:'please try after some time '
            });
            
          }

      }

       const c_Date = new Date()
      
       await  Otp.findOneAndUpdate(
        { user_id:userData._id},
        {otp: g_otp, timestamp: new Date(c_Date.getTime())},
        {upsert: true, new:true, setDefaultsOnInsert: true }
      )

      //  const enter_Otp = new Otp({
      //          user_id:userData._id,
      //          otp:g_otp
      //  });
      //  await enter_Otp.save();

    const msg = '<p> Hii <b>'+userData.name+  '</b>,</br> <h4>'+g_otp+' </h4> </p>';
    mailer.sendMail(userData.email,'Otp Verification',msg);

    return res.status(200).json({
      success: true,
      msg: "Otp has been sent to your email, please check"
    });



  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
}
  
const verifyOtp  = async(req,res)=>
{
  try{
    

    const error = validationResult(req);
    if(!error.isEmpty()){
      return res.status(400).json({
        success: false,
        msg: 'Errors',
       errors:error.array()

      });

    }
    const {user_id, otp} = req.body

     const otpData = await Otp.findOne({
      user_id,
      otp
    })
    if(!otpData){
      return res.status(400).json({
        success: false,
        msg: 'Otp is not valid'
        });
    }

    const  isOtpExpired = await threeMinuteExpiry(otpData.timestamp);

    if(isOtpExpired){
      return res.status(400).json({
        success: false,
        msg: 'your Otp is expired'
      })
    }

   await  User.findByIdAndUpdate({_id: user_id},{
      $set:{
        isVerified: 1
      }
    });
    return res.status(200).json({
      success: true,
      msg: 'Account verified Successfully'
      });



  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }

}

module.exports = {
  userRegister,
  mailverification,
  sendMailVerification,
  forgotPassword,
  resetPassword,
  updatePassword,
  resetSuccess,
  loginUser,
  userProfile,
  updateProfile,
  refreshToken,
  logout,
  sendOtp,
  verifyOtp
};
