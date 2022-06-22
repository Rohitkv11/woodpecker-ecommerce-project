var Mongoose = require("mongoose");
const userModel = require("../model/userModel");
const productModel = require("../model/productModel");
var bcrypt = require("bcrypt");
var nodemailer = require("nodemailer");
const Razorpay = require('razorpay')
const carModel = require("../model/cartModel");
const wishlistModel = require("../model/wishlistModel");
const addressModel = require("../model/addressModel");
const orderModel = require("../model/orderModel");
const categoryModel = require("../model/category");
const subcategoryModel = require("../model/subcategoryModel");

let instance = new Razorpay({
    key_id:'rzp_test_cgNgZJkGmaf45Q',
    key_secret:'PvCbDQBxdMXjfZPtq2ro7khh',
});


/*user signup*/
module.exports = {
  dosignup: (data) => {
    return new Promise(async (resolve, reject) => {
      const user = await userModel.findOne({ email: data.email });
      if (user) {
        reject({ msge: "user with this email exist" });
      } else {
        const otpCode = await Math.floor(1000 + Math.random() * 8999);
console.log(otpCode);
        // await userModel.findOneAndUpdate({email:data.email},{$set:{otpcode:otpCode}})
        let transporter = await nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "rohitkv042000@gmail.com",
            pass: "spnvwkopudbxiied",
          },
        });

        let otpCode1 = {
          from: "rohitkv042000@gmail.com",
          to: data.email,
          subject: "mail using node mailer",
          text: "your verification code is " + otpCode,
        };
        transporter.sendMail(otpCode1, function (error, info) {
          if (error) reject({ msg: "msg not sent" });

          resolve({ msg: "success", otpCode });
        });
      }
    });
  },

  /*signup otp verify*/
  otpverify: (otp, data, otpData) => {
    return new Promise(async (resolve, reject) => {
      userOtp =(await otpData.otp1) + otpData.otp2 + otpData.otp3 + otpData.otp4;
      if (otp == userOtp) {
        const Password = await bcrypt.hash(data.password, 10);

        const newuser = new userModel({
          username: data.name,
          email: data.email,
          mobilenumber: data.number,
          password: Password,
        });
        await newuser.save();
        resolve({ status: true });
      } else {
        reject({ status: false, msg: "otp verification failed" });
      }
    });
  },

  /*user login*/
  dologin: (data) => {
    // let status=false
    let response = {};
    return new Promise(async (resolve, reject) => {
      const user = await userModel.findOne({ email: data.email });

      if (user) {
        bcrypt.compare(data.password, user.password).then((status) => {
          if(user.block){
            reject({msg:"You Have Been Blocked"})
          }
          if (status) {
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            reject({ status: false, msg: "Incorrect Password" });
          }
        });
      } else {
        reject({ status: false.valueOf, msgg: "Invalid Email" });
      }
    });
  },

  /*get product on home page*/
  getProduct: () => {
    return new Promise(async (resolve, reject) => {
      const product = await productModel
        .find({})
        .sort({ _id: -1 })
        .limit(8)
        .lean();
      resolve({ product });
    });
  },

  /*user forget password*/
  forgetPassword: (verifyEmail) => {
    return new Promise(async (resolve, reject) => {
      const user = await userModel.findOne({ email: verifyEmail.email });
      if (user) {
        const resetOtp = await Math.floor(1000 + Math.random() * 8999);
console.log(resetOtp);
        // await userModel.findOneAndUpdate({email:data.email},{$set:{otpcode:otpCode}})
        let transporter = await nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "rohitkv042000@gmail.com",
            pass: "spnvwkopudbxiied",
          },
        });

        let otpCode1 = {
          from: "rohitkv042000@gmail.com",
          to: verifyEmail.email,
          subject: "mail using node mailer",
          text: "your reset password code is " + resetOtp,
        };
        transporter.sendMail(otpCode1, function (error, info) {
          if (error) {
            reject({ msgg: "msg not sent" });
          }

          resolve({ msg: "success", resetOtp, verifyEmail });
        });
      } else {
        reject({ msg: "your mail is not registered" });
      }
    });
  },

  /*verify resend otp*/
  verifyResetOtp: (otp, resetOtp) => {
    return new Promise(async (resolve, reject) => {
      console.log(resetOtp);
      const userotp = (await otp.otp1) + otp.otp2 + otp.otp3 + otp.otp4;
      if (userotp == resetOtp) {
        resolve({ msg: "correct otp" });
      } else {
        reject({ msg: "incorrect otp" });
      }
    });
  },

  /*user reset password*/
  resetPassword: (newPassword, user) => {
    return new Promise(async (resolve, reject) => {
      const Password = await bcrypt.hash(newPassword.password, 10);

      await userModel.updateOne(
        { email: user.email },
        { $set: { password: Password } }
      );
      resolve({ msg: "password changed" });
    });
  },

  /*get single product detail*/
  productDetail: (proId) => {
    return new Promise(async (resolve, reject) => {
      const productDetail = await productModel.findOne({ _id: proId }).lean();
      // console.log("llllll");
      // console.log(productDetail);
      resolve(productDetail);
    });
  },

