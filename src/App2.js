import{useState,useEffect,useRef,useCallback}from"react";
import{initializeApp}from"firebase/app";
import{getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,onAuthStateChanged,updateProfile}from"firebase/auth";
import{getDatabase,ref,push,onValue,set,get,serverTimestamp,off}from"firebase/database";

const FC={apiKey:"AIzaSyDJt8Pf6bC938Q9Ufxwj6xSREV0xcQf6_I",authDomain:"khan-chats-d9607.firebaseapp.com",projectId:"khan-chats-d9607",storageBucket:"khan-chats-d9607.firebasestorage.app",messagingSenderId:"646302896729",appId:"1:646302896729:web:41b2d05775c704ad43d748",databaseURL:"https://khan-chats-d9607-default-rtdb.firebaseio.com"};
const app=initializeApp(FC);
const auth=getAuth(app);
const db=getDatabase(app);

const T={bg:"#080E1A",card:"#0F1923",card2:"#162030",card3:"#1C2940",blue:"#4F8EF7",purple:"#8B5CF6",pink:"#F472B6",text:"#F0F4FF",muted:"#4A5568",mutedL:"#718096",border:"#1A2840",grad:"linear-gradient(135deg,#4F8EF7,#8B5CF6)",gradS:"linear-gradient(135deg,#1E40AF,#6D28D9)",gradD:"linear-gradient(135deg,#EF4444,#DC2626)",gradG:"linear-gradient(135deg,#10B981,#059669)",shadow:"0 4px 20px rgba(79,142,247,0.2)",shadowL:"0 8px 40px rgba(79,142,247,0.3)",cardShadow:"0 2px 16px rgba(0,0,0,0.4)"};

const GF=`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@500;600;700;800;900&display=swap');`;
const LANGS=["English","Urdu","Arabic","Hindi","Spanish","French","German","Chinese","Japanese","Korean","Portuguese","Russian","Turkish","Italian","Dutch","Polish","Swedish","Norwegian","Danish","Finnish","Greek","Hebrew","Persian","Bengali","Punjabi","Swahili","Malay","Indonesian","Thai","Vietnamese"];
const EMOJIS=["😀","😂","❤️","👍","🔥","😍","🎉","👏","😎","🙌","💯","✨","🥰","😘","🤩","💪","🙏","😅","🤔","👋","🎯","💡","⭐","🌟","🚀","💬","🎊","😊","🤝","🎮"];

const ft=ts=>{if(!ts)return"";return new Date(ts).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});};
const gi=n=>{if(!n)return"?";return n.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);};
const cfn=n=>{const c=["#4F8EF7","#8B5CF6","#0EA5E9","#6366F1","#EC4899","#0891B2","#7C3AED","#2563EB"];if(!n)return c[0];let s=0;for(let ch of n)s+=ch.charCodeAt(0);return c[s%c.length];};
const gid=(a,b)=>[a,b].sort().join("_");
const tAgo=ts=>{const d=Date.now()-ts,m=Math.floor(d/60000);if(m<1)return"Just now";if(m<60)return`${m}m`;const h=Math.floor(m/60);if(h<24)return`${h}h`;return new Date(ts).toLocaleDateString("en-US",{month:"short",day:"numeric"});};
const fD=s=>{if(!s)return"0:00";return`${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`;};

const Sty=`${GF}*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;margin:0;padding:0;}body{font-family:'Inter',sans-serif;background:#080E1A;color:#F0F4FF;overscroll-behavior:none;}::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#1A2840;border-radius:3px;}input::placeholder{color:#4A5568;}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes slideDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}@keyframes slideR{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}@keyframes pulse{0%,100%{box-shadow:0 0 40px rgba(79,142,247,0.5),0 0 80px rgba(139,92,246,0.25)}50%{box-shadow:0 0 60px rgba(79,142,247,0.8),0 0 120px rgba(139,92,246,0.4)}}@keyframes ring{0%,100%{transform:scale(1);opacity:0.3}50%{transform:scale(1.15);opacity:0}}@keyframes dot{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1.3);opacity:1}}@keyframes msgIn{from{opacity:0;transform:translateY(8px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes badgePop{0%{transform:scale(0)}60%{transform:scale(1.2)}100%{transform:scale(1)}}`;

export default function App(){
const[user,setUser]=useState(null);
const[loading,setLoading]=useState(true);
const[screen,setScreen]=useState("login");
const[em,setEm]=useState("");const[pw,setPw]=useState("");const[dn,setDn]=useState("");
const[aErr,setAErr]=useState("");const[aLoad,setALoad]=useState(false);
const[contacts,setContacts]=useState({});
const[unread,setUnread]=useState({});
const[pins,setPins]=useState([]);
const[locks,setLocks]=useState({});
const[unlocked,setUnlocked]=useState([]);
const[lModal,setLModal]=useState(null);const[ulModal,setUlModal]=useState(null);
const[lPin,setLPin]=useState("");const[ulPin,setUlPin]=useState("");const[lErr,setLErr]=useState("");
const[showLocked,setShowLocked]=useState(false);
const[activeChat,setActiveChat]=useState(null);
const[msgs,setMsgs]=useState([]);
const[inp,setInp]=useState("");
const[isTyping,setIsTyping]=useState(false);
const[nEmail,setNEmail]=useState("");const[nEmailErr,setNEmailErr]=useState("");const[showNew,setShowNew]=useState(false);
const[toasts,setToasts]=useState([]);
const[previewImg,setPreviewImg]=useState(null);
const[showInvite,setShowInvite]=useState(false);const[invL,setInvL]=useState("");const[copied,setCopied]=useState(false);
const[inCall,setInCall]=useState(false);const[callType,setCallType]=useState(null);const[callStart,setCallStart]=useState(null);
const[nav,setNav]=useState("home");
const[view,setView]=useState("messages");
const[statuses,setStatuses]=useState([]);
const[sText,setSText]=useState("");const[showAddS,setShowAddS]=useState(false);const[viewS,setViewS]=useState(null);
const[callHist,setCallHist]=useState([]);const[callF,setCallF]=useState("all");
const[showSett,setShowSett]=useState(false);const[sTab,setSTab]=useState("profile");
const[pic,setPic]=useState(null);const[bio,setBio]=useState("");const[uname,setUname]=useState("");const[newName,setNewName]=useState("");
const[lang,setLang]=useState("English");const[langQ,setLangQ]=useState("");
const[darkMode,setDarkMode]=useState(true);
const[nSett,setNSett]=useState({msgs:true,updates:true,calls:true});
const[searchQ,setSearchQ]=useState("");const[showSearch,setShowSearch]=useState(false);
const[aiIn,setAiIn]=useState("");const[aiMsgs,setAiMsgs]=useState([]);const[aiLoad,setAiLoad]=useState(false);
const[policy,setPolicy]=useState(null);
const[logoutC,setLogoutC]=useState(false);const[deleteC,setDeleteC]=useState(false);
const[showEmoji,setShowEmoji]=useState(false);
const[recentActivity,setRecentActivity]=useState([]);

const endRef=useRef(null);const fileRef=useRef(null);const sFRef=useRef(null);const picRef=useRef(null);
const acRef=useRef(null);const lvRef=useRef(null);const rvRef=useRef(null);const pcRef=useRef(null);const lsRef=useRef(null);
const typTimer=useRef(null);const notifId=useRef(0);

useEffect(()=>{acRef.current=activeChat;},[activeChat]);
useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,isTyping]);

const addToast=useCallback((name,text,contact)=>{
  const id=++notifId.current;
  setToasts(p=>[...p,{id,name,text,contact}]);
  setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),4000);
},[]);

useEffect(()=>{
  const unsub=onAuthStateChanged(auth,async u=>{
    if(u){
      setUser(u);setScreen("chat");setNewName(u.displayName||"");
      await set(ref(db,`users/${u.uid}`),{uid:u.uid,name:u.displayName||u.email.split("@")[0],email:u.email,online:true,lastSeen:serverTimestamp()});
      loadAll(u);
    }else{setUser(null);setScreen("login");}
    setLoading(false);
  });
  return()=>unsub();
},[]);

const loadAll=u=>{
  onValue(ref(db,`userChats/${u.uid}`),async snap=>{
    const data=snap.val()||{},map={},ur={};
    for(const chatId of Object.keys(data)){
      const s=await get(ref(db,`users/${data[chatId].with}`));
      if(s.exists()){
        map[chatId]={...s.val(),chatId,lastMsg:data[chatId].lastMsg||"",lastTime:data[chatId].lastTime||0};
        ur[chatId]=data[chatId].unread||0;
      }
    }
    setContacts(map);setUnread(ur);
    const recent=Object.values(map).filter(c=>c.lastMsg&&c.lastTime).sort((a,b)=>b.lastTime-a.lastTime).slice(0,3);
    setRecentActivity(recent);
  });
  onValue(ref(db,"statuses"),snap=>{
    setStatuses(Object.values(snap.val()||{}).filter(s=>Date.now()-s.timestamp<86400000).sort((a,b)=>b.timestamp-a.timestamp));
  });
  onValue(ref(db,`callHistory/${u.uid}`),snap=>{
    setCallHist(Object.values(snap.val()||{}).sort((a,b)=>b.timestamp-a.timestamp));
  });
  onValue(ref(db,`pins/${u.uid}`),snap=>{setPins(snap.val()||[]);});
  onValue(ref(db,`profilePics/${u.uid}`),snap=>{if(snap.val())setPic(snap.val());});
  onValue(ref(db,`lockedChats/${u.uid}`),snap=>{setLocks(snap.val()||{});});
  onValue(ref(db,`userBio/${u.uid}`),snap=>{if(snap.val())setBio(snap.val());});
  onValue(ref(db,`usernames/${u.uid}`),snap=>{if(snap.val())setUname(snap.val());});
};

