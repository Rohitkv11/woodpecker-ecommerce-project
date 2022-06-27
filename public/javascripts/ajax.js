

 //change quantity
function changeQuantity(cartId,proId,count){
    let quantity = parseInt(document.getElementById(proId).innerHTML)
     count = parseInt(count)
    $.ajax({
      url:'/changeProductQuantity',
      data:{
        cart:cartId,
        product:proId,
        count:count,
        quantity:quantity
      },
      method:'post',
      success:(response)=>{
          if(response.removeProduct){
              alert("product removed from cart")
                location.reload()
          }else{
            
              document.getElementById(proId).innerHTML=quantity+count
            location.reload()
          }
        }
    })
  }


function deleteItem(proId) {
    swal({
        title: "Wood Pecker",
        text: "Are sure You want to remove this product",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((willDelete) => {
       
        if (willDelete) {
            removeFromWishlist(proId)
        } else {
         console.log("something went wrong")
        }
      });
    return false;
}
function removeFromWishlist(proId){
    console.log(proId);
    $.ajax({
        url:'/removeFromwishlist/'+proId,
        method:'get',
        success:(response)=>{
            location.reload()
            console.log(response);
            if(response.error){
                alert(response.error)
            }else if(response.msg){
                alert("Deleted")
                console.log(response.count);
                $("#wishlist-count").html(response.count)
            }else{
                alert("something went wrong")
            }
        }
    })
}

function deleteCartItem(proId) {
    swal({
        title: "Wood Pecker",
        text: "Are sure You want to remove this product",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((willDelete) => {
       
        if (willDelete) {
            removeFromCart(proId)
        } else {
         console.log("something went wrong")
        }
      });
    return false;
}
function removeFromCart(proId){
    console.log(proId);
    $.ajax({
        url:'/removefromcart/'+proId,
        method:'get',
        success:(response)=>{
            location.reload()
            console.log(response);
            if(response.error){
                alert(response.error)
            }else if(response.msg){
                alert(response.msg)
                console.log(response.count);
                $("#wishlist-count").html(response.count)
            }else{
                alert("something went wrong")
            }
        }
    })
}

function selectAddress(userId){
    console.log(userId);
    $.ajax({
        url:'/selectAddress/'+userId,
        method:'get',
        success:(response)=>{
            if(response.error){
                console.log(response.error)
            }else if(response.msg){
                location.href="/placeOrder"
}
    }
    })
}


function selectAddedAddress(addressId){
    console.log(addressId);
    $.ajax({
        url:'/selectAddedAddress/'+addressId,
        method:'get',
        success:(response)=>{
            if(response.error){
               console.log(response.error); 
            }else if(response.msg){
                location.href="/placeOrder"
}
    }
    })
}

function addToCart(proId){
    console.log(proId);
    $.ajax({
        url:'/add-to-cart/'+proId,
        method:'get',
        success:(response)=>{
            if(response.error){
                swal({
  title: "Wood Pecker",
  text: response.error,
  icon: "success",
  button: false,
  timer: 1000

});
            }else if(response.msg){
                swal({
  title: "Wood Pecker",
  text: response.msg,
  icon: "success",
   button: false,
  timer: 1000
});
console.log(response.count);
                $("#cart-count").html(response.count)
            }else{
                alert("something went wrong")
            }
        }
    })
}

 function addToWishlist(proId){
    console.log(proId);
    $.ajax({
        url:'/addtowishlist/'+proId,
        method:'get',
        success:(response)=>{
            if(response.error){
               swal({
  title: "Wood Pecker",
  text: response.error,
  icon: "success",
  button: false,
  timer: 1000
});
            }else if(response.msg){
              swal({
  title: "Wood Pecker",
  text: response.msg,
  icon: "success",
  button: false,
  timer: 1000
});
               
                $("#wishlist-count").html(response.count)
            }else{
              console.log("something went wrong")
            }
        }
    })
}


function cancelOrder(orderId) {
    if (confirm("Are you sure?")) {
        cancellingOrder(orderId)
    }
    return false;
}
function cancellingOrder(orderId){
    console.log(orderId);
    $.ajax({
        url:'/ordercancel/'+orderId,
        method:'get',
        success:(response)=>{
            location.reload()
            console.log(response);
         
        }
    })
}

