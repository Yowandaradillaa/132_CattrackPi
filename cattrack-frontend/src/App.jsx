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

  