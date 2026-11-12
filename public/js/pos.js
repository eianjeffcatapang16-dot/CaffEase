let currentOrder = [];
let currentBranch = 'lumangbayan';
let currentCategory = 'Coffee';
let currentUser = null;
let currentUserRole = null;

let currentQuantity = 1;
let selectedProduct = null;
let selectedSize = 'XL';
let selectedAddons = [];
let selectedPaymentMethod = null;

let menuData = {};
let users = [];
let orderHistory = [];

let salesChart = null;

let activeMenuSort = 'default';
let activeSizeFilter = 'all';

/* =====================================================
   MANUAL LOCAL MENU IMAGES
   No online image links.
   Ilagay mo ang actual image files sa folder na: images
   Example path na gagamitin ng system: images/matcha.png

   Sa Laravel, recommended location:
   public/images/matcha.png
===================================================== */

const MENU_IMAGE_FOLDER = '/images/';

function localImage(filename) {
    return `${MENU_IMAGE_FOLDER}${filename}`;
}

const MENU_IMAGE_LIBRARY = {
    Coffee: [
        localImage('CAFE MOCHA.png'),
        localImage('CARAMEL MACCHIATO.png'),
        localImage('FRENCH VANILLA.png'),
        localImage('HAZEL NUT.png'),
        localImage('SPANISH LATTE.png'),
        localImage('WHITE CHOCOLATE.png'),
        localImage('MATCHA LATTE.png')
    ],  

    Frappe: [
        localImage('CHOCO BERRY.png'),
        localImage('CHOCO LATTE.png'),
        localImage('MATCHA BERRY.png'),
        localImage('STRAWBERRY ESPRESSO.png'),
        localImage('STRAWBERRY LATTE.png')
    ],

    MilkTea: [
        localImage('CHOCOLATE MILKTEA.png'),
        localImage('HOKKAIDO MILKTEA.png'),
        localImage('OKINAWA MILKTEA.png'),
        localImage('WINTERMELON MILKTEA.png'),
        localImage('BLACK FOREST MILKTEA.png'),
        localImage('COOKIES N CREAM MILKTEA.png'),
        localImage('RED VELVET MILKTEA.png'),
        localImage('TARO MILKTEA.png')
    ],

    'Non-Coffee': [
        localImage('DIRTY MATCHA.png'),
        localImage('MATCHA LATTE.png'),
        localImage('CHOCOLATE MILKTEA.png')
    ],

    Juice: [
        localImage('MANGO LATTE.png'),
        localImage('STRAWBERRY LATTE.png')
    ]
};

const SPECIFIC_MENU_IMAGES = [
    {
        keywords: ['mocha', 'cafe mocha'],
        image: localImage('CAFE MOCHA.png')
    },
    {
        keywords: ['caramel macchiato'],
        image: localImage('CARAMEL MACCHIATO.png')
    },
    {
        keywords: ['choco berry'],
        image: localImage('CHOCO BERRY.png')
    },
    {
        keywords: ['choco latte'],
        image: localImage('CHOCO LATTE.png')
    },
    {
        keywords: ['chocolate milktea'],
        image: localImage('CHOCOLATE MILKTEA.png')
    },
    {
        keywords: ['dirty matcha'],
        image: localImage('DIRTY MATCHA.png')
    },
    {
        keywords: ['french vanilla'],
        image: localImage('FRENCH VANILLA.png')
    },
    {
        keywords: ['hazel nut'],
        image: localImage('HAZEL NUT.png')
    },
    {
        keywords: ['hokkaido'],
        image: localImage('HOKKAIDO MILKTEA.png')
    },
    {
        keywords: ['mango latte'],
        image: localImage('MANGO LATTE.png')
    },
    {
        keywords: ['matcha berry'],
        image: localImage('MATCHA BERRY.png')
    },
    {
        keywords: ['matcha latte'],
        image: localImage('MATCHA LATTE.png')
    },
    {
        keywords: ['okinawa'],
        image: localImage('OKINAWA MILKTEA.png')
    },
    {
        keywords: ['salted caramel'],
        image: localImage('SALTED CARAMEL.png')
    },
    {
        keywords: ['spanish latte'],
        image: localImage('SPANISH LATTE.png')
    },
    {
        keywords: ['strawberry espresso'],
        image: localImage('STRAWBERRY ESPRESSO.png')
    },
    {
        keywords: ['strawberry latte'],
        image: localImage('STRAWBERRY LATTE.png')
    },
    {
        keywords: ['white chocolate'],
        image: localImage('WHITE CHOCOLATE.png')
    },
    {
        keywords: ['wintermelon'],
        image: localImage('WINTERMELON MILKTEA.png')
    },
    {
        keywords: ['black forest'],
        image: localImage('BLACK FOREST MILKTEA.png')
    },
    {
        keywords: ['cookies n cream', 'cookies and cream'],
        image: localImage('COOKIES N CREAM MILKTEA.png')
    },
    {
        keywords: ['red velvet'],
        image: localImage('RED VELVET MILKTEA.png')
    },
    {
        keywords: ['taro'],
        image: localImage('TARO MILKTEA.png')
    }
];

// ---------- HELPERS ----------
function getCsrfToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : '';
}

async function jsonFetch(url, options = {}) {
    const method = (options.method || 'GET').toUpperCase();

    const defaultHeaders = { 'Accept': 'application/json' };

    if (method !== 'GET' && method !== 'HEAD') {
        defaultHeaders['X-CSRF-TOKEN'] = getCsrfToken();

        if (!options.body || typeof options.body === 'string') {
            defaultHeaders['Content-Type'] = 'application/json';
        }
    }

    let resp = await fetch(url, {
        credentials: 'same-origin',
        ...options,
        headers: {
            ...defaultHeaders,
            ...(options.headers || {})
        }
    });

    // 🛡️ CSRF Fix: If 419 (Token Mismatch), refresh token and retry ONCE
    if (resp.status === 419) {
        console.warn('CSRF token mismatch (419). Attempting to refresh token...');
        try {
            const refreshResp = await fetch('/refresh-csrf');
            const refreshData = await refreshResp.json();
            
            if (refreshData && refreshData.token) {
                // Update meta tag
                const meta = document.querySelector('meta[name="csrf-token"]');
                if (meta) meta.setAttribute('content', refreshData.token);
                
                // Retry with new token
                defaultHeaders['X-CSRF-TOKEN'] = refreshData.token;
                resp = await fetch(url, {
                    credentials: 'same-origin',
                    ...options,
                    headers: {
                        ...defaultHeaders,
                        ...(options.headers || {})
                    }
                });
            }
        } catch (err) {
            console.error('Failed to auto-refresh CSRF token:', err);
        }
    }

    let data = null;

    try {
        data = await resp.json();
    } catch (e) {}

    if (!resp.ok) {
        const msg = data?.message || data?.error || 'Request failed';
        throw new Error(msg);
    }

    return data;
}

function capitalize(s) {
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function showNotification(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) {
        if (type === 'error') alert(message);
        return;
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';

    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${icon}"></i>
        </div>
        <div class="toast-content" style="flex-grow:1;">
            ${message}
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function normalizeText(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function hashString(value) {
    let hash = 0;
    const text = String(value || '');

    for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) - hash) + text.charCodeAt(i);
        hash = hash & hash;
    }

    return Math.abs(hash);
}

function getImageCategory(item) {
    const category = item?.category || currentCategory || 'Coffee';

    if (MENU_IMAGE_LIBRARY[category]) {
        return category;
    }

    return 'Coffee';
}

function getManualImageUrl(item) {
    const itemText = normalizeText(`${item?.name || ''} ${item?.category || ''}`);

    for (const data of SPECIFIC_MENU_IMAGES) {
        const matched = data.keywords.some(keyword => {
            return itemText.includes(normalizeText(keyword));
        });

        if (matched) {
            return data.image;
        }
    }

    const category = getImageCategory(item);
    const images = MENU_IMAGE_LIBRARY[category] || MENU_IMAGE_LIBRARY.Coffee;

    const uniqueKey = `${item?.name || ''}-${item?.category || ''}`;
    const index = hashString(uniqueKey) % images.length;

    return images[index];
}

function getSizeOptions(item) {
    const prices = item?.prices || {};
    const keys = Object.keys(prices);

    if (!keys.length) return ['Regular'];

    return keys;
}

function getDefaultSize(item) {
    const sizes = getSizeOptions(item);

    if (sizes.includes('XL')) return 'XL';
    if (sizes.includes('Large')) return 'Large';
    if (sizes.includes('L')) return 'L';
    if (sizes.includes('Medium')) return 'Medium';
    if (sizes.includes('M')) return 'M';
    if (sizes.includes('Small')) return 'Small';
    if (sizes.includes('MIX')) return 'MIX';
    if (sizes.includes('Mix')) return 'Mix';

    return sizes[0];
}

