const mongoose=require('mongoose')
const adminSchema=new mongoose.Schema({
email:{
    type:String
},
password:{
    type:Number
}  
})
const adminModel= mongoose.model("Admins",adminSchema)
module.exports=adminModel;