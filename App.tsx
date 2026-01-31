
import React, { useState, useEffect, useRef } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Icons, TRANSLATIONS } from './constants';
import VoiceAssistant from './components/VoiceAssistant';
import { getRecommendations } from './services/gemini';
import { Recommendation, UserRole, Order, User } from './types';

const hapticFeedback = () => {
  if (window.navigator.vibrate) {
    window.navigator.vibrate(10);
  }
};

const LoginScreen: React.FC = () => {
  const { login, language } = useApp();
  const t = TRANSLATIONS[language];
  const [step, setStep] = useState<'ROLE' | 'MOBILE' | 'OTP'>('ROLE');
  const [selectedRole, setSelectedRole] = useState<UserRole>('FARMER');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSendOtp = () => {
    hapticFeedback();
    if (phone.length === 10) {
      setStep('OTP');
    } else {
      alert("Please enter a valid 10-digit number");
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleVerifyOtp = () => {
    hapticFeedback();
    const otpValue = otp.join('');
    if (otpValue === '123456' || otpValue.length === 6) {
      login(selectedRole, `+91 ${phone}`);
    } else {
      alert("Invalid Code. Try 123456");
    }
  };

  if (step === 'ROLE') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-green-50 to-white">
        <div className="w-full max-w-sm text-center">
          <div className="mb-10 flex justify-center">
            <div className="w-24 h-24 bg-green-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl transform rotate-6 border-4 border-white">
              <span className="text-white text-4xl font-black">KM</span>
            </div>
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">{t.welcome}</h1>
          <p className="text-gray-500 mb-12 font-bold text-sm uppercase tracking-widest">Digital Companion for Farmers</p>
          
          <div className="space-y-4">
            <button 
              onClick={() => { hapticFeedback(); setSelectedRole('FARMER'); setStep('MOBILE'); }}
              className="w-full bg-green-600 text-white py-6 rounded-[2rem] text-xl font-black shadow-xl active:scale-95 transition-all flex items-center justify-center gap-4 border-b-8 border-green-800"
            >
              👨‍🌾 {t.farmer}
            </button>
            <button 
              onClick={() => { hapticFeedback(); setSelectedRole('BUYER'); setStep('MOBILE'); }}
              className="w-full bg-white text-gray-800 py-6 rounded-[2rem] text-xl font-black shadow-md border-2 border-gray-100 active:scale-95 transition-all flex items-center justify-center gap-4"
            >
              🛒 {t.buyer}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-8 bg-white animate-in">
      <div className="w-full max-w-sm mx-auto pt-8">
        <button onClick={() => { hapticFeedback(); setStep('ROLE'); }} className="mb-8 text-green-600 font-black flex items-center gap-2 text-xs uppercase tracking-widest">
          <span className="text-xl">←</span> Back
        </button>
        
        <h1 className="text-3xl font-black mb-2 text-gray-900 leading-tight">
          {step === 'MOBILE' ? t.otpLogin : t.enterOtp}
        </h1>
        <p className="text-gray-500 mb-10 font-bold text-sm tracking-tight opacity-70">
          {step === 'MOBILE' 
            ? 'We will send a 6-digit verification code.' 
            : `A code was sent to +91 ${phone}`}
        </p>
        
        <div className="space-y-6">
          {step === 'MOBILE' ? (
            <>
              <div className="bg-gray-50 p-6 rounded-[2rem] border-2 border-gray-100 focus-within:border-green-400 focus-within:bg-white transition-all flex items-center gap-4">
                <span className="text-xl font-black text-gray-400">+91</span>
                <input 
                  autoFocus
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Mobile Number" 
                  className="bg-transparent flex-1 outline-none font-black text-2xl tracking-widest"
                />
              </div>
              <button 
                onClick={handleSendOtp}
                className="w-full bg-green-600 text-white py-6 rounded-[2.5rem] font-black text-lg shadow-xl active:scale-95 transition-all border-b-8 border-green-800"
              >
                {t.sendOtp}
              </button>
            </>
          ) : (
            <>
              <div className="flex justify-between gap-2 px-1">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    // Added braces to the ref callback to ensure it returns void instead of the input element itself, fixing the TS error.
                    ref={el => { otpRefs.current[index] = el; }}
                    type="number"
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !digit && index > 0) {
                        otpRefs.current[index - 1]?.focus();
                      }
                    }}
                    className="w-12 h-16 bg-gray-50 rounded-2xl text-center font-black text-3xl border-2 border-transparent focus:border-green-400 focus:bg-white outline-none transition-all shadow-sm"
                  />
                ))}
              </div>
              <button 
                onClick={handleVerifyOtp}
                className="w-full bg-green-600 text-white py-6 rounded-[2.5rem] font-black text-lg shadow-xl active:scale-95 transition-all border-b-8 border-green-800"
              >
                {t.verifyOtp}
              </button>
              <p className="text-center text-xs font-black text-gray-300 uppercase tracking-widest">Code for test: 123456</p>
            </>
          )}

          <div className="py-4 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-100"></div>
            <span className="text-gray-300 text-[10px] font-black tracking-widest uppercase">OR</span>
            <div className="flex-1 h-px bg-gray-100"></div>
          </div>

          <button 
            onClick={() => { hapticFeedback(); login(selectedRole); }}
            className="w-full bg-white text-gray-700 py-5 rounded-[2rem] font-black border-2 border-gray-100 shadow-sm flex items-center justify-center gap-3 active:bg-gray-50 transition-all"
          >
            <img src="https://www.google.com/favicon.ico" className="w-6 h-6" alt="Google" />
            {t.googleLogin}
          </button>
        </div>
      </div>
    </div>
  );
};