function getPriceBySize(item, size) {
    const prices = item?.prices || {};
    const sizes = Object.keys(prices);

    if (prices[size] !== undefined) {
        return Number(prices[size]) || 0;
    }

    if (!sizes.length) return 0;

    return Number(prices[sizes[0]]) || 0;
}

function getDisplayPrice(item) {
    return getPriceBySize(item, getDefaultSize(item));
}

function getDisplaySize(item) {
    return getDefaultSize(item);
}

function getProductIcon(category) {
    if (category === 'Coffee') return '<i class="fas fa-mug-hot"></i>';
    if (category === 'Frappe') return '<i class="fas fa-glass-whiskey"></i>';
    if (category === 'MilkTea') return '<i class="fas fa-cup-togo"></i>';
    if (category === 'Non-Coffee') return '<i class="fas fa-coffee"></i>';
    if (category === 'Juice') return '<i class="fas fa-wine-glass-alt"></i>';
    if (category === 'Snack') return '<i class="fas fa-cookie-bite"></i>';
    if (category === 'Rice') return '<i class="fas fa-utensils"></i>';
    if (category === 'Dessert') return '<i class="fas fa-ice-cream"></i>';

    return '<i class="fas fa-utensils"></i>';
}

function isOnlineImagePath(value) {
    return /^https?:\/\//i.test(String(value || ''));
}

function getProductManualImage(item) {
    return getManualImageUrl(item);
}

function getProductImageHtml(item) {
    const imageSrc = getProductManualImage(item);

    return `
        <img 
            src="${escapeHtml(imageSrc)}" 
            alt="${escapeHtml(item?.name || 'Menu item')}"
            loading="lazy"
            onerror="this.style.display='none'"
        >
    `;
}

function getDefaultDescription(item) {
    if (item.description) return item.description;

    if (item.category === 'Coffee') {
        return 'Freshly brewed coffee with rich flavor and smooth aroma.';
    }

    if (item.category === 'Frappe') {
        return 'Blended iced drink with creamy texture and sweet flavor.';
    }

    if (item.category === 'MilkTea') {
        return 'Refreshing milk tea prepared with a smooth and sweet blend.';
    }

    if (item.category === 'Non-Coffee') {
        return 'Creamy non-coffee drink perfect for a light refreshment.';
    }

    if (item.category === 'Juice') {
        return 'Refreshing fruit-based drink served cold and fresh.';
    }

    if (item.category === 'Snack') {
        return 'Light snack best paired with your favorite drink.';
    }

    if (item.category === 'Rice') {
        return 'Filling rice meal prepared for a satisfying food choice.';
    }

    if (item.category === 'Dessert') {
        return 'Sweet dessert perfect after meals or drinks.';
    }

    return 'Freshly prepared menu item.';
}

function getCurrentSearchTerm() {
    const searchInput = document.getElementById('modernMenuSearch');
    return searchInput ? searchInput.value.trim().toLowerCase() : '';
}

// ===============================
// MODERN TOPBAR
// ===============================
function createModernTopbar() {
    if (document.getElementById('modernTopbar')) {
        updateModernTopbarUser();
        return;
    }

    const mainContentArea = document.querySelector('.main-content-area');

    if (!mainContentArea) return;

    const topbar = document.createElement('div');
    topbar.id = 'modernTopbar';
    topbar.className = 'modern-topbar';

    topbar.innerHTML = `
        <div class="topbar-brand">
            <span>CaffEase</span>
        </div>

        <div class="topbar-search-wrap">
            <i class="fas fa-search"></i>
            <input 
                type="text" 
                id="modernMenuSearch" 
                class="topbar-search" 
                placeholder="Search menu..."
            >
        </div>

        <div class="topbar-filter-wrap">
            <button type="button" class="topbar-filter" id="modernFilterBtn">
                <i class="fas fa-sliders-h"></i>
                Filter
            </button>

            <div class="filter-dropdown" id="filterDropdown">
                <div class="filter-title">Sort by Price</div>
                <div class="filter-chip-group">
                    <button type="button" class="filter-chip active" data-sort="default">Default</button>
                    <button type="button" class="filter-chip" data-sort="low-high">Low - High</button>
                    <button type="button" class="filter-chip" data-sort="high-low">High - Low</button>
                </div>

                <div class="filter-title" style="margin-top:14px;">Filter by Size</div>
                <div class="filter-chip-group">
                    <button type="button" class="filter-chip active" data-size-filter="all">All</button>
                    <button type="button" class="filter-chip" data-size-filter="Small">Small</button>
                    <button type="button" class="filter-chip" data-size-filter="Medium">Medium</button>
                    <button type="button" class="filter-chip" data-size-filter="Large">Large</button>
                    <button type="button" class="filter-chip" data-size-filter="M">M</button>
                    <button type="button" class="filter-chip" data-size-filter="L">L</button>
                    <button type="button" class="filter-chip" data-size-filter="XL">XL</button>
                    <button type="button" class="filter-chip" data-size-filter="MIX">MIX</button>
                </div>

                <button type="button" class="filter-reset" id="resetMenuFilter">
                    Reset Filter
                </button>
            </div>
        </div>

        <div class="topbar-profile">
            <div class="topbar-profile-avatar" id="topbarAvatar">
                ${currentUser ? currentUser.charAt(0).toUpperCase() : 'U'}
            </div>

            <div class="topbar-profile-text">
                <div class="topbar-profile-name" id="topbarName">
                    ${currentUser || 'User'}
                </div>

                <div class="topbar-profile-role" id="topbarRole">
                    ${currentUserRole || 'Role'}
                </div>
            </div>

            <i class="fas fa-ellipsis-v topbar-dots"></i>
        </div>
    `;

    mainContentArea.insertBefore(topbar, mainContentArea.firstChild);

    const searchInput = document.getElementById('modernMenuSearch');

    searchInput?.addEventListener('input', function () {
        renderMenu(this.value.trim().toLowerCase());
    });

    const filterBtn = document.getElementById('modernFilterBtn');
    const filterDropdown = document.getElementById('filterDropdown');

    filterBtn?.addEventListener('click', function (e) {
        e.stopPropagation();
        filterDropdown?.classList.toggle('show');
    });

    filterDropdown?.addEventListener('click', function (e) {
        e.stopPropagation();
    });

    document.querySelectorAll('[data-sort]').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('[data-sort]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            activeMenuSort = this.dataset.sort || 'default';
            renderMenu(getCurrentSearchTerm());
        });
    });

    document.querySelectorAll('[data-size-filter]').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('[data-size-filter]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            activeSizeFilter = this.dataset.sizeFilter || 'all';
            renderMenu(getCurrentSearchTerm());
        });
    });

    document.getElementById('resetMenuFilter')?.addEventListener('click', function () {
        activeMenuSort = 'default';
        activeSizeFilter = 'all';

        document.querySelectorAll('[data-sort]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.sort === 'default');
        });

        document.querySelectorAll('[data-size-filter]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.sizeFilter === 'all');
        });

        renderMenu(getCurrentSearchTerm());
    });

    document.addEventListener('click', function () {
        filterDropdown?.classList.remove('show');
    });

    updateModernTopbarUser();
}

function updateModernTopbarUser() {
    const avatar = document.getElementById('topbarAvatar');
    const name = document.getElementById('topbarName');
    const role = document.getElementById('topbarRole');

    if (avatar) {
        avatar.textContent = currentUser ? currentUser.charAt(0).toUpperCase() : 'U';
    }

    if (name) {
        name.textContent = currentUser || 'User';
    }

    if (role) {
        role.textContent = currentUserRole ? capitalize(currentUserRole) : 'Role';
    }
}

function clearModernSearch() {
    const searchInput = document.getElementById('modernMenuSearch');

    if (searchInput) {
        searchInput.value = '';
    }
}

// ===============================
// SIDEBAR LOGOUT
// ===============================
function createSidebarLogout() {
    if (document.getElementById('sidebarLogoutArea')) {
        updateSidebarLogoutUser();
        return;
    }

    const sidebar = document.querySelector('.sidebar');

    if (!sidebar) return;

    const sidebarBottom = document.createElement('div');
    sidebarBottom.id = 'sidebarLogoutArea';
    sidebarBottom.className = 'sidebar-bottom';

    sidebarBottom.innerHTML = `
        <div class="sidebar-user-mini">
            <div class="sidebar-user-avatar" id="sidebarUserAvatar">
                ${currentUser ? currentUser.charAt(0).toUpperCase() : 'U'}
            </div>

            <div class="sidebar-user-text">
                <div class="sidebar-user-name" id="sidebarUserName">
                    ${currentUser || 'User'}
                </div>
                <div class="sidebar-user-role" id="sidebarUserRole">
                    ${currentUserRole || 'Role'}
                </div>
            </div>
        </div>

        <button type="button" class="sidebar-logout-btn" id="sidebarLogoutBtn">
            <i class="fas fa-sign-out-alt"></i>
            Logout
        </button>
    `;

    sidebar.appendChild(sidebarBottom);

    document.getElementById('sidebarLogoutBtn')?.addEventListener('click', async () => {
        await logout();
    });

    updateSidebarLogoutUser();
}

