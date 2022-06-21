const mongoose= require('mongoose')
const productSchema=new mongoose.Schema({
    name:{type:String},
    price:{type:Number},
    description:{type:String},
    stock:{type:Number},
    discount:{type:Number},
    shippingcost:{type:Number},
    subcategory:{type:mongoose.Schema.Types.ObjectId, ref:'subcategory'},
     brand:{type:mongoose.Schema.Types.ObjectId, ref:'brand'},
     images:{
         type:Array
     }

})
module.exports=mongoose.model('product',productSchema) 