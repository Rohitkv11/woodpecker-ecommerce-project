const Mongoose=require('mongoose')
const userSchema=new Mongoose.Schema({
   username:{type:String},
   email:{type:String},
mobilenumber:{type:Number},
   password:{type:String},
   housename:{type:String,default:null},
   pincode:{type:Number,default:null},
   area:{type:String,default:null},
   city:{type:String,default:null},
   state:{type:String,default:null},
   country:{type:String,default:null},
   status:{type:Boolean,default:false},
   block:{type:Boolean,default:false}
})
const userModel= Mongoose.model("users",userSchema)
module.exports=userModel;