const saveCall=(u,d)=>push(ref(db,`callHistory/${u.uid}`),{...d,timestamp:Date.now()});
const togglePin=async id=>{const p=pins.includes(id)?pins.filter(x=>x!==id):[...pins,id];await set(ref(db,`pins/${user.uid}`),p);};
const savePic=async img=>{await set(ref(db,`profilePics/${user.uid}`),img);setPic(img);};
const saveProfile=async()=>{
  if(!newName.trim())return;
  await updateProfile(auth.currentUser,{displayName:newName.trim()});
  await set(ref(db,`users/${user.uid}/name`),newName.trim());
  if(bio)await set(ref(db,`userBio/${user.uid}`),bio);
  if(uname)await set(ref(db,`usernames/${user.uid}`),uname);
  setUser({...user,displayName:newName.trim()});
  alert("Profile updated! ✅");
};
const handlePic=e=>{
  const f=e.target.files[0];if(!f)return;
  if(f.size>500000){alert("Max 500KB");return;}
  const r=new FileReader();r.onload=ev=>savePic(ev.target.result);r.readAsDataURL(f);e.target.value="";
};
const lockChat=async id=>{
  if(lPin.length<4){setLErr("4+ digits required");return;}
  await set(ref(db,`lockedChats/${user.uid}`),{...locks,[id]:lPin});
  setLPin("");setLModal(null);setLErr("");
};
const unlockChat=id=>{
  if(ulPin===locks[id]){setUnlocked(p=>[...p,id]);setUlPin("");setUlModal(null);setLErr("");}
  else setLErr("Wrong PIN!");
};
const removeLock=async id=>{
  const n={...locks};delete n[id];
  await set(ref(db,`lockedChats/${user.uid}`),n);
  setUnlocked(p=>p.filter(x=>x!==id));
};
const handleChatClick=c=>{
  const{chatId}=c;
  if(locks[chatId]&&!unlocked.includes(chatId)){setUlModal(chatId);setUlPin("");setLErr("");}
  else openChat(c);
};
const askAI=async()=>{
  if(!aiIn.trim())return;
  const um={role:"user",text:aiIn.trim()};
  setAiMsgs(p=>[...p,um]);setAiIn("");setAiLoad(true);
  try{
    const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,
        system:"You are Khan AI, helpful assistant for Khan Chats by Hamza Khan. Be friendly and concise.",
        messages:[...aiMsgs.map(m=>({role:m.role,content:m.text})),{role:"user",content:aiIn.trim()}]})});
    const data=await res.json();
    setAiMsgs(p=>[...p,{role:"assistant",text:data.content?.[0]?.text||"Sorry, try again."}]);
  }catch{setAiMsgs(p=>[...p,{role:"assistant",text:"Connection error."}]);}
  setAiLoad(false);
};
const register=async()=>{
  if(!dn.trim()){setAErr("Enter your name");return;}
  setALoad(true);setAErr("");
  try{const c=await createUserWithEmailAndPassword(auth,em,pw);await updateProfile(c.user,{displayName:dn.trim()});}
  catch(e){setAErr(e.message.includes("email-already")?"Email already registered":e.message.includes("weak")?"Password 6+ chars":"Something went wrong");}
  setALoad(false);
};
const login=async()=>{
  setALoad(true);setAErr("");
  try{await signInWithEmailAndPassword(auth,em,pw);}
  catch{setAErr("Incorrect email or password");}
  setALoad(false);
};
const logout=async()=>{
  if(user)await set(ref(db,`users/${user.uid}/online`),false);
  await signOut(auth);setActiveChat(null);setMsgs([]);setContacts({});setLogoutC(false);
};
const startChat=async()=>{
  setNEmailErr("");
  if(!nEmail.trim()){setNEmailErr("Enter an email");return;}
  if(nEmail.trim()===user.email){setNEmailErr("Can't message yourself!");return;}
  const snap=await get(ref(db,"users"));
  const found=Object.values(snap.val()||{}).find(u=>u.email===nEmail.trim());
  if(!found){setNEmailErr("User not found. Send an invite!");return;}
  const chatId=gid(user.uid,found.uid);
  await set(ref(db,`userChats/${user.uid}/${chatId}`),{with:found.uid,lastMsg:"",lastTime:serverTimestamp(),unread:0});
  await set(ref(db,`userChats/${found.uid}/${chatId}`),{with:user.uid,lastMsg:"",lastTime:serverTimestamp(),unread:0});
  setNEmail("");setShowNew(false);openChat({...found,chatId});
};
const openChat=c=>{
  setActiveChat(c);setNav("chat");setShowEmoji(false);
  set(ref(db,`userChats/${user.uid}/${c.chatId}/unread`),0);
  setUnread(p=>({...p,[c.chatId]:0}));
  off(ref(db,`chats/${c.chatId}/messages`));
  onValue(ref(db,`chats/${c.chatId}/messages`),snap=>{
    setMsgs(Object.values(snap.val()||{}).sort((a,b)=>a.timestamp-b.timestamp));
  });
  onValue(ref(db,`chats/${c.chatId}/typing`),snap=>{
    const td=snap.val()||{};
    setIsTyping(Object.keys(td).some(uid=>uid!==user?.uid&&td[uid]));
  });
};
const sendMsg=async(imgData=null,voiceData=null)=>{
  if(!activeChat||(!inp.trim()&&!imgData&&!voiceData))return;
  const msg={text:imgData||voiceData?"":inp.trim(),image:imgData||null,voice:voiceData||null,senderUid:user.uid,senderName:user.displayName||user.email,timestamp:Date.now()};
  await push(ref(db,`chats/${activeChat.chatId}/messages`),msg);
  const last=imgData?"📷 Photo":voiceData?"🎤 Voice":inp.trim();
  await set(ref(db,`userChats/${user.uid}/${activeChat.chatId}/lastMsg`),last);
  await set(ref(db,`userChats/${activeChat.uid}/${activeChat.chatId}/lastMsg`),last);
  await set(ref(db,`userChats/${user.uid}/${activeChat.chatId}/lastTime`),serverTimestamp());
  await set(ref(db,`userChats/${activeChat.uid}/${activeChat.chatId}/lastTime`),serverTimestamp());
  const cu=unread[activeChat.chatId]||0;
  await set(ref(db,`userChats/${activeChat.uid}/${activeChat.chatId}/unread`),cu+1);
  set(ref(db,`chats/${activeChat.chatId}/typing/${user.uid}`),null);
  setInp("");setShowEmoji(false);
};
const handleTyping=v=>{
  setInp(v);
  if(!activeChat)return;
  set(ref(db,`chats/${activeChat.chatId}/typing/${user.uid}`),true);
  clearTimeout(typTimer.current);
  typTimer.current=setTimeout(()=>set(ref(db,`chats/${activeChat.chatId}/typing/${user.uid}`),null),2000);
};
const handleImg=e=>{
  const f=e.target.files[0];if(!f)return;
  if(f.size>2000000){alert("Max 2MB");return;}
  const r=new FileReader();r.onload=ev=>sendMsg(ev.target.result);r.readAsDataURL(f);e.target.value="";
};
const postS=async(imgData=null)=>{
  if(!sText.trim()&&!imgData)return;
  await push(ref(db,"statuses"),{uid:user.uid,name:user.displayName||user.email,text:sText.trim(),image:imgData||null,timestamp:Date.now()});
  setSText("");setShowAddS(false);
};
const handleSImg=e=>{
  const f=e.target.files[0];if(!f)return;
  if(f.size>500000){alert("Max 500KB");return;}
  const r=new FileReader();r.onload=ev=>postS(ev.target.result);r.readAsDataURL(f);e.target.value="";
};
const genInvite=()=>{setInvL(`${window.location.origin}?invite=${btoa(user.email)}`);setShowInvite(true);};
const copyLink=()=>{navigator.clipboard.writeText(invL).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});};
const startCall=async type=>{
  if(!activeChat)return;
  setCallType(type);setInCall(true);setCallStart(Date.now());
  try{
    const stream=await navigator.mediaDevices.getUserMedia({video:type==="video",audio:true});
    lsRef.current=stream;if(lvRef.current)lvRef.current.srcObject=stream;
    const pc=new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"}]});
    pcRef.current=pc;stream.getTracks().forEach(t=>pc.addTrack(t,stream));
    pc.ontrack=e=>{if(rvRef.current)rvRef.current.srcObject=e.streams[0];};
    const offer=await pc.createOffer();await pc.setLocalDescription(offer);
    await set(ref(db,`calls/${activeChat.chatId}`),{offer:JSON.stringify(offer),caller:user.uid,callerName:user.displayName,type,timestamp:Date.now()});
    onValue(ref(db,`calls/${activeChat.chatId}/answer`),async snap=>{if(snap.val()&&pc.signalingState!=="stable")await pc.setRemoteDescription(JSON.parse(snap.val()));});
    pc.onicecandidate=e=>{if(e.candidate)push(ref(db,`calls/${activeChat.chatId}/callerCandidates`),JSON.stringify(e.candidate));};
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
  const callRef=ref(db,`calls/${activeChat.chatId}`);
  onValue(callRef,async snap=>{
    const data=snap.val();
    if(data&&data.caller!==user.uid&&data.offer&&!inCall){
      if(window.confirm(`📞 Incoming ${data.type==="video"?"Video":"Audio"} call from ${data.callerName}!`)){
        setCallType(data.type);setInCall(true);setCallStart(Date.now());
        try{
          const stream=await navigator.mediaDevices.getUserMedia({video:data.type==="video",audio:true});
          lsRef.current=stream;if(lvRef.current)lvRef.current.srcObject=stream;
          const pc=new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"}]});
          pcRef.current=pc;stream.getTracks().forEach(t=>pc.addTrack(t,stream));
          pc.ontrack=e=>{if(rvRef.current)rvRef.current.srcObject=e.streams[0];};
          await pc.setRemoteDescription(JSON.parse(data.offer));
          const ans=await pc.createAnswer();await pc.setLocalDescription(ans);
          await set(ref(db,`calls/${activeChat.chatId}/answer`),JSON.stringify(ans));
          pc.onicecandidate=e=>{if(e.candidate)push(ref(db,`calls/${activeChat.chatId}/calleeCandidates`),JSON.stringify(e.candidate));};
          saveCall(user,{name:data.callerName,type:data.type,direction:"incoming",status:"completed",duration:0});
        }catch{alert("Call failed");setInCall(false);}
      }else saveCall(user,{name:data.callerName,type:data.type,direction:"incoming",status:"missed",duration:0});
    }
  });
},[user,activeChat]);

const totalUnread=Object.values(unread).reduce((a,b)=>a+b,0);
const myS=statuses.filter(s=>s.uid===user?.uid);
const othS=statuses.filter(s=>s.uid!==user?.uid);
const allC=Object.entries(contacts);
const ulC=allC.filter(([id])=>!locks[id]||unlocked.includes(id));
const lkC=allC.filter(([id])=>locks[id]&&!unlocked.includes(id));
const sortedC=ulC.sort(([a],[b])=>(pins.includes(a)?0:1)-(pins.includes(b)?0:1));
const filtC=searchQ?sortedC.filter(([,c])=>c.name?.toLowerCase().includes(searchQ.toLowerCase())||c.email?.toLowerCase().includes(searchQ.toLowerCase())):sortedC;
const filtCalls=callHist.filter(c=>{
  if(callF==="missed")return c.status==="missed";
  if(callF==="incoming")return c.direction==="incoming";
  if(callF==="outgoing")return c.direction==="outgoing";
  return true;
});