function updateSidebarLogoutUser() {
    const avatar = document.getElementById('sidebarUserAvatar');
    const name = document.getElementById('sidebarUserName');
    const role = document.getElementById('sidebarUserRole');

    if (avatar) {
        avatar.textContent = currentUser ? currentUser.charAt(0).toUpperCase() : 'U';
    }

    if (name) {
        name.textContent = currentUser || 'User';
    }

    if (role) {
        role.textContent = currentUserRole ? capitalize(currentUserRole) : 'Role';
    }
}

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', () => {
    initPOS();
});

async function initPOS() {
    setupEventListeners();
    setupCharts();

    const authUser = await checkAuthStatus();

    if (authUser) {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('posSystem').style.display = 'block';

        createModernTopbar();
        createSidebarLogout();

        updateUserDisplay();
        updateNavigationAccess();
        updateModernTopbarUser();
        updateSidebarLogoutUser();

        await loadMenuData();
        await loadUsersData();
        await loadOrderHistoryData();
        await updateDashboard();
    } else {
        document.getElementById('loginContainer').style.display = 'flex';
        document.getElementById('posSystem').style.display = 'none';
        showPositionSelection();
    }
}

// ===============================
// AUTH
// ===============================
async function checkAuthStatus() {
    try {
        const data = await jsonFetch('/check-auth');

        if (data.authenticated && data.user) {
            currentUser = data.user.username;
            currentUserRole = data.user.role;
            currentBranch = data.user.branch || 'lumangbayan';

            const hb = document.getElementById('headerBranch');

            if (hb) {
                hb.textContent = `${capitalize(currentBranch)} Branch`;
            }

            return data.user;
        }

        currentUser = null;
        currentUserRole = null;
        return null;
    } catch (err) {
        console.error('checkAuth error:', err);

        currentUser = null;
        currentUserRole = null;
        return null;
    }
}

async function login(role) {
    let username;
    let password;

    if (role === 'cashier') {
        username = document.getElementById('cashierUsername').value.trim();
        password = document.getElementById('cashierPassword').value;
    } else if (role === 'manager') {
        username = document.getElementById('managerUsername').value.trim();
        password = document.getElementById('managerPassword').value;
    } else if (role === 'admin') {
        username = document.getElementById('adminUsername').value.trim();
        password = document.getElementById('adminPassword').value;
    }

    if (!username || !password) {
        alert('Please enter both username and password.');
        return;
    }

    const payload = { username, password, role };

    try {
        const data = await jsonFetch('/login', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (data.status !== 'success') {
            alert(data.message || 'Login failed.');
            return;
        }

        const user = data.user;

        currentUser = user.username;
        currentUserRole = user.role;
        currentBranch = user.branch || 'lumangbayan';

        const hb = document.getElementById('headerBranch');

        if (hb) {
            hb.textContent = `${capitalize(currentBranch)} Branch`;
        }

        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('posSystem').style.display = 'block';

        createModernTopbar();
        createSidebarLogout();

        updateUserDisplay();
        updateNavigationAccess();
        updateModernTopbarUser();
        updateSidebarLogoutUser();

        await loadMenuData();
        await loadUsersData();
        await loadOrderHistoryData();
        await updateDashboard();

    } catch (err) {
        console.error('login error:', err);
        alert(err.message || 'Login failed.');
    }
}

async function logout() {
    try {
        await jsonFetch('/logout', { method: 'POST' });
    } catch (err) {
        console.warn('logout warning:', err);
    }

    currentUser = null;
    currentUserRole = null;
    window.currentBranchView = null;

    document.getElementById('posSystem').style.display = 'none';
    document.getElementById('loginContainer').style.display = 'flex';

    showPositionSelection();

    const hb = document.getElementById('headerBranch');

    if (hb) {
        hb.textContent = 'Lumangbayan Branch';
    }

    updateModernTopbarUser();
    updateSidebarLogoutUser();
}

function showLoginScreen(position) {
    const positionSelection = document.getElementById('positionSelection');
    const cashierLogin = document.getElementById('cashierLogin');
    const managerLogin = document.getElementById('managerLogin');
    const adminLogin = document.getElementById('adminLogin');

    positionSelection.style.display = 'none';

    [cashierLogin, managerLogin, adminLogin].forEach(el => {
        el.style.display = 'none';
    });

    if (position === 'cashier') {
        cashierLogin.style.display = 'block';
    }

    if (position === 'manager') {
        managerLogin.style.display = 'block';
    }

    if (position === 'admin') {
        adminLogin.style.display = 'block';
    }
}

function showPositionSelection() {
    const positionSelection = document.getElementById('positionSelection');
    const cashierLogin = document.getElementById('cashierLogin');
    const managerLogin = document.getElementById('managerLogin');
    const adminLogin = document.getElementById('adminLogin');

    positionSelection.style.display = 'block';

    [cashierLogin, managerLogin, adminLogin].forEach(el => {
        el.style.display = 'none';
    });
}

function updateUserDisplay() {
    const userAvatar = document.getElementById('userAvatar');

    if (!userAvatar || !currentUser) return;

    userAvatar.textContent = currentUser.charAt(0).toUpperCase();
    userAvatar.title = `${(currentUserRole || '').toUpperCase()} - ${currentUser}`;
}

function updateNavigationAccess() {
    const posTab = document.querySelector('[data-section="pos-section"]');
    const dashboardTab = document.getElementById('dashboardTab');
    const userManagementTab = document.getElementById('userManagementTab');
    const orderHistoryTab = document.getElementById('orderHistoryTab');

    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.style.display = 'none';
        tab.classList.remove('active');
    });

    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });

    const hideIfExists = id => {
        const el = document.getElementById(id);

        if (el) {
            el.style.display = 'none';
        }
    };

    hideIfExists('dashboardBranchSelectWrapper');
    hideIfExists('usersBranchSelectWrapper');
    hideIfExists('ordersBranchSelectWrapper');

    if (currentUserRole === 'cashier') {
        if (posTab) {
            posTab.style.display = 'flex';
            posTab.classList.add('active');
        }

        document.getElementById('pos-section')?.classList.add('active');

        if (orderHistoryTab) {
            orderHistoryTab.style.display = 'flex';
        }

        return;
    }

    if (currentUserRole === 'manager') {
        if (dashboardTab) {
            dashboardTab.style.display = 'flex';
            dashboardTab.classList.add('active');
        }

        if (userManagementTab) {
            userManagementTab.style.display = 'flex';
        }

        if (orderHistoryTab) {
            orderHistoryTab.style.display = 'flex';
        }

        document.getElementById('dashboard-section')?.classList.add('active');

        const dashboardBranchSelectWrapper = document.getElementById('dashboardBranchSelectWrapper');
        const usersBranchSelectWrapper = document.getElementById('usersBranchSelectWrapper');
        const ordersBranchSelectWrapper = document.getElementById('ordersBranchSelectWrapper');

        if (dashboardBranchSelectWrapper) dashboardBranchSelectWrapper.style.display = 'block';
        if (usersBranchSelectWrapper) usersBranchSelectWrapper.style.display = 'block';
        if (ordersBranchSelectWrapper) ordersBranchSelectWrapper.style.display = 'block';

        return;
    }

    if (currentUserRole === 'admin') {
        if (dashboardTab) {
            dashboardTab.style.display = 'flex';
            dashboardTab.classList.add('active');
        }

        if (userManagementTab) {
            userManagementTab.style.display = 'flex';
        }

        if (orderHistoryTab) {
            orderHistoryTab.style.display = 'flex';
        }

        document.getElementById('dashboard-section')?.classList.add('active');
    }
}

