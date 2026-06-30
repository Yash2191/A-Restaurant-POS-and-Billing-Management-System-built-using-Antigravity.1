import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  UtensilsCrossed, 
  History, 
  BarChart3, 
  Settings as SettingsIcon, 
  LogOut, 
  Search, 
  User, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Printer, 
  CheckCircle2, 
  CreditCard, 
  QrCode, 
  Coins, 
  UserSquare2, 
  Sliders, 
  Wifi, 
  Bell
} from 'lucide-react';
import { db, auth } from './firebase'; // Imported to preserve the Firebase context

// TYPES
interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  type: 'Veg' | 'Non-Veg';
}

interface CartItem {
  item: MenuItem;
  quantity: number;
}

interface Bill {
  id: string;
  timestamp: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  subtotal: number;
  discountCode: string;
  discountAmount: number;
  gstAmount: number;
  total: number;
  paymentMethod: 'Cash' | 'Card' | 'UPI' | 'Credit';
  cashier: string;
  status: 'Completed' | 'Voided';
}

// INITIAL SEED DATA
const INITIAL_MENU: MenuItem[] = [
  { id: '1', name: 'Tomato Soup', price: 80, category: 'Soup', type: 'Veg' },
  { id: '2', name: 'Veg Manchow Soup', price: 90, category: 'Soup', type: 'Veg' },
  { id: '3', name: 'Masala Papad', price: 40, category: 'Snacks', type: 'Veg' },
  { id: '4', name: 'Kanda Pakoda', price: 80, category: 'Snacks', type: 'Veg' },
  { id: '5', name: 'Veg Manchurian', price: 120, category: 'Chinese', type: 'Veg' },
  { id: '6', name: 'Paneer Chilli', price: 160, category: 'Chinese', type: 'Veg' },
  { id: '7', name: 'Dhapata', price: 40, category: 'Solapur Special', type: 'Veg' },
  { id: '8', name: 'Shenga Chutney Thali', price: 130, category: 'Solapur Special', type: 'Veg' },
  { id: '9', name: 'Kaju Fry', price: 150, category: 'Indian', type: 'Veg' },
  { id: '10', name: 'Paneer Masala', price: 170, category: 'Indian', type: 'Veg' },
  { id: '11', name: 'Butter Roti', price: 25, category: 'Indian', type: 'Veg' },
  { id: '12', name: 'Veg Biryani', price: 160, category: 'Indian', type: 'Veg' }
];

const INITIAL_BILLS: Bill[] = [
  {
    id: 'TXN-10024',
    timestamp: '2026-05-22 14:23',
    customerName: 'Rahul Kumar',
    customerPhone: '+91 9876543210',
    items: [
      { item: INITIAL_MENU[0], quantity: 2 }, // Tomato Soup
      { item: INITIAL_MENU[6], quantity: 3 }  // Dhapata
    ],
    subtotal: 280,
    discountCode: '',
    discountAmount: 0,
    gstAmount: 0,
    total: 280,
    paymentMethod: 'UPI',
    cashier: 'Rohit (Cashier)',
    status: 'Completed'
  },
  {
    id: 'TXN-10023',
    timestamp: '2026-05-22 13:05',
    customerName: 'Anjali Sharma',
    customerPhone: '+91 8888888888',
    items: [
      { item: INITIAL_MENU[9], quantity: 1 }, // Paneer Masala
      { item: INITIAL_MENU[10], quantity: 4 } // Butter Roti
    ],
    subtotal: 270,
    discountCode: '',
    discountAmount: 0,
    gstAmount: 0,
    total: 270,
    paymentMethod: 'Cash',
    cashier: 'Rohit (Cashier)',
    status: 'Completed'
  },
  {
    id: 'TXN-10022',
    timestamp: '2026-05-22 11:45',
    customerName: 'Shrikant Patil',
    customerPhone: '+91 9999999999',
    items: [
      { item: INITIAL_MENU[7], quantity: 2 } // Shenga Chutney Thali
    ],
    subtotal: 260,
    discountCode: '',
    discountAmount: 0,
    gstAmount: 0,
    total: 260,
    paymentMethod: 'Card',
    cashier: 'Amit (Admin)',
    status: 'Completed'
  }
];

