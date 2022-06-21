$(document).ready(function(){
    $("#signup").validate({
           rules:{
               name:{
                   required:true,
                   minlength:4
               },

               email:{
                required:true,
                email:true
               },

               password:{
                required:true,
                minlength: 5
               },

               confirm_password: {
                required: true,
                minlength: 5,
                equalTo:"#password"
            }
            
           },
     
    })
})  
$(document).ready(function(){
    $("#login_form").validate({
           rules:{
            email:{
                required:true,
                email:true
               },

               password:{
                required:true,
                minlength: 5
               }

              
            
           },
     
    })
})    
$(document).ready(function(){
    $("#forget_password").validate({
           rules:{
            email:{
                required:true,
                email:true
               }
            }
     
    })
})
$(document).ready(function(){
    $("#reset_password").validate({
           rules:{
            password:{
                required:true,
                minlength: 5
               },

               c_password: {
                required: true,
                minlength: 5,
                equalTo:"#password"
            }
        }
     
    })
})
$(document).ready(function(){
    $("#addProduct").validate({
           rules:{
               name:{
                   required:true,
               },

               price:{
                required:true,
                
               },

               description:{
                required:true,
              
               },

               stock: {
                required: true,
               
            },
            discount: {
                required: true,
               
            },
            shippingcost: {
                required: true,
               
            }
            
           },
     
    })
})  