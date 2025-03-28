// script.js
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    updateCartDisplay();
    setupSizeSelectors();
});

// Configura os seletores de tamanho
function setupSizeSelectors() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('size-btn')) {
            const parent = e.target.closest('.size-options');
            parent.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            parent.nextElementSibling.value = e.target.dataset.size;
        }
    });
}

// Funções do Carrinho
function toggleCart() {
    document.querySelector('.cart-sidebar').classList.toggle('active');
}

function addToCart(name, price, image, size) {
    if (!size) {
        alert('Por favor selecione um tamanho!');
        return;
    }

    const existingItem = cart.find(item => 
        item.name === name && 
        item.size === size && 
        item.price === price
    );

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: Date.now(),
            name,
            price: Number(price),
            image,
            size,
            quantity: 1
        });
    }

    totalPrice += Number(price);
    updateCartDisplay();
    saveCart();
    showNotification(`"${name}" (${size}) adicionado!`);
}

function removeFromCart(event, itemId) {
    event.stopPropagation();
    const index = cart.findIndex(item => item.id === itemId);
    if (index > -1) {
        totalPrice -= cart[index].price * cart[index].quantity;
        cart.splice(index, 1);
        updateCartDisplay();
        saveCart();
        showNotification('Item removido do carrinho!');
    }
}

function updateQuantity(itemId, change) {
    const item = cart.find(item => item.id === itemId);
    if (!item) return;

    item.quantity += change;
    
    if (item.quantity < 1) {
        removeFromCart(new Event('click'), itemId);
    } else {
        totalPrice += item.price * change;
        updateCartDisplay();
        saveCart();
    }
}

// Atualização da Interface
function updateCartDisplay() {
    const cartItems = document.querySelector('.cart-items');
    const cartCount = document.querySelector('.cart-count');
    const totalElement = document.getElementById('total-price');

    // Limpa o carrinho
    cartItems.innerHTML = '';

    // Preenche os itens
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>Tamanho: ${item.size}</p>
                <p>R$ ${(item.price * item.quantity).toFixed(2)}</p>
                <div class="quantity-controls">
                    <button onclick="updateQuantity(${item.id}, -1)">−</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
            <button class="remove-item" onclick="removeFromCart(event, ${item.id})">×</button>
        `;
        cartItems.appendChild(cartItem);
    });

    // Atualiza totais
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    totalElement.textContent = totalPrice.toFixed(2);
}

// Persistência de Dados
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Notificações
function showNotification(message) {
    const notification = document.getElementById('cartNotification');
    notification.querySelector('.notification-text').textContent = message;
    notification.classList.add('active');
    setTimeout(() => notification.classList.remove('active'), 3000);
}

// Checkout
function checkout() {
    if (cart.length === 0) return alert('Seu carrinho está vazio!');

    const phone = '5562981102702'; // Seu número aqui
    const items = cart.map(item => 
        `➤ ${item.name} (Tamanho ${item.size}) - ${item.quantity}x - R$${(item.price * item.quantity).toFixed(2)}`
    ).join('%0A');

    const message = `*NOVO PEDIDO - STEPUP*%0A%0A` +
                   `${items}%0A%0A` +
                   `*Total: R$${totalPrice.toFixed(2)}*%0A%0A` +
                   `_Por favor confirme os detalhes do pedido_`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
}

// Scroll suave
function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// Fechar carrinho ao clicar fora
function setupCartClosing() {
    document.querySelector('.close-cart').addEventListener('click', toggleCart);
    document.querySelector('.cart-icon').addEventListener('click', toggleCart);
}

// Variáveis globais
let currentProduct = null;
let selectedSize = null;
let originalPrice = 0;

// Funções do modal
function openSizeModal(productElement, price) {
    currentProduct = productElement;
    originalPrice = price;
    selectedSize = null;
    
    // Popular tamanhos
    const sizeGrid = document.querySelector('.modal-size-grid');
    sizeGrid.innerHTML = '';
    
    for(let i = 33; i <= 43; i++) {
        sizeGrid.innerHTML += `
            <button data-size="${i}" onclick="selectSize(${i})">${i}</button>
        `;
    }
    
    document.getElementById('sizeModal').style.display = 'flex';
}

function closeSizeModal() {
    document.getElementById('sizeModal').style.display = 'none';
}

function selectSize(size) {
    selectedSize = size;
    document.querySelectorAll('.modal-size-grid button').forEach(btn => {
        btn.classList.remove('selected');
        if(btn.dataset.size == size) btn.classList.add('selected');
    });
}

function confirmSizeSelection() {
    if(!selectedSize) {
        alert('Por favor selecione um tamanho!');
        return;
    }
    
    const price = (selectedSize >= 40 && selectedSize <= 43) ? originalPrice + 15 : originalPrice;
    
    // Atualizar botão original
    const addButton = currentProduct.querySelector('.add-to-cart');
    addButton.dataset.size = selectedSize;
    addButton.dataset.finalPrice = price;
    
    closeSizeModal();
    addToCart(
        currentProduct.querySelector('.product-name').textContent,
        price,
        currentProduct.querySelector('img').src,
        selectedSize
    );
}
