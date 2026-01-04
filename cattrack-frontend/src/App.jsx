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

 