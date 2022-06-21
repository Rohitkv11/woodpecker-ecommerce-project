
const mongoose=require('mongoose')
const addressSchema=new mongoose.Schema({
user_Id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'users'
},
username:{type:String},
email:{type:String},
mobilenumber:{type:Number},
housename:{type:String},
pincode:{type:Number},
area:{type:String},
city:{type:String},
state:{type:String},
country:{type:String},
status:{type:Boolean,default:false}
})
const addressModel= mongoose.model("address",addressSchema)
module.exports=addressModel;