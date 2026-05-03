// Global State
let cart = JSON.parse(localStorage.getItem('aurelia_cart')) || [];

// DOM Elements
const cartOverlay = document.getElementById('cartOverlay');
const cartDrawer = document.getElementById('cartDrawer');
const cartIcon = document.getElementById('cartIcon');
const closeCartBtn = document.getElementById('closeCart');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const cartCountElement = document.getElementById('cartCount');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initFadeInAnimations();
    initChat();
    updateCartUI();
    
    // Page specific initializations
    if (document.getElementById('productsGrid')) {
        fetchProducts();
    }
    
    if (document.getElementById('contactForm')) {
        initContactForm();
    }
    
    if (document.getElementById('checkoutForm')) {
        initCheckout();
    }

    // Cart event listeners
    if (cartIcon) {
        cartIcon.addEventListener('click', toggleCart);
    }
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', toggleCart);
    }
    if (cartOverlay) {
        cartOverlay.addEventListener('click', toggleCart);
    }
});

// --- Header Scroll ---
function initHeaderScroll() {
    const header = document.querySelector('header');
    if (!header) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('solid');
        } else {
            header.classList.remove('solid');
        }
    });
}

// --- Fade-in Animations ---
function initFadeInAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');
    if (fadeElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    fadeElements.forEach(el => observer.observe(el));
}

// --- Cart Logic ---
function toggleCart() {
    cartOverlay.classList.toggle('active');
    cartDrawer.classList.toggle('active');
}

function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart();
    updateCartUI();
    
    // Open cart automatically when adding
    if (!cartDrawer.classList.contains('active')) {
        toggleCart();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('aurelia_cart', JSON.stringify(cart));
}

function updateCartUI() {
    if (!cartCountElement || !cartItemsContainer || !cartTotalElement) return;

    // Update count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalItems;
    
    // Update items
    cartItemsContainer.innerHTML = '';
    let total = 0;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
    } else {
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>Qty: ${item.quantity}</p>
                    <span class="cart-item-remove" onclick="removeFromCart(${item.id})">Remove</span>
                </div>
                <div class="cart-item-price">$${itemTotal.toFixed(2)}</div>
            `;
            cartItemsContainer.appendChild(itemEl);
        });
    }
    
    // Update total
    cartTotalElement.textContent = `$${total.toFixed(2)}`;
    
    // Update checkout page if we are on it
    const checkoutSummary = document.getElementById('checkoutSummary');
    if (checkoutSummary) {
        renderCheckoutSummary(total);
    }
}

// --- Products Fetching (Home/Shop Page) ---
async function fetchProducts() {
    const grid = document.getElementById('productsGrid');
    try {
        const response = await fetch('/products');
        const products = await response.json();
        
        grid.innerHTML = '';
        products.forEach((p, index) => {
            const delay = index * 0.1;
            const card = document.createElement('div');
            card.className = 'product-card fade-in';
            card.style.transitionDelay = `${delay}s`;
            card.innerHTML = `
                <div class="product-img">
                    <img src="${p.imageURL}" alt="${p.name}">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${p.name}</h3>
                    <p class="product-price">$${p.price.toFixed(2)}</p>
                    <button class="add-to-cart-btn" onclick='addToCart(${JSON.stringify(p)})'>Add to Cart</button>
                </div>
            `;
            grid.appendChild(card);
            
            // Trigger animation
            setTimeout(() => card.classList.add('appear'), 100);
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        grid.innerHTML = '<p>Error loading collection.</p>';
    }
}

// --- Chat Logic ---
function initChat() {
    const chatFab = document.getElementById('chatFab');
    const chatWindow = document.getElementById('chatWindow');
    const closeChat = document.getElementById('closeChat');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');

    if (!chatFab || !chatWindow) return;

    chatFab.addEventListener('click', () => {
        chatWindow.classList.add('active');
    });

    closeChat.addEventListener('click', () => {
        chatWindow.classList.remove('active');
    });

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = chatInput.value.trim();
        if (!msg) return;

        // Add user message
        appendMessage(msg, 'user');
        chatInput.value = '';

        // Fetch bot reply
        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg })
            });
            const data = await response.json();
            appendMessage(data.reply, 'bot');
        } catch (error) {
            console.error('Chat error:', error);
            appendMessage("I'm sorry, I am currently unavailable. Please try again later.", 'bot');
        }
    });

    function appendMessage(text, sender) {
        const msgEl = document.createElement('div');
        msgEl.className = `message ${sender}`;
        msgEl.textContent = text;
        chatMessages.appendChild(msgEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// --- Contact Form Logic ---
function initContactForm() {
    const form = document.getElementById('contactForm');
    const statusMsg = document.getElementById('contactStatus');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            inquiry: document.getElementById('inquiry').value
        };

        try {
            const response = await fetch('/contact-submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            statusMsg.textContent = data.message;
            statusMsg.style.color = "green";
            form.reset();
        } catch (error) {
            statusMsg.textContent = "Error submitting inquiry.";
            statusMsg.style.color = "red";
        }
    });
}

// --- Checkout Logic ---
function initCheckout() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    renderCheckoutSummary(total);

    const form = document.getElementById('checkoutForm');
    const loader = document.getElementById('checkoutLoader');
    const content = document.getElementById('checkoutContent');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (cart.length === 0) {
            alert('Your cart is empty.');
            return;
        }

        // Show loader
        content.style.display = 'none';
        loader.classList.add('active');

        try {
            const response = await fetch('/process-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart,
                    total: total
                })
            });
            const data = await response.json();
            
            // Clear cart
            cart = [];
            saveCart();
            updateCartUI();

            // Show success
            loader.innerHTML = `<h3>${data.message}</h3><br><a href="/" class="btn">Return Home</a>`;
        } catch (error) {
            console.error('Checkout error:', error);
            loader.classList.remove('active');
            content.style.display = 'block';
            alert('Payment processing failed.');
        }
    });
}

function renderCheckoutSummary(total) {
    const summaryEl = document.getElementById('checkoutSummary');
    if (!summaryEl) return;
    
    if (cart.length === 0) {
        summaryEl.innerHTML = '<p>Your cart is empty.</p>';
    } else {
        let html = '<ul>';
        cart.forEach(item => {
            html += `<li style="display:flex;justify-content:space-between;margin-bottom:0.5rem;">
                <span>${item.name} x ${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </li>`;
        });
        html += '</ul>';
        html += `<hr style="margin:1rem 0;border-color:#ddd;">`;
        html += `<div style="display:flex;justify-content:space-between;font-weight:bold;font-size:1.2rem;">
            <span>Total</span>
            <span>$${total.toFixed(2)}</span>
        </div>`;
        summaryEl.innerHTML = html;
    }
}
