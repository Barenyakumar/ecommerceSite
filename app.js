const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: "yfytli52adtb",
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: "3raqnWTS4AeTpC9wgaDUnD4-gvuWvVVSfBCKqYZkF_k"
  });
// console.log(client );

//variables

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');
// const btns = document.querySelectorAll('.bag-btn')
// console.log(btns) //nothing will come as yet npt been loaded

//cart
let cart= [];

//Buttons
let buttonsDOM = [];

//getting the products list
class Products{
    //calling methods
    async getProducts(){
        
        try{ 

            const response = await client.getEntries({
                content_type: 'ecommerceSite'
            });
            console.log(response)


            /*let result = await fetch('products.json');
            let data = await result.json(); */
            
            //Note that despite the method being named json(), the result is not JSON but is instead the result of taking JSON as input and parsing it to produce a JavaScript object.
            
            //this for contentful database
            let products = response.items;
            // let products = data.items;//this for local database
            products = products.map(item=>{
                //destructuring
                const {title,price} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return {title,price,image,id};
            })
            return products;
        }
        catch(error){
            console.log(error);
        }
    }
}

//display products
class UI{
    //method displayProducts
displayProducts(products){
    //result is taken as a string you can try as array too
    let result = '';
    //products is an array
    products.forEach(product=>{
        result += `
        <!-- single-product -->
             <article class="product">
                <div class="img-container">
                    <img src= ${product.image} alt="product" class="product-img">
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas-fa-shopping-cart">
                        </i>
                        add to bag
                    </button>
                </div>
                <h3> ${product.title}/h3>
                <h3> $${product.price}</h3>
             </article>
        `
        // productsDOM.innerHTML = result ;
        //it can be here also result will bea dded in time
    });
    productsDOM.innerHTML = result ;
}


getBagButtons(){
    // const buttons = [...document.querySelectorAll('.bag-btn')];
    const buttons = [...document.querySelectorAll('.bag-btn')];//returns an array
    // console.log(buttons);
    buttonsDOM = buttons;
    buttons.forEach(button=>{
        let id = button.dataset.id;
        // console.log(id);

        let inCart = cart.find(item => item.id === id);
        if(inCart){
            buttons.innerText =" In Cart";
            buttons.disabled = true;

        } 
        button.addEventListener("click", event=>{
            // console.log(event);  
                event.target.innerText ="In Cart";  
                event.target.diabled = "true";

                /*get product from products */
                let cartItem = {...Storage.getProduct(id), amount: 1}; //adding amout 
                // console.log(cartItem); 
                
                /*add product to the cart*/
                cart = [...cart, cartItem];
                // console.log(cart);

                /*save cart in local storage */
                Storage.saveCart(cart);

                /*set cart values */
                this.setCartValues(cart);

                /*display cart item */
                this.addCartItem(cartItem);

                /*show the cart*/
                this.showCart(); 
            })
        
    })
}
setCartValues(cart){
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item =>{
        tempTotal += item.price * item.amount;
        itemsTotal += item.amount;
    })
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal; //this is to display number in cart Icon
    // console.log(cartTotal,cartItems);
}
addCartItem(item){
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML= `
    <img src=${item.image} alt="Product-img">
                    <div>
                        <h4>${item.title}</h4>
                        <h5>$${item.price}</h5>
                        <span class="remove-item " data-id=${item.id}>remove</span>
                    </div>
                    <div>
                        <i class="fas fa-chevron-up" data-id=${item.id}></i>
                        <p class="item-amount">${item.amount}</p>
                        <i class="fas fa-chevron-down" data-id=${item.id}></i>
                    </div>
    `;
    //nneed to append to main div class 
    cartContent.appendChild(div);
    // console.log(cartContent);
}
showCart(){   
    cartDOM.classList.add("showCart"); 
    cartOverlay.classList.add("transparentBcg"); 
    // console.log(this)
    //remember this class refers to the class btns
    //if you want to refer to the class as you want to access some other methods present in class then you have to use functions
}

//when refreshed we need to keeps the cart loaded so that we can get the previous valyes of cart. we get that from local storage
setupApp(){
    cart = Storage.getCart();
    //now we need to add these changes to cart
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click",this.showCart);
    //this.showCart will just invoke the method after onclick 
    // cartBtn.addEventListener("click",this.showCart()); 
    //this.showCart() will execute the code with waiting for first priority order: click
    // console.log(this);
    closeCartBtn.addEventListener("click",this.hideCart);
}
//the cart items been added we have to add them back to the cart items with styling and all
populateCart(cart){
    cart.forEach(item => this.addCartItem(item));
}
 
