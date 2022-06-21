const Mongoose=require('mongoose')
const categorySchema=new Mongoose.Schema({
    category_name:{type:String},
})
const categoryModel= Mongoose.model("category",categorySchema)
module.exports=categoryModel;