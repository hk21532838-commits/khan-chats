import { useState, useEffect, useRef, useCallback } from "react";
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
  bg:"#0A0F1E", card:"#111827", card2:"#1A2332", card3:"#1F2D40",
  blue:"#3B82F6", purple:"#7C3AED", pink:"#EC4899", cyan:"#06B6D4",
  text:"#F1F5F9", muted:"#64748B", mutedLight:"#94A3B8", border:"#1E2D42",
  grad:"linear-gradient(135deg,#3B82F6 0%,#7C3AED 100%)",
  gradSent:"linear-gradient(135deg,#1D4ED8 0%,#5B21B6 100%)",
  gradDanger:"linear-gradient(135deg,#EF4444 0%,#B91C1C 100%)",
  gradSuccess:"linear-gradient(135deg,#10B981 0%,#059669 100%)",
  gradPink:"linear-gradient(135deg,#EC4899 0%,#7C3AED 100%)",
  shadow:"0 4px 24px rgba(59,130,246,0.2)",
  shadowLg:"0 8px 40px rgba(59,130,246,0.25)",
  shadowCard:"0 2px 20px rgba(0,0,0,0.35)",
};

const GFONTS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@400;500;600;700;800;900&display=swap');`;

const LANGS = ["English","Urdu","Arabic","Hindi","Spanish","French","German","Chinese","Japanese","Korean","Portuguese","Russian","Turkish","Italian","Dutch","Polish","Swedish","Norwegian","Danish","Finnish","Greek","Hebrew","Persian","Bengali","Punjabi","Sindhi","Pashto","Swahili","Malay","Indonesian","Thai","Vietnamese","Romanian","Hungarian","Czech","Slovak","Bulgarian","Croatian","Serbian","Ukrainian","Azerbaijani","Georgian","Armenian","Kazakh","Uzbek","Mongolian","Nepali","Sinhala","Burmese","Khmer","Amharic","Somali","Yoruba","Igbo","Hausa","Zulu","Xhosa","Afrikaans","Welsh","Irish","Basque","Galician","Maltese","Icelandic"];

const ft=(ts)=>{ if(!ts)return""; return new Date(ts).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}); };
const gi=(n)=>{ if(!n)return"?"; return n.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2); };
const cfn=(n)=>{ const c=["#3B82F6","#7C3AED","#0EA5E9","#8B5CF6","#6366F1","#2563EB","#EC4899","#0891B2"]; if(!n)return c[0]; let s=0; for(let ch of n)s+=ch.charCodeAt(0); return c[s%c.length]; };
const gid=(a,b)=>[a,b].sort().join("_");
const tAgo=(ts)=>{ const d=Date.now()-ts,m=Math.floor(d/60000); if(m<1)return"Just now"; if(m<60)return`${m}m ago`; const h=Math.floor(m/60); if(h<24)return`${h}h ago`; return"Expired"; };
const fD=(s)=>{ if(!s)return"0:00"; return`${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`; };
const fCT=(ts)=>{ if(!ts)return""; return new Date(ts).toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}); };

