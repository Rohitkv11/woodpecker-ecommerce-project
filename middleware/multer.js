var multer=require('multer')

const storage=multer.diskStorage({
    destination:(req, file,cb)=>{
      cb(null,'./public/images')
    },
    filename: function (req, file, cb) {
      console.log(file);
        const uniqueSuffix =  file.originalname.substring(file.originalname.lastIndexOf('.'));
        cb(null, Date.now() + '-' + file.fieldname)
      }
    })

    module.exports=store=multer({storage:storage})