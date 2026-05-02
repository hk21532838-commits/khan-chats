import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "firebase/auth";
import { getDatabase, ref, push, onValue, set, get, serverTimestamp, off } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDJt8Pf6bC938Q9Ufxwj6xSREV0xcQf6_I",
  authDomain: "khan-chats-d9607.firebaseapp.com",
  projectId: "khan-chats-d9607",
  storageBucket: "khan-chats-d9607.firebasestorage.app",
  messagingSenderId: "646302896729",
  appId: "1:646302896729:web:41b2d05775c704ad43d748",
  databaseURL: "https://khan-chats-d9607-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const LANGUAGES = ["English","Urdu","Arabic","Hindi","Spanish","French","German","Chinese","Japanese","Korean","Portuguese","Russian","Turkish","Italian","Dutch","Polish","Swedish","Norwegian","Danish","Finnish","Greek","Hebrew","Persian","Bengali","Punjabi","Sindhi","Pashto","Swahili","Malay","Indonesian","Thai","Vietnamese","Romanian","Hungarian","Czech","Slovak","Bulgarian","Croatian","Serbian","Ukrainian","Catalan","Slovenian","Lithuanian","Latvian","Estonian","Albanian","Macedonian","Bosnian","Azerbaijani","Georgian","Armenian","Kazakh","Uzbek","Turkmen","Kyrgyz","Tajik","Mongolian","Tibetan","Nepali","Sinhala","Burmese","Khmer","Lao","Amharic","Somali","Yoruba","Igbo","Hausa","Zulu","Xhosa","Afrikaans","Malagasy","Sesotho","Shona","Maltese","Icelandic","Welsh","Irish","Scottish Gaelic","Basque","Galician","Belarusian","Moldovan","Luxembourgish","Faroese","Breton","Occitan","Corsican","Sardinian","Sicilian","Neapolitan","Venetian","Lombard","Piedmontese","Ligurian","Friulian","Romansh","Aragonese","Asturian","Mirandese","Fula","Wolof","Bambara","Moore","Lingala","Kinyarwanda","Kirundi","Luganda","Chichewa","Tswana","Sotho","Tsonga"];

function formatTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}
const COLORS = ["#25D366","#128C7E","#075E54","#34B7F1","#8B5CF6","#F59E0B","#EF4444","#3B82F6"];
function colorFromName(name) {
  if (!name) return COLORS[0];
  let sum = 0;
  for (let c of name) sum += c.charCodeAt(0);
  return COLORS[sum % COLORS.length];
}
function getChatId(uid1, uid2) { return [uid1, uid2].sort().join("_"); }
function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return "Expired";
}
function formatDuration(seconds) {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
function formatCallTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [contacts, setContacts] = useState({});
  const [pinnedChats, setPinnedChats] = useState([]);
  const [lockedChats, setLockedChats] = useState({});
  const [unlockedChats, setUnlockedChats] = useState([]);
  const [showLockModal, setShowLockModal] = useState(null);
  const [showUnlockModal, setShowUnlockModal] = useState(null);
  const [lockPin, setLockPin] = useState("");
  const [unlockPin, setUnlockPin] = useState("");
  const [lockError, setLockError] = useState("");
  const [showLockedSection, setShowLockedSection] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [newChatEmail, setNewChatEmail] = useState("");
  const [newChatError, setNewChatError] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [previewImg, setPreviewImg] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [callType, setCallType] = useState(null);
  const [currentView, setCurrentView] = useState("chats");
  const [statuses, setStatuses] = useState([]);
  const [statusText, setStatusText] = useState("");
  const [showAddStatus, setShowAddStatus] = useState(false);
  const [viewingStatus, setViewingStatus] = useState(null);
  const [callHistory, setCallHistory] = useState([]);
  const [callFilter, setCallFilter] = useState("all");
  const [callStartTime, setCallStartTime] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState("profile");
  const [profilePic, setProfilePic] = useState(null);
  const [newName, setNewName] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [langSearch, setLangSearch] = useState("");
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const statusFileRef = useRef(null);
  const profilePicRef = useRef(null);
  const notifRef = useRef(0);
  const activeChatRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u); setScreen("chat"); setNewName(u.displayName || "");
        await set(ref(db, `users/${u.uid}`), { uid: u.uid, name: u.displayName || u.email.split("@")[0], email: u.email, online: true, lastSeen: serverTimestamp() });
        loadContacts(u); loadStatuses(); loadCallHistory(u); loadPins(u); loadProfilePic(u); loadLockedChats(u);
      } else { setUser(null); setScreen("login"); }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const loadContacts = (u) => {
    onValue(ref(db, `userChats/${u.uid}`), async (snap) => {
      const data = snap.val() || {};
      const map = {};
      for (const chatId of Object.keys(data)) {
        const otherUid = data[chatId].with;
        const s = await get(ref(db, `users/${otherUid}`));
        if (s.exists()) map[chatId] = { ...s.val(), chatId, lastMsg: data[chatId].lastMsg || "", lastTime: data[chatId].lastTime || 0 };
      }
      setContacts(map);
    });
  };

  const loadStatuses = () => {
    onValue(ref(db, "statuses"), (snap) => {
      const data = snap.val() || {};
      const arr = Object.values(data).filter(s => Date.now() - s.timestamp < 86400000).sort((a, b) => b.timestamp - a.timestamp);
      setStatuses(arr);
    });
  };

  const loadCallHistory = (u) => {
    onValue(ref(db, `callHistory/${u.uid}`), (snap) => {
      const data = snap.val() || {};
      setCallHistory(Object.values(data).sort((a, b) => b.timestamp - a.timestamp));
    });
  };

  const loadPins = (u) => {
    onValue(ref(db, `pins/${u.uid}`), (snap) => { setPinnedChats(snap.val() || []); });
  };

  const loadProfilePic = (u) => {
    onValue(ref(db, `profilePics/${u.uid}`), (snap) => { if (snap.val()) setProfilePic(snap.val()); });
  };

  const loadLockedChats = (u) => {
    onValue(ref(db, `lockedChats/${u.uid}`), (snap) => { setLockedChats(snap.val() || {}); });
  };

  const saveCall = (u, callData) => {
    push(ref(db, `callHistory/${u.uid}`), { ...callData, timestamp: Date.now() });
  };

  const togglePin = async (chatId) => {
    const newPins = pinnedChats.includes(chatId) ? pinnedChats.filter(p => p !== chatId) : [...pinnedChats, chatId];
    await set(ref(db, `pins/${user.uid}`), newPins);
  };

  const saveProfilePic = async (imgData) => {
    await set(ref(db, `profilePics/${user.uid}`), imgData);
    setProfilePic(imgData);
  };

  const saveName = async () => {
    if (!newName.trim()) return;
    await updateProfile(auth.currentUser, { displayName: newName.trim() });
    await set(ref(db, `users/${user.uid}/name`), newName.trim());
    setUser({ ...user, displayName: newName.trim() });
    alert("Name updated!");
  };

  const handleProfilePic = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500000) { alert("Image must be under 500KB"); return; }
    const reader = new FileReader();
    reader.onload = ev => saveProfilePic(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const lockChat = async (chatId) => {
    if (lockPin.length < 4) { setLockError("PIN must be at least 4 digits"); return; }
    const newLocked = { ...lockedChats, [chatId]: lockPin };
    await set(ref(db, `lockedChats/${user.uid}`), newLocked);
    setLockPin(""); setShowLockModal(null); setLockError("");
    alert("Chat locked! 🔒");
  };

  const unlockChat = (chatId) => {
    if (unlockPin === lockedChats[chatId]) {
      setUnlockedChats(p => [...p, chatId]);
      setUnlockPin(""); setShowUnlockModal(null); setLockError("");
    } else {
      setLockError("Wrong PIN! Try again");
    }
  };

  const removeLock = async (chatId) => {
    const newLocked = { ...lockedChats };
    delete newLocked[chatId];
    await set(ref(db, `lockedChats/${user.uid}`), newLocked);
    setUnlockedChats(p => p.filter(id => id !== chatId));
  };

  const handleChatClick = (contact) => {
    const chatId = contact.chatId;
    if (lockedChats[chatId] && !unlockedChats.includes(chatId)) {
      setShowUnlockModal(chatId);
      setUnlockPin(""); setLockError("");
    } else {
      openChat(contact);
    }
  };

  const askKhanAI = async () => {
    if (!aiInput.trim()) return;
    const userMsg = { role: "user", text: aiInput.trim() };
    setAiMessages(p => [...p, userMsg]);
    setAiInput(""); setAiLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are Khan AI, a friendly assistant for Khan Chats app made by Hamza Khan. Be helpful, friendly and concise.",
          messages: [...aiMessages.map(m => ({ role: m.role, content: m.text })), { role: "user", content: aiInput.trim() }],
        }),
      });
      const data = await res.json();
      setAiMessages(p => [...p, { role: "assistant", text: data.content?.[0]?.text || "Sorry, I couldn't respond." }]);
    } catch {
      setAiMessages(p => [...p, { role: "assistant", text: "Connection error. Please try again." }]);
    }
    setAiLoading(false);
  };

  const register = async () => {
    if (!displayName.trim()) { setAuthError("Please enter your name"); return; }
    setAuthLoading(true); setAuthError("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: displayName.trim() });
    } catch (e) {
      setAuthError(e.message.includes("email-already") ? "This email is already registered" : e.message.includes("weak") ? "Password must be at least 6 characters" : "Something went wrong");
    }
    setAuthLoading(false);
  };

  const login = async () => {
    setAuthLoading(true); setAuthError("");
    try { await signInWithEmailAndPassword(auth, email, password); }
    catch { setAuthError("Incorrect email or password"); }
    setAuthLoading(false);
  };

  const logout = async () => {
    if (user) await set(ref(db, `users/${user.uid}/online`), false);
    await signOut(auth);
    setActiveChat(null); setMessages([]); setContacts({});
  };

  const startChat = async () => {
    setNewChatError("");
    if (!newChatEmail.trim()) { setNewChatError("Please enter an email"); return; }
    if (newChatEmail.trim() === user.email) { setNewChatError("You cannot message yourself!"); return; }
    const snap = await get(ref(db, "users"));
    const found = Object.values(snap.val() || {}).find(u => u.email === newChatEmail.trim());
    if (!found) { setNewChatError("User not found. Please invite them first!"); return; }
    const chatId = getChatId(user.uid, found.uid);
    await set(ref(db, `userChats/${user.uid}/${chatId}`), { with: found.uid, lastMsg: "", lastTime: serverTimestamp() });
    await set(ref(db, `userChats/${found.uid}/${chatId}`), { with: user.uid, lastMsg: "", lastTime: serverTimestamp() });
    setNewChatEmail(""); setShowNewChat(false); setCurrentView("chats");
    openChat({ ...found, chatId });
  };

  const openChat = (contact) => {
    setActiveChat(contact);
    off(ref(db, `chats/${contact.chatId}/messages`));
    onValue(ref(db, `chats/${contact.chatId}/messages`), (snap) => {
      const arr = Object.values(snap.val() || {}).sort((a, b) => a.timestamp - b.timestamp);
      setMessages(arr);
    });
  };

  const sendMessage = async (imageData = null) => {
    if (!activeChat || (!input.trim() && !imageData)) return;
    const msg = { text: imageData ? "" : input.trim(), image: imageData || null, senderUid: user.uid, senderName: user.displayName || user.email, timestamp: Date.now() };
    await push(ref(db, `chats/${activeChat.chatId}/messages`), msg);
    const lastMsg = imageData ? "📷 Photo" : input.trim();
    await set(ref(db, `userChats/${user.uid}/${activeChat.chatId}/lastMsg`), lastMsg);
    await set(ref(db, `userChats/${activeChat.uid}/${activeChat.chatId}/lastMsg`), lastMsg);
    await set(ref(db, `userChats/${user.uid}/${activeChat.chatId}/lastTime`), serverTimestamp());
    await set(ref(db, `userChats/${activeChat.uid}/${activeChat.chatId}/lastTime`), serverTimestamp());
    setInput("");
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500000) { alert("Photo must be smaller than 500KB"); return; }
    const reader = new FileReader();
    reader.onload = ev => sendMessage(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const postStatus = async (imageData = null) => {
    if (!statusText.trim() && !imageData) return;
    await push(ref(db, "statuses"), { uid: user.uid, name: user.displayName || user.email, text: statusText.trim(), image: imageData || null, timestamp: Date.now() });
    setStatusText(""); setShowAddStatus(false);
  };

  const handleStatusImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500000) { alert("Image must be under 500KB"); return; }
    const reader = new FileReader();
    reader.onload = ev => postStatus(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const generateInvite = () => {
    const link = `${window.location.origin}?invite=${btoa(user.email)}`;
    setInviteLink(link); setShowInvite(true);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const startCall = async (type) => {
    if (!activeChat) return;
    setCallType(type); setInCall(true); setCallStartTime(Date.now());
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: type === "video", audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      pcRef.current = pc;
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      pc.ontrack = (e) => { if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0]; };
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await set(ref(db, `calls/${activeChat.chatId}`), { offer: JSON.stringify(offer), caller: user.uid, callerName: user.displayName, type, timestamp: Date.now() });
      onValue(ref(db, `calls/${activeChat.chatId}/answer`), async (snap) => {
        if (snap.val() && pc.signalingState !== "stable") await pc.setRemoteDescription(JSON.parse(snap.val()));
      });
      pc.onicecandidate = (e) => { if (e.candidate) push(ref(db, `calls/${activeChat.chatId}/callerCandidates`), JSON.stringify(e.candidate)); };
      saveCall(user, { name: activeChat.name, type, direction: "outgoing", status: "completed", duration: 0 });
    } catch (err) {
      alert("Microphone/Camera access denied: " + err.message);
      setInCall(false);
    }
  };

  const endCall = () => {
    const duration = callStartTime ? Math.floor((Date.now() - callStartTime) / 1000) : 0;
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
    if (pcRef.current) pcRef.current.close();
    set(ref(db, `calls/${activeChat?.chatId}`), null);
    setInCall(false); setCallType(null); setCallStartTime(null);
  };

  useEffect(() => {
    if (!user || !activeChat) return;
    onValue(ref(db, `calls/${activeChat.chatId}`), async (snap) => {
      const data = snap.val();
      if (data && data.caller !== user.uid && data.offer && !inCall) {
        if (window.confirm(`Incoming ${data.type === "video" ? "Video" : "Audio"} call from ${data.callerName}! Answer?`)) {
          setCallType(data.type); setInCall(true); setCallStartTime(Date.now());
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: data.type === "video", audio: true });
            localStreamRef.current = stream;
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;
            const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
            pcRef.current = pc;
            stream.getTracks().forEach(t => pc.addTrack(t, stream));
            pc.ontrack = (e) => { if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0]; };
            await pc.setRemoteDescription(JSON.parse(data.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await set(ref(db, `calls/${activeChat.chatId}/answer`), JSON.stringify(answer));
            pc.onicecandidate = (e) => { if (e.candidate) push(ref(db, `calls/${activeChat.chatId}/calleeCandidates`), JSON.stringify(e.candidate)); };
            saveCall(user, { name: data.callerName, type: data.type, direction: "incoming", status: "completed", duration: 0 });
          } catch (err) {
            alert("Could not receive call: " + err.message);
            setInCall(false);
          }
        } else {
          saveCall(user, { name: data.callerName, type: data.type, direction: "incoming", status: "missed", duration: 0 });
        }
      }
    });
  }, [user, activeChat]);

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#111b21", flexDirection:"column", gap:16 }}>
      <div style={{ fontSize:50 }}>💬</div>
      <div style={{ color:"#25D366", fontSize:20, fontWeight:700 }}>Khan Chats</div>
      <div style={{ color:"#8696a0" }}>Loading...</div>
    </div>
  );

  if (screen === "login" || screen === "register") return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#111b21", fontFamily:"'Segoe UI',sans-serif" }}>
      <div style={{ width:"100%", maxWidth:380, padding:"0 24px" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:60, marginBottom:12 }}>💬</div>
          <h1 style={{ color:"#e9edef", fontWeight:800, fontSize:28, margin:0 }}>Khan Chats</h1>
          <p style={{ color:"#8696a0", fontSize:14, margin:"8px 0 0" }}>Chat with your friends</p>
        </div>
        <div style={{ display:"flex", background:"#202c33", borderRadius:12, padding:4, marginBottom:24 }}>
          {["login","register"].map(s => (
            <div key={s} onClick={() => { setScreen(s); setAuthError(""); }}
              style={{ flex:1, textAlign:"center", padding:"10px", borderRadius:10, cursor:"pointer", fontWeight:600, fontSize:14, background:screen===s?"#25D366":"transparent", color:screen===s?"#fff":"#8696a0" }}>
              {s === "login" ? "Login" : "Register"}
            </div>
          ))}
        </div>
        {screen === "register" && (
          <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Enter your name"
            style={{ width:"100%", padding:"14px 16px", background:"#202c33", border:"1px solid #2a3942", borderRadius:12, color:"#e9edef", fontSize:15, outline:"none", marginBottom:12, boxSizing:"border-box" }} />
        )}
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email"
          style={{ width:"100%", padding:"14px 16px", background:"#202c33", border:"1px solid #2a3942", borderRadius:12, color:"#e9edef", fontSize:15, outline:"none", marginBottom:12, boxSizing:"border-box" }} />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password"
          onKeyDown={e => e.key==="Enter" && (screen==="login"?login():register())}
          style={{ width:"100%", padding:"14px 16px", background:"#202c33", border:"1px solid #2a3942", borderRadius:12, color:"#e9edef", fontSize:15, outline:"none", marginBottom:16, boxSizing:"border-box" }} />
        {authError && <div style={{ color:"#ef4444", fontSize:13, marginBottom:12, textAlign:"center" }}>{authError}</div>}
        <div onClick={screen==="login"?login:register}
          style={{ width:"100%", padding:"15px", background:authLoading?"#128C7E":"#25D366", borderRadius:12, textAlign:"center", color:"#fff", fontWeight:700, fontSize:16, cursor:"pointer", boxSizing:"border-box" }}>
          {authLoading ? "Please wait..." : screen==="login" ? "Login" : "Create Account"}
        </div>
      </div>
    </div>
  );

  // SETTINGS SCREEN
  if (showSettings) return (
    <div style={{ position:"fixed", inset:0, background:"#111b21", zIndex:9999, display:"flex", flexDirection:"column", fontFamily:"'Segoe UI',sans-serif", color:"#e9edef" }}>
      <div style={{ display:"flex", alignItems:"center", padding:"12px 16px", background:"#202c33", gap:12 }}>
        <span onClick={() => setShowSettings(false)} style={{ fontSize:22, cursor:"pointer", color:"#8696a0" }}>←</span>
        <div style={{ fontWeight:700, fontSize:18, flex:1 }}>⚙️ Settings</div>
      </div>
      <div style={{ display:"flex", background:"#202c33", borderBottom:"1px solid #1f2c33", overflowX:"auto" }}>
        {[["profile","👤","Profile"],["language","🌐","Language"],["pins","📌","Pins"],["locks","🔒","Locks"],["ai","🤖","Khan AI"]].map(([tab, icon, label]) => (
          <div key={tab} onClick={() => setSettingsTab(tab)}
            style={{ padding:"10px 16px", cursor:"pointer", fontSize:12, fontWeight:600, whiteSpace:"nowrap",
              color: settingsTab===tab ? "#25D366" : "#8696a0",
              borderBottom: settingsTab===tab ? "2px solid #25D366" : "2px solid transparent" }}>
            {icon} {label}
          </div>
        ))}
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:16 }}>

        {settingsTab === "profile" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ position:"relative", display:"inline-block" }}>
                {profilePic ? (
                  <img src={profilePic} alt="profile" style={{ width:100, height:100, borderRadius:"50%", objectFit:"cover", border:"3px solid #25D366" }} />
                ) : (
                  <div style={{ width:100, height:100, borderRadius:"50%", background:colorFromName(user?.displayName), display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:32, color:"#fff", border:"3px solid #25D366", margin:"0 auto" }}>
                    {getInitials(user?.displayName)}
                  </div>
                )}
                <div onClick={() => profilePicRef.current?.click()} style={{ position:"absolute", bottom:4, right:4, background:"#25D366", borderRadius:"50%", width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:14 }}>📷</div>
              </div>
              <input type="file" accept="image/*" ref={profilePicRef} onChange={handleProfilePic} style={{ display:"none" }} />
              <div style={{ marginTop:8, color:"#8696a0", fontSize:13 }}>Tap camera to change photo</div>
            </div>
            <div style={{ background:"#202c33", borderRadius:12, padding:16 }}>
              <div style={{ fontSize:12, color:"#25D366", fontWeight:600, marginBottom:8 }}>Display Name</div>
              <input value={newName} onChange={e => setNewName(e.target.value)}
                style={{ width:"100%", padding:"10px 12px", background:"#2a3942", border:"none", borderRadius:10, color:"#e9edef", fontSize:15, outline:"none", boxSizing:"border-box", marginBottom:10 }} />
              <div onClick={saveName} style={{ padding:"10px", background:"#25D366", borderRadius:10, textAlign:"center", color:"#fff", fontWeight:700, cursor:"pointer" }}>Save Name</div>
            </div>
            <div style={{ background:"#202c33", borderRadius:12, padding:16 }}>
              <div style={{ fontSize:12, color:"#25D366", fontWeight:600, marginBottom:4 }}>Email</div>
              <div style={{ color:"#e9edef", fontSize:15 }}>{user?.email}</div>
            </div>
            <div onClick={logout} style={{ padding:"14px", background:"#ef4444", borderRadius:12, textAlign:"center", color:"#fff", fontWeight:700, cursor:"pointer" }}>🚪 Logout</div>
          </div>
        )}

        {settingsTab === "language" && (
          <div>
            <div style={{ background:"#202c33", borderRadius:12, padding:12, marginBottom:12 }}>
              <div style={{ fontSize:13, color:"#25D366", fontWeight:600, marginBottom:8 }}>Current: {selectedLanguage}</div>
              <input value={langSearch} onChange={e => setLangSearch(e.target.value)} placeholder="Search language..."
                style={{ width:"100%", padding:"10px 12px", background:"#2a3942", border:"none", borderRadius:10, color:"#e9edef", fontSize:14, outline:"none", boxSizing:"border-box" }} />
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              {LANGUAGES.filter(l => l.toLowerCase().includes(langSearch.toLowerCase())).map(lang => (
                <div key={lang} onClick={() => { setSelectedLanguage(lang); setLangSearch(""); }}
                  style={{ padding:"12px 16px", background: selectedLanguage===lang ? "#2a3942" : "#202c33", borderRadius:10, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ color:"#e9edef", fontSize:14 }}>{lang}</span>
                  {selectedLanguage===lang && <span style={{ color:"#25D366" }}>✓</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {settingsTab === "pins" && (
          <div>
            <div style={{ fontSize:13, color:"#8696a0", marginBottom:12 }}>Pin important contacts to top of chat list</div>
            {Object.entries(contacts).length === 0 ? (
              <div style={{ textAlign:"center", color:"#8696a0", marginTop:40 }}>
                <div style={{ fontSize:40 }}>📌</div>
                <div style={{ marginTop:8 }}>No contacts to pin</div>
              </div>
            ) : Object.entries(contacts).map(([chatId, contact]) => (
              <div key={chatId} style={{ display:"flex", alignItems:"center", padding:"12px 16px", background:"#202c33", borderRadius:12, marginBottom:8, gap:12 }}>
                <div style={{ width:44, height:44, borderRadius:"50%", background:colorFromName(contact.name), display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:15, color:"#fff" }}>
                  {getInitials(contact.name)}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:15 }}>{contact.name}</div>
                  <div style={{ fontSize:12, color:"#8696a0" }}>{contact.email}</div>
                </div>
                <div onClick={() => togglePin(chatId)} style={{ padding:"8px 14px", background: pinnedChats.includes(chatId) ? "#25D366" : "#2a3942", borderRadius:20, color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                  {pinnedChats.includes(chatId) ? "📌 Pinned" : "Pin"}
                </div>
              </div>
            ))}
          </div>
        )}

        {settingsTab === "locks" && (
          <div>
            <div style={{ background:"#202c33", borderRadius:12, padding:12, marginBottom:12 }}>
              <div style={{ fontSize:13, color:"#25D366", fontWeight:600, marginBottom:4 }}>🔒 Chat Lock</div>
              <div style={{ fontSize:12, color:"#8696a0" }}>Lock individual chats with a PIN. Locked chats are hidden and require PIN to open.</div>
            </div>
            {Object.entries(contacts).length === 0 ? (
              <div style={{ textAlign:"center", color:"#8696a0", marginTop:40 }}>
                <div style={{ fontSize:40 }}>🔒</div>
                <div style={{ marginTop:8 }}>No contacts to lock</div>
              </div>
            ) : Object.entries(contacts).map(([chatId, contact]) => (
              <div key={chatId} style={{ display:"flex", alignItems:"center", padding:"12px 16px", background:"#202c33", borderRadius:12, marginBottom:8, gap:12 }}>
                <div style={{ width:44, height:44, borderRadius:"50%", background:colorFromName(contact.name), display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:15, color:"#fff" }}>
                  {getInitials(contact.name)}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:15 }}>{contact.name}</div>
                  <div style={{ fontSize:12, color: lockedChats[chatId] ? "#ef4444" : "#8696a0" }}>
                    {lockedChats[chatId] ? "🔒 Locked" : "🔓 Unlocked"}
                  </div>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  {lockedChats[chatId] ? (
                    <div onClick={() => { if (window.confirm("Remove lock from this chat?")) removeLock(chatId); }}
                      style={{ padding:"8px 12px", background:"#ef4444", borderRadius:20, color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                      Remove Lock
                    </div>
                  ) : (
                    <div onClick={() => { setShowLockModal(chatId); setLockPin(""); setLockError(""); }}
                      style={{ padding:"8px 12px", background:"#25D366", borderRadius:20, color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                      🔒 Lock
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {settingsTab === "ai" && (
          <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 160px)" }}>
            <div style={{ background:"#202c33", borderRadius:12, padding:12, marginBottom:12, textAlign:"center" }}>
              <div style={{ fontSize:32 }}>🤖</div>
              <div style={{ fontWeight:700, fontSize:16, color:"#25D366" }}>Khan AI</div>
              <div style={{ fontSize:12, color:"#8696a0" }}>Powered by Claude AI</div>
            </div>
            <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:8, marginBottom:12 }}>
              {aiMessages.length === 0 && (
                <div style={{ textAlign:"center", color:"#8696a0", marginTop:40 }}>
                  <div style={{ fontSize:40 }}>💬</div>
                  <div style={{ marginTop:8 }}>Ask Khan AI anything!</div>
                </div>
              )}
              {aiMessages.map((msg, i) => (
                <div key={i} style={{ display:"flex", justifyContent: msg.role==="user" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth:"80%", padding:"10px 14px", background: msg.role==="user" ? "#005c4b" : "#202c33", borderRadius: msg.role==="user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px", fontSize:14, color:"#e9edef", lineHeight:1.5 }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div style={{ display:"flex", justifyContent:"flex-start" }}>
                  <div style={{ padding:"10px 16px", background:"#202c33", borderRadius:"14px 14px 14px 3px", color:"#8696a0", fontSize:14 }}>Thinking... 🤔</div>
                </div>
              )}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key==="Enter" && askKhanAI()} placeholder="Ask Khan AI..."
                style={{ flex:1, padding:"12px 14px", background:"#202c33", border:"none", borderRadius:24, color:"#e9edef", fontSize:14, outline:"none" }} />
              <div onClick={askKhanAI} style={{ width:46, height:46, borderRadius:"50%", background: aiInput.trim()?"#25D366":"#2a3942", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:18 }}>➤</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // LOCK MODAL
  if (showLockModal) return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:10000, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#202c33", borderRadius:20, padding:28, maxWidth:320, width:"90%", textAlign:"center" }}>
        <div style={{ fontSize:40, marginBottom:12 }}>🔒</div>
        <h3 style={{ color:"#e9edef", margin:"0 0 8px" }}>Set Chat Lock PIN</h3>
        <p style={{ color:"#8696a0", fontSize:13, marginBottom:16 }}>Enter a PIN to lock this chat</p>
        <input value={lockPin} onChange={e => setLockPin(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter PIN (min 4 digits)" type="password" maxLength={8}
          style={{ width:"100%", padding:"12px", background:"#2a3942", border:"none", borderRadius:10, color:"#e9edef", fontSize:18, outline:"none", textAlign:"center", letterSpacing:6, boxSizing:"border-box", marginBottom:8 }} />
        {lockError && <div style={{ color:"#ef4444", fontSize:13, marginBottom:8 }}>{lockError}</div>}
        <div style={{ display:"flex", gap:8, marginTop:8 }}>
          <div onClick={() => { setShowLockModal(null); setLockPin(""); setLockError(""); }}
            style={{ flex:1, padding:"12px", background:"#2a3942", borderRadius:10, color:"#8696a0", fontWeight:700, cursor:"pointer" }}>Cancel</div>
          <div onClick={() => lockChat(showLockModal)}
            style={{ flex:1, padding:"12px", background:"#25D366", borderRadius:10, color:"#fff", fontWeight:700, cursor:"pointer" }}>Lock Chat</div>
        </div>
      </div>
    </div>
  );

  // UNLOCK MODAL
  if (showUnlockModal) return (
    <div style={{ position:"fixed", inset:0, background:"#111b21", zIndex:10000, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#202c33", borderRadius:20, padding:28, maxWidth:320, width:"90%", textAlign:"center" }}>
        <div style={{ fontSize:50, marginBottom:12 }}>🔐</div>
        <h3 style={{ color:"#e9edef", margin:"0 0 8px" }}>Chat is Locked</h3>
        <p style={{ color:"#8696a0", fontSize:13, marginBottom:16 }}>Enter PIN to unlock this chat</p>
        <input value={unlockPin} onChange={e => setUnlockPin(e.target.value.replace(/\D/g, ""))}
          placeholder="Enter PIN" type="password" maxLength={8}
          onKeyDown={e => e.key==="Enter" && unlockChat(showUnlockModal)}
          style={{ width:"100%", padding:"12px", background:"#2a3942", border:"none", borderRadius:10, color:"#e9edef", fontSize:18, outline:"none", textAlign:"center", letterSpacing:6, boxSizing:"border-box", marginBottom:8 }} />
        {lockError && <div style={{ color:"#ef4444", fontSize:13, marginBottom:8 }}>{lockError}</div>}
        <div style={{ display:"flex", gap:8, marginTop:8 }}>
          <div onClick={() => { setShowUnlockModal(null); setUnlockPin(""); setLockError(""); }}
            style={{ flex:1, padding:"12px", background:"#2a3942", borderRadius:10, color:"#8696a0", fontWeight:700, cursor:"pointer" }}>Cancel</div>
          <div onClick={() => unlockChat(showUnlockModal)}
            style={{ flex:1, padding:"12px", background:"#25D366", borderRadius:10, color:"#fff", fontWeight:700, cursor:"pointer" }}>Unlock</div>
        </div>
      </div>
    </div>
  );

  const filteredCalls = callHistory.filter(c => {
    if (callFilter === "missed") return c.status === "missed";
    if (callFilter === "incoming") return c.direction === "incoming";
    if (callFilter === "outgoing") return c.direction === "outgoing";
    return true;
  });

  const myStatuses = statuses.filter(s => s.uid === user.uid);
  const othersStatuses = statuses.filter(s => s.uid !== user.uid);

  const allContacts = Object.entries(contacts);
  const unlockedContacts = allContacts.filter(([chatId]) => !lockedChats[chatId] || unlockedChats.includes(chatId));
  const lockedContactsList = allContacts.filter(([chatId]) => lockedChats[chatId] && !unlockedChats.includes(chatId));

  const sortedContacts = unlockedContacts.sort(([aId], [bId]) => {
    const aPin = pinnedChats.includes(aId) ? 0 : 1;
    const bPin = pinnedChats.includes(bId) ? 0 : 1;
    return aPin - bPin;
  });

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:"'Segoe UI',sans-serif", background:"#111b21", color:"#e9edef", overflow:"hidden", position:"relative" }}>

      {/* Notifications */}
      <div style={{ position:"fixed", top:16, right:16, zIndex:9999, display:"flex", flexDirection:"column", gap:10 }}>
        {notifications.map(n => (
          <div key={n.id} onClick={() => { openChat(n.contact); setNotifications(p => p.filter(x => x.id !== n.id)); }}
            style={{ background:"#202c33", borderRadius:14, padding:"10px 16px", display:"flex", alignItems:"center", gap:12, boxShadow:"0 6px 24px rgba(0,0,0,0.5)", minWidth:260, borderLeft:`4px solid ${colorFromName(n.name)}`, cursor:"pointer" }}>
            <div style={{ width:36, height:36, borderRadius:"50%", background:colorFromName(n.name), display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:13, color:"#fff" }}>{getInitials(n.name)}</div>
            <div style={{ flex:1, overflow:"hidden" }}>
              <div style={{ fontWeight:700, fontSize:12, color:"#25D366" }}>{n.name}</div>
              <div style={{ fontSize:13, color:"#e9edef", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{n.text}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Image Preview */}
      {previewImg && (
        <div onClick={() => setPreviewImg(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", zIndex:9998, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <img src={previewImg} alt="p" style={{ maxWidth:"90vw", maxHeight:"90vh", borderRadius:12 }} />
          <div style={{ position:"absolute", top:20, right:24, fontSize:28, cursor:"pointer", color:"#fff" }}>✕</div>
        </div>
      )}

      {/* Status Viewer */}
      {viewingStatus && (
        <div onClick={() => setViewingStatus(null)} style={{ position:"fixed", inset:0, background:"#000", zIndex:10000, display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"16px 20px", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:"50%", background:colorFromName(viewingStatus.name), display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:"#fff" }}>
              {getInitials(viewingStatus.name)}
            </div>
            <div>
              <div style={{ fontWeight:700, color:"#fff" }}>{viewingStatus.name}</div>
              <div style={{ fontSize:12, color:"#aaa" }}>{timeAgo(viewingStatus.timestamp)}</div>
            </div>
            <span style={{ marginLeft:"auto", fontSize:24, color:"#fff" }}>✕</span>
          </div>
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
            {viewingStatus.image && <img src={viewingStatus.image} alt="status" style={{ maxWidth:"100%", maxHeight:"70vh", borderRadius:12 }} />}
            {viewingStatus.text && <p style={{ color:"#fff", fontSize:20, textAlign:"center", lineHeight:1.5 }}>{viewingStatus.text}</p>}
          </div>
        </div>
      )}

      {/* Call Screen */}
      {inCall && (
        <div style={{ position:"fixed", inset:0, background:"#0b141a", zIndex:9997, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20 }}>
          <div style={{ fontSize:20, color:"#e9edef", fontWeight:700 }}>{callType === "video" ? "📹 Video Call" : "📞 Audio Call"} — {activeChat?.name}</div>
          {callType === "video" && (
            <div style={{ display:"flex", gap:16, flexWrap:"wrap", justifyContent:"center" }}>
              <video ref={localVideoRef} autoPlay muted style={{ width:160, height:120, borderRadius:12, background:"#202c33", border:"2px solid #25D366" }} />
              <video ref={remoteVideoRef} autoPlay style={{ width:160, height:120, borderRadius:12, background:"#202c33", border:"2px solid #128C7E" }} />
            </div>
          )}
          {callType === "audio" && <div style={{ fontSize:80 }}>📞</div>}
          <div style={{ color:"#8696a0", fontSize:14 }}>Call in progress...</div>
          <div onClick={endCall} style={{ padding:"14px 32px", background:"#ef4444", borderRadius:50, color:"#fff", fontWeight:700, fontSize:16, cursor:"pointer" }}>📵 End Call</div>
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:9996, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:"#202c33", borderRadius:20, padding:28, maxWidth:340, width:"90%", textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🔗</div>
            <h3 style={{ color:"#e9edef", margin:"0 0 8px" }}>Invite a Friend</h3>
            <p style={{ color:"#8696a0", fontSize:13, marginBottom:16 }}>Copy this link and send it to your friend!</p>
            <div style={{ background:"#111b21", borderRadius:10, padding:"10px 14px", fontSize:12, color:"#25D366", wordBreak:"break-all", marginBottom:16 }}>{inviteLink}</div>
            <div onClick={copyLink} style={{ padding:"12px", background:copied?"#128C7E":"#25D366", borderRadius:10, color:"#fff", fontWeight:700, cursor:"pointer", marginBottom:10 }}>
              {copied ? "✅ Copied!" : "📋 Copy Link"}
            </div>
            <div onClick={() => setShowInvite(false)} style={{ padding:"10px", color:"#8696a0", cursor:"pointer" }}>Close</div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <div style={{ width:340, minWidth:340, display:"flex", flexDirection:"column", borderRight:"1px solid #1f2c33" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 16px", background:"#202c33", height:60 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {profilePic ? (
              <img src={profilePic} alt="profile" style={{ width:42, height:42, borderRadius:"50%", objectFit:"cover" }} />
            ) : (
              <div style={{ width:42, height:42, borderRadius:"50%", background:colorFromName(user?.displayName), display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:15, color:"#fff" }}>
                {getInitials(user?.displayName || user?.email)}
              </div>
            )}
            <div>
              <div style={{ fontWeight:800, fontSize:15 }}>Khan Chats</div>
              <div style={{ fontSize:11, color:"#25D366" }}>Online ✨</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:12 }}>
            <span onClick={generateInvite} style={{ cursor:"pointer", fontSize:20 }}>🔗</span>
            <span onClick={() => setShowNewChat(!showNewChat)} style={{ cursor:"pointer", fontSize:20 }}>✏️</span>
            <span onClick={() => setShowSettings(true)} style={{ cursor:"pointer", fontSize:20 }}>⚙️</span>
          </div>
        </div>

        <div style={{ display:"flex", background:"#202c33", borderBottom:"1px solid #1f2c33" }}>
          {[["chats","💬","Chats"],["status","🔵","Status"],["calls","📋","Calls"]].map(([view, icon, label]) => (
            <div key={view} onClick={() => setCurrentView(view)}
              style={{ flex:1, textAlign:"center", padding:"10px 4px", cursor:"pointer", fontSize:12, fontWeight:600,
                color: currentView===view ? "#25D366" : "#8696a0",
                borderBottom: currentView===view ? "2px solid #25D366" : "2px solid transparent" }}>
              {icon} {label}
            </div>
          ))}
        </div>

        {showNewChat && currentView === "chats" && (
          <div style={{ padding:"10px 12px", background:"#182229", borderBottom:"1px solid #1f2c33" }}>
            <input value={newChatEmail} onChange={e => setNewChatEmail(e.target.value)} placeholder="Enter friend's email..."
              style={{ width:"100%", padding:"10px 12px", background:"#2a3942", border:"none", borderRadius:10, color:"#e9edef", fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:6 }} />
            {newChatError && <div style={{ color:"#ef4444", fontSize:12, marginBottom:6 }}>{newChatError}</div>}
            <div style={{ display:"flex", gap:8 }}>
              <div onClick={startChat} style={{ flex:1, padding:"9px", background:"#25D366", borderRadius:10, textAlign:"center", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>Start Chat</div>
              <div onClick={() => { setShowNewChat(false); setNewChatError(""); }} style={{ padding:"9px 14px", background:"#2a3942", borderRadius:10, color:"#8696a0", cursor:"pointer" }}>✕</div>
            </div>
          </div>
        )}

        <div style={{ flex:1, overflowY:"auto" }}>
          {/* CHATS TAB */}
          {currentView === "chats" && (
            <div>
              {sortedContacts.length === 0 && lockedContactsList.length === 0 ? (
                <div style={{ padding:24, textAlign:"center", color:"#8696a0" }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>👥</div>
                  <div style={{ fontSize:14 }}>No contacts yet</div>
                  <div style={{ fontSize:12, marginTop:6 }}>Use ✏️ or 🔗 to get started</div>
                </div>
              ) : (
                <>
                  {sortedContacts.map(([chatId, contact]) => (
                    <div key={chatId} onClick={() => handleChatClick(contact)}
                      style={{ display:"flex", alignItems:"center", padding:"12px 16px", cursor:"pointer", gap:12, background:activeChat?.chatId===chatId?"#2a3942":"transparent", borderBottom:"1px solid #1a2530" }}
                      onMouseEnter={e => { if (activeChat?.chatId!==chatId) e.currentTarget.style.background="#182229"; }}
                      onMouseLeave={e => { if (activeChat?.chatId!==chatId) e.currentTarget.style.background="transparent"; }}
                    >
                      <div style={{ position:"relative", flexShrink:0 }}>
                        <div style={{ width:50, height:50, borderRadius:"50%", background:colorFromName(contact.name), display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:16, color:"#fff" }}>
                          {getInitials(contact.name)}
                        </div>
                        {pinnedChats.includes(chatId) && <div style={{ position:"absolute", top:-4, right:-4, fontSize:12 }}>📌</div>}
                      </div>
                      <div style={{ flex:1, overflow:"hidden" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                          <span style={{ fontWeight:700, fontSize:15 }}>{contact.name}</span>
                          <span style={{ fontSize:11, color:"#8696a0" }}>{formatTime(contact.lastTime)}</span>
                        </div>
                        <div style={{ fontSize:13, color:"#8696a0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{contact.lastMsg || contact.email}</div>
                      </div>
                    </div>
                  ))}

                  {/* Locked Chats Section */}
                  {lockedContactsList.length > 0 && (
                    <div>
                      <div onClick={() => setShowLockedSection(!showLockedSection)}
                        style={{ display:"flex", alignItems:"center", padding:"10px 16px", cursor:"pointer", background:"#182229", borderBottom:"1px solid #1a2530", gap:8 }}>
                        <span style={{ fontSize:16 }}>🔒</span>
                        <span style={{ fontWeight:600, fontSize:14, color:"#8696a0", flex:1 }}>Locked Chats ({lockedContactsList.length})</span>
                        <span style={{ color:"#8696a0", fontSize:12 }}>{showLockedSection ? "▲" : "▼"}</span>
                      </div>
                      {showLockedSection && lockedContactsList.map(([chatId, contact]) => (
                        <div key={chatId} onClick={() => handleChatClick(contact)}
                          style={{ display:"flex", alignItems:"center", padding:"12px 16px", cursor:"pointer", gap:12, background:"#0d1418", borderBottom:"1px solid #1a2530" }}>
                          <div style={{ width:50, height:50, borderRadius:"50%", background:"#374045", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🔒</div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontWeight:700, fontSize:15, color:"#8696a0" }}>••••••••</div>
                            <div style={{ fontSize:13, color:"#8696a0" }}>Tap to unlock</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* STATUS TAB */}
          {currentView === "status" && (
            <div>
              <div style={{ padding:"10px 12px", borderBottom:"1px solid #1f2c33" }}>
                <div onClick={() => setShowAddStatus(!showAddStatus)}
                  style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 4px", cursor:"pointer" }}>
                  <div style={{ width:50, height:50, borderRadius:"50%", background:colorFromName(user?.displayName), display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:16, color:"#fff", border: myStatuses.length > 0 ? "3px solid #25D366" : "3px dashed #8696a0", flexShrink:0 }}>
                    {getInitials(user?.displayName)}
                  </div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:15 }}>My Status</div>
                    <div style={{ fontSize:13, color:"#8696a0" }}>{myStatuses.length > 0 ? timeAgo(myStatuses[0].timestamp) : "Tap to add status update"}</div>
                  </div>
                </div>
                {showAddStatus && (
                  <div style={{ marginTop:8 }}>
                    <input value={statusText} onChange={e => setStatusText(e.target.value)} placeholder="Type a status..."
                      style={{ width:"100%", padding:"10px 12px", background:"#2a3942", border:"none", borderRadius:10, color:"#e9edef", fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:8 }} />
                    <div style={{ display:"flex", gap:8 }}>
                      <div onClick={() => postStatus()} style={{ flex:1, padding:"9px", background:"#25D366", borderRadius:10, textAlign:"center", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>📝 Post</div>
                      <div onClick={() => statusFileRef.current?.click()} style={{ padding:"9px 14px", background:"#2a3942", borderRadius:10, color:"#e9edef", cursor:"pointer" }}>📷</div>
                      <div onClick={() => setShowAddStatus(false)} style={{ padding:"9px 14px", background:"#2a3942", borderRadius:10, color:"#8696a0", cursor:"pointer" }}>✕</div>
                    </div>
                    <input type="file" accept="image/*" ref={statusFileRef} onChange={handleStatusImage} style={{ display:"none" }} />
                  </div>
                )}
              </div>
              {othersStatuses.length > 0 && <div style={{ padding:"6px 16px 4px", fontSize:11, color:"#8696a0", fontWeight:600, textTransform:"uppercase" }}>Recent Updates</div>}
              {othersStatuses.map((s, i) => (
                <div key={i} onClick={() => setViewingStatus(s)}
                  style={{ display:"flex", alignItems:"center", padding:"12px 16px", gap:12, cursor:"pointer", borderBottom:"1px solid #1a2530" }}>
                  <div style={{ width:50, height:50, borderRadius:"50%", background:colorFromName(s.name), display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:16, color:"#fff", border:"3px solid #25D366", flexShrink:0 }}>
                    {getInitials(s.name)}
                  </div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:15 }}>{s.name}</div>
                    <div style={{ fontSize:13, color:"#8696a0" }}>{timeAgo(s.timestamp)}</div>
                  </div>
                </div>
              ))}
              {statuses.length === 0 && (
                <div style={{ textAlign:"center", marginTop:60, color:"#8696a0" }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>📸</div>
                  <div>No status updates yet</div>
                </div>
              )}
            </div>
          )}

          {/* CALLS TAB */}
          {currentView === "calls" && (
            <div>
              <div style={{ display:"flex", padding:"0 12px", gap:4, background:"#202c33", borderBottom:"1px solid #1f2c33" }}>
                {["all","missed","incoming","outgoing"].map(f => (
                  <div key={f} onClick={() => setCallFilter(f)}
                    style={{ padding:"8px 10px", cursor:"pointer", fontSize:12, fontWeight:600,
                      color: callFilter===f ? "#25D366" : "#8696a0",
                      borderBottom: callFilter===f ? "2px solid #25D366" : "2px solid transparent",
                      textTransform:"capitalize" }}>
                    {f === "missed" ? "📵" : f === "incoming" ? "📞" : f === "outgoing" ? "📲" : "All"}
                  </div>
                ))}
              </div>
              {filteredCalls.length === 0 ? (
                <div style={{ textAlign:"center", marginTop:60, color:"#8696a0" }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>📋</div>
                  <div>No calls yet</div>
                </div>
              ) : filteredCalls.map((call, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", padding:"12px 16px", gap:12, borderBottom:"1px solid #1a2530" }}>
                  <div style={{ width:48, height:48, borderRadius:"50%", background:colorFromName(call.name), display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:15, color:"#fff", flexShrink:0 }}>
                    {getInitials(call.name)}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:15 }}>{call.name}</div>
                    <div style={{ fontSize:12, color: call.status==="missed"?"#ef4444":call.direction==="incoming"?"#25D366":"#34B7F1" }}>
                      {call.status==="missed"?"📵 Missed":call.direction==="incoming"?`📞 Incoming ${call.type}`:`📲 Outgoing ${call.type}`}
                    </div>
                    <div style={{ fontSize:11, color:"#8696a0" }}>{formatCallTime(call.timestamp)}</div>
                  </div>
                  {call.duration > 0 && <div style={{ fontSize:11, color:"#8696a0" }}>⏱️ {formatDuration(call.duration)}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CHAT PANEL */}
      {activeChat ? (
        <div style={{ flex:1, display:"flex", flexDirection:"column", background:"#0b141a" }}>
          <div style={{ display:"flex", alignItems:"center", padding:"10px 18px", background:"#202c33", gap:13, height:60 }}>
            <div style={{ width:42, height:42, borderRadius:"50%", background:colorFromName(activeChat.name), display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:15, color:"#fff" }}>
              {getInitials(activeChat.name)}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:16 }}>{activeChat.name}</div>
              <div style={{ fontSize:12, color:"#25D366" }}>{activeChat.email}</div>
            </div>
            <div style={{ display:"flex", gap:16, fontSize:22 }}>
              <span onClick={() => startCall("audio")} style={{ cursor:"pointer" }}>📞</span>
              <span onClick={() => startCall("video")} style={{ cursor:"pointer" }}>📹</span>
            </div>
          </div>

          <div style={{ flex:1, overflowY:"auto", padding:"14px 6%" }}>
            {messages.length === 0 && (
              <div style={{ textAlign:"center", marginTop:60, color:"#8696a0" }}>
                <div style={{ fontSize:48, marginBottom:12 }}>👋</div>
                <div>Say hello to {activeChat.name}!</div>
              </div>
            )}
            {messages.map((msg, i) => {
              const isMine = msg.senderUid === user.uid;
              return (
                <div key={i} style={{ display:"flex", justifyContent:isMine?"flex-end":"flex-start", marginBottom:5 }}>
                  <div style={{ maxWidth:"68%", padding:msg.image?"5px":"8px 13px 6px", background:isMine?"#005c4b":"#202c33", borderRadius:isMine?"14px 14px 3px 14px":"14px 14px 14px 3px", boxShadow:"0 1px 3px rgba(0,0,0,0.35)" }}>
                    {!isMine && <div style={{ fontSize:11, color:"#25D366", fontWeight:600, marginBottom:3 }}>{msg.senderName}</div>}
                    {msg.image && <img src={msg.image} alt="s" onClick={() => setPreviewImg(msg.image)} style={{ maxWidth:220, maxHeight:220, borderRadius:9, display:"block", cursor:"zoom-in" }} />}
                    {msg.text && <p style={{ margin:msg.image?"5px 6px 0":0, fontSize:15, lineHeight:1.5, color:"#e9edef", wordBreak:"break-word", whiteSpace:"pre-wrap" }}>{msg.text}</p>}
                    <div style={{ display:"flex", justifyContent:"flex-end", gap:3, marginTop:3 }}>
                      <span style={{ fontSize:11, color:"#8696a0" }}>{formatTime(msg.timestamp)}</span>
                      {isMine && <span style={{ fontSize:13, color:"#53bdeb" }}>✓✓</span>}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 12px", background:"#202c33" }}>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImage} style={{ display:"none" }} />
            <div style={{ display:"flex", alignItems:"center", background:"#2a3942", borderRadius:26, flex:1, padding:"9px 14px", gap:10 }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter" && !e.shiftKey && sendMessage()} placeholder="Type a message..."
                style={{ flex:1, background:"none", border:"none", outline:"none", color:"#e9edef", fontSize:15 }} />
              <span onClick={() => fileInputRef.current?.click()} style={{ fontSize:19, cursor:"pointer", color:"#8696a0" }}>📷</span>
            </div>
            <div onClick={() => sendMessage()} style={{ width:48, height:48, borderRadius:"50%", background:input.trim()?"#25D366":"#2a3942", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:20 }}>
              {input.trim() ? "➤" : "🎤"}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#0b141a", gap:18, padding:24 }}>
          <div style={{ fontSize:80 }}>💬</div>
          <h2 style={{ color:"#e9edef", fontWeight:800, fontSize:28, margin:0 }}>Khan Chats</h2>
          <p style={{ color:"#8696a0", fontSize:14, textAlign:"center", maxWidth:320, lineHeight:1.7, margin:0 }}>
            Chat, audio and video call with your friends!
          </p>
          <div onClick={generateInvite} style={{ padding:"12px 24px", background:"#25D366", borderRadius:20, color:"#fff", fontWeight:700, cursor:"pointer" }}>
            🔗 Invite a Friend
          </div>
        </div>
      )}
      <div style={{ textAlign:"center", padding:"8px", background:"#0b141a", color:"#8696a0", fontSize:12 }}>
        Made with ❤️ by <span style={{ color:"#25D366", fontWeight:700 }}>Hamza Khan</span>
      </div>
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateX(50px); } to { opacity:1; transform:translateX(0); } }
        ::-webkit-scrollbar { width:5px; } ::-webkit-scrollbar-thumb { background:#2a3942; border-radius:4px; }
        input::placeholder { color:#8696a0; }
      `}</style>
    </div>
  );
}
