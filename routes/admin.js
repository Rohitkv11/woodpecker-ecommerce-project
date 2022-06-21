var express = require("express");
const adminhelpers = require("../helpers/adminhelpers");
var router = express.Router();
var adminModel = require("../model/adminModel");
var productModel = require("../model/productModel");
var multer = require("../middleware/multer");

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
    // req.session.adminLogin=null
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
      res.redirect("/admin/adminpanel");
      req.session.adminLogin = true;
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
router.get("/adminpanel", function (req, res) {
  res.render("admin/admin_panel");
});

/*GET products*/
router.get("/product", (req, res) => {
  adminhelpers.getAllProducts().then((response) => {
    // console.log(response.product);
    const product = response.product;
    console.log(product);
    res.render("admin/product", { product });
  });
});

/*GET add category*/
router.get("/addcategory", async (req, res) => {
  const category = await adminhelpers.getCategory();
  console.log(category);
  res.render("admin/add_category", { category,error:req.session.categoryErr });
  req.session.categoryErr=null
});

/*POST add subcategory*/
router.post("/addsubcategory", (req, res) => {
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
router.get("/addbrand", (req, res) => {
  res.render("admin/add_brand");
});

/*POST add brand*/
router.post("/addbrand", (req, res) => {
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
router.get("/addproduct", async (req, res) => {
  const subcategory = await adminhelpers.getSubCategory();
  // console.log(category);
  const brand = await adminhelpers.getBrand();
  // console.log(brand);
  res.render("admin/add_product", { subcategory, brand });
});

/*POST add category*/
router.post("/addcategory", (req, res) => {
  adminhelpers
    .addCategory(req.body)
    .then((response) => {
      console.log(response.msg);
      res.redirect("/admin/addcategory");
    })
    .catch((error) => {
      console.log(error.msg);
      req.session.categoryErr=error.msg
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

  (req, res) => {
    console.log(req.files.img_1[0].filename)    
    // console.log(req.body);
    let image1 = req.files.img_1[0].filename;
    let image2 = req.files.img_2[0].filename;
    let image3 = req.files.img_3[0].filename;
    let image4 = req.files.img_4[0].filename;
    const files = req.files.filename;
    adminhelpers. addProduct(req.body, image1, image2, image3, image4)
      .then((response) => {
        // console.log(response.data);
        res.redirect("/admin/product");
      });
  }
);


/*GET customer page*/
router.get('/customers',async(req,res)=>{
  const customers = await adminhelpers.getAllCustomers()
  res.render('admin/customers',{customers,block:req.session.block})
})

/*GET Block user*/
router.get('/blockuser/:id',(req,res)=>{
  adminhelpers.blockUser(req.params.id).then((response)=>{
    console.log(response.block``);
   req.session.block=response.block
   console.log(req.session.block);
   res.redirect('/admin/customers')
  })
})

router.get('/unblockuser/:id',(req,res)=>{
  console.log(req.params.id);
  adminhelpers.unBlockUser(req.params.id).then((response)=>{
    req.session.block=response.block
    res.redirect('/admin/customers')
  })
})


module.exports = router;
