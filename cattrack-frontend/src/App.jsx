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
                /* JIKA USER: Tampilkan API Key & Explorer */
                <>
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm"><Key size={18} className="text-blue-500"/> API KEY DEVELOPER ANDA</h3>
                            <button onClick={copyKey} className="text-blue-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:underline">
                            {copied ? <><Check size={12}/> Copied</> : <><Copy size={12}/> Copy Key</>}
                            </button>
                        </div>
                        <div className="bg-slate-900 text-blue-400 p-5 rounded-2xl font-mono text-sm break-all shadow-inner border border-slate-800 tracking-tighter">
                            {localStorage.getItem('api_key')}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
                        <h3 className="font-black text-slate-800 text-sm mb-6 uppercase tracking-widest">Cara Menggunakan:</h3>
                        <div className="space-y-4 text-xs text-slate-500 leading-relaxed font-bold">
                            <p className="flex gap-3"><span className="text-blue-600">•</span>
                                <span><b>Tambahkan Header Autentikasi:</b> Setiap request wajib menyertakan header <code className="bg-blue-50 px-1 rounded text-blue-600 font-black italic uppercase">x-api-key</code> dengan nilai API Key Anda di atas.</span>
                            </p>
                            <p className="flex gap-3"><span className="text-blue-600">•</span>
                                <span><b>Gunakan Endpoint:</b><code className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-bold tracking-tight">GET http://localhost:3000/api/kucing</code></span>
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100">
                        <h3 className="font-black text-slate-800 mb-2 flex items-center gap-2 text-sm uppercase tracking-widest"><Terminal size={18} className="text-blue-500"/> Live API Explorer</h3>
                        <p className="text-[10px] text-slate-400 mb-6 font-bold uppercase tracking-wider italic text-blue-500">Masukkan API Key & Tekan **Enter** Untuk Membuka Akses Database.</p>
                        <input 
                            type="text" placeholder="Paste API Key Anda di sini..." 
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 font-mono text-sm"
                            value={testKeyInput} onChange={(e) => setTestKeyInput(e.target.value)} onKeyDown={handleExplorerRun}
                        />
                        <div className="mt-6 bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden">
                            <div className="bg-slate-800 px-5 py-3 border-b border-slate-700 text-[9px] text-slate-400 font-black tracking-widest flex items-center gap-2 uppercase">
                                <div className={`w-1.5 h-1.5 rounded-full ${isUnlocked ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}/> Server Response JSON
                            </div>
                            <div className="p-6 font-mono text-[11px] text-green-400 min-h-[150px] max-h-[400px] overflow-auto">
                                {apiResponse ? <pre>{JSON.stringify(apiResponse, null, 2)}</pre> : <span className="text-slate-600 italic">// Masukkan API Key untuk melakukan validasi akses...</span>}
                            </div>
                        </div>
                    </div>
                </>
            )}
          </div>
        )}

        {/* --- VIEW: CATS EXPLORER --- */}
        {currentPage === 'cats' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-800 tracking-tight italic uppercase">Global Cat Registry</h3>
                {userRole === 'admin' && (
                    <button onClick={() => { setEditId(null); setCatForm({nama:'', umur:'', jenis:''}); setShowModal({...showModal, cat: true}); }} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 uppercase tracking-widest transition-all active:scale-95">
                        <Plus size={18}/> Tambah Data Publik
                    </button>
                )}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cats.map(cat => (
                  <div key={cat.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-2xl transition duration-500 group text-center border-t-4 border-blue-500">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-4 mx-auto group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                      <Cat size={32} />
                    </div>
                    <h4 className="text-xl font-black text-slate-800 tracking-tight mb-1">{cat.nama}</h4>
                    <p className="text-[10px] font-black text-slate-400 mb-8 uppercase tracking-widest">{cat.jenis} • {cat.umur} Thn</p>
                    <div className="flex gap-2">
                        <button onClick={() => fetchCatDetails(cat)} className="flex-1 bg-slate-900 text-white font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg">Detail Data</button>
                        {userRole === 'admin' && (
                          <div className="flex gap-1">
                            <button onClick={() => { setEditId(cat.id); setCatForm({nama: cat.nama, umur: cat.umur, jenis: cat.jenis}); setShowModal({...showModal, cat: true}); }} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100"><Pencil size={18} /></button>
                            <button onClick={() => handleDeleteCat(cat.id)} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100"><Trash2 size={18} /></button>
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
            <div className="max-w-5xl space-y-6 animate-in slide-in-from-bottom duration-500">
                <button onClick={() => setCurrentPage('cats')} className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline mb-4">
                    <ArrowLeft size={14} /> Back to Database
                </button>
                <div className="bg-white p-10 rounded-[3rem] shadow-xl flex items-center gap-10 border-l-[15px] border-blue-600">
                    <div className="bg-blue-50 p-8 rounded-[2rem] text-blue-600 shadow-inner"><Cat size={64} /></div>
                    <div>
                        <h3 className="text-5xl font-black text-slate-800 tracking-tighter mb-2">{selectedCat.nama}</h3>
                        <p className="text-slate-400 font-black uppercase tracking-widest text-sm">{selectedCat.jenis} • {selectedCat.umur} Tahun</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[3rem] shadow-lg border border-slate-100">
                        <div className="flex justify-between items-center mb-8 border-b pb-6">
                            <h4 className="font-black flex items-center gap-3 text-blue-900 uppercase text-xs tracking-widest"><ClipboardList size={22}/> Riwayat Catatan Perawatan</h4>
                            {userRole === 'admin' && <button onClick={() => { setEditId(null); setCareForm({catatan:''}); setShowModal({...showModal, care: true}); }} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 shadow-xl transition-transform hover:scale-110"><Plus size={24}/></button>}
                        </div>
                        <div className="space-y-4">
                            {careNotes.length === 0 ? <p className="text-slate-300 text-center text-xs py-10 italic">Belum ada riwayat catatan perawatan.</p> :
                                careNotes.map(note => (
                                    <div key={note.id} className="p-6 bg-blue-50 rounded-[2rem] border-l-4 border-blue-500 shadow-sm relative group">
                                        <div className="flex justify-between items-start">
                                            <p className="text-slate-700 font-bold text-sm leading-relaxed">{note.catatan}</p>
                                            {userRole === 'admin' && <button onClick={() => { setEditId(note.id); setCareForm({catatan: note.catatan}); setShowModal({...showModal, care: true}); }} className="text-slate-300 hover:text-blue-500 ml-2"><Pencil size={16}/></button>}
                                        </div>
                                        <p className="text-[10px] text-blue-400 font-black mt-4 uppercase tracking-tighter">{new Date(note.tanggal).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}</p>
                                    </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[3rem] shadow-lg border border-slate-100">
                        <div className="flex justify-between items-center mb-8 border-b pb-6">
                            <h4 className="font-black flex items-center gap-3 text-orange-900 uppercase text-xs tracking-widest"><Syringe size={22}/> Status Vaksinasi</h4>
                            {userRole === 'admin' && <button onClick={() => { setEditId(null); setVaccineForm({nama_vaksin:'', tanggal:''}); setShowModal({...showModal, vaccine: true}); }} className="bg-orange-600 text-white p-2 rounded-full hover:bg-orange-700 shadow-xl transition-transform hover:scale-110"><Plus size={24}/></button>}
                        </div>
                        <div className="space-y-4">
                            {vaccines.length === 0 ? <p className="text-slate-300 text-center text-xs py-10 italic">Belum ada data vaksin.</p> :
                                vaccines.map(v => (
                                    <div key={v.id} className="flex justify-between items-center p-6 bg-orange-50 rounded-[2rem] border-l-4 border-orange-500 shadow-sm">
                                        <div className="flex-1">
                                            <p className="font-black text-slate-800 text-sm tracking-tight">{v.nama_vaksin}</p>
                                            <p className="text-[10px] text-orange-500 font-black uppercase tracking-tighter mt-2">{new Date(v.tanggal).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${v.status === 'pending' ? 'bg-orange-200 text-orange-800' : 'bg-green-200 text-green-800'}`}>{v.status}</span>
                                            {userRole === 'admin' && <button onClick={() => { setEditId(v.id); setVaccineForm({nama_vaksin: v.nama_vaksin, tanggal: v.tanggal.split('T')[0]}); setShowModal({...showModal, vaccine: true}); }} className="text-slate-300 hover:text-orange-500"><Pencil size={16}/></button>}
                                        </div>
                                    </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}
      </main>

      {/* MODALS (ADMIN ONLY) */}
      {showModal.cat && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in zoom-in duration-200">
          <div className="bg-white rounded-[3rem] p-12 w-full max-w-md shadow-2xl relative border-t-[12px] border-blue-600">
            <button onClick={() => { setShowModal({...showModal, cat: false}); setEditId(null); }} className="absolute right-8 top-8 text-slate-300 hover:text-slate-500 transition-colors"><X size={24}/></button>
            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tighter italic uppercase">{editId ? 'Edit Data Kucing' : 'Publish Data Kucing'}</h3>
            <div className="space-y-4 mt-8">
              <input type="text" value={catForm.nama} placeholder="Cat Name" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" onChange={(e) => setCatForm({...catForm, nama: e.target.value})} />
              <input type="text" value={catForm.jenis} placeholder="Breed / Type" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" onChange={(e) => setCatForm({...catForm, jenis: e.target.value})} />
              <input type="number" value={catForm.umur} placeholder="Age" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" onChange={(e) => setCatForm({...catForm, umur: e.target.value})} />
              <button onClick={handleSaveCat} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all mt-4">{editId ? 'Update Data Kucing' : 'Publish Data Kucing'}</button>
            </div>
          </div>
        </div>
      )}

      