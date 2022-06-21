

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
            //   $('#cartQty').load(window.location.href+ '#cartQty')
            location.reload()
          }
        }
    })
  }


function deleteItem(proId) {
    if (confirm("Are you sure?")) {
        removeFromWishlist(proId)
    }
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
    if (confirm("Are you sure?")) {
        removeFromCart(proId)
    }
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