const Av=({name,p,size=44,ring=false})=>(
  <div style={{position:"relative",flexShrink:0}}>
    {p?<img src={p} alt="a" style={{width:size,height:size,borderRadius:size*0.32,objectFit:"cover",border:ring?`2px solid ${T.blue}`:"none"}} />
    :<div style={{width:size,height:size,borderRadius:size*0.32,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:size*0.3,color:"#fff",border:ring?`2px solid ${T.blue}`:"none"}}>{gi(name)}</div>}
  </div>
);

const Inp=({value,onChange,placeholder,type="text",style={},...rest})=>(
  <input value={value} onChange={onChange} placeholder={placeholder} type={type}
    style={{padding:"13px 18px",background:T.card,border:`1.5px solid ${T.border}`,borderRadius:16,color:T.text,fontSize:14,outline:"none",fontFamily:"'Inter',sans-serif",transition:"all 0.2s",width:"100%",boxSizing:"border-box",...style}}
    onFocus={e=>{e.target.style.borderColor=T.blue;e.target.style.boxShadow=`0 0 0 3px rgba(79,142,247,0.15)`;}}
    onBlur={e=>{e.target.style.borderColor=T.border;e.target.style.boxShadow="none";}}
    {...rest} />
);

const Btn=({children,onClick,v="primary",style={}})=>(
  <div onClick={onClick} style={{padding:"13px 20px",background:v==="danger"?T.gradD:v==="ghost"?T.card2:v==="success"?T.gradG:T.grad,borderRadius:16,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",textAlign:"center",boxShadow:v==="ghost"?"none":T.shadow,transition:"all 0.2s",userSelect:"none",fontFamily:"'Poppins',sans-serif",...style}}
    onMouseDown={e=>e.currentTarget.style.transform="scale(0.97)"}
    onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}
    onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
    {children}
  </div>
);

const Card=({children,style={}})=>(
  <div style={{background:T.card,borderRadius:20,border:`1px solid ${T.border}`,boxShadow:T.cardShadow,...style}}>{children}</div>
);

const Toggle=({val,onToggle})=>(
  <div onClick={onToggle} style={{width:52,height:28,borderRadius:14,background:val?T.grad:T.card2,position:"relative",cursor:"pointer",transition:"all 0.3s",border:`1px solid ${T.border}`,flexShrink:0}}>
    <div style={{position:"absolute",top:3,left:val?26:3,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"all 0.3s",boxShadow:"0 2px 6px rgba(0,0,0,0.3)"}} />
  </div>
);

const Modal=({children,onClose})=>(
  <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"fadeIn 0.2s ease"}}>
    <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:420,animation:"slideUp 0.3s ease"}}>{children}</div>
  </div>
);

if(loading)return(
  <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:T.bg,flexDirection:"column",gap:28,fontFamily:"'Poppins',sans-serif"}}>
    <style>{Sty}</style>
    <div style={{position:"relative"}}>
      <div style={{width:100,height:100,borderRadius:30,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:48,animation:"pulse 2s infinite",boxShadow:"0 0 60px rgba(79,142,247,0.6)"}}>💬</div>
      <div style={{position:"absolute",inset:-8,borderRadius:38,border:"2px solid rgba(79,142,247,0.3)",animation:"ring 2s infinite"}} />
      <div style={{position:"absolute",inset:-18,borderRadius:48,border:"1px solid rgba(139,92,246,0.15)",animation:"ring 2s 0.4s infinite"}} />
    </div>
    <div style={{textAlign:"center"}}>
      <div style={{fontSize:30,fontWeight:900,background:T.grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:"-0.5px"}}>Khan Chats</div>
      <div style={{color:T.muted,fontSize:13,marginTop:6}}>Premium Messaging</div>
    </div>
    <div style={{display:"flex",gap:10}}>
      {[0,1,2].map(i=><div key={i} style={{width:9,height:9,borderRadius:"50%",background:T.grad,animation:`dot 1.4s ${i*0.2}s infinite`}} />)}
    </div>
  </div>
);

if(screen==="login"||screen==="register")return(
  <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:T.bg,fontFamily:"'Poppins',sans-serif",padding:20,animation:"fadeIn 0.5s ease"}}>
    <style>{Sty}</style>
    <div style={{width:"100%",maxWidth:420}}>
      <div style={{textAlign:"center",marginBottom:44}}>
        <div style={{width:88,height:88,borderRadius:28,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:44,margin:"0 auto 20px",boxShadow:T.shadowL,animation:"pulse 3s infinite"}}>💬</div>
        <h1 style={{color:T.text,fontWeight:900,fontSize:32,letterSpacing:"-0.8px"}}>Khan Chats</h1>
        <p style={{color:T.muted,fontSize:13,marginTop:8}}>Your premium messaging experience</p>
      </div>
      <Card style={{padding:5,marginBottom:24}}>
        <div style={{display:"flex",borderRadius:17,overflow:"hidden"}}>
          {["login","register"].map(s=>(
            <div key={s} onClick={()=>{setScreen(s);setAErr("");}}
              style={{flex:1,textAlign:"center",padding:"13px",cursor:"pointer",fontWeight:700,fontSize:14,background:screen===s?T.grad:"transparent",color:screen===s?"#fff":T.muted,borderRadius:15,margin:2,transition:"all 0.3s"}}>
              {s==="login"?"Sign In":"Sign Up"}
            </div>
          ))}
        </div>
      </Card>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {screen==="register"&&<Inp value={dn} onChange={e=>setDn(e.target.value)} placeholder="Full name" />}
        <Inp value={em} onChange={e=>setEm(e.target.value)} placeholder="Email address" type="email" />
        <Inp value={pw} onChange={e=>setPw(e.target.value)} placeholder="Password (6+ chars)" type="password" onKeyDown={e=>e.key==="Enter"&&(screen==="login"?login():register())} />
      </div>
      {aErr&&<div style={{color:"#EF4444",fontSize:13,margin:"12px 0",padding:"11px 16px",background:"rgba(239,68,68,0.08)",borderRadius:12,border:"1px solid rgba(239,68,68,0.2)"}}>{aErr}</div>}
      <Btn onClick={screen==="login"?login:register} style={{marginTop:16,fontSize:15,padding:"16px",borderRadius:20,boxShadow:T.shadowL}}>
        {aLoad?"Please wait...":(screen==="login"?"Sign In →":"Create Account →")}
      </Btn>
      <p style={{color:T.muted,fontSize:11,textAlign:"center",marginTop:24,lineHeight:1.8}}>
        Independent Messaging Platform · Not affiliated with WhatsApp or Meta<br/>
        <span onClick={()=>setPolicy("privacy")} style={{color:T.blue,cursor:"pointer"}}>Privacy Policy</span>{" · "}
        <span onClick={()=>setPolicy("terms")} style={{color:T.blue,cursor:"pointer"}}>Terms of Service</span>
      </p>
    </div>
    {policy&&<Modal onClose={()=>setPolicy(null)}>
      <Card style={{padding:28,maxHeight:"78vh",overflowY:"auto"}}>
        <div style={{fontWeight:800,fontSize:19,color:T.text,marginBottom:14}}>{policy==="privacy"?"🔒 Privacy Policy":"📋 Terms of Service"}</div>
        <div style={{color:T.mutedL,fontSize:13,lineHeight:1.9}}>
          {policy==="privacy"?<><p>Khan Chats is an independent platform committed to your privacy.</p><p><strong style={{color:T.text}}>Data:</strong> We collect email, name, profile photo, and messages.</p><p><strong style={{color:T.text}}>Security:</strong> Data stored securely on Firebase.</p><p><strong style={{color:T.text}}>Rights:</strong> You can delete your account and data at any time.</p><p><strong style={{color:T.text}}>Contact:</strong> khanchats.support@gmail.com</p></>
          :<><p>By using Khan Chats, you agree to these terms.</p><p><strong style={{color:T.text}}>Use:</strong> Only for lawful communication.</p><p><strong style={{color:T.text}}>Account:</strong> You are responsible for your account security.</p><p><strong style={{color:T.text}}>Disclaimer:</strong> Not affiliated with WhatsApp or Meta.</p></>}
        </div>
        <Btn onClick={()=>setPolicy(null)} style={{marginTop:20}}>Close</Btn>
      </Card>
    </Modal>}
  </div>
);