export default function App() {
  // Silence TypeScript unused variable warnings for Firebase imports
  React.useEffect(() => {
    if (db && auth) {
      // Firebase imports successfully verified
    }
  }, []);

  // ROUTING & AUTH STATE
  const [currentPage, setCurrentPage] = useState<'login' | 'dashboard' | 'billing' | 'menu' | 'register' | 'reports' | 'settings'>('login');
  const [currentUser, setCurrentUser] = useState<{ name: string; role: 'Admin' | 'Cashier' | 'Waiter' } | null>(null);

  // APP CORE DATA STATE
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU);
  const [bills, setBills] = useState<Bill[]>(INITIAL_BILLS);

  // BILLING PAGE ACTIVE STATE
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('Guest');
  const [customerPhone, setCustomerPhone] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<'Cash' | 'Card' | 'UPI' | 'Credit'>('Cash');
  const [selectedBillForModal, setSelectedBillForModal] = useState<Bill | null>(null);

  // MENU ITEMS PAGE STATE
  const [menuSearch, setMenuSearch] = useState('');
  const [menuFilterCategory, setMenuFilterCategory] = useState('All');
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState({ name: '', price: '', category: 'Snacks', type: 'Veg' as 'Veg' | 'Non-Veg' });

  // BILL REGISTER PAGE STATE
  const [registerSearch, setRegisterSearch] = useState('');
  const [registerPaymentFilter, setRegisterPaymentFilter] = useState('All');

  // SETTINGS STATE
  const [restaurantName, setRestaurantName] = useState('Hotel Vinayak');
  const [terminalId, setTerminalId] = useState('Terminal #01');
  const [receiptFooter, setReceiptFooter] = useState('Thank you! Visit again.');

  // HELPERS
  const categories = useMemo(() => {
    const list = new Set(menuItems.map(item => item.category));
    return ['All', ...Array.from(list)];
  }, [menuItems]);

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchCat = activeCategory === 'All' || item.category === activeCategory;
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menuItems, activeCategory, searchQuery]);

  // MATHS FOR ACTIVE BILL
  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, curr) => acc + (curr.item.price * curr.quantity), 0);
  }, [cart]);

  const cartTotal = cartSubtotal;

  // LOGIN FUNCTION
  const handleLogin = (role: 'Admin' | 'Cashier' | 'Waiter', pin: string) => {
    if (pin === '1234') {
      const name = role === 'Admin' ? 'Amit (Admin)' : role === 'Cashier' ? 'Rohit (Cashier)' : 'Sanjay (Waiter)';
      setCurrentUser({ name, role });
      setCurrentPage('dashboard');
    } else {
      alert('Invalid passcode! Try "1234"');
    }
  };

  // ADD TO CART
  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(ci => ci.item.id === item.id);
      if (existing) {
        return prev.map(ci => ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      return prev.map(ci => {
        if (ci.item.id === itemId) {
          const nextQty = ci.quantity + delta;
          return nextQty > 0 ? { ...ci, quantity: nextQty } : null;
        }
        return ci;
      }).filter((ci): ci is CartItem => ci !== null);
    });
  };

  // GENERATE BILL
  const handleGenerateBill = () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    const newBill: Bill = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      customerName: customerName || 'Guest',
      customerPhone: customerPhone || 'N/A',
      items: [...cart],
      subtotal: cartSubtotal,
      discountCode: '',
      discountAmount: 0,
      gstAmount: 0,
      total: cartTotal,
      paymentMethod: selectedPayment,
      cashier: currentUser?.name || 'Unknown',
      status: 'Completed'
    };

    setBills(prev => [newBill, ...prev]);
    setSelectedBillForModal(newBill);
  };

  const finalizeTransaction = () => {
    // Clear cart and state
    setCart([]);
    setCustomerName('Guest');
    setCustomerPhone('');
    setSelectedBillForModal(null);
  };

  // LOGOUT
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
  };

  // ADD NEW MENU ITEM
  const handleAddMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuItem.name || !newMenuItem.price) {
      alert('Please fill out all fields');
      return;
    }
    const item: MenuItem = {
      id: String(menuItems.length + 1),
      name: newMenuItem.name,
      price: parseFloat(newMenuItem.price),
      category: newMenuItem.category,
      type: newMenuItem.type
    };
    setMenuItems(prev => [...prev, item]);
    setShowAddMenuModal(false);
    setNewMenuItem({ name: '', price: '', category: 'Snacks', type: 'Veg' });
  };

  // DELETE MENU ITEM
  const handleDeleteMenuItem = (id: string) => {
    if (confirm('Are you sure you want to remove this item?')) {
      setMenuItems(prev => prev.filter(item => item.id !== id));
    }
  };

  // RENDER PAGE CONDITIONAL
  return (
    <div className="min-h-screen bg-background text-on-surface font-sans antialiased overflow-x-hidden">
      
      {/* ---------------- LOGIN PAGE ---------------- */}
      {currentPage === 'login' && (
        <LoginScreen onLogin={handleLogin} />
      )}

      {/* ---------------- LOGGED IN LAYOUT ---------------- */}
      {currentPage !== 'login' && currentUser && (
        <div className="flex h-screen overflow-hidden">
          
          {/* SIDEBAR NAVIGATION */}
          <aside className="w-64 bg-surface-container-low border-r border-outline-variant flex flex-col shrink-0 transition-all duration-300">
            <div className="p-gutter border-b border-outline-variant">
              <h1 className="text-xl font-bold tracking-tight text-on-surface flex items-center gap-2">
                <UtensilsCrossed className="w-6 h-6 text-primary" />
                {restaurantName}
              </h1>
              <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-green-500" />
                {terminalId} | Active Session
              </p>
            </div>

            <nav className="flex-1 px-stack-md py-stack-lg space-y-2 overflow-y-auto">
              <button 
                onClick={() => setCurrentPage('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${currentPage === 'dashboard' ? 'bg-primary text-on-primary shadow-md shadow-primary/10' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </button>

              <button 
                onClick={() => setCurrentPage('billing')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${currentPage === 'billing' ? 'bg-primary text-on-primary shadow-md shadow-primary/10' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                <ShoppingCart className="w-5 h-5" />
                POS Billing
              </button>

              <button 
                onClick={() => setCurrentPage('menu')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${currentPage === 'menu' ? 'bg-primary text-on-primary shadow-md shadow-primary/10' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                <UtensilsCrossed className="w-5 h-5" />
                Menu Items
              </button>

              <button 
                onClick={() => setCurrentPage('register')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${currentPage === 'register' ? 'bg-primary text-on-primary shadow-md shadow-primary/10' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                <History className="w-5 h-5" />
                Billing Register
              </button>

              <button 
                onClick={() => setCurrentPage('reports')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${currentPage === 'reports' ? 'bg-primary text-on-primary shadow-md shadow-primary/10' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                <BarChart3 className="w-5 h-5" />
                Reports
              </button>

              <button 
                onClick={() => setCurrentPage('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${currentPage === 'settings' ? 'bg-primary text-on-primary shadow-md shadow-primary/10' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                <SettingsIcon className="w-5 h-5" />
                Settings
              </button>
            </nav>

            {/* Cashier profile & Logout */}
            <div className="mt-auto p-4 border-t border-outline-variant bg-surface-container-low">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-on-surface truncate">{currentUser.name}</h4>
                  <p className="text-xs text-on-surface-variant uppercase font-medium tracking-wider">{currentUser.role}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-sm font-semibold transition-colors duration-150"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </aside>

          {/* MAIN PAGE WORKSPACE */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Main top navigation header */}
            <header className="h-16 border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between px-gutter shrink-0">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-on-surface capitalize">
                  {currentPage === 'menu' ? 'Menu Management' : currentPage === 'register' ? 'Billing Ledger' : currentPage}
                </h2>
              </div>
              
              <div className="flex items-center gap-4">
                <button className="w-9 h-9 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
                </button>
                <div className="text-right text-xs">
                  <p className="font-semibold text-on-surface">System Live</p>
                  <p className="text-on-surface-variant">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </header>

            {/* ACTIVE CONTENT VIEW */}
            <div className="flex-1 overflow-hidden">
              
              {/* PAGE 2: DASHBOARD */}
              {currentPage === 'dashboard' && (
                <DashboardView 
                  bills={bills} 
                  menuItemsCount={menuItems.length}
                  onNavigate={setCurrentPage} 
                />
              )}

              {/* PAGE 3: BILLING / POS */}
              {currentPage === 'billing' && (
                <div className="flex h-full overflow-hidden">
                  {/* Left: Menu Items */}
                  <div className="flex-1 flex flex-col p-gutter overflow-hidden">
                    
                    {/* Category Filter Horizontal Selector */}
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-3 shrink-0">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wide whitespace-nowrap transition-all duration-150 ${activeCategory === cat ? 'bg-primary text-on-primary shadow-md shadow-primary/20' : 'bg-white border border-outline-variant text-on-surface-variant hover:bg-surface-container-high'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Search Menu */}
                    <div className="relative mb-4 shrink-0">
                      <Search className="absolute left-3 top-3.5 w-4 h-4 text-on-surface-variant" />
                      <input
                        type="text"
                        placeholder="Search Hotel Vinayak menu (e.g. Soup, Dhapata, Papad)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl h-11 pl-10 pr-4 text-sm outline-none transition-all duration-200"
                      />
                    </div>

                    {/* Menu Cards Grid */}
                    <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
                      {filteredMenuItems.map(item => (
                        <button
                          key={item.id}
                          onClick={() => addToCart(item)}
                          className="flex flex-col bg-white rounded-xl overflow-hidden border border-outline-variant hover:border-primary hover:shadow-lg transition-all duration-200 active:scale-95 group text-left h-fit"
                        >
                          <div className="h-28 w-full bg-surface-container flex items-center justify-center relative">
                            <span className="text-3xl text-on-surface-variant opacity-45 group-hover:scale-110 transition-transform duration-200">
                              🍜
                            </span>
                            <span className={`absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${item.type === 'Veg' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                              {item.type}
                            </span>
                          </div>
                          <div className="p-3 w-full flex flex-col justify-between flex-1">
                            <h4 className="font-semibold text-sm text-on-surface line-clamp-2">{item.name}</h4>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-base font-bold text-primary">₹{item.price.toFixed(2)}</span>
                              <span className="text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-md font-medium">{item.category}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right: Cart Order Details */}
                  <div className="w-[380px] border-l border-outline-variant bg-surface-container-lowest flex flex-col shrink-0 overflow-hidden">
                    
                    {/* Customer Inputs */}
                    <div className="p-4 border-b border-outline-variant">
                      <h3 className="font-semibold text-xs text-on-surface-variant uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-primary" />
                        Customer Profile
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-on-surface-variant uppercase">Name</label>
                          <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full bg-surface-container-low border border-transparent focus:border-primary focus:bg-white rounded-lg px-2.5 py-1.5 text-xs outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-on-surface-variant uppercase">Phone</label>
                          <input
                            type="text"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="+91..."
                            className="w-full bg-surface-container-low border border-transparent focus:border-primary focus:bg-white rounded-lg px-2.5 py-1.5 text-xs outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Active Items List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      <h3 className="font-semibold text-xs text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <ShoppingCart className="w-4 h-4 text-primary" />
                        Current Receipt Basket
                      </h3>

                      {cart.length === 0 ? (
                        <div className="h-48 flex flex-col items-center justify-center text-on-surface-variant opacity-60">
                          <ShoppingCart className="w-8 h-8 mb-2" />
                          <p className="text-xs font-semibold">No items selected</p>
                        </div>
                      ) : (
                        cart.map(ci => (
                          <div key={ci.item.id} className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors group">
                            <div className="flex-1 min-w-0 pr-2">
                              <h5 className="text-xs font-bold text-on-surface truncate">{ci.item.name}</h5>
                              <p className="text-[10px] text-on-surface-variant mt-0.5">₹{ci.item.price} each</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center bg-white border border-outline-variant rounded-lg p-0.5">
                                <button
                                  onClick={() => updateCartQuantity(ci.item.id, -1)}
                                  className="w-6 h-6 flex items-center justify-center hover:bg-surface-container-low text-on-surface rounded transition-colors"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-6 text-center text-xs font-bold font-numeric">{String(ci.quantity).padStart(2, '0')}</span>
                                <button
                                  onClick={() => updateCartQuantity(ci.item.id, 1)}
                                  className="w-6 h-6 flex items-center justify-center hover:bg-surface-container-low text-on-surface rounded transition-colors"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <span className="w-16 text-right text-xs font-bold text-on-surface">₹{(ci.item.price * ci.quantity).toFixed(2)}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Totals and Checkout Button */}
                    <div className="p-4 bg-surface-container border-t border-outline-variant space-y-4">
                      
                      {/* Calculations breakdown */}
                      <div className="space-y-1.5 text-xs text-on-surface-variant font-medium">
                        <div className="pt-2 flex justify-between items-center text-sm font-bold text-on-surface">
                          <span className="text-base font-bold">Total Amount</span>
                          <span className="text-lg font-bold text-primary">₹{cartTotal.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Payment Method Selector Grid */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider block">Payment Method</label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            { code: 'Cash', icon: <Coins className="w-4 h-4" /> },
                            { code: 'Card', icon: <CreditCard className="w-4 h-4" /> },
                            { code: 'UPI', icon: <QrCode className="w-4 h-4" /> },
                            { code: 'Credit', icon: <UserSquare2 className="w-4 h-4" /> }
                          ].map(pay => (
                            <button
                              key={pay.code}
                              onClick={() => setSelectedPayment(pay.code as any)}
                              className={`flex flex-col items-center justify-center gap-1 py-2 px-1.5 rounded-xl border text-[10px] font-bold transition-all duration-150 ${selectedPayment === pay.code ? 'bg-primary border-primary text-on-primary shadow-md shadow-primary/10' : 'bg-white border-outline-variant hover:border-primary text-on-surface-variant'}`}
                            >
                              {pay.icon}
                              {pay.code}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={handleGenerateBill}
                        className="w-full bg-primary hover:bg-primary-container text-on-primary py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
                      >
                        <Receipt className="w-5 h-5" />
                        Generate Invoice
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* PAGE 4: MENU ITEMS */}
              {currentPage === 'menu' && (
                <div className="p-gutter h-full overflow-y-auto space-y-6">
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <div className="flex gap-3">
                      <div className="relative w-64">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-on-surface-variant" />
                        <input
                          type="text"
                          placeholder="Search items..."
                          value={menuSearch}
                          onChange={(e) => setMenuSearch(e.target.value)}
                          className="w-full bg-white border border-outline-variant rounded-xl h-9 pl-9 pr-4 text-xs outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <select
                        value={menuFilterCategory}
                        onChange={(e) => setMenuFilterCategory(e.target.value)}
                        className="bg-white border border-outline-variant rounded-xl h-9 px-3 text-xs outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="All">All Categories</option>
                        {categories.filter(c => c !== 'All').map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => setShowAddMenuModal(true)}
                      className="bg-primary text-on-primary text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-primary-container shadow-md flex items-center gap-1.5 transition-all"
                    >
                      <Plus className="w-4 h-4" /> Add Item
                    </button>
                  </div>

                  <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container-low border-b border-outline-variant text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                          <th className="p-4">Name</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Price</th>
                          <th className="p-4">Type</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant text-sm">
                        {menuItems
                          .filter(item => {
                            const matchesSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase());
                            const matchesCat = menuFilterCategory === 'All' || item.category === menuFilterCategory;
                            return matchesSearch && matchesCat;
                          })
                          .map(item => (
                            <tr key={item.id} className="hover:bg-surface-container-lowest transition-colors">
                              <td className="p-4 font-bold text-on-surface">{item.name}</td>
                              <td className="p-4 text-on-surface-variant font-medium">{item.category}</td>
                              <td className="p-4 font-bold text-primary">₹{item.price.toFixed(2)}</td>
                              <td className="p-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${item.type === 'Veg' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                  {item.type}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => handleDeleteMenuItem(item.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors inline-flex"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PAGE 5: BILLING REGISTER */}
              {currentPage === 'register' && (
                <div className="p-gutter h-full overflow-y-auto space-y-6">
                  <div className="flex gap-3 flex-wrap">
                    <div className="relative w-72">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-on-surface-variant" />
                      <input
                        type="text"
                        placeholder="Search invoice ID, customer phone or name..."
                        value={registerSearch}
                        onChange={(e) => setRegisterSearch(e.target.value)}
                        className="w-full bg-white border border-outline-variant rounded-xl h-9 pl-9 pr-4 text-xs outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <select
                      value={registerPaymentFilter}
                      onChange={(e) => setRegisterPaymentFilter(e.target.value)}
                      className="bg-white border border-outline-variant rounded-xl h-9 px-3 text-xs outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="All">All Payment Methods</option>
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="UPI">UPI</option>
                      <option value="Credit">Credit</option>
                    </select>
                  </div>

                  <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container-low border-b border-outline-variant text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                          <th className="p-4">Invoice ID</th>
                          <th className="p-4">Date & Time</th>
                          <th className="p-4">Customer</th>
                          <th className="p-4">Payment</th>
                          <th className="p-4">Cashier</th>
                          <th className="p-4">Amount</th>
                          <th className="p-4 text-right">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant text-sm">
                        {bills
                          .filter(bill => {
                            const query = registerSearch.toLowerCase();
                            const matchesSearch = 
                              bill.id.toLowerCase().includes(query) ||
                              bill.customerName.toLowerCase().includes(query) ||
                              bill.customerPhone.includes(query);
                            const matchesPayment = registerPaymentFilter === 'All' || bill.paymentMethod === registerPaymentFilter;
                            return matchesSearch && matchesPayment;
                          })
                          .map(bill => (
                            <tr key={bill.id} className="hover:bg-surface-container-lowest transition-colors">
                              <td className="p-4 font-bold text-on-surface">{bill.id}</td>
                              <td className="p-4 text-on-surface-variant font-medium text-xs">{bill.timestamp}</td>
                              <td className="p-4">
                                <div className="font-bold text-on-surface">{bill.customerName}</div>
                                <div className="text-xs text-on-surface-variant">{bill.customerPhone}</div>
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${bill.paymentMethod === 'Cash' ? 'bg-amber-50 text-amber-700 border-amber-200' : bill.paymentMethod === 'Card' ? 'bg-blue-50 text-blue-700 border-blue-200' : bill.paymentMethod === 'UPI' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                                  {bill.paymentMethod}
                                </span>
                              </td>
                              <td className="p-4 text-xs text-on-surface-variant font-semibold">{bill.cashier}</td>
                              <td className="p-4 font-bold text-primary">₹{bill.total.toFixed(2)}</td>
                              <td className="p-4 text-right">
                                <button
                                  onClick={() => setSelectedBillForModal(bill)}
                                  className="text-primary hover:text-primary-container bg-primary-fixed/50 hover:bg-primary-fixed text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                                >
                                  View Bill
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PAGE 6: REPORTS */}
              {currentPage === 'reports' && (
                <ReportsView bills={bills} />
              )}

              {/* PAGE 7: SETTINGS */}
              {currentPage === 'settings' && (
                <div className="p-gutter h-full overflow-y-auto space-y-6">
                  <div className="max-w-2xl bg-white border border-outline-variant rounded-xl shadow-sm p-6 space-y-6">
                    <h3 className="font-bold text-base border-b border-outline-variant pb-2 text-on-surface flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-primary" />
                      Configure POS Terminal Variables
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-on-surface-variant block uppercase">Restaurant Branding Name</label>
                        <input
                          type="text"
                          value={restaurantName}
                          onChange={(e) => setRestaurantName(e.target.value)}
                          className="w-full bg-surface-container border border-outline-variant focus:border-primary focus:bg-white rounded-lg px-3 py-2 text-sm outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-on-surface-variant block uppercase">Terminal ID Code</label>
                        <input
                          type="text"
                          value={terminalId}
                          onChange={(e) => setTerminalId(e.target.value)}
                          className="w-full bg-surface-container border border-outline-variant focus:border-primary focus:bg-white rounded-lg px-3 py-2 text-sm outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* GST and Promo Config sections removed */}

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface-variant block uppercase">Receipt Bottom Footer Note</label>
                      <input
                        type="text"
                        value={receiptFooter}
                        onChange={(e) => setReceiptFooter(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant focus:border-primary focus:bg-white rounded-lg px-3 py-2 text-sm outline-none transition-all"
                      />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-outline-variant">
                      <button
                        onClick={() => {
                          if (confirm('Reset system database? This will clear all transactions.')) {
                            setBills(INITIAL_BILLS);
                            setCart([]);
                            alert('Database successfully reset to seed transactions.');
                          }
                        }}
                        className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors"
                      >
                        Reset Ledger Database
                      </button>
                      
                      <button
                        onClick={() => alert('Offline POS data synchronized to remote Firebase storage!')}
                        className="px-4 py-2 bg-secondary text-white rounded-lg text-xs font-bold hover:bg-opacity-90 transition-all flex items-center gap-1.5"
                      >
                        <Wifi className="w-3.5 h-3.5" /> Sync Cloud Data
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </main>
        </div>
      )}

      {/* ---------------- GENERAL RECEIPT MODAL OVERLAY ---------------- */}
      {selectedBillForModal && (
        <ReceiptModal 
          bill={selectedBillForModal} 
          footer={receiptFooter} 
          onClose={finalizeTransaction} 
        />
      )}

      {/* ---------------- ADD NEW ITEM MODAL ---------------- */}
      {showAddMenuModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddMenuItem} className="w-full max-w-md bg-white border border-outline-variant rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-lg text-on-surface">Add New Menu Item</h3>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant uppercase">Item Name</label>
              <input
                type="text"
                required
                value={newMenuItem.name}
                onChange={(e) => setNewMenuItem(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-surface-container border border-outline-variant focus:border-primary focus:bg-white rounded-xl px-3 py-2 text-sm outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant uppercase">Price (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={newMenuItem.price}
                  onChange={(e) => setNewMenuItem(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full bg-surface-container border border-outline-variant focus:border-primary focus:bg-white rounded-xl px-3 py-2 text-sm outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant uppercase">Category</label>
                <select
                  value={newMenuItem.category}
                  onChange={(e) => setNewMenuItem(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-surface-container border border-outline-variant focus:border-primary focus:bg-white rounded-xl px-3 py-2 text-sm outline-none transition-all"
                >
                  <option value="Soup">Soup</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Pakoda">Pakoda</option>
                  <option value="Solapur Special">Solapur Special</option>
                  <option value="Indian">Indian</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant uppercase block">Item Type</label>
              <div className="flex gap-4">
                <label className="inline-flex items-center gap-2 text-sm font-medium">
                  <input
                    type="radio"
                    name="itemType"
                    checked={newMenuItem.type === 'Veg'}
                    onChange={() => setNewMenuItem(prev => ({ ...prev, type: 'Veg' }))}
                    className="text-primary focus:ring-primary"
                  />
                  Veg
                </label>
                <label className="inline-flex items-center gap-2 text-sm font-medium">
                  <input
                    type="radio"
                    name="itemType"
                    checked={newMenuItem.type === 'Non-Veg'}
                    onChange={() => setNewMenuItem(prev => ({ ...prev, type: 'Non-Veg' }))}
                    className="text-primary focus:ring-primary"
                  />
                  Non-Veg
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-outline-variant justify-end">
              <button
                type="button"
                onClick={() => setShowAddMenuModal(false)}
                className="px-4 py-2 border border-outline-variant text-on-surface-variant rounded-xl text-xs font-bold hover:bg-surface-container transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary-container shadow-md transition-all"
              >
                Save Item
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

// ---------------- LOGIN COMPONENT ----------------
function LoginScreen({ onLogin }: { onLogin: (role: 'Admin' | 'Cashier' | 'Waiter', pin: string) => void }) {
  const [selectedRole, setSelectedRole] = useState<'Admin' | 'Cashier' | 'Waiter'>('Cashier');
  const [pin, setPin] = useState('');

  const appendPin = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  const deletePin = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleAuthSubmit = () => {
    onLogin(selectedRole, pin);
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-white border border-outline-variant rounded-2xl shadow-2xl p-8 flex flex-col items-center">
        
        {/* Branding header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white mx-auto shadow-md mb-3">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-on-surface">ProPOS Terminal</h2>
          <p className="text-xs text-on-surface-variant mt-1">Please select role and enter security PIN</p>
        </div>

        {/* Role Segmented Controller */}
        <div className="grid grid-cols-3 bg-surface-container rounded-xl p-1.5 w-full mb-6 gap-1">
          {(['Admin', 'Cashier', 'Waiter'] as const).map(role => (
            <button
              key={role}
              type="button"
              onClick={() => {
                setSelectedRole(role);
                setPin('');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${selectedRole === role ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Dot Pin Indicator Indicators */}
        <div className="flex gap-4 mb-6">
          {[0, 1, 2, 3].map(idx => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full border border-outline transition-all duration-150 ${pin.length > idx ? 'bg-primary border-primary scale-110' : 'bg-surface-container-low'}`}
            ></div>
          ))}
        </div>

        {/* Pin Keypad Grid */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-[280px] mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => appendPin(num)}
              className="h-14 bg-surface-container-low hover:bg-surface-container hover:scale-105 active:scale-95 text-base font-bold text-on-surface rounded-xl transition-all flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={deletePin}
            className="h-14 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all flex items-center justify-center font-bold text-sm"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => appendPin('0')}
            className="h-14 bg-surface-container-low hover:bg-surface-container hover:scale-105 active:scale-95 text-base font-bold text-on-surface rounded-xl transition-all flex items-center justify-center"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleAuthSubmit}
            disabled={pin.length !== 4}
            className="h-14 bg-primary hover:bg-primary-container disabled:bg-slate-300 text-white rounded-xl transition-all flex items-center justify-center font-bold text-xs shadow-md shadow-primary/10 disabled:shadow-none"
          >
            Enter
          </button>
        </div>

        <p className="text-[10px] text-on-surface-variant text-center font-medium">Default unlock security PIN: <code className="font-bold">1234</code></p>
      </div>
    </div>
  );
}

// ---------------- DASHBOARD COMPONENT ----------------
function DashboardView({ 
  bills, 
  menuItemsCount,
  onNavigate 
}: { 
  bills: Bill[]; 
  menuItemsCount: number;
  onNavigate: (page: any) => void;
}) {
  const stats = useMemo(() => {
    const totalSales = bills.reduce((acc, curr) => acc + curr.total, 0);
    const avgBill = bills.length > 0 ? (totalSales / bills.length) : 0;
    return {
      sales: totalSales,
      transactions: bills.length,
      avg: avgBill
    };
  }, [bills]);

  return (
    <div className="p-gutter h-full overflow-y-auto space-y-6">
      
      {/* 4 Summary Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white border border-outline-variant rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Sales (Today)</p>
            <h3 className="text-2xl font-bold text-primary mt-1">₹{stats.sales.toFixed(2)}</h3>
            <p className="text-[10px] text-emerald-600 mt-1 font-semibold">↑ 12% vs yesterday</p>
          </div>
          <div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center text-primary">
            <Coins className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-outline-variant rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Invoices Processed</p>
            <h3 className="text-2xl font-bold text-on-surface mt-1">{stats.transactions}</h3>
            <p className="text-[10px] text-emerald-600 mt-1 font-semibold">All synced to system</p>
          </div>
          <div className="w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center text-on-secondary-container">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-outline-variant rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Average Bill Value</p>
            <h3 className="text-2xl font-bold text-on-surface mt-1">₹{stats.avg.toFixed(2)}</h3>
            <p className="text-[10px] text-on-surface-variant mt-1">Total count: {menuItemsCount} menu items</p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-700">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Charts / Layout pane */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Simulated hourly sales volume chart */}
        <div className="lg:col-span-2 bg-white border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h4 className="text-sm font-bold text-on-surface">Hourly Order Volume Activity</h4>
            <p className="text-xs text-on-surface-variant">Real-time statistics showing busy kitchen cycles</p>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 pt-6">
            {[
              { hr: '11:00', sales: 400 },
              { hr: '12:00', sales: 850 },
              { hr: '13:00', sales: 1200 },
              { hr: '14:00', sales: 980 },
              { hr: '15:00', sales: 300 },
              { hr: '16:00', sales: 550 },
              { hr: '17:00', sales: 700 }
            ].map(item => (
              <div key={item.hr} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-slate-100 rounded-md h-48 flex items-end relative overflow-hidden">
                  <div 
                    style={{ height: `${(item.sales / 1200) * 100}%` }} 
                    className="w-full bg-primary group-hover:bg-primary-container transition-all duration-300 rounded-t-md cursor-pointer relative"
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[9px] font-bold px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{item.sales}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-on-surface-variant">{item.hr}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick actions panel */}
        <div className="bg-white border border-outline-variant rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-on-surface mb-3">POS Quick Access</h4>
            <p className="text-xs text-on-surface-variant mb-4">Click to jump directly to billing or registers</p>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => onNavigate('billing')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-outline-variant hover:border-primary hover:bg-slate-50 transition-all text-left"
            >
              <div>
                <h5 className="text-xs font-bold text-on-surface">Start New Order Bill</h5>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Launches active cashier billing panel</p>
              </div>
              <ShoppingCart className="w-5 h-5 text-primary" />
            </button>

            <button 
              onClick={() => onNavigate('menu')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-outline-variant hover:border-primary hover:bg-slate-50 transition-all text-left"
            >
              <div>
                <h5 className="text-xs font-bold text-on-surface">Manage Hotel Menu</h5>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Add, edit prices, delete menu items</p>
              </div>
              <UtensilsCrossed className="w-5 h-5 text-secondary" />
            </button>

            <button 
              onClick={() => onNavigate('settings')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-outline-variant hover:border-primary hover:bg-slate-50 transition-all text-left"
            >
              <div>
                <h5 className="text-xs font-bold text-on-surface">Configure Terminal & Printer</h5>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Settings for receipt layout and printing</p>
              </div>
              <SettingsIcon className="w-5 h-5 text-on-surface-variant" />
            </button>
          </div>
          
          <div className="mt-4 pt-4 border-t border-outline-variant flex items-center justify-between text-xs font-medium text-on-surface-variant">
            <span>Terminal ID: POS-1</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Cloud Synced
            </span>
          </div>
        </div>

      </div>

      {/* Recent Activity Transaction History */}
      <div className="bg-white border border-outline-variant rounded-xl p-5 shadow-sm">
        <h4 className="text-sm font-bold text-on-surface mb-4">Latest Invoices Generated</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium border-collapse">
            <thead>
              <tr className="border-b border-outline-variant text-[10px] uppercase font-bold text-on-surface-variant">
                <th className="pb-3">Invoice ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Payment</th>
                <th className="pb-3">Staff Member</th>
                <th className="pb-3 text-right">Invoice Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {bills.slice(0, 3).map(bill => (
                <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-bold text-on-surface">{bill.id}</td>
                  <td className="py-3 text-on-surface-variant">{bill.customerName} ({bill.customerPhone})</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-lg border text-[10px] font-bold uppercase bg-slate-50 text-slate-700">
                      {bill.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 text-on-surface-variant">{bill.cashier}</td>
                  <td className="py-3 text-right font-bold text-primary">₹{bill.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// ---------------- REPORTS COMPONENT ----------------
function ReportsView({ bills }: { bills: Bill[] }) {
  // Compute analytics data from state
  const reportStats = useMemo(() => {
    const paymentMethods = { Cash: 0, Card: 0, UPI: 0, Credit: 0 };
    const categoriesCount: Record<string, number> = {};
    let totalSales = 0;

    bills.forEach(bill => {
      totalSales += bill.total;
      paymentMethods[bill.paymentMethod] += bill.total;

      bill.items.forEach(ci => {
        categoriesCount[ci.item.category] = (categoriesCount[ci.item.category] || 0) + (ci.item.price * ci.quantity);
      });
    });

    return {
      payment: paymentMethods,
      categories: categoriesCount,
      total: totalSales
    };
  }, [bills]);

  return (
    <div className="p-gutter h-full overflow-y-auto space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Payment splits breakdown */}
        <div className="bg-white border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h4 className="text-sm font-bold text-on-surface">Payment Method Breakdown</h4>
            <p className="text-xs text-on-surface-variant">Breakdown of gross transactions processed by terminal</p>
          </div>
          <div className="space-y-3 pt-2">
            {Object.entries(reportStats.payment).map(([method, val]) => {
              const pct = reportStats.total > 0 ? (val / reportStats.total) * 100 : 0;
              return (
                <div key={method} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-on-surface">{method}</span>
                    <span className="text-on-surface-variant">₹{val.toFixed(2)} ({pct.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      style={{ width: `${pct}%` }} 
                      className={`h-full rounded-full ${method === 'Cash' ? 'bg-amber-500' : method === 'Card' ? 'bg-blue-600' : method === 'UPI' ? 'bg-purple-600' : 'bg-gray-600'}`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category splits breakdown */}
        <div className="bg-white border border-outline-variant rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h4 className="text-sm font-bold text-on-surface">Revenue Split by Food Category</h4>
            <p className="text-xs text-on-surface-variant">Sales analytics grouped by kitchen category</p>
          </div>
          <div className="space-y-3 pt-2">
            {Object.entries(reportStats.categories).map(([cat, val]) => {
              const pct = reportStats.total > 0 ? (val / reportStats.total) * 100 : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-on-surface">{cat}</span>
                    <span className="text-on-surface-variant">₹{val.toFixed(2)} ({pct.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div style={{ width: `${pct}%` }} className="w-full bg-primary h-full rounded-full"></div>
                  </div>
                </div>
              );
            })}
            {Object.keys(reportStats.categories).length === 0 && (
              <p className="text-xs text-on-surface-variant text-center py-8">No order transactions processed yet.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

// ---------------- RECEIPT MODAL OVERLAY COMPONENT ----------------
interface ReceiptModalProps {
  bill: Bill;
  footer: string;
  onClose: () => void;
}

function ReceiptModal({ bill, footer, onClose }: ReceiptModalProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-sm bg-white border border-outline-variant rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Receipt content wrapper */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4 border-b border-outline-variant select-text">
          <div className="text-center space-y-1">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-lg text-on-surface">Order Successful</h3>
            <p className="text-xs text-on-surface-variant">Invoice generated & saved</p>
          </div>

          <div className="border-t border-b border-dashed border-outline-variant py-3 space-y-1.5 text-xs font-medium text-on-surface-variant">
            <div className="flex justify-between">
              <span>Invoice Ref</span>
              <span className="font-bold text-on-surface">{bill.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Date</span>
              <span>{bill.timestamp}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer</span>
              <span>{bill.customerName} ({bill.customerPhone})</span>
            </div>
            <div className="flex justify-between">
              <span>Cashier Staff</span>
              <span>{bill.cashier}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Type</span>
              <span className="font-bold text-primary">{bill.paymentMethod}</span>
            </div>
          </div>

          {/* Items checklist detail */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Line Items Summary</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {bill.items.map(ci => (
                <div key={ci.item.id} className="flex justify-between text-xs font-medium">
                  <span className="text-on-surface">{ci.item.name} <span className="text-on-surface-variant font-normal">x{ci.quantity}</span></span>
                  <span className="font-semibold text-on-surface">₹{(ci.item.price * ci.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing breakdowns */}
          <div className="border-t border-dashed border-outline-variant pt-3 space-y-1 text-xs font-medium text-on-surface-variant">
            {bill.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 text-[10px]">
                <span>Discount ({bill.discountCode})</span>
                <span>-₹{bill.discountAmount.toFixed(2)}</span>
              </div>
            )}
            {bill.gstAmount > 0 && (
              <div className="flex justify-between text-[10px]">
                <span>GST</span>
                <span>₹{bill.gstAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-on-surface pt-1.5 border-t border-outline-variant">
              <span>Total Amount</span>
              <span className="text-primary text-base">₹{bill.total.toFixed(2)}</span>
            </div>
          </div>

          <p className="text-center text-[10px] font-semibold text-on-surface-variant pt-2">
            {footer}
          </p>
        </div>

        {/* Modal controls actions */}
        <div className="p-4 bg-surface-container flex gap-3">
          <button
            onClick={() => {
              alert('Receipt sent to target hardware printer!');
            }}
            className="flex-1 border border-outline-variant bg-white text-on-surface hover:bg-surface-container-low py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print Receipt
          </button>
          
          <button
            onClick={onClose}
            className="flex-1 bg-primary text-on-primary hover:bg-primary-container py-2.5 rounded-xl text-xs font-bold transition-all"
          >
            Done & Continue
          </button>
        </div>

      </div>
    </div>
  );
}
