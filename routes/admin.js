var express = require("express");
const adminhelpers = require("../helpers/adminhelpers");
var router = express.Router();
var adminModel = require("../model/adminModel");
var productModel = require("../model/productModel");
var multer = require("../middleware/multer");

const verifyAdminLogin = (req, res, next) => {
  if (req.session.adminLogin) {
    next()
  }
  else {
    res.redirect('/admin') 
  }
}


/* GET home page. */
router.get("/", function (req, res) {
  res.header(
    "Cache-Control",
    "no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
  if (req.session.adminLogin) {
    res.redirect("/admin/adminpanel");
  } else {
    res.render("admin/login");
    req.session.adminLogin=null
  }
});

/*POST login*/
router.post("/adminpanel", (req, res) => {
  res.header(
    "Cache-Control",
    "no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
  adminhelpers
    .adminLogin(req.body)
    .then((response) => {
      // success=response.msg
      // console.log(success);
      req.session.adminLogin = true;
      res.redirect("/admin/adminpanel");
      
    })
    .catch((error) => {
      adminPasswordErr = error.msgg;
      console.log(adminPasswordErr);
      adminLoginErr = error.msg;
      console.log(adminLoginErr);
      res.redirect("/admin"); 
    });
});

/*GET admin panel*/
router.get("/adminpanel", verifyAdminLogin, async function (req, res) {
  res.header(
    "Cache-Control",
    "no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
  const totalIncome = await adminhelpers.getTotalIncome();
  const totalOrders = await adminhelpers.getTotalOrders()
  const totalCustomers = await adminhelpers.getTotalCustomers()
  const totalProducts = await adminhelpers.getTotalProducts()
  // console.log(totalOrders);
  res.render("admin/admin_panel",{totalIncome,totalOrders,totalCustomers,totalProducts});
});

/*GET products*/
router.get("/product",verifyAdminLogin, (req, res) => {
  res.header(
    "Cache-Control",
    "no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
  if(req.session.adminLogin){
  adminhelpers.getAllProducts().then((response) => {
    // console.log(response.product);
    const product = response.product;
    console.log(product);
    res.render("admin/product", {admin:req.session.adminLogin, product });
  });
}
});

/*GET add category*/
router.get("/addcategory",verifyAdminLogin,async (req, res) => {
  res.header(
    "Cache-Control",
    "no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
  const category = await adminhelpers.getCategory();
  console.log(category);
  res.render("admin/add_category", {
    category,
    error: req.session.categoryErr,
  });
  req.session.categoryErr = null;
});

/*POST add subcategory*/
router.post("/addsubcategory",verifyAdminLogin, (req, res) => {
  adminhelpers
    .addSubCategory(req.body)
    .then((response) => {
      console.log(response.msg);
      res.redirect("/admin/product");
    })
    .catch((error) => {
      console.log(error.msg);
      // req.session.subcategoryErr=error.msg
      res.redirect("/admin/addcategory");
    });
});

/*GET add brand*/
router.get("/addbrand",verifyAdminLogin, (req, res) => {
  res.header(
    "Cache-Control",
    "no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
  res.render("admin/add_brand");
});

/*POST add brand*/
router.post("/addbrand",verifyAdminLogin, (req, res) => {
  adminhelpers
    .addBrand(req.body)
    .then((response) => {
      res.redirect("/admin/product");
      console.log(response.msg);
    })
    .catch((error) => {
      res.redirect("/admin/addbrand");
      console.log(error.msg);
    });
});

/*GET add product*/
router.get("/addproduct",verifyAdminLogin, async (req, res) => {
  res.header(
    "Cache-Control",
    "no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
  const subcategory = await adminhelpers.getSubCategory();
  // console.log(category);
  const brand = await adminhelpers.getBrand();
  // console.log(brand);
  res.render("admin/add_product", { subcategory, brand });
});

/*POST add category*/
router.post("/addcategory",verifyAdminLogin, (req, res) => {
  adminhelpers
    .addCategory(req.body)
    .then((response) => {
      console.log(response.msg);
      res.redirect("/admin/addcategory");
    })
    .catch((error) => {
      console.log(error.msg);
      req.session.categoryErr = error.msg;
      res.redirect("/admin/addcategory");
    });
});

router.post(
  "/addproduct",
  multer.fields([
    { name: "img_1", maxCount: 1 },
    { name: "img_2", maxCount: 1 },
    { name: "img_3", maxCount: 1 },
    { name: "img_4", maxCount: 1 },
  ]),
  verifyAdminLogin,
  (req, res) => {
    console.log(req.files.img_1[0].filename);
    // console.log(req.body);
    let image1 = req.files.img_1[0].filename;
    let image2 = req.files.img_2[0].filename;
    let image3 = req.files.img_3[0].filename;
    let image4 = req.files.img_4[0].filename;
    const files = req.files.filename;
    adminhelpers
      .addProduct(req.body, image1, image2, image3, image4)
      .then((response) => {
        // console.log(response.data);
        res.redirect("/admin/product");
      });
  }
);

/*GET customer page*/
router.get("/customers",verifyAdminLogin, async (req, res) => {
  res.header(
    "Cache-Control",
    "no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
  const customers = await adminhelpers.getAllCustomers();
  res.render("admin/customers", { customers, block: req.session.block });
});

/*GET Block user*/
router.get("/blockuser/:id",verifyAdminLogin, (req, res) => {
  res.header(
    "Cache-Control",
    "no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
  adminhelpers.blockUser(req.params.id).then((response) => {
    res.redirect("/admin/customers");
  });
});

router.get("/orders",verifyAdminLogin, async (req, res) => {
  res.header(
    "Cache-Control",
    "no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
  const orders = await adminhelpers.getAllOrders();
  res.render("admin/orders", { orders });
});

router.get("/unblockuser/:id",verifyAdminLogin, (req, res) => {
  res.header(
    "Cache-Control",
    "no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
  console.log(req.params.id);
  adminhelpers.unBlockUser(req.params.id).then((response) => {
    res.redirect("/admin/customers");
  });
});

// router.get("/edit-product/:id", async (req, res) => {
//   const subcategory = await adminhelpers.getSubCategory();
//   const brand = await adminhelpers.getBrand();
//   const productDetail = await adminhelpers.getEditDetails(req.params.id);
//   console.log(productDetail);
//   res.render("admin/edit_product", { productDetail, subcategory, brand });
// });

router.get("/edit-product/:id",verifyAdminLogin, async (req, res) => {
  res.header(
    "Cache-Control",
    "no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
  const subcategory = await adminhelpers.getSubCategory();
  const brand = await adminhelpers.getBrand();
  const productDetail = await adminhelpers.getEditDetails(req.params.id);
  console.log(productDetail);
  res.render("admin/edit_product", { productDetail, subcategory, brand });
});

router.post(
  "/edit-product/:id",
 multer.fields([
    { name: "img_1", maxCount: 1 },
    { name: "img_2", maxCount: 1 },
    { name: "img_3", maxCount: 1 },
    { name: "img_4", maxCount: 1 },
  ]),verifyAdminLogin,
  (req, res) => {
    console.log("Editttt");
    let image1 = req.files.img_1[0].filename;   
    let image2 = req.files.img_2[0].filename;   
    let image3 = req.files.img_3[0].filename;   
    let image4 = req.files.img_4[0].filename;   
    
    console.log(req.body,req.params.id);
   adminhelpers.editProduct(req.body, image1, image2, image3, image4,req.params.id).then(() => {
     console.log("Editted");
      res.redirect("/admin/product");
    });
  }
);

router.get('/delete-product/:id',verifyAdminLogin,(req,res)=>{
  res.header(
    "Cache-Control",
    "no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
  console.log("kkkkk");
  adminhelpers.deleteProducts(req.params.id).then(()=>{
    console.log("product deleted");
    res.redirect("/admin/product")
  })
})


router.get('/orderdetail/:id',(req,res)=>{
  res.header(
    "Cache-Control",
    "no-cache,private,no-store,must-revalidate,max-stale=0,post-check=0,pre-check=0"
  );
 const orderSummary = adminhelpers.getOrderDetail(req.session.id)
})


router.get("/logout", (req, res) => {
  console.log("lllllll");
  req.session.destroy();
  res.redirect("/admin");
}); 

module.exports = router;