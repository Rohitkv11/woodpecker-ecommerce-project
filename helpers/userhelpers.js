// const { response, getMaxListeners } = require("../app");
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
var instance = new Razorpay({
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
      userOtp =
        (await otpData.otp1) + otpData.otp2 + otpData.otp3 + otpData.otp4;
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
          if (status) {
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            reject({ status: false, msg: "incorrect password" });
          }
        });
      } else {
        reject({ status: false.valueOf, msgg: "invalid email" });
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
    return new Promise(async (resolve, reject) => {
      if (count == -1 && quantity == 1) {
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
            resolve(true);
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
  placeOrder:(userId,order,products,grandTotal)=>{
  return new Promise(async(resolve,reject)=>{
      let status = order['payment-method']==='COD'?'placed':'pending'
      console.log(status);
   let newOrder = new orderModel({
user_Id:userId,
payment_Method:order['payment-method'],
products:products,
grandTotal:grandTotal.total,
ordered_on:new Date(),
status:status
   })
   await newOrder.save(async(err,result)=>{
if(err){
    resolve({error:"order not placed"})
console.log("order not placed");
}else{
    await carModel.remove({user_Id:userId})
    resolve({msg:"order placed successfully",orderId:newOrder._id})
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
  generateRazorpay:(orderId,grandTotal)=>{
      return new Promise(async(resolve,reject)=>{
       var options = {
           amount:grandTotal,
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
  }
}