if(showSett)return(
  <div style={{position:"fixed",inset:0,background:T.bg,zIndex:9999,display:"flex",flexDirection:"column",fontFamily:"'Inter',sans-serif",color:T.text,animation:"slideR 0.3s ease"}}>
    <style>{Sty}</style>
    <div style={{display:"flex",alignItems:"center",padding:"16px 20px",background:T.card,gap:12,borderBottom:`1px solid ${T.border}`,boxShadow:"0 2px 12px rgba(0,0,0,0.3)"}}>
      <div onClick={()=>setShowSett(false)} style={{width:40,height:40,borderRadius:13,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:18,border:`1px solid ${T.border}`,flexShrink:0}}>←</div>
      <div style={{fontWeight:800,fontSize:20,fontFamily:"'Poppins',sans-serif"}}>Settings</div>
    </div>
    <div style={{display:"flex",background:T.card,borderBottom:`1px solid ${T.border}`,overflowX:"auto",padding:"0 6px"}}>
      {[["profile","👤","Profile"],["privacy","🔒","Privacy"],["notifs","🔔","Notifs"],["lang","🌐","Language"],["ai","🤖","AI"],["legal","📋","Legal"]].map(([tab,icon,label])=>(
        <div key={tab} onClick={()=>setSTab(tab)} style={{padding:"12px 14px",cursor:"pointer",fontSize:11,fontWeight:700,whiteSpace:"nowrap",color:sTab===tab?T.blue:T.muted,borderBottom:sTab===tab?`2.5px solid ${T.blue}`:"2.5px solid transparent",transition:"all 0.2s",letterSpacing:0.5}}>
          {icon} {label}
        </div>
      ))}
    </div>
    <div style={{flex:1,overflowY:"auto",padding:18,display:"flex",flexDirection:"column",gap:14}}>

      {sTab==="profile"&&<div style={{animation:"slideUp 0.3s ease"}}>
        <div style={{background:T.grad,borderRadius:24,padding:28,textAlign:"center",marginBottom:16,boxShadow:T.shadowL,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-20,right:-20,width:100,height:100,borderRadius:"50%",background:"rgba(255,255,255,0.05)"}} />
          <div style={{position:"relative",display:"inline-block",marginBottom:14}}>
            {pic?<img src={pic} alt="p" style={{width:96,height:96,borderRadius:"50%",objectFit:"cover",border:"3px solid rgba(255,255,255,0.4)"}} />
            :<div style={{width:96,height:96,borderRadius:"50%",background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:34,color:"#fff",border:"3px solid rgba(255,255,255,0.3)",margin:"0 auto"}}>{gi(user?.displayName)}</div>}
            <div onClick={()=>picRef.current?.click()} style={{position:"absolute",bottom:2,right:2,background:"#fff",borderRadius:"50%",width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,boxShadow:"0 2px 10px rgba(0,0,0,0.25)"}}>📷</div>
          </div>
          <div style={{color:"#fff",fontWeight:800,fontSize:20,fontFamily:"'Poppins',sans-serif"}}>{user?.displayName}</div>
          <div style={{color:"rgba(255,255,255,0.6)",fontSize:13,marginTop:4}}>{user?.email}</div>
          {uname&&<div style={{color:"rgba(255,255,255,0.45)",fontSize:12,marginTop:2}}>@{uname}</div>}
          <input type="file" accept="image/*" ref={picRef} onChange={handlePic} style={{display:"none"}} />
        </div>
        <Card style={{padding:20,marginBottom:14}}>
          <div style={{fontSize:10,color:T.blue,fontWeight:700,marginBottom:14,textTransform:"uppercase",letterSpacing:1.5}}>Edit Profile</div>
          {[["Name",newName,setNewName,"Your display name"],["Username",uname,setUname,"@username (optional)"],["Bio",bio,setBio,"Tell people about yourself"]].map(([l,v,fn,ph])=>(
            <div key={l} style={{marginBottom:12}}>
              <div style={{fontSize:11,color:T.mutedL,fontWeight:600,marginBottom:5}}>{l}</div>
              <Inp value={v} onChange={e=>fn(e.target.value)} placeholder={ph} />
            </div>
          ))}
          <Btn onClick={saveProfile} style={{marginTop:6}}>Save Changes ✓</Btn>
        </Card>
        <Card style={{padding:18,marginBottom:14}}>
          <div style={{fontSize:10,color:T.blue,fontWeight:700,marginBottom:12,textTransform:"uppercase",letterSpacing:1.5}}>Chat Locks</div>
          {Object.entries(contacts).length===0?<div style={{color:T.muted,fontSize:13,textAlign:"center",padding:16}}>No contacts yet</div>
          :Object.entries(contacts).map(([chatId,c])=>(
            <div key={chatId} style={{display:"flex",alignItems:"center",padding:"11px 14px",background:T.card2,borderRadius:14,marginBottom:8,gap:12,border:`1px solid ${T.border}`}}>
              <Av name={c.name} size={40} />
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14,color:T.text}}>{c.name}</div>
                <div style={{fontSize:11,color:locks[chatId]?"#EF4444":T.muted,marginTop:2,fontWeight:600}}>{locks[chatId]?"🔒 Locked":"🔓 Unlocked"}</div>
              </div>
              {locks[chatId]
                ?<div onClick={()=>{if(window.confirm("Remove lock?"))removeLock(chatId);}} style={{padding:"7px 12px",background:"rgba(239,68,68,0.1)",borderRadius:10,color:"#EF4444",fontSize:12,fontWeight:700,cursor:"pointer"}}>Remove</div>
                :<div onClick={()=>{setLModal(chatId);setLPin("");setLErr("");}} style={{padding:"7px 14px",background:T.grad,borderRadius:10,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>🔒 Lock</div>}
            </div>
          ))}
        </Card>
        <Btn onClick={()=>setLogoutC(true)} v="danger" style={{marginBottom:10}}>🚪 Sign Out</Btn>
        <div onClick={()=>setDeleteC(true)} style={{padding:"13px",background:"transparent",borderRadius:16,textAlign:"center",color:"#EF4444",fontWeight:600,cursor:"pointer",border:"1px solid rgba(239,68,68,0.3)",fontSize:14}}>🗑️ Delete Account</div>
      </div>}

      {sTab==="privacy"&&<div style={{animation:"slideUp 0.3s ease"}}>
        {[["Last Seen","Show last active time",true],["Online Status","Show when online",true],["Read Receipts","Show read ticks",true],["Profile Photo","Who can see your photo",true]].map(([title,desc,val],i)=>(
          <Card key={i} style={{padding:"16px 20px",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14,color:T.text}}>{title}</div>
                <div style={{fontSize:12,color:T.muted,marginTop:3}}>{desc}</div>
              </div>
              <Toggle val={val} onToggle={()=>{}} />
            </div>
          </Card>
        ))}
        <Card style={{padding:"16px 20px"}}>
          <div style={{fontWeight:700,fontSize:14,color:T.text,marginBottom:10}}>Blocked Contacts</div>
          <div style={{color:T.muted,fontSize:13,textAlign:"center",padding:12}}>No blocked contacts</div>
        </Card>
      </div>}

      {sTab==="notifs"&&<div style={{animation:"slideUp 0.3s ease"}}>
        {[["Messages","Message notifications","msgs"],["Updates","Status update notifications","updates"],["Calls","Call notifications","calls"]].map(([t,d,k])=>(
          <Card key={k} style={{padding:"16px 20px",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14,color:T.text}}>{t}</div>
                <div style={{fontSize:12,color:T.muted,marginTop:3}}>{d}</div>
              </div>
              <Toggle val={nSett[k]} onToggle={()=>setNSett(p=>({...p,[k]:!p[k]}))} />
            </div>
          </Card>
        ))}
        <Card style={{padding:"16px 20px",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:14,color:T.text}}>Dark Mode</div>
              <div style={{fontSize:12,color:T.muted,marginTop:3}}>Toggle dark/light theme</div>
            </div>
            <Toggle val={darkMode} onToggle={()=>setDarkMode(p=>!p)} />
          </div>
        </Card>
      </div>}

      {sTab==="lang"&&<div style={{animation:"slideUp 0.3s ease"}}>
        <Card style={{padding:16,marginBottom:14}}>
          <div style={{fontSize:10,color:T.blue,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:1.5}}>Selected: {lang}</div>
          <Inp value={langQ} onChange={e=>setLangQ(e.target.value)} placeholder="Search languages..." />
        </Card>
        {LANGS.filter(l=>l.toLowerCase().includes(langQ.toLowerCase())).map(l=>(
          <div key={l} onClick={()=>{setLang(l);setLangQ("");}}
            style={{padding:"13px 18px",background:lang===l?T.card2:T.card,borderRadius:14,cursor:"pointer",display:"flex",justifyContent:"space-between",marginBottom:6,border:`1.5px solid ${lang===l?T.blue:T.border}`,transition:"all 0.15s"}}>
            <span style={{color:T.text,fontSize:14,fontWeight:lang===l?700:400}}>{l}</span>
            {lang===l&&<span style={{color:T.blue,fontWeight:800}}>✓</span>}
          </div>
        ))}
      </div>}

      {sTab==="ai"&&<div style={{display:"flex",flexDirection:"column",minHeight:"55vh",animation:"slideUp 0.3s ease"}}>
        <div style={{background:T.grad,borderRadius:22,padding:22,marginBottom:16,textAlign:"center",boxShadow:T.shadowL}}>
          <div style={{fontSize:44,marginBottom:8}}>🤖</div>
          <div style={{fontWeight:800,fontSize:20,color:"#fff",fontFamily:"'Poppins',sans-serif"}}>Khan AI</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.65)",marginTop:4}}>Powered by Claude · Ask me anything</div>
        </div>
        <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,marginBottom:12,minHeight:180}}>
          {aiMsgs.length===0&&<div style={{textAlign:"center",color:T.muted,padding:40}}>
            <div style={{fontSize:44,marginBottom:10}}>✨</div>
            <div style={{fontWeight:700,fontSize:15,color:T.text}}>Ask anything!</div>
          </div>}
          {aiMsgs.map((m,i)=>(
            <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",animation:"msgIn 0.25s ease"}}>
              <div style={{maxWidth:"85%",padding:"12px 16px",background:m.role==="user"?T.grad:T.card,borderRadius:m.role==="user"?"20px 20px 5px 20px":"20px 20px 20px 5px",fontSize:14,color:T.text,lineHeight:1.7,boxShadow:m.role==="user"?T.shadow:T.cardShadow,border:m.role==="user"?"none":`1px solid ${T.border}`}}>
                {m.text}
              </div>
            </div>
          ))}
          {aiLoad&&<div style={{display:"flex",gap:6,padding:"12px 16px",background:T.card,borderRadius:"20px 20px 20px 5px",width:"fit-content",border:`1px solid ${T.border}`}}>
            {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:T.blue,animation:`dot 1.4s ${i*0.2}s infinite`}} />)}
          </div>}
        </div>
        <div style={{display:"flex",gap:10}}>
          <Inp value={aiIn} onChange={e=>setAiIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&askAI()} placeholder="Ask Khan AI..." style={{flex:1}} />
          <div onClick={askAI} style={{width:50,height:50,borderRadius:16,background:aiIn.trim()?T.grad:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:20,flexShrink:0,transition:"all 0.2s",boxShadow:aiIn.trim()?T.shadow:"none"}}>➤</div>
        </div>
      </div>}

      {sTab==="legal"&&<div style={{animation:"slideUp 0.3s ease"}}>
        {[["🔒 Privacy Policy","Read our privacy policy","privacy"],["📋 Terms of Service","Terms and conditions","terms"],["📧 Contact Us","Get help and support","contact"],["❓ Help & FAQ","Frequently asked questions","help"],["🗑️ Delete Account","Request account deletion","delete"]].map(([title,desc,action])=>(
          <Card key={action} style={{padding:"16px 20px",marginBottom:10,cursor:"pointer"}}
            onClick={()=>{
              if(action==="delete")setDeleteC(true);
              else if(action==="contact")alert("📧 Contact Us\n\nEmail: khanchats.support@gmail.com\n\nWe respond within 24 hours.");
              else if(action==="help")alert("❓ FAQ\n\n• How to lock a chat? → Settings → Profile → Chat Locks\n• How to invite friends? → Tap 🔗 in the header\n• How to change language? → Settings → Language\n• How to delete account? → Settings → Legal → Delete Account");
              else setPolicy(action);
            }}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14,color:T.text}}>{title}</div>
                <div style={{fontSize:12,color:T.muted,marginTop:3}}>{desc}</div>
              </div>
              <span style={{color:T.muted,fontSize:20}}>›</span>
            </div>
          </Card>
        ))}
        <Card style={{padding:20,marginTop:6,textAlign:"center"}}>
          <div style={{fontWeight:800,fontSize:15,background:T.grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontFamily:"'Poppins',sans-serif",marginBottom:6}}>Khan Chats</div>
          <div style={{fontSize:11,color:T.muted,lineHeight:1.8}}>Version 1.0.0 · Independent Platform<br/>Not affiliated with WhatsApp or Meta</div>
        </Card>
      </div>}
    </div>

    {logoutC&&<Modal onClose={()=>setLogoutC(false)}>
      <Card style={{padding:32,textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:14}}>🚪</div>
        <div style={{fontWeight:800,fontSize:19,color:T.text,marginBottom:8,fontFamily:"'Poppins',sans-serif"}}>Sign Out?</div>
        <div style={{color:T.muted,fontSize:13,marginBottom:22,lineHeight:1.6}}>Are you sure you want to sign out?</div>
        <div style={{display:"flex",gap:10}}><Btn onClick={()=>setLogoutC(false)} v="ghost" style={{flex:1}}>Cancel</Btn><Btn onClick={logout} v="danger" style={{flex:1}}>Sign Out</Btn></div>
      </Card>
    </Modal>}

    {deleteC&&<Modal onClose={()=>setDeleteC(false)}>
      <Card style={{padding:32,textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:14}}>⚠️</div>
        <div style={{fontWeight:800,fontSize:19,color:"#EF4444",marginBottom:8,fontFamily:"'Poppins',sans-serif"}}>Delete Account?</div>
        <div style={{color:T.muted,fontSize:13,marginBottom:22,lineHeight:1.6}}>This is permanent and cannot be undone. All your data will be deleted.</div>
        <div style={{display:"flex",gap:10}}><Btn onClick={()=>setDeleteC(false)} v="ghost" style={{flex:1}}>Cancel</Btn><Btn onClick={async()=>{await logout();setDeleteC(false);}} v="danger" style={{flex:1}}>Delete</Btn></div>
      </Card>
    </Modal>}

    {policy&&<Modal onClose={()=>setPolicy(null)}>
      <Card style={{padding:28,maxHeight:"75vh",overflowY:"auto"}}>
        <div style={{fontWeight:800,fontSize:19,color:T.text,marginBottom:14}}>{policy==="privacy"?"🔒 Privacy Policy":"📋 Terms of Service"}</div>
        <div style={{color:T.mutedL,fontSize:13,lineHeight:1.9}}>
          {policy==="privacy"?<><p>Khan Chats is independent and committed to your privacy.</p><p><strong style={{color:T.text}}>Data:</strong> Email, name, photo, messages.</p><p><strong style={{color:T.text}}>Security:</strong> Firebase infrastructure.</p><p><strong style={{color:T.text}}>Rights:</strong> Delete data anytime.</p></>
          :<><p>By using Khan Chats you agree to these terms.</p><p><strong style={{color:T.text}}>Use:</strong> Lawful communication only.</p><p><strong style={{color:T.text}}>Disclaimer:</strong> Not affiliated with WhatsApp or Meta.</p></>}
        </div>
        <Btn onClick={()=>setPolicy(null)} style={{marginTop:20}}>Close</Btn>
      </Card>
    </Modal>}
  </div>
);