//hiding cart
hideCart(){
    cartDOM.classList.remove("showCart"); 
    cartOverlay.classList.remove("transparentBcg"); 
}

//changes inside cart
cartLogic(){
    // clearCartBtn.addEventListener('click',this.clearCart);
    // the above don't refer to class UI
    //clear cart button
    clearCartBtn.addEventListener('click',()=>{
        this.clearCart();
    });

    //cart functionality for remove , increase and decrease item count
    // we'll be using bubbling as 2 events are there 
    //cartContent is always present in html which we can use as parent for bubling
    cartContent.addEventListener('click',event=>{
        // console.log(event.target);
        //this e.target shows the DOM class which we can give ind. function now
        if(event.target.classList.contains('remove-item')){
            let removeItem = event.target;
            // console.log(removeItem);
            let id = removeItem.dataset.id;
            //target has property dataset that gives value of id 
            // console.log(removeItem.parentElement.parentElement); //to traverse up 2 parents 
            cartContent.removeChild(removeItem.parentElement.parentElement);

            this.removeItem(id); //this won't remove it from DOM as it's there in cartContent and chk 'elements' to understand: we have to move 2 parents up of remove-item class {one div and then cart-item to totally remove cart-item}


        }
        else if(event.target.classList.contains('fa-chevron-up')){
            let addAmount = event.target;
            let id = addAmount.dataset.id;
            // console.log(addAmount);
            //now we need to update both in storage and cartContent
            let tempItem = cart.find(item => item.id === id);
            // console.log(tempItem);
            tempItem.amount = tempItem.amount + 1;
            //tempItem is only the single object that's been reflected dyna,icaaly in cart array of objects
            Storage.saveCart(cart);
            this.setCartValues(cart);

            addAmount.nextElementSibling.innerText = tempItem.amount; //see in elements dom fa-chevron-up has only one sibling so change the inner text
        }
        else if(event.target.classList.contains('fa-chevron-down')){
            let lowerAmount= event.target;
            let id = lowerAmount.dataset.id;
            let tempItem = cart.find(item => item.id === id);
            tempItem.amount = tempItem.amount - 1;

            //see if amount is 0 then remove from cart content
            if(tempItem.amount > 0) {
                Storage.saveCart(cart);
                this.setCartValues(cart);
                lowerAmount.previousElementSibling.innerText = tempItem.amount;
            }
            else{
                cartContent.removeChild(lowerAmount.parentElement.parentElement);
                this.removeItem(id);
            }
            
            
        }
    })
}

clearCart(){
    // console.log(this);

    //we can get all the id's in the cart
    let cartItem = cart.map(item => item.id);
    // console.log(cartItem);
    cartItem.forEach(id => this.removeItem(id) );
    // console.log(cartContent.children);
    //we could have used removeItem function but we need the method again later

    //dom element  property is removeChild
    //this while checks if cart has parent children then keep removing them
    while(cartContent.children.length > 0) {
        cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
}

removeItem(id){ 
    cart = cart.filter(item => item.id !== id);
    //now update the same 
    this.setCartValues(cart);
    Storage.saveCart(cart);
    
    //now change back 'in cart' to 'add to cart' after cleared of cart
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
}

getSingleButton(id){
    return buttonsDOM.find(button => button.dataset.id === id);
}


}

//local storage
class Storage{
    static saveProducts(products){
        localStorage.setItem("products",JSON.stringify(products));
    }
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem("products")); //since products is in string we need to convert to JSON using parse function

        return products.find(product=>
            product.id === id
            //we need specific product so need to be equal with the one that has same id
        )
    }
    static saveCart(cart){
        localStorage.setItem('cart',JSON.stringify(cart))
    }

    //we are getting the loaded cart previouslly 
    //if the cart was laoded then ternary operator returns true (and we get loaded cart) else false (we get empty array)
    static getCart(){
        return localStorage.getItem('cart')? JSON.parse(localStorage.getItem('cart')) : []

    }
}

document.addEventListener("DOMContentLoaded",()=>{
    const ui = new UI(); //making an instance of ui
    const products = new Products();

    //we are not using any of the below dynamic values so this instance is put above
    //setup app
    ui.setupApp();

    products.getProducts().then(products =>{
        // console.log(products);
        ui.displayProducts(products); 
        Storage.saveProducts(products);
    })
    //this is going to run once UI is loaded calling previously won't work
    .then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });
});