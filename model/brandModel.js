const Mongoose=require('mongoose')
const brandSchema=new Mongoose.Schema({
    brand_name:{type:String}
})
const brandModel= Mongoose.model("brand",brandSchema)
module.exports=brandModel;