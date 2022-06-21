const Mongoose=require('mongoose')
const cartSchema = new Mongoose.Schema({
    user_Id:{type:Mongoose.Schema.Types.ObjectId,
        ref:'users'},
        total:{type:Number,default:0},
    products:[{
        pro_Id:{type:Mongoose.Schema.Types.ObjectId,
        ref:'product'},
        price:{type:Number},
        quantity:{type:Number,default: 1},
        subtotal:{type:Number,default:0}   
}]
    
})
const carModel= Mongoose.model('cart',cartSchema)
module.exports=carModel

