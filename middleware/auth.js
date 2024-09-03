const jwt = require('jsonwebtoken')
const Blacklist = require('../models/blacklist.js')
const config = process.env;

const verifyToken = async(req,res,next)=>{

    const token = req.body.token || req.query.token || req.headers["authorization"];

    if(!token){
        return res.status(403).json({
            success:false,
            msg:"A token is required for authentication"
        });
    }

    try {
        
         const bearer = token.split(' ');
         const bearerToken = bearer[1];
         const blackListedToken= await Blacklist.findOne({token:bearerToken})
        if(blackListedToken){
            return res.status(400).json({
                success:false,
                msg:"This session has expired,please try again! "
            });
        }
        //  console.log(bearerToken)

         const decodeData = jwt.verify(bearerToken,config.ACCESS_TOKEN_SECRET);
         req.user = decodeData;

    } catch (error) {
        return res.status(401).json({
            success:false,
            msg:"Invalid Token"
        });
    }
    return next();

}

module.exports = verifyToken;