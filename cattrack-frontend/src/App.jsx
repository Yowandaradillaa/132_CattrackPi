import React, { useState, useEffect } from 'react';
import { Cat, User, LogOut, Plus, Trash2, LayoutDashboard, List, Copy, Check, Terminal, Key, ArrowLeft, ClipboardList, Syringe, X, Pencil, Lock, Unlock } from 'lucide-react';
import api from './api/axios'; 
import axios from 'axios'; 

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [isRegister, setIsRegister] = useState(false);
  const [userName, setUserName] = useState('Pemilik Kucing');
  const [userRole, setUserRole] = useState('user');
  
  // State Unlock untuk User/Developer
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Data States
  const [stats, setStats] = useState({ total_kucing: 0, vaksin_pending: 0, catatan_hari_ini: 0 });
  const [cats, setCats] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [careNotes, setCareNotes] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  
  // Form States
  const [authForm, setAuthForm] = useState({ nama: '', email: '', password: '' });
  const [catForm, setCatForm] = useState({ nama: '', umur: '', jenis: '' });
  const [careForm, setCareForm] = useState({ catatan: '' });
  const [vaccineForm, setVaccineForm] = useState({ nama_vaksin: '', tanggal: '' });

  const [editId, setEditId] = useState(null);

  // Explorer States
  const [testKeyInput, setTestKeyInput] = useState('');
  const [apiResponse, setApiResponse] = useState(null);
  
  const [showModal, setShowModal] = useState({ cat: false, care: false, vaccine: false });
  const [copied, setCopied] = useState(false);

  // --- 1. SESSION LOGIC ---
  useEffect(() => {
    const key = localStorage.getItem('api_key');
    const savedName = localStorage.getItem('user_name');
    const savedRole = localStorage.getItem('user_role');
    const savedTime = localStorage.getItem('login_time');
    const unlocked = localStorage.getItem('is_unlocked') === 'true';
    const currentTime = Date.now();
    const sessionDuration = 3600000; 

    if (key && savedTime) {
      if (currentTime - savedTime > sessionDuration) {
        alert("Sesi berakhir. Silakan login kembali.");
        handleLogout();
      } else {
        setUserName(savedName || 'Pemilik Kucing');
        setUserRole(savedRole || 'user');
        setIsUnlocked(savedRole === 'admin' ? true : unlocked); // Admin otomatis unlock
        setCurrentPage('dashboard');
        fetchDashboardData();
      }
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      const resStats = await api.get('/dashboard/stats');
      setStats(resStats.data);
      const resCats = await api.get('/kucing');
      setCats(resCats.data);
    } catch (err) { console.error("Gagal load data", err); }
  };

  const fetchCatDetails = async (cat) => {
    try {
      const resNotes = await api.get(`/perawatan/kucing/${cat.id}`);
      const resVaksin = await api.get(`/vaksin/kucing/${cat.id}`);
      setCareNotes(resNotes.data);
      setVaccines(resVaksin.data);
      setSelectedCat(cat);
      setCurrentPage('details');
    } catch (err) { console.error("Gagal load detail", err); }
  };

  // --- 2. HANDLERS ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const res = await api.post(endpoint, authForm);
      localStorage.setItem('api_key', res.data.api_key);
      localStorage.setItem('user_name', res.data.nama); 
      localStorage.setItem('user_role', res.data.role || 'user');
      localStorage.setItem('login_time', Date.now());
      
      const role = res.data.role || 'user';
      setUserName(res.data.nama);
      setUserRole(role);
      setIsUnlocked(role === 'admin'); // Admin otomatis unlocked
      localStorage.setItem('is_unlocked', role === 'admin' ? 'true' : 'false');
      
      setCurrentPage('dashboard');
      fetchDashboardData();
    } catch (err) { alert("Login Gagal."); }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsUnlocked(false);
    setCurrentPage('login');
    setSelectedCat(null);
    setApiResponse(null);
  };

  // Live Explorer (Enter to Unlock menu)
  const handleExplorerRun = async (e) => {
    if (e.key === 'Enter') {
      if (!testKeyInput) return;
      setApiResponse({ loading: "Validating API Key..." });
      try {
        const res = await axios.get('http://localhost:3000/api/kucing', { 
          headers: { 'x-api-key': testKeyInput } 
        });
        
        const metaData = userRole === 'admin' 
          ? { status: 200, role: "SYSTEM_ADMINISTRATOR", access: "FULL_CONTROL" }
          : { status: 200, role: "DEVELOPER_ACCESS", access: "READ_ONLY" };

        setApiResponse({ ...metaData, data: res.data });
        
        // UNLOCK MENU jika sukses
        setIsUnlocked(true);
        localStorage.setItem('is_unlocked', 'true');
        alert("API Key Valid! Menu Database Kucing telah dibuka.");
      } catch (err) {
        setApiResponse({ status: 401, error: "Unauthorized", message: "API Key Salah!" });
        setIsUnlocked(userRole === 'admin'); // Admin tetap unlock
      }
    }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(localStorage.getItem('api_key'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveCat = async () => {
    try {
      if (editId) { await api.put(`/kucing/${editId}`, catForm); } 
      else { await api.post('/kucing', catForm); }
      setShowModal({ ...showModal, cat: false });
      setEditId(null);
      setCatForm({ nama: '', umur: '', jenis: '' });
      fetchDashboardData();
    } catch (err) { alert("Gagal menyimpan."); }
  };

  const handleDeleteCat = async (id) => {
    if (window.confirm("Hapus data publik ini?")) {
      try {
        await api.delete(`/kucing/${id}`);
        fetchDashboardData();
      } catch (err) { alert("Gagal menghapus."); }
    }
  };

  const handleSaveCare = async () => {
    try {
      if (editId) { await api.put(`/perawatan/${editId}`, { catatan: careForm.catatan, tanggal: new Date().toISOString().split('T')[0] }); }
      else { await api.post('/perawatan', { id_kucing: selectedCat.id, catatan: careForm.catatan, tanggal: new Date().toISOString().split('T')[0] }); }
      setShowModal({ ...showModal, care: false });
      setEditId(null);
      fetchCatDetails(selectedCat);
    } catch (err) { alert("Gagal simpan."); }
  };

  const handleSaveVaccine = async () => {
    try {
      if (editId) { await api.put(`/vaksin/${editId}`, { nama_vaksin: vaccineForm.nama_vaksin, tanggal: vaccineForm.tanggal, status: 'pending' }); }
      else { await api.post('/vaksin', { id_kucing: selectedCat.id, nama_vaksin: vaccineForm.nama_vaksin, tanggal: vaccineForm.tanggal, status: 'pending' }); }
      setShowModal({ ...showModal, vaccine: false });
      setEditId(null);
      fetchCatDetails(selectedCat);
    } catch (err) { alert("Gagal simpan."); }
  };

  if (currentPage === 'login') {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-md border-t-8 border-blue-600 text-center">
            <Cat className="w-14 h-14 text-blue-600 mx-auto mb-2" />
            <h1 className="text-3xl font-bold text-gray-800 tracking-tighter">CatTrack<span className="text-blue-600">Pi</span></h1>
            <p className="text-gray-400 text-sm mb-8 italic uppercase tracking-widest font-black">API Service Platform</p>
          <form onSubmit={handleLogin} className="space-y-4">
            {isRegister && (
              <input 
                type="text" 
                placeholder="Nama Lengkap" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" 
                onChange={(e) => setAuthForm({...authForm, nama: e.target.value})} 
                required 
              />
            )}
            <input 
              type="email" 
              placeholder="Alamat Email" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" 
              onChange={(e) => setAuthForm({...authForm, email: e.target.value})} 
              required 
            />
            <input 
              type="password" 
              placeholder="Kata Sandi" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" 
              onChange={(e) => setAuthForm({...authForm, password: e.target.value})} 
              required 
            />
            
            {/* Tombol yang sudah dinamis */}
            <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-black hover:bg-blue-700 transition uppercase tracking-widest text-xs shadow-lg shadow-blue-100">
                {isRegister ? 'Register' : 'Login'}
            </button>
          </form>
          
          <p className="text-center text-[10px] text-slate-400 mt-8 font-black uppercase tracking-widest cursor-pointer hover:text-blue-600 transition" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Sudah punya akun? Masuk di sini' : 'Belum punya akun? Daftar di sini'} 
          </p>
        </div>
      </div>
    );
}

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col fixed h-full shadow-2xl z-30">
        <div className="p-8 flex items-center gap-3 border-b border-blue-800 font-black">
          <Cat className="text-blue-300" /> CatTrackPi
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => { setCurrentPage('dashboard'); }} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold text-sm transition ${currentPage === 'dashboard' ? 'bg-blue-600 shadow-lg' : 'hover:bg-blue-800'}`}>
            <LayoutDashboard size={18}/> Dashboard
          </button>
          
          {/* MENU CAT DATA API (Locked for User until valid) */}
          <button 
            disabled={userRole === 'user' && !isUnlocked}
            onClick={() => setCurrentPage('cats')} 
            className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-sm transition ${currentPage === 'cats' || currentPage === 'details' ? 'bg-blue-600 shadow-lg' : 'hover:bg-blue-800'} ${userRole === 'user' && !isUnlocked ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <div className="flex items-center gap-3"><List size={18}/> Cat Data API</div>
            {userRole === 'user' && (isUnlocked ? <Unlock size={14} className="text-green-400"/> : <Lock size={14} className="text-slate-400"/>)}
          </button>
        </nav>
        <button onClick={handleLogout} className="p-6 flex items-center gap-3 hover:bg-red-800 border-t border-blue-800 transition font-bold text-sm mt-auto"><LogOut size={18}/> Logout</button>
      </aside>

      <main className="ml-64 flex-1 p-10">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">{currentPage === 'dashboard' ? 'Developer Hub' : 'Explorer'}</h2>
          <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-full shadow-sm border border-slate-100">
             <div className="bg-blue-600 p-2 rounded-full text-white"><User size={16}/></div>
             <div>
                <p className="text-xs font-black text-slate-800 leading-none">{userName}</p>
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{userRole}</span>
             </div>
          </div>
        </header>

        {/* --- VIEW: DASHBOARD --- */}
        {currentPage === 'dashboard' && (
          <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
            {/* JIKA ADMIN: Tampilkan Statistik */}
            {userRole === 'admin' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 border-b-8 border-blue-500 text-center">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Total Cats</p>
                        <p className="text-5xl font-black text-slate-800">{stats.total_kucing}</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 border-b-8 border-orange-500 text-center">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Pending Vaccines</p>
                        <p className="text-5xl font-black text-slate-800">{stats.vaksin_pending}</p>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 border-b-8 border-green-500 text-center">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Daily Logs</p>
                        <p className="text-5xl font-black text-slate-800">{stats.catatan_hari_ini}</p>
                    </div>
                    <div className="col-span-full bg-blue-900 p-10 rounded-[2rem] text-white shadow-2xl">
                        <h3 className="text-2xl font-black mb-2 italic">Admin Panel Active 🚀</h3>
                        <p className="text-blue-200">Anda memiliki akses penuh untuk mengelola database publik CatTrackPi.</p>
                    </div>
                </div>
            ) : (
                