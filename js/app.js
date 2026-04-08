// Loads data from JSON
let cart = [];
let allProducts = [];

// Loads the products from the provided JSON.
async function loadProducts() {
    try {
        const response = await fetch('./data.json');
        allProducts = await response.json();
        renderProducts(allProducts);
    } catch (error) {
        console.error("Error loading products:", error);
    }
}

// Renders cards on the screen.
function renderProducts(products) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = products.map((product, index) => {
        const cartItem = cart.find(item => item.name === product.name);
        const isInCart = !!cartItem;

        return `
        <div class="flex flex-col">
            <div class="relative mb-8">
                <img src="${product.image.desktop}" 
                     class="rounded-xl border-2 ${isInCart ? 'border-fm-red' : 'border-transparent'} transition-all">
                
                <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 w-[160px]">
                    ${!isInCart ? `
                        <button onclick="addToCart('${product.name}')" 
                                class="flex items-center gap-2 bg-white border border-fm-rose-400 px-6 py-2.5 rounded-full font-bold text-sm hover:text-fm-red hover:border-fm-red transition-all w-full justify-center shadow-sm">
                            <img src="./assets/images/icon-add-to-cart.svg" class="w-5"> Add to Cart
                        </button>
                    ` : `
                        <div class="flex items-center justify-between bg-fm-red px-4 py-2.5 rounded-full text-white font-bold text-sm shadow-sm">
                            <button onclick="updateQuantity('${product.name}', -1)" class="border border-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-white hover:text-fm-red transition-colors">
                                <img src="./assets/images/icon-decrement-quantity.svg" class="w-3">
                            </button>
                            <span>${cartItem.quantity}</span>
                            <button onclick="updateQuantity('${product.name}', 1)" class="border border-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-white hover:text-fm-red transition-colors">
                                <img src="./assets/images/icon-increment-quantity.svg" class="w-3">
                            </button>
                        </div>
                    `}
                </div>
            </div>
            <p class="text-fm-rose-400 text-xs mb-1">${product.category}</p>
            <h3 class="font-bold text-fm-rose-900 mb-1">${product.name}</h3>
            <p class="text-fm-red font-bold">$${product.price.toFixed(2)}</p>
        </div>
        `;
    }).join('');
}

function addToCart(productName) {
    const product = allProducts.find(p => p.name === productName);
    cart.push({ ...product, quantity: 1 });
    updateUI();
}

function updateQuantity(productName, change) {
    const item = cart.find(p => p.name === productName);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(p => p.name !== productName);
        }
    }
    updateUI();
}

function removeFromCart(productName) {
    cart = cart.filter(p => p.name !== productName);
    updateUI();
}

function updateUI() {
    renderProducts(allProducts);
    renderCart();
}

function renderCart() {
    const emptyState = document.getElementById('cart-empty-state');
    const container = document.getElementById('cart-items-container');
    const cartList = document.getElementById('cart-items-list');
    const cartTitle = document.getElementById('cart-count-title');
    
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    cartTitle.innerText = `Your Cart (${totalItems})`;

    if (cart.length === 0) {
        emptyState.classList.remove('hidden');
        container.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        container.classList.remove('hidden');
        
        cartList.innerHTML = cart.map(item => `
            <div class="flex justify-between items-center py-4">
                <div>
                    <p class="font-bold text-sm text-fm-rose-900 mb-2">${item.name}</p>
                    <div class="flex gap-4">
                        <span class="text-fm-red font-bold">${item.quantity}x</span>
                        <span class="text-fm-rose-400">@ $${item.price.toFixed(2)}</span>
                        <span class="text-fm-rose-500 font-bold">$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                </div>
                <button onclick="removeFromCart('${item.name}')" class="border border-fm-rose-300 rounded-full p-1 group hover:border-fm-rose-900 transition-colors">
                    <img src="./assets/images/icon-remove-item.svg" class="w-3 filter grayscale group-hover:grayscale-0">
                </button>
            </div>
        `).join('');
        
        document.getElementById('cart-total-price').innerText = `$${totalPrice.toFixed(2)}`;
    }
}

function showConfirmationModal(cartItems, totalPrice) {
    const modal = document.getElementById('confirmation-modal');
    const modalList = document.getElementById('modal-items-list');
    const modalTotal = document.getElementById('modal-total-price');
    
    // Injects the items into the Modal's HTML
    modalList.innerHTML = cartItems.map(item => `
        <div class="flex items-center justify-between py-4 border-b border-fm-rose-100 last:border-0">
            <div class="flex items-center gap-4">
                <img src="${item.image.thumbnail}" alt="${item.name}" class="w-12 h-12 rounded-md">
                <div class="flex flex-col">
                    <span class="font-bold text-sm text-fm-rose-900 truncate w-32 md:w-40">${item.name}</span>
                    <div class="flex gap-2 text-sm">
                        <span class="text-fm-red font-bold">${item.quantity}x</span>
                        <span class="text-fm-rose-400">@ $${item.price.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            <span class="font-bold text-fm-rose-900">$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');

    // Updates the total price in the modal.
    modalTotal.innerText = `$${totalPrice.toFixed(2)}`;

    // Shows the modal and locks page scrolling.
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; 
    }
}

// Confirmation Button Event
const confirmBtn = document.getElementById('confirm-order-btn');

if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
        // Calculate the total before displaying the modal.
        const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        
        // Call the function that populates and displays the modal.
        showConfirmationModal(cart, totalPrice);
    });
}

document.getElementById('start-new-order-btn').addEventListener('click', () => {
    cart = [];
    document.getElementById('confirmation-modal').classList.add('hidden');
    document.body.style.overflow = 'auto'; 
    updateUI();
});

// Initializes
loadProducts();