// ===============================
// EVENT LISTENERS
// ===============================
function setupEventListeners() {
    document.querySelectorAll('.position-option').forEach(opt => {
        opt.addEventListener('click', () => {
            const pos = opt.dataset.position;
            showLoginScreen(pos);
        });
    });

    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showPositionSelection();
        });
    });

    document.getElementById('cashierLoginBtn')?.addEventListener('click', () => login('cashier'));
    document.getElementById('managerLoginBtn')?.addEventListener('click', () => login('manager'));
    document.getElementById('adminLoginBtn')?.addEventListener('click', () => login('admin'));

    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', async () => {
            if (!currentUser) {
                alert('Please login first.');
                return;
            }

            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const sectionId = tab.dataset.section;

            document.querySelectorAll('.content-section').forEach(sec => {
                sec.classList.remove('active');
            });

            document.getElementById(sectionId)?.classList.add('active');

            clearModernSearch();

            if (sectionId === 'user-management-section') {
                await loadUsersData();
            } else if (sectionId === 'order-history-section') {
                await loadOrderHistoryData();
            } else if (sectionId === 'dashboard-section') {
                await updateDashboard();
            } else if (sectionId === 'pos-section') {
                renderMenu();
            }
        });
    });

    document.getElementById('searchOrders')?.addEventListener('click', () => {
        const term = (document.getElementById('orderSearch')?.value || '').trim();
        loadOrderHistoryData(term);
    });

    document.getElementById('searchUsers')?.addEventListener('click', () => {
        const term = (document.getElementById('userSearch')?.value || '').trim();
        loadUsersData(term);
    });

    ['dashboardBranchSelect', 'usersBranchSelect', 'ordersBranchSelect'].forEach(id => {
        const el = document.getElementById(id);

        if (!el) return;

        el.addEventListener('change', async () => {
            window.currentBranchView = el.value;

            await updateDashboard();
            await loadUsersData();
            await loadOrderHistoryData();
            await loadMenuData();
        });
    });

    document.getElementById('addUser')?.addEventListener('click', () => {
        if (currentUserRole === 'manager') {
            resetUserForm();
            document.getElementById('addUserModal').style.display = 'flex';
        } else {
            alert('Only managers can add users.');
        }
    });

    document.getElementById('clearOrder')?.addEventListener('click', () => {
        if (!currentOrder.length) return;

        if (confirm('Clear current order?')) {
            currentOrder = [];
            updateOrderDisplay();
            updateOrderSummary();
        }
    });

    document.getElementById('checkoutBtn')?.addEventListener('click', () => {
        if (currentOrder.length === 0) {
            alert('Please add items to the order before checking out.');
            return;
        }

        const paymentModal = document.getElementById('paymentModal');

        paymentModal.style.display = 'flex';
        selectedPaymentMethod = null;

        document.querySelectorAll('.payment-option').forEach(o => {
            o.classList.remove('selected');
        });

        document.querySelectorAll('.payment-details').forEach(d => {
            d.style.display = 'none';
        });

        const cashAmountInput = document.getElementById('cashAmount');

        if (cashAmountInput) {
            cashAmountInput.value = '';
        }

        const cashChangeDiv = document.getElementById('cashChange');

        if (cashChangeDiv) {
            cashChangeDiv.textContent = '';
        }
    });

    document.querySelectorAll('.payment-option').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.payment-option').forEach(o => {
                o.classList.remove('selected');
            });

            opt.classList.add('selected');

            selectedPaymentMethod = opt.dataset.method;

            document.querySelectorAll('.payment-details').forEach(d => {
                d.style.display = 'none';
            });

            const details = document.getElementById(`${selectedPaymentMethod}Details`);

            if (details) {
                details.style.display = 'block';
            }

            if (selectedPaymentMethod === 'cash') {
                setupCashPayment();
            }
        });
    });

    document.getElementById('cashAmount')?.addEventListener('input', calculateChange);

    document.getElementById('processPayment')?.addEventListener('click', () => {
        processPayment();
    });

    document.getElementById('closePaymentModal')?.addEventListener('click', () => {
        document.getElementById('paymentModal').style.display = 'none';
    });

    document.getElementById('closeReceipt')?.addEventListener('click', () => {
        document.getElementById('receiptModal').style.display = 'none';

        currentOrder = [];

        updateOrderDisplay();
        updateOrderSummary();
    });

    document.getElementById('closeViewReceipt')?.addEventListener('click', () => {
        document.getElementById('viewReceiptModal').style.display = 'none';
    });

    const addOrderModal = document.getElementById('addOrderModal');
    const decreaseQty = document.getElementById('decreaseQty');
    const increaseQty = document.getElementById('increaseQty');
    const quantityDisplay = document.getElementById('quantityDisplay');

    addOrderModal?.addEventListener('click', e => {
        if (e.target === addOrderModal) {
            addOrderModal.style.display = 'none';
            resetAddOrderModal();
        }
    });

    decreaseQty?.addEventListener('click', () => {
        if (currentQuantity > 1) {
            currentQuantity--;
            quantityDisplay.textContent = currentQuantity;
            updateProductPrice();
        }
    });

    increaseQty?.addEventListener('click', () => {
        currentQuantity++;
        quantityDisplay.textContent = currentQuantity;
        updateProductPrice();
    });

    document.getElementById('cancelAddOrder')?.addEventListener('click', () => {
        addOrderModal.style.display = 'none';
        resetAddOrderModal();
    });

    document.getElementById('addToOrderBtn')?.addEventListener('click', () => {
        addSelectedProductToOrder();
    });

    const userModal = document.getElementById('addUserModal');

    userModal?.addEventListener('click', e => {
        if (e.target === userModal) {
            userModal.style.display = 'none';
        }
    });

    document.getElementById('cancelUser')?.addEventListener('click', () => {
        userModal.style.display = 'none';
    });

    document.getElementById('saveUser')?.addEventListener('click', saveUserAccount);

    const editUserModal = document.getElementById('editUserModal');

    editUserModal?.addEventListener('click', e => {
        if (e.target === editUserModal) {
            editUserModal.style.display = 'none';
        }
    });

    document.getElementById('cancelEditUser')?.addEventListener('click', () => {
        document.getElementById('editUserModal').style.display = 'none';
    });

    document.getElementById('saveEditUser')?.addEventListener('click', saveEditedUser);

    const userAvatar = document.getElementById('userAvatar');
    const userDropdown = document.getElementById('userDropdown');

    userAvatar?.addEventListener('click', () => {
        userDropdown?.classList.toggle('show');
    });

    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        userDropdown?.classList.remove('show');
        await logout();
    });

    const receiptModal = document.getElementById('receiptModal');
    const viewReceiptModal = document.getElementById('viewReceiptModal');

    receiptModal?.addEventListener('click', e => {
        if (e.target === receiptModal) {
            receiptModal.style.display = 'none';
        }
    });

    viewReceiptModal?.addEventListener('click', e => {
        if (e.target === viewReceiptModal) {
            viewReceiptModal.style.display = 'none';
        }
    });

    document.getElementById('generateReport')?.addEventListener('click', () => {
        alert('Report generation is not implemented yet.');
    });
}

// ===============================
// MENU
// ===============================
async function loadMenuData() {
    try {
        let branchToUse = currentBranch;

        if (currentUserRole === 'manager' && window.currentBranchView) {
            branchToUse = window.currentBranchView;
        }

        const data = await jsonFetch(`/menu?branch=${encodeURIComponent(branchToUse)}`);

        menuData = data || {};

        const categories = Object.keys(menuData[branchToUse] || {});
        currentCategory = categories[0] || '';

        clearModernSearch();
        renderCategoryTabs();
        renderMenu();
    } catch (err) {
        console.error('Failed to load menu:', err);
        menuData = {};
    }
}

function renderCategoryTabs() {
    const categoryTabs = document.getElementById('categoryTabs');

    if (!categoryTabs) return;

    categoryTabs.innerHTML = '';

    const viewBranch = window.currentBranchView || currentBranch;
    const categories = Object.keys(menuData[viewBranch] || {});

    if (!categories.length) {
        categoryTabs.innerHTML = '<div>No categories found.</div>';
        return;
    }

    categories.forEach(cat => {
        const tab = document.createElement('div');

        tab.className = 'category-tab' + (cat === currentCategory ? ' active' : '');
        tab.dataset.category = cat;
        tab.textContent = cat;

        tab.addEventListener('click', () => {
            document.querySelectorAll('.category-tab').forEach(t => {
                t.classList.remove('active');
            });

            tab.classList.add('active');

            currentCategory = cat;
            clearModernSearch();
            renderMenu();
        });

        categoryTabs.appendChild(tab);
    });
}

