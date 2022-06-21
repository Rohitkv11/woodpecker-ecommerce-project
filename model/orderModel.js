const Mongoose = require('mongoose')
const orderSchema = new Mongoose.Schema({
user_Id:{type:Mongoose.Schema.Types.ObjectId,
ref:'users'},
payment_Method:{type:String},
products:[{
    pro_Id:{type:Mongoose.Schema.Types.ObjectId,
    ref:'product'},
    price:{type:Number},
    quantity:{type:Number,default: 1},
    subtotal:{type:Number,default:0}
}],
grandTotal:{type:Number,default:0},
ordered_on:{type:Date},
status:{type:String}
})
const orderModel = Mongoose.model("order",orderSchema)
module.exports=orderModel;