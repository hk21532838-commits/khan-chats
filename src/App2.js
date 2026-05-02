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

const T = {
  bg: "#0F172A", card: "#1E293B", card2: "#243147",
  blue: "#3B82F6", purple: "#7C3AED", text: "#E2E8F0",
  muted: "#64748B", border: "#2D3F55",
  grad: "linear-gradient(135deg, #3B82F6, #7C3AED)",
  gradR: "linear-gradient(135deg, #7C3AED, #3B82F6)",
  sent: "linear-gradient(135deg, #1D4ED8, #5B21B6)",
};

const LANGUAGES = ["English","Urdu","Arabic","Hindi","Spanish","French","German","Chinese","Japanese","Korean","Portuguese","Russian","Turkish","Italian","Dutch","Polish","Swedish","Norwegian","Danish","Finnish","Greek","Hebrew","Persian","Bengali","Punjabi","Sindhi","Pashto","Swahili","Malay","Indonesian","Thai","Vietnamese","Romanian","Hungarian","Czech","Slovak","Bulgarian","Croatian","Serbian","Ukrainian","Catalan","Slovenian","Lithuanian","Latvian","Estonian","Albanian","Macedonian","Bosnian","Azerbaijani","Georgian","Armenian","Kazakh","Uzbek","Turkmen","Kyrgyz","Tajik","Mongolian","Tibetan","Nepali","Sinhala","Burmese","Khmer","Lao","Amharic","Somali","Yoruba","Igbo","Hausa","Zulu","Xhosa","Afrikaans","Malagasy","Sesotho","Shona","Maltese","Icelandic","Welsh","Irish","Scottish Gaelic","Basque","Galician","Belarusian","Moldovan","Luxembourgish","Faroese","Breton","Occitan","Corsican","Sardinian","Sicilian","Neapolitan","Venetian","Lombard","Piedmontese","Ligurian","Friulian","Romansh","Aragonese","Asturian","Mirandese","Fula","Wolof","Bambara","Moore","Lingala","Kinyarwanda","Kirundi","Luganda","Chichewa","Tswana","Sotho","Tsonga"];

function formatTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}
function colorFromName(name) {
  const colors = ["#3B82F6","#7C3AED","#0EA5E9","#8B5CF6","#6366F1","#2563EB","#4F46E5","#7E22CE"];
  if (!name) return colors[0];
  let sum = 0; for (let c of name) sum += c.charCodeAt(0);
  return colors[sum % colors.length];
}
function getChatId(uid1, uid2) { return [uid1, uid2].sort().join("_"); }
function timeAgo(ts) {
  const diff = Date.now() - ts, mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return "Expired";
}
function formatDuration(s) {
  if (!s) return "0:00";
  return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`;
}
function formatCallTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleString("en-US", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" });
}

const Btn = ({ children, onClick, style={}, variant="primary" }) => (
  <div onClick={onClick} style={{
    padding:"12px 20px", borderRadius:12, cursor:"pointer", fontWeight:700,
    fontSize:14, textAlign:"center", color:"#fff", userSelect:"none",
    background: variant==="danger" ? "#EF4444" : variant==="ghost" ? T.card2 : T.grad,
    ...style
  }}>{children}</div>
);

const Avatar = ({ name, pic, size=44, showRing=false }) => (
  <div style={{ position:"relative", flexShrink:0 }}>
    {pic ? (
      <img src={pic} alt="av" style={{ width:size, height:size, borderRadius:"50%", objectFit:"cover", border: showRing ? `2px solid ${T.blue}` : "none" }} />
    ) : (
      <div style={{ width:size, height:size, borderRadius:"50%", background:T.grad, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:size*0.32, color:"#fff", border: showRing ? `2px solid ${T.blue}` : "none" }}>
        {getInitials(name)}
      </div>
    )}
  </div>
);

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
  const [currentView, setCurrentView] = useState("messages");
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
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u); setScreen("chat"); setNewName(u.displayName || "");
        await set(ref(db,`users/${u.uid}`), { uid:u.uid, name:u.displayName||u.email.split("@")[0], email:u.email, online:true, lastSeen:serverTimestamp() });
        loadContacts(u); loadStatuses(); loadCallHistory(u); loadPins(u); loadProfilePic(u); loadLockedChats(u);
      } else { setUser(null); setScreen("login"); }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const loadContacts = (u) => {
    onValue(ref(db,`userChats/${u.uid}`), async (snap) => {
      const data = snap.val()||{}, map = {};
      for (const chatId of Object.keys(data)) {
        const s = await get(ref(db,`users/${data[chatId].with}`));
        if (s.exists()) map[chatId] = { ...s.val(), chatId, lastMsg:data[chatId].lastMsg||"", lastTime:data[chatId].lastTime||0 };
      }
      setContacts(map);
    });
  };
  const loadStatuses = () => {
    onValue(ref(db,"statuses"), (snap) => {
      const arr = Object.values(snap.val()||{}).filter(s=>Date.now()-s.timestamp<86400000).sort((a,b)=>b.timestamp-a.timestamp);
      setStatuses(arr);
    });
  };
  const loadCallHistory = (u) => {
    onValue(ref(db,`callHistory/${u.uid}`), (snap) => {
      setCallHistory(Object.values(snap.val()||{}).sort((a,b)=>b.timestamp-a.timestamp));
    });
  };
  const loadPins = (u) => { onValue(ref(db,`pins/${u.uid}`), (snap) => { setPinnedChats(snap.val()||[]); }); };
  const loadProfilePic = (u) => { onValue(ref(db,`profilePics/${u.uid}`), (snap) => { if (snap.val()) setProfilePic(snap.val()); }); };
  const loadLockedChats = (u) => { onValue(ref(db,`lockedChats/${u.uid}`), (snap) => { setLockedChats(snap.val()||{}); }); };
  const saveCall = (u, d) => { push(ref(db,`callHistory/${u.uid}`), {...d, timestamp:Date.now()}); };
  const togglePin = async (chatId) => {
    const p = pinnedChats.includes(chatId) ? pinnedChats.filter(x=>x!==chatId) : [...pinnedChats,chatId];
    await set(ref(db,`pins/${user.uid}`), p);
  };
  const saveProfilePic = async (img) => { await set(ref(db,`profilePics/${user.uid}`),img); setProfilePic(img); };
  const saveName = async () => {
    if (!newName.trim()) return;
    await updateProfile(auth.currentUser, {displayName:newName.trim()});
    await set(ref(db,`users/${user.uid}/name`), newName.trim());
    setUser({...user, displayName:newName.trim()}); alert("Name updated! ✅");
  };
  const handleProfilePic = (e) => {
    const f = e.target.files[0]; if (!f) return;
    if (f.size>500000) { alert("Max 500KB"); return; }
    const r = new FileReader(); r.onload = ev => saveProfilePic(ev.target.result); r.readAsDataURL(f); e.target.value="";
  };
  const lockChat = async (chatId) => {
    if (lockPin.length<4) { setLockError("PIN must be 4+ digits"); return; }
    await set(ref(db,`lockedChats/${user.uid}`), {...lockedChats,[chatId]:lockPin});
    setLockPin(""); setShowLockModal(null); setLockError(""); alert("Chat locked! 🔒");
  };
  const unlockChat = (chatId) => {
    if (unlockPin===lockedChats[chatId]) { setUnlockedChats(p=>[...p,chatId]); setUnlockPin(""); setShowUnlockModal(null); setLockError(""); }
    else setLockError("Wrong PIN!");
  };
  const removeLock = async (chatId) => {
    const n={...lockedChats}; delete n[chatId];
    await set(ref(db,`lockedChats/${user.uid}`),n);
    setUnlockedChats(p=>p.filter(id=>id!==chatId));
  };
  const handleChatClick = (contact) => {
    const {chatId} = contact;
    if (lockedChats[chatId]&&!unlockedChats.includes(chatId)) { setShowUnlockModal(chatId); setUnlockPin(""); setLockError(""); }
    else openChat(contact);
  };
  const askKhanAI = async () => {
    if (!aiInput.trim()) return;
    const uMsg = {role:"user",text:aiInput.trim()};
    setAiMessages(p=>[...p,uMsg]); setAiInput(""); setAiLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000,
          system:"You are Khan AI, a friendly assistant for Khan Chats app made by Hamza Khan. Be helpful and concise.",
          messages:[...aiMessages.map(m=>({role:m.role,content:m.text})),{role:"user",content:aiInput.trim()}] })
      });
      const data = await res.json();
      setAiMessages(p=>[...p,{role:"assistant",text:data.content?.[0]?.text||"Sorry, try again."}]);
    } catch { setAiMessages(p=>[...p,{role:"assistant",text:"Connection error."}]); }
    setAiLoading(false);
  };
  const register = async () => {
    if (!displayName.trim()) { setAuthError("Enter your name"); return; }
    setAuthLoading(true); setAuthError("");
    try { const c = await createUserWithEmailAndPassword(auth,email,password); await updateProfile(c.user,{displayName:displayName.trim()}); }
    catch (e) { setAuthError(e.message.includes("email-already")?"Email already registered":e.message.includes("weak")?"Password 6+ chars":"Something went wrong"); }
    setAuthLoading(false);
  };
  const login = async () => {
    setAuthLoading(true); setAuthError("");
    try { await signInWithEmailAndPassword(auth,email,password); }
    catch { setAuthError("Incorrect email or password"); }
    setAuthLoading(false);
  };
  const logout = async () => {
    if (user) await set(ref(db,`users/${user.uid}/online`),false);
    await signOut(auth); setActiveChat(null); setMessages([]); setContacts({});
  };
  const startChat = async () => {
    setNewChatError("");
    if (!newChatEmail.trim()) { setNewChatError("Enter an email"); return; }
    if (newChatEmail.trim()===user.email) { setNewChatError("Can't message yourself!"); return; }
    const snap = await get(ref(db,"users"));
    const found = Object.values(snap.val()||{}).find(u=>u.email===newChatEmail.trim());
    if (!found) { setNewChatError("User not found. Invite them first!"); return; }
    const chatId = getChatId(user.uid,found.uid);
    await set(ref(db,`userChats/${user.uid}/${chatId}`),{with:found.uid,lastMsg:"",lastTime:serverTimestamp()});
    await set(ref(db,`userChats/${found.uid}/${chatId}`),{with:user.uid,lastMsg:"",lastTime:serverTimestamp()});
    setNewChatEmail(""); setShowNewChat(false); openChat({...found,chatId});
  };
  const openChat = (contact) => {
    setActiveChat(contact);
    off(ref(db,`chats/${contact.chatId}/messages`));
    onValue(ref(db,`chats/${contact.chatId}/messages`), (snap) => {
      setMessages(Object.values(snap.val()||{}).sort((a,b)=>a.timestamp-b.timestamp));
    });
  };
  const sendMessage = async (imgData=null) => {
    if (!activeChat||(!input.trim()&&!imgData)) return;
    const msg = {text:imgData?"":input.trim(), image:imgData||null, senderUid:user.uid, senderName:user.displayName||user.email, timestamp:Date.now()};
    await push(ref(db,`chats/${activeChat.chatId}/messages`),msg);
    const last = imgData?"📷 Photo":input.trim();
    await set(ref(db,`userChats/${user.uid}/${activeChat.chatId}/lastMsg`),last);
    await set(ref(db,`userChats/${activeChat.uid}/${activeChat.chatId}/lastMsg`),last);
    await set(ref(db,`userChats/${user.uid}/${activeChat.chatId}/lastTime`),serverTimestamp());
    await set(ref(db,`userChats/${activeChat.uid}/${activeChat.chatId}/lastTime`),serverTimestamp());
    setInput("");
  };
  const handleImage = (e) => {
    const f=e.target.files[0]; if(!f) return;
    if(f.size>500000){alert("Max 500KB");return;}
    const r=new FileReader(); r.onload=ev=>sendMessage(ev.target.result); r.readAsDataURL(f); e.target.value="";
  };
  const postStatus = async (imgData=null) => {
    if (!statusText.trim()&&!imgData) return;
    await push(ref(db,"statuses"),{uid:user.uid,name:user.displayName||user.email,text:statusText.trim(),image:imgData||null,timestamp:Date.now()});
    setStatusText(""); setShowAddStatus(false);
  };
  const handleStatusImage = (e) => {
    const f=e.target.files[0]; if(!f) return;
    if(f.size>500000){alert("Max 500KB");return;}
    const r=new FileReader(); r.onload=ev=>postStatus(ev.target.result); r.readAsDataURL(f); e.target.value="";
  };
  const generateInvite = () => { const l=`${window.location.origin}?invite=${btoa(user.email)}`; setInviteLink(l); setShowInvite(true); };
  const copyLink = () => { navigator.clipboard.writeText(inviteLink).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);}); };
  const startCall = async (type) => {
    if (!activeChat) return;
    setCallType(type); setInCall(true); setCallStartTime(Date.now());
    try {
      const stream = await navigator.mediaDevices.getUserMedia({video:type==="video",audio:true});
      localStreamRef.current=stream;
      if(localVideoRef.current) localVideoRef.current.srcObject=stream;
      const pc=new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"}]});
      pcRef.current=pc;
      stream.getTracks().forEach(t=>pc.addTrack(t,stream));
      pc.ontrack=(e)=>{if(remoteVideoRef.current)remoteVideoRef.current.srcObject=e.streams[0]};
      const offer=await pc.createOffer(); await pc.setLocalDescription(offer);
      await set(ref(db,`calls/${activeChat.chatId}`),{offer:JSON.stringify(offer),caller:user.uid,callerName:user.displayName,type,timestamp:Date.now()});
      onValue(ref(db,`calls/${activeChat.chatId}/answer`),async(snap)=>{if(snap.val()&&pc.signalingState!=="stable")await pc.setRemoteDescription(JSON.parse(snap.val()))});
      pc.onicecandidate=(e)=>{if(e.candidate)push(ref(db,`calls/${activeChat.chatId}/callerCandidates`),JSON.stringify(e.candidate))};
      saveCall(user,{name:activeChat.name,type,direction:"outgoing",status:"completed",duration:0});
    } catch(err) { alert("Camera/Mic denied: "+err.message); setInCall(false); }
  };
  const endCall = () => {
    if(localStreamRef.current)localStreamRef.current.getTracks().forEach(t=>t.stop());
    if(pcRef.current)pcRef.current.close();
    set(ref(db,`calls/${activeChat?.chatId}`),null);
    setInCall(false); setCallType(null); setCallStartTime(null);
  };
  useEffect(()=>{
    if(!user||!activeChat) return;
    onValue(ref(db,`calls/${activeChat.chatId}`),async(snap)=>{
      const data=snap.val();
      if(data&&data.caller!==user.uid&&data.offer&&!inCall){
        if(window.confirm(`Incoming ${data.type==="video"?"Video":"Audio"} call from ${data.callerName}! Answer?`)){
          setCallType(data.type); setInCall(true); setCallStartTime(Date.now());
          try{
            const stream=await navigator.mediaDevices.getUserMedia({video:data.type==="video",audio:true});
            localStreamRef.current=stream;
            if(localVideoRef.current)localVideoRef.current.srcObject=stream;
            const pc=new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"}]});
            pcRef.current=pc;
            stream.getTracks().forEach(t=>pc.addTrack(t,stream));
            pc.ontrack=(e)=>{if(remoteVideoRef.current)remoteVideoRef.current.srcObject=e.streams[0]};
            await pc.setRemoteDescription(JSON.parse(data.offer));
            const ans=await pc.createAnswer(); await pc.setLocalDescription(ans);
            await set(ref(db,`calls/${activeChat.chatId}/answer`),JSON.stringify(ans));
            pc.onicecandidate=(e)=>{if(e.candidate)push(ref(db,`calls/${activeChat.chatId}/calleeCandidates`),JSON.stringify(e.candidate))};
            saveCall(user,{name:data.callerName,type:data.type,direction:"incoming",status:"completed",duration:0});
          } catch(err){alert("Call failed: "+err.message);setInCall(false);}
        } else { saveCall(user,{name:data.callerName,type:data.type,direction:"incoming",status:"missed",duration:0}); }
      }
    });
  },[user,activeChat]);

  if(loading) return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:T.bg,flexDirection:"column",gap:20}}>
      <div style={{width:72,height:72,borderRadius:20,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,boxShadow:"0 8px 32px rgba(59,130,246,0.4)"}}>💬</div>
      <div style={{color:T.text,fontSize:22,fontWeight:800,letterSpacing:1}}>Khan Chats</div>
      <div style={{color:T.muted,fontSize:14}}>Loading...</div>
    </div>
  );

  if(screen==="login"||screen==="register") return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:T.bg,fontFamily:"'Segoe UI',sans-serif"}}>
      <div style={{width:"100%",maxWidth:400,padding:"0 24px"}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{width:80,height:80,borderRadius:24,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:38,margin:"0 auto 16px",boxShadow:"0 8px 32px rgba(59,130,246,0.4)"}}>💬</div>
          <h1 style={{color:T.text,fontWeight:900,fontSize:30,margin:0,letterSpacing:0.5}}>Khan Chats</h1>
          <p style={{color:T.muted,fontSize:14,margin:"8px 0 0"}}>Premium Messaging Experience</p>
        </div>
        <div style={{display:"flex",background:T.card,borderRadius:16,padding:4,marginBottom:28}}>
          {["login","register"].map(s=>(
            <div key={s} onClick={()=>{setScreen(s);setAuthError("");}}
              style={{flex:1,textAlign:"center",padding:"12px",borderRadius:13,cursor:"pointer",fontWeight:700,fontSize:14,
                background:screen===s?T.grad:"transparent",color:screen===s?"#fff":T.muted,transition:"all 0.2s"}}>
              {s==="login"?"Sign In":"Sign Up"}
            </div>
          ))}
        </div>
        {screen==="register"&&(
          <input value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Full name"
            style={{width:"100%",padding:"14px 18px",background:T.card,border:`1px solid ${T.border}`,borderRadius:14,color:T.text,fontSize:15,outline:"none",marginBottom:12,boxSizing:"border-box"}} />
        )}
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email"
          style={{width:"100%",padding:"14px 18px",background:T.card,border:`1px solid ${T.border}`,borderRadius:14,color:T.text,fontSize:15,outline:"none",marginBottom:12,boxSizing:"border-box"}} />
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password"
          onKeyDown={e=>e.key==="Enter"&&(screen==="login"?login():register())}
          style={{width:"100%",padding:"14px 18px",background:T.card,border:`1px solid ${T.border}`,borderRadius:14,color:T.text,fontSize:15,outline:"none",marginBottom:16,boxSizing:"border-box"}} />
        {authError&&<div style={{color:"#EF4444",fontSize:13,marginBottom:12,textAlign:"center",padding:"8px",background:"rgba(239,68,68,0.1)",borderRadius:8}}>{authError}</div>}
        <div onClick={screen==="login"?login:register}
          style={{width:"100%",padding:"15px",background:authLoading?"#374151":T.grad,borderRadius:14,textAlign:"center",color:"#fff",fontWeight:800,fontSize:16,cursor:"pointer",boxSizing:"border-box",boxShadow:"0 4px 20px rgba(59,130,246,0.3)"}}>
          {authLoading?"Please wait...":(screen==="login"?"Sign In →":"Create Account →")}
        </div>
        <p style={{color:T.muted,fontSize:11,textAlign:"center",marginTop:20,lineHeight:1.6}}>
          Independent Messaging Platform.<br/>Not affiliated with WhatsApp or Meta.
        </p>
      </div>
    </div>
  );

  // SETTINGS
  if(showSettings) return(
    <div style={{position:"fixed",inset:0,background:T.bg,zIndex:9999,display:"flex",flexDirection:"column",fontFamily:"'Segoe UI',sans-serif",color:T.text}}>
      <div style={{display:"flex",alignItems:"center",padding:"16px 20px",background:T.card,gap:14,borderBottom:`1px solid ${T.border}`}}>
        <div onClick={()=>setShowSettings(false)} style={{width:36,height:36,borderRadius:10,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:18}}>←</div>
        <div style={{fontWeight:800,fontSize:20,flex:1}}>Settings</div>
      </div>
      <div style={{display:"flex",background:T.card,borderBottom:`1px solid ${T.border}`,overflowX:"auto",padding:"0 8px"}}>
        {[["profile","👤","Profile"],["language","🌐","Language"],["pins","📌","Pins"],["locks","🔒","Locks"],["ai","🤖","Khan AI"]].map(([tab,icon,label])=>(
          <div key={tab} onClick={()=>setSettingsTab(tab)}
            style={{padding:"12px 16px",cursor:"pointer",fontSize:12,fontWeight:700,whiteSpace:"nowrap",
              color:settingsTab===tab?T.blue:T.muted,
              borderBottom:settingsTab===tab?`2px solid ${T.blue}`:"2px solid transparent"}}>
            {icon} {label}
          </div>
        ))}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:20}}>

        {settingsTab==="profile"&&(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{background:T.grad,borderRadius:20,padding:24,textAlign:"center",position:"relative"}}>
              <div style={{position:"relative",display:"inline-block",marginBottom:12}}>
                {profilePic?(
                  <img src={profilePic} alt="p" style={{width:90,height:90,borderRadius:"50%",objectFit:"cover",border:"3px solid #fff"}} />
                ):(
                  <div style={{width:90,height:90,borderRadius:"50%",background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:32,color:"#fff",border:"3px solid rgba(255,255,255,0.4)",margin:"0 auto"}}>
                    {getInitials(user?.displayName)}
                  </div>
                )}
                <div onClick={()=>profilePicRef.current?.click()} style={{position:"absolute",bottom:2,right:2,background:"#fff",borderRadius:"50%",width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14}}>📷</div>
              </div>
              <div style={{color:"#fff",fontWeight:800,fontSize:18}}>{user?.displayName}</div>
              <div style={{color:"rgba(255,255,255,0.7)",fontSize:13}}>{user?.email}</div>
              <input type="file" accept="image/*" ref={profilePicRef} onChange={handleProfilePic} style={{display:"none"}} />
            </div>
            <div style={{background:T.card,borderRadius:16,padding:20}}>
              <div style={{fontSize:12,color:T.blue,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>Display Name</div>
              <input value={newName} onChange={e=>setNewName(e.target.value)}
                style={{width:"100%",padding:"12px 14px",background:T.card2,border:`1px solid ${T.border}`,borderRadius:12,color:T.text,fontSize:15,outline:"none",boxSizing:"border-box",marginBottom:12}} />
              <Btn onClick={saveName}>Save Name ✓</Btn>
            </div>
            <Btn onClick={logout} variant="danger">Sign Out</Btn>
          </div>
        )}

        {settingsTab==="language"&&(
          <div>
            <div style={{background:T.card,borderRadius:16,padding:16,marginBottom:12}}>
              <div style={{fontSize:12,color:T.blue,fontWeight:700,marginBottom:8}}>SELECTED: {selectedLanguage}</div>
              <input value={langSearch} onChange={e=>setLangSearch(e.target.value)} placeholder="Search..."
                style={{width:"100%",padding:"10px 14px",background:T.card2,border:`1px solid ${T.border}`,borderRadius:12,color:T.text,fontSize:14,outline:"none",boxSizing:"border-box"}} />
            </div>
            {LANGUAGES.filter(l=>l.toLowerCase().includes(langSearch.toLowerCase())).map(lang=>(
              <div key={lang} onClick={()=>{setSelectedLanguage(lang);setLangSearch("");}}
                style={{padding:"13px 16px",background:selectedLanguage===lang?T.card2:T.card,borderRadius:12,cursor:"pointer",display:"flex",justifyContent:"space-between",marginBottom:6,border:`1px solid ${selectedLanguage===lang?T.blue:T.border}`}}>
                <span style={{color:T.text,fontSize:14}}>{lang}</span>
                {selectedLanguage===lang&&<span style={{color:T.blue,fontWeight:700}}>✓</span>}
              </div>
            ))}
          </div>
        )}

        {settingsTab==="pins"&&(
          <div>
            <div style={{color:T.muted,fontSize:13,marginBottom:16,padding:"10px 14px",background:T.card,borderRadius:12}}>📌 Pinned contacts appear at the top of Messages</div>
            {Object.entries(contacts).length===0?(
              <div style={{textAlign:"center",color:T.muted,marginTop:60}}>
                <div style={{fontSize:48}}>📌</div><div style={{marginTop:8}}>No contacts yet</div>
              </div>
            ):Object.entries(contacts).map(([chatId,contact])=>(
              <div key={chatId} style={{display:"flex",alignItems:"center",padding:"14px 16px",background:T.card,borderRadius:16,marginBottom:10,gap:12,border:`1px solid ${T.border}`}}>
                <Avatar name={contact.name} size={46} />
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:15,color:T.text}}>{contact.name}</div>
                  <div style={{fontSize:12,color:T.muted}}>{contact.email}</div>
                </div>
                <div onClick={()=>togglePin(chatId)} style={{padding:"8px 16px",background:pinnedChats.includes(chatId)?T.grad:T.card2,borderRadius:20,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                  {pinnedChats.includes(chatId)?"📌 Pinned":"Pin"}
                </div>
              </div>
            ))}
          </div>
        )}

        {settingsTab==="locks"&&(
          <div>
            <div style={{color:T.muted,fontSize:13,marginBottom:16,padding:"10px 14px",background:T.card,borderRadius:12}}>🔒 Lock chats with PIN. Locked chats are hidden and require PIN to access.</div>
            {Object.entries(contacts).map(([chatId,contact])=>(
              <div key={chatId} style={{display:"flex",alignItems:"center",padding:"14px 16px",background:T.card,borderRadius:16,marginBottom:10,gap:12,border:`1px solid ${T.border}`}}>
                <Avatar name={contact.name} size={46} />
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:15,color:T.text}}>{contact.name}</div>
                  <div style={{fontSize:12,color:lockedChats[chatId]?"#EF4444":T.muted}}>{lockedChats[chatId]?"🔒 Locked":"🔓 Unlocked"}</div>
                </div>
                {lockedChats[chatId]?(
                  <div onClick={()=>{if(window.confirm("Remove lock?"))removeLock(chatId);}} style={{padding:"8px 14px",background:"rgba(239,68,68,0.15)",borderRadius:20,color:"#EF4444",fontSize:12,fontWeight:700,cursor:"pointer"}}>Remove</div>
                ):(
                  <div onClick={()=>{setShowLockModal(chatId);setLockPin("");setLockError("");}} style={{padding:"8px 16px",background:T.grad,borderRadius:20,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>🔒 Lock</div>
                )}
              </div>
            ))}
          </div>
        )}

        {settingsTab==="ai"&&(
          <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 200px)"}}>
            <div style={{background:T.grad,borderRadius:20,padding:20,marginBottom:16,textAlign:"center"}}>
              <div style={{fontSize:40}}>🤖</div>
              <div style={{fontWeight:800,fontSize:18,color:"#fff"}}>Khan AI</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.7)"}}>Powered by Claude · Ask anything</div>
            </div>
            <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,marginBottom:12}}>
              {aiMessages.length===0&&(
                <div style={{textAlign:"center",color:T.muted,marginTop:40}}>
                  <div style={{fontSize:40}}>✨</div>
                  <div style={{marginTop:8}}>Ask Khan AI anything!</div>
                </div>
              )}
              {aiMessages.map((msg,i)=>(
                <div key={i} style={{display:"flex",justifyContent:msg.role==="user"?"flex-end":"flex-start"}}>
                  <div style={{maxWidth:"82%",padding:"12px 16px",background:msg.role==="user"?T.grad:T.card,borderRadius:msg.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",fontSize:14,color:T.text,lineHeight:1.6}}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {aiLoading&&(
                <div style={{display:"flex",justifyContent:"flex-start"}}>
                  <div style={{padding:"12px 16px",background:T.card,borderRadius:"18px 18px 18px 4px",color:T.muted,fontSize:14}}>Thinking... ✨</div>
                </div>
              )}
            </div>
            <div style={{display:"flex",gap:10}}>
              <input value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&askKhanAI()} placeholder="Ask Khan AI..."
                style={{flex:1,padding:"13px 16px",background:T.card,border:`1px solid ${T.border}`,borderRadius:24,color:T.text,fontSize:14,outline:"none"}} />
              <div onClick={askKhanAI} style={{width:48,height:48,borderRadius:"50%",background:aiInput.trim()?T.grad:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:20}}>➤</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // LOCK MODAL
  if(showLockModal) return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:T.card,borderRadius:24,padding:32,maxWidth:320,width:"90%",textAlign:"center",border:`1px solid ${T.border}`}}>
        <div style={{fontSize:48,marginBottom:12}}>🔒</div>
        <h3 style={{color:T.text,margin:"0 0 8px",fontWeight:800}}>Set Chat PIN</h3>
        <p style={{color:T.muted,fontSize:13,marginBottom:20}}>Minimum 4 digits required</p>
        <input value={lockPin} onChange={e=>setLockPin(e.target.value.replace(/\D/g,""))} placeholder="••••" type="password" maxLength={8}
          style={{width:"100%",padding:"14px",background:T.card2,border:`1px solid ${T.border}`,borderRadius:14,color:T.text,fontSize:22,outline:"none",textAlign:"center",letterSpacing:8,boxSizing:"border-box",marginBottom:10}} />
        {lockError&&<div style={{color:"#EF4444",fontSize:13,marginBottom:10}}>{lockError}</div>}
        <div style={{display:"flex",gap:10,marginTop:8}}>
          <div onClick={()=>{setShowLockModal(null);setLockPin("");setLockError("");}} style={{flex:1,padding:"13px",background:T.card2,borderRadius:14,color:T.muted,fontWeight:700,cursor:"pointer"}}>Cancel</div>
          <div onClick={()=>lockChat(showLockModal)} style={{flex:1,padding:"13px",background:T.grad,borderRadius:14,color:"#fff",fontWeight:700,cursor:"pointer"}}>Lock 🔒</div>
        </div>
      </div>
    </div>
  );

  // UNLOCK MODAL
  if(showUnlockModal) return(
    <div style={{position:"fixed",inset:0,background:T.bg,zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:T.card,borderRadius:24,padding:32,maxWidth:320,width:"90%",textAlign:"center",border:`1px solid ${T.border}`}}>
        <div style={{width:80,height:80,borderRadius:24,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 16px"}}>🔐</div>
        <h3 style={{color:T.text,margin:"0 0 8px",fontWeight:800}}>Chat Locked</h3>
        <p style={{color:T.muted,fontSize:13,marginBottom:20}}>Enter PIN to unlock this chat</p>
        <input value={unlockPin} onChange={e=>setUnlockPin(e.target.value.replace(/\D/g,""))} placeholder="••••" type="password" maxLength={8}
          onKeyDown={e=>e.key==="Enter"&&unlockChat(showUnlockModal)}
          style={{width:"100%",padding:"14px",background:T.card2,border:`1px solid ${T.border}`,borderRadius:14,color:T.text,fontSize:22,outline:"none",textAlign:"center",letterSpacing:8,boxSizing:"border-box",marginBottom:10}} />
        {lockError&&<div style={{color:"#EF4444",fontSize:13,marginBottom:10}}>{lockError}</div>}
        <div style={{display:"flex",gap:10,marginTop:8}}>
          <div onClick={()=>{setShowUnlockModal(null);setUnlockPin("");setLockError("");}} style={{flex:1,padding:"13px",background:T.card2,borderRadius:14,color:T.muted,fontWeight:700,cursor:"pointer"}}>Cancel</div>
          <div onClick={()=>unlockChat(showUnlockModal)} style={{flex:1,padding:"13px",background:T.grad,borderRadius:14,color:"#fff",fontWeight:700,cursor:"pointer"}}>Unlock →</div>
        </div>
      </div>
    </div>
  );

  const filteredCalls = callHistory.filter(c=>{
    if(callFilter==="missed") return c.status==="missed";
    if(callFilter==="incoming") return c.direction==="incoming";
    if(callFilter==="outgoing") return c.direction==="outgoing";
    return true;
  });
  const myStatuses = statuses.filter(s=>s.uid===user.uid);
  const othersStatuses = statuses.filter(s=>s.uid!==user.uid);
  const allContacts = Object.entries(contacts);
  const unlockedContacts = allContacts.filter(([id])=>!lockedChats[id]||unlockedChats.includes(id));
  const lockedList = allContacts.filter(([id])=>lockedChats[id]&&!unlockedChats.includes(id));
  const sortedContacts = unlockedContacts.sort(([aId],[bId])=>(pinnedChats.includes(aId)?0:1)-(pinnedChats.includes(bId)?0:1));

  return(
    <div style={{display:"flex",height:"100vh",fontFamily:"'Segoe UI',sans-serif",background:T.bg,color:T.text,overflow:"hidden",position:"relative"}}>

      {/* Notifications */}
      <div style={{position:"fixed",top:16,right:16,zIndex:9999,display:"flex",flexDirection:"column",gap:10}}>
        {notifications.map(n=>(
          <div key={n.id} onClick={()=>{openChat(n.contact);setNotifications(p=>p.filter(x=>x.id!==n.id));}}
            style={{background:T.card,borderRadius:16,padding:"12px 18px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 8px 32px rgba(0,0,0,0.4)",minWidth:280,borderLeft:`3px solid ${T.blue}`,cursor:"pointer",border:`1px solid ${T.border}`}}>
            <Avatar name={n.name} size={36} />
            <div style={{flex:1,overflow:"hidden"}}>
              <div style={{fontWeight:700,fontSize:13,color:T.blue}}>{n.name}</div>
              <div style={{fontSize:13,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{n.text}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Image Preview */}
      {previewImg&&(
        <div onClick={()=>setPreviewImg(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.95)",zIndex:9998,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <img src={previewImg} alt="p" style={{maxWidth:"90vw",maxHeight:"90vh",borderRadius:16}} />
          <div style={{position:"absolute",top:20,right:24,width:40,height:40,borderRadius:12,background:T.card,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:18}}>✕</div>
        </div>
      )}

      {/* Status Viewer */}
      {viewingStatus&&(
        <div onClick={()=>setViewingStatus(null)} style={{position:"fixed",inset:0,background:"#000",zIndex:10000,display:"flex",flexDirection:"column"}}>
          <div style={{padding:"20px",display:"flex",alignItems:"center",gap:14,background:"rgba(0,0,0,0.5)"}}>
            <Avatar name={viewingStatus.name} size={44} />
            <div>
              <div style={{fontWeight:700,color:"#fff",fontSize:15}}>{viewingStatus.name}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.6)"}}>{timeAgo(viewingStatus.timestamp)}</div>
            </div>
            <span style={{marginLeft:"auto",fontSize:22,color:"#fff",cursor:"pointer"}}>✕</span>
          </div>
          <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
            {viewingStatus.image&&<img src={viewingStatus.image} alt="s" style={{maxWidth:"100%",maxHeight:"70vh",borderRadius:16}} />}
            {viewingStatus.text&&<p style={{color:"#fff",fontSize:22,textAlign:"center",lineHeight:1.6,fontWeight:500}}>{viewingStatus.text}</p>}
          </div>
        </div>
      )}

      {/* Call Screen */}
      {inCall&&(
        <div style={{position:"fixed",inset:0,background:T.bg,zIndex:9997,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:24}}>
          <div style={{width:80,height:80,borderRadius:24,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36}}>
            {callType==="video"?"📹":"📞"}
          </div>
          <div style={{color:T.text,fontSize:22,fontWeight:800}}>{activeChat?.name}</div>
          <div style={{color:T.muted,fontSize:14}}>{callType==="video"?"Video":"Audio"} call in progress...</div>
          {callType==="video"&&(
            <div style={{display:"flex",gap:16}}>
              <video ref={localVideoRef} autoPlay muted style={{width:160,height:120,borderRadius:16,background:T.card,border:`2px solid ${T.blue}`}} />
              <video ref={remoteVideoRef} autoPlay style={{width:160,height:120,borderRadius:16,background:T.card,border:`2px solid ${T.purple}`}} />
            </div>
          )}
          <div onClick={endCall} style={{padding:"16px 36px",background:"#EF4444",borderRadius:20,color:"#fff",fontWeight:800,fontSize:16,cursor:"pointer",boxShadow:"0 4px 20px rgba(239,68,68,0.4)"}}>
            End Call
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInvite&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:9996,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:T.card,borderRadius:24,padding:32,maxWidth:360,width:"90%",textAlign:"center",border:`1px solid ${T.border}`}}>
            <div style={{width:64,height:64,borderRadius:20,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 16px"}}>🔗</div>
            <h3 style={{color:T.text,margin:"0 0 8px",fontWeight:800,fontSize:20}}>Invite a Friend</h3>
            <p style={{color:T.muted,fontSize:13,marginBottom:20}}>Share this link to invite friends to Khan Chats</p>
            <div style={{background:T.card2,borderRadius:12,padding:"12px 16px",fontSize:12,color:T.blue,wordBreak:"break-all",marginBottom:20,border:`1px solid ${T.border}`}}>{inviteLink}</div>
            <Btn onClick={copyLink}>{copied?"✅ Copied!":"📋 Copy Link"}</Btn>
            <div onClick={()=>setShowInvite(false)} style={{padding:"12px",color:T.muted,cursor:"pointer",marginTop:8,fontSize:14}}>Close</div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <div style={{width:360,minWidth:360,display:"flex",flexDirection:"column",borderRight:`1px solid ${T.border}`,background:T.bg}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",background:T.card,borderBottom:`1px solid ${T.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:14,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:18,color:"#fff",overflow:"hidden"}}>
              {profilePic?<img src={profilePic} alt="p" style={{width:44,height:44,objectFit:"cover"}} />:getInitials(user?.displayName||user?.email)}
            </div>
            <div>
              <div style={{fontWeight:800,fontSize:17,color:T.text}}>Khan Chats</div>
              <div style={{fontSize:11,color:T.blue,fontWeight:600}}>● Online</div>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <div onClick={generateInvite} style={{width:36,height:36,borderRadius:10,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16}} title="Invite">🔗</div>
            <div onClick={()=>setShowNewChat(!showNewChat)} style={{width:36,height:36,borderRadius:10,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16}} title="New Chat">✏️</div>
            <div onClick={()=>setShowSettings(true)} style={{width:36,height:36,borderRadius:10,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16}} title="Settings">⚙️</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",background:T.card,borderBottom:`1px solid ${T.border}`}}>
          {[["messages","💬","Messages"],["updates","✨","Updates"],["calls","📞","Calls"]].map(([view,icon,label])=>(
            <div key={view} onClick={()=>setCurrentView(view)}
              style={{flex:1,textAlign:"center",padding:"12px 4px",cursor:"pointer",fontSize:12,fontWeight:700,
                color:currentView===view?T.blue:T.muted,
                borderBottom:currentView===view?`2px solid ${T.blue}`:"2px solid transparent"}}>
              {icon} {label}
            </div>
          ))}
        </div>

        {/* New Chat */}
        {showNewChat&&currentView==="messages"&&(
          <div style={{padding:"12px 16px",background:T.card2,borderBottom:`1px solid ${T.border}`}}>
            <input value={newChatEmail} onChange={e=>setNewChatEmail(e.target.value)} placeholder="Enter friend's email..."
              style={{width:"100%",padding:"11px 14px",background:T.card,border:`1px solid ${T.border}`,borderRadius:12,color:T.text,fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:8}} />
            {newChatError&&<div style={{color:"#EF4444",fontSize:12,marginBottom:8,padding:"6px 10px",background:"rgba(239,68,68,0.1)",borderRadius:8}}>{newChatError}</div>}
            <div style={{display:"flex",gap:8}}>
              <div onClick={startChat} style={{flex:1,padding:"10px",background:T.grad,borderRadius:12,textAlign:"center",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>Start Chat</div>
              <div onClick={()=>{setShowNewChat(false);setNewChatError("");}} style={{padding:"10px 14px",background:T.card,borderRadius:12,color:T.muted,cursor:"pointer",border:`1px solid ${T.border}`}}>✕</div>
            </div>
          </div>
        )}

        <div style={{flex:1,overflowY:"auto"}}>

          {/* MESSAGES TAB */}
          {currentView==="messages"&&(
            <div>
              {sortedContacts.length===0&&lockedList.length===0?(
                <div style={{padding:40,textAlign:"center",color:T.muted}}>
                  <div style={{fontSize:52,marginBottom:16}}>💬</div>
                  <div style={{fontSize:16,fontWeight:600,marginBottom:8}}>No messages yet</div>
                  <div style={{fontSize:13}}>Use ✏️ to start a conversation</div>
                </div>
              ):(
                <>
                  {sortedContacts.map(([chatId,contact])=>(
                    <div key={chatId} onClick={()=>handleChatClick(contact)}
                      style={{display:"flex",alignItems:"center",padding:"14px 20px",cursor:"pointer",gap:14,
                        background:activeChat?.chatId===chatId?T.card2:"transparent",
                        borderBottom:`1px solid ${T.border}`,transition:"background 0.15s"}}
                      onMouseEnter={e=>{if(activeChat?.chatId!==chatId)e.currentTarget.style.background=T.card}}
                      onMouseLeave={e=>{if(activeChat?.chatId!==chatId)e.currentTarget.style.background="transparent"}}
                    >
                      <div style={{position:"relative"}}>
                        <Avatar name={contact.name} size={50} />
                        {pinnedChats.includes(chatId)&&<div style={{position:"absolute",top:-4,right:-4,fontSize:12,background:T.bg,borderRadius:"50%",padding:1}}>📌</div>}
                      </div>
                      <div style={{flex:1,overflow:"hidden"}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                          <span style={{fontWeight:700,fontSize:15,color:T.text}}>{contact.name}</span>
                          <span style={{fontSize:11,color:T.muted}}>{formatTime(contact.lastTime)}</span>
                        </div>
                        <div style={{fontSize:13,color:T.muted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{contact.lastMsg||contact.email}</div>
                      </div>
                    </div>
                  ))}
                  {lockedList.length>0&&(
                    <div>
                      <div onClick={()=>setShowLockedSection(!showLockedSection)}
                        style={{display:"flex",alignItems:"center",padding:"12px 20px",cursor:"pointer",background:T.card2,borderBottom:`1px solid ${T.border}`,gap:10}}>
                        <span style={{fontSize:16}}>🔒</span>
                        <span style={{fontWeight:700,fontSize:14,color:T.muted,flex:1}}>Locked Chats ({lockedList.length})</span>
                        <span style={{color:T.muted,fontSize:12}}>{showLockedSection?"▲":"▼"}</span>
                      </div>
                      {showLockedSection&&lockedList.map(([chatId,contact])=>(
                        <div key={chatId} onClick={()=>handleChatClick(contact)}
                          style={{display:"flex",alignItems:"center",padding:"14px 20px",cursor:"pointer",gap:14,background:T.bg,borderBottom:`1px solid ${T.border}`}}>
                          <div style={{width:50,height:50,borderRadius:"50%",background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🔒</div>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:700,fontSize:15,color:T.muted}}>••••••••</div>
                            <div style={{fontSize:13,color:T.muted}}>Tap to unlock</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* UPDATES TAB */}
          {currentView==="updates"&&(
            <div>
              <div style={{padding:"14px 16px",borderBottom:`1px solid ${T.border}`}}>
                <div onClick={()=>setShowAddStatus(!showAddStatus)}
                  style={{display:"flex",alignItems:"center",gap:14,cursor:"pointer",padding:"4px 0"}}>
                  <div style={{width:54,height:54,borderRadius:"50%",background:myStatuses.length>0?T.grad:T.card2,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:18,color:"#fff",border:myStatuses.length>0?`3px solid ${T.blue}`:`3px dashed ${T.border}`,flexShrink:0}}>
                    {profilePic?<img src={profilePic} alt="p" style={{width:54,height:54,borderRadius:"50%",objectFit:"cover"}} />:getInitials(user?.displayName)}
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:15,color:T.text}}>My Update</div>
                    <div style={{fontSize:13,color:T.muted}}>{myStatuses.length>0?timeAgo(myStatuses[0].timestamp):"Tap to add an update"}</div>
                  </div>
                  <div style={{marginLeft:"auto",width:32,height:32,borderRadius:10,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"#fff"}}>+</div>
                </div>
                {showAddStatus&&(
                  <div style={{marginTop:14,padding:14,background:T.card2,borderRadius:16,border:`1px solid ${T.border}`}}>
                    <input value={statusText} onChange={e=>setStatusText(e.target.value)} placeholder="What's on your mind?"
                      style={{width:"100%",padding:"11px 14px",background:T.card,border:`1px solid ${T.border}`,borderRadius:12,color:T.text,fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:10}} />
                    <div style={{display:"flex",gap:8}}>
                      <div onClick={()=>postStatus()} style={{flex:1,padding:"10px",background:T.grad,borderRadius:12,textAlign:"center",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>Post ✓</div>
                      <div onClick={()=>statusFileRef.current?.click()} style={{padding:"10px 14px",background:T.card,borderRadius:12,color:T.text,cursor:"pointer",border:`1px solid ${T.border}`}}>📷</div>
                      <div onClick={()=>setShowAddStatus(false)} style={{padding:"10px 14px",background:T.card,borderRadius:12,color:T.muted,cursor:"pointer",border:`1px solid ${T.border}`}}>✕</div>
                    </div>
                    <input type="file" accept="image/*" ref={statusFileRef} onChange={handleStatusImage} style={{display:"none"}} />
                  </div>
                )}
              </div>
              {othersStatuses.length>0&&<div style={{padding:"8px 20px 4px",fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Recent Updates</div>}
              {othersStatuses.map((s,i)=>(
                <div key={i} onClick={()=>setViewingStatus(s)}
                  style={{display:"flex",alignItems:"center",padding:"14px 20px",gap:14,cursor:"pointer",borderBottom:`1px solid ${T.border}`}}
                  onMouseEnter={e=>e.currentTarget.style.background=T.card}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                >
                  <div style={{width:54,height:54,borderRadius:"50%",background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:18,color:"#fff",border:`3px solid ${T.blue}`,flexShrink:0}}>
                    {getInitials(s.name)}
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:15,color:T.text}}>{s.name}</div>
                    <div style={{fontSize:13,color:T.muted}}>{timeAgo(s.timestamp)}</div>
                  </div>
                </div>
              ))}
              {statuses.length===0&&(
                <div style={{textAlign:"center",marginTop:60,color:T.muted}}>
                  <div style={{fontSize:52,marginBottom:12}}>✨</div>
                  <div style={{fontSize:15,fontWeight:600}}>No updates yet</div>
                </div>
              )}
            </div>
          )}

          {/* CALLS TAB */}
          {currentView==="calls"&&(
            <div>
              <div style={{display:"flex",padding:"4px 12px",background:T.card,borderBottom:`1px solid ${T.border}`,gap:4}}>
                {["all","missed","incoming","outgoing"].map(f=>(
                  <div key={f} onClick={()=>setCallFilter(f)}
                    style={{padding:"10px 12px",cursor:"pointer",fontSize:12,fontWeight:700,
                      color:callFilter===f?T.blue:T.muted,
                      borderBottom:callFilter===f?`2px solid ${T.blue}`:"2px solid transparent",
                      textTransform:"capitalize"}}>
                    {f==="missed"?"📵 Missed":f==="incoming"?"📞 In":f==="outgoing"?"📲 Out":"All"}
                  </div>
                ))}
              </div>
              {filteredCalls.length===0?(
                <div style={{textAlign:"center",marginTop:60,color:T.muted}}>
                  <div style={{fontSize:52,marginBottom:12}}>📞</div>
                  <div style={{fontSize:15,fontWeight:600}}>No calls yet</div>
                </div>
              ):filteredCalls.map((call,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",padding:"14px 20px",gap:14,borderBottom:`1px solid ${T.border}`}}>
                  <Avatar name={call.name} size={48} />
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:15,color:T.text}}>{call.name}</div>
                    <div style={{fontSize:12,color:call.status==="missed"?"#EF4444":call.direction==="incoming"?T.blue:T.purple,fontWeight:600}}>
                      {call.status==="missed"?"📵 Missed":call.direction==="incoming"?`📞 Incoming · ${call.type}`:`📲 Outgoing · ${call.type}`}
                    </div>
                    <div style={{fontSize:11,color:T.muted,marginTop:2}}>{formatCallTime(call.timestamp)}</div>
                  </div>
                  {call.duration>0&&<div style={{fontSize:11,color:T.muted}}>⏱ {formatDuration(call.duration)}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{padding:"10px 16px",background:T.card,borderTop:`1px solid ${T.border}`,textAlign:"center"}}>
          <div style={{fontSize:10,color:T.muted,lineHeight:1.6}}>
            <span style={{fontWeight:700,background:T.grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Khan Chats</span>
            {" "}· Independent Messaging Platform<br/>Not affiliated with WhatsApp or Meta.
          </div>
        </div>
      </div>

      {/* CHAT PANEL */}
      {activeChat?(
        <div style={{flex:1,display:"flex",flexDirection:"column",background:T.bg}}>
          <div style={{display:"flex",alignItems:"center",padding:"14px 20px",background:T.card,gap:14,borderBottom:`1px solid ${T.border}`}}>
            <Avatar name={activeChat.name} pic={null} size={44} showRing={true} />
            <div style={{flex:1}}>
              <div style={{fontWeight:800,fontSize:16,color:T.text}}>{activeChat.name}</div>
              <div style={{fontSize:12,color:T.blue,fontWeight:600}}>● Online</div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <div onClick={()=>startCall("audio")} style={{width:38,height:38,borderRadius:12,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:18,border:`1px solid ${T.border}`}} title="Audio">📞</div>
              <div onClick={()=>startCall("video")} style={{width:38,height:38,borderRadius:12,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:18,border:`1px solid ${T.border}`}} title="Video">📹</div>
            </div>
          </div>

          <div style={{flex:1,overflowY:"auto",padding:"20px 5%",display:"flex",flexDirection:"column",gap:4}}>
            {messages.length===0&&(
              <div style={{textAlign:"center",marginTop:80,color:T.muted}}>
                <div style={{fontSize:52,marginBottom:16}}>👋</div>
                <div style={{fontSize:16,fontWeight:600}}>Say hello to {activeChat.name}!</div>
              </div>
            )}
            {messages.map((msg,i)=>{
              const isMine=msg.senderUid===user.uid;
              return(
                <div key={i} style={{display:"flex",justifyContent:isMine?"flex-end":"flex-start",marginBottom:4}}>
                  <div style={{maxWidth:"68%",padding:msg.image?"6px":"10px 16px 8px",
                    background:isMine?T.grad:T.card,
                    borderRadius:isMine?"18px 18px 4px 18px":"18px 18px 18px 4px",
                    boxShadow:`0 2px 12px ${isMine?"rgba(59,130,246,0.2)":"rgba(0,0,0,0.2)"}`,
                    border:isMine?"none":`1px solid ${T.border}`}}>
                    {!isMine&&<div style={{fontSize:11,color:T.blue,fontWeight:700,marginBottom:4}}>{msg.senderName}</div>}
                    {msg.image&&<img src={msg.image} alt="s" onClick={()=>setPreviewImg(msg.image)} style={{maxWidth:230,maxHeight:230,borderRadius:12,display:"block",cursor:"zoom-in",objectFit:"cover"}} />}
                    {msg.text&&<p style={{margin:msg.image?"6px 8px 0":0,fontSize:15,lineHeight:1.6,color:T.text,wordBreak:"break-word",whiteSpace:"pre-wrap"}}>{msg.text}</p>}
                    <div style={{display:"flex",justifyContent:"flex-end",gap:4,marginTop:4,paddingRight:msg.image?6:0}}>
                      <span style={{fontSize:11,color:isMine?"rgba(255,255,255,0.6)":T.muted}}>{formatTime(msg.timestamp)}</span>
                      {isMine&&<span style={{fontSize:12,color:"rgba(255,255,255,0.8)"}}>✓✓</span>}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",background:T.card,borderTop:`1px solid ${T.border}`}}>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImage} style={{display:"none"}} />
            <div style={{display:"flex",alignItems:"center",background:T.card2,borderRadius:28,flex:1,padding:"10px 16px",gap:10,border:`1px solid ${T.border}`}}>
              <input value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendMessage()}
                placeholder="Type a message..."
                style={{flex:1,background:"none",border:"none",outline:"none",color:T.text,fontSize:15}} />
              <div onClick={()=>fileInputRef.current?.click()} style={{cursor:"pointer",fontSize:20,opacity:0.6}}>📷</div>
            </div>
            <div onClick={()=>sendMessage()} style={{width:50,height:50,borderRadius:16,background:input.trim()?T.grad:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:20,border:`1px solid ${T.border}`,boxShadow:input.trim()?"0 4px 16px rgba(59,130,246,0.3)":"none"}}>
              {input.trim()?"➤":"🎤"}
            </div>
          </div>
        </div>
      ):(
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:T.bg,gap:20,padding:32}}>
          <div style={{width:100,height:100,borderRadius:28,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:48,boxShadow:"0 12px 40px rgba(59,130,246,0.3)"}}>💬</div>
          <h2 style={{color:T.text,fontWeight:900,fontSize:32,margin:0,letterSpacing:0.5}}>Khan Chats</h2>
          <p style={{color:T.muted,fontSize:14,textAlign:"center",maxWidth:340,lineHeight:1.8,margin:0}}>
            Your premium messaging experience.<br/>Select a conversation to get started.
          </p>
          <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center"}}>
            <div onClick={generateInvite} style={{padding:"12px 24px",background:T.grad,borderRadius:16,color:"#fff",fontWeight:700,cursor:"pointer",boxShadow:"0 4px 20px rgba(59,130,246,0.3)"}}>
              🔗 Invite Friends
            </div>
            <div onClick={()=>setShowSettings(true)} style={{padding:"12px 24px",background:T.card,borderRadius:16,color:T.text,fontWeight:700,cursor:"pointer",border:`1px solid ${T.border}`}}>
              ⚙️ Settings
            </div>
          </div>
          <p style={{color:T.muted,fontSize:11,textAlign:"center",lineHeight:1.6,maxWidth:300}}>
            Independent Messaging Platform.<br/>Not affiliated with WhatsApp or Meta.
          </p>
        </div>
      )}

      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 4px; }
        input::placeholder { color: ${T.muted}; }
        @keyframes slideIn { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
      `}</style>
    </div>
  );
}