/*add to cart*/
  addToCart: (pro_Id, user_Id) => {
    return new Promise(async (resolve, reject) => {
      const alreadyCart = await carModel.findOne({ user_Id: user_Id });
      const product = await productModel.findById({ _id: pro_Id });
      if (alreadyCart) {
        let proExist = alreadyCart.products.findIndex(
          (products) => products.pro_Id == pro_Id
        );

        if (proExist != -1) {
          resolve({ error: "Product already in cart" });
        } else {
          await carModel
            .findOneAndUpdate(
              { user_Id: user_Id },
              { $push: { products: { pro_Id: pro_Id, price: product.price } } }
            )
            .then(async (res) => {
              resolve({ msg: "Added", count: res.products.length + 1 });
            });
        }
      } else {
        const newcart = new carModel({
          user_Id: user_Id,
          products: { pro_Id: pro_Id, price: product.price },
        });
        await newcart.save((err, result) => {
          if (err) {
            resolve({ error: "cart not created" });
          } else {
            resolve({ msg: "cart created", count: 1 });
          }
        });
      }
    });
  },

  /*change product quantity in cart*/
  changeProductQuantity: ({ cart, product, count, quantity }, userId) => {
    console.log(cart,"cart");
    console.log(product,"pro");    
    console.log(count,"count");
    console.log(quantity,"quantity");
    return new Promise(async (resolve, reject) => {
      const Product=await productModel.findById({_id:product})
      if(quantity>=Product.stock && count==1){
        resolve({status:true})
      }else if (count == -1 && quantity == 1) {
        await carModel
          .findOneAndUpdate(
            { "products._id": cart },
            { $pull: { products: { pro_Id: product } } }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          });
      } else {
        await carModel
          .updateOne(
            { "products._id": cart, "products.pro_Id": product },
            { $inc: { "products.$.quantity": count } }
          )

          .then((response) => {
            resolve({status:false});
          });
      }
    });
  },

  /*get cart items*/
  cartItems: (user_Id) => {
    return new Promise(async (resolve, reject) => {
      const cart = await carModel
        .findOne({ user_Id: user_Id })
        .populate("products.pro_Id")
        .lean();

      resolve(cart);
    });
  },

  /*get cart count*/
  getCartCount: (user_Id) => {
    return new Promise(async (resolve, reject) => {
      const cart = await carModel.findOne({ user_Id: user_Id });
      if (cart) {
        let count = await cart.products.length;
        // console. log(cartCount);
        resolve(count);
      }

      resolve();
    });
  },


  /*remove from cart*/
  removeFromCart: (proId, userId) => {
    return new Promise(async (resolve, reject) => {
      await carModel.updateOne(
        { user_Id: userId },
        { $pull: { products: { pro_Id: proId } } }
      );
      resolve({ msg: "remove from cart" });
    });
  },

  /*add to wishlist*/
  addToWishlist: (proId, userId) => {
    return new Promise(async (resolve, reject) => {
      const wishlist = await wishlistModel.findOne({ user_Id: userId });
      if (wishlist) {
        const proExist = wishlist.products.findIndex(
          (products) => products.pro_Id == proId
        );

        if (proExist != -1) {
          resolve({ error: "product already in wishlist" });
        } else {
          await wishlistModel
            .findOneAndUpdate(
              { user_Id: userId },
              { $push: { products: { pro_Id: proId } } }
            )
            .then(async (res) => {
              resolve({ msg: "Added", count: res.products.length + 1 });
            });
        }
      } else {
        const newwishlist = new wishlistModel({
          user_Id: userId,
          products: { pro_Id: proId },
        });
        await newwishlist.save((err, result) => {
          if (err) {
            resolve({ msg: "Not added to wishlist" });
          } else {
            resolve({ msg: "wishlist created" });
          }
        });
      }
    });
  },

  /*get wishlist count*/
  getWishlistCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      const wishlist = await wishlistModel.findOne({ user_Id: userId });

      if (wishlist) {
        let count = await wishlist.products.length;
        resolve(count);
      }

      resolve();
    });
  },

  /*get wishlist items*/
  wishlistItems: (userId) => {
    return new Promise(async (resolve, reject) => {
      const wishlist = await wishlistModel
        .findOne({ user_Id: userId })
        .populate("products.pro_Id")
        .lean();

      resolve(wishlist);
    });
  },

  /*remove from wishlist*/
  removeFromWishlist: (proId, userId) => {
    return new Promise(async (resolve, reject) => {
      const removed = await wishlistModel.updateOne(
        { user_Id: userId },
        { $pull: { products: { _id: proId } } }
      );
      resolve({ msg: "confirm delete" });
    });
  },

  /*get total amount*/
  getTotalAmount: (userId) => {
    console.log("total amtt");
    let id = Mongoose.Types.ObjectId(userId);

    return new Promise(async (resolve, reject) => {
      let cart = await carModel.aggregate([
        {
          $match: { user_Id: id },
        },
        {
          $unwind: "$products",
        },
        {
          $project: {
            Id: "$products.pro_Id",
            total: { $multiply: ["$products.price", "$products.quantity"] },
          },
        },
      ]);
      const carts = await carModel.findOne({ user_Id: userId });
      // console.log(carts);
      if (carts) {
        cart.forEach(async (amt) => {
            console.log("jhkjkjhkjh");
          console.log(amt);
          await carModel.updateMany(
            { "products.pro_Id": amt.Id },
            { $set: { "products.$.subtotal": amt.total } }
          );
        });
      }
      resolve();
    });
  },

  /*get grand total amount*/
  getGrandTotal: (userId) => {
    console.log("grand total");
    let id = Mongoose.Types.ObjectId(userId);
    return new Promise(async (resolve, reject) => {
      let total = await carModel.aggregate([
        {
          $match: { user_Id: id },
        },
        {
          $unwind: "$products",
        },
        {
          $project: {
            quantity: "$products.quantity",
            price: "$products.price",
          },
        },
        {
          $project: {
            name: 1,
            quantity: 1,
            price: 1,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ["$quantity", "$price"] } },
          },
        },
      ]);

      console.log(total, "total");
      if (total.length == 0) {
        console.log("faaaazzzz");
        resolve({ status: true });
      } else {
        console.log("jjjjj");
        let grandTotal = total.pop();
        await carModel.findOneAndUpdate(
          { user_Id: id },
          { $set: { total: grandTotal.total } }
        );
        resolve(grandTotal);
      }
      resolve();
    });
  },

  /*get user detail in profile*/
  getUserDetail: (user) => {
    return new Promise(async (resolve, reject) => {
      const userDetail = await userModel.findOne({ email: user.email }).lean();
      resolve(userDetail);
    });
  },
  addProfile: (profileData) => {
    return new Promise(async (resolve, reject) => {
      await userModel.findOneAndUpdate(
        { email: profileData.email },
        {
          $set: {
            username: profileData.username,
            mobilenumber: profileData.phonenumber,
            housename: profileData.house_name,
            pincode: profileData.pincode,
            area: profileData.area,
            city: profileData.city,
            state: profileData.state,
            country: profileData.country,
          },
        }
      );
      console.log("profile Updated Saved");
      resolve();
    });
  },
  addShippindAddress: (addressData, userId) => {
    return new Promise(async (resolve, reject) => {
      const newAddress = new addressModel({
        user_Id: userId,
        username: addressData.username,
        mobilenumber: addressData.phonenumber,
        housename: addressData.house_name,
        pincode: addressData.pincode,
        area: addressData.area,
        city: addressData.city,
        state: addressData.state,
        country: addressData.country,
      });
      await newAddress.save((err, result) => {
        if (err) {
          reject({ msg: "address not added" });
        } else {
          resolve({ msg: "address added" });
        }
      });
    });
  },