function renderMenu(searchTerm = '') {
    const menuGrid = document.getElementById('menuGrid');

    if (!menuGrid) return;

    menuGrid.innerHTML = '';

    const viewBranch = window.currentBranchView || currentBranch;

    if (!menuData[viewBranch] || !menuData[viewBranch][currentCategory]) return;

    let menuItems = [...menuData[viewBranch][currentCategory]];

    if (searchTerm) {
        menuItems = menuItems.filter(item => {
            const name = (item.name || '').toLowerCase();
            const description = getDefaultDescription(item).toLowerCase();
            const category = (item.category || currentCategory || '').toLowerCase();

            return (
                name.includes(searchTerm) ||
                description.includes(searchTerm) ||
                category.includes(searchTerm)
            );
        });
    }

    if (activeSizeFilter !== 'all') {
        menuItems = menuItems.filter(item => {
            const sizes = getSizeOptions(item);
            return sizes.includes(activeSizeFilter);
        });
    }

    if (activeMenuSort === 'low-high') {
        menuItems.sort((a, b) => getDisplayPrice(a) - getDisplayPrice(b));
    }

    if (activeMenuSort === 'high-low') {
        menuItems.sort((a, b) => getDisplayPrice(b) - getDisplayPrice(a));
    }

    if (!menuItems.length) {
        menuGrid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:45px;color:#9E938C;font-weight:800;">
                No menu item found.
            </div>
        `;
        return;
    }

    menuItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'menu-item';

        const description = getDefaultDescription(item);
        const sizeOptions = getSizeOptions(item);

        let cardQty = 1;
        let cardSelectedSize = getDefaultSize(item);
        let cardSelectedPrice = getPriceBySize(item, cardSelectedSize);

        const sizeButtonsHtml = sizeOptions.map(size => {
            const activeClass = size === cardSelectedSize ? ' active' : '';

            return `
                <button 
                    type="button" 
                    class="item-size-pill${activeClass}" 
                    data-size="${escapeHtml(size)}"
                >
                    ${escapeHtml(size)}
                </button>
            `;
        }).join('');

        card.innerHTML = `
            <div class="item-image">
                ${getProductImageHtml(item)}
            </div>

            <div class="item-details">
                <div class="item-name">
                    ${escapeHtml(item.name)}
                </div>

                <div class="item-description">
                    ${escapeHtml(description)}
                </div>

                <div class="item-info-table">
                    <span>Category</span>
                    <span>${escapeHtml(item.category || currentCategory)}</span>
                </div>

                <div class="item-size-options">
                    ${sizeButtonsHtml}
                </div>

                <div class="item-price">
                    ₱${Number(cardSelectedPrice).toLocaleString()}.00
                </div>

                <div class="item-card-actions">
                    <div class="item-qty-mini">
                        <button type="button" class="mini-minus">−</button>
                        <span class="mini-qty">1</span>
                        <button type="button" class="mini-plus">+</button>
                    </div>

                    <button type="button" class="add-cart-mini">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;

        const priceText = card.querySelector('.item-price');
        const miniQty = card.querySelector('.mini-qty');
        const miniMinus = card.querySelector('.mini-minus');
        const miniPlus = card.querySelector('.mini-plus');
        const addCartMini = card.querySelector('.add-cart-mini');

        card.querySelectorAll('.item-size-pill').forEach(sizeBtn => {
            sizeBtn.addEventListener('click', e => {
                e.stopPropagation();

                card.querySelectorAll('.item-size-pill').forEach(btn => {
                    btn.classList.remove('active');
                });

                sizeBtn.classList.add('active');

                cardSelectedSize = sizeBtn.dataset.size;
                cardSelectedPrice = getPriceBySize(item, cardSelectedSize);

                if (priceText) {
                    priceText.textContent = `₱${Number(cardSelectedPrice).toLocaleString()}.00`;
                }
            });
        });

        miniMinus.addEventListener('click', e => {
            e.stopPropagation();

            if (cardQty > 1) {
                cardQty--;
                miniQty.textContent = cardQty;
            }
        });

        miniPlus.addEventListener('click', e => {
            e.stopPropagation();

            cardQty++;
            miniQty.textContent = cardQty;
        });

        addCartMini.addEventListener('click', e => {
            e.stopPropagation();

            if (!currentUser) {
                alert('Please login first.');
                return;
            }

            showAddOrderModal(item, cardQty, cardSelectedSize);
        });

        card.addEventListener('click', () => {
            if (!currentUser) {
                alert('Please login first.');
                return;
            }

            showAddOrderModal(item, cardQty, cardSelectedSize);
        });

        menuGrid.appendChild(card);
    });
}

function showAddOrderModal(product, quantityFromCard = 1, sizeFromCard = null) {
    selectedProduct = product;
    currentQuantity = quantityFromCard;
    selectedAddons = [];
    selectedSize = sizeFromCard || getDefaultSize(product);

    const productName = document.getElementById('productName');
    const productDesc = document.getElementById('productDescription');
    const quantityDisplay = document.getElementById('quantityDisplay');
    const sizeOptionGroup = document.getElementById('sizeOptionGroup');
    const addOrderModal = document.getElementById('addOrderModal');

    if (productName) productName.textContent = product.name;
    if (productDesc) productDesc.textContent = getDefaultDescription(product);
    if (quantityDisplay) quantityDisplay.textContent = currentQuantity;

    const productImage = document.getElementById('productImage');

    if (productImage) {
        productImage.innerHTML = getProductImageHtml(product);
    }

    insertProductInfoTable(product);
    renderModalSizeOptions(product);

    const sizeOptions = getSizeOptions(product);

    if (sizeOptionGroup) {
        sizeOptionGroup.style.display = sizeOptions.length > 1 ? 'block' : 'none';
    }

    generateAddonsForProduct(product.category);
    updateProductPrice();

    addOrderModal.style.display = 'flex';
}

function renderModalSizeOptions(product) {
    const sizeOptionsContainer = document.getElementById('sizeOptions');

    if (!sizeOptionsContainer) return;

    const sizeOptions = getSizeOptions(product);

    sizeOptionsContainer.innerHTML = '';

    sizeOptions.forEach(size => {
        const btn = document.createElement('button');

        btn.type = 'button';
        btn.className = 'option-btn' + (size === selectedSize ? ' active' : '');
        btn.dataset.size = size;
        btn.textContent = size;

        btn.addEventListener('click', () => {
            document.querySelectorAll('#sizeOptions .option-btn').forEach(b => {
                b.classList.remove('active');
            });

            btn.classList.add('active');
            selectedSize = size;

            updateProductPrice();
        });

        sizeOptionsContainer.appendChild(btn);
    });
}

function insertProductInfoTable(product) {
    let productInfoTable = document.getElementById('productInfoTable');

    if (!productInfoTable) {
        productInfoTable = document.createElement('div');
        productInfoTable.id = 'productInfoTable';
        productInfoTable.className = 'product-info-table';

        const productDescription = document.getElementById('productDescription');

        if (productDescription && productDescription.parentNode) {
            productDescription.insertAdjacentElement('afterend', productInfoTable);
        }
    }

    const price = getPriceBySize(product, selectedSize || getDefaultSize(product));
    const size = selectedSize || getDefaultSize(product);

    productInfoTable.innerHTML = `
        <div class="product-info-row">
            <span>Category</span>
            <span>${escapeHtml(product.category || currentCategory)}</span>
        </div>

        <div class="product-info-row">
            <span>Selected Size</span>
            <span>${escapeHtml(size)}</span>
        </div>

        <div class="product-info-row">
            <span>Starting Price</span>
            <span>₱${Number(price).toLocaleString()}.00</span>
        </div>
    `;
}

function generateAddonsForProduct(category) {
    const addonsSection = document.getElementById('addonsSection');

    if (!addonsSection) return;

    addonsSection.innerHTML = '';

    const title = document.createElement('div');
    title.className = 'option-title';
    title.textContent = 'Add-ons';

    addonsSection.appendChild(title);

    selectedAddons = [];

    const addonsList = [];

    if (category === 'Coffee' || category === 'Frappe') {
        addonsList.push({ name: 'Espresso Shot', price: 30 });
    }

    if (category === 'MilkTea' || category === 'Frappe') {
        addonsList.push({ name: 'Boba Pearls', price: 30 });
    }

    addonsList.push({ name: 'Whipped Cream', price: 20 });

    addonsList.forEach(addon => {
        const row = document.createElement('div');
        row.className = 'addon-item';

        const id = `addon-${addon.name.replace(/\s+/g, '')}-${addon.price}`;

        row.innerHTML = `
            <div>
                <input 
                    type="checkbox" 
                    class="addon-checkbox" 
                    id="${id}" 
                    data-name="${escapeHtml(addon.name)}" 
                    data-price="${addon.price}"
                >

                <label for="${id}">
                    ${escapeHtml(addon.name)}
                </label>
            </div>

            <div>
                +₱${Number(addon.price).toLocaleString()}.00
            </div>
        `;

        const checkbox = row.querySelector('.addon-checkbox');

        checkbox.addEventListener('change', function () {
            const price = parseInt(this.dataset.price, 10);

            if (this.checked) {
                selectedAddons.push({
                    name: this.dataset.name,
                    price: price
                });
            } else {
                selectedAddons = selectedAddons.filter(a => a.name !== this.dataset.name);
            }

            updateProductPrice();
        });

        addonsSection.appendChild(row);
    });
}

