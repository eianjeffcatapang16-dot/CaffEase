<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>CaffEase POS System</title>

    <link rel="stylesheet" href="{{ asset('css/pos.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <meta name="csrf-token" content="{{ csrf_token() }}">
</head>

<body>
<!-- LOGIN CONTAINER -->
<div class="login-container" id="loginContainer">
    <div class="login-left">
        <div class="login-logo"><i class="fas fa-coffee"></i></div>
        <h1>CaffEase</h1>
        <p>Welcome to CaffEase Point of Sale System</p>
    </div>

    <div class="login-right">
        <!-- POSITION SELECTION -->
        <div id="positionSelection">
            <h2 class="login-title">Welcome</h2>
            <p class="login-subtitle">Please select a Position</p>

            <div class="position-selection">
                <div class="position-option" data-position="cashier">
                    <div class="position-icon"><i class="fas fa-user"></i></div>
                    <div class="position-name">Cashier</div>
                </div>

                <div class="position-option" data-position="manager">
                    <div class="position-icon"><i class="fas fa-user-tie"></i></div>
                    <div class="position-name">Manager</div>
                </div>

                <div class="position-option" data-position="admin">
                    <div class="position-icon"><i class="fas fa-user-cog"></i></div>
                    <div class="position-name">Admin</div>
                </div>
            </div>
        </div>

        <!-- CASHIER LOGIN -->
        <div class="credentials-section" id="cashierLogin" style="display:none;">
            <button class="back-btn"><i class="fas fa-arrow-left"></i> Back</button>
            <h2 class="login-title">Cashier Login</h2>
            <p class="login-subtitle">Enter your credentials</p>

            <div class="form-group">
                <label>Username</label>
                <input type="text" id="cashierUsername" class="form-control">
            </div>

            <div class="form-group">
                <label>Password</label>
                <input type="password" id="cashierPassword" class="form-control">
            </div>

            <button class="login-btn" id="cashierLoginBtn">Log In</button>
        </div>

        <!-- MANAGER LOGIN -->
        <div class="credentials-section" id="managerLogin" style="display:none;">
            <button class="back-btn"><i class="fas fa-arrow-left"></i> Back</button>

            <h2 class="login-title">Manager Login</h2>
            <p class="login-subtitle">Enter your credentials</p>

            <div class="form-group">
                <label>Username</label>
                <input type="text" id="managerUsername" class="form-control">
            </div>

            <div class="form-group">
                <label>Password</label>
                <input type="password" id="managerPassword" class="form-control">
            </div>

            <button class="login-btn" id="managerLoginBtn">Log In</button>
        </div>

        <!-- ADMIN LOGIN -->
        <div class="credentials-section" id="adminLogin" style="display:none;">
            <button class="back-btn"><i class="fas fa-arrow-left"></i> Back</button>

            <h2 class="login-title">Admin Login</h2>
            <p class="login-subtitle">Enter your credentials</p>

            <div class="form-group">
                <label>Username</label>
                <input type="text" id="adminUsername" class="form-control">
            </div>

            <div class="form-group">
                <label>Password</label>
                <input type="password" id="adminPassword" class="form-control">
            </div>

            <button class="login-btn" id="adminLoginBtn">Log In</button>
        </div>
    </div>
</div>

