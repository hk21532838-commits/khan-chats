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
  bg: "#0F172A", card: "#1E293B", card2: "#243147", card3: "#2D3F55",
  blue: "#3B82F6", purple: "#7C3AED", text: "#E2E8F0", muted: "#64748B",
  border: "#2D3F55", success: "#10B981",
  grad: "linear-gradient(135deg, #3B82F6 0%, #7C3AED 100%)",
  gradR: "linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)",
  gradDanger: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
  gradSuccess: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
  shadow: "0 4px 24px rgba(59,130,246,0.15)",
  shadowCard: "0 2px 16px rgba(0,0,0,0.3)",
};

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Poppins:wght@400;500;600;700;800;900&display=swap');`;

const LANGUAGES = ["English","Urdu","Arabic","Hindi","Spanish","French","German","Chinese","Japanese","Korean","Portuguese","Russian","Turkish","Italian","Dutch","Polish","Swedish","Norwegian","Danish","Finnish","Greek","Hebrew","Persian","Bengali","Punjabi","Sindhi","Pashto","Swahili","Malay","Indonesian","Thai","Vietnamese","Romanian","Hungarian","Czech","Slovak","Bulgarian","Croatian","Serbian","Ukrainian","Azerbaijani","Georgian","Armenian","Kazakh","Uzbek","Mongolian","Nepali","Sinhala","Burmese","Khmer","Amharic","Somali","Yoruba","Igbo","Hausa","Zulu","Xhosa","Afrikaans","Welsh","Irish","Basque","Galician","Maltese","Icelandic"];