function updateProductPrice() {
    if (!selectedProduct) return;

    const productPriceEl = document.getElementById('productPrice');

    const basePrice = getPriceBySize(selectedProduct, selectedSize);
    const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    const total = (basePrice + addonsTotal) * currentQuantity;

    insertProductInfoTable(selectedProduct);

    if (productPriceEl) {
        productPriceEl.textContent = `₱${Number(total).toLocaleString()}.00`;
    }
}

function resetAddOrderModal() {
    selectedProduct = null;
    currentQuantity = 1;
    selectedAddons = [];
    selectedSize = 'XL';
}

// ===============================
// ORDER HANDLING
// ===============================
function addSelectedProductToOrder() {
    if (!selectedProduct) return;

    const sizeLabel = selectedSize || getDefaultSize(selectedProduct);
    const basePrice = getPriceBySize(selectedProduct, sizeLabel);

    const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    const addonNames = selectedAddons.map(a => a.name);
    const totalPrice = (basePrice + addonsTotal) * currentQuantity;

    const orderItem = {
        id: Date.now() + Math.random(),
        name: selectedProduct.name,
        image: getProductManualImage(selectedProduct),
        category: selectedProduct.category || '',
        size: sizeLabel,
        basePrice,
        addons: addonNames,
        addonsTotal,
        quantity: currentQuantity,
        totalPrice
    };

    currentOrder.push(orderItem);

    updateOrderDisplay();
    updateOrderSummary();

    document.getElementById('addOrderModal').style.display = 'none';

    resetAddOrderModal();
}

function updateOrderDisplay() {
    const orderList = document.getElementById('orderList');

    if (!orderList) return;

    orderList.innerHTML = '';

    if (!currentOrder.length) {
        orderList.innerHTML = '<div class="empty-order">No items added yet</div>';
        return;
    }

    currentOrder.forEach(item => {
        const row = document.createElement('div');
        row.className = 'order-item';
        row.dataset.id = item.id;

        const addonsText = item.addons.length ? `Add-ons: ${item.addons.join(', ')}` : '';

        row.innerHTML = `
            <div class="order-item-main">
                <div class="order-item-thumb">
                    ${getProductImageHtml(item)}
                </div>

                <div class="order-item-details">
                    <div class="order-item-name">
                        ${escapeHtml(item.name)}${item.size ? ' (' + escapeHtml(item.size) + ')' : ''}
                    </div>

                    <div class="order-item-size">
                        ${escapeHtml(addonsText)}
                    </div>

                    <div class="order-item-quantity">
                        <button class="quantity-btn decrease">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn increase">+</button>
                    </div>
                </div>
            </div>

            <div class="order-item-price">
                ₱${Number(item.totalPrice).toLocaleString()}.00
            </div>

            <div class="remove-btn">
                <i class="fas fa-times"></i>
            </div>
        `;

        const decBtn = row.querySelector('.decrease');
        const incBtn = row.querySelector('.increase');
        const remBtn = row.querySelector('.remove-btn');

        decBtn.addEventListener('click', () => {
            if (item.quantity > 1) {
                item.quantity -= 1;
                item.totalPrice = (item.basePrice + item.addonsTotal) * item.quantity;

                updateOrderDisplay();
                updateOrderSummary();
            }
        });

        incBtn.addEventListener('click', () => {
            item.quantity += 1;
            item.totalPrice = (item.basePrice + item.addonsTotal) * item.quantity;

            updateOrderDisplay();
            updateOrderSummary();
        });

        remBtn.addEventListener('click', () => {
            currentOrder = currentOrder.filter(o => o.id !== item.id);

            updateOrderDisplay();
            updateOrderSummary();
        });

        orderList.appendChild(row);
    });
}

function updateOrderSummary() {
    const subtotal = currentOrder.reduce((sum, i) => sum + i.totalPrice, 0);

    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');

    if (subtotalEl) {
        subtotalEl.textContent = `₱${Number(subtotal).toLocaleString()}.00`;
    }

    if (totalEl) {
        totalEl.textContent = `₱${Number(subtotal).toLocaleString()}.00`;
    }
}

function getOrderTotal() {
    return currentOrder.reduce((sum, i) => sum + i.totalPrice, 0);
}

// ===============================
// PAYMENT
// ===============================
function setupCashPayment() {
    calculateChange();
}

function calculateChange() {
    const cashInput = document.getElementById('cashAmount');
    const changeDiv = document.getElementById('cashChange');

    if (!cashInput || !changeDiv) return;

    const total = getOrderTotal();
    const cashAmount = parseFloat(cashInput.value);

    if (!isNaN(cashAmount) && cashAmount >= total) {
        const change = cashAmount - total;

        changeDiv.textContent = `Change: ₱${Number(change).toLocaleString()}.00`;
        changeDiv.style.color = '#43A047';
    } else if (cashInput.value === '') {
        changeDiv.textContent = '';
    } else {
        changeDiv.textContent = 'Insufficient amount';
        changeDiv.style.color = '#E53935';
    }
}

