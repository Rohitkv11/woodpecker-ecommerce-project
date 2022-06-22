var Mongoose = require('mongoose')
var bcrypt=require('bcrypt')
const adminModel = require('../model/adminModel')
const productModel=require('../model/productModel')
const userModel = require('../model/userModel')
const categoryModel = require('../model/category')
const subcategoryModel = require("../model/subcategoryModel")
const brandModel = require('../model/brandModel')
const cartModel = require('../model/cartModel')
const orderModel = require('../model/orderModel')
// const userhelpers = require('./userhelpers')
    module.exports={

        adminLogin:(data)=>{
            let response={}
return new Promise(async(resolve,reject)=>{
console.log(data.email);
   const admin= await adminModel.findOne({email:data.email})
console.log(admin);
      if(admin){
            console.log("kkkkkkkkkkkkkkkkkkk");
            if(data.password==admin.password){
                response.admin=admin
                response.status=true
                resolve(response)
            }else{
                reject({status:false,msg:"incorrect password"})
            }
 }
               
    else{
        reject({msg:"login failed"})
         }
})
       

        
    },
    addProduct:(productDetails,image1,image2,image3,image4)=>{
        // console.log(productDetails);
        return new Promise(async (resolve,reject)=>{
           const subcategory = await subcategoryModel.findOne({subcategory_name:productDetails.subcategory})
           const brand = await brandModel.findOne({brand_name:productDetails.brand_name})
        //    console.log(subcategory._id);
        console.log(brand._id);
            if(!image2){
                reject({msg:"upload image"})
            }
            else{
                // console.log(productDetails.subcategory);
                const newproduct = new productModel({
                    name:productDetails.name,
                    price:productDetails.price,
                    description:productDetails.description,
                    stock:productDetails.stock,
                    discount:productDetails.discount,
                    shippingcost:productDetails.shippingcost,
                    subcategory:subcategory._id,
                    brand:brand._id,
                    images:{image1,image2,image3,image4}
                })
           

await newproduct.save(async(err,res)=>{
    if(err){
        // console.log(err);
    }
// console.log(res);
resolve({data:res,msg:"success"})
})
            }
        })
    
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
          const product= await productModel.find({}).lean()
          resolve({product})
})
    },
    addCategory:(categoryName)=>{
        console.log(categoryName);
        return new Promise(async(resolve,reject)=>{
           const category= await categoryModel.findOne({category_name:categoryName.category_name})
           console.log(category);
           if(category){
               reject({msg:"category already exists"})
           }else{
const newcategory=new categoryModel({
    category_name:categoryName.category_name
})
await newcategory.save(async(err,result)=>{
    if(err){
        reject({err:"category not added"})
    }
    console.log(result);
    resolve({result,msg:"category added successfully"})
})
           }
        })
    
    },
    addSubCategory:(subcategory_Name)=>{
        return new Promise(async(resolve,reject)=>{
const category= await categoryModel.findOne({category_name:subcategory_Name.category})
console.log(subcategory_Name.subcategory_name );
console.log(category._id);
if(category){
    // reject({msg:"subcategory already exists"})
// }
// else{
    const newsubcategory = new subcategoryModel({
        subcategory_name:subcategory_Name.subcategory_name,
        category : category._id
    })
    await newsubcategory.save(async(err,result)=>{
        if(err){
            reject({msg:"subcategory not added"})
        }
        else{
            resolve({result,msg:"subcategory added"})
        }
    })
}
})

},
    getCategory:()=>{
        return new Promise(async(resolve,reject)=>{
            const category= await categoryModel.find({}).lean()
            resolve(category)
        })
    },
    getSubCategory:()=>{
return new Promise(async(resolve,reject)=>{
   const subcategory=  subcategoryModel.find({}).lean()
    resolve(subcategory)
})
    },
    addBrand:(brand_Name)=>{
return new Promise(async(resolve,reject)=>{
    const brand = await brandModel.findOne({brand_name:brand_Name.brand_name})
    if(brand){
        reject({msg:"Brand already exists"})
    }
    else{
        const newbrand=new brandModel({
            brand_name:brand_Name.brand_name
        })
        await newbrand.save(async(err,result)=>{
            if(err){
                reject({msg:"brand not added"})
            }
            else{
                resolve({result,msg:"brand added"})
            }
        })
    }
})
    

    },
    getBrand:()=>{
        return new Promise(async(resolve,reject)=>{
            const brand= await brandModel.find({}).lean()
            resolve(brand)
    })
},
getAllCustomers:()=>{
    return new Promise(async(resolve,reject)=>{
        const customers = await userModel.find({}).lean()
        resolve(customers)
    })
},
blockUser:(userId)=>{
    return new Promise(async(resolve,reject)=>{
     const userBlocked = await userModel.findByIdAndUpdate({_id:userId},{$set:{block:true}})
        resolve()
    })
},

//  blockUser = (userId) => {
//     return new Promise(async (resolve, reject) => {
//         const user = await userModel.findOneAndUpdate({ email: data }, { $set: { status: false } })
//         resolve()
//     })
// },


unBlockUser:(userId)=>{
    console.log("sdfghjkl;");
    return new Promise(async(resolve,reject)=>{
     const userUnBlocked = await userModel.findByIdAndUpdate({_id:userId},{$set:{block:false}})
        resolve({block:false})
    })
},
getAllOrders:()=>{
return new Promise(async(resolve,reject)=>{
const orders = await orderModel.find({}).lean()
resolve(orders)
})
},
getEditDetails:(proId)=>{
    return new Promise(async(resolve,reject)=>{
        const productDetail = await productModel.findOne({_id:proId}).lean()
        resolve(productDetail) 
    })
},
 editProduct:(data, image1, image2, image3,image4, proId)=>{
    console.log("locallll");
    return new Promise(async (resolve,reject) => {
        const product = await productModel.findOneAndUpdate({_id:proId }, {
            $set: {
               
                name:data.name,
                    price:data.price,
                    description:data.description,
                    stock:data.stock,
                    discount:data.discount,
                    shippingcost:data.shippingcost,
                    subcategory:data._id,
                    brand:data._id,
                images: { image1, image2, image3,image4 }
            }
        })
        resolve()
    })
},


deleteProducts:(proId) => {
    return new Promise(async (resolve, reject) => {
        await productModel.findOneAndDelete({_id:proId })
        resolve()
    })
},

// getTotalIncome:()=>{
//     return new Promise(async(resolve,reject)=>{
//         let totalIncome = await orderModel.aggregate([
//             {
//                 $group:{
//                     _id:null,
//                     grandTotal:{
//                         $sum:'$grandTotal'
//                     }
//                 }
//             },
//         ])
//         let sum=totalIncome[0].grandTotal
//         resolve(sum)
//     })
// },
getTotalOrders:()=>{
    return new Promise(async(resolve,reject)=>{
        let totalOrders = await orderModel.count()
        console.log(totalOrders);
        resolve(totalOrders)
    })
},
getTotalCustomers:()=>{
    return new Promise(async(resolve,reject)=>{
        let totalCustomers = await userModel.count()
        console.log(totalCustomers);
        resolve(totalCustomers)
    })
},
getTotalProducts:()=>{
    return new Promise(async(resolve,reject)=>{
        let totalProducts = await productModel.count()
        console.log(totalProducts);
        resolve(totalProducts)
    })
},
getOrderDetail:(orderId)=>{
    return new Promise(async(resolve,reject)=>{
        
    })
}
    }