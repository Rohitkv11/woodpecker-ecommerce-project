const Mongoose=require('mongoose')
const subcategorySchema=new Mongoose.Schema({
    subcategory_name:{type:String},
    category:{
        type: Mongoose.Schema.Types.ObjectId,
        ref: "category"
    }
})
const subcategoryModel= Mongoose.model("subcategory",subcategorySchema)
module.exports=subcategoryModel;