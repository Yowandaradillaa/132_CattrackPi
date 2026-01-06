import React, { useState, useEffect } from 'react';
import { Cat, User, LogOut, Plus, Trash2, LayoutDashboard, List, Copy, Check, Terminal, Key, ArrowLeft, ClipboardList, Syringe, X, Pencil, Lock, Unlock, Users } from 'lucide-react';
import api from './api/axios'; 
import axios from 'axios'; 

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [isRegister, setIsRegister] = useState(false);
  const [userName, setUserName] = useState('Pemilik Kucing');
  const [userRole, setUserRole] = useState('user');
  
  // WAJIB ADA: Wadah untuk menampung daftar user
  const [userList, setUserList] = useState([]); 
  
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
  const [vaccineForm, setVaccineForm] = useState({ nama_vaksin: '', tanggal: '', status: 'pending' });
  const [userForm, setUserForm] = useState({ nama: '', email: '', password: '', role: 'user' });

  const [editId, setEditId] = useState(null);

  // Explorer States
  const [testKeyInput, setTestKeyInput] = useState('');
  const [apiResponse, setApiResponse] = useState(null);
  
  const [showModal, setShowModal] = useState({ cat: false, care: false, vaccine: false, user: false });
  const [copied, setCopied] = useState(false);

  // --- 1. LOGIKA SESI ---
  useEffect(() => {
    const key = localStorage.getItem('api_key');
    const savedName = localStorage.getItem('user_name');
    const savedRole = localStorage.getItem('user_role');
    const savedTime = localStorage.getItem('login_time');
    const unlocked = localStorage.getItem('is_unlocked') === 'true';
    const currentTime = Date.now();

    if (key && savedTime) {
      if (currentTime - savedTime > 3600000) {
        alert("Sesi berakhir. Silakan login kembali.");
        handleLogout();
      } else {
        setUserName(savedName || 'Pengguna');
        setUserRole(savedRole || 'user');
        setIsUnlocked(savedRole === 'admin' ? true : unlocked);
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

  const fetchUsers = async () => {
    try {
        const res = await api.get('/users'); 
        setUserList(res.data);
    } catch (err) { console.error("Gagal load user", err); }
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
      setIsUnlocked(role === 'admin');
      localStorage.setItem('is_unlocked', role === 'admin' ? 'true' : 'false');
      
      setCurrentPage('dashboard');
      fetchDashboardData();
    } catch (err) { alert("Akses Gagal. Periksa kembali data Anda."); }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsUnlocked(false);
    setCurrentPage('login');
    setSelectedCat(null);
    setApiResponse(null);
  };

  const handleExplorerRun = async (e) => {
    if (e.key === 'Enter') {
      if (!testKeyInput) return;
      setApiResponse({ memuat: "Memvalidasi kunci..." });
      try {
        const res = await axios.get('http://localhost:3000/api/kucing', { 
          headers: { 'x-api-key': testKeyInput } 
        });
        const resData = userRole === 'admin' 
          ? { status: 200, role: "ADMINISTRATOR", data: res.data }
          : { status: 200, role: "DEVELOPER", data: res.data };
        setApiResponse(resData);
        setIsUnlocked(true);
        localStorage.setItem('is_unlocked', 'true');
        alert("API Key Valid! Menu API Data Kucing telah terbuka.");
      } catch (err) {
        setApiResponse({ status: 401, error: "Unauthorized", pesan: "API Key Salah!" });
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
    if (window.confirm("Hapus data kucing publik ini?")) {
      try {
        await api.delete(`/kucing/${id}`);
        fetchDashboardData();
      } catch (err) { alert("Gagal menghapus."); }
    }
  };

  const handleSaveUser = async () => {
    try {
        if (editId) { await api.put(`/users/${editId}`, userForm); } 
        else { await api.post('/users', userForm); }
        setShowModal({ ...showModal, user: false });
        setEditId(null);
        fetchUsers();
    } catch (err) { alert("Gagal menyimpan user."); }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Hapus pengguna ini? Akses API mereka akan terputus.")) {
        try {
            await api.delete(`/users/${id}`);
            fetchUsers(); 
        } catch (err) { alert("Gagal menghapus user."); }
    }
  };

  const handleSaveCare = async () => {
    try {
      const data = { catatan: careForm.catatan, tanggal: new Date().toISOString().split('T')[0] };
      if (editId) { await api.put(`/perawatan/${editId}`, data); }
      else { await api.post('/perawatan', { id_kucing: selectedCat.id, ...data }); }
      setShowModal({ ...showModal, care: false });
      setEditId(null);
      fetchCatDetails(selectedCat);
    } catch (err) { alert("Gagal menyimpan."); }
  };

  const handleSaveVaccine = async () => {
    try {
      const data = { nama_vaksin: vaccineForm.nama_vaksin, tanggal: vaccineForm.tanggal, status: vaccineForm.status };
      if (editId) { await api.put(`/vaksin/${editId}`, data); }
      else { await api.post('/vaksin', { id_kucing: selectedCat.id, ...data }); }
      setShowModal({ ...showModal, vaccine: false });
      setEditId(null);
      fetchCatDetails(selectedCat);
    } catch (err) { alert("Gagal menyimpan."); }
  };

  // --- 3. UI RENDER ---
  if (currentPage === 'login') {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4 text-slate-800">
        <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-md border-t-8 border-blue-600 text-center font-sans">
            <Cat className="w-14 h-14 text-blue-600 mx-auto mb-2" />
            <h1 className="text-3xl font-bold tracking-tighter">CatTrack<span className="text-blue-600">Pi</span></h1>
            <p className="text-gray-400 text-xs mb-8 uppercase tracking-widest font-black">Platform Layanan API</p>
          <form onSubmit={handleLogin} className="space-y-4">
            {isRegister && <input type="text" placeholder="Nama Lengkap" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm" onChange={(e) => setAuthForm({...authForm, nama: e.target.value})} required />}
            <input type="email" placeholder="Alamat Email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm" onChange={(e) => setAuthForm({...authForm, email: e.target.value})} required />
            <input type="password" placeholder="Kata Sandi" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm" onChange={(e) => setAuthForm({...authForm, password: e.target.value})} required />
            <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-black hover:bg-blue-700 transition uppercase tracking-widest text-xs shadow-lg shadow-blue-100 font-sans">
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
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      {/* SIDEBAR */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col fixed h-full shadow-2xl z-30">
        <div className="p-8 flex items-center gap-3 border-b border-blue-800 font-black text-xl tracking-tighter">
          <Cat className="text-blue-300" /> CatTrack<span className="text-blue-400">Pi</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setCurrentPage('dashboard')} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold text-sm transition ${currentPage === 'dashboard' ? 'bg-blue-600 shadow-lg text-white font-black' : 'hover:bg-blue-800 text-blue-100'}`}>
            <LayoutDashboard size={18}/> Dashboard
          </button>
          
          <button 
            disabled={userRole === 'user' && !isUnlocked}
            onClick={() => setCurrentPage('cats')} 
            className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-sm transition ${currentPage === 'cats' || currentPage === 'details' ? 'bg-blue-600 shadow-lg text-white font-black' : 'hover:bg-blue-800 text-blue-100'} ${userRole === 'user' && !isUnlocked ? 'opacity-30 cursor-not-allowed' : ''}`}>
            <div className="flex items-center gap-3"><List size={18}/>Cat Data API</div>
            {userRole === 'user' && (isUnlocked ? <Unlock size={14} className="text-green-400"/> : <Lock size={14} className="text-slate-400"/>)}
          </button>

          {userRole === 'admin' && (
            <button onClick={() => { setCurrentPage('users'); fetchUsers(); }} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold text-sm transition ${currentPage === 'users' ? 'bg-blue-600 shadow-lg text-white font-black' : 'hover:bg-blue-800 text-blue-100'}`}>
                <Users size={18}/> Manajemen User
            </button>
          )}
        </nav>
        <button onClick={handleLogout} className="p-6 flex items-center gap-3 hover:bg-red-800 border-t border-blue-800 transition font-bold text-sm mt-auto text-blue-100 hover:text-white"><LogOut size={18}/> Keluar</button>
      </aside>

      <main className="ml-64 flex-1 p-10 font-sans">
        <header className="flex justify-between items-center mb-10 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
            {currentPage === 'dashboard' ? 'Developer Hub' : currentPage === 'users' ? 'List User' : 'Explorer'}
          </h2>
          <div className="flex items-center gap-3 pr-4 font-sans text-slate-800">
            <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-1 rounded uppercase tracking-widest">{userRole}</span>
            <span className="font-bold text-gray-700 text-sm">{userName}</span>
            <div className="bg-blue-600 p-2 rounded-full text-white shadow-md font-sans"><User size={18}/></div>
          </div>
        </header>

        <div className="p-4 font-sans text-slate-800">
          {/* --- VIEW: DASHBOARD --- */}
{currentPage === 'dashboard' && (
  <div className="max-w-4xl space-y-8 animate-in fade-in duration-500 font-sans">
    {userRole === 'admin' ? (
      /* --- TAMPILAN KHUSUS ADMIN --- */
      <div className="space-y-8 font-sans">
        
        {/* 1. Kartu Greet Utama Admin */}
        <div className="bg-blue-900 rounded-[2rem] p-10 text-white shadow-2xl border-l-[16px] border-blue-500 relative overflow-hidden font-sans">
          <div className="relative z-10 font-sans">
            <h3 className="text-3xl font-black mb-2 italic tracking-tighter font-sans">Halo, Administrator! 🚀</h3>
            <p className="text-blue-200 text-sm font-bold uppercase tracking-widest font-sans">Sistem CatTrackPi berjalan normal</p>
            <p className="mt-6 text-blue-100 max-w-xl text-sm leading-relaxed font-sans">
              Anda berada di pusat kendali data global. Di sini Anda dapat memantau seluruh statistik data kucing, 
              catatan perawatan, vaksin, serta mengelola user.
            </p>
          </div>
          <Cat className="absolute -right-10 -bottom-10 w-64 h-64 text-blue-800 opacity-40 rotate-12" />
        </div>

        {/* 2. Statistik Cards (3 Kolom) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 border-b-8 border-blue-500 text-center font-sans">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 font-sans">Total Kucing</p>
            <p className="text-5xl font-black text-slate-800 font-sans">{stats.total_kucing}</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 border-b-8 border-orange-500 text-center font-sans">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 font-sans">Vaksin Pending</p>
            <p className="text-5xl font-black text-slate-800 font-sans">{stats.vaksin_pending}</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 border-b-8 border-green-500 text-center font-sans">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 font-sans">Log Hari Ini</p>
            <p className="text-5xl font-black text-slate-800 font-sans">{stats.catatan_hari_ini}</p>
          </div>
        </div>
      </div>
    ) : (
      /* --- TAMPILAN DEVELOPER TETAP SAMA --- */
                    <>
                        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 font-sans text-slate-800">
                            <div className="flex justify-between items-center mb-6 text-slate-800 font-sans font-sans font-sans">
                                <h3 className="font-black flex items-center gap-2 text-sm uppercase italic"><Key size={18} className="text-blue-500"/> API Key Anda</h3>
                                <button onClick={copyKey} className="text-blue-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:underline font-sans font-sans font-sans">
                                {copied ? <><Check size={12}/>Copied</> : <><Copy size={12}/>Copy API Key</>}
                                </button>
                            </div>
                            <div className="bg-slate-900 text-blue-400 p-5 rounded-2xl font-mono text-sm break-all shadow-inner border border-slate-800 tracking-tighter font-bold font-sans">
                                {localStorage.getItem('api_key')}
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 font-sans text-slate-800 font-sans font-sans font-sans">
                            <h3 className="font-black text-slate-800 text-sm mb-6 uppercase tracking-widest italic font-sans font-sans font-sans font-sans font-sans">Cara Menggunakan:</h3>
                            <div className="space-y-4 text-xs text-slate-500 font-bold leading-relaxed font-sans font-sans font-sans font-sans">
                                <p className="flex gap-3"><span className="text-blue-600 font-sans font-sans">•</span>
                                    <span className="font-sans"><b>Tambahkan Header Autentikasi:</b> Setiap request wajib menyertakan header <code className="bg-blue-50 px-1 rounded text-blue-600 font-black italic uppercase font-sans font-sans font-sans">x-api-key</code> berisi kunci Anda di atas.</span>
                                </p>
                                <p className="flex gap-3 font-sans font-sans font-sans font-sans font-sans font-sans font-sans"><span className="text-blue-600 font-sans font-sans">•</span>
                                    <span className="font-sans"><b>Gunakan Endpoint:</b><code className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-bold tracking-tight italic font-sans uppercase font-sans font-sans font-sans font-sans">GET http://localhost:3000/api/kucing</code></span>
                                </p>
                            </div>
                        </div>
                        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 font-sans font-sans font-sans font-sans font-sans font-sans">
                            <h3 className="font-black text-slate-800 mb-2 flex items-center gap-2 text-sm uppercase tracking-widest font-sans font-sans font-sans font-sans font-sans"><Terminal size={18} className="text-blue-500"/> Live API Explorer</h3>
                            <p className="text-[10px] text-slate-400 mb-6 font-bold uppercase tracking-wider italic text-blue-500 font-sans font-sans font-sans font-sans font-sans">Masukkan API Key & Tekan **Enter** Untuk Membuka Akses Menu.</p>
                            <input type="text" placeholder="Masukkan API Key Anda..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-mono text-sm font-bold shadow-inner font-sans font-sans font-sans font-sans" value={testKeyInput} onChange={(e) => setTestKeyInput(e.target.value)} onKeyDown={handleExplorerRun}/>
                            <div className="mt-6 bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden font-sans font-sans font-sans font-sans font-sans font-sans">
                                <div className="bg-slate-800 px-5 py-3 border-b border-slate-700 text-[9px] text-slate-400 font-black tracking-widest flex items-center gap-2 uppercase font-mono font-sans font-sans font-sans font-sans font-sans">
                                    <div className={`w-1.5 h-1.5 rounded-full ${isUnlocked ? 'bg-green-500 animate-pulse font-sans' : 'bg-red-500 font-sans'}`}/> Respon Server JSON
                                </div>
                                <div className="p-6 font-mono text-[11px] text-green-400 min-h-[150px] max-h-[400px] overflow-auto font-sans font-sans font-sans font-sans font-sans font-sans">
                                    {apiResponse ? <pre>{JSON.stringify(apiResponse, null, 2)}</pre> : <span className="text-slate-600 italic font-sans font-sans font-sans font-sans font-sans font-sans font-sans">// Masukkan API Key yang benar untuk validasi akses...</span>}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
          )}

          {/* --- VIEW: MANAJEMEN USER (GAYA KARTU SAMA) --- */}
          {currentPage === 'users' && userRole === 'admin' && (
            <div className="space-y-8 animate-in fade-in duration-500 font-sans">
                <div className="flex justify-between items-center font-sans">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight italic uppercase underline decoration-blue-500 decoration-4 underline-offset-8 font-sans font-sans font-sans font-sans"></h3>
                    <button onClick={() => { setEditId(null); setUserForm({nama:'', email:'', password:'', role:'user'}); setShowModal({...showModal, user: true}); }} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 uppercase tracking-widest transition-all">
                        <Plus size={18}/> Tambah User
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
                    {userList.map(u => (
                    <div key={u.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-2xl transition duration-500 group text-center border-t-4 border-blue-500 relative font-sans">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-4 mx-auto group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                            <User size={32} />
                        </div>
                        <h4 className="text-xl font-black text-slate-800 tracking-tight mb-1 font-sans">{u.nama}</h4>
                        <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest font-sans">{u.email}</p>
                        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-50 font-sans">
                            <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-tighter font-sans">
                                <span className="text-slate-400">Role:</span>
                                <span className={u.role === 'admin' ? 'text-blue-600' : 'text-green-600'}>{u.role}</span>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg font-mono text-[9px] text-slate-400 break-all border border-slate-100">
                                {u.api_key}
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4 font-sans">
                            <button onClick={() => { setEditId(u.id); setUserForm({nama: u.nama, email: u.email, role: u.role}); setShowModal({...showModal, user: true}); }} className="flex-1 bg-slate-50 text-slate-600 font-black py-2 rounded-xl text-[9px] uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all font-sans font-sans">Edit User</button>
                            <button onClick={() => handleDeleteUser(u.id)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-sans"><Trash2 size={16} /></button>
                        </div>
                    </div>
                    ))}
                </div>
            </div>
          )}

          {/* --- VIEW: LIST KUCING --- */}
          {currentPage === 'cats' && (
            <div className="space-y-8 animate-in fade-in duration-500 font-sans">
                <div className="flex justify-between items-center font-sans font-sans">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase italic underline decoration-blue-500 decoration-4 underline-offset-8 font-sans font-sans font-sans">Data Kucing Publik</h3>
                    {userRole === 'admin' && (
                        <button onClick={() => { setEditId(null); setCatForm({nama:'', umur:'', jenis:''}); setShowModal({...showModal, cat: true}); }} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 uppercase tracking-widest transition-all">
                            <Plus size={18}/> Tambah Kucing
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans font-sans">
                    {cats.map(cat => (
                    <div key={cat.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-2xl transition duration-500 group text-center border-t-4 border-blue-500 font-sans">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-4 mx-auto group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm font-sans font-sans font-sans font-sans font-sans font-sans">
                        <Cat size={32} />
                        </div>
                        <h4 className="text-xl font-black text-slate-800 tracking-tight mb-1 font-sans">{cat.nama}</h4>
                        <p className="text-[10px] font-black text-slate-400 mb-8 uppercase tracking-widest font-sans font-sans font-sans font-sans font-sans font-sans font-sans">{cat.jenis} • {cat.umur} Tahun</p>
                        <div className="flex gap-2 font-sans font-sans">
                            <button onClick={() => fetchCatDetails(cat)} className="flex-1 bg-slate-900 text-white font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg font-sans font-sans font-sans font-sans">Detail Data</button>
                            {userRole === 'admin' && (
                            <div className="flex gap-1 font-sans font-sans">
                                <button onClick={() => { setEditId(cat.id); setCatForm({nama: cat.nama, umur: cat.umur, jenis: cat.jenis}); setShowModal({...showModal, cat: true}); }} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-colors font-sans"><Pencil size={18} /></button>
                                <button onClick={() => handleDeleteCat(cat.id)} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors font-sans font-sans font-sans font-sans font-sans font-sans"><Trash2 size={18} /></button>
                            </div>
                            )}
                        </div>
                    </div>
                    ))}
                </div>
            </div>
          )}

          {/* --- VIEW: DETAILS --- */}
          {currentPage === 'details' && selectedCat && (
            <div className="max-w-5xl space-y-6 animate-in slide-in-from-bottom duration-500 font-sans font-sans font-sans font-sans">
                <button onClick={() => setCurrentPage('cats')} className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline mb-4">
                    <ArrowLeft size={14} /> Kembali ke Basis Data
                </button>
                <div className="bg-white p-10 rounded-[3rem] shadow-xl flex items-center gap-10 border-l-[15px] border-blue-600 font-sans font-sans font-sans font-sans">
                    <div className="bg-blue-50 p-8 rounded-[2rem] text-blue-600 shadow-inner font-sans font-sans font-sans"><Cat size={64} /></div>
                    <div className="font-sans font-sans">
                        <h3 className="text-5xl font-black text-slate-800 tracking-tighter mb-2 font-sans font-sans italic underline decoration-blue-500 decoration-8 font-sans font-sans">{selectedCat.nama}</h3>
                        <p className="text-slate-400 font-black uppercase tracking-widest text-sm font-sans font-sans font-sans font-sans font-sans">{selectedCat.jenis} • {selectedCat.umur} Tahun</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-sans font-sans font-sans font-sans font-sans font-sans">
                    <div className="bg-white p-8 rounded-[3rem] shadow-lg border border-slate-100 font-sans">
                        <div className="flex justify-between items-center mb-8 border-b pb-6 font-sans">
                            <h4 className="font-black flex items-center gap-3 text-blue-900 uppercase text-xs tracking-widest font-sans font-sans font-sans font-sans"><ClipboardList size={22}/> Catatan Perawatan</h4>
                            {userRole === 'admin' && <button onClick={() => { setEditId(null); setCareForm({catatan:''}); setShowModal({...showModal, care: true}); }} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 shadow-xl transition-transform hover:scale-110 font-sans font-sans font-sans font-sans font-sans font-sans"><Plus size={24}/></button>}
                        </div>
                        <div className="space-y-4 font-sans font-sans">
                            {careNotes.length === 0 ? <p className="text-slate-300 text-center text-xs py-10 italic font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans">Belum ada riwayat.</p> :
                                careNotes.map(note => (
                                    <div key={note.id} className="p-6 bg-blue-50 rounded-[2rem] border-l-4 border-blue-500 shadow-sm relative group font-sans font-sans font-sans">
                                        <div className="flex justify-between items-start font-sans font-sans font-sans">
                                            <p className="text-slate-700 font-bold text-sm leading-relaxed font-sans font-sans font-sans font-sans">{note.catatan}</p>
                                            {userRole === 'admin' && <button onClick={() => { setEditId(note.id); setCareForm({catatan: note.catatan}); setShowModal({...showModal, care: true}); }} className="text-slate-300 hover:text-blue-500 ml-2 font-sans font-sans font-sans transition-colors font-sans"><Pencil size={16}/></button>}
                                        </div>
                                        <p className="text-[10px] text-blue-400 font-black mt-4 uppercase tracking-tighter font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans">{new Date(note.tanggal).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}</p>
                                    </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[3rem] shadow-lg border border-slate-100 font-sans">
                        <div className="flex justify-between items-center mb-8 border-b pb-6 font-sans">
                            <h4 className="font-black flex items-center gap-3 text-orange-900 uppercase text-xs tracking-widest font-sans font-sans font-sans font-sans font-sans font-sans font-sans"><Syringe size={22}/> Log Vaksinasi</h4>
                            {userRole === 'admin' && <button onClick={() => { setEditId(null); setVaccineForm({nama_vaksin:'', tanggal:'', status:'pending'}); setShowModal({...showModal, vaccine: true}); }} className="bg-orange-600 text-white p-2 rounded-full hover:bg-orange-700 shadow-xl transition-transform hover:scale-110 font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans"><Plus size={24}/></button>}
                        </div>
                        <div className="space-y-4 font-sans font-sans font-sans font-sans">
                            {vaccines.length === 0 ? <p className="text-slate-300 text-center text-xs py-10 italic font-sans font-black font-sans font-sans font-sans font-sans font-sans font-sans font-sans">Belum ada data vaksin.</p> :
                                vaccines.map(v => (
                                    <div key={v.id} className="flex justify-between items-center p-6 bg-orange-50 rounded-[2rem] border-l-4 border-orange-500 shadow-sm font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans">
                                        <div className="flex-1 font-sans font-sans font-sans">
                                            <p className="font-black text-slate-800 text-sm tracking-tight font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans">{v.nama_vaksin}</p>
                                            <p className="text-[10px] text-orange-500 font-black uppercase tracking-tighter mt-2 font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans">{new Date(v.tanggal).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}</p>
                                        </div>
                                        <div className="flex items-center gap-3 font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${v.status === 'pending' ? 'bg-orange-200 text-orange-800 font-sans font-sans' : 'bg-green-200 text-green-800 font-sans font-sans'} font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans`}>{v.status}</span>
                                            {userRole === 'admin' && <button onClick={() => { setEditId(v.id); setVaccineForm({nama_vaksin: v.nama_vaksin, tanggal: v.tanggal.split('T')[0], status: v.status}); setShowModal({...showModal, vaccine: true}); }} className="text-slate-300 hover:text-orange-500 font-sans font-sans font-sans transition-colors font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans"><Pencil size={16}/></button>}
                                        </div>
                                    </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
          )}
        </div>
      </main>

      {/* MODALS */}
      {showModal.cat && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in zoom-in duration-200 font-sans">
          <div className="bg-white rounded-[3rem] p-12 w-full max-w-md shadow-2xl relative border-t-[12px] border-blue-600 font-sans">
            <button onClick={() => { setShowModal({...showModal, cat: false}); setEditId(null); }} className="absolute right-8 top-8 text-slate-300 hover:text-slate-500 transition-colors font-sans font-sans"><X size={24}/></button>
            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tighter uppercase italic font-sans font-sans">{editId ? 'Edit Data Kucing' : 'Tambah Kucing'}</h3>
            <div className="space-y-4 mt-8">
              <input type="text" value={catForm.nama} placeholder="Nama Kucing" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold font-sans font-sans" onChange={(e) => setCatForm({...catForm, nama: e.target.value})} />
              <input type="text" value={catForm.jenis} placeholder="Jenis / Ras" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold font-sans font-sans" onChange={(e) => setCatForm({...catForm, jenis: e.target.value})} />
              <input type="number" value={catForm.umur} placeholder="Umur" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold font-sans font-sans" onChange={(e) => setCatForm({...catForm, umur: e.target.value})} />
              <button onClick={handleSaveCat} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all mt-4 font-sans font-sans font-sans font-sans">{editId ? 'Perbarui Kucing' : 'Simpan Kucing'}</button>
            </div>
          </div>
        </div>
      )}

      {showModal.user && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in zoom-in duration-200 font-sans">
            <div className="bg-white rounded-[3rem] p-12 w-full max-w-md shadow-2xl relative border-t-[12px] border-blue-600 font-sans">
                <button onClick={() => { setShowModal({...showModal, user: false}); setEditId(null); }} className="absolute right-8 top-8 text-slate-300 hover:text-slate-500 transition-colors font-sans font-sans font-sans font-sans"><X size={24}/></button>
                <h3 className="text-2xl font-black text-slate-800 mb-8 tracking-tighter uppercase italic text-center font-sans font-sans font-sans">{editId ? 'Edit User' : 'Tambah Developer'}</h3>
                <div className="space-y-4 font-sans font-sans font-sans font-sans font-sans font-sans">
                    <input type="text" value={userForm.nama} placeholder="Nama Lengkap" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold font-sans font-sans font-sans font-sans font-sans" onChange={(e) => setUserForm({...userForm, nama: e.target.value})} />
                    <input type="email" value={userForm.email} placeholder="Email" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold font-sans font-sans font-sans font-sans font-sans" onChange={(e) => setUserForm({...userForm, email: e.target.value})} />
                    {!editId && <input type="password" placeholder="Password" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold font-sans font-sans font-sans font-sans font-sans" onChange={(e) => setUserForm({...userForm, password: e.target.value})} />}
                    <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold font-sans text-xs font-sans font-sans font-sans;font-serif;" value={userForm.role} onChange={(e) => setUserForm({...userForm, role: e.target.value})}>
                        <option value="user">DEVELOPER (USER)</option>
                        <option value="admin">ADMINISTRATOR</option>
                    </select>
                    <button onClick={handleSaveUser} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-blue-700 transition-all mt-4 font-sans font-sans font-sans font-sans font-sans font-sans">Simpan Data User</button>
                </div>
            </div>
        </div>
      )}

      {showModal.care && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in zoom-in duration-200 font-sans">
          <div className="bg-white rounded-[3rem] p-12 w-full max-w-md shadow-2xl relative border-t-[12px] border-blue-600 font-sans font-sans">
            <h3 className="text-2xl font-black text-slate-800 mb-8 tracking-tighter text-center uppercase italic font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans">{editId ? 'Edit Catatan' : 'Tambah Catatan'}</h3>
            <textarea value={careForm.catatan} placeholder="Deskripsikan riwayat kucing..." className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold mb-6 font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans" rows="4" onChange={(e) => setCareForm({catatan: e.target.value})}></textarea>
            <div className="flex gap-4 font-sans font-sans font-sans font-sans font-sans font-sans">
                <button onClick={() => { setShowModal({...showModal, care: false}); setEditId(null); }} className="flex-1 text-slate-400 font-black uppercase text-[10px] tracking-widest font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans">Batal</button>
                <button onClick={handleSaveCare} className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-blue-700 transition font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans">Simpan Catatan</button>
            </div>
          </div>
        </div>
      )}

      {showModal.vaccine && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in zoom-in duration-200 font-sans">
          <div className="bg-white rounded-[3rem] p-12 w-full max-w-md shadow-2xl relative border-t-[12px] border-orange-600 text-center font-sans font-sans">
            <h3 className="text-2xl font-black text-slate-800 mb-8 tracking-tighter text-center uppercase italic font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans">{editId ? 'Edit Vaksin' : 'Tambah Vaksin'}</h3>
            <div className="space-y-4 font-sans font-sans font-sans font-sans">
                <input type="text" value={vaccineForm.nama_vaksin} placeholder="Nama Vaksin" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans" onChange={(e) => setVaccineForm({...vaccineForm, nama_vaksin: e.target.value})} />
                <input type="date" value={vaccineForm.tanggal} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans" onChange={(e) => setVaccineForm({...vaccineForm, tanggal: e.target.value})} />
                <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold mb-4 font-sans text-xs font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans" value={vaccineForm.status || 'pending'} onChange={(e) => setVaccineForm({...vaccineForm, status: e.target.value})}>
                    <option value="pending">Masih Menunggu (Pending)</option>
                    <option value="selesai">Sudah Dilakukan (Selesai)</option>
                </select>
                <button onClick={handleSaveVaccine} className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-orange-700 transition mt-4 font-black font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans">Simpan Perubahan</button>
                <button onClick={() => { setShowModal({...showModal, vaccine: false}); setEditId(null); }} className="w-full text-slate-400 font-black uppercase text-[10px] tracking-widest mt-2 font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans font-sans">Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}