getAlladdress:(userId)=>{
return new Promise(async(resolve,reject)=>{
const address = await addressModel.find({user_Id:userId}).lean()
console.log(address);
resolve(address)    
})
},  
  
  
  selectAddress: (userId) => {
    return new Promise(async (resolve, reject) => {
      const user = await userModel.findOne({ _id: userId });
      await addressModel.updateMany({},{$set:{status:false}})
    //   const userAddress = await addressModel.findOne({ user_Id: userId });
    //   console.log(userAddress);
    //   if (userAddress) {
    //     resolve({ msg: "already added" });
    //   } else {
        const newAddress = new addressModel({
          user_Id: userId,
          username: user.username,
          mobilenumber: user.mobilenumber,
          housename: user.housename,
          pincode: user.pincode,
          area: user.area,
          city: user.city,
          state: user.state,
          country: user.country,
          status: true
        });
        await newAddress.save((err, result) => {
          if (err) {
            resolve({ error: "address not added" });
          } else {
            resolve({ msg: "address added" });
          }
        });
        
      
    });
  },
  getShippingAddress: () => {
    return new Promise(async (resolve, reject) => {
        const shippingAddress = await addressModel.findOne({status:true}).lean()
        // console.log(shippingAddress);
        resolve(shippingAddress)    
    });     
  },
  selectAddedAddress:(addressId)=>{
      return new Promise(async(resolve,reject)=>{
        //  const address = addressModel.findOne({_id:addressId})
         
        const address = await addressModel.updateMany({},{$set:{status:false}})
        console.log(address);
        if(address){
            await addressModel.findOneAndUpdate({_id:addressId},{$set:{status:true}})
            resolve({msg:"address selected"}) 
        }
        else{
            resolve({msg:"address not selected"}) 
        }
              
      })
  },
  placeOrder:(userId,order,products,grandTotal,selectedAddress)=>{
  return new Promise(async(resolve,reject)=>{
    // console.log("proid:"+products.pro_Id);
    // products = await productModel.findOne({_id:pro_Id}).populate("pro_Id") 
    // console.log("products::"+products);
      let status = order['payment-method']==='COD'?'placed':'pending'
      console.log(status);
   let newOrder = new orderModel({
user_Id:userId,
payment_Method:order['payment-method'],
products:products,
grandTotal:grandTotal.total,
shippingAddress:selectedAddress,
ordered_on:new Date(),
status:status,
active:false
   })
   await newOrder.save(async(err,result)=>{
if(err){
    resolve({error:"order not placed"})
console.log("order not placed");
}else{
    await carModel.remove({user_Id:userId})
    resolve({msg:"order placed successfully",orderId:result._id})
    console.log("order placed successfully");
}
})
})
},
getCartProductList:(userId)=>{
return new Promise(async(resolve,reject)=>{
   const cart = await carModel.findOne({user_Id:userId})
   resolve(cart.products)
})
},


    getSelectedAddress:(userId)=>{
    return new Promise(async(resolve,reject)=>{
      const address = await addressModel.findOne({user_Id:userId,status:true})
      // console.log("address:"+address);
      resolve(address)
    })
  },


 generateRazorpay:(orderId,grandTotal)=>{
      return new Promise(async(resolve,reject)=>{
       var options = {
           amount:grandTotal*100,
           currency:"INR",
           receipt:""+orderId
       };
       instance.orders.create(options,function(err,order){
        //    console.log("new Order : ",order);
           resolve(order)
       })
      })
  },
  verifyPayment:(paymentDetails)=>{
      return new Promise(async(resolve,reject)=>{
          const crypto = require('crypto')
          let hmac = crypto.createHmac('sha256','PvCbDQBxdMXjfZPtq2ro7khh')
          hmac.update(paymentDetails['payment[razorpay_order_id]']+'|'+paymentDetails['payment[razorpay_payment_id]'])
          hmac=hmac.digest('hex')
          if(hmac==paymentDetails['payment[razorpay_signature]']){
              resolve()
          }else{
              reject()
          }
      })
  },
  changePaymentStatus:(orderId)=>{
      return new Promise(async(resolve,reject)=>{
          await orderModel.updateOne({_id:orderId},
            {
              $set:{
                  status:'placed'
              }
            }
            ).then(()=>{
                resolve() 
            })
      })
  },
  getOrders:(userId)=>{
    return new Promise(async(resolve,reject)=>{
const orders = orderModel.find({user_Id:userId}).lean()
resolve(orders)
    })
  },
  getOrderConfirm:()=>{
    return new Promise(async(resolve,reject)=>{
   const shippingAddress = await addressModel.findOne({status:true}).lean()
      resolve(shippingAddress)
      console.log(shippingAddress);
    })
  },
  getConfirmProducts:(orderId)=>{
    return new Promise(async(resolve,reject)=>{
   const products = await orderModel.findOne({_id:orderId}).populate('products.pro_Id').lean()
      resolve(products)
      console.log(products);
    })
  },
  getConfirmOrderSummary:(orderId)=>{
    return new Promise(async(resolve,reject)=>{
   const orderSummary = await orderModel.findOne({_id:orderId}).lean()
      resolve(orderSummary)
      console.log(orderSummary);
    })
  }
  ,
  getOrderSummary:(orderId)=>{
    return new Promise(async(resolve,reject)=>{
    const orderSummary = await orderModel.findOne({_id:orderId}).lean()
    resolve(orderSummary)
    })
  },
  getOrderedProducts:(orderId)=>{
    return new Promise(async(resolve,reject)=>{
      const order = await orderModel.findOne({_id:orderId}).populate('products.pro_Id').lean()
      console.log(order);     
      resolve(order)
  })
},
  getAllCategories:()=>{
  return new Promise(async(resolve,reject)=>{
    const category = await categoryModel.find({}).lean()
    console.log(category);
    resolve(category)
  })
},
getCategories:(categoryId)=>{
  return new Promise(async(resolve,reject)=>{
 const category = await categoryModel.findOne({_id:categoryId}).lean()
    resolve(category)
  })
},
getSubcategories:(categoryId)=>{
  return new Promise(async(resolve,reject)=>{
 const subcategory = await subcategoryModel.find({category:categoryId}).lean()
    resolve(subcategory)
  })
},
getSubcategoriesProducts:(categoryId)=>{
  return new Promise(async(resolve,reject)=>{
    const subcategory = await subcategoryModel.find({category:categoryId})
    const sub = await productModel.find({subcategory:subcategory}).lean()
// const sub = await subcategoryModel.aggregate([
// {
//   $match:{category:categoryId}
// }
// ])
console.log(sub);
   resolve(sub)
  })
},
getAllProducts:()=>{
  return new Promise(async(resolve,reject)=>{
    const products = await productModel.find({}).lean()
    resolve(products)
  })
},
cancelOrder:(orderId,userId)=>{
  return new Promise(async(resolve,reject)=>{
   
      await orderModel.findOneAndUpdate({_id:orderId},{$set:{status:"cancelled"}})
      await orderModel.findOneAndUpdate({_id:orderId},{$set:{active:true}})
      resolve({status:true})
     
    
  })
},
getSubCategory:(proId)=>{
return new Promise(async(resolve,reject)=>{
const products = await productModel.find({subcategory:proId}).lean()
console.log(products);
resolve(products)
})
},
getProductBrand:(proId)=>{
  return new Promise(async(resolve,reject)=>{
    const product = await productModel.findOne({_id:proId}).populate("brand").lean()
    resolve(product.brand)
    console.log(product.brand);
  })
},
getCategory:(proId)=>{
  return new Promise(async(resolve,reject)=>{
    const product = await productModel.findOne({_id:proId}).populate("subcategory").lean()
    resolve(product.subcategory)
    console.log(product.subcategory);
  })
},
getCategoryName:(proId,catId)=>{
  return new Promise(async(resolve,reject)=>{
    const category = await categoryModel.findOne({_id:catId})
    resolve(category.category_name)
  })
}

}