if(lModal)return(
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:10001,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Poppins',sans-serif"}}>
    <style>{Sty}</style>
    <Card style={{padding:36,maxWidth:360,width:"100%",textAlign:"center",animation:"slideUp 0.3s ease"}}>
      <div style={{width:76,height:76,borderRadius:24,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,margin:"0 auto 18px",boxShadow:T.shadow}}>🔒</div>
      <h3 style={{color:T.text,fontWeight:800,fontSize:22,marginBottom:6}}>Set Chat PIN</h3>
      <p style={{color:T.muted,fontSize:13,marginBottom:22}}>Minimum 4 digits required</p>
      <Inp value={lPin} onChange={e=>setLPin(e.target.value.replace(/\D/g,""))} placeholder="• • • •" type="password" style={{fontSize:26,textAlign:"center",letterSpacing:12,marginBottom:8}} onFocus={e=>{}} onBlur={e=>{}} />
      {lErr&&<div style={{color:"#EF4444",fontSize:13,marginBottom:12,padding:"8px",background:"rgba(239,68,68,0.08)",borderRadius:10}}>{lErr}</div>}
      <div style={{display:"flex",gap:10,marginTop:10}}>
        <Btn onClick={()=>{setLModal(null);setLPin("");setLErr("");}} v="ghost" style={{flex:1}}>Cancel</Btn>
        <Btn onClick={()=>lockChat(lModal)} style={{flex:1}}>Lock 🔒</Btn>
      </div>
    </Card>
  </div>
);