async function processPayment() {
    if (!selectedPaymentMethod) {
        alert('Please select a payment method.');
        return;
    }

    const total = getOrderTotal();

    if (total <= 0) {
        alert('Total must be greater than 0.');
        return;
    }

    let cashAmount = null;
    let changeAmount = null;
    let mobileProvider = null;
    let mobileNumber = null;
    let referenceNumber = null;

    if (selectedPaymentMethod === 'cash') {
        const cashInput = document.getElementById('cashAmount');

        cashAmount = parseFloat(cashInput.value);

        if (isNaN(cashAmount) || cashAmount < total) {
            alert('Cash amount must be at least the total amount.');
            return;
        }

        changeAmount = cashAmount - total;
    } else if (selectedPaymentMethod === 'mobile') {
        const providerSelect = document.getElementById('mobileProvider');
        const refInput = document.getElementById('referenceNumber');
        const numberInput = document.getElementById('mobileNumber');

        mobileProvider = providerSelect.value;
        referenceNumber = refInput.value.trim();
        mobileNumber = numberInput.value.trim();

        if (!referenceNumber) {
            alert('Please enter the GCash reference number.');
            return;
        }
    }

    const payload = {
        total_amount: total,
        payment_method: selectedPaymentMethod,
        cash_amount: selectedPaymentMethod === 'cash' ? cashAmount : null,
        change_amount: selectedPaymentMethod === 'cash' ? changeAmount : null,
        mobile_provider: selectedPaymentMethod === 'mobile' ? mobileProvider : null,
        mobile_number: selectedPaymentMethod === 'mobile' ? mobileNumber : null,
        reference_number: selectedPaymentMethod === 'mobile' ? referenceNumber : null,
        items: currentOrder.map(item => ({
            name: item.name,
            size: item.size,
            basePrice: item.basePrice,
            addons: item.addons,
            addonsTotal: item.addonsTotal,
            quantity: item.quantity,
            totalPrice: item.totalPrice
        }))
    };

    try {
        const data = await jsonFetch('/orders', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (data.status !== 'success') {
            throw new Error(data.message || 'Failed to save order.');
        }

        try {
            const newTokenRes = await fetch('/refresh-csrf');
            const tokenData = await newTokenRes.json();

            document
                .querySelector('meta[name="csrf-token"]')
                .setAttribute('content', tokenData.token);
        } catch (csrfErr) {
            console.warn('Failed to refresh CSRF token:', csrfErr);
        }

        await loadOrderHistoryData();

        showReceiptModal({
            order: currentOrder,
            total,
            paymentMethod: selectedPaymentMethod,
            cashAmount,
            changeAmount,
            mobileProvider,
            mobileNumber,
            referenceNumber
        });

        currentOrder = [];

        updateOrderDisplay();
        updateOrderSummary();

        document.getElementById('paymentModal').style.display = 'none';

    } catch (err) {
        console.error('processPayment error:', err);
        alert(err.message || 'Failed to process payment.');
    }
}

// ===============================
// RECEIPT
// ===============================
function showReceiptModal(info) {
    const receiptModal = document.getElementById('receiptModal');

    if (!receiptModal) return;

    const receiptBranch = document.getElementById('receiptBranch');
    const receiptDate = document.getElementById('receiptDate');
    const receiptCashier = document.getElementById('receiptCashier');
    const receiptItems = document.getElementById('receiptItems');
    const receiptTotal = document.getElementById('receiptTotal');
    const receiptPaymentInfo = document.getElementById('receiptPaymentInfo');

    if (!receiptItems || !receiptTotal || !receiptPaymentInfo) {
        console.error('Receipt modal elements missing');
        return;
    }

    if (receiptBranch) {
        receiptBranch.textContent = (info.branch || currentBranch || '').toUpperCase();
    }

    if (receiptDate) {
        receiptDate.textContent = new Date(info.created_at || Date.now()).toLocaleString();
    }

    if (receiptCashier) {
        receiptCashier.textContent =
            info.user?.username ||
            info.cashier ||
            currentUser ||
            'Unknown';
    }

    receiptItems.innerHTML = '';

    const items = info.items || info.order || [];

    if (!Array.isArray(items)) {
        alert('Receipt data is incomplete');
        return;
    }

    items.forEach(item => {
        const name = item.product_name || item.name || 'Unknown Item';
        const size = item.size ? ` (${item.size})` : '';
        const qty = item.quantity || 1;
        const price = Number(item.total_price ?? item.totalPrice ?? 0);

        const addons =
            Array.isArray(item.addons) && item.addons.length
                ? `Add-ons: ${item.addons.join(', ')}`
                : '';

        const row = document.createElement('div');
        row.className = 'receipt-item';

        row.innerHTML = `
            <div>
                ${qty}x ${escapeHtml(name)}${escapeHtml(size)}
                <div style="font-size:12px;color:#9E938C">
                    ${escapeHtml(addons)}
                </div>
            </div>

            <div>
                ₱${Number(price).toLocaleString()}.00
            </div>
        `;

        receiptItems.appendChild(row);
    });

    receiptTotal.textContent = `₱${Number(info.total_amount || info.total || 0).toLocaleString()}.00`;

    receiptPaymentInfo.innerHTML = '';

    const isCash =
        info.payment_method === 'cash' ||
        info.paymentMethod === 'cash';

    if (isCash) {
        receiptPaymentInfo.innerHTML = `
            <div class="receipt-payment-row">
                <span>Payment</span>
                <span>CASH</span>
            </div>

            <div class="receipt-payment-row">
                <span>Paid</span>
                <span>₱${Number(info.cash_amount || info.cashAmount || 0).toLocaleString()}.00</span>
            </div>

            <div class="receipt-payment-row">
                <span>Change</span>
                <span>₱${Number(info.change_amount || info.changeAmount || 0).toLocaleString()}.00</span>
            </div>
        `;
    } else {
        const ref = info.referenceNumber || info.reference_number || 'N/A';
        const mob = info.mobileNumber || info.mobile_number || 'N/A';

        receiptPaymentInfo.innerHTML = `
            <div class="receipt-payment-row">
                <span>Payment</span>
                <span>${escapeHtml(info.mobileProvider || info.mobile_provider || 'GCash')}</span>
            </div>
            <div class="receipt-payment-row">
                <span>Ref No.</span>
                <span>${escapeHtml(ref)}</span>
            </div>
            <div class="receipt-payment-row">
                <span>Mobile No.</span>
                <span>${escapeHtml(mob)}</span>
            </div>
        `;
    }

    receiptModal.style.display = 'flex';
}

// ===============================
// ORDER HISTORY
// ===============================
async function loadOrderHistoryData(searchTerm = '') {
    try {
        let branch = window.currentBranchView || currentBranch;

        let url = `/orders?branch=${encodeURIComponent(branch)}`;

        if (searchTerm) {
            url += `&search=${encodeURIComponent(searchTerm)}`;
        }

        const data = await jsonFetch(url);

        orderHistory = Array.isArray(data.data) ? data.data : [];
    } catch (err) {
        console.error('Failed to load orders:', err);
        orderHistory = [];
    }

    renderOrderHistoryTable();
}

function renderOrderHistoryTable() {
    const body = document.getElementById('orderHistoryBody');

    if (!body) return;

    body.innerHTML = '';

    if (!orderHistory.length) {
        body.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;padding:40px;color:#9E938C;">
                    No orders found
                </td>
            </tr>
        `;
        return;
    }

    orderHistory.forEach(order => {
        const tr = document.createElement('tr');

        const total = Number(order.total_amount || 0);
        const createdAt = order.created_at
            ? new Date(order.created_at).toLocaleString()
            : '—';

        const itemsCount = Array.isArray(order.items) ? order.items.length : 0;

        let statusBadge = '';

        if (order.status === 'voided') {
            statusBadge = `<span class="status-voided">Voided</span>`;
        } else {
            statusBadge = `<span class="status-completed">Completed</span>`;
        }

        let actionsHtml = `
            <button class="btn btn-small btn-primary view-receipt">
                View
            </button>
        `;

        if (currentUserRole === 'manager' && order.status !== 'voided') {
            actionsHtml += `
                <button class="btn btn-small btn-danger void-order">
                    Void
                </button>
            `;
        }

        tr.innerHTML = `
            <td>${order.order_number || order.id}</td>
            <td>${createdAt}</td>
            <td>${itemsCount} item(s)</td>
            <td>₱${total.toLocaleString()}.00</td>
            <td>${escapeHtml(order.payment_method || '')}</td>
            <td>${statusBadge}</td>
            <td class="order-actions">${actionsHtml}</td>
        `;

        tr.querySelector('.view-receipt')
            .addEventListener('click', () => openReceiptFromHistory(order));

        const voidBtn = tr.querySelector('.void-order');

        if (voidBtn) {
            voidBtn.addEventListener('click', async () => {
                if (!confirm('Are you sure you want to VOID this order?')) return;

                try {
                    const res = await jsonFetch(`/orders/${order.id}/void`, {
                        method: 'POST'
                    });

                    showNotification(res.message || 'Order voided');

                    // Optimistic update
                    order.status = 'voided';
                    renderOrderHistoryTable();

                    await loadOrderHistoryData();
                    await updateDashboard();
                } catch (err) {
                    showNotification(err.message || 'Failed to void order', 'error');
                }
            });
        }

        body.appendChild(tr);
    });
}

async function confirmVoidOrder(orderId) {
    if (!orderId) {
        showNotification('Invalid order.', 'error');
        return;
    }

    const confirmed = confirm(
        'Are you sure you want to VOID this order?\n\n' +
        'This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
        const res = await jsonFetch(`/orders/${orderId}/void`, {
            method: 'POST'
        });

        if (res.status !== 'success') {
            throw new Error(res.message || 'Failed to void order.');
        }

        showNotification('Order successfully voided.');

        // Optimistic update
        const order = orderHistory.find(o => o.id == orderId);
        if (order) order.status = 'voided';
        renderOrderHistoryTable();

        await loadOrderHistoryData();
        await updateDashboard();
    } catch (err) {
        console.error('Void error:', err);
        showNotification(err.message || 'Unable to void order.', 'error');
    }
}

function openReceiptFromHistory(order) {
    if (!order) {
        alert('Receipt data is incomplete.');
        console.error(order);
        return;
    }

    const receiptBranch = document.getElementById('viewReceiptBranch');
    const receiptDate = document.getElementById('viewReceiptDate');
    const receiptCashier = document.getElementById('viewReceiptCashier');
    const receiptItems = document.getElementById('viewReceiptItems');
    const receiptTotal = document.getElementById('viewReceiptTotal');
    const receiptPaymentInfo = document.getElementById('viewReceiptPaymentInfo');

    if (!receiptBranch || !receiptDate || !receiptItems || !receiptTotal || !receiptPaymentInfo) {
        console.error('Receipt modal elements missing');
        return;
    }

    receiptBranch.textContent = (order.branch || currentBranch || '').toUpperCase();

    receiptDate.textContent = order.created_at
        ? new Date(order.created_at).toLocaleString()
        : new Date().toLocaleString();

    if (receiptCashier) {
        receiptCashier.textContent =
            order.user?.username ||
            order.cashier ||
            order.cashier_name ||
            'Unknown';
    }

    receiptItems.innerHTML = '';

    let items = order.items;

    if (typeof items === 'string') {
        try {
            items = JSON.parse(items);
        } catch (e) {
            alert('Invalid receipt items');
            console.error(items);
            return;
        }
    }

    if (!Array.isArray(items)) {
        alert('Receipt data is incomplete.');
        return;
    }

    items.forEach(item => {
        const name = item.product_name || item.name || 'Unknown Item';
        const size = item.size ? ` (${item.size})` : '';
        const addons = Array.isArray(item.addons) && item.addons.length
            ? `Add-ons: ${item.addons.join(', ')}`
            : '';

        const row = document.createElement('div');
        row.className = 'receipt-item';

        row.innerHTML = `
            <div>
                ${item.quantity || 1}x ${escapeHtml(name)}${escapeHtml(size)}
                <div style="font-size:12px;color:#9E938C">
                    ${escapeHtml(addons)}
                </div>
            </div>

            <div>
                ₱${Number(item.total_price || item.totalPrice || 0).toLocaleString()}.00
            </div>
        `;

        receiptItems.appendChild(row);
    });

    receiptTotal.textContent = `₱${Number(order.total_amount || 0).toLocaleString()}.00`;

    receiptPaymentInfo.innerHTML = '';

    if (order.payment_method === 'cash') {
        receiptPaymentInfo.innerHTML = `
            <div class="receipt-payment-row">
                <span>Payment</span>
                <span>CASH</span>
            </div>

            <div class="receipt-payment-row">
                <span>Paid</span>
                <span>₱${Number(order.cash_amount || 0).toLocaleString()}.00</span>
            </div>

            <div class="receipt-payment-row">
                <span>Change</span>
                <span>₱${Number(order.change_amount || 0).toLocaleString()}.00</span>
            </div>
        `;
    } else {
        const ref = order.reference_number || 'N/A';
        const mob = order.mobile_number || 'N/A';

        receiptPaymentInfo.innerHTML = `
            <div class="receipt-payment-row">
                <span>Payment</span>
                <span>${escapeHtml(order.mobile_provider || 'GCash')}</span>
            </div>
            <div class="receipt-payment-row">
                <span>Ref No.</span>
                <span>${escapeHtml(ref)}</span>
            </div>
            <div class="receipt-payment-row">
                <span>Mobile No.</span>
                <span>${escapeHtml(mob)}</span>
            </div>
        `;
    }

    document.getElementById('viewReceiptModal').style.display = 'flex';
}

// ===============================
// USERS
// ===============================
function resetUserForm() {
    document.getElementById('userFullName').value = '';
    document.getElementById('userUsername').value = '';
    document.getElementById('userPassword').value = '';
    document.getElementById('userRole').value = '';
    document.getElementById('userBranch').value = '';
    document.getElementById('userEmail').value = '';
    document.getElementById('userStatus').value = 'active';
}

async function loadUsersData(searchTerm = '') {
    try {
        const selectedBranch = document.getElementById('usersBranchSelect')?.value || 'all';

        let url = '/users';

        if (searchTerm) {
            url += `?search=${encodeURIComponent(searchTerm)}`;
        }

        const data = await jsonFetch(url);

        let filtered = Array.isArray(data) ? data : [];

        if (currentUserRole === 'manager') {
            if (selectedBranch !== 'all') {
                filtered = filtered.filter(u => u.branch === selectedBranch);
            }
        }

        if (currentUserRole === 'admin') {
            filtered = filtered.filter(u => u.branch === currentBranch);
        }

        if (currentUserRole === 'cashier') {
            filtered = [];
        }

        users = filtered;
    } catch (err) {
        console.error('Failed to load users:', err);
        users = [];
    }

    renderUserTable();
}

async function saveUserAccount() {
    const full_name = document.getElementById('userFullName')?.value.trim();
    const username = document.getElementById('userUsername')?.value.trim();
    const password = document.getElementById('userPassword')?.value;
    const role = document.getElementById('userRole')?.value;
    const branch = document.getElementById('userBranch')?.value;
    const email = document.getElementById('userEmail')?.value.trim();
    const status = document.getElementById('userStatus')?.value;

    if (!full_name || !username || !password || !role || !branch) {
        alert('Please fill in all required fields.');
        return;
    }

    const payload = {
        full_name,
        username,
        password,
        role,
        branch,
        email,
        status
    };

    try {
        const response = await jsonFetch('/users', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (response.status !== 'success') {
            throw new Error(response.message || 'Failed to create user.');
        }

        document.getElementById('addUserModal').style.display = 'none';
        showNotification('User created successfully');

        await loadUsersData();

        resetUserForm();
    } catch (err) {
        showNotification(err.message, 'error');
    }
}

function renderUserTable() {
    const body = document.getElementById('userManagementBody');

    if (!body) return;

    body.innerHTML = '';

    if (!users.length) {
        body.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;padding:40px;color:#9E938C;">
                    <i class="fas fa-users" style="font-size:3rem;margin-bottom:10px;display:block;"></i>
                    No users found
                </td>
            </tr>
        `;
        return;
    }

    users.forEach(user => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${escapeHtml(user.username)}</td>
            <td>${escapeHtml(user.role)}</td>
            <td>${escapeHtml(user.full_name)}</td>
            <td>${escapeHtml(user.email || 'N/A')}</td>
            <td>${escapeHtml(user.branch)}</td>
            <td>${escapeHtml(user.status)}</td>
            <td>
                <button class="btn btn-small btn-warning edit-user" data-id="${user.id}">
                    Edit
                </button>

                <button class="btn btn-small btn-danger delete-user" data-id="${user.id}">
                    Delete
                </button>
            </td>
        `;

        tr.querySelector('.edit-user').addEventListener('click', () => {
            openEditUserModal(user);
        });

        tr.querySelector('.delete-user').addEventListener('click', () => {
            deleteUser(user.id);
        });

        body.appendChild(tr);
    });
}

function openEditUserModal(user) {
    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUserFullName').value = user.full_name;
    document.getElementById('editUserUsername').value = user.username;
    document.getElementById('editUserRole').value = user.role;
    document.getElementById('editUserBranch').value = user.branch;
    document.getElementById('editUserEmail').value = user.email || '';
    document.getElementById('editUserStatus').value = user.status;
    document.getElementById('editUserPassword').value = '';

    document.getElementById('editUserModal').style.display = 'flex';
}

async function saveEditedUser() {
    const id = document.getElementById('editUserId').value;
    const full_name = document.getElementById('editUserFullName').value.trim();
    const username = document.getElementById('editUserUsername').value.trim();
    const role = document.getElementById('editUserRole').value;
    const branch = document.getElementById('editUserBranch').value;
    const email = document.getElementById('editUserEmail').value.trim();
    const status = document.getElementById('editUserStatus').value;
    const password = document.getElementById('editUserPassword').value;

    if (!full_name) {
        alert('Full name is required.');
        return;
    }

    if (!username) {
        alert('Username is required.');
        return;
    }

    if (!role) {
        alert('Role is required.');
        return;
    }

    if (!branch) {
        alert('Branch is required.');
        return;
    }

    const payload = {
        full_name,
        username,
        role,
        branch,
        email,
        status
    };

    if (password.trim() !== '') {
        payload.password = password;
    }

    try {
        const data = await jsonFetch(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });

        if (data.status !== 'success') {
            throw new Error(data.message || 'Failed to update user.');
        }

        document.getElementById('editUserModal').style.display = 'none';
        showNotification('User updated successfully');

        await loadUsersData();
    } catch (err) {
        showNotification(err.message, 'error');
    }
}

async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
        const data = await jsonFetch(`/users/${id}`, {
            method: 'DELETE'
        });

        if (data.status !== 'success') {
            throw new Error(data.message || 'Delete failed');
        }

        showNotification('User deleted successfully');
        
        // Optimistic UI update
        users = users.filter(u => u.id != id);
        renderUserTable();

        // Refresh from server to ensure sync
        await loadUsersData();
    } catch (err) {
        showNotification(err.message, 'error');
    }
}

// ===============================
// DASHBOARD
// ===============================
function setupCharts() {
    const canvas = document.getElementById('salesChart');

    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    salesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Units Sold',
                data: [],
                backgroundColor: '#FF9A6A',
                borderRadius: 12,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#9E938C',
                        font: {
                            weight: '700'
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#EFE7E1'
                    },
                    ticks: {
                        precision: 0,
                        color: '#9E938C',
                        font: {
                            weight: '700'
                        }
                    }
                }
            }
        }
    });
}

async function updateDashboard() {
    if (!currentUser) return;

    let branch = window.currentBranchView || currentBranch;

    try {
        const stats = await jsonFetch(
            `/dashboard/statistics?branch=${encodeURIComponent(branch)}`
        );

        const cards = document.querySelectorAll('.dashboard-card-value');

        if (cards[0]) {
            cards[0].textContent = `₱${Number(stats.total_revenue || 0).toLocaleString()}.00`;
        }

        if (cards[1]) {
            cards[1].textContent = stats.total_orders || 0;
        }

        if (cards[2]) {
            cards[2].textContent = stats.active_staff || 0;
        }

        if (salesChart && Array.isArray(stats.top_products)) {
            const labels = stats.top_products.map(p => p.product_name);
            const values = stats.top_products.map(p => p.total_sold);

            salesChart.data.labels = labels;
            salesChart.data.datasets[0].data = values;
            salesChart.data.datasets[0].label = 'Units Sold';
            salesChart.update();
        }
    } catch (err) {
        console.error('updateDashboard error:', err);
    }
}