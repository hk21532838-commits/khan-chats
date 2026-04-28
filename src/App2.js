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
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
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
        setUser(u); setScreen("chat");
        await set(ref(db, `users/${u.uid}`), { uid: u.uid, name: u.displayName || u.email.split("@")[0], email: u.email, online: true, lastSeen: serverTimestamp() });
        loadContacts(u);
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

  const register = async () => {
    if (!displayName.trim()) { setAuthError("Please enter your name"); return; }
    setAuthLoading(true); setAuthError("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: displayName.trim() });
    } catch (e) {
      setAuthError(e.message.includes("email-already") ? "This email is already registered" : e.message.includes("weak") ? "Password must be at least 6 characters" : "Something went wrong, please try again");
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
    setNewChatEmail(""); setShowNewChat(false);
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

  const pushNotif = (name, text, contact) => {
    const id = ++notifRef.current;
    setNotifications(p => [...p, { id, name, text, contact }]);
    setTimeout(() => setNotifications(p => p.filter(n => n.id !== id)), 4000);
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

  const generateInvite = () => {
    const link = `${window.location.origin}?invite=${btoa(user.email)}`;
    setInviteLink(link); setShowInvite(true);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const startCall = async (type) => {
    setCallType(type); setInCall(true);
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
    } catch (err) { alert("Microphone/Camera access denied: " + err.message); setInCall(false); }
  };

  const endCall = () => {
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
    if (pcRef.current) pcRef.current.close();
    set(ref(db, `calls/${activeChat?.chatId}`), null);
    setInCall(false); setCallType(null);
  };

  useEffect(() => {
    if (!user || !activeChat) return;
    onValue(ref(db, `calls/${activeChat.chatId}`), async (snap) => {
      const data = snap.val();
      if (data && data.caller !== user.uid && data.offer && !inCall) {
        if (window.confirm(`Incoming ${data.type === "video" ? "Video" : "Audio"} call from ${data.callerName}! Answer?`)) {
          setCallType(data.type); setInCall(true);
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
          } catch (err) { alert("Could not receive call: " + err.message); setInCall(false); }
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

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:"'Segoe UI',sans-serif", background:"#111b21", color:"#e9edef", overflow:"hidden", position:"relative" }}>

      {/* Notifications */}
      <div style={{ position:"fixed", top:16, right:16, zIndex:9999, display:"flex", flexDirection:"column", gap:10 }}>
        {notifications.map(n => (
          <div key={n.id} onClick={() => { openChat(n.contact); setNotifications(p => p.filter(x => x.id !== n.id)); }}
            style={{ background:"#202c33", borderRadius:14, padding:"10px 16px", display:"flex", alignItems:"center", gap:12, boxShadow:"0 6px 24px rgba(0,0,0,0.5)", animation:"slideIn 0.3s ease", minWidth:260, borderLeft:`4px solid ${colorFromName(n.name)}`, cursor:"pointer" }}>
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
          <div onClick={endCall} style={{ padding:"14px 32px", background:"#ef4444", borderRadius:50, color:"#fff", fontWeight:700, fontSize:16, cursor:"pointer" }}>
            📵 End Call
          </div>
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
            <div style={{ width:42, height:42, borderRadius:"50%", background:colorFromName(user?.displayName), display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:15, color:"#fff" }}>
              {getInitials(user?.displayName || user?.email)}
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:15 }}>Khan Chats</div>
              <div style={{ fontSize:11, color:"#25D366" }}>Online ✨</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:14 }}>
            <span onClick={generateInvite} style={{ cursor:"pointer", fontSize:20 }} title="Invite Friend">🔗</span>
            <span onClick={() => setShowNewChat(!showNewChat)} style={{ cursor:"pointer", fontSize:20 }} title="New Chat">✏️</span>
            <span onClick={logout} style={{ cursor:"pointer", fontSize:20 }} title="Logout">🚪</span>
          </div>
        </div>

        {showNewChat && (
          <div style={{ padding:"10px 12px", background:"#182229", borderBottom:"1px solid #1f2c33" }}>
            <div style={{ fontSize:13, color:"#25D366", fontWeight:600, marginBottom:8 }}>New Chat</div>
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
          {Object.keys(contacts).length === 0 ? (
            <div style={{ padding:24, textAlign:"center", color:"#8696a0" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>👥</div>
              <div style={{ fontSize:14 }}>No contacts yet</div>
              <div style={{ fontSize:12, marginTop:6 }}>Use ✏️ or 🔗 to get started</div>
            </div>
          ) : Object.entries(contacts).map(([chatId, contact]) => (
            <div key={chatId} onClick={() => openChat(contact)}
              style={{ display:"flex", alignItems:"center", padding:"12px 16px", cursor:"pointer", gap:12, background:activeChat?.chatId===chatId?"#2a3942":"transparent", borderBottom:"1px solid #1a2530" }}
              onMouseEnter={e => { if (activeChat?.chatId!==chatId) e.currentTarget.style.background="#182229"; }}
              onMouseLeave={e => { if (activeChat?.chatId!==chatId) e.currentTarget.style.background="transparent"; }}
            >
              <div style={{ width:50, height:50, borderRadius:"50%", background:colorFromName(contact.name), display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:16, color:"#fff", flexShrink:0 }}>
                {getInitials(contact.name)}
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
              <span onClick={() => startCall("audio")} style={{ cursor:"pointer" }} title="Audio Call">📞</span>
              <span onClick={() => startCall("video")} style={{ cursor:"pointer" }} title="Video Call">📹</span>
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
            Chat, audio and video call with your friends in real time!
          </p>
          <div onClick={generateInvite} style={{ padding:"12px 24px", background:"#25D366", borderRadius:20, color:"#fff", fontWeight:700, cursor:"pointer" }}>
            🔗 Invite a Friend
          </div>
        </div>
      )}
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateX(50px); } to { opacity:1; transform:translateX(0); } }
        ::-webkit-scrollbar { width:5px; } ::-webkit-scrollbar-thumb { background:#2a3942; border-radius:4px; }
        input::placeholder { color:#8696a0; }
      `}</style>
    </div>
  );
}
<div style={{ textAlign:"center", padding:"8px", background:"#0b141a", color:"#8696a0", fontSize:12 }}>
  Made with ❤️ by <span style={{ color:"#25D366", fontWeight:700 }}>Hamza Khan</span>
</div>
