import React, { useState, useEffect, useCallback } from 'react';


// ─── Helpers ───
const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
const formatDate = (timestamp) => new Date(timestamp).toLocaleDateString('en-US', {
  month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
});

// ─── Data ───
const CONNECTION_PLANS = [
  { id: 'basic', name: 'Basic Connect', price: 29, currency: 'USD',
    features: ['1 Active Connection', 'Up to 100 MB/s', 'Standard Support', '24/7 Uptime'],
    icon: 'fa-bolt', bgColor: 'bg-blue-50', popular: false },
  { id: 'standard', name: 'Standard Connect', price: 59, currency: 'USD',
    features: ['5 Active Connections', 'Up to 500 MB/s', 'Priority Support', '24/7 Uptime', 'Basic Analytics'],
    icon: 'fa-chart-line', bgColor: 'bg-indigo-50', popular: true },
  { id: 'premium', name: 'Premium Connect', price: 99, currency: 'USD',
    features: ['15 Active Connections', 'Up to 2 GB/s', 'Dedicated Support', '24/7 Uptime', 'Advanced Analytics', 'Custom Integrations'],
    icon: 'fa-crown', bgColor: 'bg-purple-50', popular: false },
  { id: 'enterprise', name: 'Enterprise Connect', price: 249, currency: 'USD',
    features: ['Unlimited Connections', 'Up to 10 GB/s', '24/7 VIP Support', 'SLA Guarantee', 'Full Analytics Suite', 'Custom Deployment', 'Dedicated Account Manager'],
    icon: 'fa-building', bgColor: 'bg-slate-50', popular: false },
];

// ─── Custom Hooks ───
const useLocalStorage = (key, initialValue) => {
  const [stored, setStored] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch { return initialValue; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(stored)); } catch {}
  }, [key, stored]);
  return [stored, setStored];
};

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const addNotification = useCallback((type, title, message, duration = 4500) => {
    const id = generateId();
    setNotifications(prev => [...prev, { id, type, title, message, duration }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), duration);
  }, []);
  const removeNotification = useCallback((id) => setNotifications(prev => prev.filter(n => n.id !== id)), []);
  return { notifications, addNotification, removeNotification };
};

// ─── Toast Components ───
const Toast = ({ notification, onRemove }) => {
  const { id, type, title, message } = notification;
  const icons = {
    success: 'fa-check-circle text-green-500',
    error: 'fa-times-circle text-red-500',
    info: 'fa-info-circle text-blue-500',
    warning: 'fa-exclamation-triangle text-amber-500',
  };
  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-amber-50 border-amber-200',
  };
  return (
    <div className={`fixed top-6 right-6 z-[9999] max-w-sm w-full glass border rounded-2xl shadow-2xl p-4 ${bgColors[type] || 'bg-white border-gray-200'} animate-slide-in`}>
      <div className="flex items-start gap-3">
        <i className={`text-xl mt-0.5 ${icons[type] || 'fa-info-circle text-blue-500'}`}></i>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-slate-800">{title}</p>
          <p className="text-sm text-slate-600 mt-0.5">{message}</p>
        </div>
        <button onClick={() => onRemove(id)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 -mt-1 -mr-1">
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>
    </div>
  );
};

const ToastContainer = ({ notifications, onRemove }) => (
  <>
    {notifications.map(n => <Toast key={n.id} notification={n} onRemove={onRemove} />)}
  </>
);