function ft(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit" });
}
function gi(name) {
  if (!name) return "?";
  return name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
}
function cfn(name) {
  const c = ["#3B82F6","#7C3AED","#0EA5E9","#8B5CF6","#6366F1","#2563EB","#4F46E5","#7E22CE"];
  if (!name) return c[0];
  let s=0; for (let ch of name) s+=ch.charCodeAt(0);
  return c[s%c.length];
}
function getChatId(a,b) { return [a,b].sort().join("_"); }
function timeAgo(ts) {
  const d=Date.now()-ts, m=Math.floor(d/60000);
  if(m<1) return "Just now"; if(m<60) return `${m}m ago`;
  const h=Math.floor(m/60); if(h<24) return `${h}h ago`; return "Expired";
}
function fDur(s) { if(!s)return"0:00"; return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`; }
function fCT(ts) {
  if(!ts)return"";
  return new Date(ts).toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});
}

export default function App() {
  const [user,setUser]=useState(null);
  const [loading,setLoading]=useState(true);
  const [screen,setScreen]=useState("login");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [displayName,setDisplayName]=useState("");
  const [authError,setAuthError]=useState("");
  const [authLoading,setAuthLoading]=useState(false);
  const [contacts,setContacts]=useState({});
  const [pinnedChats,setPinnedChats]=useState([]);
  const [lockedChats,setLockedChats]=useState({});
  const [unlockedChats,setUnlockedChats]=useState([]);
  const [showLockModal,setShowLockModal]=useState(null);
  const [showUnlockModal,setShowUnlockModal]=useState(null);
  const [lockPin,setLockPin]=useState("");
  const [unlockPin,setUnlockPin]=useState("");
  const [lockError,setLockError]=useState("");
  const [showLockedSection,setShowLockedSection]=useState(false);
  const [activeChat,setActiveChat]=useState(null);
  const [messages,setMessages]=useState([]);
  const [input,setInput]=useState("");
  const [newChatEmail,setNewChatEmail]=useState("");
  const [newChatError,setNewChatError]=useState("");
  const [showNewChat,setShowNewChat]=useState(false);
  const [notifications,setNotifications]=useState([]);
  const [previewImg,setPreviewImg]=useState(null);
  const [showInvite,setShowInvite]=useState(false);
  const [inviteLink,setInviteLink]=useState("");
  const [copied,setCopied]=useState(false);
  const [inCall,setInCall]=useState(false);
  const [callType,setCallType]=useState(null);
  const [currentView,setCurrentView]=useState("messages");
  const [statuses,setStatuses]=useState([]);
  const [statusText,setStatusText]=useState("");
  const [showAddStatus,setShowAddStatus]=useState(false);
  const [viewingStatus,setViewingStatus]=useState(null);
  const [callHistory,setCallHistory]=useState([]);
  const [callFilter,setCallFilter]=useState("all");
  const [callStartTime,setCallStartTime]=useState(null);
  const [showSettings,setShowSettings]=useState(false);
  const [settingsTab,setSettingsTab]=useState("profile");
  const [profilePic,setProfilePic]=useState(null);
  const [newName,setNewName]=useState("");
  const [selectedLanguage,setSelectedLanguage]=useState("English");
  const [langSearch,setLangSearch]=useState("");
  const [aiInput,setAiInput]=useState("");
  const [aiMessages,setAiMessages]=useState([]);
  const [aiLoading,setAiLoading]=useState(false);
  const [fadeIn,setFadeIn]=useState(false);
  const [tabAnim,setTabAnim]=useState(false);
  const messagesEndRef=useRef(null);
  const fileInputRef=useRef(null);
  const statusFileRef=useRef(null);
  const profilePicRef=useRef(null);
  const notifRef=useRef(0);
  const activeChatRef=useRef(null);
  const localVideoRef=useRef(null);
  const remoteVideoRef=useRef(null);
  const pcRef=useRef(null);
  const localStreamRef=useRef(null);

  useEffect(()=>{activeChatRef.current=activeChat;},[activeChat]);
  useEffect(()=>{messagesEndRef.current?.scrollIntoView({behavior:"smooth"});},[messages]);
  useEffect(()=>{setTimeout(()=>setFadeIn(true),100);},[]);

  useEffect(()=>{
    const unsub=onAuthStateChanged(auth,async(u)=>{
      if(u){
        setUser(u);setScreen("chat");setNewName(u.displayName||"");
        await set(ref(db,`users/${u.uid}`),{uid:u.uid,name:u.displayName||u.email.split("@")[0],email:u.email,online:true,lastSeen:serverTimestamp()});
        loadContacts(u);loadStatuses();loadCallHistory(u);loadPins(u);loadProfilePic(u);loadLockedChats(u);
      } else {setUser(null);setScreen("login");}
      setLoading(false);
    });
    return ()=>unsub();
  },[]);

  const loadContacts=(u)=>{
    onValue(ref(db,`userChats/${u.uid}`),async(snap)=>{
      const data=snap.val()||{},map={};
      for(const chatId of Object.keys(data)){
        const s=await get(ref(db,`users/${data[chatId].with}`));
        if(s.exists())map[chatId]={...s.val(),chatId,lastMsg:data[chatId].lastMsg||"",lastTime:data[chatId].lastTime||0};
      }
      setContacts(map);
    });
  };
  const loadStatuses=()=>{
    onValue(ref(db,"statuses"),(snap)=>{
      setStatuses(Object.values(snap.val()||{}).filter(s=>Date.now()-s.timestamp<86400000).sort((a,b)=>b.timestamp-a.timestamp));
    });
  };
  const loadCallHistory=(u)=>{
    onValue(ref(db,`callHistory/${u.uid}`),(snap)=>{
      setCallHistory(Object.values(snap.val()||{}).sort((a,b)=>b.timestamp-a.timestamp));
    });
  };
  const loadPins=(u)=>{onValue(ref(db,`pins/${u.uid}`),(snap)=>{setPinnedChats(snap.val()||[]);});};
  const loadProfilePic=(u)=>{onValue(ref(db,`profilePics/${u.uid}`),(snap)=>{if(snap.val())setProfilePic(snap.val());});};
  const loadLockedChats=(u)=>{onValue(ref(db,`lockedChats/${u.uid}`),(snap)=>{setLockedChats(snap.val()||{});});};
  const saveCall=(u,d)=>{push(ref(db,`callHistory/${u.uid}`),{...d,timestamp:Date.now()});};
  const togglePin=async(chatId)=>{
    const p=pinnedChats.includes(chatId)?pinnedChats.filter(x=>x!==chatId):[...pinnedChats,chatId];
    await set(ref(db,`pins/${user.uid}`),p);
  };
  const saveProfilePic=async(img)=>{await set(ref(db,`profilePics/${user.uid}`),img);setProfilePic(img);};
  const saveName=async()=>{
    if(!newName.trim())return;
    await updateProfile(auth.currentUser,{displayName:newName.trim()});
    await set(ref(db,`users/${user.uid}/name`),newName.trim());
    setUser({...user,displayName:newName.trim()});alert("Name updated! ✅");
  };
  const handleProfilePic=(e)=>{
    const f=e.target.files[0];if(!f)return;
    if(f.size>500000){alert("Max 500KB");return;}
    const r=new FileReader();r.onload=ev=>saveProfilePic(ev.target.result);r.readAsDataURL(f);e.target.value="";
  };
  const lockChat=async(chatId)=>{
    if(lockPin.length<4){setLockError("PIN must be 4+ digits");return;}
    await set(ref(db,`lockedChats/${user.uid}`),{...lockedChats,[chatId]:lockPin});
    setLockPin("");setShowLockModal(null);setLockError("");alert("Chat locked! 🔒");
  };
  const unlockChat=(chatId)=>{
    if(unlockPin===lockedChats[chatId]){setUnlockedChats(p=>[...p,chatId]);setUnlockPin("");setShowUnlockModal(null);setLockError("");}
    else setLockError("Wrong PIN! Try again");
  };
  const removeLock=async(chatId)=>{
    const n={...lockedChats};delete n[chatId];
    await set(ref(db,`lockedChats/${user.uid}`),n);
    setUnlockedChats(p=>p.filter(id=>id!==chatId));
  };
  const handleChatClick=(contact)=>{
    const{chatId}=contact;
    if(lockedChats[chatId]&&!unlockedChats.includes(chatId)){setShowUnlockModal(chatId);setUnlockPin("");setLockError("");}
    else openChat(contact);
  };
  const askKhanAI=async()=>{
    if(!aiInput.trim())return;
    const uMsg={role:"user",text:aiInput.trim()};
    setAiMessages(p=>[...p,uMsg]);setAiInput("");setAiLoading(true);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,
          system:"You are Khan AI, a friendly assistant for Khan Chats made by Hamza Khan. Be helpful, warm and concise.",
          messages:[...aiMessages.map(m=>({role:m.role,content:m.text})),{role:"user",content:aiInput.trim()}]})
      });
      const data=await res.json();
      setAiMessages(p=>[...p,{role:"assistant",text:data.content?.[0]?.text||"Sorry, try again."}]);
    }catch{setAiMessages(p=>[...p,{role:"assistant",text:"Connection error. Please try again."}]);}
    setAiLoading(false);
  };
  const register=async()=>{
    if(!displayName.trim()){setAuthError("Enter your name");return;}
    setAuthLoading(true);setAuthError("");
    try{const c=await createUserWithEmailAndPassword(auth,email,password);await updateProfile(c.user,{displayName:displayName.trim()});}
    catch(e){setAuthError(e.message.includes("email-already")?"Email already registered":e.message.includes("weak")?"Password needs 6+ characters":"Something went wrong");}
    setAuthLoading(false);
  };
  const login=async()=>{
    setAuthLoading(true);setAuthError("");
    try{await signInWithEmailAndPassword(auth,email,password);}
    catch{setAuthError("Incorrect email or password");}
    setAuthLoading(false);
  };
  const logout=async()=>{
    if(user)await set(ref(db,`users/${user.uid}/online`),false);
    await signOut(auth);setActiveChat(null);setMessages([]);setContacts({});
  };
  const startChat=async()=>{
    setNewChatError("");
    if(!newChatEmail.trim()){setNewChatError("Enter an email");return;}
    if(newChatEmail.trim()===user.email){setNewChatError("Can't message yourself!");return;}
    const snap=await get(ref(db,"users"));
    const found=Object.values(snap.val()||{}).find(u=>u.email===newChatEmail.trim());
    if(!found){setNewChatError("User not found. Send them an invite!");return;}
    const chatId=getChatId(user.uid,found.uid);
    await set(ref(db,`userChats/${user.uid}/${chatId}`),{with:found.uid,lastMsg:"",lastTime:serverTimestamp()});
    await set(ref(db,`userChats/${found.uid}/${chatId}`),{with:user.uid,lastMsg:"",lastTime:serverTimestamp()});
    setNewChatEmail("");setShowNewChat(false);openChat({...found,chatId});
  };
  const openChat=(contact)=>{
    setActiveChat(contact);
    off(ref(db,`chats/${contact.chatId}/messages`));
    onValue(ref(db,`chats/${contact.chatId}/messages`),(snap)=>{
      setMessages(Object.values(snap.val()||{}).sort((a,b)=>a.timestamp-b.timestamp));
    });
  };
  const sendMessage=async(imgData=null)=>{
    if(!activeChat||(!input.trim()&&!imgData))return;
    const msg={text:imgData?"":input.trim(),image:imgData||null,senderUid:user.uid,senderName:user.displayName||user.email,timestamp:Date.now()};
    await push(ref(db,`chats/${activeChat.chatId}/messages`),msg);
    const last=imgData?"📷 Photo":input.trim();
    await set(ref(db,`userChats/${user.uid}/${activeChat.chatId}/lastMsg`),last);
    await set(ref(db,`userChats/${activeChat.uid}/${activeChat.chatId}/lastMsg`),last);
    await set(ref(db,`userChats/${user.uid}/${activeChat.chatId}/lastTime`),serverTimestamp());
    await set(ref(db,`userChats/${activeChat.uid}/${activeChat.chatId}/lastTime`),serverTimestamp());
    setInput("");
  };
  const handleImage=(e)=>{
    const f=e.target.files[0];if(!f)return;
    if(f.size>500000){alert("Max 500KB");return;}
    const r=new FileReader();r.onload=ev=>sendMessage(ev.target.result);r.readAsDataURL(f);e.target.value="";
  };
  const postStatus=async(imgData=null)=>{
    if(!statusText.trim()&&!imgData)return;
    await push(ref(db,"statuses"),{uid:user.uid,name:user.displayName||user.email,text:statusText.trim(),image:imgData||null,timestamp:Date.now()});
    setStatusText("");setShowAddStatus(false);
  };
  const handleStatusImage=(e)=>{
    const f=e.target.files[0];if(!f)return;
    if(f.size>500000){alert("Max 500KB");return;}
    const r=new FileReader();r.onload=ev=>postStatus(ev.target.result);r.readAsDataURL(f);e.target.value="";
  };
  const generateInvite=()=>{setInviteLink(`${window.location.origin}?invite=${btoa(user.email)}`);setShowInvite(true);};
  const copyLink=()=>{navigator.clipboard.writeText(inviteLink).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});};
  const startCall=async(type)=>{
    if(!activeChat)return;
    setCallType(type);setInCall(true);setCallStartTime(Date.now());
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:type==="video",audio:true});
      localStreamRef.current=stream;
      if(localVideoRef.current)localVideoRef.current.srcObject=stream;
      const pc=new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"}]});
      pcRef.current=pc;
      stream.getTracks().forEach(t=>pc.addTrack(t,stream));
      pc.ontrack=(e)=>{if(remoteVideoRef.current)remoteVideoRef.current.srcObject=e.streams[0];};
      const offer=await pc.createOffer();await pc.setLocalDescription(offer);
      await set(ref(db,`calls/${activeChat.chatId}`),{offer:JSON.stringify(offer),caller:user.uid,callerName:user.displayName,type,timestamp:Date.now()});
      onValue(ref(db,`calls/${activeChat.chatId}/answer`),async(snap)=>{if(snap.val()&&pc.signalingState!=="stable")await pc.setRemoteDescription(JSON.parse(snap.val()));});
      pc.onicecandidate=(e)=>{if(e.candidate)push(ref(db,`calls/${activeChat.chatId}/callerCandidates`),JSON.stringify(e.candidate));};
      saveCall(user,{name:activeChat.name,type,direction:"outgoing",status:"completed",duration:0});
    }catch(err){alert("Camera/Mic denied: "+err.message);setInCall(false);}
  };
  const endCall=()=>{
    if(localStreamRef.current)localStreamRef.current.getTracks().forEach(t=>t.stop());
    if(pcRef.current)pcRef.current.close();
    set(ref(db,`calls/${activeChat?.chatId}`),null);
    setInCall(false);setCallType(null);setCallStartTime(null);
  };
  useEffect(()=>{
    if(!user||!activeChat)return;
    onValue(ref(db,`calls/${activeChat.chatId}`),async(snap)=>{
      const data=snap.val();
      if(data&&data.caller!==user.uid&&data.offer&&!inCall){
        if(window.confirm(`Incoming ${data.type==="video"?"Video":"Audio"} call from ${data.callerName}!`)){
          setCallType(data.type);setInCall(true);setCallStartTime(Date.now());
          try{
            const stream=await navigator.mediaDevices.getUserMedia({video:data.type==="video",audio:true});
            localStreamRef.current=stream;
            if(localVideoRef.current)localVideoRef.current.srcObject=stream;
            const pc=new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"}]});
            pcRef.current=pc;
            stream.getTracks().forEach(t=>pc.addTrack(t,stream));
            pc.ontrack=(e)=>{if(remoteVideoRef.current)remoteVideoRef.current.srcObject=e.streams[0];};
            await pc.setRemoteDescription(JSON.parse(data.offer));
            const ans=await pc.createAnswer();await pc.setLocalDescription(ans);
            await set(ref(db,`calls/${activeChat.chatId}/answer`),JSON.stringify(ans));
            pc.onicecandidate=(e)=>{if(e.candidate)push(ref(db,`calls/${activeChat.chatId}/calleeCandidates`),JSON.stringify(e.candidate));};
            saveCall(user,{name:data.callerName,type:data.type,direction:"incoming",status:"completed",duration:0});
          }catch(err){alert("Call failed: "+err.message);setInCall(false);}
        }else{saveCall(user,{name:data.callerName,type:data.type,direction:"incoming",status:"missed",duration:0});}
      }
    });
  },[user,activeChat]);

  const filteredCalls=callHistory.filter(c=>{
    if(callFilter==="missed")return c.status==="missed";
    if(callFilter==="incoming")return c.direction==="incoming";
    if(callFilter==="outgoing")return c.direction==="outgoing";
    return true;
  });
  const myStatuses=statuses.filter(s=>s.uid===user?.uid);
  const othersStatuses=statuses.filter(s=>s.uid!==user?.uid);
  const allC=Object.entries(contacts);
  const unlockedC=allC.filter(([id])=>!lockedChats[id]||unlockedChats.includes(id));
  const lockedL=allC.filter(([id])=>lockedChats[id]&&!unlockedChats.includes(id));
  const sortedC=unlockedC.sort(([a],[b])=>(pinnedChats.includes(a)?0:1)-(pinnedChats.includes(b)?0:1));

  // SPLASH
  if(loading) return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:T.bg,flexDirection:"column",gap:24,fontFamily:"'Poppins',sans-serif"}}>
      <style>{FONTS}</style>
      <div style={{position:"relative"}}>
        <div style={{width:88,height:88,borderRadius:26,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:42,animation:"pulse 2s infinite",boxShadow:`0 0 40px rgba(59,130,246,0.5), 0 0 80px rgba(124,58,237,0.3)`}}>💬</div>
        <div style={{position:"absolute",inset:-4,borderRadius:30,border:"2px solid rgba(59,130,246,0.3)",animation:"ringPulse 2s infinite"}} />
      </div>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:28,fontWeight:900,background:T.grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:0.5}}>Khan Chats</div>
        <div style={{color:T.muted,fontSize:13,marginTop:6,fontWeight:500}}>Premium Messaging</div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:8}}>
        {[0,1,2].map(i=>(
          <div key={i} style={{width:8,height:8,borderRadius:"50%",background:T.blue,animation:`loadDot 1.4s ${i*0.2}s infinite`}} />
        ))}
      </div>
    </div>
  );

  // AUTH
  if(screen==="login"||screen==="register") return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:T.bg,fontFamily:"'Poppins',sans-serif",animation:"fadeIn 0.5s ease"}}>
      <style>{FONTS}</style>
      <div style={{width:"100%",maxWidth:420,padding:"0 28px"}}>
        <div style={{textAlign:"center",marginBottom:44}}>
          <div style={{width:84,height:84,borderRadius:26,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,margin:"0 auto 20px",boxShadow:`0 8px 32px rgba(59,130,246,0.4), 0 0 60px rgba(124,58,237,0.2)`}}>💬</div>
          <h1 style={{color:T.text,fontWeight:900,fontSize:32,margin:0,letterSpacing:"-0.5px"}}>Khan Chats</h1>
          <p style={{color:T.muted,fontSize:14,margin:"8px 0 0",fontWeight:500}}>Premium Messaging Experience</p>
        </div>
        <div style={{display:"flex",background:T.card,borderRadius:18,padding:5,marginBottom:28,boxShadow:T.shadowCard}}>
          {["login","register"].map(s=>(
            <div key={s} onClick={()=>{setScreen(s);setAuthError("");}}
              style={{flex:1,textAlign:"center",padding:"13px",borderRadius:14,cursor:"pointer",fontWeight:700,fontSize:14,
                background:screen===s?T.grad:"transparent",
                color:screen===s?"#fff":T.muted,
                boxShadow:screen===s?T.shadow:"none",
                transition:"all 0.3s ease"}}>
              {s==="login"?"Sign In":"Create Account"}
            </div>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {screen==="register"&&(
            <input value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Full name"
              style={{padding:"15px 18px",background:T.card,border:`1.5px solid ${T.border}`,borderRadius:16,color:T.text,fontSize:15,outline:"none",fontFamily:"'Poppins',sans-serif",transition:"border 0.2s"}}
              onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border} />
          )}
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email"
            style={{padding:"15px 18px",background:T.card,border:`1.5px solid ${T.border}`,borderRadius:16,color:T.text,fontSize:15,outline:"none",fontFamily:"'Poppins',sans-serif",transition:"border 0.2s"}}
            onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border} />
          <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password"
            onKeyDown={e=>e.key==="Enter"&&(screen==="login"?login():register())}
            style={{padding:"15px 18px",background:T.card,border:`1.5px solid ${T.border}`,borderRadius:16,color:T.text,fontSize:15,outline:"none",fontFamily:"'Poppins',sans-serif",transition:"border 0.2s"}}
            onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border} />
        </div>
        {authError&&<div style={{color:"#EF4444",fontSize:13,margin:"12px 0",textAlign:"center",padding:"10px 16px",background:"rgba(239,68,68,0.08)",borderRadius:12,border:"1px solid rgba(239,68,68,0.2)",fontWeight:500}}>{authError}</div>}
        <div onClick={screen==="login"?login:register}
          style={{marginTop:16,padding:"16px",background:authLoading?T.card3:T.grad,borderRadius:18,textAlign:"center",color:"#fff",fontWeight:800,fontSize:16,cursor:"pointer",boxShadow:T.shadow,fontFamily:"'Poppins',sans-serif",letterSpacing:0.3,transition:"all 0.2s",transform:"scale(1)"}}>
          {authLoading?"Please wait...":(screen==="login"?"Sign In →":"Create Account →")}
        </div>
        <p style={{color:T.muted,fontSize:11,textAlign:"center",marginTop:24,lineHeight:1.7,fontWeight:400}}>
          Independent Messaging Platform<br/>Not affiliated with WhatsApp or Meta
        </p>
      </div>
    </div>
  );

  // SETTINGS
  if(showSettings) return(
    <div style={{position:"fixed",inset:0,background:T.bg,zIndex:9999,display:"flex",flexDirection:"column",fontFamily:"'Poppins',sans-serif",color:T.text,animation:"slideUp 0.3s ease"}}>
      <style>{FONTS}</style>
      <div style={{display:"flex",alignItems:"center",padding:"18px 22px",background:T.card,gap:14,borderBottom:`1px solid ${T.border}`,boxShadow:"0 2px 16px rgba(0,0,0,0.2)"}}>
        <div onClick={()=>setShowSettings(false)} style={{width:40,height:40,borderRadius:12,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:18,transition:"background 0.2s"}}
          onMouseEnter={e=>e.target.style.background=T.card3} onMouseLeave={e=>e.target.style.background=T.card2}>←</div>
        <div style={{fontWeight:800,fontSize:20,flex:1,letterSpacing:"-0.3px"}}>Settings</div>
      </div>
      <div style={{display:"flex",background:T.card,borderBottom:`1px solid ${T.border}`,overflowX:"auto",padding:"0 10px"}}>
        {[["profile","👤","Profile"],["language","🌐","Language"],["pins","📌","Pins"],["locks","🔒","Locks"],["ai","🤖","Khan AI"]].map(([tab,icon,label])=>(
          <div key={tab} onClick={()=>setSettingsTab(tab)}
            style={{padding:"14px 18px",cursor:"pointer",fontSize:12,fontWeight:700,whiteSpace:"nowrap",
              color:settingsTab===tab?T.blue:T.muted,
              borderBottom:settingsTab===tab?`2.5px solid ${T.blue}`:"2.5px solid transparent",
              transition:"all 0.2s",letterSpacing:0.3}}>
            {icon} {label}
          </div>
        ))}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:22}}>

        {settingsTab==="profile"&&(
          <div style={{display:"flex",flexDirection:"column",gap:18,animation:"slideUp 0.3s ease"}}>
            <div style={{background:T.grad,borderRadius:24,padding:28,textAlign:"center",boxShadow:"0 8px 32px rgba(59,130,246,0.3)"}}>
              <div style={{position:"relative",display:"inline-block",marginBottom:14}}>
                {profilePic?(
                  <img src={profilePic} alt="p" style={{width:96,height:96,borderRadius:"50%",objectFit:"cover",border:"3px solid rgba(255,255,255,0.5)"}} />
                ):(
                  <div style={{width:96,height:96,borderRadius:"50%",background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:34,color:"#fff",border:"3px solid rgba(255,255,255,0.4)",margin:"0 auto",backdropFilter:"blur(10px)"}}>
                    {gi(user?.displayName)}
                  </div>
                )}
                <div onClick={()=>profilePicRef.current?.click()} style={{position:"absolute",bottom:2,right:2,background:"#fff",borderRadius:"50%",width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}>📷</div>
              </div>
              <div style={{color:"#fff",fontWeight:800,fontSize:20,letterSpacing:"-0.3px"}}>{user?.displayName}</div>
              <div style={{color:"rgba(255,255,255,0.65)",fontSize:13,marginTop:4}}>{user?.email}</div>
              <input type="file" accept="image/*" ref={profilePicRef} onChange={handleProfilePic} style={{display:"none"}} />
            </div>
            <div style={{background:T.card,borderRadius:20,padding:22,boxShadow:T.shadowCard,border:`1px solid ${T.border}`}}>
              <div style={{fontSize:11,color:T.blue,fontWeight:700,marginBottom:12,textTransform:"uppercase",letterSpacing:1.5}}>Display Name</div>
              <input value={newName} onChange={e=>setNewName(e.target.value)}
                style={{width:"100%",padding:"13px 16px",background:T.card2,border:`1.5px solid ${T.border}`,borderRadius:14,color:T.text,fontSize:15,outline:"none",boxSizing:"border-box",marginBottom:14,fontFamily:"'Poppins',sans-serif",transition:"border 0.2s"}}
                onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border} />
              <div onClick={saveName} style={{padding:"13px",background:T.grad,borderRadius:14,textAlign:"center",color:"#fff",fontWeight:700,cursor:"pointer",boxShadow:T.shadow,fontSize:14}}>Save Changes ✓</div>
            </div>
            <div onClick={logout} style={{padding:"16px 20px",background:T.gradDanger,borderRadius:18,textAlign:"center",color:"#fff",fontWeight:700,cursor:"pointer",boxShadow:"0 4px 20px rgba(239,68,68,0.35)",fontSize:15,letterSpacing:0.3,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              🚪 Sign Out
            </div>
          </div>
        )}

        {settingsTab==="language"&&(
          <div style={{animation:"slideUp 0.3s ease"}}>
            <div style={{background:T.card,borderRadius:18,padding:18,marginBottom:14,boxShadow:T.shadowCard,border:`1px solid ${T.border}`}}>
              <div style={{fontSize:11,color:T.blue,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:1.5}}>Selected: {selectedLanguage}</div>
              <input value={langSearch} onChange={e=>setLangSearch(e.target.value)} placeholder="Search languages..."
                style={{width:"100%",padding:"12px 16px",background:T.card2,border:`1.5px solid ${T.border}`,borderRadius:14,color:T.text,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"'Poppins',sans-serif"}}
                onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border} />
            </div>
            {LANGUAGES.filter(l=>l.toLowerCase().includes(langSearch.toLowerCase())).map(lang=>(
              <div key={lang} onClick={()=>{setSelectedLanguage(lang);setLangSearch("");}}
                style={{padding:"14px 18px",background:selectedLanguage===lang?T.card2:T.card,borderRadius:14,cursor:"pointer",display:"flex",justifyContent:"space-between",marginBottom:6,border:`1.5px solid ${selectedLanguage===lang?T.blue:T.border}`,transition:"all 0.15s"}}>
                <span style={{color:T.text,fontSize:14,fontWeight:selectedLanguage===lang?700:400}}>{lang}</span>
                {selectedLanguage===lang&&<span style={{color:T.blue,fontWeight:800}}>✓</span>}
              </div>
            ))}
          </div>
        )}

        {settingsTab==="pins"&&(
          <div style={{animation:"slideUp 0.3s ease"}}>
            <div style={{color:T.muted,fontSize:13,marginBottom:18,padding:"12px 16px",background:T.card,borderRadius:14,border:`1px solid ${T.border}`,lineHeight:1.6}}>
              📌 Pinned contacts always appear at the top of your Messages list.
            </div>
            {Object.entries(contacts).length===0?(
              <div style={{textAlign:"center",color:T.muted,marginTop:60}}>
                <div style={{fontSize:52}}>📌</div><div style={{marginTop:12,fontWeight:600}}>No contacts yet</div>
              </div>
            ):Object.entries(contacts).map(([chatId,contact])=>(
              <div key={chatId} style={{display:"flex",alignItems:"center",padding:"16px 18px",background:T.card,borderRadius:18,marginBottom:10,gap:14,border:`1px solid ${T.border}`,boxShadow:T.shadowCard}}>
                <div style={{width:48,height:48,borderRadius:16,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:17,color:"#fff"}}>
                  {gi(contact.name)}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:15,color:T.text}}>{contact.name}</div>
                  <div style={{fontSize:12,color:T.muted,marginTop:2}}>{contact.email}</div>
                </div>
                <div onClick={()=>togglePin(chatId)} style={{padding:"9px 18px",background:pinnedChats.includes(chatId)?T.grad:T.card2,borderRadius:20,color:pinnedChats.includes(chatId)?"#fff":T.muted,fontSize:13,fontWeight:700,cursor:"pointer",transition:"all 0.2s",boxShadow:pinnedChats.includes(chatId)?T.shadow:"none"}}>
                  {pinnedChats.includes(chatId)?"📌 Pinned":"Pin"}
                </div>
              </div>
            ))}
          </div>
        )}

        {settingsTab==="locks"&&(
          <div style={{animation:"slideUp 0.3s ease"}}>
            <div style={{color:T.muted,fontSize:13,marginBottom:18,padding:"12px 16px",background:T.card,borderRadius:14,border:`1px solid ${T.border}`,lineHeight:1.6}}>
              🔒 Lock chats with a PIN. Locked chats are hidden and require a PIN to open.
            </div>
            {Object.entries(contacts).map(([chatId,contact])=>(
              <div key={chatId} style={{display:"flex",alignItems:"center",padding:"16px 18px",background:T.card,borderRadius:18,marginBottom:10,gap:14,border:`1px solid ${T.border}`,boxShadow:T.shadowCard}}>
                <div style={{width:48,height:48,borderRadius:16,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:17,color:"#fff"}}>
                  {gi(contact.name)}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:15,color:T.text}}>{contact.name}</div>
                  <div style={{fontSize:12,color:lockedChats[chatId]?"#EF4444":T.muted,marginTop:2,fontWeight:lockedChats[chatId]?600:400}}>
                    {lockedChats[chatId]?"🔒 Locked":"🔓 Unlocked"}
                  </div>
                </div>
                {lockedChats[chatId]?(
                  <div onClick={()=>{if(window.confirm("Remove lock?"))removeLock(chatId);}} style={{padding:"9px 16px",background:"rgba(239,68,68,0.1)",borderRadius:20,color:"#EF4444",fontSize:12,fontWeight:700,cursor:"pointer",border:"1px solid rgba(239,68,68,0.2)"}}>Remove</div>
                ):(
                  <div onClick={()=>{setShowLockModal(chatId);setLockPin("");setLockError("");}} style={{padding:"9px 18px",background:T.grad,borderRadius:20,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",boxShadow:T.shadow}}>🔒 Lock</div>
                )}
              </div>
            ))}
          </div>
        )}

        {settingsTab==="ai"&&(
          <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 200px)",animation:"slideUp 0.3s ease"}}>
            <div style={{background:T.grad,borderRadius:22,padding:22,marginBottom:18,textAlign:"center",boxShadow:"0 8px 32px rgba(59,130,246,0.3)"}}>
              <div style={{fontSize:44}}>🤖</div>
              <div style={{fontWeight:800,fontSize:20,color:"#fff",marginTop:8,letterSpacing:"-0.3px"}}>Khan AI</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.7)",marginTop:4,fontWeight:500}}>Powered by Claude · Ask me anything</div>
            </div>
            <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:12,marginBottom:14}}>
              {aiMessages.length===0&&(
                <div style={{textAlign:"center",color:T.muted,marginTop:40}}>
                  <div style={{fontSize:44}}>✨</div>
                  <div style={{marginTop:10,fontWeight:600,fontSize:15}}>Ask Khan AI anything!</div>
                  <div style={{marginTop:6,fontSize:13}}>I'm here to help</div>
                </div>
              )}
              {aiMessages.map((msg,i)=>(
                <div key={i} style={{display:"flex",justifyContent:msg.role==="user"?"flex-end":"flex-start",animation:"slideUp 0.2s ease"}}>
                  <div style={{maxWidth:"84%",padding:"13px 17px",background:msg.role==="user"?T.grad:T.card,borderRadius:msg.role==="user"?"18px 18px 5px 18px":"18px 18px 18px 5px",fontSize:14,color:T.text,lineHeight:1.7,boxShadow:msg.role==="user"?T.shadow:T.shadowCard,border:msg.role==="user"?"none":`1px solid ${T.border}`}}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {aiLoading&&(
                <div style={{display:"flex",justifyContent:"flex-start"}}>
                  <div style={{padding:"13px 17px",background:T.card,borderRadius:"18px 18px 18px 5px",border:`1px solid ${T.border}`,display:"flex",gap:6,alignItems:"center"}}>
                    {[0,1,2].map(i=>(
                      <div key={i} style={{width:7,height:7,borderRadius:"50%",background:T.blue,animation:`loadDot 1.4s ${i*0.2}s infinite`}} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div style={{display:"flex",gap:10}}>
              <input value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&askKhanAI()} placeholder="Ask Khan AI..."
                style={{flex:1,padding:"14px 18px",background:T.card,border:`1.5px solid ${T.border}`,borderRadius:24,color:T.text,fontSize:14,outline:"none",fontFamily:"'Poppins',sans-serif",transition:"border 0.2s"}}
                onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border} />
              <div onClick={askKhanAI} style={{width:50,height:50,borderRadius:16,background:aiInput.trim()?T.grad:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:20,boxShadow:aiInput.trim()?T.shadow:"none",transition:"all 0.2s"}}>➤</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // LOCK MODAL
  if(showLockModal) return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Poppins',sans-serif"}}>
      <style>{FONTS}</style>
      <div style={{background:T.card,borderRadius:28,padding:36,maxWidth:340,width:"90%",textAlign:"center",border:`1px solid ${T.border}`,boxShadow:"0 20px 60px rgba(0,0,0,0.5)",animation:"slideUp 0.3s ease"}}>
        <div style={{width:72,height:72,borderRadius:22,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,margin:"0 auto 18px",boxShadow:T.shadow}}>🔒</div>
        <h3 style={{color:T.text,margin:"0 0 8px",fontWeight:800,fontSize:20}}>Set Chat PIN</h3>
        <p style={{color:T.muted,fontSize:13,marginBottom:22,lineHeight:1.6}}>Choose a PIN of minimum 4 digits to lock this chat</p>
        <input value={lockPin} onChange={e=>setLockPin(e.target.value.replace(/\D/g,""))} placeholder="• • • •" type="password" maxLength={8}
          style={{width:"100%",padding:"16px",background:T.card2,border:`1.5px solid ${T.border}`,borderRadius:16,color:T.text,fontSize:24,outline:"none",textAlign:"center",letterSpacing:10,boxSizing:"border-box",marginBottom:10,fontFamily:"'Poppins',sans-serif"}}
          onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border} />
        {lockError&&<div style={{color:"#EF4444",fontSize:13,marginBottom:12,padding:"8px",background:"rgba(239,68,68,0.08)",borderRadius:10}}>{lockError}</div>}
        <div style={{display:"flex",gap:10,marginTop:10}}>
          <div onClick={()=>{setShowLockModal(null);setLockPin("");setLockError("");}} style={{flex:1,padding:"14px",background:T.card2,borderRadius:16,color:T.muted,fontWeight:700,cursor:"pointer",fontSize:14}}>Cancel</div>
          <div onClick={()=>lockChat(showLockModal)} style={{flex:1,padding:"14px",background:T.grad,borderRadius:16,color:"#fff",fontWeight:700,cursor:"pointer",fontSize:14,boxShadow:T.shadow}}>Lock Chat 🔒</div>
        </div>
      </div>
    </div>
  );

  // UNLOCK MODAL
  if(showUnlockModal) return(
    <div style={{position:"fixed",inset:0,background:T.bg,zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Poppins',sans-serif"}}>
      <style>{FONTS}</style>
      <div style={{background:T.card,borderRadius:28,padding:36,maxWidth:340,width:"90%",textAlign:"center",border:`1px solid ${T.border}`,boxShadow:"0 20px 60px rgba(0,0,0,0.5)",animation:"slideUp 0.3s ease"}}>
        <div style={{width:72,height:72,borderRadius:22,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,margin:"0 auto 18px",boxShadow:T.shadow}}>🔐</div>
        <h3 style={{color:T.text,margin:"0 0 8px",fontWeight:800,fontSize:20}}>Chat Locked</h3>
        <p style={{color:T.muted,fontSize:13,marginBottom:22,lineHeight:1.6}}>Enter your PIN to unlock and open this chat</p>
        <input value={unlockPin} onChange={e=>setUnlockPin(e.target.value.replace(/\D/g,""))} placeholder="• • • •" type="password" maxLength={8}
          onKeyDown={e=>e.key==="Enter"&&unlockChat(showUnlockModal)}
          style={{width:"100%",padding:"16px",background:T.card2,border:`1.5px solid ${T.border}`,borderRadius:16,color:T.text,fontSize:24,outline:"none",textAlign:"center",letterSpacing:10,boxSizing:"border-box",marginBottom:10,fontFamily:"'Poppins',sans-serif"}}
          onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border} />
        {lockError&&<div style={{color:"#EF4444",fontSize:13,marginBottom:12,padding:"8px",background:"rgba(239,68,68,0.08)",borderRadius:10}}>{lockError}</div>}
        <div style={{display:"flex",gap:10,marginTop:10}}>
          <div onClick={()=>{setShowUnlockModal(null);setUnlockPin("");setLockError("");}} style={{flex:1,padding:"14px",background:T.card2,borderRadius:16,color:T.muted,fontWeight:700,cursor:"pointer",fontSize:14}}>Cancel</div>
          <div onClick={()=>unlockChat(showUnlockModal)} style={{flex:1,padding:"14px",background:T.grad,borderRadius:16,color:"#fff",fontWeight:700,cursor:"pointer",fontSize:14,boxShadow:T.shadow}}>Unlock →</div>
        </div>
      </div>
    </div>
  );

  return(
    <div style={{display:"flex",height:"100vh",fontFamily:"'Inter',sans-serif",background:T.bg,color:T.text,overflow:"hidden",position:"relative",animation:"fadeIn 0.4s ease"}}>
      <style>{FONTS}</style>

      {/* Notifications */}
      <div style={{position:"fixed",top:16,right:16,zIndex:9999,display:"flex",flexDirection:"column",gap:10}}>
        {notifications.map(n=>(
          <div key={n.id} onClick={()=>{openChat(n.contact);setNotifications(p=>p.filter(x=>x.id!==n.id));}}
            style={{background:T.card,borderRadius:18,padding:"13px 18px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 8px 32px rgba(0,0,0,0.4)",minWidth:290,borderLeft:`3px solid ${T.blue}`,cursor:"pointer",border:`1px solid ${T.border}`,animation:"slideIn 0.3s ease",backdropFilter:"blur(10px)"}}>
            <div style={{width:38,height:38,borderRadius:12,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,color:"#fff"}}>{gi(n.name)}</div>
            <div style={{flex:1,overflow:"hidden"}}>
              <div style={{fontWeight:700,fontSize:13,color:T.blue}}>{n.name}</div>
              <div style={{fontSize:13,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginTop:2}}>{n.text}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview */}
      {previewImg&&(
        <div onClick={()=>setPreviewImg(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.96)",zIndex:9998,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <img src={previewImg} alt="p" style={{maxWidth:"90vw",maxHeight:"90vh",borderRadius:20}} />
          <div style={{position:"absolute",top:20,right:24,width:44,height:44,borderRadius:14,background:T.card,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:18,border:`1px solid ${T.border}`}}>✕</div>
        </div>
      )}

      {/* Status Viewer */}
      {viewingStatus&&(
        <div onClick={()=>setViewingStatus(null)} style={{position:"fixed",inset:0,background:"#000",zIndex:10000,display:"flex",flexDirection:"column"}}>
          <div style={{padding:"20px 24px",display:"flex",alignItems:"center",gap:14,background:"rgba(0,0,0,0.6)"}}>
            <div style={{width:46,height:46,borderRadius:14,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:17,color:"#fff"}}>{gi(viewingStatus.name)}</div>
            <div>
              <div style={{fontWeight:700,color:"#fff",fontSize:15}}>{viewingStatus.name}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.55)",marginTop:2}}>{timeAgo(viewingStatus.timestamp)}</div>
            </div>
            <span style={{marginLeft:"auto",fontSize:24,color:"#fff",cursor:"pointer",opacity:0.8}}>✕</span>
          </div>
          <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:28}}>
            {viewingStatus.image&&<img src={viewingStatus.image} alt="s" style={{maxWidth:"100%",maxHeight:"72vh",borderRadius:20}} />}
            {viewingStatus.text&&<p style={{color:"#fff",fontSize:24,textAlign:"center",lineHeight:1.6,fontWeight:600,maxWidth:400}}>{viewingStatus.text}</p>}
          </div>
        </div>
      )}

      {/* Call */}
      {inCall&&(
        <div style={{position:"fixed",inset:0,background:T.bg,zIndex:9997,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:26}}>
          <div style={{width:88,height:88,borderRadius:26,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,boxShadow:`0 0 40px rgba(59,130,246,0.4)`}}>{callType==="video"?"📹":"📞"}</div>
          <div style={{color:T.text,fontSize:24,fontWeight:800,letterSpacing:"-0.5px"}}>{activeChat?.name}</div>
          <div style={{color:T.muted,fontSize:14,fontWeight:500}}>{callType==="video"?"Video":"Audio"} call in progress...</div>
          {callType==="video"&&(
            <div style={{display:"flex",gap:16}}>
              <video ref={localVideoRef} autoPlay muted style={{width:160,height:120,borderRadius:18,background:T.card,border:`2px solid ${T.blue}`}} />
              <video ref={remoteVideoRef} autoPlay style={{width:160,height:120,borderRadius:18,background:T.card,border:`2px solid ${T.purple}`}} />
            </div>
          )}
          <div onClick={endCall} style={{padding:"16px 40px",background:T.gradDanger,borderRadius:22,color:"#fff",fontWeight:800,fontSize:16,cursor:"pointer",boxShadow:"0 6px 24px rgba(239,68,68,0.4)",letterSpacing:0.3}}>
            End Call
          </div>
        </div>
      )}

      {/* Invite */}
      {showInvite&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:9996,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:T.card,borderRadius:28,padding:36,maxWidth:380,width:"90%",textAlign:"center",border:`1px solid ${T.border}`,boxShadow:"0 20px 60px rgba(0,0,0,0.5)",animation:"slideUp 0.3s ease"}}>
            <div style={{width:68,height:68,borderRadius:22,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,margin:"0 auto 18px",boxShadow:T.shadow}}>🔗</div>
            <h3 style={{color:T.text,margin:"0 0 8px",fontWeight:800,fontSize:20}}>Invite Friends</h3>
            <p style={{color:T.muted,fontSize:13,marginBottom:22,lineHeight:1.7}}>Share this link to invite friends to Khan Chats</p>
            <div style={{background:T.card2,borderRadius:14,padding:"13px 16px",fontSize:12,color:T.blue,wordBreak:"break-all",marginBottom:22,border:`1px solid ${T.border}`,lineHeight:1.6}}>{inviteLink}</div>
            <div onClick={copyLink} style={{padding:"14px",background:copied?T.gradSuccess:T.grad,borderRadius:16,color:"#fff",fontWeight:700,cursor:"pointer",boxShadow:T.shadow,fontSize:14,marginBottom:10}}>
              {copied?"✅ Copied!":"📋 Copy Link"}
            </div>
            <div onClick={()=>setShowInvite(false)} style={{padding:"12px",color:T.muted,cursor:"pointer",fontSize:14,fontWeight:500}}>Close</div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <div style={{width:370,minWidth:370,display:"flex",flexDirection:"column",borderRight:`1px solid ${T.border}`,background:T.bg}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 22px",background:T.card,borderBottom:`1px solid ${T.border}`,boxShadow:"0 2px 12px rgba(0,0,0,0.15)"}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:46,height:46,borderRadius:15,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:19,color:"#fff",overflow:"hidden",boxShadow:T.shadow}}>
              {profilePic?<img src={profilePic} alt="p" style={{width:46,height:46,objectFit:"cover"}} />:gi(user?.displayName||user?.email)}
            </div>
            <div>
              <div style={{fontWeight:800,fontSize:18,color:T.text,letterSpacing:"-0.3px",fontFamily:"'Poppins',sans-serif"}}>Khan Chats</div>
              <div style={{fontSize:11,color:T.blue,fontWeight:600,marginTop:1}}>● Active Now</div>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            {[["🔗","Invite",generateInvite],["✏️","New Chat",()=>setShowNewChat(!showNewChat)],["⚙️","Settings",()=>setShowSettings(true)]].map(([icon,title,fn])=>(
              <div key={title} onClick={fn} title={title} style={{width:38,height:38,borderRadius:12,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:17,border:`1px solid ${T.border}`,transition:"all 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.background=T.card3}
                onMouseLeave={e=>e.currentTarget.style.background=T.card2}>
                {icon}
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",background:T.card,borderBottom:`1px solid ${T.border}`,padding:"0 8px"}}>
          {[["messages","💬","Messages"],["updates","✨","Updates"],["calls","📞","Calls"]].map(([view,icon,label])=>(
            <div key={view} onClick={()=>{setCurrentView(view);setTabAnim(true);setTimeout(()=>setTabAnim(false),300);}}
              style={{flex:1,textAlign:"center",padding:"14px 4px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'Poppins',sans-serif",
                color:currentView===view?T.blue:"rgba(100,116,139,0.7)",
                borderBottom:currentView===view?`2.5px solid ${T.blue}`:"2.5px solid transparent",
                transition:"all 0.25s ease",letterSpacing:0.4,
                textShadow:currentView===view?`0 0 20px rgba(59,130,246,0.5)`:"none"}}>
              <span style={{fontSize:15,display:"block",marginBottom:2}}>{icon}</span>
              {label}
            </div>
          ))}
        </div>

        {/* New Chat */}
        {showNewChat&&currentView==="messages"&&(
          <div style={{padding:"14px 18px",background:T.card2,borderBottom:`1px solid ${T.border}`,animation:"slideDown 0.2s ease"}}>
            <input value={newChatEmail} onChange={e=>setNewChatEmail(e.target.value)} placeholder="Enter friend's email..."
              style={{width:"100%",padding:"12px 16px",background:T.card,border:`1.5px solid ${T.border}`,borderRadius:14,color:T.text,fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:10,fontFamily:"'Inter',sans-serif",transition:"border 0.2s"}}
              onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border} />
            {newChatError&&<div style={{color:"#EF4444",fontSize:12,marginBottom:8,padding:"7px 12px",background:"rgba(239,68,68,0.08)",borderRadius:10,border:"1px solid rgba(239,68,68,0.15)"}}>{newChatError}</div>}
            <div style={{display:"flex",gap:8}}>
              <div onClick={startChat} style={{flex:1,padding:"11px",background:T.grad,borderRadius:13,textAlign:"center",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",boxShadow:T.shadow}}>Start Chat</div>
              <div onClick={()=>{setShowNewChat(false);setNewChatError("");}} style={{padding:"11px 16px",background:T.card,borderRadius:13,color:T.muted,cursor:"pointer",border:`1px solid ${T.border}`,fontSize:14}}>✕</div>
            </div>
          </div>
        )}

        <div style={{flex:1,overflowY:"auto"}}>

          {/* MESSAGES */}
          {currentView==="messages"&&(
            <div style={{animation:"fadeIn 0.25s ease"}}>
              {sortedC.length===0&&lockedL.length===0?(
                <div style={{padding:50,textAlign:"center",color:T.muted}}>
                  <div style={{fontSize:56,marginBottom:18,opacity:0.6}}>💬</div>
                  <div style={{fontSize:17,fontWeight:700,marginBottom:8,color:T.text,fontFamily:"'Poppins',sans-serif"}}>No messages yet</div>
                  <div style={{fontSize:13,marginBottom:24,lineHeight:1.6}}>Start a conversation with your friends</div>
                  <div onClick={()=>setShowNewChat(true)} style={{padding:"13px 28px",background:T.grad,borderRadius:18,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",display:"inline-block",boxShadow:T.shadow}}>
                    ➕ Start Chat
                  </div>
                </div>
              ):(
                <>
                  {sortedC.map(([chatId,contact],idx)=>(
                    <div key={chatId} onClick={()=>handleChatClick(contact)}
                      style={{display:"flex",alignItems:"center",padding:"15px 22px",cursor:"pointer",gap:14,
                        background:activeChat?.chatId===chatId?T.card2:"transparent",
                        borderBottom:`1px solid ${T.border}`,
                        transition:"all 0.15s ease",
                        animation:`slideUp 0.3s ${idx*0.03}s ease both`}}
                      onMouseEnter={e=>e.currentTarget.style.background=activeChat?.chatId===chatId?T.card2:T.card}
                      onMouseLeave={e=>e.currentTarget.style.background=activeChat?.chatId===chatId?T.card2:"transparent"}
                    >
                      <div style={{position:"relative",flexShrink:0}}>
                        <div style={{width:52,height:52,borderRadius:17,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:18,color:"#fff",boxShadow:"0 2px 12px rgba(59,130,246,0.2)"}}>
                          {gi(contact.name)}
                        </div>
                        {pinnedChats.includes(chatId)&&<div style={{position:"absolute",top:-5,right:-5,fontSize:11,background:T.bg,borderRadius:"50%",padding:2}}>📌</div>}
                      </div>
                      <div style={{flex:1,overflow:"hidden"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                          <span style={{fontWeight:700,fontSize:15,color:T.text,letterSpacing:"-0.2px"}}>{contact.name}</span>
                          <span style={{fontSize:10,color:T.muted,fontWeight:500}}>{ft(contact.lastTime)}</span>
                        </div>
                        <div style={{fontSize:13,color:T.muted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",fontWeight:400}}>{contact.lastMsg||contact.email}</div>
                      </div>
                    </div>
                  ))}
                  {lockedL.length>0&&(
                    <>
                      <div onClick={()=>setShowLockedSection(!showLockedSection)}
                        style={{display:"flex",alignItems:"center",padding:"13px 22px",cursor:"pointer",background:T.card2,borderBottom:`1px solid ${T.border}`,gap:12}}>
                        <div style={{width:38,height:38,borderRadius:12,background:"rgba(239,68,68,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🔒</div>
                        <span style={{fontWeight:700,fontSize:13,color:T.muted,flex:1}}>Locked Chats ({lockedL.length})</span>
                        <span style={{color:T.muted,fontSize:11}}>{showLockedSection?"▲":"▼"}</span>
                      </div>
                      {showLockedSection&&lockedL.map(([chatId],idx)=>(
                        <div key={chatId} onClick={()=>handleChatClick(contacts[chatId])}
                          style={{display:"flex",alignItems:"center",padding:"15px 22px",cursor:"pointer",gap:14,background:T.bg,borderBottom:`1px solid ${T.border}`,animation:`slideUp 0.2s ${idx*0.03}s ease both`}}>
                          <div style={{width:52,height:52,borderRadius:17,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🔒</div>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:700,fontSize:15,color:T.muted}}>••••••••</div>
                            <div style={{fontSize:13,color:T.muted,marginTop:3}}>Tap to unlock</div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* UPDATES */}
          {currentView==="updates"&&(
            <div style={{animation:"fadeIn 0.25s ease"}}>
              <div style={{padding:"16px 18px",borderBottom:`1px solid ${T.border}`}}>
                <div onClick={()=>setShowAddStatus(!showAddStatus)}
                  style={{display:"flex",alignItems:"center",gap:14,cursor:"pointer",padding:"6px 0"}}>
                  <div style={{width:56,height:56,borderRadius:18,background:myStatuses.length>0?T.grad:T.card2,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:19,color:"#fff",border:myStatuses.length>0?`2px solid ${T.blue}`:`2px dashed ${T.border}`,flexShrink:0,overflow:"hidden"}}>
                    {profilePic?<img src={profilePic} alt="p" style={{width:56,height:56,objectFit:"cover"}} />:gi(user?.displayName)}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:15,color:T.text}}>My Update</div>
                    <div style={{fontSize:13,color:T.muted,marginTop:3}}>{myStatuses.length>0?timeAgo(myStatuses[0].timestamp):"Tap to share an update"}</div>
                  </div>
                  <div style={{width:34,height:34,borderRadius:11,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:"#fff",boxShadow:T.shadow}}>+</div>
                </div>
                {showAddStatus&&(
                  <div style={{marginTop:14,padding:16,background:T.card2,borderRadius:18,border:`1px solid ${T.border}`,animation:"slideDown 0.2s ease"}}>
                    <input value={statusText} onChange={e=>setStatusText(e.target.value)} placeholder="What's on your mind?"
                      style={{width:"100%",padding:"12px 16px",background:T.card,border:`1.5px solid ${T.border}`,borderRadius:14,color:T.text,fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:10,fontFamily:"'Inter',sans-serif",transition:"border 0.2s"}}
                      onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border} />
                    <div style={{display:"flex",gap:8}}>
                      <div onClick={()=>postStatus()} style={{flex:1,padding:"11px",background:T.grad,borderRadius:13,textAlign:"center",color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",boxShadow:T.shadow}}>Post Update ✓</div>
                      <div onClick={()=>statusFileRef.current?.click()} style={{padding:"11px 14px",background:T.card,borderRadius:13,color:T.text,cursor:"pointer",border:`1px solid ${T.border}`,fontSize:16}}>📷</div>
                      <div onClick={()=>setShowAddStatus(false)} style={{padding:"11px 14px",background:T.card,borderRadius:13,color:T.muted,cursor:"pointer",border:`1px solid ${T.border}`}}>✕</div>
                    </div>
                    <input type="file" accept="image/*" ref={statusFileRef} onChange={handleStatusImage} style={{display:"none"}} />
                  </div>
                )}
              </div>
              {othersStatuses.length>0&&<div style={{padding:"8px 22px 6px",fontSize:10,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5}}>Recent Updates</div>}
              {othersStatuses.map((s,i)=>(
                <div key={i} onClick={()=>setViewingStatus(s)}
                  style={{display:"flex",alignItems:"center",padding:"14px 22px",gap:14,cursor:"pointer",borderBottom:`1px solid ${T.border}`,transition:"background 0.15s",animation:`slideUp 0.3s ${i*0.04}s ease both`}}
                  onMouseEnter={e=>e.currentTarget.style.background=T.card}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                >
                  <div style={{width:56,height:56,borderRadius:18,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:19,color:"#fff",border:`2.5px solid ${T.blue}`,flexShrink:0}}>
                    {gi(s.name)}
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:15,color:T.text}}>{s.name}</div>
                    <div style={{fontSize:12,color:T.muted,marginTop:3}}>{timeAgo(s.timestamp)}</div>
                  </div>
                </div>
              ))}
              {statuses.length===0&&(
                <div style={{textAlign:"center",marginTop:70,color:T.muted}}>
                  <div style={{fontSize:56,marginBottom:14,opacity:0.5}}>✨</div>
                  <div style={{fontSize:16,fontWeight:700,color:T.text,fontFamily:"'Poppins',sans-serif"}}>No updates yet</div>
                  <div style={{fontSize:13,marginTop:6}}>Be the first to share an update!</div>
                </div>
              )}
            </div>
          )}

          {/* CALLS */}
          {currentView==="calls"&&(
            <div style={{animation:"fadeIn 0.25s ease"}}>
              <div style={{display:"flex",padding:"4px 14px",background:T.card,borderBottom:`1px solid ${T.border}`,gap:2}}>
                {["all","missed","incoming","outgoing"].map(f=>(
                  <div key={f} onClick={()=>setCallFilter(f)}
                    style={{padding:"11px 12px",cursor:"pointer",fontSize:11,fontWeight:700,
                      color:callFilter===f?T.blue:"rgba(100,116,139,0.6)",
                      borderBottom:callFilter===f?`2.5px solid ${T.blue}`:"2.5px solid transparent",
                      transition:"all 0.2s",textTransform:"capitalize",letterSpacing:0.3}}>
                    {f==="missed"?"📵":f==="incoming"?"📞":f==="outgoing"?"📲":"All"} {f!=="all"?f.charAt(0).toUpperCase()+f.slice(1):""}
                  </div>
                ))}
              </div>
              {filteredCalls.length===0?(
                <div style={{textAlign:"center",marginTop:70,color:T.muted}}>
                  <div style={{fontSize:56,marginBottom:14,opacity:0.5}}>📞</div>
                  <div style={{fontSize:16,fontWeight:700,color:T.text,fontFamily:"'Poppins',sans-serif"}}>No calls yet</div>
                </div>
              ):filteredCalls.map((call,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",padding:"14px 22px",gap:14,borderBottom:`1px solid ${T.border}`,animation:`slideUp 0.3s ${i*0.03}s ease both`}}>
                  <div style={{width:50,height:50,borderRadius:16,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:17,color:"#fff",flexShrink:0}}>
                    {gi(call.name)}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:15,color:T.text}}>{call.name}</div>
                    <div style={{fontSize:12,fontWeight:600,marginTop:3,color:call.status==="missed"?"#EF4444":call.direction==="incoming"?T.blue:T.purple}}>
                      {call.status==="missed"?"📵 Missed":call.direction==="incoming"?`📞 Incoming · ${call.type}`:`📲 Outgoing · ${call.type}`}
                    </div>
                    <div style={{fontSize:10,color:T.muted,marginTop:2}}>{fCT(call.timestamp)}</div>
                  </div>
                  {call.duration>0&&<div style={{fontSize:11,color:T.muted,fontWeight:500}}>⏱ {fDur(call.duration)}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{padding:"12px 18px",background:T.card,borderTop:`1px solid ${T.border}`,textAlign:"center"}}>
          <div style={{fontSize:10,color:T.muted,lineHeight:1.7,fontFamily:"'Inter',sans-serif"}}>
            <span style={{fontWeight:800,background:T.grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Khan Chats</span>
            {" "}· Independent Messaging Platform<br/>
            <span style={{opacity:0.7}}>Not affiliated with WhatsApp or Meta.</span>
          </div>
        </div>
      </div>

      {/* CHAT PANEL */}
      {activeChat?(
        <div style={{flex:1,display:"flex",flexDirection:"column",background:T.bg,animation:"fadeIn 0.3s ease"}}>
          <div style={{display:"flex",alignItems:"center",padding:"16px 22px",background:T.card,gap:14,borderBottom:`1px solid ${T.border}`,boxShadow:"0 2px 12px rgba(0,0,0,0.15)"}}>
            <div style={{width:46,height:46,borderRadius:15,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:17,color:"#fff",boxShadow:"0 2px 10px rgba(59,130,246,0.3)"}}>
              {gi(activeChat.name)}
            </div>
            <div style={{flex:1}}>
              <div style={{fontWeight:800,fontSize:16,color:T.text,letterSpacing:"-0.2px",fontFamily:"'Poppins',sans-serif"}}>{activeChat.name}</div>
              <div style={{fontSize:11,color:T.blue,fontWeight:600,marginTop:2}}>● Online</div>
            </div>
            <div style={{display:"flex",gap:8}}>
              {[["📞","Audio",()=>startCall("audio")],["📹","Video",()=>startCall("video")]].map(([icon,title,fn])=>(
                <div key={title} onClick={fn} title={`${title} Call`} style={{width:40,height:40,borderRadius:13,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:18,border:`1px solid ${T.border}`,transition:"all 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=T.grad}
                  onMouseLeave={e=>e.currentTarget.style.background=T.card2}>
                  {icon}
                </div>
              ))}
            </div>
          </div>

          <div style={{flex:1,overflowY:"auto",padding:"22px 6%",display:"flex",flexDirection:"column",gap:6}}>
            {messages.length===0&&(
              <div style={{textAlign:"center",marginTop:80,color:T.muted}}>
                <div style={{fontSize:56,marginBottom:18,opacity:0.5}}>👋</div>
                <div style={{fontSize:17,fontWeight:700,color:T.text,fontFamily:"'Poppins',sans-serif"}}>Say hello to {activeChat.name}!</div>
                <div style={{fontSize:13,marginTop:6}}>Start the conversation</div>
              </div>
            )}
            {messages.map((msg,i)=>{
              const isMine=msg.senderUid===user.uid;
              return(
                <div key={i} style={{display:"flex",justifyContent:isMine?"flex-end":"flex-start",marginBottom:2,animation:`slideUp 0.2s ease`}}>
                  <div style={{maxWidth:"68%",
                    padding:msg.image?"7px 7px 6px":"11px 17px 9px",
                    background:isMine?T.grad:T.card,
                    borderRadius:isMine?"20px 20px 5px 20px":"20px 20px 20px 5px",
                    boxShadow:isMine?"0 3px 16px rgba(59,130,246,0.25)":"0 2px 10px rgba(0,0,0,0.2)",
                    border:isMine?"none":`1px solid ${T.border}`}}>
                    {!isMine&&<div style={{fontSize:11,color:T.blue,fontWeight:700,marginBottom:5,letterSpacing:0.2}}>{msg.senderName}</div>}
                    {msg.image&&<img src={msg.image} alt="s" onClick={()=>setPreviewImg(msg.image)} style={{maxWidth:240,maxHeight:240,borderRadius:14,display:"block",cursor:"zoom-in",objectFit:"cover"}} />}
                    {msg.text&&<p style={{margin:msg.image?"7px 8px 0":0,fontSize:15,lineHeight:1.65,color:T.text,wordBreak:"break-word",whiteSpace:"pre-wrap"}}>{msg.text}</p>}
                    <div style={{display:"flex",justifyContent:"flex-end",gap:4,marginTop:5,paddingRight:msg.image?6:0,alignItems:"center"}}>
                      <span style={{fontSize:10,color:isMine?"rgba(255,255,255,0.55)":T.muted,fontWeight:500}}>{ft(msg.timestamp)}</span>
                      {isMine&&<span style={{fontSize:11,color:"rgba(255,255,255,0.7)"}}>✓✓</span>}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div style={{display:"flex",alignItems:"center",gap:10,padding:"14px 18px",background:T.card,borderTop:`1px solid ${T.border}`}}>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImage} style={{display:"none"}} />
            <div style={{display:"flex",alignItems:"center",background:T.card2,borderRadius:28,flex:1,padding:"11px 18px",gap:10,border:`1.5px solid ${T.border}`,transition:"border 0.2s"}}
              onFocus={()=>{}} >
              <input value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendMessage()}
                placeholder="Type a message..."
                style={{flex:1,background:"none",border:"none",outline:"none",color:T.text,fontSize:15,fontFamily:"'Inter',sans-serif"}} />
              <div onClick={()=>fileInputRef.current?.click()} style={{cursor:"pointer",fontSize:19,opacity:0.5,transition:"opacity 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.opacity=1}
                onMouseLeave={e=>e.currentTarget.style.opacity=0.5}>📷</div>
            </div>
            <div onClick={()=>sendMessage()} style={{width:52,height:52,borderRadius:18,background:input.trim()?T.grad:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:20,border:`1px solid ${T.border}`,boxShadow:input.trim()?T.shadow:"none",transition:"all 0.2s"}}>
              {input.trim()?"➤":"🎤"}
            </div>
          </div>
        </div>
      ):(
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:T.bg,gap:22,padding:36,animation:"fadeIn 0.4s ease"}}>
          <div style={{width:108,height:108,borderRadius:32,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:52,boxShadow:`0 16px 48px rgba(59,130,246,0.35), 0 0 80px rgba(124,58,237,0.2)`,animation:"pulse 3s infinite"}}>💬</div>
          <div style={{textAlign:"center"}}>
            <h2 style={{color:T.text,fontWeight:900,fontSize:34,margin:"0 0 8px",letterSpacing:"-0.8px",fontFamily:"'Poppins',sans-serif"}}>Khan Chats</h2>
            <p style={{color:T.muted,fontSize:14,maxWidth:340,lineHeight:1.8,margin:0}}>
              Your premium messaging experience.<br/>Select a conversation or start a new one.
            </p>
          </div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center"}}>
            <div onClick={()=>setShowNewChat(true)} style={{padding:"13px 26px",background:T.grad,borderRadius:18,color:"#fff",fontWeight:700,cursor:"pointer",boxShadow:T.shadow,fontSize:14,letterSpacing:0.3}}>
              ➕ New Chat
            </div>
            <div onClick={generateInvite} style={{padding:"13px 26px",background:T.card,borderRadius:18,color:T.text,fontWeight:700,cursor:"pointer",border:`1px solid ${T.border}`,fontSize:14,letterSpacing:0.3}}>
              🔗 Invite Friends
            </div>
          </div>
          <p style={{color:T.muted,fontSize:11,textAlign:"center",lineHeight:1.7,maxWidth:300,marginTop:8}}>
            Independent Messaging Platform<br/>Not affiliated with WhatsApp or Meta.
          </p>
        </div>
      )}

      <style>{`
        ${FONTS}
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 4px; }
        input::placeholder { color: ${T.muted}; font-family: 'Inter', sans-serif; }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
        @keyframes pulse { 0%,100% { box-shadow: 0 16px 48px rgba(59,130,246,0.35), 0 0 80px rgba(124,58,237,0.2); } 50% { box-shadow: 0 16px 60px rgba(59,130,246,0.5), 0 0 100px rgba(124,58,237,0.35); } }
        @keyframes ringPulse { 0%,100% { transform:scale(1); opacity:0.3; } 50% { transform:scale(1.1); opacity:0; } }
        @keyframes loadDot { 0%,80%,100% { transform:scale(0.6); opacity:0.4; } 40% { transform:scale(1.2); opacity:1; } }
      `}</style>
    </div>
  );
}
