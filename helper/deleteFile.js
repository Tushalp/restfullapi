const fs = require('fs').promises
const deleteFile = async(filePath)=>{
    try {
  
      await fs.unlink(filePath);
      console.log("File deleted successfully");
      
    } catch (error) {
      console.log(error.message)
    }
  }

  module.exports={
    deleteFile
  }