const Header: React.FC = () => {
  const { isOnline, language, user } = useApp();
  const t = TRANSLATIONS[language];
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-gray-100 p-4 flex justify-between items-center safe-area-top">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-600 rounded-2xl flex items-center justify-center text-white font-black shadow-inner rotate-3">KM</div>
        <div>
          <h1 className="font-black text-lg leading-none tracking-tight">KisanMitr</h1>
          <div className="flex items-center gap-1 mt-0.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-orange-500 animate-pulse'}`}></div>
            <span className={`text-[10px] uppercase font-black tracking-widest ${isOnline ? t.online : t.offline}`}>
              {isOnline ? t.online : t.offline}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="text-right px-1">
          <p className="text-[9px] font-black uppercase text-gray-400 leading-none">{user?.role === 'FARMER' ? t.farmer : t.buyer}</p>
          <p className="text-xs font-black leading-tight line-clamp-1 max-w-[70px]">{user?.name.split(' ')[0]}</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-green-700 flex items-center justify-center text-white font-black shadow-lg">
          {user?.name?.[0]}
        </div>
      </div>
    </header>
  );
};

const ProfileScreen: React.FC = () => {
  const { user, language, updateProfile } = useApp();
  const t = TRANSLATIONS[language];
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    landSize: user?.landSize || '',
    primaryCrops: user?.primaryCrops?.join(', ') || ''
  });

  const handleSave = () => {
    hapticFeedback();
    updateProfile({
      ...formData,
      primaryCrops: formData.primaryCrops.split(',').map(s => s.trim()).filter(Boolean)
    });
    alert('Profile Updated!');
  };

  return (
    <div className="p-5 space-y-8 animate-in pb-32">
      <div className="flex flex-col items-center pt-8">
        <div className="relative">
          <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-800 rounded-[3rem] flex items-center justify-center text-white text-5xl font-black shadow-2xl border-4 border-white rotate-3">
            {formData.name?.[0]}
          </div>
          <button className="absolute -bottom-2 -right-2 bg-white p-3 rounded-2xl shadow-xl border border-gray-100 text-lg active:scale-90">📸</button>
        </div>
        <h2 className="text-3xl font-black mt-6 tracking-tight">{formData.name}</h2>
        <div className="flex gap-2 mt-2">
          <span className="bg-gray-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">{user?.role}</span>
          <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">PREMIUM</span>
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4">Full Identity</label>
          <input 
            className="w-full bg-white p-5 rounded-[2rem] font-black border-2 border-gray-100 focus:border-green-400 outline-none shadow-sm transition-all"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4">Contact Number</label>
          <input 
            className="w-full bg-white p-5 rounded-[2rem] font-black border-2 border-gray-100 focus:border-green-400 outline-none shadow-sm transition-all"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4">{t.location}</label>
          <div className="relative">
            <input 
              className="w-full bg-white p-5 rounded-[2rem] font-black border-2 border-gray-100 focus:border-green-400 outline-none shadow-sm transition-all pr-16"
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
            />
            <button className="absolute right-3 top-3 bg-green-50 p-3 rounded-2xl text-green-600 shadow-inner">📍</button>
          </div>
        </div>
        
        {user?.role === 'FARMER' && (
          <div className="grid grid-cols-1 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4">{t.landSize}</label>
              <input 
                className="w-full bg-white p-5 rounded-[2rem] font-black border-2 border-gray-100 focus:border-green-400 outline-none shadow-sm transition-all"
                value={formData.landSize}
                onChange={e => setFormData({ ...formData, landSize: e.target.value })}
                placeholder="0.0 Acres"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4">{t.cropsGrown}</label>
              <textarea 
                className="w-full bg-white p-5 rounded-[2rem] font-black border-2 border-gray-100 focus:border-green-400 outline-none shadow-sm transition-all min-h-[100px]"
                value={formData.primaryCrops}
                onChange={e => setFormData({ ...formData, primaryCrops: e.target.value })}
                placeholder="Wheat, Rice, etc."
              />
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={handleSave}
        className="w-full bg-green-600 text-white py-6 rounded-[2.5rem] font-black text-xl shadow-2xl active:scale-95 transition-all border-b-8 border-green-800"
      >
        {t.saveProfile}
      </button>
    </div>
  );
};

const MainApp: React.FC = () => {
  const { user, language } = useApp();
  const [activeTab, setActiveTab] = React.useState('home');
  const t = TRANSLATIONS[language];

  const handleTabChange = (id: string) => {
    hapticFeedback();
    setActiveTab(id);
  };

  const tabs = user?.role === 'FARMER' 
    ? [
        { id: 'home', icon: <Icons.Home />, label: t.dashboard },
        { id: 'market', icon: <Icons.Market />, label: t.marketplace },
        { id: 'profile', icon: <Icons.User />, label: t.profile },
        { id: 'orders', icon: <Icons.Order />, label: t.orders },
        { id: 'loans', icon: <Icons.Bank />, label: t.loans },
      ]
    : [
        { id: 'home', icon: <Icons.Home />, label: 'Feeds' },
        { id: 'market', icon: <Icons.Market />, label: t.marketplace },
        { id: 'cart', icon: <Icons.Cart />, label: t.cart },
        { id: 'profile', icon: <Icons.User />, label: t.profile },
        { id: 'settings', icon: <Icons.Settings />, label: t.settings },
      ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return user?.role === 'FARMER' ? <FarmerDashboard /> : <BuyerDashboard />;
      case 'market': return <Marketplace />;
      case 'profile': return <ProfileScreen />;
      case 'orders': return <OrdersList />;
      case 'loans': return <LoansAndSchemes />;
      case 'cart': return <CartScreen />;
      case 'settings': return <SettingsScreen />;
      default: return null;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#F9FAFB] min-h-screen relative overflow-x-hidden border-x border-gray-100 shadow-2xl">
      <Header />
      
      <main className="animate-in pb-32">
        {renderContent()}
      </main>

      <VoiceAssistant />

      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-gray-200 px-2 py-4 flex justify-around items-center max-w-md mx-auto safe-area-bottom z-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => handleTabChange(tab.id)} 
            className={`flex flex-col items-center gap-1.5 transition-all min-w-[60px] ${activeTab === tab.id ? 'text-green-600' : 'text-gray-400'}`}
          >
            <div className={`p-2 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-green-600 text-white shadow-lg scale-110 -translate-y-1' : 'opacity-60'}`}>
              {tab.icon}
            </div>
            <span className={`text-[9px] font-black uppercase tracking-tight ${activeTab === tab.id ? 'opacity-100' : 'opacity-0'}`}>{tab.label}</span>
          </button>
        ))}
        {user?.role === 'FARMER' && (
          <button onClick={() => handleTabChange('settings')} className={`flex flex-col items-center gap-1.5 transition-all min-w-[60px] ${activeTab === 'settings' ? 'text-green-600' : 'text-gray-400'}`}>
             <div className={`p-2 rounded-2xl ${activeTab === 'settings' ? 'bg-green-600 text-white shadow-lg scale-110 -translate-y-1' : 'opacity-60'}`}><Icons.Settings /></div>
             <span className={`text-[9px] font-black uppercase tracking-tight ${activeTab === 'settings' ? 'opacity-100' : 'opacity-0'}`}>{t.settings}</span>
          </button>
        )}
      </nav>
    </div>
  );
};