<!-- POS SYSTEM -->
<div class="pos-system" id="posSystem" style="display:none;">
    <div class="container">
        <!-- SIDEBAR -->
        <div class="sidebar">
            <div class="logo">
                <i class="fas fa-coffee"></i>
                <h1>CaffEase POS</h1>
            </div>

            <div class="nav-tabs">
                <div class="nav-tab active" data-section="pos-section"><i class="fas fa-cash-register"></i>Point of Sale</div>
                <div class="nav-tab" id="dashboardTab" data-section="dashboard-section"><i class="fas fa-tachometer-alt"></i>Dashboard</div>
                <div class="nav-tab" id="userManagementTab" data-section="user-management-section"><i class="fas fa-users"></i>User Management</div>
                <div class="nav-tab" id="orderHistoryTab" data-section="order-history-section"><i class="fas fa-history"></i>Order History</div>
            </div>
        </div>

        <!-- MAIN CONTENT -->
        <div class="main-content-area">
            <header>
                <div class="branch-display">
                    <i class="fas fa-store"></i>
                    <span id="headerBranch">Lumangbayan Branch</span>
                </div>

                <div class="user-info">
                    <div class="avatar" id="userAvatar"><i class="fas fa-user"></i></div>
                    <div class="user-dropdown" id="userDropdown">
                        <div class="user-dropdown-item" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</div>
                    </div>
                </div>
            </header>

            <!-- POS SECTION -->
            <div class="content-section active" id="pos-section">
                <div class="main-content">
                    <div class="menu-section">
                        <h2 class="section-title"><i class="fas fa-mug-hot"></i> Menu</h2>
                        <div class="category-tabs" id="categoryTabs"></div>
                        <div class="menu-grid" id="menuGrid"></div>
                    </div>

                    <div class="order-section">
                        <h2 class="section-title"><i class="fas fa-receipt"></i> Current Order</h2>
                        <div class="order-list" id="orderList">
                            <div class="empty-order">No items added yet</div>
                        </div>

                        <div class="order-summary">
                            <div class="summary-row"><span>Subtotal:</span><span id="subtotal">₱0.00</span></div>
                            <div class="summary-row summary-total"><span>Total:</span><span id="total">₱0.00</span></div>
                        </div>

                        <div class="action-buttons">
                            <button class="btn btn-secondary" id="clearOrder"><i class="fas fa-trash"></i> Clear Order</button>
                            <button class="btn btn-primary" id="checkoutBtn"><i class="fas fa-credit-card"></i> Checkout</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Add Order Modal -->
    <div class="modal" id="addOrderModal">
        <div class="modal-content add-order-modal">
            <h2 style="margin-bottom: 20px; text-align: center;">Add Order</h2>
            
            <div class="product-details">
                <div class="product-image" id="productImage"></div>
                <div class="product-info">
                    <div class="product-name" id="productName">Salted Caramel</div>
                    <div class="product-description" id="productDescription">
                        Rich espresso with salted caramel syrup and steamed milk.
                    </div>
                    <div class="product-price" id="productPrice">₱0.00</div>
                </div>
            </div>
            
            <div class="option-group" id="sizeOptionGroup" style="display: none;">
                <div class="option-title">Size</div>
                <div class="option-buttons" id="sizeOptions">
                    <button class="option-btn" data-size="M">M - ₱39</button>
                    <button class="option-btn" data-size="L">L - ₱49</button>
                    <button class="option-btn active" data-size="XL">XL - ₱69</button>
                </div>
            </div>
            
            <div class="addons-group" id="addonsSection">
                <div class="option-title">Add-ons</div>
                <!-- Add-ons will be dynamically generated based on category -->
            </div>
            
            <div class="quantity-selector">
                <div class="option-title">Quantity</div>
                <div class="quantity-controls">
                    <button class="quantity-btn" id="decreaseQty">-</button>
                    <div class="quantity-display" id="quantityDisplay">1</div>
                    <button class="quantity-btn" id="increaseQty">+</button>
                </div>
            </div>
            
            <div class="action-buttons">
                <button class="btn btn-secondary" id="cancelAddOrder">
                    Cancel
                </button>
                <button class="btn btn-success" id="addToOrderBtn">
                    Add to Order
                </button>
            </div>
        </div>
    </div>
    
    <!-- Payment Modal -->
    <div class="modal" id="paymentModal">
        <div class="modal-content">
            <h2 style="margin-bottom: 20px; text-align: center;">Select Payment Method</h2>
            
            <div class="payment-options">
                <div class="payment-option" data-method="cash">
                    <div class="payment-icon">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <div>
                        <div style="font-weight: 500;">Cash</div>
                        <div style="font-size: 0.8rem; color: var(--primary-light);">Pay with cash</div>
                    </div>
                </div>
                
                <div class="payment-option" data-method="mobile">
                    <div class="payment-icon">
                        <i class="fas fa-mobile-alt"></i>
                    </div>
                    <div>
                        <div style="font-weight: 500;">Mobile Payment</div>
                        <div style="font-size: 0.8rem; color: var(--primary-light);">Pay with phone</div>
                    </div>
                </div>
            </div>
            
            <div class="payment-details" id="cashDetails">
                <div class="form-group">
                    <label for="cashAmount">Amount Tendered</label>
                    <input type="number" id="cashAmount" class="form-control" placeholder="Enter amount">
                </div>
                <div id="cashChange" style="font-weight: 500; text-align: center; margin: 10px 0;"></div>
            </div>
            
            <div class="payment-details" id="mobileDetails">
                <div class="form-group">
                    <label for="mobileProvider">Mobile Wallet</label>
                    <select id="mobileProvider" class="form-control">
                        <option value="gcash">GCash</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="referenceNumber">Reference Number *</label>
                    <input type="text" id="referenceNumber" class="form-control" placeholder="Enter 13-digit reference number">
                </div>
                <div class="form-group">
                    <label for="mobileNumber">Mobile Number (Optional)</label>
                    <input type="text" id="mobileNumber" class="form-control" placeholder="09XX XXX XXXX">
                </div>
            </div>
            
            <button class="btn btn-success" id="processPayment" style="width: 100%; margin-top: 20px;">
                <i class="fas fa-check"></i> Process Payment
            </button>
            
            <button class="close-modal" id="closePaymentModal">Cancel</button>
        </div>
    </div>
    
    <!-- Receipt Modal -->
    <div class="modal" id="receiptModal">
        <div class="modal-content">
            <div class="receipt-header">
                <h2>CaffEase</h2>
                <p id="receiptBranch">Lumangbayan Branch</p>
                <p id="receiptDate"></p>
                <p><strong>Cashier:</strong> <span id="receiptCashier"></span></p>

            </div>
            
            <div class="receipt-items" id="receiptItems">
                <!-- Receipt items will be populated by JavaScript -->
            </div>
            
            <div class="receipt-total">
                <span>Total:</span>
                <span id="receiptTotal">₱0.00</span>
            </div>
            
            <div id="receiptPaymentInfo">
                <!-- Payment info will be added here -->
            </div>
            
            <button class="close-modal" id="closeReceipt">Close Receipt</button>
        </div>
    </div>

    <!-- View Receipt Modal -->
    <div class="modal" id="viewReceiptModal">
        <div class="modal-content">
            <div class="receipt-header">
                <h2>CaffEase</h2>
                <p id="viewReceiptBranch">Lumangbayan Branch</p>
                <p id="viewReceiptDate"></p>
                <p><strong>Cashier:</strong> <span id="viewReceiptCashier"></span></p>

            </div>
            
            <div class="receipt-items" id="viewReceiptItems">
                <!-- Receipt items will be populated by JavaScript -->
            </div>
            
            <div class="receipt-total">
                <span>Total:</span>
                <span id="viewReceiptTotal">₱0.00</span>
            </div>
            
            <div id="viewReceiptPaymentInfo">
                <!-- Payment info will be added here -->
            </div>
            
            <button class="close-modal" id="closeViewReceipt">Close Receipt</button>
        </div>
    </div>


    <!-- Toast Notification Container -->
    <div id="toastContainer" class="toast-container"></div>

    <!-- Add User Modal -->
    <div class="modal" id="addUserModal">
        <div class="modal-content">
            <h2 class="form-title">Add User</h2>

            <div class="form-group">
                <label for="userFullName">Full Name *</label>
                <input type="text" id="userFullName" class="form-control" placeholder="Enter full name" required>
            </div>

            <div class="form-group">
                <label for="userUsername">Username *</label>
                <input type="text" id="userUsername" class="form-control" placeholder="Enter username" required>
            </div>

            <div class="form-group">
                <label for="userPassword">Password *</label>
                <input type="password" id="userPassword" class="form-control" placeholder="Enter password" required>
            </div>

            <div class="form-row">
                <div class="form-column">
                    <div class="form-group">
                        <label for="userRole">Role *</label>
                        <select id="userRole" class="form-control" required>
                            <option value="">Select role</option>
                            <option value="cashier">Cashier</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
                <div class="form-column">
                    <div class="form-group">
                        <label for="userBranch">Branch *</label>
                        <select id="userBranch" class="form-control" required>
                            <option value="">Select branch</option>
                            <option value="lumangbayan">Lumangbayan</option>
                            <option value="pachoca">Pachoca</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="form-group">
                <label for="userEmail">Email Address</label>
                <input type="email" id="userEmail" class="form-control" placeholder="Enter email address">
            </div>

            <div class="form-group">
                <label for="userStatus">Status</label>
                <select id="userStatus" class="form-control">
                    <option value="active" selected>Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            <div class="form-actions">
                <button class="btn btn-secondary" id="cancelUser">Cancel</button>
                <button class="btn btn-success" id="saveUser">Save User</button>
            </div>
        </div>
    </div>

    <!-- DASHBOARD -->
            <div class="content-section" id="dashboard-section">
                <div class="dashboard-section">
                    <div class="section-top">
                        <h2 class="section-title"><i class="fas fa-tachometer-alt"></i> Dashboard</h2>

                        <div class="section-branch-select" id="dashboardBranchSelectWrapper" style="display:none;">
                            <label>View branch:</label>
                            <select id="dashboardBranchSelect" class="form-control">
                                <option value="lumangbayan">Lumangbayan</option>
                                <option value="pachoca">Pachoca</option>
                            </select>
                        </div>
                    </div>

                    <div class="dashboard-grid">
                        <div class="dashboard-card"><div class="dashboard-card-title"><i class="fas fa-money-bill-wave"></i> Total Revenue</div><div class="dashboard-card-value" id="todayRevenue">₱0.00</div></div>
                        <div class="dashboard-card"><div class="dashboard-card-title"><i class="fas fa-shopping-cart"></i> Total Orders</div><div class="dashboard-card-value" id="todayOrders">0</div></div>
                        <div class="dashboard-card"><div class="dashboard-card-title"><i class="fas fa-users"></i> Active Staff</div><div class="dashboard-card-value" id="activeStaff">0</div></div>
                    </div>

                    <div class="dashboard-chart">
                        <h3><i class="fas fa-chart-line"></i>Top 5 Selling Products</h3>

                        <canvas id="salesChart" height="120"></canvas>
                    </div>
                </div>
            </div>


            <!-- USER MANAGEMENT -->
            <div class="content-section" id="user-management-section">
                <div class="user-management-section">

                    <div class="section-top">
                        <h2 class="section-title"><i class="fas fa-users"></i> User Management</h2>

                        <div class="section-branch-select" id="usersBranchSelectWrapper" style="display:none;">
                            <label>View branch:</label>
                            <select id="usersBranchSelect" class="form-control">
                                <option value="all">All Branches</option>
                                <option value="lumangbayan">Lumangbayan</option>
                                <option value="pachoca">Pachoca</option>
                            </select>
                        </div>
                    </div>

                    <div class="user-management-controls">
                        <div class="search-box">
                            <input type="text" id="userSearch" class="search-input" placeholder="Search users...">
                            <button class="btn btn-primary" id="searchUsers"><i class="fas fa-search"></i> Search</button>
                        </div>

                        <button class="btn btn-success btn-small" id="addUser"><i class="fas fa-user-plus"></i> Add User</button>
                    </div>

                    <table class="user-management-table">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Role</th>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Branch</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody id="userManagementBody">
                            <tr>
                                <td colspan="7" style="text-align:center;padding:40px;color:var(--primary-light);">
                                    <i class="fas fa-users" style="font-size:3rem;margin-bottom:10px;display:block;"></i>
                                    No users found
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- ORDER HISTORY -->
            <div class="content-section" id="order-history-section">
                <div class="order-history-section">

                    <div class="section-top">
                        <h2 class="section-title"><i class="fas fa-history"></i> Order History</h2>

                        <div class="section-branch-select" id="ordersBranchSelectWrapper" style="display:none;">
                            <label>View branch:</label>
                            <select id="ordersBranchSelect" class="form-control branch-filter">
                                <option value="lumangbayan">Lumangbayan</option>
                                <option value="pachoca">Pachoca</option>
                            </select>
                        </div>
                    </div>

                    <div class="order-history-controls">
                        <div class="search-box">
                            <input type="text" id="orderSearch" class="search-input" placeholder="Search orders...">
                            <button class="btn btn-primary" id="searchOrders"><i class="fas fa-search"></i> Search</button>
                        </div>
                    </div>

                    <table class="order-history-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date & Time</th>
                                <th>Items</th>
                                <th>Total Amount</th>
                                <th>Payment Method</th>
                                <th>Status</th>
                                <th>Receipt</th>
                            </tr>
                        </thead>

                        <tbody id="orderHistoryBody">
                            <tr>
                                <td colspan="6" style="text-align:center;padding:40px;color:var(--primary-light);">
                                    <i class="fas fa-inbox" style="font-size:3rem;margin-bottom:10px;display:block;"></i>
                                    No orders found
                                </td>
                            </tr>
                        </tbody>
                    </table>

                </div>
            </div>

        </div>
    </div>
