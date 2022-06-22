var express = require("express");
const userhelpers = require("../helpers/userhelpers");
var router = express.Router();
var User = require("../model/userModel");

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  }
  else {
    res.redirect('/login') 
  }
}


/* GET landing page */
router.get("/", async(req, res) => {
  res.header('Cache-Control','no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0');
  await userhelpers.getProduct().then(async (response) => {
    const product = response.product;
    // let cartCount = null;
    // let WishlistCount = null;
    if (req.session.user) {
      const cartCount = await userhelpers.getCartCount(req.session.user._id);
      const wishlistCount = await userhelpers.getWishlistCount(req.session.user._id)
      const categories = await userhelpers.getAllCategories()
      res.render("user/home", { product, cartCount, user: req.session.user, wishlistCount, categories });
    }else{
      res.render("user/home", { product });
    }
})
})


/* GET login page */
router.get("/login", function (req, res) {
  res.header(
    "Cache-Control",
    "no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
  if (req.session.loggedIn) {
    res.redirect("/");
    
  } else {
    res.render("user/login", {
      err: req.session.passErr,
      errr: req.session.emailErr,
    });
    req.session.passErr = null;
    req.session.emailErr = null;
  }
});

router.post("/login", (req, res) => {
  res.header(
    "Cache-Control",
    "no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
  userhelpers
    .dologin(req.body)
    .then((response) => {
     console.log(response);
      req.session.user = response.user;
      req.session.loggedIn = true;
      res.redirect("/");
})
    .catch((error) => {
      console.log(error);
      req.session.passErr = error.msg;
      req.session.emailErr = error.msgg;

      res.redirect("/login");
    });
});

/* GET signup page */
router.get("/signup", function (req, res) {
  res.header(
    "Cache-Control",
    "no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
  res.render("user/signup", { error: req.session.signUpErr });
  req.session.signUpErr = null;
});

/* POST signup page */
router.post("/signup", function (req, res) {
  res.header(
    "Cache-Control",
    "no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
  userhelpers
    .dosignup(req.body)
    .then((response) => {
      // console.log(response.otpCode);
      req.session.user = req.body;
      req.session.otp = response.otpCode;
      console.log(response.msg);
      res.redirect("/forgotpassword");
    })
    .catch((error) => {
      console.log(error.msge);
      req.session.signUpErr = error.msge;
      console.log(req.session.signUpErr);
      res.redirect("/signup");
    });

});

/* GET signupotp page */
router.get("/forgotpassword", (req, res) => {
  res.render("user/verification");
});

/* POST signupotp page */
router.post("/forgotpassword", (req, res) => {
  userhelpers
    .otpverify(req.session.otp, req.session.user, req.body)
    .then((response) => {

      res.redirect("/login");
    })
    .catch((error) => {
      console.log(error.msg);
      // otpErr=error.msg
      res.redirect("/forgotpassword");
    });
});

/* GET forget password page */
router.get("/forgetpassword", (req, res) => {
  res.render("user/forgetpassword", {
    forgetEmailErr: req.session.forgetEmailErr,
  });
});

/* GET resetotp page */
router.get("/resetotp", (req, res) => {
  res.render("user/resetotp");
});

/* GET resetpassword page */
router.get("/resetpassword", (req, res) => {
  res.render("user/resetpassword");
});

/* POST forget password page */
router.post("/forgetpassword", (req, res) => {
  userhelpers
    .forgetPassword(req.body)
    .then((response) => {
      const resetPasswordRes = response.msg;
      req.session.resetOtp = response.resetOtp;
      req.session.forgetEmail = response.verifyEmail;
      // console.log( req.session.forgetEmail);
      res.redirect("/resetotp");
    })
    .catch((error) => {
      const resetPasswordErr = error.msg;
      console.log(resetPasswordErr);
      req.session.forgetEmailErr = error.msg;
      res.redirect("forgetpassword");
    });
});

/* POST reset otp page */
router.post("/resetotp", (req, res) => {
  userhelpers
    .verifyResetOtp(req.body, req.session.resetOtp)
    .then((response) => {
      const resetOtp = response.msg;

      res.redirect("/resetpassword");
    })
    .catch((error) => {
      res.redirect("/resetotp");
      const resetOtpErr = error.msg;

    });
});

/* POST reset password page */
router.post("/resetpassword", (req, res) => {
  userhelpers
    .resetPassword(req.body, req.session.forgetEmail)
    .then((response) => {
      const passwordErr = response.msg;

      res.redirect("/login");
    });
});



/* GET cart */
router.get("/cart",verifyLogin,  async  function  (req, res) {
  res.header(
    "Cache-Control",
    "no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
  if (req.session.user) {
    subTotal = await userhelpers.getTotalAmount(req.session.user._id)
    grandTotal = await userhelpers.getGrandTotal(req.session.user._id)
    console.log(grandTotal);
    cartCount = await userhelpers.getCartCount(req.session.user._id);
    wishlistCount = await userhelpers.getWishlistCount(req.session.user._id)
}
  const user = req.session.user
  const cartItems = await userhelpers.cartItems(req.session.user._id);
  console.log(cartItems)
  // const notEmpty = cartItems.products.length!=0
  // console.log(notEmpty);
  res.render("user/cart", {cartItems, user, cartCount, wishlistCount  });
});
 
//add to cart
router.get("/add-to-cart/:id",verifyLogin, (req, res) => {
  userhelpers
    .addToCart(req.params.id, req.session.user._id)
    .then((response) => {
      res.json(response)
    }).catch((error) => {
      console.log(error.msg);
      res.redirect("/");
    });
});

//remove from cart
router.get('/removefromcart/:id',verifyLogin, (req, res) => {
  userhelpers.removeFromCart(req.params.id, req.session.user._id).then((response) => {
    res.json(response)
  })
})

//change product quantity
router.post('/changeProductQuantity',verifyLogin, (req, res) => {
  const user = req.session.user
  userhelpers.changeProductQuantity(req.body, user).then((response) => {
    res.json(response)
  })
})

//get wishlist
router.get('/wishlist',verifyLogin, async (req, res) => {
  res.header(
    "Cache-Control",
    "no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
  const wishlistCount = await userhelpers.getWishlistCount(req.session.user._id)
  const wishlistItems = await userhelpers.wishlistItems(req.session.user._id)
  const cartCount = await userhelpers.getCartCount(req.session.user._id);
  const user = req.session.user
  res.render('user/wishlist', { wishlistCount, wishlistItems, cartCount, user })
})

//get add to wishlist
router.get('/addtowishlist/:id',verifyLogin, (req, res) => {
  userhelpers.addToWishlist(req.params.id, req.session.user._id).then((response) => {
    res.json(response)
  })  
})

//get remove from wishlist
router.get('/removefromwishlist/:id',verifyLogin, (req, res) => {
  userhelpers.removeFromWishlist(req.params.id, req.session.user._id).then((response) => {
    res.json(response)
  })
})

//get single product page
router.get('/productdetails/:id',verifyLogin,async (req, res) => {
  res.header(
    "Cache-Control",
    "no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
  console.log("kkkk");
  wishlistCount = await userhelpers.getWishlistCount(req.session.user._id)
const cartCount = await userhelpers.getCartCount(req.session.user._id)
const productDetail = await userhelpers.productDetail(req.params.id)
const brand = await userhelpers.getProductBrand(req.params.id)
const category = await userhelpers.getCategory(req.params.id)
const categoryName = await userhelpers.getCategoryName(req.params.id,category.category)
console.log(category);
  res.render('user/singleproduct',{productDetail,brand,categoryName,wishlistCount,cartCount,user:req.session.user}) 
})

//get profile page
router.get('/profile',verifyLogin,async(req,res)=>{
  res.header(
    "Cache-Control",
    "no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
  cartCount = await userhelpers.getCartCount(req.session.user._id);
  wishlistCount = await userhelpers.getWishlistCount(req.session.user._id)
 const user = req.session.user
 const details = await userhelpers.getUserDetail(user)
 console.log("lllll");
 console.log(details);
  res.render('user/profile',{user,details,cartCount,wishlistCount})
})

//post profile detail
router.post('/addprofile',verifyLogin,(req,res)=>{
  // console.log(req.body);
  userhelpers.addProfile(req.body).then((response)=>{
    res.redirect('/profile')
  })
})




//get checkout page
router.get('/checkout',verifyLogin,async (req, res) => {
  res.header(
    "Cache-Control",
    "no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
const user = req.session.user
const cartCount = await userhelpers.getCartCount(req.session.user._id);
const wishlistCount = await userhelpers.getWishlistCount(req.session.user._id)
const orderSummary = await userhelpers.cartItems(req.session.user._id)
const details = await userhelpers.getUserDetail(user)
const address = await userhelpers.getAlladdress(user._id)
console.log("lllll");
console.log(address);
  res.render('user/checkout',{user,cartCount,wishlistCount,orderSummary,details,address})
})

//post checkout 
router.post('/addShippingAddress',verifyLogin,(req,res)=>{
userhelpers.addShippindAddress(req.body,req.session.user._id).then((response)=>{
  res.redirect('/checkout')
})
})
 
//get select address
router.get('/selectAddress/:id',verifyLogin,(req,res)=>{
  // console.log("address");
   userhelpers.selectAddress(req.params.id).then((response)=>{
    res.json(response)
   })
})

//get selectAddedAddress
router.get('/selectAddedAddress/:id',verifyLogin,(req,res)=>{
  userhelpers.selectAddedAddress(req.params.id).then((response)=>{
    res.json(response)
  })
})


//get placeorder
router.get('/placeOrder',verifyLogin,async(req,res)=>{
  res.header(
    "Cache-Control",
    "no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
  const shippingAddress = await userhelpers.getShippingAddress()
  const orderSummary = await userhelpers.cartItems(req.session.user._id)
  console.log("ghgghgjhg");
  console.log(shippingAddress);
  res.render('user/placeorder',{user:req.session.user,orderSummary,shippingAddress})
})


router.post('/placeorder',verifyLogin,async(req,res)=>{
  console.log("sdsddsd");
  console.log(req.body);
  const products= await userhelpers.getCartProductList(req.session.user._id)
  const grandTotal = await userhelpers.getGrandTotal(req.session.user._id)
  const selectedAddress = await userhelpers.getSelectedAddress(req.session.user._id)
  console.log("products:"+products);
  userhelpers.placeOrder(req.session.user._id,req.body,products,grandTotal,selectedAddress).then((response)=>{
    req.session.orderId=response.orderId
    if(req.body['payment-method']==='COD'){
      res.json({codSuccess:true})
    }else{
      // console.log(grandTotal.total);
      userhelpers.generateRazorpay(response.orderId,grandTotal.total).then((response)=>{
        // console.log("online");
        res.json(response)
    })
    }

  })  
})


//get confirmation page
router.get('/confirmation',verifyLogin,async(req,res)=>{
  res.header(
    "Cache-Control",
    "no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
 const confirmDetails = await userhelpers.getOrderConfirm(req.session.user)
 const productDetails = await userhelpers.getConfirmProducts( req.session.orderId)
 const orderSummary = await userhelpers.getConfirmOrderSummary( req.session.orderId)
  res.render('user/confirmation',{confirmDetails,productDetails,orderSummary})
})


router.post('/verify-payment',verifyLogin,(req,res)=>{
  console.log(req.body);
  userhelpers.verifyPayment(req.body).then(()=>{
    userhelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      console.log("payment successful");
res.json({status:true})
    })
  }).catch((err)=>{
    res.json({status:false})
  })
})


//get orders page
router.get('/orders',verifyLogin,async(req,res)=>{
  res.header(
    "Cache-Control",
    "no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
  cartCount = await userhelpers.getCartCount(req.session.user._id);
  wishlistCount = await userhelpers.getWishlistCount(req.session.user._id)
  const orders = await userhelpers.getOrders(req.session.user._id)
  console.log(orders);
  res.render('user/orders',{orders,user:req.session.user,cartCount,wishlistCount})
})

 
router.get('/order-detail:id',verifyLogin,async(req,res)=>{
  res.header(
    "Cache-Control",
    "no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
console.log(req.params.id);
cartCount = await userhelpers.getCartCount(req.session.user._id);
  wishlistCount = await userhelpers.getWishlistCount(req.session.user._id)
const orderSummary = await userhelpers.getOrderSummary(req.params.id)
const productDetail = await userhelpers.getOrderedProducts(req.params.id)
console.log("orderSummary"+orderSummary);
console.log("product detail"+productDetail);
res.render('user/orderdetail',{orderSummary,productDetail,user:req.session.user,cartCount,wishlistCount})
})


// router.get("/categories:id",verifyLogin,async(req,res)=>{
//   console.log("kjjkgkjk");
//   const categories = await userhelpers.getAllCategories()
//   res.render('user/categories',{categories})
// })

router.get("/categories:id",verifyLogin,async(req,res)=>{
  res.header(
    "Cache-Control",
    "no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
  console.log("kjjkgkjk");
  console.log(req.params.id);
  cartCount = await userhelpers.getCartCount(req.session.user._id);
  wishlistCount = await userhelpers.getWishlistCount(req.session.user._id)
  const subCategories = await userhelpers.getSubcategories(req.params.id)
  const subCategoriesProducts = await userhelpers.getSubcategoriesProducts(req.params.id)
  const category = await userhelpers.getCategories(req.params.id)
  console.log(category);
  res.render('user/categories',{subCategories,subCategoriesProducts,category,user:req.session.user,cartCount,wishlistCount})
})

router.get('/subcategories/:id',verifyLogin,async(req,res)=>{
  console.log("hhhhh");
  res.header(
    "Cache-Control",
    "no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
const subcategories = userhelpers.getSubCategory(req.params.id).then((response)=>{
res.render('user/subcategory')
})
})


router.post('/search',verifyLogin, async (req, res) => {
  console.log("kjhjhkjh");
  let searchText = req.body['search_text'];
  console.log(searchText + "ooooooooooooooooooo");
  try {
    let products=await userhelpers.getAllProducts()
    console.log("ererererer");
    console.log(products);
  if (searchText) {
   let product=products.filter((u) => u.name.includes(searchText));
   console.log("nmnmnmnmnmnmnm");
      console.log(product);
      res.render('user/home',{product,user:req.session.user})  
    } 
  } catch (err) {
   console.log(err);
  }
})






router.get("/ordercancel/:id", (req, res) => {
  console.log("Cancel Router");
  userhelpers.cancelOrder(req.params.id,req.session.id).then();
  res.json({status:true})
});





//get logout
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
}); 

module.exports = router;