// ─── Navbar ───
const Navbar = ({ onOpenDashboard }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <i className="fa-solid fa-link text-white text-sm"></i>
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">
              Connect <span className="gradient-text">Pro</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#plans" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Plans</a>
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
            <a href="#testimonials" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Testimonials</a>
            <button onClick={onOpenDashboard} className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Dashboard</button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onOpenDashboard} className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-105">
              <i className="fa-solid fa-gauge-high"></i> Dashboard
            </button>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden w-9 h-9 rounded-xl bg-white/80 backdrop-blur border border-slate-200 flex items-center justify-center text-slate-700">
              <i className={`fa-solid ${mobileMenu ? 'fa-xmark' : 'fa-bars'} text-lg`}></i>
            </button>
          </div>
        </div>
        {mobileMenu && (
          <div className="md:hidden glass border-t border-white/20 rounded-2xl mt-2 p-4 space-y-3 animate-fade-up">
            <a href="#plans" className="block text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors py-2 px-3 rounded-xl hover:bg-indigo-50">Plans</a>
            <a href="#features" className="block text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors py-2 px-3 rounded-xl hover:bg-indigo-50">Features</a>
            <a href="#testimonials" className="block text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors py-2 px-3 rounded-xl hover:bg-indigo-50">Testimonials</a>
            <button onClick={() => { setMobileMenu(false); onOpenDashboard(); }} className="w-full text-left text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors py-2 px-3 rounded-xl hover:bg-indigo-50">
              Dashboard
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

// ─── Hero ───
const Hero = ({ onScrollToPlans }) => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
    <div className="absolute inset-0 -z-10">
      <div className="absolute top-[-30%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-indigo-200/30 to-purple-200/20 blur-3xl animate-float"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-200/20 to-indigo-300/20 blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
    </div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center relative">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-medium mb-6 animate-fade-up">
        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span> New: Enterprise-grade connections
      </div>
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-800 leading-[1.1] tracking-tight animate-fade-up delay-100">
        Seamless <br className="sm:hidden" />
        <span className="gradient-text">Connection</span> <br />
        For Everyone
      </h1>
      <p className="max-w-2xl mx-auto mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed animate-fade-up delay-200">
        Choose from four powerful connection plans. Pay securely, get instant access,
        and receive real-time notifications for every transaction.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 animate-fade-up delay-300">
        <button onClick={onScrollToPlans} className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-lg font-semibold shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:scale-105 flex items-center gap-3">
          Explore Plans <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
        </button>
        <a href="#features" className="px-8 py-4 rounded-2xl bg-white/80 backdrop-blur border border-slate-200 text-slate-700 text-lg font-medium hover:bg-white transition-all hover:shadow-lg flex items-center gap-3">
          <i className="fa-solid fa-play-circle text-indigo-500"></i> See Features
        </a>
      </div>
      <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500 animate-fade-up delay-400">
        <div className="flex items-center gap-2"><i className="fa-solid fa-shield-check text-indigo-500"></i> Secure Payments</div>
        <div className="flex items-center gap-2"><i className="fa-solid fa-bolt text-amber-500"></i> Instant Activation</div>
        <div className="flex items-center gap-2"><i className="fa-solid fa-bell text-purple-500"></i> Real-time Notifications</div>
        <div className="flex items-center gap-2"><i className="fa-solid fa-headset text-emerald-500"></i> 24/7 Support</div>
      </div>
      <div className="mt-12 flex items-center justify-center gap-6 animate-fade-up delay-500">
        <div className="flex -space-x-2">
          <img src="https://i.pravatar.cc/40?img=1" alt="User" className="w-10 h-10 rounded-full border-2 border-white" />
          <img src="https://i.pravatar.cc/40?img=2" alt="User" className="w-10 h-10 rounded-full border-2 border-white" />
          <img src="https://i.pravatar.cc/40?img=3" alt="User" className="w-10 h-10 rounded-full border-2 border-white" />
          <img src="https://i.pravatar.cc/40?img=4" alt="User" className="w-10 h-10 rounded-full border-2 border-white" />
          <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-indigo-600 text-xs font-semibold">+2k</div>
        </div>
        <span className="text-sm text-slate-600">Trusted by <strong className="text-slate-800">2,000+</strong> users worldwide</span>
      </div>
    </div>
  </section>
);

// ─── Features ───
const Features = () => {
  const features = [
    { icon: 'fa-bolt', title: 'Lightning Fast', desc: 'Optimized connections with minimal latency.' },
    { icon: 'fa-shield', title: 'Bank-grade Security', desc: '256-bit encryption for all transactions.' },
    { icon: 'fa-bell', title: 'Smart Notifications', desc: 'Get alerts for every payment and activation.' },
    { icon: 'fa-chart-pie', title: 'Analytics Dashboard', desc: 'Track usage and performance in real-time.' },
    { icon: 'fa-users', title: 'Team Collaboration', desc: 'Share connections with your entire team.' },
    { icon: 'fa-headset', title: 'Priority Support', desc: 'Dedicated support team available 24/7.' },
  ];
  return (
    <section id="features" className="py-20 md:py-28 bg-white/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-indigo-600 font-semibold text-sm tracking-widest uppercase animate-fade-up">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mt-2 animate-fade-up delay-100">
            Built for <span className="gradient-text">modern teams</span>
          </h2>
          <p className="max-w-2xl mx-auto mt-4 text-slate-600 animate-fade-up delay-200">
            Everything you need to manage connections, payments, and notifications in one place.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((f, i) => (
            <div key={i} className={`bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 card-hover animate-fade-up delay-${100 + i * 50}`}>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-xl mb-4">
                <i className={`fa-solid ${f.icon}`}></i>
              </div>
              <h3 className="text-lg font-semibold text-slate-800">{f.title}</h3>
              <p className="mt-2 text-slate-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Testimonials ───
const Testimonials = () => {
  const testimonials = [
    { name: 'Sarah Chen', role: 'CTO, TechFlow', text: 'ConnectPro transformed how we handle our cloud connections. The payment flow is buttery smooth.', img: 'https://i.pravatar.cc/60?img=5' },
    { name: 'Michael Rodriguez', role: 'Product Manager, DataCore', text: 'The notification system is a lifesaver. We never miss a payment or activation alert.', img: 'https://i.pravatar.cc/60?img=8' },
    { name: 'Emily Park', role: 'Founder, DesignLab', text: 'I love the enterprise plan. Unlimited connections and VIP support make all the difference.', img: 'https://i.pravatar.cc/60?img=10' },
  ];
  return (
    <section id="testimonials" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-indigo-600 font-semibold text-sm tracking-widest uppercase animate-fade-up">Testimonials</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mt-2 animate-fade-up delay-100">
            Loved by <span className="gradient-text">teams worldwide</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className={`bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 card-hover animate-fade-up delay-${200 + i * 100}`}>
              <div className="flex items-center gap-4 mb-4">
                <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full border-2 border-indigo-100" />
                <div>
                  <p className="font-semibold text-slate-800">{t.name}</p>
                  <p className="text-sm text-slate-500">{t.role}</p>
                </div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">"{t.text}"</p>
              <div className="mt-4 flex text-amber-400 text-sm">
                <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Plan Card ───
const PlanCard = ({ plan, index, onSelect }) => {
  const { name, price, features, icon, bgColor, popular } = plan;
  return (
    <div className={`bg-white rounded-2xl border ${popular ? 'border-indigo-400 ring-2 ring-indigo-400/30' : 'border-slate-200'} p-6 md:p-8 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 card-hover animate-fade-up delay-${200 + index * 50} relative overflow-hidden group`}>
      {popular && (
        <div className="absolute top-0 right-0">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl shadow-lg">Most Popular</div>
        </div>
      )}
      <div className={`w-14 h-14 rounded-2xl ${bgColor} flex items-center justify-center text-2xl ${popular ? 'text-indigo-600' : 'text-slate-600'} mb-5`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <h3 className="text-xl font-bold text-slate-800">{name}</h3>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-slate-800">{formatCurrency(price)}</span>
        <span className="text-slate-500 text-sm">/ mo</span>
      </div>
      <ul className="mt-6 space-y-3">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
            <i className="fa-solid fa-check text-indigo-500 mt-0.5 text-xs"></i> {f}
          </li>
        ))}
      </ul>
      <button onClick={() => onSelect(plan)} className={`mt-8 w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${popular ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:scale-105'}`}>
        Choose Plan <i className="fa-solid fa-arrow-right text-xs"></i>
      </button>
    </div>
  );
};

// ─── Plans Section ───
const PlansSection = ({ onSelectPlan }) => (
  <section id="plans" className="py-20 md:py-28 bg-gradient-to-b from-white to-indigo-50/30">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <p className="text-indigo-600 font-semibold text-sm tracking-widest uppercase animate-fade-up">Pricing</p>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mt-2 animate-fade-up delay-100">
          Choose your <span className="gradient-text">connection</span>
        </h2>
        <p className="max-w-2xl mx-auto mt-4 text-slate-600 animate-fade-up delay-200">
          Select the perfect plan for your needs. All plans include free setup and 24/7 support.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {CONNECTION_PLANS.map((plan, i) => (
          <PlanCard key={plan.id} plan={plan} index={i} onSelect={onSelectPlan} />
        ))}
      </div>
    </div>
  </section>
);

// ─── Payment Modal ───
const PaymentModal = ({ plan, isOpen, onClose, onPaymentSuccess, addNotification }) => {
  const [step, setStep] = useState('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setName('');
      setEmail('');
      setPhone('');
      setErrors({});
      setIsProcessing(false);
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Valid email is required';
    if (!phone.trim() || !/^[0-9]{10}$/.test(phone.replace(/\D/g, ''))) newErrors.phone = 'Valid 10-digit phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsProcessing(true);

    try {
      // 1. Create order on backend
      const response = await fetch('http://localhost:5000/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: plan.price,
          currency: 'INR',
          planName: plan.name,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create order');

      // 2. Open Razorpay checkout
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'ConnectPro',
        description: plan.name,
        order_id: data.orderId,
        handler: function (response) {
          // 3. Verify payment on backend
          fetch('http://localhost:5000/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planName: plan.name,
              amount: plan.price * 100,
              currency: 'INR',
              customerName: name,
              customerEmail: email,
              customerPhone: phone,
            }),
          })
            .then(res => res.json())
            .then(result => {
              if (result.status === 'success') {
                setStep('success');
                const purchase = {
                  id: generateId(),
                  planId: plan.id,
                  planName: plan.name,
                  price: plan.price,
                  currency: 'INR',
                  customerName: name,
                  customerEmail: email,
                  customerPhone: phone,
                  purchasedAt: Date.now(),
                  status: 'active',
                };
                onPaymentSuccess(purchase);
                addNotification('success', 'Payment Successful! 🎉', `You're now connected with ${plan.name}.`);
              } else {
                addNotification('error', 'Payment Failed', 'Verification failed. Please contact support.');
                setStep('form');
              }
            })
            .catch(err => {
              console.error(err);
              addNotification('error', 'Error', 'Payment verification error.');
              setStep('form');
            });
        },
        prefill: {
          name: name,
          email: email,
          contact: phone,
        },
        theme: {
          color: '#6366f1',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      addNotification('error', 'Error', err.message || 'Something went wrong.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 modal-overlay animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{step === 'success' ? 'Payment Confirmed' : 'Complete Payment'}</h3>
            <p className="text-sm text-slate-500">{step === 'success' ? 'Your connection is now active' : `${plan.name} — ${formatCurrency(plan.price)}/mo`}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center text-slate-500">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="p-6">
          {step === 'form' && (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                  <input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} className={`w-full px-4 py-3 rounded-xl stripe-input bg-slate-50 text-slate-800 placeholder:text-slate-400 ${errors.name ? 'error' : ''}`} />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                  <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className={`w-full px-4 py-3 rounded-xl stripe-input bg-slate-50 text-slate-800 placeholder:text-slate-400 ${errors.email ? 'error' : ''}`} />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                  <input type="tel" placeholder="9999999999" value={phone} onChange={e => setPhone(e.target.value)} className={`w-full px-4 py-3 rounded-xl stripe-input bg-slate-50 text-slate-800 placeholder:text-slate-400 ${errors.phone ? 'error' : ''}`} />
                  {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                  <p className="text-xs text-slate-400 mt-1">Required for UPI payment options.</p>
                </div>
                <button type="submit" disabled={isProcessing} className="w-full mt-2 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isProcessing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-lock text-sm"></i>}
                  {isProcessing ? 'Processing...' : `Pay ${formatCurrency(plan.price)}`}
                </button>
                <p className="text-center text-xs text-slate-400 mt-3"><i className="fa-solid fa-shield-check mr-1"></i> Secured with 256-bit encryption</p>
                <p className="text-center text-xs text-slate-400">Card, UPI, Net Banking, and Wallets supported via Razorpay.</p>
              </div>
            </form>
          )}
          {step === 'success' && (
            <div className="py-8 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6 animate-float">
                <i className="fa-solid fa-check text-3xl text-emerald-500"></i>
              </div>
              <h4 className="text-2xl font-bold text-slate-800">Payment Successful!</h4>
              <p className="text-slate-500 mt-1">You are now connected with <strong>{plan.name}</strong></p>
              <div className="mt-6 p-4 bg-indigo-50 rounded-xl text-left">
                <p className="text-sm text-slate-600"><strong>Confirmation sent to:</strong> {email}</p>
                <p className="text-sm text-slate-600 mt-1"><strong>Plan:</strong> {plan.name} — {formatCurrency(plan.price)}/mo</p>
                <p className="text-sm text-slate-600 mt-1"><strong>Status:</strong> <span className="text-emerald-600">Active</span></p>
              </div>
              <button onClick={onClose} className="mt-6 w-full py-4 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors">Close & Continue</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Dashboard Modal ───
const DashboardModal = ({ isOpen, onClose, purchases, onViewReceipt }) => {
  const [ownerNotifs, setOwnerNotifs] = useState([]);
  useEffect(() => {
    if (isOpen) {
      const stored = JSON.parse(localStorage.getItem('ownerNotifications') || '[]');
      setOwnerNotifs(stored);
    }
  }, [isOpen]);

  const markAllRead = () => {
    const updated = ownerNotifs.map(n => ({ ...n, read: true }));
    setOwnerNotifs(updated);
    localStorage.setItem('ownerNotifications', JSON.stringify(updated));
  };
  const clearAll = () => {
    setOwnerNotifs([]);
    localStorage.setItem('ownerNotifications', JSON.stringify([]));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 modal-overlay animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] shadow-2xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-xl font-bold text-slate-800"><i className="fa-solid fa-gauge-high text-indigo-500 mr-2"></i> Dashboard</h3>
            <p className="text-sm text-slate-500">{purchases.length} purchases • {ownerNotifs.filter(n => !n.read).length} unread notifications</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center text-slate-500">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-8">
          <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span><i className="fa-solid fa-receipt mr-2"></i> Purchase History</span>
              <span className="text-xs font-normal text-slate-400">{purchases.length} transactions</span>
            </h4>
            {purchases.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <i className="fa-solid fa-inbox text-3xl block mb-2"></i>
                <p className="text-sm">No purchases yet.</p>
                <p className="text-xs">Choose a plan to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {purchases.map((p, i) => (
                  <div key={p.id} className={`flex items-center justify-between p-4 rounded-xl border ${i === 0 ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-100 bg-white'} hover:shadow-md transition-shadow`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${i === 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                        <i className="fa-solid fa-link"></i>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{p.planName}</p>
                        <p className="text-xs text-slate-500">{p.customerName} • {p.customerEmail}</p>
                        <p className="text-xs text-slate-400">{formatDate(p.purchasedAt)} • <span className="text-emerald-600">Active</span></p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">{formatCurrency(p.price)}</p>
                      <button onClick={() => onViewReceipt(p)} className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors">View Receipt</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span><i className="fa-solid fa-bell mr-2"></i> Owner Notifications</span>
              <div className="flex gap-2">
                <button onClick={markAllRead} className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors">Mark all read</button>
                <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-600 transition-colors">Clear</button>
              </div>
            </h4>
            {ownerNotifs.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <i className="fa-solid fa-bell-slash text-2xl block mb-1"></i>
                <p className="text-sm">No notifications yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {ownerNotifs.map(n => (
                  <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl border ${n.read ? 'border-slate-100 bg-white' : 'border-indigo-200 bg-indigo-50/40'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${n.read ? 'bg-slate-100 text-slate-400' : 'bg-indigo-100 text-indigo-600'}`}>
                      <i className="fa-solid fa-user"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${n.read ? 'text-slate-600' : 'text-slate-800 font-medium'}`}>{n.message}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDate(n.timestamp)}{!n.read && <span className="ml-2 text-indigo-500">• New</span>}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Receipt Modal ───
const ReceiptModal = ({ purchase, isOpen, onClose }) => {
  if (!isOpen || !purchase) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 modal-overlay animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800"><i className="fa-solid fa-receipt text-indigo-500 mr-2"></i> Receipt</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center text-slate-500">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
              <i className="fa-solid fa-check text-2xl text-emerald-500"></i>
            </div>
            <h4 className="text-lg font-bold text-slate-800">Payment Confirmed</h4>
            <p className="text-sm text-slate-500">Thank you for your purchase!</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-slate-500">Plan</span><span className="font-medium text-slate-800">{purchase.planName}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Amount</span><span className="font-bold text-slate-800">{formatCurrency(purchase.price)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Customer</span><span className="text-slate-800">{purchase.customerName}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Email</span><span className="text-slate-800">{purchase.customerEmail}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Date</span><span className="text-slate-800">{formatDate(purchase.purchasedAt)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Status</span><span className="text-emerald-600 font-medium">Active</span></div>
          </div>
          <button onClick={onClose} className="w-full py-3 rounded-xl bg-indigo-50 text-indigo-600 font-medium hover:bg-indigo-100 transition-colors">Close Receipt</button>
        </div>
      </div>
    </div>
  );
};

// ─── Footer ───
const Footer = () => (
  <footer className="bg-slate-900 text-white/70 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <i className="fa-solid fa-link text-white text-xs"></i>
            </div>
            <span className="text-white font-bold text-lg">Connect <span className="text-indigo-400">Pro</span></span>
          </div>
          <p className="text-sm leading-relaxed">Seamless connections for modern teams. Pay, connect, and grow.</p>
        </div>
        <div><h5 className="text-white font-semibold text-sm mb-3">Product</h5><ul className="space-y-2 text-sm"><li><a href="#plans" className="hover:text-white transition-colors">Plans</a></li><li><a href="#features" className="hover:text-white transition-colors">Features</a></li><li><a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a></li></ul></div>
        <div><h5 className="text-white font-semibold text-sm mb-3">Support</h5><ul className="space-y-2 text-sm"><li><a href="#" className="hover:text-white transition-colors">Help Center</a></li><li><a href="#" className="hover:text-white transition-colors">Documentation</a></li><li><a href="#" className="hover:text-white transition-colors">Contact</a></li></ul></div>
        <div><h5 className="text-white font-semibold text-sm mb-3">Legal</h5><ul className="space-y-2 text-sm"><li><a href="#" className="hover:text-white transition-colors">Privacy</a></li><li><a href="#" className="hover:text-white transition-colors">Terms</a></li><li><a href="#" className="hover:text-white transition-colors">Security</a></li></ul></div>
      </div>
      <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
        <p>&copy; 2026 ConnectPro. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-white transition-colors"><i className="fa-brands fa-twitter"></i></a>
          <a href="#" className="hover:text-white transition-colors"><i className="fa-brands fa-github"></i></a>
          <a href="#" className="hover:text-white transition-colors"><i className="fa-brands fa-linkedin"></i></a>
          <a href="#" className="hover:text-white transition-colors"><i className="fa-brands fa-youtube"></i></a>
        </div>
      </div>
    </div>
  </footer>
);

// ─── Main App ───
function App() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [purchases, setPurchases] = useLocalStorage('purchases', []);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const { notifications, addNotification, removeNotification } = useNotifications();

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setIsPaymentOpen(true);
  };
  const handlePaymentSuccess = (purchase) => {
    setPurchases(prev => [purchase, ...prev]);
    setIsPaymentOpen(false);
    setSelectedPlan(null);
  };
  const handleViewReceipt = (purchase) => setViewingReceipt(purchase);
  const scrollToPlans = () => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen">
      <Navbar onOpenDashboard={() => setIsDashboardOpen(true)} />
      <Hero onScrollToPlans={scrollToPlans} />
      <Features />
      <PlansSection onSelectPlan={handleSelectPlan} />
      <Testimonials />
      <Footer />
      <ToastContainer notifications={notifications} onRemove={removeNotification} />
      <PaymentModal plan={selectedPlan} isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} onPaymentSuccess={handlePaymentSuccess} addNotification={addNotification} />
      <DashboardModal isOpen={isDashboardOpen} onClose={() => setIsDashboardOpen(false)} purchases={purchases} onViewReceipt={handleViewReceipt} />
      <ReceiptModal purchase={viewingReceipt} isOpen={!!viewingReceipt} onClose={() => setViewingReceipt(null)} />
    </div>
  );
}

export default App;