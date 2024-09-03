const oneMinuteExpiry = async(otpTime)=>{
    try {
        console.log("Timestamp is=",otpTime);
        const c_datetime = new Date();

        var diffrenceValue = (otpTime - c_datetime.getTime())/1000;
        diffrenceValue /=60;
        console.log("Expiry minute:-",Math.abs(diffrenceValue));

        if(Math.abs(diffrenceValue) > 1){
            return true;
        }
        return false;
    } catch (error) {
        console.log(error);
    }
}
const threeMinuteExpiry = async(otpTime)=>{
    try {
        console.log("Timestamp is=",otpTime);
        const c_datetime = new Date();

        var diffrenceValue = (otpTime - c_datetime.getTime())/1000;
        diffrenceValue /=60;
        console.log("Expiry minute:-",Math.abs(diffrenceValue));

        if(Math.abs(diffrenceValue) > 3){
            return true;
        }
        return false;
    } catch (error) {
        console.log(error);
    }
}
module.exports = {
    oneMinuteExpiry,
    threeMinuteExpiry
}