const AUTH_SESSION_KEY = 'stockit_session';

const DEMO_ACCOUNTS = [
    {
        username: 'admin',
        email: 'admin@stockit.local',
        password: 'admin123',
        name: 'Admin User',
        role: 'Administrator'
    }
];

const STORE_KEYS = {
    products: 'stockit_products',
    sales: 'stockit_sales',
    txnCounter: 'stockit_txn_counter'
};

const SEED_PRODUCTS = [];

const LOW_STOCK_THRESHOLD = 10;

function getSession() {
    try {
        const raw = sessionStorage.getItem(AUTH_SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function setSession(session) {
    sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
}

function isLoggedIn() {
    return !!getSession();
}

function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }

    return true;
}

function redirectIfAuthenticated() {
    if (isLoggedIn()) {
        window.location.href = 'index.html';
        return true;
    }

    return false;
}

function logout() {
    clearSession();
    window.location.href = 'login.html';
}

window.addEventListener('pageshow', event => {
    if (event.persisted && document.documentElement.dataset.authMode === 'protected') {
        requireAuth();
    }
});

function initStore() {
    if (!localStorage.getItem(STORE_KEYS.products)) {
        saveProducts(SEED_PRODUCTS);
    }

    if (!localStorage.getItem(STORE_KEYS.sales)) {
        saveSales(seedSales());
    }

    if (!localStorage.getItem(STORE_KEYS.txnCounter)) {
        localStorage.setItem(STORE_KEYS.txnCounter, '1000');
    }
}

function seedSales() {
    return [];
}

function getProducts() {
    try {
        return JSON.parse(localStorage.getItem(STORE_KEYS.products)) || [];
    } catch {
        return [];
    }
}

function saveProducts(products) {
    localStorage.setItem(STORE_KEYS.products, JSON.stringify(products));
}

function getProduct(id) {
    return getProducts().find(product => product.id === Number(id)) || null;
}

function updateProductStock(id, stock) {
    const products = getProducts();
    const product = products.find(item => item.id === Number(id));

    if (!product) return false;

    product.stock = Math.max(0, Number(stock));
    saveProducts(products);

    return true;
}

function addProduct(product) {
    const products = getProducts();
    const nextId = products.length
        ? Math.max(...products.map(item => Number(item.id))) + 1
        : 1;

    const newProduct = {
        id: nextId,
        name: product.name,
        price: Number(product.price),
        stock: Math.max(0, Number(product.stock) || 0)
    };

    products.push(newProduct);
    saveProducts(products);

    return newProduct;
}

function updateProduct(id, updates) {
    const products = getProducts();
    const product = products.find(item => item.id === Number(id));

    if (!product) return false;

    if (updates.name !== undefined) product.name = updates.name;
    if (updates.price !== undefined) product.price = Number(updates.price);
    if (updates.stock !== undefined) product.stock = Math.max(0, Number(updates.stock) || 0);

    saveProducts(products);
    return true;
}

function deleteProduct(id) {
    const products = getProducts();
    const filtered = products.filter(item => item.id !== Number(id));

    if (filtered.length === products.length) return false;

    saveProducts(filtered);
    return true;
}

function getSales() {
    try {
        return JSON.parse(localStorage.getItem(STORE_KEYS.sales)) || [];
    } catch {
        return [];
    }
}

function saveSales(sales) {
    localStorage.setItem(STORE_KEYS.sales, JSON.stringify(sales));
}

function addSale(sale) {
    const sales = getSales();
    sales.unshift(sale);
    saveSales(sales);
}

function nextTxnNo() {
    let counter = Number(localStorage.getItem(STORE_KEYS.txnCounter)) || 1000;
    counter++;
    localStorage.setItem(STORE_KEYS.txnCounter, String(counter));
    return `TXN-${counter}`;
}

function peso(amount) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
    }).format(Number(amount) || 0);
}

function formatDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    return date.toLocaleString('en-PH', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
}