</div>

<!-- EDIT USER MODAL -->
<div class="modal" id="editUserModal" style="display:none;">
    <div class="modal-content">
        <h2 class="form-title">Edit User</h2>

        <input type="hidden" id="editUserId">

        <div class="form-group">
            <label for="editUserFullName">Full Name *</label>
            <input type="text" id="editUserFullName" class="form-control" placeholder="Enter full name" required>
        </div>

        <div class="form-group">
            <label for="editUserUsername">Username *</label>
            <input type="text" id="editUserUsername" class="form-control" placeholder="Enter username" required>
        </div>

        <div class="form-row">
            <div class="form-column">
                <div class="form-group">
                    <label for="editUserRole">Role *</label>
                    <select id="editUserRole" class="form-control" required>
                        <option value="">Select role</option>
                        <option value="cashier">Cashier</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
            </div>
            <div class="form-column">
                <div class="form-group">
                    <label for="editUserBranch">Branch *</label>
                    <select id="editUserBranch" class="form-control" required>
                        <option value="">Select branch</option>
                        <option value="lumangbayan">Lumangbayan</option>
                        <option value="pachoca">Pachoca</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="form-group">
            <label for="editUserEmail">Email Address</label>
            <input type="email" id="editUserEmail" class="form-control" placeholder="Enter email address">
        </div>

        <div class="form-group">
            <label for="editUserStatus">Status</label>
            <select id="editUserStatus" class="form-control">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
            </select>
        </div>

        <div class="form-group">
            <label for="editUserPassword">New Password (optional)</label>
            <input type="password" id="editUserPassword" class="form-control" placeholder="Leave blank to keep current">
        </div>

        <div class="form-actions">
            <button class="btn btn-secondary" onclick="document.getElementById('editUserModal').style.display='none'">Cancel</button>
            <button class="btn btn-primary" onclick="saveEditedUser()">Save Changes</button>
        </div>
    </div>
</div>


<script src="{{ asset('js/pos.js') }}"></script>


</body>
</html>