if(ulModal)return(
  <div style={{position:"fixed",inset:0,background:T.bg,zIndex:10001,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Poppins',sans-serif"}}>
    <style>{Sty}</style>
    <Card style={{padding:36,maxWidth:360,width:"100%",textAlign:"center",animation:"slideUp 0.3s ease"}}>
      <div style={{width:76,height:76,borderRadius:24,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,margin:"0 auto 18px",boxShadow:T.shadow}}>🔐</div>
      <h3 style={{color:T.text,fontWeight:800,fontSize:22,marginBottom:6}}>Chat Locked</h3>
      <p style={{color:T.muted,fontSize:13,marginBottom:22}}>Enter your PIN to unlock</p>
      <Inp value={ulPin} onChange={e=>setUlPin(e.target.value.replace(/\D/g,""))} placeholder="• • • •" type="password" style={{fontSize:26,textAlign:"center",letterSpacing:12,marginBottom:8}} onKeyDown={e=>e.key==="Enter"&&unlockChat(ulModal)} />
      {lErr&&<div style={{color:"#EF4444",fontSize:13,marginBottom:12,padding:"8px",background:"rgba(239,68,68,0.08)",borderRadius:10}}>{lErr}</div>}
      <div style={{display:"flex",gap:10,marginTop:10}}>
        <Btn onClick={()=>{setUlModal(null);setUlPin("");setLErr("");}} v="ghost" style={{flex:1}}>Cancel</Btn>
        <Btn onClick={()=>unlockChat(ulModal)} style={{flex:1}}>Unlock →</Btn>
      </div>
    </Card>
  </div>
);

if(inCall)return(
  <div style={{position:"fixed",inset:0,background:T.bg,zIndex:9997,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:26,fontFamily:"'Poppins',sans-serif"}}>
    <style>{Sty}</style>
    <div style={{width:100,height:100,borderRadius:32,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:46,boxShadow:"0 0 60px rgba(79,142,247,0.5)",animation:"pulse 2s infinite"}}>{callType==="video"?"📹":"📞"}</div>
    <div style={{textAlign:"center"}}>
      <div style={{color:T.text,fontSize:26,fontWeight:800,letterSpacing:"-0.5px"}}>{activeChat?.name}</div>
      <div style={{color:T.muted,fontSize:14,marginTop:6}}>{callType==="video"?"Video":"Audio"} call in progress...</div>
    </div>
    {callType==="video"&&<div style={{display:"flex",gap:14}}>
      <video ref={lvRef} autoPlay muted style={{width:156,height:118,borderRadius:18,background:T.card,border:`2px solid ${T.blue}`,objectFit:"cover"}} />
      <video ref={rvRef} autoPlay style={{width:156,height:118,borderRadius:18,background:T.card,border:`2px solid ${T.purple}`,objectFit:"cover"}} />
    </div>}
    <Btn onClick={endCall} v="danger" style={{padding:"16px 48px",borderRadius:24,fontSize:16,boxShadow:"0 8px 32px rgba(239,68,68,0.45)"}}>End Call</Btn>
  </div>
);

return(
  <div style={{display:"flex",flexDirection:"column",height:"100vh",fontFamily:"'Inter',sans-serif",background:T.bg,color:T.text,overflow:"hidden",animation:"fadeIn 0.4s ease",maxWidth:500,margin:"0 auto",position:"relative",boxShadow:"0 0 100px rgba(0,0,0,0.5)"}}>
    <style>{Sty}</style>

    {/* Toast Notifications */}
    <div style={{position:"fixed",top:12,left:"50%",transform:"translateX(-50%)",zIndex:9999,display:"flex",flexDirection:"column",gap:8,width:"92%",maxWidth:460,pointerEvents:"none"}}>
      {toasts.map(t=>(
        <div key={t.id} onClick={()=>{openChat(t.contact);setToasts(p=>p.filter(x=>x.id!==t.id));}} style={{background:T.card,borderRadius:18,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 8px 32px rgba(0,0,0,0.5)",border:`1px solid ${T.border}`,animation:"slideDown 0.3s ease",cursor:"pointer",pointerEvents:"all",backdropFilter:"blur(20px)"}}>
          <div style={{width:36,height:36,borderRadius:12,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,color:"#fff",flexShrink:0}}>{gi(t.name)}</div>
          <div style={{flex:1,overflow:"hidden"}}>
            <div style={{fontWeight:700,fontSize:12,color:T.blue}}>{t.name}</div>
            <div style={{fontSize:13,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginTop:1}}>{t.text}</div>
          </div>
          <div style={{color:T.muted,fontSize:14,pointerEvents:"all"}} onClick={e=>{e.stopPropagation();setToasts(p=>p.filter(x=>x.id!==t.id));}}>✕</div>
        </div>
      ))}
    </div>

    {/* Image Preview */}
    {previewImg&&<div onClick={()=>setPreviewImg(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.97)",zIndex:9998,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,animation:"fadeIn 0.2s ease"}}>
      <img src={previewImg} alt="p" style={{maxWidth:"95vw",maxHeight:"80vh",borderRadius:20}} />
      <Btn onClick={()=>setPreviewImg(null)} v="ghost" style={{padding:"10px 24px"}}>Close ✕</Btn>
    </div>}

    {/* Status Viewer */}
    {viewS&&<div onClick={()=>setViewS(null)} style={{position:"fixed",inset:0,background:"#000",zIndex:10000,display:"flex",flexDirection:"column",animation:"fadeIn 0.2s ease"}}>
      <div style={{padding:"18px 22px",display:"flex",alignItems:"center",gap:14,background:"rgba(0,0,0,0.7)"}}>
        <Av name={viewS.name} size={46} />
        <div><div style={{fontWeight:700,color:"#fff",fontSize:16}}>{viewS.name}</div><div style={{fontSize:11,color:"rgba(255,255,255,0.5)",marginTop:2}}>{tAgo(viewS.timestamp)}</div></div>
        <span style={{marginLeft:"auto",fontSize:24,color:"rgba(255,255,255,0.6)",cursor:"pointer"}}>✕</span>
      </div>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
        {viewS.image&&<img src={viewS.image} alt="s" style={{maxWidth:"100%",maxHeight:"70vh",borderRadius:20}} />}
        {viewS.text&&<p style={{color:"#fff",fontSize:22,textAlign:"center",lineHeight:1.6,fontWeight:600,maxWidth:380}}>{viewS.text}</p>}
      </div>
    </div>}

    {/* Invite Modal */}
    {showInvite&&<Modal onClose={()=>setShowInvite(false)}>
      <Card style={{padding:32,textAlign:"center"}}>
        <div style={{width:68,height:68,borderRadius:22,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,margin:"0 auto 16px",boxShadow:T.shadow}}>🔗</div>
        <h3 style={{color:T.text,fontWeight:800,fontSize:20,marginBottom:8,fontFamily:"'Poppins',sans-serif"}}>Invite Friends</h3>
        <p style={{color:T.muted,fontSize:13,marginBottom:20}}>Share this link to invite friends to Khan Chats</p>
        <div style={{background:T.card2,borderRadius:12,padding:"12px 14px",fontSize:11,color:T.blue,wordBreak:"break-all",marginBottom:20,border:`1px solid ${T.border}`,lineHeight:1.6}}>{invL}</div>
        <Btn onClick={copyLink} style={{marginBottom:10}}>{copied?"✅ Copied!":"📋 Copy Invite Link"}</Btn>
        <div onClick={()=>setShowInvite(false)} style={{padding:"10px",color:T.muted,cursor:"pointer",fontSize:13}}>Close</div>
      </Card>
    </Modal>}

    {/* Policy Modal */}
    {policy&&<Modal onClose={()=>setPolicy(null)}>
      <Card style={{padding:28,maxHeight:"75vh",overflowY:"auto"}}>
        <div style={{fontWeight:800,fontSize:18,color:T.text,marginBottom:14}}>{policy==="privacy"?"🔒 Privacy Policy":"📋 Terms"}</div>
        <div style={{color:T.mutedL,fontSize:13,lineHeight:1.9}}>
          {policy==="privacy"?<><p>Independent platform committed to privacy.</p><p><strong style={{color:T.text}}>Data:</strong> Email, name, photo, messages.</p><p><strong style={{color:T.text}}>Security:</strong> Firebase.</p><p><strong style={{color:T.text}}>Rights:</strong> Delete anytime.</p></>
          :<><p>By using Khan Chats you agree.</p><p><strong style={{color:T.text}}>Use:</strong> Lawful only.</p><p><strong style={{color:T.text}}>Disclaimer:</strong> Not affiliated with WhatsApp or Meta.</p></>}
        </div>
        <Btn onClick={()=>setPolicy(null)} style={{marginTop:18}}>Close</Btn>
      </Card>
    </Modal>}

    {/* CHAT SCREEN */}
    {nav==="chat"&&activeChat?(
      <div style={{display:"flex",flexDirection:"column",height:"100%",background:T.bg}}>
        {/* Chat Header */}
        <div style={{display:"flex",alignItems:"center",padding:"13px 16px",background:T.card,gap:12,borderBottom:`1px solid ${T.border}`,boxShadow:"0 2px 16px rgba(0,0,0,0.3)",flexShrink:0}}>
          <div onClick={()=>{setNav("home");setShowEmoji(false);}} style={{width:38,height:38,borderRadius:12,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:17,border:`1px solid ${T.border}`,flexShrink:0}}>←</div>
          <div style={{width:44,height:44,borderRadius:14,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:17,color:"#fff",flexShrink:0,boxShadow:T.shadow}}>{gi(activeChat.name)}</div>
          <div style={{flex:1,overflow:"hidden",cursor:"pointer"}}>
            <div style={{fontWeight:800,fontSize:15,color:T.text,fontFamily:"'Poppins',sans-serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{activeChat.name}</div>
            <div style={{fontSize:11,color:isTyping?T.purple:T.blue,fontWeight:600,marginTop:1,animation:isTyping?"fadeIn 0.3s ease":""}}>{isTyping?"typing...":"● Online"}</div>
          </div>
          <div style={{display:"flex",gap:6,flexShrink:0}}>
            {[["📞",()=>startCall("audio")],["📹",()=>startCall("video")]].map(([icon,fn])=>(
              <div key={icon} onClick={fn} style={{width:38,height:38,borderRadius:12,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:17,border:`1px solid ${T.border}`,transition:"all 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.background=T.card3}
                onMouseLeave={e=>e.currentTarget.style.background=T.card2}>{icon}</div>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div style={{flex:1,overflowY:"auto",padding:"16px 14px",display:"flex",flexDirection:"column",gap:3}}>
          {msgs.length===0&&<div style={{textAlign:"center",margin:"auto",color:T.muted,padding:40}}>
            <div style={{fontSize:56,marginBottom:16,opacity:0.35}}>👋</div>
            <div style={{fontSize:17,fontWeight:700,color:T.text,fontFamily:"'Poppins',sans-serif"}}>Say hello!</div>
            <div style={{fontSize:12,marginTop:8}}>Start your conversation with {activeChat.name}</div>
          </div>}
          {msgs.map((msg,i)=>{
            const isMine=msg.senderUid===user.uid;
            const showAvatar=!isMine&&(i===0||msgs[i-1]?.senderUid!==msg.senderUid);
            return(
              <div key={i} style={{display:"flex",justifyContent:isMine?"flex-end":"flex-start",marginBottom:isMine===false&&msgs[i+1]?.senderUid===msg.senderUid?1:6,animation:"msgIn 0.25s ease"}}>
                {!isMine&&<div style={{width:30,height:showAvatar?30:30,marginRight:8,flexShrink:0,alignSelf:"flex-end"}}>
                  {showAvatar&&<div style={{width:30,height:30,borderRadius:10,background:cfn(msg.senderName),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:10,color:"#fff"}}>{gi(msg.senderName)}</div>}
                </div>}
                <div style={{maxWidth:"74%",
                  padding:msg.image?"7px 7px 8px":(msg.voice?"10px 14px 8px":"11px 16px 9px"),
                  background:isMine?T.gradS:T.card2,
                  borderRadius:isMine?"20px 20px 5px 20px":"20px 20px 20px 5px",
                  boxShadow:isMine?"0 3px 16px rgba(30,64,175,0.4)":"0 2px 10px rgba(0,0,0,0.3)",
                  border:isMine?"none":`1px solid ${T.border}`}}>
                  {!isMine&&showAvatar&&<div style={{fontSize:10,color:T.blue,fontWeight:700,marginBottom:5}}>{msg.senderName}</div>}
                  {msg.image&&<img src={msg.image} alt="s" onClick={()=>setPreviewImg(msg.image)} style={{maxWidth:220,maxHeight:220,borderRadius:14,display:"block",cursor:"zoom-in",objectFit:"cover"}} />}
                  {msg.voice&&<div style={{display:"flex",alignItems:"center",gap:10,padding:"4px 0"}}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:isMine?"rgba(255,255,255,0.15)":T.card3,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,cursor:"pointer"}}>▶️</div>
                    <div style={{flex:1}}>
                      <div style={{height:3,background:isMine?"rgba(255,255,255,0.3)":T.border,borderRadius:2}}><div style={{width:"45%",height:"100%",background:isMine?"rgba(255,255,255,0.7)":T.blue,borderRadius:2}} /></div>
                      <div style={{fontSize:10,color:isMine?"rgba(255,255,255,0.5)":T.muted,marginTop:4}}>0:12</div>
                    </div>
                  </div>}
                  {msg.text&&<p style={{margin:msg.image?"8px 4px 0":0,fontSize:14,lineHeight:1.65,color:T.text,wordBreak:"break-word",whiteSpace:"pre-wrap"}}>{msg.text}</p>}
                  <div style={{display:"flex",justifyContent:"flex-end",gap:4,marginTop:5,alignItems:"center"}}>
                    <span style={{fontSize:10,color:isMine?"rgba(255,255,255,0.45)":T.muted}}>{ft(msg.timestamp)}</span>
                    {isMine&&<span style={{fontSize:11,color:"rgba(255,255,255,0.55)"}}>✓✓</span>}
                  </div>
                </div>
              </div>
            );
          })}
          {isTyping&&<div style={{display:"flex",alignItems:"flex-end",gap:8,marginTop:4,animation:"msgIn 0.3s ease"}}>
            <div style={{width:30,height:30,borderRadius:10,background:cfn(activeChat.name),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:10,color:"#fff",flexShrink:0}}>{gi(activeChat.name)}</div>
            <div style={{padding:"12px 16px",background:T.card2,borderRadius:"20px 20px 20px 5px",border:`1px solid ${T.border}`,display:"flex",gap:5,alignItems:"center"}}>
              {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:T.purple,animation:`dot 1.4s ${i*0.2}s infinite`}} />)}
            </div>
          </div>}
          <div ref={endRef} />
        </div>

        {/* Emoji Picker */}
        {showEmoji&&<div style={{background:T.card,borderTop:`1px solid ${T.border}`,padding:14,animation:"slideUp 0.2s ease",flexShrink:0}}>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {EMOJIS.map(e=>(
              <div key={e} onClick={()=>{setInp(p=>p+e);}} style={{fontSize:24,cursor:"pointer",padding:"4px 6px",borderRadius:8,transition:"background 0.15s"}}
                onMouseEnter={ev=>ev.currentTarget.style.background=T.card2}
                onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>{e}</div>
            ))}
          </div>
        </div>}

        {/* Input Bar */}
        <div style={{padding:"10px 12px",background:T.card,borderTop:`1px solid ${T.border}`,flexShrink:0}}>
          <input type="file" accept="image/*,video/*" ref={fileRef} onChange={handleImg} style={{display:"none"}} />
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div onClick={()=>setShowEmoji(p=>!p)} style={{width:40,height:40,borderRadius:13,background:showEmoji?T.grad:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:19,border:`1px solid ${T.border}`,flexShrink:0,transition:"all 0.2s"}}>😊</div>
            <div style={{display:"flex",alignItems:"center",background:T.card2,borderRadius:22,flex:1,padding:"9px 14px",gap:8,border:`1.5px solid ${T.border}`,minHeight:44}}>
              <input value={inp} onChange={e=>handleTyping(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendMsg()} placeholder="Message..."
                style={{flex:1,background:"none",border:"none",outline:"none",color:T.text,fontSize:14,fontFamily:"'Inter',sans-serif"}} />
              <div onClick={()=>fileRef.current?.click()} style={{cursor:"pointer",fontSize:17,opacity:0.45,flexShrink:0,transition:"opacity 0.2s"}}
                onMouseEnter={e=>e.currentTarget.style.opacity=1}
                onMouseLeave={e=>e.currentTarget.style.opacity=0.45}>📎</div>
            </div>
            <div onClick={()=>sendMsg()} style={{width:44,height:44,borderRadius:15,background:inp.trim()?T.grad:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:inp.trim()?17:19,border:`1px solid ${T.border}`,boxShadow:inp.trim()?T.shadow:"none",transition:"all 0.25s",flexShrink:0}}>
              {inp.trim()?"➤":"🎤"}
            </div>
          </div>
        </div>
      </div>
    ):(
      /* MAIN APP */
      <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
        {/* Header */}
        <div style={{padding:"15px 18px 12px",background:T.card,borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:40,height:40,borderRadius:13,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:16,color:"#fff",overflow:"hidden",cursor:"pointer",boxShadow:T.shadow,flexShrink:0}}
              onClick={()=>{setShowSett(true);setSTab("profile");}}>
              {pic?<img src={pic} alt="p" style={{width:40,height:40,objectFit:"cover"}} />:gi(user?.displayName||user?.email)}
            </div>
            <div>
              <div style={{fontWeight:800,fontSize:18,color:T.text,letterSpacing:"-0.4px",fontFamily:"'Poppins',sans-serif"}}>Khan Chats</div>
              <div style={{fontSize:10,color:T.blue,fontWeight:600}}>● Active</div>
            </div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <div onClick={()=>setShowSearch(p=>!p)} style={{width:36,height:36,borderRadius:11,background:showSearch?T.grad:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:15,border:`1px solid ${T.border}`,transition:"all 0.2s"}}>🔍</div>
            <div onClick={genInvite} style={{width:36,height:36,borderRadius:11,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:15,border:`1px solid ${T.border}`}}>🔗</div>
            <div onClick={()=>setShowSett(true)} style={{width:36,height:36,borderRadius:11,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:15,border:`1px solid ${T.border}`}}>⚙️</div>
          </div>
        </div>

        {/* Search */}
        {showSearch&&<div style={{padding:"10px 14px",background:T.card2,borderBottom:`1px solid ${T.border}`,animation:"slideDown 0.2s ease",flexShrink:0}}>
          <Inp value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search contacts and messages..." autoFocus style={{background:T.card,border:`1.5px solid ${T.blue}`,boxShadow:`0 0 0 3px rgba(79,142,247,0.1)`}} />
        </div>}

        {/* Tabs */}
        <div style={{display:"flex",background:T.card,borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
          {[["messages","💬","Messages",totalUnread],["updates","✨","Updates",othS.length],["calls","📞","Calls",0]].map(([v,icon,label,badge])=>(
            <div key={v} onClick={()=>setView(v)} style={{flex:1,textAlign:"center",padding:"11px 4px 10px",cursor:"pointer",position:"relative",transition:"all 0.2s"}}>
              <div style={{fontSize:17,marginBottom:2}}>{icon}</div>
              <div style={{fontSize:10,fontWeight:700,fontFamily:"'Poppins',sans-serif",color:view===v?T.blue:"rgba(74,85,104,0.7)",letterSpacing:0.4,transition:"color 0.2s"}}>{label}</div>
              {view===v&&<div style={{position:"absolute",bottom:0,left:"18%",right:"18%",height:2,background:T.grad,borderRadius:2,boxShadow:`0 0 8px ${T.blue}`}} />}
              {badge>0&&<div style={{position:"absolute",top:7,right:"14%",background:T.gradD,borderRadius:10,minWidth:17,height:17,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#fff",padding:"0 3px",animation:"badgePop 0.3s ease"}}>{badge>9?"9+":badge}</div>}
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{flex:1,overflowY:"auto",paddingBottom:72}}>

          {/* MESSAGES */}
          {view==="messages"&&<div style={{animation:"fadeIn 0.25s ease"}}>
            {showNew&&<div style={{padding:"12px 14px",background:T.card2,borderBottom:`1px solid ${T.border}`,animation:"slideDown 0.2s ease"}}>
              <Inp value={nEmail} onChange={e=>setNEmail(e.target.value)} placeholder="Friend's email to start chat..." style={{marginBottom:10}} onKeyDown={e=>e.key==="Enter"&&startChat()} />
              {nEmailErr&&<div style={{color:"#EF4444",fontSize:12,marginBottom:8,padding:"7px 12px",background:"rgba(239,68,68,0.08)",borderRadius:10,border:"1px solid rgba(239,68,68,0.15)"}}>{nEmailErr}</div>}
              <div style={{display:"flex",gap:8}}>
                <Btn onClick={startChat} style={{flex:1,padding:"11px",borderRadius:13}}>Start Chat</Btn>
                <Btn onClick={()=>{setShowNew(false);setNEmailErr("");}} v="ghost" style={{padding:"11px 16px",borderRadius:13}}>✕</Btn>
              </div>
            </div>}

            {/* Home Welcome Cards */}
            {!searchQ&&filtC.length===0&&lkC.length===0?(
              <div style={{padding:"28px 18px",animation:"fadeIn 0.3s ease"}}>
                {/* Welcome Banner */}
                <div style={{background:T.grad,borderRadius:24,padding:24,marginBottom:18,position:"relative",overflow:"hidden",boxShadow:T.shadowL}}>
                  <div style={{position:"absolute",top:-20,right:-20,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.06)"}} />
                  <div style={{position:"absolute",bottom:-30,left:-15,width:90,height:90,borderRadius:"50%",background:"rgba(255,255,255,0.04)"}} />
                  <div style={{position:"relative"}}>
                    <div style={{fontSize:36,marginBottom:10}}>👋</div>
                    <div style={{fontWeight:800,fontSize:20,color:"#fff",fontFamily:"'Poppins',sans-serif",marginBottom:6}}>
                      Welcome, {user?.displayName?.split(" ")[0]}!
                    </div>
                    <div style={{fontSize:13,color:"rgba(255,255,255,0.7)",lineHeight:1.6,marginBottom:18}}>
                      Start connecting with friends on Khan Chats
                    </div>
                    <div style={{display:"flex",gap:10",flexWrap:"wrap"}}>
                      <Btn onClick={()=>setShowNew(true)} style={{background:"rgba(255,255,255,0.2)",borderRadius:14,padding:"11px 20px",fontSize:13,backdropFilter:"blur(10px)",boxShadow:"none",border:"1px solid rgba(255,255,255,0.2)"}}>
                        ✏️ New Chat
                      </Btn>
                      <Btn onClick={genInvite} style={{background:"rgba(255,255,255,0.15)",borderRadius:14,padding:"11px 20px",fontSize:13,backdropFilter:"blur(10px)",boxShadow:"none",border:"1px solid rgba(255,255,255,0.2)"}}>
                        🔗 Invite
                      </Btn>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:18}}>
                  {[["💬","New Message","Start a conversation",()=>setShowNew(true)],["✨","Updates","Share your status",()=>setView("updates")],["📞","Calls","View call history",()=>setView("calls")],["🤖","Khan AI","Ask AI anything",()=>{setShowSett(true);setSTab("ai");}]].map(([icon,title,desc,fn])=>(
                    <div key={title} onClick={fn} style={{background:T.card,borderRadius:18,padding:18,cursor:"pointer",border:`1px solid ${T.border}`,transition:"all 0.2s",boxShadow:T.cardShadow}}
                      onMouseEnter={e=>e.currentTarget.style.background=T.card2}
                      onMouseLeave={e=>e.currentTarget.style.background=T.card}>
                      <div style={{fontSize:28,marginBottom:8}}>{icon}</div>
                      <div style={{fontWeight:700,fontSize:14,color:T.text,marginBottom:3}}>{title}</div>
                      <div style={{fontSize:11,color:T.muted}}>{desc}</div>
                    </div>
                  ))}
                </div>

                <div style={{background:T.card,borderRadius:18,padding:20,border:`1px solid ${T.border}`,textAlign:"center"}}>
                  <div style={{fontSize:36,marginBottom:10}}>🚀</div>
                  <div style={{fontWeight:700,fontSize:15,color:T.text,fontFamily:"'Poppins',sans-serif",marginBottom:6}}>Get Started</div>
                  <div style={{fontSize:12,color:T.muted,lineHeight:1.7,marginBottom:16}}>Invite your friends and start messaging, calling, and sharing updates</div>
                  <Btn onClick={genInvite} style={{fontSize:13,padding:"12px 24px"}}>🔗 Invite Friends Now</Btn>
                </div>
              </div>
            ):(
              <>
                {/* Recent Activity */}
                {!searchQ&&recentActivity.length>0&&<div style={{padding:"12px 16px 0"}}>
                  <div style={{fontSize:10,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:10}}>Recent</div>
                  <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:10}}>
                    {recentActivity.map(c=>(
                      <div key={c.chatId} onClick={()=>handleChatClick(c)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,cursor:"pointer",flexShrink:0}}>
                        <div style={{position:"relative"}}>
                          <div style={{width:52,height:52,borderRadius:17,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:18,color:"#fff"}}>{gi(c.name)}</div>
                          {(unread[c.chatId]||0)>0&&<div style={{position:"absolute",top:-3,right:-3,width:18,height:18,background:T.gradD,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#fff",animation:"badgePop 0.3s ease"}}>{(unread[c.chatId]||0)>9?"9+":unread[c.chatId]}</div>}
                        </div>
                        <div style={{fontSize:11,color:T.mutedL,fontWeight:600,maxWidth:60,textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name.split(" ")[0]}</div>
                      </div>
                    ))}
                  </div>
                </div>}

                {filtC.map(([chatId,contact],idx)=>(
                  <div key={chatId} onClick={()=>handleChatClick(contact)}
                    style={{display:"flex",alignItems:"center",padding:"13px 18px",cursor:"pointer",gap:13,background:activeChat?.chatId===chatId?T.card2:"transparent",borderBottom:`1px solid ${T.border}`,transition:"all 0.15s ease",animation:`slideUp 0.3s ${idx*0.04}s ease both`}}
                    onMouseEnter={e=>e.currentTarget.style.background=T.card}
                    onMouseLeave={e=>e.currentTarget.style.background=activeChat?.chatId===chatId?T.card2:"transparent"}>
                    <div style={{position:"relative",flexShrink:0}}>
                      <div style={{width:52,height:52,borderRadius:17,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:18,color:"#fff",boxShadow:"0 2px 10px rgba(79,142,247,0.2)"}}>
                        {gi(contact.name)}
                      </div>
                      {pins.includes(chatId)&&<div style={{position:"absolute",top:-5,right:-5,fontSize:10,background:T.bg,borderRadius:"50%",width:17,height:17,display:"flex",alignItems:"center",justifyContent:"center"}}>📌</div>}
                    </div>
                    <div style={{flex:1,overflow:"hidden"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                        <span style={{fontWeight:700,fontSize:14,color:T.text,letterSpacing:"-0.1px"}}>{contact.name}</span>
                        <span style={{fontSize:10,color:T.muted,fontWeight:500,flexShrink:0}}>{tAgo(contact.lastTime)}</span>
                      </div>
                      <div style={{fontSize:12,color:T.muted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{contact.lastMsg||contact.email}</div>
                    </div>
                    {(unread[chatId]||0)>0&&<div style={{minWidth:20,height:20,background:T.grad,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#fff",flexShrink:0,padding:"0 4px",boxShadow:T.shadow,animation:"badgePop 0.3s ease"}}>{(unread[chatId]||0)>9?"9+":unread[chatId]}</div>}
                  </div>
                ))}

                {lkC.length>0&&<>
                  <div onClick={()=>setShowLocked(p=>!p)} style={{display:"flex",alignItems:"center",padding:"12px 18px",cursor:"pointer",background:T.card2,borderBottom:`1px solid ${T.border}`,gap:10}}>
                    <div style={{width:40,height:40,borderRadius:13,background:"rgba(239,68,68,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,border:"1px solid rgba(239,68,68,0.15)"}}>🔒</div>
                    <span style={{fontWeight:700,fontSize:13,color:T.muted,flex:1}}>Locked Chats ({lkC.length})</span>
                    <span style={{color:T.muted,fontSize:13}}>{showLocked?"▲":"▼"}</span>
                  </div>
                  {showLocked&&lkC.map(([chatId],idx)=>(
                    <div key={chatId} onClick={()=>handleChatClick(contacts[chatId])} style={{display:"flex",alignItems:"center",padding:"13px 18px",cursor:"pointer",gap:13,background:T.bg,borderBottom:`1px solid ${T.border}`,animation:`slideUp 0.2s ${idx*0.04}s ease both`}}>
                      <div style={{width:52,height:52,borderRadius:17,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,border:`1px solid ${T.border}`}}>🔒</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:700,fontSize:14,color:T.muted}}>••••••••</div>
                        <div style={{fontSize:12,color:T.muted,marginTop:3}}>Tap to unlock</div>
                      </div>
                    </div>
                  ))}
                </>}

                {searchQ&&filtC.length===0&&<div style={{padding:50,textAlign:"center",color:T.muted}}>
                  <div style={{fontSize:48,marginBottom:12,opacity:0.3}}>🔍</div>
                  <div style={{fontWeight:700,fontSize:15,color:T.text}}>No results found</div>
                  <div style={{fontSize:12,marginTop:6}}>Try a different search term</div>
                </div>}
              </>
            )}
          </div>}

          {/* UPDATES */}
          {view==="updates"&&<div style={{animation:"fadeIn 0.25s ease"}}>
            <div style={{padding:"14px 16px",borderBottom:`1px solid ${T.border}`}}>
              <div onClick={()=>setShowAddS(p=>!p)} style={{display:"flex",alignItems:"center",gap:13,cursor:"pointer",padding:"3px 0"}}>
                <div style={{width:56,height:56,borderRadius:18,background:myS.length>0?T.grad:T.card2,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:19,color:"#fff",border:myS.length>0?`2.5px solid ${T.blue}`:`2.5px dashed ${T.border}`,flexShrink:0,overflow:"hidden"}}>
                  {pic?<img src={pic} alt="p" style={{width:56,height:56,objectFit:"cover"}} />:gi(user?.displayName)}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:14,color:T.text}}>My Update</div>
                  <div style={{fontSize:12,color:T.muted,marginTop:2}}>{myS.length>0?tAgo(myS[0].timestamp):"Share what's on your mind"}</div>
                </div>
                <div style={{width:34,height:34,borderRadius:11,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:"#fff",boxShadow:T.shadow,flexShrink:0}}>+</div>
              </div>
              {showAddS&&<div style={{marginTop:12,padding:14,background:T.card2,borderRadius:16,border:`1px solid ${T.border}`,animation:"slideDown 0.2s ease"}}>
                <Inp value={sText} onChange={e=>setSText(e.target.value)} placeholder="What's on your mind?" style={{marginBottom:10}} />
                <div style={{display:"flex",gap:8}}>
                  <Btn onClick={()=>postS()} style={{flex:1,padding:"10px",borderRadius:12,fontSize:13}}>Share ✓</Btn>
                  <Btn onClick={()=>sFRef.current?.click()} v="ghost" style={{padding:"10px 14px",borderRadius:12}}>📷</Btn>
                  <Btn onClick={()=>setShowAddS(false)} v="ghost" style={{padding:"10px 14px",borderRadius:12}}>✕</Btn>
                </div>
                <input type="file" accept="image/*" ref={sFRef} onChange={handleSImg} style={{display:"none"}} />
              </div>}
            </div>
            {othS.length>0&&<div style={{padding:"8px 18px 4px",fontSize:10,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5}}>Recent</div>}
            {othS.map((s,i)=>(
              <div key={i} onClick={()=>setViewS(s)} style={{display:"flex",alignItems:"center",padding:"13px 18px",gap:13,cursor:"pointer",borderBottom:`1px solid ${T.border}`,transition:"background 0.15s",animation:`slideUp 0.3s ${i*0.05}s ease both`}}
                onMouseEnter={e=>e.currentTarget.style.background=T.card}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{width:56,height:56,borderRadius:18,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:19,color:"#fff",border:`2.5px solid ${T.blue}`,flexShrink:0}}>{gi(s.name)}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:14,color:T.text}}>{s.name}</div>
                  <div style={{fontSize:12,color:T.muted,marginTop:2}}>{tAgo(s.timestamp)}</div>
                </div>
                {s.image&&<div style={{width:46,height:46,borderRadius:13,overflow:"hidden",flexShrink:0}}><img src={s.image} alt="s" style={{width:"100%",height:"100%",objectFit:"cover"}} /></div>}
              </div>
            ))}
            {statuses.length===0&&<div style={{padding:56,textAlign:"center",color:T.muted}}>
              <div style={{fontSize:56,marginBottom:14,opacity:0.3}}>✨</div>
              <div style={{fontWeight:700,fontSize:15,color:T.text,fontFamily:"'Poppins',sans-serif"}}>No updates yet</div>
              <div style={{fontSize:12,marginTop:6}}>Be the first to share!</div>
            </div>}
          </div>}

          {/* CALLS */}
          {view==="calls"&&<div style={{animation:"fadeIn 0.25s ease"}}>
            <div style={{display:"flex",padding:"2px 10px",background:T.card,borderBottom:`1px solid ${T.border}`,overflowX:"auto",gap:2,flexShrink:0}}>
              {["all","missed","incoming","outgoing"].map(f=>(
                <div key={f} onClick={()=>setCallF(f)} style={{padding:"10px 12px",cursor:"pointer",fontSize:11,fontWeight:700,whiteSpace:"nowrap",color:callF===f?T.blue:"rgba(74,85,104,0.7)",borderBottom:callF===f?`2.5px solid ${T.blue}`:"2.5px solid transparent",transition:"all 0.2s",letterSpacing:0.3}}>
                  {f==="missed"?"📵 Missed":f==="incoming"?"📞 In":f==="outgoing"?"📲 Out":"All"}
                </div>
              ))}
            </div>
            {filtCalls.length===0?<div style={{padding:56,textAlign:"center",color:T.muted}}>
              <div style={{fontSize:56,marginBottom:14,opacity:0.3}}>📞</div>
              <div style={{fontWeight:700,fontSize:15,color:T.text,fontFamily:"'Poppins',sans-serif"}}>No calls yet</div>
            </div>
            :filtCalls.map((call,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",padding:"13px 18px",gap:13,borderBottom:`1px solid ${T.border}`,animation:`slideUp 0.3s ${i*0.04}s ease both`}}>
                <div style={{width:50,height:50,borderRadius:16,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:17,color:"#fff",flexShrink:0}}>{gi(call.name)}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:14,color:T.text}}>{call.name}</div>
                  <div style={{fontSize:11,fontWeight:600,marginTop:3,color:call.status==="missed"?"#EF4444":call.direction==="incoming"?T.blue:T.purple}}>
                    {call.status==="missed"?"📵 Missed":call.direction==="incoming"?`📞 In · ${call.type}`:`📲 Out · ${call.type}`}
                  </div>
                  <div style={{fontSize:10,color:T.muted,marginTop:2}}>{new Date(call.timestamp).toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</div>
                </div>
                {call.duration>0&&<div style={{fontSize:11,color:T.muted,flexShrink:0}}>⏱ {fD(call.duration)}</div>}
              </div>
            ))}
          </div>}
        </div>

        {/* Bottom Navigation */}
        <div style={{position:"absolute",bottom:0,left:0,right:0,display:"flex",background:T.card,borderTop:`1px solid ${T.border}`,paddingBottom:"env(safe-area-inset-bottom,6px)",zIndex:50,boxShadow:"0 -4px 20px rgba(0,0,0,0.3)"}}>
          {[["home","🏠","Home",()=>{setView("messages");setShowNew(false);}],["compose","✏️","Compose",()=>{setView("messages");setShowNew(true);}],["updates","✨","Updates",()=>setView("updates")],["settings","⚙️","Settings",()=>setShowSett(true)]].map(([id,icon,label,fn])=>{
            const isActive=(id==="home"&&view==="messages"&&!showNew&&!showSett)||(id==="compose"&&showNew)||(id==="updates"&&view==="updates")||(id==="settings"&&showSett);
            return(
              <div key={id} onClick={fn} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"10px 4px 8px",cursor:"pointer",position:"relative",transition:"all 0.2s",minWidth:0}}
                onMouseDown={e=>e.currentTarget.style.opacity="0.7"}
                onMouseUp={e=>e.currentTarget.style.opacity="1"}
                onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                <div style={{width:38,height:38,borderRadius:13,background:isActive?T.grad:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,marginBottom:3,transition:"all 0.25s",boxShadow:isActive?T.shadow:"none",flexShrink:0}}>
                  {icon}
                </div>
                <span style={{fontSize:9,fontWeight:700,color:isActive?T.blue:T.muted,letterSpacing:0.4,fontFamily:"'Poppins',sans-serif",textTransform:"uppercase",whiteSpace:"nowrap"}}>{label}</span>
                {id==="home"&&totalUnread>0&&<div style={{position:"absolute",top:7,right:"16%",background:T.gradD,borderRadius:10,minWidth:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:"#fff",padding:"0 3px",animation:"badgePop 0.3s ease"}}>{totalUnread>9?"9+":totalUnread}</div>}
              </div>
            );
          })}
        </div>

        {/* Footer brand */}
        <div style={{position:"absolute",bottom:68,left:0,right:0,textAlign:"center",pointerEvents:"none",zIndex:40}}>
          <div style={{fontSize:9,color:"rgba(74,85,104,0.4)",letterSpacing:0.3,fontFamily:"'Inter',sans-serif"}}>
            Khan Chats · Not affiliated with WhatsApp or Meta
          </div>
        </div>
      </div>
    )}
  </div>
);
}