function isSameDay(a, b) {
    const dateA = new Date(a);
    const dateB = new Date(b);

    return (
        dateA.getFullYear() === dateB.getFullYear() &&
        dateA.getMonth() === dateB.getMonth() &&
        dateA.getDate() === dateB.getDate()
    );
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function resetDemoData() {
    localStorage.removeItem(STORE_KEYS.products);
    localStorage.removeItem(STORE_KEYS.sales);
    localStorage.removeItem(STORE_KEYS.txnCounter);
    initStore();
}

function initSidebarNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('.sidebar-nav a[href]').forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        const targetPage = href.split('/').pop();

        link.classList.toggle(
            'active',
            targetPage === currentPage
        );
    });
}

function initMobileSidebarToggle() {
    const toggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');

    if (!toggleBtn || !sidebar || !backdrop) return;

    const openSidebar = () => {
        sidebar.classList.add('open');
        backdrop.classList.add('visible');
    };

    const closeSidebar = () => {
        sidebar.classList.remove('open');
        backdrop.classList.remove('visible');
    };

    toggleBtn.addEventListener('click', () => {
        if (sidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });

    backdrop.addEventListener('click', closeSidebar);

    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', closeSidebar);
    });
}

function showModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    modal.hidden = false;
    document.body.classList.add('modal-open');
}

function hideModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    modal.hidden = true;

    if (!document.querySelector('.modal-backdrop:not([hidden])')) {
        document.body.classList.remove('modal-open');
    }
}

function bindModalHandlers() {
    document.querySelectorAll('[data-close]').forEach(button => {
        button.addEventListener('click', () => hideModal(button.dataset.close));
    });

    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', event => {
            if (event.target === backdrop) {
                hideModal(backdrop.id);
            }
        });
    });
}

function initGlobalEscapeHandler() {
    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;

        const openModal = document.querySelector('.modal-backdrop:not([hidden])');

        if (openModal) {
            hideModal(openModal.id);
        }
    });
}

function buildReceiptHTML(sale) {
    if (!sale) return '';

    const items = sale.items.map(item => `
        <tr>
            <td>${escapeHtml(item.name)} × ${item.qty}</td>
            <td>${peso(item.price * item.qty)}</td>
        </tr>
    `).join('');

    return `
        <div class="receipt">
            <div class="receipt-header">
                <h2>StockIT</h2>
                <p>Sales Receipt</p>
            </div>

            <div class="receipt-info">
                <div>
                    <span>Transaction</span>
                    <strong>${escapeHtml(sale.txnNo)}</strong>
                </div>
                <div>
                    <span>Date</span>
                    <strong>${escapeHtml(formatDate(sale.date))}</strong>
                </div>

            <table class="receipt-items">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${items}
                </tbody>
            </table>

            <div class="receipt-total">
                <span>Total</span>
                <strong>${peso(sale.total)}</strong>
            </div>

            <div class="receipt-payment">
                <div>
                    <span>Payment</span>
                    <strong>${escapeHtml(sale.payment)}</strong>
                </div>

                ${sale.payment === 'Cash' ? `
                    <div>
                        <span>Received</span>
                        <strong>${peso(sale.received)}</strong>
                    </div>
                    <div>
                        <span>Change</span>
                        <strong>${peso(sale.change)}</strong>
                    </div>
                ` : ''}

                ${sale.reference ? `
                    <div>
                        <span>Reference No.</span>
                        <strong>${escapeHtml(sale.reference)}</strong>
                    </div>
                ` : ''}
            </div>

            <div class="receipt-footer">
                <p>Thank you for your purchase.</p>
            </div>
        </div>
    `;
}

function printReceipt(sale) {
    if (!sale) return;

    const printable = document.getElementById('printableReport');

    if (!printable) return;

    printable.innerHTML = buildReceiptHTML(sale);

    window.print();
}

document.addEventListener('DOMContentLoaded', () => {
    initStore();
    initSidebarNav();
    initMobileSidebarToggle();
    initGlobalEscapeHandler();
    bindModalHandlers();
});