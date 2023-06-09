const open_cart = document.getElementById("open");
const close_cart = document.getElementById("close");
const cart_container = document.getElementById("cart-container");

let decodedToken
if(token) {
    decodedToken = jwt_decode(token);
}

document
    .addEventListener("click", function (event) {
        if (event.target.className === "delete-from-cart-btn") {
            deleteFromCart(event.target.dataset.id);
        }
    });

function deleteFromCart(id){
    fetch(`/deleteFromCart_Fav?userId=${decodedToken.id}&product_id=${id}&is_cart=1`, {
        method: "DELETE",
    })
        .then((response) => response.json())
        .then(() => {
            fetch(`http://localhost:3000/getCart/${decodedToken?.id}`)
                .then(response => response.json())
                .then(data => loadCart(data))
                .catch(error => {
                    console.error('Произошла ошибка:', error);
                })
        })
        .catch((error) => console.error(error));
}

close_cart.addEventListener('click', () => {
    cart_container.classList.toggle('active');
});

open_cart.addEventListener('click', () => {
    cart_container.classList.toggle('active');
});


if(decodedToken !== undefined){
    const linkToCartPage = document.getElementById('linkToCartPage');
    linkToCartPage.style.display = 'block'
    fetch(`http://localhost:3000/getCart/${decodedToken?.id}`)
        .then(response => response.json())
        .then(data => loadCart(data))
        .catch(error => {
            console.error('Произошла ошибка:', error);
        });
}

function loadCart(data){
    const basketLength = document.getElementById('basketLength');
    basketLength.innerHTML = data.result.length;



    const cartBlock = document.getElementById('cart')
    if (data.result.length === 0 || data.total_price === 0) {
        cartBlock.innerHTML = "<h1>Корзина пуста</h1>";
        return;
    }

    const total_price = document.getElementById('totalPrice')
    total_price.innerHTML = `$ ${data.total_price}`;

    let cartBlockHtml = "";

    data.result.forEach(({ Id, Name, price, images }) => {
        cartBlockHtml += `
        <div class='cart-product' id="cart-product-${Id}">
            <img id="cart-product-image-${Id}" class="product-img" src="" alt="product ${Id}"/>
            <div>
                <h4 class='product-cart-name'>${Name}</h4>
                <span id='product_price-${price}' class="price">$ ${price}</span>   
            </div>
            <img src="../img/garbage.png" class="delete-from-cart-btn"  id="deleteFromCart" alt="garbage" data-id=${Id}>
        </div>`;

        fetch(`/api/cloud-img?filename=${images[0]}`)
            .then(response => response.json())
            .then(data => {
                const img = document.getElementById(`cart-product-image-${Id}`);
                img.src = data.url;
            })
            .catch(error => console.error(error));
    });

    cartBlock.innerHTML = cartBlockHtml;

}

