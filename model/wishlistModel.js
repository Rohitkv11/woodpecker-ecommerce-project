const Mongoose=require('mongoose')
const wishlistSchema = new Mongoose.Schema({
    user_Id:{type:Mongoose.Schema.Types.ObjectId,
        ref:'users'},
    products:[{ 
        pro_Id:{type:Mongoose.Schema.Types.ObjectId,
        ref:'product'},
}]
    
})
const wishlistModel= Mongoose.model('wishlist',wishlistSchema)
module.exports=wishlistModel