export default function App() {
  const [user,setUser]=useState(null);
  const [loading,setLoading]=useState(true);
  const [screen,setScreen]=useState("login");
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [dname,setDname]=useState("");
  const [authErr,setAuthErr]=useState("");
  const [authLoad,setAuthLoad]=useState(false);
  const [contacts,setContacts]=useState({});
  const [unread,setUnread]=useState({});
  const [pins,setPins]=useState([]);
  const [locks,setLocks]=useState({});
  const [unlocked,setUnlocked]=useState([]);
  const [lockModal,setLockModal]=useState(null);
  const [unlockModal,setUnlockModal]=useState(null);
  const [lockPin,setLockPin]=useState("");
  const [unlockPin,setUnlockPin]=useState("");
  const [lockErr,setLockErr]=useState("");
  const [showLocked,setShowLocked]=useState(false);
  const [activeChat,setActiveChat]=useState(null);
  const [msgs,setMsgs]=useState([]);
  const [input,setInput]=useState("");
  const [typing,setTyping]=useState(false);
  const [newEmail,setNewEmail]=useState("");
  const [newEmailErr,setNewEmailErr]=useState("");
  const [showNew,setShowNew]=useState(false);
  const [notifs,setNotifs]=useState([]);
  const [previewImg,setPreviewImg]=useState(null);
  const [showInvite,setShowInvite]=useState(false);
  const [invLink,setInvLink]=useState("");
  const [copied,setCopied]=useState(false);
  const [inCall,setInCall]=useState(false);
  const [callType,setCallType]=useState(null);
  const [nav,setNav]=useState("home");
  const [view,setView]=useState("messages");
  const [statuses,setStatuses]=useState([]);
  const [sText,setSText]=useState("");
  const [showAddS,setShowAddS]=useState(false);
  const [viewS,setViewS]=useState(null);
  const [calls,setCalls]=useState([]);
  const [callF,setCallF]=useState("all");
  const [callStart,setCallStart]=useState(null);
  const [showSett,setShowSett]=useState(false);
  const [settTab,setSettTab]=useState("profile");
  const [pic,setPic]=useState(null);
  const [bio,setBio]=useState("");
  const [uname,setUname]=useState("");
  const [newName,setNewName]=useState("");
  const [lang,setLang]=useState("English");
  const [langQ,setLangQ]=useState("");
  const [darkMode,setDarkMode]=useState(true);
  const [notifSettings,setNotifSettings]=useState({msgs:true,updates:true,calls:true});
  const [searchQ,setSearchQ]=useState("");
  const [showSearch,setShowSearch]=useState(false);
  const [aiIn,setAiIn]=useState("");
  const [aiMsgs,setAiMsgs]=useState([]);
  const [aiLoad,setAiLoad]=useState(false);
  const [showPolicy,setShowPolicy]=useState(null);
  const [showLogoutConfirm,setShowLogoutConfirm]=useState(false);
  const [showDeleteConfirm,setShowDeleteConfirm]=useState(false);
  const [emojiPicker,setEmojiPicker]=useState(false);
  const endRef=useRef(null);
  const fileRef=useRef(null);
  const sFRef=useRef(null);
  const picRef=useRef(null);
  const notifRef=useRef(0);
  const acRef=useRef(null);
  const lvRef=useRef(null);
  const rvRef=useRef(null);
  const pcRef=useRef(null);
  const lsRef=useRef(null);
  const typingTimer=useRef(null);

  useEffect(()=>{acRef.current=activeChat;},[activeChat]);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  useEffect(()=>{
    const unsub=onAuthStateChanged(auth,async(u)=>{
      if(u){
        setUser(u);setScreen("chat");setNewName(u.displayName||"");
        await set(ref(db,`users/${u.uid}`),{uid:u.uid,name:u.displayName||u.email.split("@")[0],email:u.email,online:true,lastSeen:serverTimestamp()});
        loadAll(u);
      } else {setUser(null);setScreen("login");}
      setLoading(false);
    });
    return ()=>unsub();
  },[]);

  const loadAll=(u)=>{
    onValue(ref(db,`userChats/${u.uid}`),async(snap)=>{
      const data=snap.val()||{},map={},ur={};
      for(const chatId of Object.keys(data)){
        const s=await get(ref(db,`users/${data[chatId].with}`));
        if(s.exists()){
          map[chatId]={...s.val(),chatId,lastMsg:data[chatId].lastMsg||"",lastTime:data[chatId].lastTime||0};
          ur[chatId]=data[chatId].unread||0;
        }
      }
      setContacts(map);setUnread(ur);
    });
    onValue(ref(db,"statuses"),(snap)=>{
      setStatuses(Object.values(snap.val()||{}).filter(s=>Date.now()-s.timestamp<86400000).sort((a,b)=>b.timestamp-a.timestamp));
    });
    onValue(ref(db,`callHistory/${u.uid}`),(snap)=>{
      setCalls(Object.values(snap.val()||{}).sort((a,b)=>b.timestamp-a.timestamp));
    });
    onValue(ref(db,`pins/${u.uid}`),(snap)=>{setPins(snap.val()||[]);});
    onValue(ref(db,`profilePics/${u.uid}`),(snap)=>{if(snap.val())setPic(snap.val());});
    onValue(ref(db,`lockedChats/${u.uid}`),(snap)=>{setLocks(snap.val()||{});});
    onValue(ref(db,`userBio/${u.uid}`),(snap)=>{if(snap.val())setBio(snap.val());});
    onValue(ref(db,`usernames/${u.uid}`),(snap)=>{if(snap.val())setUname(snap.val());});
  };

  const saveCall=(u,d)=>{push(ref(db,`callHistory/${u.uid}`),{...d,timestamp:Date.now()});};
  const togglePin=async(id)=>{ const p=pins.includes(id)?pins.filter(x=>x!==id):[...pins,id]; await set(ref(db,`pins/${user.uid}`),p); };
  const savePic=async(img)=>{await set(ref(db,`profilePics/${user.uid}`),img);setPic(img);};
  const saveProfile=async()=>{
    if(!newName.trim())return;
    await updateProfile(auth.currentUser,{displayName:newName.trim()});
    await set(ref(db,`users/${user.uid}/name`),newName.trim());
    if(bio)await set(ref(db,`userBio/${user.uid}`),bio);
    if(uname)await set(ref(db,`usernames/${user.uid}`),uname);
    setUser({...user,displayName:newName.trim()});
    alert("Profile updated! ✅");
  };
  const handlePic=(e)=>{
    const f=e.target.files[0];if(!f)return;
    if(f.size>500000){alert("Max 500KB");return;}
    const r=new FileReader();r.onload=ev=>savePic(ev.target.result);r.readAsDataURL(f);e.target.value="";
  };
  const lockChat=async(id)=>{
    if(lockPin.length<4){setLockErr("4+ digits required");return;}
    await set(ref(db,`lockedChats/${user.uid}`),{...locks,[id]:lockPin});
    setLockPin("");setLockModal(null);setLockErr("");
  };
  const unlockChat=(id)=>{
    if(unlockPin===locks[id]){setUnlocked(p=>[...p,id]);setUnlockPin("");setUnlockModal(null);setLockErr("");}
    else setLockErr("Wrong PIN!");
  };
  const removeLock=async(id)=>{
    const n={...locks};delete n[id];
    await set(ref(db,`lockedChats/${user.uid}`),n);
    setUnlocked(p=>p.filter(x=>x!==id));
  };
  const handleChatClick=(c)=>{
    const{chatId}=c;
    if(locks[chatId]&&!unlocked.includes(chatId)){setUnlockModal(chatId);setUnlockPin("");setLockErr("");}
    else openChat(c);
  };
  const askAI=async()=>{
    if(!aiIn.trim())return;
    const um={role:"user",text:aiIn.trim()};
    setAiMsgs(p=>[...p,um]);setAiIn("");setAiLoad(true);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,
          system:"You are Khan AI, a helpful assistant for Khan Chats by Hamza Khan. Be friendly and concise.",
          messages:[...aiMsgs.map(m=>({role:m.role,content:m.text})),{role:"user",content:aiIn.trim()}]})
      });
      const data=await res.json();
      setAiMsgs(p=>[...p,{role:"assistant",text:data.content?.[0]?.text||"Sorry, try again."}]);
    }catch{setAiMsgs(p=>[...p,{role:"assistant",text:"Connection error."}]);}
    setAiLoad(false);
  };
  const register=async()=>{
    if(!dname.trim()){setAuthErr("Enter your name");return;}
    setAuthLoad(true);setAuthErr("");
    try{const c=await createUserWithEmailAndPassword(auth,email,pass);await updateProfile(c.user,{displayName:dname.trim()});}
    catch(e){setAuthErr(e.message.includes("email-already")?"Email already registered":e.message.includes("weak")?"Password needs 6+ chars":"Something went wrong");}
    setAuthLoad(false);
  };
  const login=async()=>{
    setAuthLoad(true);setAuthErr("");
    try{await signInWithEmailAndPassword(auth,email,pass);}
    catch{setAuthErr("Incorrect email or password");}
    setAuthLoad(false);
  };
  const logout=async()=>{
    if(user)await set(ref(db,`users/${user.uid}/online`),false);
    await signOut(auth);setActiveChat(null);setMsgs([]);setContacts({});setShowLogoutConfirm(false);
  };
  const startChat=async()=>{
    setNewEmailErr("");
    if(!newEmail.trim()){setNewEmailErr("Enter an email");return;}
    if(newEmail.trim()===user.email){setNewEmailErr("Can't message yourself!");return;}
    const snap=await get(ref(db,"users"));
    const found=Object.values(snap.val()||{}).find(u=>u.email===newEmail.trim());
    if(!found){setNewEmailErr("User not found. Send an invite!");return;}
    const chatId=gid(user.uid,found.uid);
    await set(ref(db,`userChats/${user.uid}/${chatId}`),{with:found.uid,lastMsg:"",lastTime:serverTimestamp(),unread:0});
    await set(ref(db,`userChats/${found.uid}/${chatId}`),{with:user.uid,lastMsg:"",lastTime:serverTimestamp(),unread:0});
    setNewEmail("");setShowNew(false);openChat({...found,chatId});
  };
  const openChat=(c)=>{
    setActiveChat(c);setNav("chat");
    set(ref(db,`userChats/${user.uid}/${c.chatId}/unread`),0);
    setUnread(p=>({...p,[c.chatId]:0}));
    off(ref(db,`chats/${c.chatId}/messages`));
    onValue(ref(db,`chats/${c.chatId}/messages`),(snap)=>{
      setMsgs(Object.values(snap.val()||{}).sort((a,b)=>a.timestamp-b.timestamp));
    });
    onValue(ref(db,`chats/${c.chatId}/typing`),(snap)=>{
      const td=snap.val()||{};
      setTyping(Object.keys(td).some(uid=>uid!==user?.uid&&td[uid]));
    });
  };
  const sendMsg=async(imgData=null)=>{
    if(!activeChat||(!input.trim()&&!imgData))return;
    const msg={text:imgData?"":input.trim(),image:imgData||null,senderUid:user.uid,senderName:user.displayName||user.email,timestamp:Date.now()};
    await push(ref(db,`chats/${activeChat.chatId}/messages`),msg);
    const last=imgData?"📷 Photo":input.trim();
    const cu=activeChat.uid;
    await set(ref(db,`userChats/${user.uid}/${activeChat.chatId}/lastMsg`),last);
    await set(ref(db,`userChats/${cu}/${activeChat.chatId}/lastMsg`),last);
    await set(ref(db,`userChats/${user.uid}/${activeChat.chatId}/lastTime`),serverTimestamp());
    await set(ref(db,`userChats/${cu}/${activeChat.chatId}/lastTime`),serverTimestamp());
    const curUnread=unread[activeChat.chatId]||0;
    await set(ref(db,`userChats/${cu}/${activeChat.chatId}/unread`),curUnread+1);
    set(ref(db,`chats/${activeChat.chatId}/typing/${user.uid}`),null);
    setInput("");
  };
  const handleTyping=(v)=>{
    setInput(v);
    if(!activeChat)return;
    set(ref(db,`chats/${activeChat.chatId}/typing/${user.uid}`),true);
    clearTimeout(typingTimer.current);
    typingTimer.current=setTimeout(()=>{
      set(ref(db,`chats/${activeChat.chatId}/typing/${user.uid}`),null);
    },2000);
  };
  const handleImg=(e)=>{
    const f=e.target.files[0];if(!f)return;
    if(f.size>500000){alert("Max 500KB");return;}
    const r=new FileReader();r.onload=ev=>sendMsg(ev.target.result);r.readAsDataURL(f);e.target.value="";
  };
  const postS=async(imgData=null)=>{
    if(!sText.trim()&&!imgData)return;
    await push(ref(db,"statuses"),{uid:user.uid,name:user.displayName||user.email,text:sText.trim(),image:imgData||null,timestamp:Date.now()});
    setSText("");setShowAddS(false);
  };
  const handleSImg=(e)=>{
    const f=e.target.files[0];if(!f)return;
    if(f.size>500000){alert("Max 500KB");return;}
    const r=new FileReader();r.onload=ev=>postS(ev.target.result);r.readAsDataURL(f);e.target.value="";
  };
  const genInvite=()=>{setInvLink(`${window.location.origin}?invite=${btoa(user.email)}`);setShowInvite(true);};
  const copyLink=()=>{navigator.clipboard.writeText(invLink).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});};
  const startCall=async(type)=>{
    if(!activeChat)return;
    setCallType(type);setInCall(true);setCallStart(Date.now());
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:type==="video",audio:true});
      lsRef.current=stream;
      if(lvRef.current)lvRef.current.srcObject=stream;
      const pc=new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"}]});
      pcRef.current=pc;
      stream.getTracks().forEach(t=>pc.addTrack(t,stream));
      pc.ontrack=(e)=>{if(rvRef.current)rvRef.current.srcObject=e.streams[0];};
      const offer=await pc.createOffer();await pc.setLocalDescription(offer);
      await set(ref(db,`calls/${activeChat.chatId}`),{offer:JSON.stringify(offer),caller:user.uid,callerName:user.displayName,type,timestamp:Date.now()});
      onValue(ref(db,`calls/${activeChat.chatId}/answer`),async(snap)=>{if(snap.val()&&pc.signalingState!=="stable")await pc.setRemoteDescription(JSON.parse(snap.val()));});
      pc.onicecandidate=(e)=>{if(e.candidate)push(ref(db,`calls/${activeChat.chatId}/callerCandidates`),JSON.stringify(e.candidate));};
      saveCall(user,{name:activeChat.name,type,direction:"outgoing",status:"completed",duration:0});
    }catch(err){alert("Camera/Mic denied: "+err.message);setInCall(false);}
  };
  const endCall=()=>{
    if(lsRef.current)lsRef.current.getTracks().forEach(t=>t.stop());
    if(pcRef.current)pcRef.current.close();
    set(ref(db,`calls/${activeChat?.chatId}`),null);
    setInCall(false);setCallType(null);setCallStart(null);
  };
  useEffect(()=>{
    if(!user||!activeChat)return;
    onValue(ref(db,`calls/${activeChat.chatId}`),async(snap)=>{
      const data=snap.val();
      if(data&&data.caller!==user.uid&&data.offer&&!inCall){
        if(window.confirm(`Incoming ${data.type==="video"?"Video":"Audio"} call from ${data.callerName}!`)){
          setCallType(data.type);setInCall(true);setCallStart(Date.now());
          try{
            const stream=await navigator.mediaDevices.getUserMedia({video:data.type==="video",audio:true});
            lsRef.current=stream;
            if(lvRef.current)lvRef.current.srcObject=stream;
            const pc=new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"}]});
            pcRef.current=pc;
            stream.getTracks().forEach(t=>pc.addTrack(t,stream));
            pc.ontrack=(e)=>{if(rvRef.current)rvRef.current.srcObject=e.streams[0];};
            await pc.setRemoteDescription(JSON.parse(data.offer));
            const ans=await pc.createAnswer();await pc.setLocalDescription(ans);
            await set(ref(db,`calls/${activeChat.chatId}/answer`),JSON.stringify(ans));
            pc.onicecandidate=(e)=>{if(e.candidate)push(ref(db,`calls/${activeChat.chatId}/calleeCandidates`),JSON.stringify(e.candidate));};
            saveCall(user,{name:data.callerName,type:data.type,direction:"incoming",status:"completed",duration:0});
          }catch(err){alert("Call failed");setInCall(false);}
        }else{saveCall(user,{name:data.callerName,type:data.type,direction:"incoming",status:"missed",duration:0});}
      }
    });
  },[user,activeChat]);

  const totalUnread=Object.values(unread).reduce((a,b)=>a+b,0);
  const myStatuses=statuses.filter(s=>s.uid===user?.uid);
  const othersStatuses=statuses.filter(s=>s.uid!==user?.uid);
  const allC=Object.entries(contacts);
  const unlockedC=allC.filter(([id])=>!locks[id]||unlocked.includes(id));
  const lockedC=allC.filter(([id])=>locks[id]&&!unlocked.includes(id));
  const sortedC=unlockedC.sort(([a],[b])=>(pins.includes(a)?0:1)-(pins.includes(b)?0:1));
  const filteredC=searchQ?sortedC.filter(([,c])=>c.name?.toLowerCase().includes(searchQ.toLowerCase())||c.email?.toLowerCase().includes(searchQ.toLowerCase())):sortedC;
  const filteredCalls=calls.filter(c=>{
    if(callF==="missed")return c.status==="missed";
    if(callF==="incoming")return c.direction==="incoming";
    if(callF==="outgoing")return c.direction==="outgoing";
    return true;
  });

  const emojis=["😀","😂","❤️","👍","🔥","😍","🎉","👏","😎","🙌","💯","✨","🎊","😊","🥰","😘","🤩","💪","🙏","😅","🤔","👋","🎯","💡","⭐","🌟","🚀","💬","📱","🎮"];

  const Modal=({children,onClose})=>(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:400,animation:"slideUp 0.3s ease"}}>
        {children}
      </div>
    </div>
  );

  const Card=({children,style={}})=>(
    <div style={{background:T.card,borderRadius:24,border:`1px solid ${T.border}`,boxShadow:T.shadowCard,...style}}>{children}</div>
  );

  const GBtn=({children,onClick,variant="primary",style={},small=false})=>(
    <div onClick={onClick} style={{padding:small?"10px 18px":"14px 24px",background:variant==="danger"?T.gradDanger:variant==="success"?T.gradSuccess:variant==="ghost"?T.card2:T.grad,borderRadius:small?12:16,color:"#fff",fontWeight:700,fontSize:small?13:15,cursor:"pointer",textAlign:"center",boxShadow:variant==="ghost"?"none":T.shadow,transition:"all 0.2s",userSelect:"none",...style}}>
      {children}
    </div>
  );

  // SPLASH
  if(loading) return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:T.bg,flexDirection:"column",gap:28,fontFamily:"'Poppins',sans-serif"}}>
      <style>{GFONTS}</style>
      <div style={{position:"relative"}}>
        <div style={{width:100,height:100,borderRadius:30,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:48,animation:"logoPulse 2s infinite",boxShadow:`0 0 60px rgba(59,130,246,0.6),0 0 120px rgba(124,58,237,0.3)`}}>💬</div>
        <div style={{position:"absolute",inset:-8,borderRadius:38,border:"2px solid rgba(59,130,246,0.3)",animation:"ringPulse 2s infinite"}} />
        <div style={{position:"absolute",inset:-16,borderRadius:46,border:"1px solid rgba(124,58,237,0.15)",animation:"ringPulse 2s 0.3s infinite"}} />
      </div>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:32,fontWeight:900,background:T.grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:"-0.5px"}}>Khan Chats</div>
        <div style={{color:T.muted,fontSize:13,marginTop:6,fontWeight:500}}>Premium Messaging</div>
      </div>
      <div style={{display:"flex",gap:10}}>
        {[0,1,2].map(i=>(
          <div key={i} style={{width:9,height:9,borderRadius:"50%",background:T.grad,animation:`dotBounce 1.4s ${i*0.2}s infinite`}} />
        ))}
      </div>
    </div>
  );

  // AUTH
  if(screen==="login"||screen==="register") return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:T.bg,fontFamily:"'Poppins',sans-serif",padding:20,animation:"fadeIn 0.5s ease"}}>
      <style>{GFONTS}</style>
      <div style={{width:"100%",maxWidth:420}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{width:90,height:90,borderRadius:28,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:44,margin:"0 auto 22px",boxShadow:T.shadowLg,animation:"logoPulse 3s infinite"}}>💬</div>
          <h1 style={{color:T.text,fontWeight:900,fontSize:34,margin:0,letterSpacing:"-0.8px"}}>Khan Chats</h1>
          <p style={{color:T.muted,fontSize:14,margin:"10px 0 0",fontWeight:400}}>Your premium messaging experience</p>
        </div>
        <Card style={{padding:6,marginBottom:28}}>
          <div style={{display:"flex",borderRadius:20,overflow:"hidden"}}>
            {["login","register"].map(s=>(
              <div key={s} onClick={()=>{setScreen(s);setAuthErr("");}}
                style={{flex:1,textAlign:"center",padding:"14px",cursor:"pointer",fontWeight:700,fontSize:14,
                  background:screen===s?T.grad:"transparent",
                  color:screen===s?"#fff":T.muted,
                  borderRadius:18,margin:2,transition:"all 0.3s ease"}}>
                {s==="login"?"Sign In":"Sign Up"}
              </div>
            ))}
          </div>
        </Card>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {screen==="register"&&(
            <input value={dname} onChange={e=>setDname(e.target.value)} placeholder="Full name"
              style={{padding:"16px 20px",background:T.card,border:`1.5px solid ${T.border}`,borderRadius:18,color:T.text,fontSize:15,outline:"none",fontFamily:"'Inter',sans-serif",transition:"all 0.2s"}}
              onFocus={e=>{e.target.style.borderColor=T.blue;e.target.style.boxShadow=`0 0 0 3px rgba(59,130,246,0.1)`;}}
              onBlur={e=>{e.target.style.borderColor=T.border;e.target.style.boxShadow="none";}} />
          )}
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email"
            style={{padding:"16px 20px",background:T.card,border:`1.5px solid ${T.border}`,borderRadius:18,color:T.text,fontSize:15,outline:"none",fontFamily:"'Inter',sans-serif",transition:"all 0.2s"}}
            onFocus={e=>{e.target.style.borderColor=T.blue;e.target.style.boxShadow=`0 0 0 3px rgba(59,130,246,0.1)`;}}
            onBlur={e=>{e.target.style.borderColor=T.border;e.target.style.boxShadow="none";}} />
          <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password (6+ characters)" type="password"
            onKeyDown={e=>e.key==="Enter"&&(screen==="login"?login():register())}
            style={{padding:"16px 20px",background:T.card,border:`1.5px solid ${T.border}`,borderRadius:18,color:T.text,fontSize:15,outline:"none",fontFamily:"'Inter',sans-serif",transition:"all 0.2s"}}
            onFocus={e=>{e.target.style.borderColor=T.blue;e.target.style.boxShadow=`0 0 0 3px rgba(59,130,246,0.1)`;}}
            onBlur={e=>{e.target.style.borderColor=T.border;e.target.style.boxShadow="none";}} />
        </div>
        {authErr&&<div style={{color:"#EF4444",fontSize:13,margin:"14px 0",padding:"12px 18px",background:"rgba(239,68,68,0.08)",borderRadius:14,border:"1px solid rgba(239,68,68,0.2)",fontWeight:500}}>{authErr}</div>}
        <GBtn onClick={screen==="login"?login:register} style={{marginTop:18,fontSize:16,padding:"17px",borderRadius:20,boxShadow:T.shadowLg}}>
          {authLoad?"Please wait...":(screen==="login"?"Sign In →":"Create Account →")}
        </GBtn>
        <p style={{color:T.muted,fontSize:11,textAlign:"center",marginTop:28,lineHeight:1.8}}>
          Independent Messaging Platform · Not affiliated with WhatsApp or Meta<br/>
          <span onClick={()=>setShowPolicy("privacy")} style={{color:T.blue,cursor:"pointer",textDecoration:"underline"}}>Privacy Policy</span>
          {" · "}
          <span onClick={()=>setShowPolicy("terms")} style={{color:T.blue,cursor:"pointer",textDecoration:"underline"}}>Terms of Service</span>
        </p>
      </div>

      {/* Policy Modals */}
      {showPolicy&&(
        <Modal onClose={()=>setShowPolicy(null)}>
          <Card style={{padding:28,maxHeight:"80vh",overflowY:"auto"}}>
            <div style={{fontWeight:800,fontSize:20,color:T.text,marginBottom:16,fontFamily:"'Poppins',sans-serif"}}>
              {showPolicy==="privacy"?"🔒 Privacy Policy":"📋 Terms of Service"}
            </div>
            <div style={{color:T.mutedLight,fontSize:13,lineHeight:1.9}}>
              {showPolicy==="privacy"?(
                <>
                  <p><strong style={{color:T.text}}>Last updated: 2025</strong></p>
                  <p>Khan Chats is an independent messaging platform. We value your privacy and are committed to protecting your personal information.</p>
                  <p><strong style={{color:T.text}}>Data We Collect:</strong> Email address, display name, profile photo, and messages you send.</p>
                  <p><strong style={{color:T.text}}>How We Use Data:</strong> To provide messaging services, authenticate users, and improve the app.</p>
                  <p><strong style={{color:T.text}}>Data Security:</strong> Your data is stored securely using Firebase (Google) infrastructure.</p>
                  <p><strong style={{color:T.text}}>Your Rights:</strong> You can delete your account and all associated data at any time.</p>
                  <p><strong style={{color:T.text}}>Contact:</strong> For privacy concerns, contact us through the app settings.</p>
                </>
              ):(
                <>
                  <p><strong style={{color:T.text}}>Last updated: 2025</strong></p>
                  <p>By using Khan Chats, you agree to these terms. Please read them carefully.</p>
                  <p><strong style={{color:T.text}}>Acceptable Use:</strong> You agree to use Khan Chats only for lawful purposes and in a respectful manner.</p>
                  <p><strong style={{color:T.text}}>Account:</strong> You are responsible for maintaining the security of your account.</p>
                  <p><strong style={{color:T.text}}>Content:</strong> You retain ownership of content you create but grant us license to display it.</p>
                  <p><strong style={{color:T.text}}>Disclaimer:</strong> Khan Chats is not affiliated with WhatsApp, Meta, or any other company.</p>
                </>
              )}
            </div>
            <GBtn onClick={()=>setShowPolicy(null)} style={{marginTop:20}}>Close</GBtn>
          </Card>
        </Modal>
      )}
    </div>
  );

  // SETTINGS SCREEN
  if(showSett) return(
    <div style={{position:"fixed",inset:0,background:T.bg,zIndex:9999,display:"flex",flexDirection:"column",fontFamily:"'Poppins',sans-serif",color:T.text,animation:"slideUp 0.3s ease",overflowY:"auto"}}>
      <style>{GFONTS}</style>
      <div style={{display:"flex",alignItems:"center",padding:"18px 22px",background:T.card,gap:14,borderBottom:`1px solid ${T.border}`,position:"sticky",top:0,zIndex:10}}>
        <div onClick={()=>setShowSett(false)} style={{width:42,height:42,borderRadius:13,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:19,border:`1px solid ${T.border}`}}>←</div>
        <div style={{fontWeight:800,fontSize:21,flex:1,letterSpacing:"-0.3px"}}>Settings</div>
      </div>

      <div style={{display:"flex",background:T.card,borderBottom:`1px solid ${T.border}`,overflowX:"auto",padding:"0 8px",position:"sticky",top:78,zIndex:9}}>
        {[["profile","👤","Profile"],["privacy","🔒","Privacy"],["notifs","🔔","Notifs"],["language","🌐","Language"],["ai","🤖","Khan AI"],["legal","📋","Legal"]].map(([tab,icon,label])=>(
          <div key={tab} onClick={()=>setSettTab(tab)}
            style={{padding:"13px 16px",cursor:"pointer",fontSize:11,fontWeight:700,whiteSpace:"nowrap",
              color:settTab===tab?T.blue:T.muted,
              borderBottom:settTab===tab?`2.5px solid ${T.blue}`:"2.5px solid transparent",
              transition:"all 0.2s",letterSpacing:0.5}}>
            {icon} {label}
          </div>
        ))}
      </div>

      <div style={{flex:1,padding:20,display:"flex",flexDirection:"column",gap:16,maxWidth:600,margin:"0 auto",width:"100%"}}>

        {/* PROFILE TAB */}
        {settTab==="profile"&&(
          <div style={{animation:"slideUp 0.3s ease"}}>
            <div style={{background:T.grad,borderRadius:28,padding:32,textAlign:"center",marginBottom:20,boxShadow:T.shadowLg,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.05)"}} />
              <div style={{position:"relative",display:"inline-block",marginBottom:16}}>
                {pic?(
                  <img src={pic} alt="p" style={{width:100,height:100,borderRadius:"50%",objectFit:"cover",border:"3px solid rgba(255,255,255,0.4)",boxShadow:"0 4px 20px rgba(0,0,0,0.3)"}} />
                ):(
                  <div style={{width:100,height:100,borderRadius:"50%",background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:36,color:"#fff",border:"3px solid rgba(255,255,255,0.3)",margin:"0 auto",backdropFilter:"blur(8px)"}}>
                    {gi(user?.displayName)}
                  </div>
                )}
                <div onClick={()=>picRef.current?.click()} style={{position:"absolute",bottom:2,right:2,background:"#fff",borderRadius:"50%",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:15,boxShadow:"0 2px 12px rgba(0,0,0,0.25)"}}>📷</div>
              </div>
              <div style={{color:"#fff",fontWeight:800,fontSize:22,letterSpacing:"-0.3px"}}>{user?.displayName}</div>
              <div style={{color:"rgba(255,255,255,0.65)",fontSize:13,marginTop:4}}>{user?.email}</div>
              {uname&&<div style={{color:"rgba(255,255,255,0.5)",fontSize:12,marginTop:2}}>@{uname}</div>}
              <input type="file" accept="image/*" ref={picRef} onChange={handlePic} style={{display:"none"}} />
            </div>

            <Card style={{padding:22,marginBottom:14}}>
              <div style={{fontSize:11,color:T.blue,fontWeight:700,marginBottom:14,textTransform:"uppercase",letterSpacing:1.5}}>Edit Profile</div>
              {[["Display Name",newName,setNewName,"Your full name"],["Username",uname,setUname,"@username"],["Bio",bio,setBio,"About you..."]].map(([label,val,fn,ph])=>(
                <div key={label} style={{marginBottom:14}}>
                  <div style={{fontSize:12,color:T.mutedLight,fontWeight:600,marginBottom:6}}>{label}</div>
                  <input value={val} onChange={e=>fn(e.target.value)} placeholder={ph}
                    style={{width:"100%",padding:"13px 16px",background:T.card2,border:`1.5px solid ${T.border}`,borderRadius:14,color:T.text,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"'Inter',sans-serif",transition:"all 0.2s"}}
                    onFocus={e=>{e.target.style.borderColor=T.blue;e.target.style.boxShadow=`0 0 0 3px rgba(59,130,246,0.1)`;}}
                    onBlur={e=>{e.target.style.borderColor=T.border;e.target.style.boxShadow="none";}} />
                </div>
              ))}
              <GBtn onClick={saveProfile} style={{marginTop:4}}>Save Profile ✓</GBtn>
            </Card>

            <Card style={{padding:16,marginBottom:14}}>
              <div style={{fontSize:11,color:T.blue,fontWeight:700,marginBottom:12,textTransform:"uppercase",letterSpacing:1.5}}>Chat Locks (PIN)</div>
              {Object.entries(contacts).map(([chatId,contact])=>(
                <div key={chatId} style={{display:"flex",alignItems:"center",padding:"12px 14px",background:T.card2,borderRadius:14,marginBottom:8,gap:12,border:`1px solid ${T.border}`}}>
                  <div style={{width:42,height:42,borderRadius:13,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:15,color:"#fff"}}>{gi(contact.name)}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:14,color:T.text}}>{contact.name}</div>
                    <div style={{fontSize:11,color:locks[chatId]?"#EF4444":T.muted,marginTop:2,fontWeight:600}}>{locks[chatId]?"🔒 Locked":"🔓 Unlocked"}</div>
                  </div>
                  {locks[chatId]?(
                    <div onClick={()=>{if(window.confirm("Remove lock?"))removeLock(chatId);}} style={{padding:"7px 14px",background:"rgba(239,68,68,0.1)",borderRadius:12,color:"#EF4444",fontSize:12,fontWeight:700,cursor:"pointer",border:"1px solid rgba(239,68,68,0.2)"}}>Remove</div>
                  ):(
                    <div onClick={()=>{setLockModal(chatId);setLockPin("");setLockErr("");}} style={{padding:"7px 16px",background:T.grad,borderRadius:12,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",boxShadow:T.shadow}}>🔒 Lock</div>
                  )}
                </div>
              ))}
            </Card>

            <div onClick={()=>setShowLogoutConfirm(true)} style={{padding:"16px 22px",background:T.gradDanger,borderRadius:20,textAlign:"center",color:"#fff",fontWeight:700,cursor:"pointer",boxShadow:"0 4px 20px rgba(239,68,68,0.35)",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
              🚪 Sign Out
            </div>
            <div onClick={()=>setShowDeleteConfirm(true)} style={{padding:"14px 22px",background:"transparent",borderRadius:20,textAlign:"center",color:"#EF4444",fontWeight:600,cursor:"pointer",fontSize:14,border:"1px solid rgba(239,68,68,0.3)",marginTop:10}}>
              🗑️ Delete Account
            </div>
          </div>
        )}

        {/* PRIVACY */}
        {settTab==="privacy"&&(
          <div style={{animation:"slideUp 0.3s ease"}}>
            {[["Last Seen","Show when you were last active",true],["Online Status","Show when you're online",true],["Read Receipts","Show when you've read messages",true],["Profile Photo","Who can see your photo",false]].map(([title,desc,val],i)=>(
              <Card key={i} style={{padding:"18px 22px",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:15,color:T.text}}>{title}</div>
                    <div style={{fontSize:12,color:T.muted,marginTop:3}}>{desc}</div>
                  </div>
                  <div onClick={()=>{}} style={{width:52,height:28,borderRadius:14,background:val?T.grad:T.card2,position:"relative",cursor:"pointer",transition:"all 0.3s",border:`1px solid ${T.border}`}}>
                    <div style={{position:"absolute",top:3,left:val?26:3,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"all 0.3s",boxShadow:"0 2px 4px rgba(0,0,0,0.3)"}} />
                  </div>
                </div>
              </Card>
            ))}
            <Card style={{padding:20,marginTop:4}}>
              <div style={{fontWeight:700,fontSize:15,color:T.text,marginBottom:12}}>Blocked Contacts</div>
              <div style={{color:T.muted,fontSize:13,textAlign:"center",padding:20}}>No blocked contacts</div>
            </Card>
          </div>
        )}

        {/* NOTIFICATIONS */}
        {settTab==="notifs"&&(
          <div style={{animation:"slideUp 0.3s ease"}}>
            {[["Messages",notifSettings.msgs,"msgs"],["Updates",notifSettings.updates,"updates"],["Calls",notifSettings.calls,"calls"]].map(([title,val,key])=>(
              <Card key={key} style={{padding:"18px 22px",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:15,color:T.text}}>{title} Notifications</div>
                    <div style={{fontSize:12,color:T.muted,marginTop:3}}>Receive {title.toLowerCase()} notifications</div>
                  </div>
                  <div onClick={()=>setNotifSettings(p=>({...p,[key]:!p[key]}))} style={{width:52,height:28,borderRadius:14,background:val?T.grad:T.card2,position:"relative",cursor:"pointer",transition:"all 0.3s"}}>
                    <div style={{position:"absolute",top:3,left:val?26:3,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"all 0.3s",boxShadow:"0 2px 4px rgba(0,0,0,0.3)"}} />
                  </div>
                </div>
              </Card>
            ))}
            <Card style={{padding:"18px 22px"}}>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:15,color:T.text}}>Dark Mode</div>
                  <div style={{fontSize:12,color:T.muted,marginTop:3}}>Toggle dark/light theme</div>
                </div>
                <div onClick={()=>setDarkMode(p=>!p)} style={{width:52,height:28,borderRadius:14,background:darkMode?T.grad:T.card2,position:"relative",cursor:"pointer",transition:"all 0.3s"}}>
                  <div style={{position:"absolute",top:3,left:darkMode?26:3,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"all 0.3s",boxShadow:"0 2px 4px rgba(0,0,0,0.3)"}} />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* LANGUAGE */}
        {settTab==="language"&&(
          <div style={{animation:"slideUp 0.3s ease"}}>
            <Card style={{padding:18,marginBottom:14}}>
              <div style={{fontSize:11,color:T.blue,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:1.5}}>Selected: {lang}</div>
              <input value={langQ} onChange={e=>setLangQ(e.target.value)} placeholder="Search languages..."
                style={{width:"100%",padding:"12px 16px",background:T.card2,border:`1.5px solid ${T.border}`,borderRadius:14,color:T.text,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"'Inter',sans-serif"}} />
            </Card>
            {LANGS.filter(l=>l.toLowerCase().includes(langQ.toLowerCase())).map(l=>(
              <div key={l} onClick={()=>{setLang(l);setLangQ("");}}
                style={{padding:"14px 18px",background:lang===l?T.card2:T.card,borderRadius:14,cursor:"pointer",display:"flex",justifyContent:"space-between",marginBottom:6,border:`1.5px solid ${lang===l?T.blue:T.border}`,transition:"all 0.15s"}}>
                <span style={{color:T.text,fontSize:14,fontWeight:lang===l?700:400}}>{l}</span>
                {lang===l&&<span style={{color:T.blue,fontWeight:800}}>✓</span>}
              </div>
            ))}
          </div>
        )}

        {/* KHAN AI */}
        {settTab==="ai"&&(
          <div style={{display:"flex",flexDirection:"column",minHeight:"60vh",animation:"slideUp 0.3s ease"}}>
            <div style={{background:T.grad,borderRadius:24,padding:24,marginBottom:18,textAlign:"center",boxShadow:T.shadowLg}}>
              <div style={{fontSize:48,marginBottom:8}}>🤖</div>
              <div style={{fontWeight:800,fontSize:22,color:"#fff",letterSpacing:"-0.3px"}}>Khan AI</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.7)",marginTop:4}}>Powered by Claude · Always here to help</div>
            </div>
            <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:12,marginBottom:14,minHeight:200}}>
              {aiMsgs.length===0&&(
                <div style={{textAlign:"center",color:T.muted,padding:40}}>
                  <div style={{fontSize:48,marginBottom:12}}>✨</div>
                  <div style={{fontWeight:700,fontSize:16,color:T.text}}>Ask Khan AI anything!</div>
                  <div style={{fontSize:13,marginTop:6}}>I'm your intelligent assistant</div>
                </div>
              )}
              {aiMsgs.map((m,i)=>(
                <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",animation:"slideUp 0.2s ease"}}>
                  <div style={{maxWidth:"84%",padding:"13px 17px",background:m.role==="user"?T.grad:T.card,borderRadius:m.role==="user"?"20px 20px 5px 20px":"20px 20px 20px 5px",fontSize:14,color:T.text,lineHeight:1.7,boxShadow:m.role==="user"?T.shadow:T.shadowCard,border:m.role==="user"?"none":`1px solid ${T.border}`}}>
                    {m.text}
                  </div>
                </div>
              ))}
              {aiLoad&&(
                <div style={{display:"flex",gap:8,padding:"13px 17px",background:T.card,borderRadius:"20px 20px 20px 5px",width:"fit-content",border:`1px solid ${T.border}`}}>
                  {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:T.blue,animation:`dotBounce 1.4s ${i*0.2}s infinite`}} />)}
                </div>
              )}
            </div>
            <div style={{display:"flex",gap:10}}>
              <input value={aiIn} onChange={e=>setAiIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&askAI()} placeholder="Ask Khan AI..."
                style={{flex:1,padding:"14px 18px",background:T.card,border:`1.5px solid ${T.border}`,borderRadius:24,color:T.text,fontSize:14,outline:"none",fontFamily:"'Inter',sans-serif"}}
                onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border} />
              <div onClick={askAI} style={{width:52,height:52,borderRadius:17,background:aiIn.trim()?T.grad:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:20,boxShadow:aiIn.trim()?T.shadow:"none",transition:"all 0.2s",flexShrink:0}}>➤</div>
            </div>
          </div>
        )}

        {/* LEGAL */}
        {settTab==="legal"&&(
          <div style={{animation:"slideUp 0.3s ease"}}>
            {[["🔒 Privacy Policy","Read our privacy policy","privacy"],["📋 Terms of Service","Our terms and conditions","terms"],["📧 Contact Us","Get help and support","contact"],["🗑️ Delete Account","Request account deletion","delete"]].map(([title,desc,action])=>(
              <Card key={action} style={{padding:"18px 22px",marginBottom:12,cursor:"pointer"}}
                onClick={()=>{
                  if(action==="delete")setShowDeleteConfirm(true);
                  else if(action==="contact")alert("Contact us: khanchats@gmail.com\n\nFor support, please email us and we'll respond within 24 hours.");
                  else setShowPolicy(action);
                }}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:15,color:T.text}}>{title}</div>
                    <div style={{fontSize:12,color:T.muted,marginTop:3}}>{desc}</div>
                  </div>
                  <span style={{color:T.muted,fontSize:18}}>›</span>
                </div>
              </Card>
            ))}
            <div style={{marginTop:16,padding:20,background:T.card,borderRadius:20,border:`1px solid ${T.border}`,textAlign:"center"}}>
              <div style={{fontWeight:800,fontSize:16,background:T.grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:8}}>Khan Chats</div>
              <div style={{fontSize:11,color:T.muted,lineHeight:1.8}}>Version 1.0.0 · Independent Messaging Platform<br/>Not affiliated with WhatsApp or Meta</div>
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirm */}
      {showLogoutConfirm&&(
        <Modal onClose={()=>setShowLogoutConfirm(false)}>
          <Card style={{padding:32,textAlign:"center"}}>
            <div style={{fontSize:52,marginBottom:16}}>🚪</div>
            <div style={{fontWeight:800,fontSize:20,color:T.text,marginBottom:8}}>Sign Out?</div>
            <div style={{color:T.muted,fontSize:14,marginBottom:24,lineHeight:1.6}}>Are you sure you want to sign out of Khan Chats?</div>
            <div style={{display:"flex",gap:10}}>
              <GBtn onClick={()=>setShowLogoutConfirm(false)} variant="ghost" style={{flex:1}}>Cancel</GBtn>
              <GBtn onClick={logout} variant="danger" style={{flex:1}}>Sign Out</GBtn>
            </div>
          </Card>
        </Modal>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm&&(
        <Modal onClose={()=>setShowDeleteConfirm(false)}>
          <Card style={{padding:32,textAlign:"center"}}>
            <div style={{fontSize:52,marginBottom:16}}>⚠️</div>
            <div style={{fontWeight:800,fontSize:20,color:"#EF4444",marginBottom:8}}>Delete Account?</div>
            <div style={{color:T.muted,fontSize:13,marginBottom:24,lineHeight:1.7}}>
              This action is permanent and cannot be undone. All your messages, contacts, and data will be deleted.
            </div>
            <div style={{display:"flex",gap:10}}>
              <GBtn onClick={()=>setShowDeleteConfirm(false)} variant="ghost" style={{flex:1}}>Cancel</GBtn>
              <GBtn onClick={async()=>{await logout();setShowDeleteConfirm(false);}} variant="danger" style={{flex:1}}>Delete</GBtn>
            </div>
          </Card>
        </Modal>
      )}

      {showPolicy&&(
        <Modal onClose={()=>setShowPolicy(null)}>
          <Card style={{padding:28,maxHeight:"75vh",overflowY:"auto"}}>
            <div style={{fontWeight:800,fontSize:20,color:T.text,marginBottom:16}}>{showPolicy==="privacy"?"🔒 Privacy Policy":"📋 Terms of Service"}</div>
            <div style={{color:T.mutedLight,fontSize:13,lineHeight:1.9}}>
              {showPolicy==="privacy"?(
                <><p>Khan Chats is an independent messaging platform committed to your privacy.</p><p><strong style={{color:T.text}}>Data Collected:</strong> Email, name, profile photo, messages.</p><p><strong style={{color:T.text}}>Usage:</strong> To provide messaging services and improve the app.</p><p><strong style={{color:T.text}}>Security:</strong> Data secured via Firebase/Google infrastructure.</p><p><strong style={{color:T.text}}>Your Rights:</strong> Delete account and data anytime.</p></>
              ):(
                <><p>By using Khan Chats, you agree to these terms.</p><p><strong style={{color:T.text}}>Acceptable Use:</strong> Only for lawful, respectful communication.</p><p><strong style={{color:T.text}}>Account Security:</strong> You're responsible for your account security.</p><p><strong style={{color:T.text}}>Disclaimer:</strong> Not affiliated with WhatsApp, Meta, or any other company.</p></>
              )}
            </div>
            <GBtn onClick={()=>setShowPolicy(null)} style={{marginTop:20}}>Close</GBtn>
          </Card>
        </Modal>
      )}
    </div>
  );

  // LOCK MODALS
  if(lockModal) return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Poppins',sans-serif"}}>
      <style>{GFONTS}</style>
      <Card style={{padding:36,maxWidth:360,width:"100%",textAlign:"center",animation:"slideUp 0.3s ease"}}>
        <div style={{width:76,height:76,borderRadius:24,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 20px",boxShadow:T.shadow}}>🔒</div>
        <h3 style={{color:T.text,margin:"0 0 8px",fontWeight:800,fontSize:22}}>Set Chat PIN</h3>
        <p style={{color:T.muted,fontSize:13,marginBottom:24,lineHeight:1.6}}>Minimum 4 digits to lock this chat</p>
        <input value={lockPin} onChange={e=>setLockPin(e.target.value.replace(/\D/g,""))} placeholder="• • • •" type="password" maxLength={8}
          style={{width:"100%",padding:"16px",background:T.card2,border:`1.5px solid ${T.border}`,borderRadius:16,color:T.text,fontSize:26,outline:"none",textAlign:"center",letterSpacing:12,boxSizing:"border-box",marginBottom:10,fontFamily:"'Poppins',sans-serif"}}
          onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border} />
        {lockErr&&<div style={{color:"#EF4444",fontSize:13,marginBottom:12,padding:"8px",background:"rgba(239,68,68,0.08)",borderRadius:10}}>{lockErr}</div>}
        <div style={{display:"flex",gap:10,marginTop:10}}>
          <GBtn onClick={()=>{setLockModal(null);setLockPin("");setLockErr("");}} variant="ghost" style={{flex:1}}>Cancel</GBtn>
          <GBtn onClick={()=>lockChat(lockModal)} style={{flex:1}}>Lock 🔒</GBtn>
        </div>
      </Card>
    </div>
  );

  if(unlockModal) return(
    <div style={{position:"fixed",inset:0,background:T.bg,zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Poppins',sans-serif"}}>
      <style>{GFONTS}</style>
      <Card style={{padding:36,maxWidth:360,width:"100%",textAlign:"center",animation:"slideUp 0.3s ease"}}>
        <div style={{width:76,height:76,borderRadius:24,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 20px",boxShadow:T.shadow}}>🔐</div>
        <h3 style={{color:T.text,margin:"0 0 8px",fontWeight:800,fontSize:22}}>Chat Locked</h3>
        <p style={{color:T.muted,fontSize:13,marginBottom:24,lineHeight:1.6}}>Enter your PIN to unlock this chat</p>
        <input value={unlockPin} onChange={e=>setUnlockPin(e.target.value.replace(/\D/g,""))} placeholder="• • • •" type="password" maxLength={8}
          onKeyDown={e=>e.key==="Enter"&&unlockChat(unlockModal)}
          style={{width:"100%",padding:"16px",background:T.card2,border:`1.5px solid ${T.border}`,borderRadius:16,color:T.text,fontSize:26,outline:"none",textAlign:"center",letterSpacing:12,boxSizing:"border-box",marginBottom:10,fontFamily:"'Poppins',sans-serif"}}
          onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border} />
        {lockErr&&<div style={{color:"#EF4444",fontSize:13,marginBottom:12,padding:"8px",background:"rgba(239,68,68,0.08)",borderRadius:10}}>{lockErr}</div>}
        <div style={{display:"flex",gap:10,marginTop:10}}>
          <GBtn onClick={()=>{setUnlockModal(null);setUnlockPin("");setLockErr("");}} variant="ghost" style={{flex:1}}>Cancel</GBtn>
          <GBtn onClick={()=>unlockChat(unlockModal)} style={{flex:1}}>Unlock →</GBtn>
        </div>
      </Card>
    </div>
  );

  // CALL SCREEN
  if(inCall) return(
    <div style={{position:"fixed",inset:0,background:T.bg,zIndex:9997,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:28,fontFamily:"'Poppins',sans-serif"}}>
      <style>{GFONTS}</style>
      <div style={{width:100,height:100,borderRadius:32,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:46,boxShadow:`0 0 60px rgba(59,130,246,0.5)`,animation:"logoPulse 2s infinite"}}>
        {callType==="video"?"📹":"📞"}
      </div>
      <div style={{textAlign:"center"}}>
        <div style={{color:T.text,fontSize:26,fontWeight:800,letterSpacing:"-0.5px"}}>{activeChat?.name}</div>
        <div style={{color:T.muted,fontSize:14,marginTop:6,fontWeight:500}}>{callType==="video"?"Video":"Audio"} call in progress...</div>
      </div>
      {callType==="video"&&(
        <div style={{display:"flex",gap:16}}>
          <video ref={lvRef} autoPlay muted style={{width:160,height:120,borderRadius:20,background:T.card,border:`2px solid ${T.blue}`,objectFit:"cover"}} />
          <video ref={rvRef} autoPlay style={{width:160,height:120,borderRadius:20,background:T.card,border:`2px solid ${T.purple}`,objectFit:"cover"}} />
        </div>
      )}
      <div onClick={endCall} style={{padding:"18px 48px",background:T.gradDanger,borderRadius:24,color:"#fff",fontWeight:800,fontSize:17,cursor:"pointer",boxShadow:"0 8px 32px rgba(239,68,68,0.45)",letterSpacing:0.3}}>
        End Call
      </div>
    </div>
  );

  // MAIN APP
  return(
    <div style={{display:"flex",flexDirection:"column",height:"100vh",fontFamily:"'Inter',sans-serif",background:T.bg,color:T.text,overflow:"hidden",animation:"fadeIn 0.4s ease",maxWidth:480,margin:"0 auto",position:"relative"}}>
      <style>{GFONTS}</style>

      {/* Notifications Toast */}
      <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:9999,display:"flex",flexDirection:"column",gap:10,width:"90%",maxWidth:440}}>
        {notifs.map(n=>(
          <div key={n.id} onClick={()=>{openChat(n.contact);setNotifs(p=>p.filter(x=>x.id!==n.id));}}
            style={{background:T.card,borderRadius:20,padding:"13px 18px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 8px 32px rgba(0,0,0,0.5)",borderLeft:`3px solid ${T.blue}`,cursor:"pointer",border:`1px solid ${T.border}`,animation:"slideDown 0.3s ease",backdropFilter:"blur(20px)"}}>
            <div style={{width:38,height:38,borderRadius:12,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,color:"#fff",flexShrink:0}}>{gi(n.name)}</div>
            <div style={{flex:1,overflow:"hidden"}}>
              <div style={{fontWeight:700,fontSize:13,color:T.blue}}>{n.name}</div>
              <div style={{fontSize:13,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginTop:2}}>{n.text}</div>
            </div>
            <div onClick={e=>{e.stopPropagation();setNotifs(p=>p.filter(x=>x.id!==n.id));}} style={{color:T.muted,fontSize:16,padding:4}}>✕</div>
          </div>
        ))}
      </div>

      {/* Image Preview */}
      {previewImg&&(
        <div onClick={()=>setPreviewImg(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.97)",zIndex:9998,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
          <img src={previewImg} alt="p" style={{maxWidth:"95vw",maxHeight:"80vh",borderRadius:20}} />
          <div style={{padding:"12px 28px",background:T.card,borderRadius:16,color:T.text,cursor:"pointer",fontSize:14,fontWeight:600,border:`1px solid ${T.border}`}}>Close ✕</div>
        </div>
      )}

      {/* Status Viewer */}
      {viewS&&(
        <div onClick={()=>setViewS(null)} style={{position:"fixed",inset:0,background:"#000",zIndex:10000,display:"flex",flexDirection:"column"}}>
          <div style={{padding:"20px 24px",display:"flex",alignItems:"center",gap:14,background:"rgba(0,0,0,0.7)"}}>
            <div style={{width:48,height:48,borderRadius:15,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:18,color:"#fff"}}>{gi(viewS.name)}</div>
            <div>
              <div style={{fontWeight:700,color:"#fff",fontSize:16}}>{viewS.name}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginTop:2}}>{tAgo(viewS.timestamp)}</div>
            </div>
            <span style={{marginLeft:"auto",fontSize:24,color:"rgba(255,255,255,0.7)",cursor:"pointer"}}>✕</span>
          </div>
          <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:28}}>
            {viewS.image&&<img src={viewS.image} alt="s" style={{maxWidth:"100%",maxHeight:"72vh",borderRadius:20}} />}
            {viewS.text&&<p style={{color:"#fff",fontSize:22,textAlign:"center",lineHeight:1.6,fontWeight:600,maxWidth:380}}>{viewS.text}</p>}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInvite&&(
        <Modal onClose={()=>setShowInvite(false)}>
          <Card style={{padding:36,textAlign:"center"}}>
            <div style={{width:72,height:72,borderRadius:22,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 18px",boxShadow:T.shadow}}>🔗</div>
            <h3 style={{color:T.text,margin:"0 0 8px",fontWeight:800,fontSize:22}}>Invite Friends</h3>
            <p style={{color:T.muted,fontSize:13,marginBottom:22,lineHeight:1.7}}>Share this link to invite friends to Khan Chats</p>
            <div style={{background:T.card2,borderRadius:14,padding:"13px 16px",fontSize:11,color:T.blue,wordBreak:"break-all",marginBottom:22,border:`1px solid ${T.border}`,lineHeight:1.6}}>{invLink}</div>
            <GBtn onClick={copyLink} style={{marginBottom:10}}>{copied?"✅ Link Copied!":"📋 Copy Invite Link"}</GBtn>
            <div onClick={()=>setShowInvite(false)} style={{padding:"12px",color:T.muted,cursor:"pointer",fontSize:14}}>Close</div>
          </Card>
        </Modal>
      )}

      {/* Emoji Picker */}
      {emojiPicker&&(
        <div style={{position:"absolute",bottom:90,left:16,right:16,background:T.card,borderRadius:20,padding:16,border:`1px solid ${T.border}`,boxShadow:"0 8px 32px rgba(0,0,0,0.5)",zIndex:100,animation:"slideUp 0.2s ease"}}>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {emojis.map(e=>(
              <div key={e} onClick={()=>{setInput(p=>p+e);setEmojiPicker(false);}} style={{fontSize:24,cursor:"pointer",padding:4,borderRadius:8,transition:"background 0.15s"}}
                onMouseEnter={ev=>ev.currentTarget.style.background=T.card2}
                onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>
                {e}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHAT VIEW */}
      {nav==="chat"&&activeChat?(
        <div style={{display:"flex",flexDirection:"column",height:"100%",background:T.bg}}>
          {/* Chat Header */}
          <div style={{display:"flex",alignItems:"center",padding:"14px 18px",background:T.card,gap:14,borderBottom:`1px solid ${T.border}`,boxShadow:"0 2px 16px rgba(0,0,0,0.2)"}}>
            <div onClick={()=>setNav("home")} style={{width:40,height:40,borderRadius:13,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:18,flexShrink:0}}>←</div>
            <div style={{width:46,height:46,borderRadius:15,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:18,color:"#fff",boxShadow:T.shadow,flexShrink:0}}>
              {gi(activeChat.name)}
            </div>
            <div style={{flex:1,overflow:"hidden"}}>
              <div style={{fontWeight:800,fontSize:16,color:T.text,letterSpacing:"-0.2px",fontFamily:"'Poppins',sans-serif"}}>{activeChat.name}</div>
              <div style={{fontSize:11,color:typing?T.purple:T.blue,fontWeight:600,marginTop:1}}>
                {typing?"typing...":"● Online"}
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              {[["📞",()=>startCall("audio")],["📹",()=>startCall("video")]].map(([icon,fn])=>(
                <div key={icon} onClick={fn} style={{width:40,height:40,borderRadius:13,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:18,border:`1px solid ${T.border}`,transition:"all 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=T.card3}
                  onMouseLeave={e=>e.currentTarget.style.background=T.card2}>
                  {icon}
                </div>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div style={{flex:1,overflowY:"auto",padding:"18px 14px",display:"flex",flexDirection:"column",gap:4}}>
            {msgs.length===0&&(
              <div style={{textAlign:"center",margin:"auto",color:T.muted,padding:40}}>
                <div style={{fontSize:60,marginBottom:20,opacity:0.5}}>👋</div>
                <div style={{fontSize:18,fontWeight:700,color:T.text,fontFamily:"'Poppins',sans-serif"}}>Say hello!</div>
                <div style={{fontSize:13,marginTop:8}}>Start your conversation with {activeChat.name}</div>
              </div>
            )}
            {msgs.map((msg,i)=>{
              const isMine=msg.senderUid===user.uid;
              return(
                <div key={i} style={{display:"flex",justifyContent:isMine?"flex-end":"flex-start",marginBottom:2,animation:`slideUp 0.2s ease`}}>
                  {!isMine&&(
                    <div style={{width:32,height:32,borderRadius:10,background:cfn(msg.senderName),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:11,color:"#fff",flexShrink:0,marginRight:8,alignSelf:"flex-end"}}>
                      {gi(msg.senderName)}
                    </div>
                  )}
                  <div style={{maxWidth:"72%",
                    padding:msg.image?"7px 7px 8px":"12px 18px 10px",
                    background:isMine?T.gradSent:T.card,
                    borderRadius:isMine?"22px 22px 6px 22px":"22px 22px 22px 6px",
                    boxShadow:isMine?"0 4px 20px rgba(29,78,216,0.35)":"0 2px 12px rgba(0,0,0,0.25)",
                    border:isMine?"none":`1px solid ${T.border}`}}>
                    {!isMine&&msgs[i-1]?.senderUid!==msg.senderUid&&<div style={{fontSize:10,color:T.blue,fontWeight:700,marginBottom:5,letterSpacing:0.3}}>{msg.senderName}</div>}
                    {msg.image&&<img src={msg.image} alt="s" onClick={()=>setPreviewImg(msg.image)} style={{maxWidth:220,maxHeight:220,borderRadius:16,display:"block",cursor:"zoom-in",objectFit:"cover"}} />}
                    {msg.text&&<p style={{margin:msg.image?"8px 4px 0":0,fontSize:15,lineHeight:1.65,color:T.text,wordBreak:"break-word",whiteSpace:"pre-wrap"}}>{msg.text}</p>}
                    <div style={{display:"flex",justifyContent:"flex-end",gap:4,marginTop:5,alignItems:"center",paddingRight:msg.image?4:0}}>
                      <span style={{fontSize:10,color:isMine?"rgba(255,255,255,0.5)":T.muted,fontWeight:400}}>{ft(msg.timestamp)}</span>
                      {isMine&&<span style={{fontSize:11,color:"rgba(255,255,255,0.65)"}}>✓✓</span>}
                    </div>
                  </div>
                </div>
              );
            })}
            {typing&&(
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
                <div style={{width:32,height:32,borderRadius:10,background:cfn(activeChat.name),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:11,color:"#fff",flexShrink:0}}>
                  {gi(activeChat.name)}
                </div>
                <div style={{padding:"12px 18px",background:T.card,borderRadius:"22px 22px 22px 6px",border:`1px solid ${T.border}`,display:"flex",gap:5,alignItems:"center"}}>
                  {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:T.purple,animation:`dotBounce 1.4s ${i*0.2}s infinite`}} />)}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          {emojiPicker&&<div style={{position:"absolute",bottom:90,left:0,right:0,background:T.card,borderRadius:"20px 20px 0 0",padding:20,border:`1px solid ${T.border}`,zIndex:100,animation:"slideUp 0.2s ease"}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
              {emojis.map(e=>(
                <div key={e} onClick={()=>{setInput(p=>p+e);setEmojiPicker(false);}} style={{fontSize:26,cursor:"pointer"}}>{e}</div>
              ))}
            </div>
          </div>}
          <div style={{padding:"12px 14px",background:T.card,borderTop:`1px solid ${T.border}`}}>
            <input type="file" accept="image/*" ref={fileRef} onChange={handleImg} style={{display:"none"}} />
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div onClick={()=>setEmojiPicker(p=>!p)} style={{width:42,height:42,borderRadius:13,background:emojiPicker?T.grad:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:20,border:`1px solid ${T.border}`,flexShrink:0,transition:"all 0.2s"}}>😊</div>
              <div style={{display:"flex",alignItems:"center",background:T.card2,borderRadius:24,flex:1,padding:"10px 16px",gap:10,border:`1.5px solid ${T.border}`,transition:"border 0.2s"}}>
                <input value={input} onChange={e=>handleTyping(e.target.value)}
                  onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendMsg()}
                  placeholder="Message..."
                  style={{flex:1,background:"none",border:"none",outline:"none",color:T.text,fontSize:15,fontFamily:"'Inter',sans-serif"}} />
                <div onClick={()=>fileRef.current?.click()} style={{cursor:"pointer",fontSize:18,opacity:0.5,flexShrink:0,transition:"opacity 0.2s"}}
                  onMouseEnter={e=>e.currentTarget.style.opacity=1}
                  onMouseLeave={e=>e.currentTarget.style.opacity=0.5}>📎</div>
              </div>
              <div onClick={()=>sendMsg()} style={{width:46,height:46,borderRadius:16,background:input.trim()?T.grad:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:input.trim()?18:20,border:`1px solid ${T.border}`,boxShadow:input.trim()?T.shadow:"none",transition:"all 0.25s",flexShrink:0}}>
                {input.trim()?"➤":"🎤"}
              </div>
            </div>
          </div>
        </div>
      ):(
        /* MAIN VIEWS */
        <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
          {/* Top Header */}
          <div style={{padding:"18px 20px 14px",background:T.card,borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:42,height:42,borderRadius:14,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:17,color:"#fff",overflow:"hidden",cursor:"pointer"}}
                onClick={()=>{setShowSett(true);setSettTab("profile");}}>
                {pic?<img src={pic} alt="p" style={{width:42,height:42,objectFit:"cover"}} />:gi(user?.displayName||user?.email)}
              </div>
              <div>
                <div style={{fontWeight:800,fontSize:19,color:T.text,letterSpacing:"-0.4px",fontFamily:"'Poppins',sans-serif"}}>Khan Chats</div>
                <div style={{fontSize:10,color:T.blue,fontWeight:600}}>● Active Now</div>
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <div onClick={()=>setShowSearch(p=>!p)} style={{width:38,height:38,borderRadius:12,background:showSearch?T.grad:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,border:`1px solid ${T.border}`,transition:"all 0.2s"}}>🔍</div>
              <div onClick={genInvite} style={{width:38,height:38,borderRadius:12,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,border:`1px solid ${T.border}`}}>🔗</div>
              <div onClick={()=>setShowSett(true)} style={{width:38,height:38,borderRadius:12,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,border:`1px solid ${T.border}`}}>⚙️</div>
            </div>
          </div>

          {/* Search Bar */}
          {showSearch&&(
            <div style={{padding:"12px 16px",background:T.card2,borderBottom:`1px solid ${T.border}`,animation:"slideDown 0.2s ease"}}>
              <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search contacts and chats..."
                autoFocus
                style={{width:"100%",padding:"12px 18px",background:T.card,border:`1.5px solid ${T.blue}`,borderRadius:16,color:T.text,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"'Inter',sans-serif",boxShadow:`0 0 0 3px rgba(59,130,246,0.1)`}} />
            </div>
          )}

          {/* Tab Bar */}
          <div style={{display:"flex",background:T.card,borderBottom:`1px solid ${T.border}`}}>
            {[["messages","💬","Messages",totalUnread],["updates","✨","Updates",othersStatuses.length],["calls","📞","Calls",0]].map(([v,icon,label,badge])=>(
              <div key={v} onClick={()=>setView(v)}
                style={{flex:1,textAlign:"center",padding:"13px 4px",cursor:"pointer",position:"relative",transition:"all 0.25s ease"}}>
                <span style={{fontSize:18,display:"block",marginBottom:2}}>{icon}</span>
                <span style={{fontSize:10,fontWeight:700,fontFamily:"'Poppins',sans-serif",
                  color:view===v?T.blue:"rgba(100,116,139,0.55)",
                  letterSpacing:0.5,transition:"all 0.2s"}}>
                  {label}
                </span>
                {view===v&&<div style={{position:"absolute",bottom:0,left:"20%",right:"20%",height:2.5,background:T.grad,borderRadius:2,boxShadow:`0 0 8px ${T.blue}`}} />}
                {badge>0&&<div style={{position:"absolute",top:8,right:"20%",background:T.gradDanger,borderRadius:10,minWidth:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#fff",padding:"0 4px"}}>{badge>9?"9+":badge}</div>}
              </div>
            ))}
          </div>

          {/* Content */}
          <div style={{flex:1,overflowY:"auto"}}>

            {/* MESSAGES */}
            {view==="messages"&&(
              <div style={{animation:"fadeIn 0.25s ease"}}>
                {showNew&&(
                  <div style={{padding:"14px 16px",background:T.card2,borderBottom:`1px solid ${T.border}`,animation:"slideDown 0.2s ease"}}>
                    <input value={newEmail} onChange={e=>setNewEmail(e.target.value)} placeholder="Enter friend's email to start chat..."
                      style={{width:"100%",padding:"12px 16px",background:T.card,border:`1.5px solid ${T.border}`,borderRadius:14,color:T.text,fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:10,fontFamily:"'Inter',sans-serif"}}
                      onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border} />
                    {newEmailErr&&<div style={{color:"#EF4444",fontSize:12,marginBottom:8,padding:"7px 12px",background:"rgba(239,68,68,0.08)",borderRadius:10}}>{newEmailErr}</div>}
                    <div style={{display:"flex",gap:8}}>
                      <GBtn onClick={startChat} style={{flex:1,padding:"11px"}}>Start Chat</GBtn>
                      <GBtn onClick={()=>{setShowNew(false);setNewEmailErr("");}} variant="ghost" style={{padding:"11px 16px"}}>✕</GBtn>
                    </div>
                  </div>
                )}
                {filteredC.length===0&&lockedC.length===0?(
                  <div style={{padding:52,textAlign:"center",color:T.muted,animation:"fadeIn 0.3s ease"}}>
                    <div style={{fontSize:64,marginBottom:20,opacity:0.4}}>💬</div>
                    <div style={{fontSize:18,fontWeight:800,color:T.text,fontFamily:"'Poppins',sans-serif",marginBottom:8}}>{searchQ?"No results found":"No conversations yet"}</div>
                    <div style={{fontSize:13,marginBottom:28,lineHeight:1.6}}>{searchQ?"Try a different search term":"Start chatting with your friends!"}</div>
                    {!searchQ&&<GBtn onClick={()=>setShowNew(true)} style={{display:"inline-block",padding:"13px 28px"}}>➕ Start New Chat</GBtn>}
                  </div>
                ):(
                  <>
                    {filteredC.map(([chatId,contact],idx)=>(
                      <div key={chatId} onClick={()=>handleChatClick(contact)}
                        style={{display:"flex",alignItems:"center",padding:"15px 20px",cursor:"pointer",gap:14,
                          background:activeChat?.chatId===chatId?T.card2:"transparent",
                          borderBottom:`1px solid ${T.border}`,
                          transition:"all 0.15s ease",
                          animation:`slideUp 0.3s ${idx*0.04}s ease both`}}
                        onMouseEnter={e=>e.currentTarget.style.background=T.card}
                        onMouseLeave={e=>e.currentTarget.style.background=activeChat?.chatId===chatId?T.card2:"transparent"}
                      >
                        <div style={{position:"relative",flexShrink:0}}>
                          <div style={{width:54,height:54,borderRadius:18,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:19,color:"#fff",boxShadow:"0 2px 12px rgba(59,130,246,0.2)"}}>
                            {gi(contact.name)}
                          </div>
                          {pins.includes(chatId)&&<div style={{position:"absolute",top:-5,right:-5,fontSize:11,background:T.bg,borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center"}}>📌</div>}
                        </div>
                        <div style={{flex:1,overflow:"hidden"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                            <span style={{fontWeight:700,fontSize:15,color:T.text,letterSpacing:"-0.2px"}}>{contact.name}</span>
                            <span style={{fontSize:10,color:T.muted,fontWeight:500}}>{ft(contact.lastTime)}</span>
                          </div>
                          <div style={{fontSize:13,color:T.muted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{contact.lastMsg||contact.email}</div>
                        </div>
                        {unread[chatId]>0&&(
                          <div style={{width:22,height:22,background:T.grad,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#fff",flexShrink:0,boxShadow:T.shadow}}>
                            {unread[chatId]>9?"9+":unread[chatId]}
                          </div>
                        )}
                      </div>
                    ))}
                    {lockedC.length>0&&(
                      <>
                        <div onClick={()=>setShowLocked(p=>!p)}
                          style={{display:"flex",alignItems:"center",padding:"13px 20px",cursor:"pointer",background:T.card2,borderBottom:`1px solid ${T.border}`,gap:12}}>
                          <div style={{width:40,height:40,borderRadius:13,background:"rgba(239,68,68,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🔒</div>
                          <span style={{fontWeight:700,fontSize:13,color:T.muted,flex:1}}>Locked Chats ({lockedC.length})</span>
                          <span style={{color:T.muted,fontSize:14}}>{showLocked?"▲":"▼"}</span>
                        </div>
                        {showLocked&&lockedC.map(([chatId],idx)=>(
                          <div key={chatId} onClick={()=>handleChatClick(contacts[chatId])}
                            style={{display:"flex",alignItems:"center",padding:"15px 20px",cursor:"pointer",gap:14,background:T.bg,borderBottom:`1px solid ${T.border}`,animation:`slideUp 0.2s ${idx*0.04}s ease both`}}>
                            <div style={{width:54,height:54,borderRadius:18,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,border:`1px solid ${T.border}`}}>🔒</div>
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
            {view==="updates"&&(
              <div style={{animation:"fadeIn 0.25s ease"}}>
                <div style={{padding:"16px 18px",borderBottom:`1px solid ${T.border}`}}>
                  <div onClick={()=>setShowAddS(p=>!p)}
                    style={{display:"flex",alignItems:"center",gap:14,cursor:"pointer",padding:"4px 0"}}>
                    <div style={{width:58,height:58,borderRadius:19,background:myStatuses.length>0?T.grad:T.card2,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:20,color:"#fff",border:myStatuses.length>0?`2.5px solid ${T.blue}`:`2.5px dashed ${T.border}`,flexShrink:0,overflow:"hidden"}}>
                      {pic?<img src={pic} alt="p" style={{width:58,height:58,objectFit:"cover"}} />:gi(user?.displayName)}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:15,color:T.text}}>My Update</div>
                      <div style={{fontSize:13,color:T.muted,marginTop:3}}>{myStatuses.length>0?tAgo(myStatuses[0].timestamp):"Share what's on your mind"}</div>
                    </div>
                    <div style={{width:36,height:36,borderRadius:12,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:"#fff",boxShadow:T.shadow}}>+</div>
                  </div>
                  {showAddS&&(
                    <div style={{marginTop:14,padding:16,background:T.card2,borderRadius:18,border:`1px solid ${T.border}`,animation:"slideDown 0.2s ease"}}>
                      <input value={sText} onChange={e=>setSText(e.target.value)} placeholder="What's on your mind?"
                        style={{width:"100%",padding:"12px 16px",background:T.card,border:`1.5px solid ${T.border}`,borderRadius:14,color:T.text,fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:10,fontFamily:"'Inter',sans-serif"}}
                        onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border} />
                      <div style={{display:"flex",gap:8}}>
                        <GBtn onClick={()=>postS()} style={{flex:1,padding:"11px"}}>Share Update ✓</GBtn>
                        <GBtn onClick={()=>sFRef.current?.click()} variant="ghost" style={{padding:"11px 16px"}}>📷</GBtn>
                        <GBtn onClick={()=>setShowAddS(false)} variant="ghost" style={{padding:"11px 14px"}}>✕</GBtn>
                      </div>
                      <input type="file" accept="image/*" ref={sFRef} onChange={handleSImg} style={{display:"none"}} />
                    </div>
                  )}
                </div>
                {othersStatuses.length>0&&<div style={{padding:"8px 22px 6px",fontSize:10,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5}}>Recent Updates</div>}
                {othersStatuses.map((s,i)=>(
                  <div key={i} onClick={()=>setViewS(s)}
                    style={{display:"flex",alignItems:"center",padding:"15px 20px",gap:14,cursor:"pointer",borderBottom:`1px solid ${T.border}`,transition:"background 0.15s",animation:`slideUp 0.3s ${i*0.05}s ease both`}}
                    onMouseEnter={e=>e.currentTarget.style.background=T.card}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                  >
                    <div style={{width:58,height:58,borderRadius:19,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:20,color:"#fff",border:`2.5px solid ${T.blue}`,flexShrink:0}}>
                      {gi(s.name)}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:15,color:T.text}}>{s.name}</div>
                      <div style={{fontSize:12,color:T.muted,marginTop:3}}>{tAgo(s.timestamp)}</div>
                    </div>
                    {s.image&&<div style={{width:48,height:48,borderRadius:14,overflow:"hidden",flexShrink:0}}>
                      <img src={s.image} alt="s" style={{width:"100%",height:"100%",objectFit:"cover"}} />
                    </div>}
                  </div>
                ))}
                {statuses.length===0&&(
                  <div style={{textAlign:"center",padding:60,color:T.muted}}>
                    <div style={{fontSize:64,marginBottom:16,opacity:0.3}}>✨</div>
                    <div style={{fontSize:17,fontWeight:700,color:T.text,fontFamily:"'Poppins',sans-serif"}}>No updates yet</div>
                    <div style={{fontSize:13,marginTop:8}}>Be the first to share an update!</div>
                  </div>
                )}
              </div>
            )}

            {/* CALLS */}
            {view==="calls"&&(
              <div style={{animation:"fadeIn 0.25s ease"}}>
                <div style={{display:"flex",padding:"4px 12px",background:T.card,borderBottom:`1px solid ${T.border}`,gap:2,overflowX:"auto"}}>
                  {["all","missed","incoming","outgoing"].map(f=>(
                    <div key={f} onClick={()=>setCallF(f)}
                      style={{padding:"11px 14px",cursor:"pointer",fontSize:11,fontWeight:700,whiteSpace:"nowrap",
                        color:callF===f?T.blue:"rgba(100,116,139,0.6)",
                        borderBottom:callF===f?`2.5px solid ${T.blue}`:"2.5px solid transparent",
                        transition:"all 0.2s",letterSpacing:0.3}}>
                      {f==="missed"?"📵 Missed":f==="incoming"?"📞 Incoming":f==="outgoing"?"📲 Outgoing":"All Calls"}
                    </div>
                  ))}
                </div>
                {filteredCalls.length===0?(
                  <div style={{textAlign:"center",padding:60,color:T.muted}}>
                    <div style={{fontSize:64,marginBottom:16,opacity:0.3}}>📞</div>
                    <div style={{fontSize:17,fontWeight:700,color:T.text,fontFamily:"'Poppins',sans-serif"}}>No calls yet</div>
                  </div>
                ):filteredCalls.map((call,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",padding:"15px 20px",gap:14,borderBottom:`1px solid ${T.border}`,animation:`slideUp 0.3s ${i*0.04}s ease both`}}>
                    <div style={{width:52,height:52,borderRadius:17,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:18,color:"#fff",flexShrink:0}}>
                      {gi(call.name)}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:15,color:T.text}}>{call.name}</div>
                      <div style={{fontSize:12,fontWeight:600,marginTop:3,color:call.status==="missed"?"#EF4444":call.direction==="incoming"?T.blue:T.purple}}>
                        {call.status==="missed"?"📵 Missed":call.direction==="incoming"?`📞 Incoming · ${call.type}`:`📲 Outgoing · ${call.type}`}
                      </div>
                      <div style={{fontSize:10,color:T.muted,marginTop:2}}>{fCT(call.timestamp)}</div>
                    </div>
                    {call.duration>0&&<div style={{fontSize:11,color:T.muted}}>⏱ {fD(call.duration)}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Navigation */}
          <div style={{display:"flex",background:T.card,borderTop:`1px solid ${T.border}`,paddingBottom:"env(safe-area-inset-bottom,8px)",position:"relative"}}>
            {[
              ["home","🏠","Home",()=>setView("messages")],
              ["messages","💬","Chats",()=>{setView("messages");setShowNew(true);}],
              ["updates","✨","Updates",()=>setView("updates")],
              ["settings","⚙️","Settings",()=>setShowSett(true)]
            ].map(([id,icon,label,fn])=>{
              const isActive=(id==="home"&&view==="messages"&&!showSett)||(id==="messages"&&showNew)||(id==="updates"&&view==="updates")||(id==="settings"&&showSett);
              return(
                <div key={id} onClick={fn} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"12px 4px",cursor:"pointer",position:"relative",transition:"all 0.2s"}}>
                  <div style={{width:40,height:40,borderRadius:14,background:isActive?T.grad:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,marginBottom:4,transition:"all 0.25s",boxShadow:isActive?T.shadow:"none"}}>
                    {icon}
                  </div>
                  <span style={{fontSize:9,fontWeight:700,color:isActive?T.blue:T.muted,letterSpacing:0.5,fontFamily:"'Poppins',sans-serif",textTransform:"uppercase"}}>{label}</span>
                  {id==="home"&&totalUnread>0&&<div style={{position:"absolute",top:8,right:"20%",background:T.gradDanger,borderRadius:10,minWidth:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:"#fff",padding:"0 3px"}}>{totalUnread>9?"9+":totalUnread}</div>}
                </div>
              );
            })}
          </div>

          {/* FAB */}
          <div onClick={()=>setShowNew(p=>!p)} style={{position:"absolute",bottom:84,right:18,width:56,height:56,borderRadius:18,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:24,boxShadow:T.shadowLg,transition:"all 0.2s",zIndex:50}}>
            ✏️
          </div>

          {/* Footer */}
          <div style={{padding:"6px 16px 4px",background:T.card,borderTop:`1px solid ${T.border}`,textAlign:"center"}}>
            <div style={{fontSize:9,color:T.muted,letterSpacing:0.3}}>
              <span style={{fontWeight:800,background:T.grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Khan Chats</span>
              {" · Independent Messaging · Not affiliated with WhatsApp or Meta"}
            </div>
          </div>
        </div>
      )}

      {showPolicy&&(
        <Modal onClose={()=>setShowPolicy(null)}>
          <Card style={{padding:28,maxHeight:"75vh",overflowY:"auto"}}>
            <div style={{fontWeight:800,fontSize:20,color:T.text,marginBottom:16}}>{showPolicy==="privacy"?"🔒 Privacy Policy":"📋 Terms of Service"}</div>
            <div style={{color:T.mutedLight,fontSize:13,lineHeight:1.9}}>
              {showPolicy==="privacy"?(
                <><p>Khan Chats is an independent platform committed to your privacy.</p><p><strong style={{color:T.text}}>Data:</strong> Email, name, profile photo, messages.</p><p><strong style={{color:T.text}}>Security:</strong> Firebase/Google infrastructure.</p><p><strong style={{color:T.text}}>Rights:</strong> Delete your data anytime.</p></>
              ):(
                <><p>By using Khan Chats you agree to these terms.</p><p><strong style={{color:T.text}}>Use:</strong> Only for lawful communication.</p><p><strong style={{color:T.text}}>Disclaimer:</strong> Not affiliated with WhatsApp or Meta.</p></>
              )}
            </div>
            <GBtn onClick={()=>setShowPolicy(null)} style={{marginTop:20}}>Close</GBtn>
          </Card>
        </Modal>
      )}

      <style>{`
        ${GFONTS}
        * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:${T.border}; border-radius:3px; }
        input::placeholder { color:${T.muted}; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
        @keyframes logoPulse { 0%,100%{box-shadow:0 0 60px rgba(59,130,246,0.6),0 0 120px rgba(124,58,237,0.3)} 50%{box-shadow:0 0 80px rgba(59,130,246,0.8),0 0 160px rgba(124,58,237,0.5)} }
        @keyframes ringPulse { 0%,100%{transform:scale(1);opacity:0.3} 50%{transform:scale(1.12);opacity:0} }
        @keyframes dotBounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1.3);opacity:1} }
      `}</style>
    </div>
  );
}