const FarmerDashboard: React.FC = () => {
  const { language, weather } = useApp();
  const t = TRANSLATIONS[language];
  return (
    <div className="p-5 space-y-8 animate-in">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em] mb-4">{t.weatherTitle}</p>
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-6xl font-black tracking-tighter leading-none mb-2">{weather.temp}°</h3>
              <p className="text-xl font-bold opacity-90">{weather.condition}</p>
            </div>
            <div className="text-7xl drop-shadow-2xl">☀️</div>
          </div>
          <div className="mt-8 bg-white/20 backdrop-blur-md p-4 rounded-3xl border border-white/20 flex items-center gap-4">
            <span className="text-2xl animate-pulse">⛈️</span>
            <p className="text-sm font-black leading-tight">{weather.forecast}</p>
          </div>
        </div>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 border-b-8 border-b-red-50 relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
             <span className="p-3 bg-red-100 text-red-600 rounded-2xl"><Icons.Inventory /></span>
             {t.freshnessTitle}
          </h3>
          <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full animate-pulse">URGENT</span>
        </div>
        <div className="flex items-center justify-between p-5 bg-gray-50 rounded-[2rem] border border-gray-100 ring-4 ring-red-50">
           <div className="flex items-center gap-5">
             <span className="text-4xl filter drop-shadow-lg">🍅</span>
             <div>
               <p className="font-black text-gray-800 text-lg">Tomatoes</p>
               <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Sell now to avoid loss</p>
             </div>
           </div>
           <div className="text-right">
             <p className="text-3xl font-black text-red-600">3</p>
             <p className="text-[10px] text-red-400 font-bold uppercase">{t.daysLeft}</p>
           </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-2xl font-black tracking-tight px-2">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-white p-6 rounded-[2.5rem] border-2 border-gray-100 shadow-sm flex flex-col items-center gap-4 active:scale-95 transition-all active:bg-gray-50 border-b-8 border-b-green-100">
             <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-3xl">📦</div>
             <span className="text-sm font-black uppercase tracking-widest">{t.addStock}</span>
          </button>
          <button className="bg-white p-6 rounded-[2.5rem] border-2 border-gray-100 shadow-sm flex flex-col items-center gap-4 active:scale-95 transition-all active:bg-gray-50 border-b-8 border-b-blue-100">
             <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl">💹</div>
             <span className="text-sm font-black uppercase tracking-widest">Market Rates</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const BuyerDashboard: React.FC = () => {
  const { language, marketplace, addToCart } = useApp();
  const t = TRANSLATIONS[language];
  const items = marketplace.filter(p => p.category === 'CROP');

  return (
    <div className="p-5 space-y-8 animate-in">
       <div className="bg-gradient-to-br from-green-500 to-green-700 p-8 rounded-[3rem] text-white shadow-2xl">
          <h2 className="text-3xl font-black mb-2 tracking-tighter">Direct from Farms</h2>
          <p className="text-sm font-bold opacity-80 uppercase tracking-widest leading-none">Support your local farmers</p>
          <div className="mt-8 relative">
             <input className="w-full bg-white/20 backdrop-blur-md p-5 rounded-2xl border border-white/30 placeholder:text-white/60 outline-none text-white font-bold" placeholder="Search crops..." />
             <span className="absolute right-5 top-5">🔍</span>
          </div>
       </div>

       <div className="space-y-4">
         <h3 className="text-2xl font-black tracking-tight px-2">{t.featured}</h3>
         <div className="flex gap-5 overflow-x-auto pb-6 -mx-5 px-5 no-scrollbar">
           {items.map(p => (
             <div key={p.id} className="min-w-[280px] bg-white rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-50 p-3">
                <img src={p.image} className="w-full h-48 rounded-[2.5rem] object-cover mb-4 shadow-inner" alt={p.name} />
                <div className="px-3 pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xl font-black tracking-tight">{p.name}</h4>
                    <span className="bg-green-100 text-green-700 text-[9px] font-black px-3 py-1 rounded-full uppercase">100% Organic</span>
                  </div>
                  <div className="flex justify-between items-center mt-6">
                     <div>
                       <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Best Price</p>
                       <p className="text-3xl font-black text-green-600 tracking-tighter">₹{p.price}<span className="text-xs font-normal text-gray-400">/{p.unit}</span></p>
                     </div>
                     <button 
                      onClick={() => { hapticFeedback(); addToCart(p); }}
                      className="bg-gray-900 text-white p-5 rounded-3xl active:scale-90 transition-all shadow-lg"
                     >
                       <Icons.Cart />
                     </button>
                  </div>
                </div>
             </div>
           ))}
         </div>
       </div>
    </div>
  );
};

const Marketplace: React.FC = () => {
  const { language, marketplace, addToCart, user } = useApp();
  const t = TRANSLATIONS[language];
  const items = marketplace.filter(p => user?.role === 'FARMER' ? p.category === 'INPUT' : p.category === 'CROP');

  return (
    <div className="p-5 animate-in">
      <h2 className="text-3xl font-black tracking-tight mb-6">{user?.role === 'FARMER' ? t.buyInputs : t.marketplace}</h2>
      <div className="grid grid-cols-2 gap-5">
        {items.map(product => (
          <div key={product.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all">
            <img src={product.image} className="w-full h-40 object-cover" alt={product.name} />
            <div className="p-4">
              <h3 className="font-black text-sm text-gray-800 line-clamp-1 mb-1">{product.name}</h3>
              <p className="text-green-600 font-black text-xl tracking-tighter">₹{product.price}<span className="text-[10px] font-normal text-gray-400">/{product.unit}</span></p>
              <button 
                onClick={() => { hapticFeedback(); addToCart(product); }} 
                className="mt-4 w-full bg-gray-50 text-gray-800 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest active:bg-green-600 active:text-white transition-all shadow-inner"
              >
                + {t.cart}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LoansAndSchemes: React.FC = () => {
  const { language } = useApp();
  const t = TRANSLATIONS[language];
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecommendations(language).then(data => { setRecs(data); setLoading(false); });
  }, [language]);

  return (
    <div className="p-5 space-y-8 animate-in">
      <h2 className="text-3xl font-black tracking-tight">{t.loans}</h2>
      {loading ? (
        <div className="space-y-6">
          {[1,2,3].map(i => <div key={i} className="h-44 bg-white rounded-[2.5rem] animate-pulse shadow-sm"></div>)}
        </div>
      ) : (
        <div className="space-y-6">
          {recs.map((rec, i) => (
            <div key={i} className="bg-white p-8 rounded-[3rem] border border-gray-50 shadow-sm border-b-8 border-b-blue-50">
               <div className="mb-4">
                 <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${rec.type === 'LOAN' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                   {rec.type}
                 </span>
               </div>
               <h4 className="font-black text-gray-900 text-xl mb-2 leading-tight">{rec.title}</h4>
               <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6 line-clamp-3">{rec.description}</p>
               <a href={rec.link} className="block w-full text-center bg-gray-900 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] active:scale-95 transition-all shadow-lg">Apply Now</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const OrdersList: React.FC = () => {
  const { orders, language } = useApp();
  const t = TRANSLATIONS[language];
  return (
    <div className="p-5 space-y-8 animate-in">
      <h2 className="text-3xl font-black tracking-tight">{t.orders}</h2>
      {orders.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[3rem] border-4 border-dashed border-gray-100">
           <div className="text-6xl mb-6">📦</div>
           <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No active orders</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{order.id}</p>
                  <p className="font-black text-gray-900 text-lg">{order.date}</p>
                </div>
                <div className="bg-green-100 text-green-700 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">{order.status}</div>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-5 rounded-[2rem] border border-gray-100">
                 <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{t.total} Paid</span>
                 <span className="text-2xl font-black text-green-600 tracking-tighter">₹{order.total}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CartScreen: React.FC = () => {
  const { cart, removeFromCart, placeOrder, language } = useApp();
  const t = TRANSLATIONS[language];
  const total = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePay = () => {
    hapticFeedback();
    placeOrder();
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  if (isSuccess) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[70vh] animate-slide-up">
        <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center text-white text-6xl mb-8 shadow-2xl shadow-green-200">✓</div>
        <h2 className="text-4xl font-black text-green-900 mb-2 tracking-tight">{t.paySuccess}</h2>
        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Mock payment processed successfully</p>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-8 animate-in">
      <h2 className="text-3xl font-black tracking-tight">{t.cart}</h2>
      {cart.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[3rem] border border-gray-100 shadow-inner">
           <div className="text-6xl mb-6">🛒</div>
           <p className="text-gray-300 font-black uppercase tracking-widest text-xs">Your bag is empty</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <img src={item.image} className="w-20 h-20 rounded-[1.5rem] object-cover shadow-sm" alt={item.name} />
                  <div>
                    <p className="font-black text-gray-900 text-lg leading-tight">{item.name}</p>
                    <p className="text-xs font-black text-green-600 uppercase tracking-widest">₹{item.price} x {item.cartQuantity}</p>
                  </div>
                </div>
                <button 
                  onClick={() => { hapticFeedback(); removeFromCart(item.id); }} 
                  className="w-12 h-12 flex items-center justify-center text-red-500 bg-red-50 rounded-2xl active:scale-90 transition-all text-xl"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-gray-200 border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <span className="text-xs font-black uppercase text-gray-400 tracking-widest">Grand Total</span>
              <span className="text-4xl font-black text-green-700 tracking-tighter">₹{total}</span>
            </div>
            <button 
              onClick={handlePay}
              className="w-full bg-green-600 text-white py-6 rounded-[2rem] font-black text-xl shadow-xl active:scale-95 transition-all border-b-8 border-green-800"
            >
              {t.pay}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsScreen: React.FC = () => {
  const { language, setLanguage, logout } = useApp();
  const t = TRANSLATIONS[language];
  return (
    <div className="p-5 space-y-10 animate-in">
      <h2 className="text-3xl font-black tracking-tight">{t.settings}</h2>
      <div className="space-y-6">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-4">Language Settings</label>
        <div className="grid grid-cols-1 gap-4">
          {(Object.keys(TRANSLATIONS) as Array<keyof typeof TRANSLATIONS>).map(lang => (
            <button 
              key={lang} 
              onClick={() => { hapticFeedback(); setLanguage(lang); }} 
              className={`p-6 rounded-[2.5rem] border-2 flex items-center justify-between transition-all active:scale-98 ${language === lang ? 'border-green-600 bg-green-50 shadow-lg ring-8 ring-green-100' : 'border-gray-50 bg-white shadow-sm'}`}
            >
              <div className="flex items-center gap-6">
                <span className="text-4xl drop-shadow-sm">{lang === 'en' ? '🇬🇧' : lang === 'hi' ? '🇮🇳' : '👳'}</span>
                <span className={`text-xl font-black ${language === lang ? 'text-green-900' : 'text-gray-800'}`}>{TRANSLATIONS[lang].languageName}</span>
              </div>
              {language === lang && <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white"><svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg></div>}
            </button>
          ))}
        </div>
      </div>
      <div className="pt-12">
        <button 
          onClick={() => { hapticFeedback(); logout(); }} 
          className="w-full bg-red-50 text-red-600 py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] border-2 border-red-100 active:bg-red-100 transition-colors shadow-sm"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => <AppProvider><AppContent /></AppProvider>;
const AppContent: React.FC = () => {
  const { user } = useApp();
  return user ? <MainApp /> : <LoginScreen />;
};

export default App;