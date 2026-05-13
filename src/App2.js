import{useState,useEffect,useRef}from"react";
import{initializeApp}from"firebase/app";
import{getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,onAuthStateChanged,updateProfile}from"firebase/auth";
import{getDatabase,ref,push,onValue,set,get,serverTimestamp,off}from"firebase/database";
const FC={apiKey:"AIzaSyDJt8Pf6bC938Q9Ufxwj6xSREV0xcQf6_I",authDomain:"khan-chats-d9607.firebaseapp.com",projectId:"khan-chats-d9607",storageBucket:"khan-chats-d9607.firebasestorage.app",messagingSenderId:"646302896729",appId:"1:646302896729:web:41b2d05775c704ad43d748",databaseURL:"https://khan-chats-d9607-default-rtdb.firebaseio.com"};
const fbApp=initializeApp(FC);
const auth=getAuth(fbApp);
const db=getDatabase(fbApp);
const GKEY="AIzaSyBD7nr5CaWz4VNW0MaZQdliPb4YKKdYmrg";
const T={bg:"#080E1A",card:"#0F1923",card2:"#162030",card3:"#1C2940",blue:"#4F8EF7",purple:"#8B5CF6",text:"#F0F4FF",muted:"#4A5568",mutedL:"#718096",border:"#1A2840",grad:"linear-gradient(135deg,#4F8EF7,#8B5CF6)",gradS:"linear-gradient(135deg,#1E3A8A,#5B21B6)",gradD:"linear-gradient(135deg,#EF4444,#DC2626)",shadow:"0 4px 20px rgba(79,142,247,0.2)",shadowL:"0 8px 40px rgba(79,142,247,0.3)"};
const GF="@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Poppins:wght@600;700;800;900&display=swap');";
const EMOJIS=["😀","😂","❤️","👍","🔥","😍","🎉","👏","😎","🙌","💯","✨","🥰","😘","🤩","💪","🙏","😅","🤔","👋","🎯","⭐","🌟","🚀","💬","😊","🤝","😭","🤣","😱"];
const REACTS=["❤️","👍","😂","😮","😢","🔥","👏","🎉"];
const LANGS=["English","Urdu","Arabic","Hindi","Spanish","French","German","Chinese","Japanese","Korean","Portuguese","Russian","Turkish","Italian","Dutch","Polish","Swedish","Danish","Finnish","Greek","Hebrew","Persian","Bengali","Punjabi"];
const DOPT=[{label:"Off",val:0},{label:"1 Hour",val:3600},{label:"24 Hours",val:86400},{label:"7 Days",val:604800}];
const ft=ts=>{if(!ts)return"";return new Date(ts).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});};
const gi=n=>{if(!n)return"?";return n.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);};
const cfn=n=>{const c=["#4F8EF7","#8B5CF6","#0EA5E9","#6366F1","#EC4899","#0891B2","#7C3AED","#2563EB"];if(!n)return c[0];let s=0;for(let ch of n)s+=ch.charCodeAt(0);return c[s%c.length];};
const gid=(a,b)=>[a,b].sort().join("_");
const tAgo=ts=>{const d=Date.now()-ts,m=Math.floor(d/60000);if(m<1)return"Just now";if(m<60)return m+"m ago";const h=Math.floor(m/60);if(h<24)return h+"h ago";return new Date(ts).toLocaleDateString("en-US",{month:"short",day:"numeric"});};
const fD=s=>{if(!s)return"0:00";return Math.floor(s/60)+":"+(s%60).toString().padStart(2,"0");};
const dayLbl=ts=>{const d=new Date(ts),t=new Date();if(d.toDateString()===t.toDateString())return"Today";const y=new Date(t);y.setDate(t.getDate()-1);if(d.toDateString()===y.toDateString())return"Yesterday";return d.toLocaleDateString("en-US",{month:"long",day:"numeric"});};
const isND=(msgs,i)=>{if(i===0)return true;return new Date(msgs[i].timestamp).toDateString()!==new Date(msgs[i-1].timestamp).toDateString();};
const CSS=GF+"*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;margin:0;padding:0;}::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#1A2840;border-radius:3px;}input::placeholder,textarea::placeholder{color:#4A5568;}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}@keyframes slideR{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}@keyframes slideL{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}@keyframes msgIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}@keyframes dot{0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1.3);opacity:1}}@keyframes pulse{0%,100%{box-shadow:0 0 40px rgba(79,142,247,0.5)}50%{box-shadow:0 0 70px rgba(79,142,247,0.8)}}@keyframes ring{0%,100%{transform:scale(1);opacity:0.3}50%{transform:scale(1.15);opacity:0}}@keyframes badgePop{0%{transform:scale(0)}60%{transform:scale(1.2)}100%{transform:scale(1)}}@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}@keyframes reactIn{from{opacity:0;transform:scale(0.8) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}@keyframes reactPop{0%{transform:scale(0)}60%{transform:scale(1.3)}100%{transform:scale(1)}}";

export default function App(){
const[user,setUser]=useState(null);
const[loading,setLoading]=useState(true);
const[screen,setScreen]=useState("login");
const[em,setEm]=useState("");const[pw,setPw]=useState("");const[dn,setDn]=useState("");
const[aErr,setAErr]=useState("");const[aLoad,setALoad]=useState(false);
const[contacts,setContacts]=useState({});const[unread,setUnread]=useState({});
const[pins,setPins]=useState([]);const[locks,setLocks]=useState({});const[unlocked,setUnlocked]=useState([]);
const[lModal,setLModal]=useState(null);const[ulModal,setUlModal]=useState(null);
const[lPin,setLPin]=useState("");const[ulPin,setUlPin]=useState("");const[lErr,setLErr]=useState("");
const[showLocked,setShowLocked]=useState(false);
const[activeChat,setActiveChat]=useState(null);const[msgs,setMsgs]=useState([]);
const[inp,setInp]=useState("");const[isTyping,setIsTyping]=useState(false);
const[replyTo,setReplyTo]=useState(null);const[msgMenu,setMsgMenu]=useState(null);
const[nEmail,setNEmail]=useState("");const[nEmailErr,setNEmailErr]=useState("");const[showNew,setShowNew]=useState(false);
const[toasts,setToasts]=useState([]);const[previewImg,setPreviewImg]=useState(null);
const[showInvite,setShowInvite]=useState(false);const[invL,setInvL]=useState("");const[copied,setCopied]=useState(false);
const[inCall,setInCall]=useState(false);const[callType,setCallType]=useState(null);
const[nav,setNav]=useState("home");const[view,setView]=useState("messages");
const[statuses,setStatuses]=useState([]);const[sText,setSText]=useState("");const[showAddS,setShowAddS]=useState(false);const[viewS,setViewS]=useState(null);
const[callHist,setCallHist]=useState([]);const[callF,setCallF]=useState("all");
const[showSett,setShowSett]=useState(false);const[sTab,setSTab]=useState("profile");
const[pic,setPic]=useState(null);const[bio,setBio]=useState("");const[uname,setUname]=useState("");const[newName,setNewName]=useState("");
const[lang,setLang]=useState("English");const[langQ,setLangQ]=useState("");
const[nSett,setNSett]=useState({msgs:true,updates:true,calls:true});
const[searchQ,setSearchQ]=useState("");const[showSearch,setShowSearch]=useState(false);
const[aiIn,setAiIn]=useState("");const[aiMsgs,setAiMsgs]=useState([]);
const[aiLoad,setAiLoad]=useState(false);const[aiErr,setAiErr]=useState("");const[aiStream,setAiStream]=useState("");
const[policy,setPolicy]=useState(null);
const[logoutC,setLogoutC]=useState(false);const[deleteC,setDeleteC]=useState(false);
const[showEmoji,setShowEmoji]=useState(false);
const[isRec,setIsRec]=useState(false);const[recTime,setRecTime]=useState(0);
const[recentAct,setRecentAct]=useState([]);const[chatBg,setChatBg]=useState("dots");
const[contactProfile,setContactProfile]=useState(null);
const[contactBio,setContactBio]=useState("");const[contactUname,setContactUname]=useState("");const[contactPic,setContactPic]=useState(null);
const[starred,setStarred]=useState({});const[showStarred,setShowStarred]=useState(false);
const[disappear,setDisappear]=useState({});const[showDisappear,setShowDisappear]=useState(false);
const[reactions,setReactions]=useState({});
const[reactBar,setReactBar]=useState(null);

const endRef=useRef(null);const fileRef=useRef(null);const sFRef=useRef(null);const picRef=useRef(null);
const lvRef=useRef(null);const rvRef=useRef(null);const pcRef=useRef(null);const lsRef=useRef(null);
const typTimer=useRef(null);const notifId=useRef(0);const recTimer=useRef(null);
const msgMenuRef=useRef(null);const aiEndRef=useRef(null);const reactRef=useRef(null);

useEffect(()=>{if(endRef.current)endRef.current.scrollIntoView({behavior:"smooth"});},[msgs,isTyping]);
useEffect(()=>{if(aiEndRef.current)aiEndRef.current.scrollIntoView({behavior:"smooth"});},[aiMsgs,aiLoad,aiStream]);
useEffect(()=>{
  const h=e=>{
    if(msgMenu&&msgMenuRef.current&&!msgMenuRef.current.contains(e.target))setMsgMenu(null);
    if(reactBar&&reactRef.current&&!reactRef.current.contains(e.target))setReactBar(null);
  };
  document.addEventListener("mousedown",h);
  document.addEventListener("touchstart",h);
  return()=>{document.removeEventListener("mousedown",h);document.removeEventListener("touchstart",h);};
},[msgMenu,reactBar]);

useEffect(()=>{
  const unsub=onAuthStateChanged(auth,async u=>{
    if(u){
      setUser(u);setScreen("chat");setNewName(u.displayName||"");
      await set(ref(db,"users/"+u.uid),{uid:u.uid,name:u.displayName||u.email.split("@")[0],email:u.email,online:true,lastSeen:serverTimestamp()});
      loadAll(u);
    }else{setUser(null);setScreen("login");}
    setLoading(false);
  });
  return()=>unsub();
},[]);

const loadAll=u=>{
  onValue(ref(db,"userChats/"+u.uid),async snap=>{
    const data=snap.val()||{},map={},ur={};
    for(const cId of Object.keys(data)){
      const s=await get(ref(db,"users/"+data[cId].with));
      if(s.exists()){map[cId]={...s.val(),chatId:cId,lastMsg:data[cId].lastMsg||"",lastTime:data[cId].lastTime||0};ur[cId]=data[cId].unread||0;}
    }
    setContacts(map);setUnread(ur);
    setRecentAct(Object.values(map).filter(c=>c.lastMsg&&c.lastTime).sort((a,b)=>b.lastTime-a.lastTime).slice(0,5));
  });
  onValue(ref(db,"statuses"),snap=>{setStatuses(Object.values(snap.val()||{}).filter(s=>Date.now()-s.timestamp<86400000).sort((a,b)=>b.timestamp-a.timestamp));});
  onValue(ref(db,"callHistory/"+u.uid),snap=>{setCallHist(Object.values(snap.val()||{}).sort((a,b)=>b.timestamp-a.timestamp));});
  onValue(ref(db,"pins/"+u.uid),snap=>{setPins(snap.val()||[]);});
  onValue(ref(db,"profilePics/"+u.uid),snap=>{if(snap.val())setPic(snap.val());});
  onValue(ref(db,"lockedChats/"+u.uid),snap=>{setLocks(snap.val()||{});});
  onValue(ref(db,"userBio/"+u.uid),snap=>{if(snap.val())setBio(snap.val());});
  onValue(ref(db,"usernames/"+u.uid),snap=>{if(snap.val())setUname(snap.val());});
  onValue(ref(db,"starred/"+u.uid),snap=>{setStarred(snap.val()||{});});
  onValue(ref(db,"disappear/"+u.uid),snap=>{setDisappear(snap.val()||{});});
};

const loadContactProfile=async(contact)=>{
  setContactProfile(contact);setContactBio("");setContactUname("");setContactPic(null);
  try{
    const b=await get(ref(db,"userBio/"+contact.uid));if(b.val())setContactBio(b.val());
    const u2=await get(ref(db,"usernames/"+contact.uid));if(u2.val())setContactUname(u2.val());
    const p=await get(ref(db,"profilePics/"+contact.uid));if(p.val())setContactPic(p.val());
  }catch(e){}
};

const toggleStar=async(msgKey,msg)=>{
  if(!user||!activeChat)return;
  const path="starred/"+user.uid+"/"+activeChat.chatId+"_"+msgKey;
  if(starred[activeChat.chatId+"_"+msgKey])await set(ref(db,path),null);
  else await set(ref(db,path),{text:msg.text||"",image:msg.image||null,senderName:msg.senderName,timestamp:msg.timestamp,chatId:activeChat.chatId,chatName:activeChat.name,msgKey});
};

const addReaction=async(msgKey,emoji)=>{
  if(!user||!activeChat)return;
  const path="chats/"+activeChat.chatId+"/messages/"+msgKey+"/reactions/"+user.uid;
  const cur=(reactions[msgKey]||{})[user.uid];
  if(cur===emoji)await set(ref(db,path),null);
  else await set(ref(db,path),emoji);
  setReactBar(null);setMsgMenu(null);
};

const setDisappearTime=async(chatId,val)=>{
  await set(ref(db,"disappear/"+user.uid+"/"+chatId),val||null);
  setShowDisappear(false);
};

const saveCall=(u,d)=>push(ref(db,"callHistory/"+u.uid),{...d,timestamp:Date.now()});
const togglePin=async id=>{const p=pins.includes(id)?pins.filter(x=>x!==id):[...pins,id];await set(ref(db,"pins/"+user.uid),p);};
const savePic=async img=>{await set(ref(db,"profilePics/"+user.uid),img);setPic(img);};
const saveProfile=async()=>{
  if(!newName.trim())return;
  await updateProfile(auth.currentUser,{displayName:newName.trim()});
  await set(ref(db,"users/"+user.uid+"/name"),newName.trim());
  if(bio)await set(ref(db,"userBio/"+user.uid),bio);
  if(uname)await set(ref(db,"usernames/"+user.uid),uname);
  setUser({...user,displayName:newName.trim()});
  alert("Profile updated!");
};
const handlePic=e=>{const f=e.target.files[0];if(!f)return;if(f.size>500000){alert("Max 500KB");return;}const r=new FileReader();r.onload=ev=>savePic(ev.target.result);r.readAsDataURL(f);e.target.value="";};
const lockChat=async id=>{if(lPin.length<4){setLErr("4+ digits");return;}await set(ref(db,"lockedChats/"+user.uid),{...locks,[id]:lPin});setLPin("");setLModal(null);setLErr("");};
const unlockChat=id=>{if(ulPin===locks[id]){setUnlocked(p=>[...p,id]);setUlPin("");setUlModal(null);setLErr("");}else setLErr("Wrong PIN!");};
const removeLock=async id=>{const n={...locks};delete n[id];await set(ref(db,"lockedChats/"+user.uid),n);setUnlocked(p=>p.filter(x=>x!==id));};
const handleChatClick=c=>{if(locks[c.chatId]&&!unlocked.includes(c.chatId)){setUlModal(c.chatId);setUlPin("");setLErr("");}else openChat(c);};

const askAI=async()=>{
  if(!aiIn.trim()||aiLoad)return;
  const txt=aiIn.trim();
  setAiMsgs(p=>[...p,{role:"user",text:txt}]);
  setAiIn("");setAiLoad(true);setAiErr("");setAiStream("");
  const hist=aiMsgs.slice(-8).map(m=>({role:m.role==="user"?"user":"model",parts:[{text:m.text}]}));
  try{
    const res=await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key="+GKEY,{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        system_instruction:{parts:[{text:"You are Khan AI, a friendly helpful assistant for Khan Chats by Hamza Khan. Speak English and Urdu. Be warm and concise."}]},
        contents:[...hist,{role:"user",parts:[{text:txt}]}],
        generationConfig:{temperature:0.9,maxOutputTokens:600}
      })
    });
    if(!res.ok){const e=await res.json();throw new Error((e&&e.error&&e.error.message)||"HTTP "+res.status);}
    const data=await res.json();
    const reply=data&&data.candidates&&data.candidates[0]&&data.candidates[0].content&&data.candidates[0].content.parts&&data.candidates[0].content.parts[0]&&data.candidates[0].content.parts[0].text;
    if(!reply)throw new Error("No response from AI");
    let i=0;
    const tick=setInterval(()=>{
      if(i<=reply.length){setAiStream(reply.slice(0,i));i+=4;}
      else{clearInterval(tick);setAiStream("");setAiMsgs(p=>[...p,{role:"assistant",text:reply}]);setAiLoad(false);}
    },15);
  }catch(err){setAiErr(err.message||"Connection failed");setAiLoad(false);setAiStream("");}
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
  if(user)await set(ref(db,"users/"+user.uid+"/online"),false);
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
  await set(ref(db,"userChats/"+user.uid+"/"+chatId),{with:found.uid,lastMsg:"",lastTime:serverTimestamp(),unread:0});
  await set(ref(db,"userChats/"+found.uid+"/"+chatId),{with:user.uid,lastMsg:"",lastTime:serverTimestamp(),unread:0});
  setNEmail("");setShowNew(false);openChat({...found,chatId});
};
const openChat=c=>{
  setActiveChat(c);setNav("chat");setShowEmoji(false);setReplyTo(null);setMsgMenu(null);setReactBar(null);
  set(ref(db,"userChats/"+user.uid+"/"+c.chatId+"/unread"),0);
  setUnread(p=>({...p,[c.chatId]:0}));
  off(ref(db,"chats/"+c.chatId+"/messages"));
  onValue(ref(db,"chats/"+c.chatId+"/messages"),snap=>{
    const data=snap.val()||{};
    setMsgs(Object.values(data).sort((a,b)=>a.timestamp-b.timestamp));
    const r={};
    Object.entries(data).forEach(([k,v])=>{if(v.reactions)r[k]=v.reactions;});
    setReactions(r);
  });
  onValue(ref(db,"chats/"+c.chatId+"/typing"),snap=>{
    const td=snap.val()||{};
    setIsTyping(Object.keys(td).some(uid=>uid!==user.uid&&td[uid]));
  });
};
const sendMsg=async(imgData)=>{
  if(!activeChat||(!inp.trim()&&!imgData))return;
  const msg={text:imgData?"":inp.trim(),image:imgData||null,senderUid:user.uid,senderName:user.displayName||user.email,timestamp:Date.now(),status:"sent"};
  if(replyTo)msg.replyTo={text:replyTo.text||"Photo",senderName:replyTo.senderName};
  await push(ref(db,"chats/"+activeChat.chatId+"/messages"),msg);
  const last=imgData?"Photo":inp.trim();
  await set(ref(db,"userChats/"+user.uid+"/"+activeChat.chatId+"/lastMsg"),last);
  await set(ref(db,"userChats/"+activeChat.uid+"/"+activeChat.chatId+"/lastMsg"),last);
  await set(ref(db,"userChats/"+user.uid+"/"+activeChat.chatId+"/lastTime"),serverTimestamp());
  await set(ref(db,"userChats/"+activeChat.uid+"/"+activeChat.chatId+"/lastTime"),serverTimestamp());
  await set(ref(db,"userChats/"+activeChat.uid+"/"+activeChat.chatId+"/unread"),(unread[activeChat.chatId]||0)+1);
  set(ref(db,"chats/"+activeChat.chatId+"/typing/"+user.uid),null);
  setInp("");setShowEmoji(false);setReplyTo(null);
};
const deleteMsg=async(msgId,forAll)=>{
  if(forAll){await set(ref(db,"chats/"+activeChat.chatId+"/messages/"+msgId+"/deleted"),true);await set(ref(db,"chats/"+activeChat.chatId+"/messages/"+msgId+"/text"),"This message was deleted");}
  else await set(ref(db,"chats/"+activeChat.chatId+"/messages/"+msgId+"/deletedFor/"+user.uid),true);
  setMsgMenu(null);
};
const copyMsg=text=>{navigator.clipboard.writeText(text);setMsgMenu(null);};
const handleTyping=v=>{
  setInp(v);if(!activeChat)return;
  set(ref(db,"chats/"+activeChat.chatId+"/typing/"+user.uid),true);
  clearTimeout(typTimer.current);
  typTimer.current=setTimeout(()=>set(ref(db,"chats/"+activeChat.chatId+"/typing/"+user.uid),null),2000);
};
const handleImg=e=>{const f=e.target.files[0];if(!f)return;if(f.size>2000000){alert("Max 2MB");return;}const r=new FileReader();r.onload=ev=>sendMsg(ev.target.result);r.readAsDataURL(f);e.target.value="";};
const toggleRec=()=>{if(isRec){setIsRec(false);clearInterval(recTimer.current);setRecTime(0);alert("Voice notes coming soon!");}else{setIsRec(true);recTimer.current=setInterval(()=>setRecTime(p=>p+1),1000);}};
const postS=async(img)=>{if(!sText.trim()&&!img)return;await push(ref(db,"statuses"),{uid:user.uid,name:user.displayName||user.email,text:sText.trim(),image:img||null,timestamp:Date.now()});setSText("");setShowAddS(false);};
const handleSImg=e=>{const f=e.target.files[0];if(!f)return;if(f.size>500000){alert("Max 500KB");return;}const r=new FileReader();r.onload=ev=>postS(ev.target.result);r.readAsDataURL(f);e.target.value="";};
const genInvite=()=>{setInvL(window.location.origin+"?invite="+btoa(user.email));setShowInvite(true);};
const copyLink=()=>{navigator.clipboard.writeText(invL).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});};
const startCall=async type=>{
  if(!activeChat)return;setCallType(type);setInCall(true);
  try{
    const stream=await navigator.mediaDevices.getUserMedia({video:type==="video",audio:true});
    lsRef.current=stream;if(lvRef.current)lvRef.current.srcObject=stream;
    const pc=new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"}]});
    pcRef.current=pc;stream.getTracks().forEach(t=>pc.addTrack(t,stream));
    pc.ontrack=e=>{if(rvRef.current)rvRef.current.srcObject=e.streams[0];};
    const offer=await pc.createOffer();await pc.setLocalDescription(offer);
    await set(ref(db,"calls/"+activeChat.chatId),{offer:JSON.stringify(offer),caller:user.uid,callerName:user.displayName,type,timestamp:Date.now()});
    onValue(ref(db,"calls/"+activeChat.chatId+"/answer"),async snap=>{if(snap.val()&&pc.signalingState!=="stable")await pc.setRemoteDescription(JSON.parse(snap.val()));});
    pc.onicecandidate=e=>{if(e.candidate)push(ref(db,"calls/"+activeChat.chatId+"/callerCandidates"),JSON.stringify(e.candidate));};
    saveCall(user,{name:activeChat.name,type,direction:"outgoing",status:"completed",duration:0});
  }catch(err){alert("Camera/Mic denied: "+err.message);setInCall(false);}
};
const endCall=()=>{
  if(lsRef.current)lsRef.current.getTracks().forEach(t=>t.stop());
  if(pcRef.current)pcRef.current.close();
  if(activeChat)set(ref(db,"calls/"+activeChat.chatId),null);
  setInCall(false);setCallType(null);
};

const getMR=msgKey=>{
  const r=reactions[msgKey]||{};
  const counts={};
  Object.values(r).forEach(e=>{counts[e]=(counts[e]||0)+1;});
  return counts;
};
const getMyR=msgKey=>{return(reactions[msgKey]||{})[user&&user.uid]||null;};
const starredList=Object.values(starred);
const totalUnread=Object.values(unread).reduce((a,b)=>a+b,0);
const myS=statuses.filter(s=>user&&s.uid===user.uid);
const othS=statuses.filter(s=>user&&s.uid!==user.uid);
const ulC=Object.entries(contacts).filter(([id])=>!locks[id]||unlocked.includes(id)).sort(([a],[b])=>(pins.includes(a)?0:1)-(pins.includes(b)?0:1));
const lkC=Object.entries(contacts).filter(([id])=>locks[id]&&!unlocked.includes(id));
const filtC=searchQ?ulC.filter(([,c])=>(c.name&&c.name.toLowerCase().includes(searchQ.toLowerCase()))||(c.email&&c.email.toLowerCase().includes(searchQ.toLowerCase()))):ulC;
const filtCalls=callHist.filter(c=>{if(callF==="missed")return c.status==="missed";if(callF==="incoming")return c.direction==="incoming";if(callF==="outgoing")return c.direction==="outgoing";return true;});
const bgStyle=()=>{if(chatBg==="dots")return{backgroundImage:"radial-gradient(circle,rgba(79,142,247,0.06) 1px,transparent 1px)",backgroundSize:"24px 24px"};if(chatBg==="grid")return{backgroundImage:"linear-gradient(rgba(79,142,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(79,142,247,0.04) 1px,transparent 1px)",backgroundSize:"30px 30px"};return{};};
const curD=activeChat?disappear[activeChat.chatId]||0:0;

const Inp=({value,onChange,placeholder,type,style,onKeyDown,autoFocus})=>(
  <input value={value} onChange={onChange} placeholder={placeholder} type={type||"text"} onKeyDown={onKeyDown} autoFocus={autoFocus}
    style={{padding:"12px 16px",background:T.card,border:"1.5px solid "+T.border,borderRadius:14,color:T.text,fontSize:14,outline:"none",fontFamily:"'Inter',sans-serif",transition:"all 0.2s",width:"100%",boxSizing:"border-box",...(style||{})}}
    onFocus={e=>{e.target.style.borderColor=T.blue;e.target.style.boxShadow="0 0 0 3px rgba(79,142,247,0.12)";}}
    onBlur={e=>{e.target.style.borderColor=T.border;e.target.style.boxShadow="none";}} />
);
const Btn=({children,onClick,v,style})=>(
  <div onClick={onClick} style={{padding:"12px 18px",background:v==="d"?T.gradD:v==="g"?T.card2:T.grad,borderRadius:14,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",textAlign:"center",userSelect:"none",fontFamily:"'Poppins',sans-serif",...(style||{})}}
    onMouseDown={e=>e.currentTarget.style.transform="scale(0.96)"}
    onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}
    onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>{children}</div>
);
const Card=({children,style})=>(<div style={{background:T.card,borderRadius:20,border:"1px solid "+T.border,boxShadow:"0 2px 16px rgba(0,0,0,0.4)",...(style||{})}}>{children}</div>);
const Tog=({val,fn})=>(<div onClick={fn} style={{width:50,height:27,borderRadius:14,background:val?T.grad:T.card2,position:"relative",cursor:"pointer",transition:"all 0.3s",border:"1px solid "+T.border,flexShrink:0}}><div style={{position:"absolute",top:3,left:val?24:3,width:19,height:19,borderRadius:"50%",background:"#fff",transition:"all 0.3s",boxShadow:"0 2px 6px rgba(0,0,0,0.3)"}} /></div>);
const Modal=({children,onClose})=>(<div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"fadeIn 0.2s ease"}}><div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:420,animation:"slideUp 0.3s ease"}}>{children}</div></div>);
const Av=({name,p,size})=>{const sz=size||44;return p?<img src={p} alt="a" style={{width:sz,height:sz,borderRadius:sz*0.33,objectFit:"cover",flexShrink:0}} />:<div style={{width:sz,height:sz,borderRadius:sz*0.33,background:cfn(name),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:sz*0.3,color:"#fff",flexShrink:0}}>{gi(name)}</div>;};

if(loading)return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:T.bg,flexDirection:"column",gap:28,fontFamily:"'Poppins',sans-serif"}}><style>{CSS}</style><div style={{position:"relative"}}><div style={{width:100,height:100,borderRadius:30,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:48,animation:"pulse 2s infinite",boxShadow:"0 0 60px rgba(79,142,247,0.6)"}}>💬</div><div style={{position:"absolute",inset:-8,borderRadius:38,border:"2px solid rgba(79,142,247,0.3)",animation:"ring 2s infinite"}} /><div style={{position:"absolute",inset:-18,borderRadius:48,border:"1px solid rgba(139,92,246,0.15)",animation:"ring 2s 0.4s infinite"}} /></div><div style={{textAlign:"center"}}><div style={{fontSize:30,fontWeight:900,background:T.grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Khan Chats</div><div style={{color:T.muted,fontSize:13,marginTop:6}}>Premium Messaging</div></div><div style={{display:"flex",gap:10}}>{[0,1,2].map(i=><div key={i} style={{width:9,height:9,borderRadius:"50%",background:T.grad,animation:"dot 1.4s "+(i*0.2)+"s infinite"}} />)}</div></div>);

if(screen==="login"||screen==="register")return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:T.bg,fontFamily:"'Poppins',sans-serif",padding:20,animation:"fadeIn 0.5s ease"}}><style>{CSS}</style><div style={{width:"100%",maxWidth:420}}><div style={{textAlign:"center",marginBottom:44}}><div style={{width:88,height:88,borderRadius:28,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:44,margin:"0 auto 20px",boxShadow:T.shadowL,animation:"pulse 3s infinite"}}>💬</div><h1 style={{color:T.text,fontWeight:900,fontSize:32,letterSpacing:"-0.8px"}}>Khan Chats</h1><p style={{color:T.muted,fontSize:13,marginTop:8}}>Your premium messaging experience</p></div><Card style={{padding:5,marginBottom:24}}><div style={{display:"flex",borderRadius:17}}>{["login","register"].map(sc=><div key={sc} onClick={()=>{setScreen(sc);setAErr("");}} style={{flex:1,textAlign:"center",padding:"13px",cursor:"pointer",fontWeight:700,fontSize:14,background:screen===sc?T.grad:"transparent",color:screen===sc?"#fff":T.muted,borderRadius:15,margin:2,transition:"all 0.3s"}}>{sc==="login"?"Sign In":"Sign Up"}</div>)}</div></Card><div style={{display:"flex",flexDirection:"column",gap:12}}>{screen==="register"&&<Inp value={dn} onChange={e=>setDn(e.target.value)} placeholder="Full name" />}<Inp value={em} onChange={e=>setEm(e.target.value)} placeholder="Email address" type="email" /><Inp value={pw} onChange={e=>setPw(e.target.value)} placeholder="Password (6+ chars)" type="password" onKeyDown={e=>e.key==="Enter"&&(screen==="login"?login():register())} /></div>{aErr&&<div style={{color:"#EF4444",fontSize:13,margin:"12px 0",padding:"10px 14px",background:"rgba(239,68,68,0.08)",borderRadius:12,border:"1px solid rgba(239,68,68,0.2)"}}>{aErr}</div>}<Btn onClick={screen==="login"?login:register} style={{marginTop:16,fontSize:15,padding:"15px",borderRadius:18,boxShadow:T.shadowL}}>{aLoad?"Please wait...":(screen==="login"?"Sign In →":"Create Account →")}</Btn><p style={{color:T.muted,fontSize:11,textAlign:"center",marginTop:22,lineHeight:1.8}}>Independent Messaging · Not affiliated with WhatsApp or Meta<br/><span onClick={()=>setPolicy("privacy")} style={{color:T.blue,cursor:"pointer"}}>Privacy Policy</span>{" · "}<span onClick={()=>setPolicy("terms")} style={{color:T.blue,cursor:"pointer"}}>Terms</span></p></div>{policy&&<Modal onClose={()=>setPolicy(null)}><Card style={{padding:28,maxHeight:"78vh",overflowY:"auto"}}><div style={{fontWeight:800,fontSize:18,color:T.text,marginBottom:14}}>{policy==="privacy"?"Privacy Policy":"Terms"}</div><div style={{color:T.mutedL,fontSize:13,lineHeight:1.9}}>{policy==="privacy"?<><p>Khan Chats is independent.</p><p>Data: Email, name, photo, messages.</p></>:<><p>Lawful use only.</p><p>Not affiliated with WhatsApp or Meta.</p></>}</div><Btn onClick={()=>setPolicy(null)} style={{marginTop:18}}>Close</Btn></Card></Modal>}</div>);

if(contactProfile)return(<div style={{position:"fixed",inset:0,background:T.bg,zIndex:9998,display:"flex",flexDirection:"column",fontFamily:"'Inter',sans-serif",color:T.text,animation:"slideL 0.3s ease"}}><style>{CSS}</style><div style={{display:"flex",alignItems:"center",padding:"15px 18px",background:T.card,gap:12,borderBottom:"1px solid "+T.border,boxShadow:"0 2px 12px rgba(0,0,0,0.3)"}}><div onClick={()=>setContactProfile(null)} style={{width:38,height:38,borderRadius:12,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:17,border:"1px solid "+T.border,flexShrink:0}}>←</div><div style={{fontWeight:800,fontSize:19,fontFamily:"'Poppins',sans-serif"}}>Contact Info</div></div><div style={{flex:1,overflowY:"auto"}}><div style={{background:T.grad,padding:"40px 20px 30px",textAlign:"center"}}><div style={{position:"relative"}}>{contactPic?<img src={contactPic} alt="p" style={{width:110,height:110,borderRadius:"50%",objectFit:"cover",border:"4px solid rgba(255,255,255,0.4)",margin:"0 auto",display:"block"}} />:<div style={{width:110,height:110,borderRadius:"50%",background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:40,color:"#fff",border:"4px solid rgba(255,255,255,0.3)",margin:"0 auto"}}>{gi(contactProfile.name)}</div>}<div style={{color:"#fff",fontWeight:900,fontSize:26,marginTop:16,fontFamily:"'Poppins',sans-serif"}}>{contactProfile.name}</div>{contactUname&&<div style={{color:"rgba(255,255,255,0.6)",fontSize:14,marginTop:4}}>{"@"+contactUname}</div>}<div style={{color:"rgba(255,255,255,0.5)",fontSize:12,marginTop:4}}>{contactProfile.email}</div></div></div><div style={{padding:18,display:"flex",gap:12,justifyContent:"center"}}>{[["💬","Message",()=>{setContactProfile(null);openChat(contactProfile);}],["📞","Audio",()=>{setContactProfile(null);openChat(contactProfile);setTimeout(()=>startCall("audio"),500);}],["📹","Video",()=>{setContactProfile(null);openChat(contactProfile);setTimeout(()=>startCall("video"),500);}]].map(([icon,label,fn])=>(<div key={label} onClick={fn} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:8,padding:"16px 8px",background:T.card,borderRadius:18,cursor:"pointer",border:"1px solid "+T.border,transition:"all 0.2s"}}><div style={{width:46,height:46,borderRadius:15,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,boxShadow:T.shadow}}>{icon}</div><span style={{fontSize:12,fontWeight:700,color:T.text}}>{label}</span></div>))}</div>{contactBio&&<div style={{margin:"0 18px 14px",background:T.card,borderRadius:18,padding:"18px 20px",border:"1px solid "+T.border}}><div style={{fontSize:10,color:T.blue,fontWeight:700,marginBottom:8,textTransform:"uppercase",letterSpacing:1.5}}>About</div><div style={{fontSize:14,color:T.text,lineHeight:1.7}}>{contactBio}</div></div>}<div style={{margin:"0 18px 30px",background:T.card,borderRadius:18,border:"1px solid "+T.border,padding:"18px 20px"}}><div style={{fontSize:10,color:T.blue,fontWeight:700,marginBottom:12,textTransform:"uppercase",letterSpacing:1.5}}>Details</div>{[["📧","Email",contactProfile.email],["👤","Name",contactProfile.name],...(contactUname?[["🔖","Username","@"+contactUname]]:[])].map(([icon,label,val])=>(<div key={label} style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}><div style={{width:36,height:36,borderRadius:11,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{icon}</div><div><div style={{fontSize:11,color:T.muted,fontWeight:600,marginBottom:2}}>{label}</div><div style={{fontSize:14,color:T.text}}>{val}</div></div></div>))}</div></div></div>);

if(showSett)return(<div style={{position:"fixed",inset:0,background:T.bg,zIndex:9999,display:"flex",flexDirection:"column",fontFamily:"'Inter',sans-serif",color:T.text,animation:"slideR 0.3s ease"}}><style>{CSS}</style><div style={{display:"flex",alignItems:"center",padding:"15px 18px",background:T.card,gap:12,borderBottom:"1px solid "+T.border,boxShadow:"0 2px 12px rgba(0,0,0,0.3)"}}><div onClick={()=>setShowSett(false)} style={{width:38,height:38,borderRadius:12,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:17,border:"1px solid "+T.border,flexShrink:0}}>←</div><div style={{fontWeight:800,fontSize:19,fontFamily:"'Poppins',sans-serif"}}>Settings</div></div><div style={{display:"flex",background:T.card,borderBottom:"1px solid "+T.border,overflowX:"auto",padding:"0 6px"}}>{[["profile","👤","Profile"],["privacy","🔒","Privacy"],["notifs","🔔","Notifs"],["lang","🌐","Lang"],["chat","🎨","Chat"],["ai","🤖","Khan AI"],["legal","📋","Legal"]].map(([tab,icon,label])=><div key={tab} onClick={()=>setSTab(tab)} style={{padding:"11px 13px",cursor:"pointer",fontSize:11,fontWeight:700,whiteSpace:"nowrap",color:sTab===tab?T.blue:T.muted,borderBottom:sTab===tab?"2.5px solid "+T.blue:"2.5px solid transparent",transition:"all 0.2s"}}>{icon+" "+label}</div>)}</div><div style={{flex:1,overflowY:"auto",padding:18,display:"flex",flexDirection:"column",gap:14}}>
{sTab==="profile"&&<div style={{animation:"slideUp 0.3s ease"}}><div style={{background:T.grad,borderRadius:24,padding:28,textAlign:"center",marginBottom:16,boxShadow:T.shadowL,position:"relative",overflow:"hidden"}}><div style={{position:"relative",display:"inline-block",marginBottom:14}}>{pic?<img src={pic} alt="p" style={{width:96,height:96,borderRadius:"50%",objectFit:"cover",border:"3px solid rgba(255,255,255,0.4)"}} />:<div style={{width:96,height:96,borderRadius:"50%",background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:34,color:"#fff",border:"3px solid rgba(255,255,255,0.3)",margin:"0 auto"}}>{gi(user&&user.displayName)}</div>}<div onClick={()=>picRef.current&&picRef.current.click()} style={{position:"absolute",bottom:2,right:2,background:"#fff",borderRadius:"50%",width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,boxShadow:"0 2px 10px rgba(0,0,0,0.25)"}}>📷</div></div><div style={{color:"#fff",fontWeight:800,fontSize:20,fontFamily:"'Poppins',sans-serif"}}>{user&&user.displayName}</div><div style={{color:"rgba(255,255,255,0.6)",fontSize:13,marginTop:4}}>{user&&user.email}</div>{uname&&<div style={{color:"rgba(255,255,255,0.45)",fontSize:12,marginTop:2}}>{"@"+uname}</div>}<input type="file" accept="image/*" ref={picRef} onChange={handlePic} style={{display:"none"}} /></div><Card style={{padding:20,marginBottom:14}}><div style={{fontSize:10,color:T.blue,fontWeight:700,marginBottom:14,textTransform:"uppercase",letterSpacing:1.5}}>Edit Profile</div>{[["Display Name",newName,setNewName,"Your name"],["Username",uname,setUname,"@username"],["Bio",bio,setBio,"About you"]].map(([l,v,fn,ph])=>(<div key={l} style={{marginBottom:12}}><div style={{fontSize:11,color:T.mutedL,fontWeight:600,marginBottom:5}}>{l}</div><Inp value={v} onChange={e=>fn(e.target.value)} placeholder={ph} /></div>))}<Btn onClick={saveProfile} style={{marginTop:6}}>Save Changes ✓</Btn></Card><Btn onClick={()=>setLogoutC(true)} v="d" style={{marginBottom:10}}>🚪 Sign Out</Btn><div onClick={()=>setDeleteC(true)} style={{padding:"12px",background:"transparent",borderRadius:14,textAlign:"center",color:"#EF4444",fontWeight:600,cursor:"pointer",border:"1px solid rgba(239,68,68,0.3)",fontSize:13}}>🗑️ Delete Account</div></div>}
{sTab==="privacy"&&<div style={{animation:"slideUp 0.3s ease"}}>{[["Last Seen","Show last active",true],["Online Status","Show when online",true],["Read Receipts","Show read ticks",true]].map(([t,d,v],i)=>(<Card key={i} style={{padding:"15px 18px",marginBottom:10}}><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{flex:1}}><div style={{fontWeight:700,fontSize:13,color:T.text}}>{t}</div><div style={{fontSize:12,color:T.muted,marginTop:2}}>{d}</div></div><Tog val={v} fn={()=>{}} /></div></Card>))}</div>}
{sTab==="notifs"&&<div style={{animation:"slideUp 0.3s ease"}}>{[["Messages","msgs"],["Updates","updates"],["Calls","calls"]].map(([t,k])=>(<Card key={k} style={{padding:"15px 18px",marginBottom:10}}><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{flex:1}}><div style={{fontWeight:700,fontSize:13,color:T.text}}>{t}</div></div><Tog val={nSett[k]} fn={()=>setNSett(p=>({...p,[k]:!p[k]}))} /></div></Card>))}</div>}
{sTab==="lang"&&<div style={{animation:"slideUp 0.3s ease"}}><Card style={{padding:16,marginBottom:12}}><div style={{fontSize:10,color:T.blue,fontWeight:700,marginBottom:10,textTransform:"uppercase",letterSpacing:1.5}}>Selected: {lang}</div><Inp value={langQ} onChange={e=>setLangQ(e.target.value)} placeholder="Search languages..." /></Card>{LANGS.filter(l=>l.toLowerCase().includes(langQ.toLowerCase())).map(l=>(<div key={l} onClick={()=>{setLang(l);setLangQ("");}} style={{padding:"12px 16px",background:lang===l?T.card2:T.card,borderRadius:13,cursor:"pointer",display:"flex",justifyContent:"space-between",marginBottom:6,border:"1.5px solid "+(lang===l?T.blue:T.border),transition:"all 0.15s"}}><span style={{color:T.text,fontSize:13,fontWeight:lang===l?700:400}}>{l}</span>{lang===l&&<span style={{color:T.blue,fontWeight:800}}>✓</span>}</div>))}</div>}
{sTab==="chat"&&<div style={{animation:"slideUp 0.3s ease"}}><Card style={{padding:18}}><div style={{fontSize:10,color:T.blue,fontWeight:700,marginBottom:14,textTransform:"uppercase",letterSpacing:1.5}}>Chat Background</div>{[["none","No Pattern"],["dots","Dots"],["grid","Grid"]].map(([val,label])=>(<div key={val} onClick={()=>setChatBg(val)} style={{padding:"12px 16px",background:chatBg===val?T.card2:T.card,borderRadius:12,cursor:"pointer",display:"flex",justifyContent:"space-between",marginBottom:8,border:"1.5px solid "+(chatBg===val?T.blue:T.border),transition:"all 0.15s"}}><span style={{color:T.text,fontSize:13,fontWeight:chatBg===val?700:400}}>{label}</span>{chatBg===val&&<span style={{color:T.blue,fontWeight:800}}>✓</span>}</div>))}</Card></div>}
{sTab==="ai"&&<div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 180px)",animation:"slideUp 0.3s ease"}}><div style={{background:T.grad,borderRadius:22,padding:20,marginBottom:14,textAlign:"center",boxShadow:T.shadowL,position:"relative"}}>{aiMsgs.length>0&&<div onClick={()=>{setAiMsgs([]);setAiErr("");setAiStream("");}} style={{position:"absolute",top:10,right:12,background:"rgba(255,255,255,0.15)",borderRadius:10,padding:"3px 10px",color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer"}}>Clear</div>}<div style={{fontSize:38,marginBottom:6}}>🤖</div><div style={{fontWeight:800,fontSize:18,color:"#fff",fontFamily:"'Poppins',sans-serif"}}>Khan AI</div><div style={{fontSize:11,color:"rgba(255,255,255,0.65)",marginTop:2}}>Powered by Gemini · Free · Fast</div></div><div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,marginBottom:12}}>{aiMsgs.length===0&&!aiLoad&&!aiStream&&(<div style={{textAlign:"center",color:T.muted,padding:28}}><div style={{fontSize:42,marginBottom:10}}>✨</div><div style={{fontWeight:700,fontSize:14,color:T.text,marginBottom:6}}>Khan AI Ready!</div><div style={{fontSize:12,lineHeight:1.7,marginBottom:16}}>Ask me anything in English or Urdu</div><div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center"}}>{["Hello! 👋","Urdu mein baat karo","What can you do?","Help me write"].map(q=>(<div key={q} onClick={()=>setAiIn(q)} style={{padding:"7px 14px",background:T.card,borderRadius:20,color:T.blue,fontSize:12,fontWeight:600,cursor:"pointer",border:"1px solid "+T.border}}>{q}</div>))}</div></div>)}{aiMsgs.map((m,i)=>(<div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>{m.role==="assistant"&&<div style={{width:26,height:26,borderRadius:9,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0,marginRight:7,alignSelf:"flex-end"}}>🤖</div>}<div style={{maxWidth:"85%",padding:"11px 15px",background:m.role==="user"?T.grad:T.card,borderRadius:m.role==="user"?"18px 18px 5px 18px":"18px 18px 18px 5px",fontSize:13,color:T.text,lineHeight:1.7,border:m.role==="user"?"none":"1px solid "+T.border,whiteSpace:"pre-wrap"}}>{m.text}</div></div>))}{(aiLoad||aiStream)&&(<div style={{display:"flex",justifyContent:"flex-start"}}><div style={{width:26,height:26,borderRadius:9,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0,marginRight:7,alignSelf:"flex-end"}}>🤖</div>{aiStream?<div style={{maxWidth:"85%",padding:"11px 15px",background:T.card,borderRadius:"18px 18px 18px 5px",fontSize:13,color:T.text,lineHeight:1.7,border:"1px solid "+T.border,whiteSpace:"pre-wrap"}}>{aiStream}<span style={{display:"inline-block",width:2,height:14,background:T.blue,marginLeft:2,animation:"blink 1s infinite",verticalAlign:"middle"}} /></div>:<div style={{padding:"11px 16px",background:T.card,borderRadius:"18px 18px 18px 5px",border:"1px solid "+T.border,display:"flex",gap:5,alignItems:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:T.purple,animation:"dot 1.4s "+(i*0.2)+"s infinite"}} />)}</div>}</div>)}{aiErr&&(<div style={{padding:"10px 14px",background:"rgba(239,68,68,0.08)",borderRadius:13,border:"1px solid rgba(239,68,68,0.2)",display:"flex",alignItems:"center",gap:10}}><span>⚠️</span><div style={{flex:1,fontSize:12,color:"#EF4444"}}>{aiErr}</div><div onClick={()=>{setAiErr("");const last=aiMsgs.filter(m=>m.role==="user").pop();if(last)setAiIn(last.text);}} style={{padding:"5px 12px",background:T.gradD,borderRadius:9,color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0}}>Retry</div></div>)}<div ref={aiEndRef} /></div><div style={{display:"flex",gap:8,alignItems:"flex-end"}}><div style={{flex:1,background:T.card,border:"1.5px solid "+T.border,borderRadius:18,padding:"10px 14px"}}><textarea value={aiIn} onChange={e=>setAiIn(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();askAI();}}} placeholder="Ask in English ya Urdu mein..." rows={1} disabled={aiLoad} style={{width:"100%",background:"none",border:"none",outline:"none",color:T.text,fontSize:13,fontFamily:"'Inter',sans-serif",resize:"none",lineHeight:1.5}} /></div><div onClick={askAI} style={{width:44,height:44,borderRadius:14,background:aiIn.trim()&&!aiLoad?T.grad:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:aiLoad?"not-allowed":"pointer",fontSize:18,flexShrink:0,transition:"all 0.2s",opacity:aiLoad?0.6:1}}>{aiLoad?"⏳":"➤"}</div></div></div>}
{sTab==="legal"&&<div style={{animation:"slideUp 0.3s ease"}}>{[["Privacy Policy","privacy"],["Terms","terms"],["Contact","contact"],["Help","help"],["Delete Account","delete"]].map(([title,action])=>(<Card key={action} style={{padding:"15px 18px",marginBottom:10,cursor:"pointer"}} onClick={()=>{if(action==="delete")setDeleteC(true);else if(action==="contact")alert("khanchats.support@gmail.com");else if(action==="help")alert("FAQ:\n• Reactions: Message ke paas 😊 tap karo\n• Starred: Menu → Star\n• Disappearing: Chat header → Timer");else setPolicy(action);}}><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{flex:1}}><div style={{fontWeight:700,fontSize:13,color:T.text}}>{title}</div></div><span style={{color:T.muted,fontSize:18}}>›</span></div></Card>)}<Card style={{padding:18,marginTop:6,textAlign:"center"}}><div style={{fontWeight:800,fontSize:14,background:T.grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontFamily:"'Poppins',sans-serif",marginBottom:4}}>Khan Chats v1.0</div><div style={{fontSize:11,color:T.muted,lineHeight:1.8}}>Independent · Not affiliated with WhatsApp or Meta</div></Card></div>}
</div>
{logoutC&&<Modal onClose={()=>setLogoutC(false)}><Card style={{padding:30,textAlign:"center"}}><div style={{fontSize:46,marginBottom:12}}>🚪</div><div style={{fontWeight:800,fontSize:18,color:T.text,marginBottom:8,fontFamily:"'Poppins',sans-serif"}}>Sign Out?</div><div style={{color:T.muted,fontSize:13,marginBottom:20}}>Are you sure?</div><div style={{display:"flex",gap:10}}><Btn onClick={()=>setLogoutC(false)} v="g" style={{flex:1}}>Cancel</Btn><Btn onClick={logout} v="d" style={{flex:1}}>Sign Out</Btn></div></Card></Modal>}
{deleteC&&<Modal onClose={()=>setDeleteC(false)}><Card style={{padding:30,textAlign:"center"}}><div style={{fontSize:46,marginBottom:12}}>⚠️</div><div style={{fontWeight:800,fontSize:18,color:"#EF4444",marginBottom:8,fontFamily:"'Poppins',sans-serif"}}>Delete Account?</div><div style={{color:T.muted,fontSize:13,marginBottom:20}}>Permanent. Cannot be undone.</div><div style={{display:"flex",gap:10}}><Btn onClick={()=>setDeleteC(false)} v="g" style={{flex:1}}>Cancel</Btn><Btn onClick={async()=>{await logout();setDeleteC(false);}} v="d" style={{flex:1}}>Delete</Btn></div></Card></Modal>}
{policy&&<Modal onClose={()=>setPolicy(null)}><Card style={{padding:26,maxHeight:"75vh",overflowY:"auto"}}><div style={{fontWeight:800,fontSize:17,color:T.text,marginBottom:12}}>{policy==="privacy"?"Privacy Policy":"Terms"}</div><div style={{color:T.mutedL,fontSize:13,lineHeight:1.9}}>{policy==="privacy"?<><p>Independent platform.</p><p>Data: Email, name, photo, messages.</p></>:<><p>Lawful use only.</p><p>Not affiliated with WhatsApp or Meta.</p></>}</div><Btn onClick={()=>setPolicy(null)} style={{marginTop:16}}>Close</Btn></Card></Modal>}
</div>);

if(lModal)return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:10001,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Poppins',sans-serif"}}><style>{CSS}</style><Card style={{padding:34,maxWidth:360,width:"100%",textAlign:"center",animation:"slideUp 0.3s ease"}}><div style={{width:72,height:72,borderRadius:22,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 16px",boxShadow:T.shadow}}>🔒</div><h3 style={{color:T.text,fontWeight:800,fontSize:20,marginBottom:6}}>Set Chat PIN</h3><p style={{color:T.muted,fontSize:13,marginBottom:20}}>Min 4 digits</p><Inp value={lPin} onChange={e=>setLPin(e.target.value.replace(/\D/g,""))} placeholder="Enter PIN" type="password" style={{fontSize:24,textAlign:"center",letterSpacing:12,marginBottom:8}} />{lErr&&<div style={{color:"#EF4444",fontSize:13,marginBottom:10,padding:"7px",background:"rgba(239,68,68,0.08)",borderRadius:9}}>{lErr}</div>}<div style={{display:"flex",gap:10,marginTop:10}}><Btn onClick={()=>{setLModal(null);setLPin("");setLErr("");}} v="g" style={{flex:1}}>Cancel</Btn><Btn onClick={()=>lockChat(lModal)} style={{flex:1}}>Lock 🔒</Btn></div></Card></div>);
if(ulModal)return(<div style={{position:"fixed",inset:0,background:T.bg,zIndex:10001,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Poppins',sans-serif"}}><style>{CSS}</style><Card style={{padding:34,maxWidth:360,width:"100%",textAlign:"center",animation:"slideUp 0.3s ease"}}><div style={{width:72,height:72,borderRadius:22,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 16px",boxShadow:T.shadow}}>🔐</div><h3 style={{color:T.text,fontWeight:800,fontSize:20,marginBottom:6}}>Chat Locked</h3><p style={{color:T.muted,fontSize:13,marginBottom:20}}>Enter PIN to unlock</p><Inp value={ulPin} onChange={e=>setUlPin(e.target.value.replace(/\D/g,""))} placeholder="Enter PIN" type="password" style={{fontSize:24,textAlign:"center",letterSpacing:12,marginBottom:8}} onKeyDown={e=>e.key==="Enter"&&unlockChat(ulModal)} />{lErr&&<div style={{color:"#EF4444",fontSize:13,marginBottom:10,padding:"7px",background:"rgba(239,68,68,0.08)",borderRadius:9}}>{lErr}</div>}<div style={{display:"flex",gap:10,marginTop:10}}><Btn onClick={()=>{setUlModal(null);setUlPin("");setLErr("");}} v="g" style={{flex:1}}>Cancel</Btn><Btn onClick={()=>unlockChat(ulModal)} style={{flex:1}}>Unlock →</Btn></div></Card></div>);
if(inCall)return(<div style={{position:"fixed",inset:0,background:T.bg,zIndex:9997,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:26,fontFamily:"'Poppins',sans-serif"}}><style>{CSS}</style><div style={{width:96,height:96,borderRadius:30,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:44,boxShadow:"0 0 60px rgba(79,142,247,0.5)",animation:"pulse 2s infinite"}}>{callType==="video"?"📹":"📞"}</div><div style={{textAlign:"center"}}><div style={{color:T.text,fontSize:24,fontWeight:800}}>{activeChat&&activeChat.name}</div><div style={{color:T.muted,fontSize:13,marginTop:6}}>{callType==="video"?"Video":"Audio"} call...</div></div>{callType==="video"&&<div style={{display:"flex",gap:14}}><video ref={lvRef} autoPlay muted style={{width:150,height:114,borderRadius:17,background:T.card,border:"2px solid "+T.blue,objectFit:"cover"}} /><video ref={rvRef} autoPlay style={{width:150,height:114,borderRadius:17,background:T.card,border:"2px solid "+T.purple,objectFit:"cover"}} /></div>}<Btn onClick={endCall} v="d" style={{padding:"15px 46px",borderRadius:22,fontSize:15,boxShadow:"0 8px 30px rgba(239,68,68,0.4)"}}>End Call</Btn></div>);

return(
<div style={{display:"flex",flexDirection:"column",height:"100vh",fontFamily:"'Inter',sans-serif",background:T.bg,color:T.text,overflow:"hidden",animation:"fadeIn 0.4s ease",maxWidth:500,margin:"0 auto",position:"relative",boxShadow:"0 0 80px rgba(0,0,0,0.5)"}}>
<style>{CSS}</style>
<div style={{position:"fixed",top:12,left:"50%",transform:"translateX(-50%)",zIndex:9999,display:"flex",flexDirection:"column",gap:8,width:"92%",maxWidth:460,pointerEvents:"none"}}>
{toasts.map(t=>(<div key={t.id} onClick={()=>{if(t.contact)openChat(t.contact);setToasts(p=>p.filter(x=>x.id!==t.id));}} style={{background:T.card,borderRadius:16,padding:"11px 15px",display:"flex",alignItems:"center",gap:11,boxShadow:"0 8px 32px rgba(0,0,0,0.5)",border:"1px solid "+T.border,animation:"slideDown 0.3s ease",cursor:"pointer",pointerEvents:"all"}}><Av name={t.name} size={34} /><div style={{flex:1,overflow:"hidden"}}><div style={{fontWeight:700,fontSize:12,color:T.blue}}>{t.name}</div><div style={{fontSize:13,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginTop:1}}>{t.text}</div></div><div onClick={e=>{e.stopPropagation();setToasts(p=>p.filter(x=>x.id!==t.id));}} style={{color:T.muted,fontSize:14,pointerEvents:"all",padding:3}}>✕</div></div>))}
</div>
{previewImg&&<div onClick={()=>setPreviewImg(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.97)",zIndex:9998,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14,animation:"fadeIn 0.2s ease"}}><img src={previewImg} alt="p" style={{maxWidth:"95vw",maxHeight:"82vh",borderRadius:18}} /><div style={{display:"flex",gap:12}}><a href={previewImg} download style={{padding:"10px 22px",background:T.grad,borderRadius:14,color:"#fff",fontWeight:700,fontSize:13,textDecoration:"none"}}>⬇ Download</a><div onClick={()=>setPreviewImg(null)} style={{padding:"10px 22px",background:T.card,borderRadius:14,color:T.text,fontWeight:700,fontSize:13,cursor:"pointer",border:"1px solid "+T.border}}>Close ✕</div></div></div>}
{viewS&&<div onClick={()=>setViewS(null)} style={{position:"fixed",inset:0,background:"#000",zIndex:10000,display:"flex",flexDirection:"column",animation:"fadeIn 0.2s ease"}}><div style={{padding:"18px 20px",display:"flex",alignItems:"center",gap:13,background:"rgba(0,0,0,0.7)"}}><Av name={viewS.name} size={44} /><div><div style={{fontWeight:700,color:"#fff",fontSize:15}}>{viewS.name}</div><div style={{fontSize:11,color:"rgba(255,255,255,0.5)",marginTop:2}}>{tAgo(viewS.timestamp)}</div></div><span style={{marginLeft:"auto",fontSize:22,color:"rgba(255,255,255,0.6)",cursor:"pointer"}}>✕</span></div><div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:22}}>{viewS.image&&<img src={viewS.image} alt="s" style={{maxWidth:"100%",maxHeight:"70vh",borderRadius:18}} />}{viewS.text&&<p style={{color:"#fff",fontSize:22,textAlign:"center",lineHeight:1.6,fontWeight:600,maxWidth:380}}>{viewS.text}</p>}</div></div>}
{showInvite&&<Modal onClose={()=>setShowInvite(false)}><Card style={{padding:30,textAlign:"center"}}><div style={{width:66,height:66,borderRadius:20,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 14px",boxShadow:T.shadow}}>🔗</div><h3 style={{color:T.text,fontWeight:800,fontSize:19,marginBottom:8,fontFamily:"'Poppins',sans-serif"}}>Invite Friends</h3><div style={{background:T.card2,borderRadius:12,padding:"11px 14px",fontSize:11,color:T.blue,wordBreak:"break-all",marginBottom:18,border:"1px solid "+T.border,lineHeight:1.6}}>{invL}</div><Btn onClick={copyLink} style={{marginBottom:10}}>{copied?"Copied!":"Copy Link"}</Btn><div onClick={()=>setShowInvite(false)} style={{padding:"10px",color:T.muted,cursor:"pointer",fontSize:13}}>Close</div></Card></Modal>}
{policy&&<Modal onClose={()=>setPolicy(null)}><Card style={{padding:26,maxHeight:"75vh",overflowY:"auto"}}><div style={{fontWeight:800,fontSize:17,color:T.text,marginBottom:12}}>{policy==="privacy"?"Privacy Policy":"Terms"}</div><div style={{color:T.mutedL,fontSize:13,lineHeight:1.9}}>{policy==="privacy"?<><p>Independent platform.</p><p>Data: Email, name, photo, messages.</p></>:<><p>Lawful use only.</p><p>Not affiliated with WhatsApp or Meta.</p></>}</div><Btn onClick={()=>setPolicy(null)} style={{marginTop:16}}>Close</Btn></Card></Modal>}
{showStarred&&<Modal onClose={()=>setShowStarred(false)}><Card style={{padding:0,maxHeight:"80vh",overflow:"hidden",display:"flex",flexDirection:"column"}}><div style={{padding:"18px 20px",borderBottom:"1px solid "+T.border,display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{fontWeight:800,fontSize:17,color:T.text}}>⭐ Starred Messages</div><div onClick={()=>setShowStarred(false)} style={{color:T.muted,cursor:"pointer",fontSize:20}}>✕</div></div><div style={{flex:1,overflowY:"auto",padding:14}}>{starredList.length===0?<div style={{textAlign:"center",padding:40,color:T.muted}}><div style={{fontSize:44,marginBottom:10}}>⭐</div><div style={{fontWeight:700,fontSize:14,color:T.text}}>No starred messages</div><div style={{fontSize:12,marginTop:6}}>Tap message → Star</div></div>:starredList.map((s,i)=>(<div key={i} style={{padding:"12px 14px",background:T.card2,borderRadius:14,marginBottom:8,border:"1px solid "+T.border}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><div style={{width:24,height:24,borderRadius:8,background:cfn(s.chatName),display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#fff",flexShrink:0}}>{gi(s.chatName)}</div><div style={{fontSize:11,color:T.blue,fontWeight:700}}>{s.chatName}</div><div style={{fontSize:10,color:T.muted,marginLeft:"auto"}}>{tAgo(s.timestamp)}</div></div><div style={{fontSize:13,color:T.text,fontWeight:500}}>{s.text||"Photo"}</div></div>))}</div></Card></Modal>}
{showDisappear&&activeChat&&<Modal onClose={()=>setShowDisappear(false)}><Card style={{padding:24}}><div style={{fontWeight:800,fontSize:17,color:T.text,marginBottom:6}}>Disappearing Messages</div><div style={{fontSize:12,color:T.muted,marginBottom:18}}>Messages auto-delete after selected time</div>{DOPT.map(opt=>(<div key={opt.val} onClick={()=>setDisappearTime(activeChat.chatId,opt.val)} style={{padding:"13px 16px",background:curD===opt.val?T.grad:T.card2,borderRadius:13,marginBottom:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",border:"1.5px solid "+(curD===opt.val?T.blue:T.border),transition:"all 0.2s"}}><span style={{fontWeight:700,fontSize:14,color:"#fff"}}>{opt.label}</span>{curD===opt.val&&<span style={{color:"#fff",fontSize:16}}>✓</span>}</div>))}<Btn onClick={()=>setShowDisappear(false)} v="g" style={{marginTop:6}}>Cancel</Btn></Card></Modal>}

{nav==="chat"&&activeChat?(
<div style={{display:"flex",flexDirection:"column",height:"100%",background:T.bg}}>
<div style={{display:"flex",alignItems:"center",padding:"12px 14px",background:T.card,gap:11,borderBottom:"1px solid "+T.border,boxShadow:"0 2px 14px rgba(0,0,0,0.3)",flexShrink:0,zIndex:10}}>
<div onClick={()=>{setNav("home");setShowEmoji(false);setMsgMenu(null);setReactBar(null);setReplyTo(null);}} style={{width:36,height:36,borderRadius:11,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,border:"1px solid "+T.border,flexShrink:0}}>←</div>
<div onClick={()=>loadContactProfile(activeChat)} style={{width:42,height:42,borderRadius:14,background:cfn(activeChat.name),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:16,color:"#fff",flexShrink:0,boxShadow:T.shadow,cursor:"pointer"}}>{gi(activeChat.name)}</div>
<div style={{flex:1,overflow:"hidden",cursor:"pointer"}} onClick={()=>loadContactProfile(activeChat)}>
<div style={{fontWeight:800,fontSize:15,color:T.text,fontFamily:"'Poppins',sans-serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{activeChat.name}</div>
<div style={{fontSize:10,fontWeight:600,marginTop:1,color:isTyping?"#A78BFA":T.blue}}>
{isTyping?"typing...":"Online"}
{curD>0&&" · Timer on"}
</div>
</div>
<div style={{display:"flex",gap:5,flexShrink:0}}>
<div onClick={()=>setShowStarred(true)} style={{width:32,height:32,borderRadius:10,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:13,border:"1px solid "+T.border}}>⭐</div>
<div onClick={()=>setShowDisappear(true)} style={{width:32,height:32,borderRadius:10,background:curD>0?T.grad:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:13,border:"1px solid "+T.border}}>⏱️</div>
<div onClick={()=>startCall("audio")} style={{width:32,height:32,borderRadius:10,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:13,border:"1px solid "+T.border}}>📞</div>
<div onClick={()=>startCall("video")} style={{width:32,height:32,borderRadius:10,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:13,border:"1px solid "+T.border}}>📹</div>
</div>
</div>

<div style={{flex:1,overflowY:"auto",padding:"14px 12px",display:"flex",flexDirection:"column",gap:2,position:"relative",...bgStyle()}} onClick={()=>{setMsgMenu(null);setShowEmoji(false);setReactBar(null);}}>
{msgs.length===0&&<div style={{textAlign:"center",margin:"auto",color:T.muted,padding:40}}><div style={{fontSize:54,marginBottom:14,opacity:0.3}}>👋</div><div style={{fontSize:16,fontWeight:700,color:T.text,fontFamily:"'Poppins',sans-serif"}}>Say hello!</div><div style={{fontSize:12,marginTop:8}}>Start chatting with <strong style={{color:T.blue}}>{activeChat.name}</strong></div></div>}
{msgs.map((msg,i)=>{
if(msg.deletedFor&&msg.deletedFor[user.uid])return null;
const isMine=msg.senderUid===user.uid;
const showAv=!isMine&&(i===0||msgs[i-1].senderUid!==msg.senderUid);
const isDeleted=msg.deleted;
const isLast=i===msgs.length-1;
const msgKeys=Object.keys(msgs);
const msgKey=msgKeys[i]||String(i);
const showDay=isND(msgs,i);
const isStarred=starred[activeChat.chatId+"_"+msgKey];
const msgReacts=getMR(msgKey);
const myReact=getMyR(msgKey);
const hasReacts=Object.keys(msgReacts).length>0;
const isRBOpen=reactBar&&reactBar.msgKey===msgKey;
return(
<div key={i}>
{showDay&&<div style={{textAlign:"center",margin:"10px 0 6px"}}><span style={{fontSize:11,color:T.mutedL,fontWeight:600,background:T.card2,padding:"4px 14px",borderRadius:20,border:"1px solid "+T.border}}>{dayLbl(msg.timestamp)}</span></div>}
<div style={{display:"flex",justifyContent:isMine?"flex-end":"flex-start",marginBottom:hasReacts?14:(showAv?5:2),animation:"msgIn 0.2s ease",alignItems:"flex-end",gap:4}}>
{!isMine&&<div style={{width:28,height:28,flexShrink:0,alignSelf:"flex-end",marginBottom:2}}>{showAv&&<div style={{width:28,height:28,borderRadius:9,background:cfn(msg.senderName),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:9,color:"#fff"}}>{gi(msg.senderName)}</div>}</div>}

{isMine&&!isDeleted&&(
<div onClick={e=>{e.stopPropagation();setReactBar(isRBOpen?null:{msgKey,isMine,msg});setMsgMenu(null);}} style={{width:26,height:26,borderRadius:"50%",background:isRBOpen?T.grad:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:13,border:"1px solid "+T.border,flexShrink:0,transition:"all 0.2s"}}>😊</div>
)}

<div style={{maxWidth:"73%",display:"flex",flexDirection:"column",alignItems:isMine?"flex-end":"flex-start",position:"relative"}}>
{isStarred&&!isDeleted&&<div style={{fontSize:10,color:"#F59E0B",marginBottom:2}}>⭐</div>}
{msg.replyTo&&!isDeleted&&<div style={{padding:"6px 12px",background:isMine?"rgba(255,255,255,0.08)":"rgba(79,142,247,0.08)",borderRadius:"12px 12px 0 0",marginBottom:-2,borderLeft:"3px solid "+T.blue,maxWidth:"100%",overflow:"hidden"}}><div style={{fontSize:10,color:T.blue,fontWeight:700,marginBottom:1}}>{msg.replyTo.senderName}</div><div style={{fontSize:11,color:T.mutedL,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{msg.replyTo.text}</div></div>}
<div onClick={e=>{e.stopPropagation();if(!isDeleted){setMsgMenu(isRBOpen||msgMenu&&msgMenu.msgKey===msgKey?null:{msgKey,isMine,text:msg.text,msg});setReactBar(null);}}} style={{padding:msg.image?"6px 6px 8px":(isDeleted?"10px 14px 8px":"11px 15px 9px"),background:isDeleted?"transparent":(isMine?T.gradS:T.card2),borderRadius:isMine?"20px 20px 5px 20px":"20px 20px 20px 5px",boxShadow:isDeleted?"none":(isMine?"0 3px 14px rgba(30,58,138,0.45)":"0 2px 10px rgba(0,0,0,0.3)"),border:isDeleted?"1px dashed "+T.border:(isMine?"none":"1px solid "+T.border),cursor:"pointer"}}>
{!isMine&&showAv&&!isDeleted&&<div style={{fontSize:10,color:cfn(msg.senderName),fontWeight:700,marginBottom:4}}>{msg.senderName}</div>}
{isDeleted?<div style={{fontSize:13,color:T.muted,fontStyle:"italic",display:"flex",alignItems:"center",gap:6}}><span>🚫</span>Deleted</div>:<>
{msg.image&&<div style={{position:"relative"}}><img src={msg.image} alt="s" onClick={e=>{e.stopPropagation();setPreviewImg(msg.image);}} style={{maxWidth:200,maxHeight:200,borderRadius:14,display:"block",cursor:"pointer",objectFit:"cover"}} /><div style={{position:"absolute",bottom:8,right:8,background:"rgba(0,0,0,0.65)",borderRadius:10,padding:"2px 8px",display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"rgba(255,255,255,0.9)"}}>{ft(msg.timestamp)}</span>{isMine&&<span style={{fontSize:11,color:isLast?"#60A5FA":"rgba(255,255,255,0.6)"}}>✓✓</span>}</div></div>}
{msg.text&&!msg.image&&<p style={{margin:0,fontSize:14,lineHeight:1.65,color:T.text,wordBreak:"break-word",whiteSpace:"pre-wrap"}}>{msg.text}</p>}
</>}
{!msg.image&&!isDeleted&&<div style={{display:"flex",justifyContent:"flex-end",alignItems:"center",gap:3,marginTop:4}}><span style={{fontSize:10,color:isMine?"rgba(255,255,255,0.4)":T.muted}}>{ft(msg.timestamp)}</span>{isMine&&<span style={{fontSize:12,color:isLast?"#60A5FA":"rgba(255,255,255,0.45)"}}>✓✓</span>}</div>}
</div>
{hasReacts&&!isDeleted&&(
<div style={{display:"flex",gap:3,marginTop:5,flexWrap:"wrap",justifyContent:isMine?"flex-end":"flex-start"}}>
{Object.entries(msgReacts).map(([emoji,count])=>(
<div key={emoji} onClick={e=>{e.stopPropagation();addReaction(msgKey,emoji);}} style={{display:"flex",alignItems:"center",gap:3,padding:"3px 8px",background:myReact===emoji?T.grad:T.card,borderRadius:12,cursor:"pointer",border:"1px solid "+(myReact===emoji?T.blue:T.border),animation:"reactPop 0.3s ease",transition:"all 0.2s"}}>
<span style={{fontSize:14}}>{emoji}</span>
{count>1&&<span style={{fontSize:11,fontWeight:700,color:myReact===emoji?"#fff":T.mutedL}}>{count}</span>}
</div>
))}
</div>
)}
{isRBOpen&&(
<div ref={reactRef} style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:6,padding:"8px 10px",background:T.card,borderRadius:20,border:"1px solid "+T.border,boxShadow:"0 4px 20px rgba(0,0,0,0.6)",animation:"reactIn 0.2s ease",justifyContent:isMine?"flex-end":"flex-start"}}>
{REACTS.map(emoji=>(
<div key={emoji} onClick={e=>{e.stopPropagation();addReaction(msgKey,emoji);}} style={{width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,cursor:"pointer",borderRadius:10,background:myReact===emoji?T.grad:"transparent",transition:"all 0.15s",border:myReact===emoji?"1px solid "+T.blue:"1px solid transparent"}}>{emoji}</div>
))}
<div style={{width:1,height:24,background:T.border,margin:"4px 2px",alignSelf:"center"}} />
<div onClick={e=>{e.stopPropagation();setReplyTo({text:msg.text||"Photo",senderName:msg.senderName});setReactBar(null);}} style={{width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,cursor:"pointer",borderRadius:8,background:T.card2}}>↩️</div>
<div onClick={e=>{e.stopPropagation();toggleStar(msgKey,msg);setReactBar(null);}} style={{width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,cursor:"pointer",borderRadius:8,background:T.card2}}>⭐</div>
{msg.text&&<div onClick={e=>{e.stopPropagation();copyMsg(msg.text);setReactBar(null);}} style={{width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,cursor:"pointer",borderRadius:8,background:T.card2}}>📋</div>}
{isMine&&<div onClick={e=>{e.stopPropagation();deleteMsg(msgKey,false);setReactBar(null);}} style={{width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,cursor:"pointer",borderRadius:8,background:T.card2}}>🗑️</div>}
</div>
)}
</div>

{!isMine&&!isDeleted&&(
<div onClick={e=>{e.stopPropagation();setReactBar(isRBOpen?null:{msgKey,isMine,msg});setMsgMenu(null);}} style={{width:26,height:26,borderRadius:"50%",background:isRBOpen?T.grad:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:13,border:"1px solid "+T.border,flexShrink:0,transition:"all 0.2s"}}>😊</div>
)}
</div>
</div>
);
})}
{isTyping&&<div style={{display:"flex",alignItems:"flex-end",gap:8,marginTop:4,animation:"msgIn 0.3s ease"}}><div style={{width:28,height:28,borderRadius:9,background:cfn(activeChat.name),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:9,color:"#fff",flexShrink:0}}>{gi(activeChat.name)}</div><div style={{padding:"11px 16px",background:T.card2,borderRadius:"18px 18px 18px 5px",border:"1px solid "+T.border,display:"flex",gap:5,alignItems:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:"#A78BFA",animation:"dot 1.4s "+(i*0.2)+"s infinite"}} />)}</div></div>}
<div ref={endRef} />
</div>

{msgMenu&&(
<div ref={msgMenuRef} style={{position:"fixed",bottom:88,left:"50%",transform:"translateX(-50%)",background:T.card,borderRadius:18,padding:8,border:"1px solid "+T.border,boxShadow:"0 8px 32px rgba(0,0,0,0.7)",zIndex:500,minWidth:200,animation:"slideUp 0.2s ease"}}>
{[
["↩️ Reply",()=>{setReplyTo({text:msgMenu.msg&&msgMenu.msg.text||"Photo",senderName:msgMenu.msg&&msgMenu.msg.senderName||""});setMsgMenu(null);}],
["⭐ Star",()=>{toggleStar(msgMenu.msgKey,msgMenu.msg);setMsgMenu(null);}],
...(msgMenu.msg&&msgMenu.msg.text?[["📋 Copy",()=>copyMsg(msgMenu.msg.text)]]:[] ),
...(msgMenu.isMine?[["🗑️ Delete for me",()=>deleteMsg(msgMenu.msgKey,false)],["🚫 Delete for all",()=>deleteMsg(msgMenu.msgKey,true)]]:[["🗑️ Delete for me",()=>deleteMsg(msgMenu.msgKey,false)]]),
["✕ Close",()=>setMsgMenu(null)]
].map(([label,fn])=>(
<div key={label} onClick={fn} style={{padding:"11px 16px",borderRadius:11,cursor:"pointer",fontSize:13,fontWeight:600,color:(label.includes("Delete")||label.includes("🚫"))?"#EF4444":T.text,transition:"background 0.15s"}} onMouseEnter={e=>e.currentTarget.style.background=T.card2} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>{label}</div>
))}
</div>
)}

{replyTo&&<div style={{padding:"9px 14px",background:T.card2,borderBottom:"1px solid "+T.border,display:"flex",alignItems:"center",gap:10,animation:"slideDown 0.2s ease",flexShrink:0}}><div style={{flex:1,borderLeft:"3px solid "+T.blue,paddingLeft:10}}><div style={{fontSize:11,color:T.blue,fontWeight:700,marginBottom:2}}>{replyTo.senderName}</div><div style={{fontSize:12,color:T.mutedL,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{replyTo.text}</div></div><div onClick={()=>setReplyTo(null)} style={{color:T.muted,cursor:"pointer",fontSize:18,padding:4}}>✕</div></div>}
{showEmoji&&<div style={{background:T.card,borderTop:"1px solid "+T.border,padding:12,animation:"slideUp 0.2s ease",flexShrink:0}}><div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center"}}>{EMOJIS.map(e=><div key={e} onClick={()=>setInp(p=>p+e)} style={{fontSize:22,cursor:"pointer",padding:"5px 7px",borderRadius:8,transition:"background 0.15s",userSelect:"none"}} onMouseEnter={ev=>ev.currentTarget.style.background=T.card2} onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>{e}</div>)}</div></div>}

<div style={{padding:"10px 11px",background:T.card,borderTop:"1px solid "+T.border,flexShrink:0}}>
<input type="file" accept="image/*,video/*" ref={fileRef} onChange={handleImg} style={{display:"none"}} />
<div style={{display:"flex",alignItems:"flex-end",gap:7}}>
<div onClick={()=>setShowEmoji(p=>!p)} style={{width:38,height:38,borderRadius:12,background:showEmoji?T.grad:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:18,border:"1px solid "+T.border,flexShrink:0,transition:"all 0.2s",marginBottom:1}}>😊</div>
<div style={{display:"flex",alignItems:"center",background:T.card2,borderRadius:20,flex:1,padding:"9px 12px",gap:8,border:"1.5px solid "+T.border,minHeight:42}}>
<textarea value={inp} onChange={e=>handleTyping(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg();}}} placeholder="Message..." rows={1} style={{flex:1,background:"none",border:"none",outline:"none",color:T.text,fontSize:14,fontFamily:"'Inter',sans-serif",resize:"none",lineHeight:1.5,maxHeight:100,overflowY:"auto"}} />
<div onClick={()=>fileRef.current&&fileRef.current.click()} style={{cursor:"pointer",fontSize:17,opacity:0.45,flexShrink:0,transition:"opacity 0.2s"}} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.45}>📎</div>
</div>
{inp.trim()?<div onClick={()=>sendMsg()} style={{width:42,height:42,borderRadius:14,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:17,boxShadow:T.shadow,transition:"all 0.2s",flexShrink:0}} onMouseDown={e=>e.currentTarget.style.transform="scale(0.92)"} onMouseUp={e=>e.currentTarget.style.transform="scale(1)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>➤</div>:<div onClick={toggleRec} style={{width:42,height:42,borderRadius:14,background:isRec?"#EF4444":T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:isRec?11:18,border:"1px solid "+T.border,flexShrink:0,transition:"all 0.2s",color:isRec?"#fff":"inherit"}}>{isRec?fD(recTime):"🎤"}</div>}
</div>
</div>
</div>
):(
<div style={{display:"flex",flexDirection:"column",height:"100%"}}>
<div style={{padding:"14px 16px 11px",background:T.card,borderBottom:"1px solid "+T.border,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
<div style={{display:"flex",alignItems:"center",gap:11}}>
<div style={{width:38,height:38,borderRadius:13,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:15,color:"#fff",overflow:"hidden",cursor:"pointer",boxShadow:T.shadow,flexShrink:0}} onClick={()=>{setShowSett(true);setSTab("profile");}}>
{pic?<img src={pic} alt="p" style={{width:38,height:38,objectFit:"cover"}} />:gi((user&&user.displayName)||(user&&user.email))}
</div>
<div><div style={{fontWeight:800,fontSize:17,color:T.text,letterSpacing:"-0.4px",fontFamily:"'Poppins',sans-serif"}}>Khan Chats</div><div style={{fontSize:9,color:T.blue,fontWeight:600}}>Active</div></div>
</div>
<div style={{display:"flex",gap:6}}>
<div onClick={()=>setShowStarred(true)} style={{width:34,height:34,borderRadius:11,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,border:"1px solid "+T.border}}>⭐</div>
<div onClick={()=>setShowSearch(p=>!p)} style={{width:34,height:34,borderRadius:11,background:showSearch?T.grad:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,border:"1px solid "+T.border,transition:"all 0.2s"}}>🔍</div>
<div onClick={genInvite} style={{width:34,height:34,borderRadius:11,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,border:"1px solid "+T.border}}>🔗</div>
<div onClick={()=>setShowSett(true)} style={{width:34,height:34,borderRadius:11,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,border:"1px solid "+T.border}}>⚙️</div>
</div>
</div>
{showSearch&&<div style={{padding:"9px 13px",background:T.card2,borderBottom:"1px solid "+T.border,animation:"slideDown 0.2s ease",flexShrink:0}}><Inp value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search contacts..." autoFocus={true} style={{background:T.card,border:"1.5px solid "+T.blue,boxShadow:"0 0 0 3px rgba(79,142,247,0.1)"}} /></div>}
<div style={{display:"flex",background:T.card,borderBottom:"1px solid "+T.border,flexShrink:0}}>
{[["messages","💬","Messages",totalUnread],["updates","✨","Updates",othS.length],["calls","📞","Calls",0]].map(([v,icon,label,badge])=>(
<div key={v} onClick={()=>setView(v)} style={{flex:1,textAlign:"center",padding:"10px 4px 9px",cursor:"pointer",position:"relative",transition:"all 0.2s"}}>
<div style={{fontSize:16,marginBottom:2}}>{icon}</div>
<div style={{fontSize:9,fontWeight:700,fontFamily:"'Poppins',sans-serif",color:view===v?T.blue:"rgba(74,85,104,0.65)",letterSpacing:0.4,transition:"color 0.2s"}}>{label}</div>
{view===v&&<div style={{position:"absolute",bottom:0,left:"20%",right:"20%",height:2,background:T.grad,borderRadius:2,boxShadow:"0 0 6px "+T.blue}} />}
{badge>0&&<div style={{position:"absolute",top:6,right:"12%",background:T.gradD,borderRadius:10,minWidth:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:"#fff",padding:"0 3px",animation:"badgePop 0.3s ease"}}>{badge>9?"9+":badge}</div>}
</div>
))}
</div>
<div style={{flex:1,overflowY:"auto",paddingBottom:68}}>
{view==="messages"&&<div style={{animation:"fadeIn 0.25s ease"}}>
{showNew&&<div style={{padding:"11px 13px",background:T.card2,borderBottom:"1px solid "+T.border,animation:"slideDown 0.2s ease"}}><Inp value={nEmail} onChange={e=>setNEmail(e.target.value)} placeholder="Enter friend's email..." onKeyDown={e=>e.key==="Enter"&&startChat()} style={{marginBottom:9}} />{nEmailErr&&<div style={{color:"#EF4444",fontSize:12,marginBottom:8,padding:"6px 11px",background:"rgba(239,68,68,0.08)",borderRadius:9}}>{nEmailErr}</div>}<div style={{display:"flex",gap:8}}><Btn onClick={startChat} style={{flex:1,padding:"10px",borderRadius:12,fontSize:13}}>Start Chat</Btn><Btn onClick={()=>{setShowNew(false);setNEmailErr("");}} v="g" style={{padding:"10px 14px",borderRadius:12}}>✕</Btn></div></div>}
{!searchQ&&filtC.length===0&&lkC.length===0?(
<div style={{padding:"22px 16px",animation:"fadeIn 0.3s ease"}}>
<div style={{background:T.grad,borderRadius:22,padding:22,marginBottom:14,position:"relative",overflow:"hidden",boxShadow:T.shadowL}}><div style={{position:"absolute",top:-15,right:-15,width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,0.05)"}} /><div style={{position:"relative"}}><div style={{fontSize:30,marginBottom:7}}>👋</div><div style={{fontWeight:800,fontSize:17,color:"#fff",fontFamily:"'Poppins',sans-serif",marginBottom:4}}>Welcome, {user&&user.displayName&&user.displayName.split(" ")[0]}!</div><div style={{fontSize:12,color:"rgba(255,255,255,0.7)",lineHeight:1.6,marginBottom:14}}>Start connecting on Khan Chats</div><div style={{display:"flex",gap:8}}><Btn onClick={()=>setShowNew(true)} style={{background:"rgba(255,255,255,0.18)",borderRadius:11,padding:"9px 16px",fontSize:12,boxShadow:"none",border:"1px solid rgba(255,255,255,0.2)"}}>New Chat</Btn><Btn onClick={genInvite} style={{background:"rgba(255,255,255,0.12)",borderRadius:11,padding:"9px 16px",fontSize:12,boxShadow:"none",border:"1px solid rgba(255,255,255,0.15)"}}>Invite</Btn></div></div></div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>{[["💬","New Chat","Start messaging",()=>setShowNew(true)],["✨","Updates","Share status",()=>setView("updates")],["⭐","Starred","Saved messages",()=>setShowStarred(true)],["🤖","Khan AI","AI assistant",()=>{setShowSett(true);setSTab("ai");}]].map(([icon,title,desc,fn])=>(<div key={title} onClick={fn} style={{background:T.card,borderRadius:16,padding:15,cursor:"pointer",border:"1px solid "+T.border,transition:"all 0.2s",boxShadow:"0 2px 16px rgba(0,0,0,0.4)"}} onMouseEnter={e=>e.currentTarget.style.background=T.card2} onMouseLeave={e=>e.currentTarget.style.background=T.card}><div style={{fontSize:22,marginBottom:6}}>{icon}</div><div style={{fontWeight:700,fontSize:13,color:T.text,marginBottom:2}}>{title}</div><div style={{fontSize:11,color:T.muted}}>{desc}</div></div>))}</div>
</div>
):(
<div>
{!searchQ&&recentAct.length>0&&<div style={{padding:"10px 14px 0"}}><div style={{fontSize:9,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>Recent</div><div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:8}}>{recentAct.map(c=>(<div key={c.chatId} onClick={()=>handleChatClick(c)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer",flexShrink:0}}><div style={{position:"relative"}}><div style={{width:48,height:48,borderRadius:16,background:cfn(c.name),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:16,color:"#fff"}}>{gi(c.name)}</div>{(unread[c.chatId]||0)>0&&<div style={{position:"absolute",top:-3,right:-3,width:16,height:16,background:T.gradD,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:"#fff",animation:"badgePop 0.3s ease"}}>{(unread[c.chatId]||0)>9?"9+":unread[c.chatId]}</div>}</div><div style={{fontSize:10,color:T.mutedL,fontWeight:600,maxWidth:52,textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name.split(" ")[0]}</div></div>))}</div></div>}
{filtC.map(([chatId,contact],idx)=>(<div key={chatId} style={{display:"flex",alignItems:"center",padding:"12px 16px",cursor:"pointer",gap:12,background:"transparent",borderBottom:"1px solid "+T.border,transition:"all 0.15s ease",animation:"slideUp 0.3s "+(Math.min(idx*0.04,0.3))+"s ease both"}} onMouseEnter={e=>e.currentTarget.style.background=T.card} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><div style={{position:"relative",flexShrink:0}} onClick={()=>loadContactProfile(contact)}><div style={{width:50,height:50,borderRadius:17,background:cfn(contact.name),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:17,color:"#fff"}}>{gi(contact.name)}</div>{pins.includes(chatId)&&<div style={{position:"absolute",top:-5,right:-5,fontSize:9,background:T.bg,borderRadius:"50%",width:16,height:16,display:"flex",alignItems:"center",justifyContent:"center"}}>📌</div>}{disappear[chatId]>0&&<div style={{position:"absolute",bottom:-3,right:-3,fontSize:8,background:T.blue,borderRadius:"50%",width:14,height:14,display:"flex",alignItems:"center",justifyContent:"center"}}>⏱</div>}</div><div style={{flex:1,overflow:"hidden"}} onClick={()=>handleChatClick(contact)}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}><span style={{fontWeight:700,fontSize:14,color:T.text}}>{contact.name}</span><span style={{fontSize:10,color:(unread[chatId]||0)>0?T.blue:T.muted,fontWeight:500,flexShrink:0}}>{tAgo(contact.lastTime)}</span></div><div style={{fontSize:12,color:T.muted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{contact.lastMsg||contact.email}</div></div>{(unread[chatId]||0)>0&&<div onClick={()=>handleChatClick(contact)} style={{minWidth:19,height:19,background:T.grad,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:"#fff",flexShrink:0,padding:"0 4px",boxShadow:T.shadow,animation:"badgePop 0.3s ease"}}>{(unread[chatId]||0)>9?"9+":unread[chatId]}</div>}</div>))}
{lkC.length>0&&<div><div onClick={()=>setShowLocked(p=>!p)} style={{display:"flex",alignItems:"center",padding:"11px 16px",cursor:"pointer",background:T.card2,borderBottom:"1px solid "+T.border,gap:10}}><div style={{width:38,height:38,borderRadius:12,background:"rgba(239,68,68,0.07)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,border:"1px solid rgba(239,68,68,0.12)"}}>🔒</div><span style={{fontWeight:700,fontSize:13,color:T.muted,flex:1}}>Locked ({lkC.length})</span><span style={{color:T.muted,fontSize:12}}>{showLocked?"▲":"▼"}</span></div>{showLocked&&lkC.map(([chatId],idx)=>(<div key={chatId} onClick={()=>handleChatClick(contacts[chatId])} style={{display:"flex",alignItems:"center",padding:"12px 16px",cursor:"pointer",gap:12,background:T.bg,borderBottom:"1px solid "+T.border,animation:"slideUp 0.2s "+(idx*0.04)+"s ease both"}}><div style={{width:50,height:50,borderRadius:17,background:T.card2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,border:"1px solid "+T.border}}>🔒</div><div style={{flex:1}}><div style={{fontWeight:700,fontSize:14,color:T.muted}}>Locked</div><div style={{fontSize:12,color:T.muted,marginTop:2}}>Tap to unlock</div></div></div>))}</div>}
{searchQ&&filtC.length===0&&<div style={{padding:46,textAlign:"center",color:T.muted}}><div style={{fontSize:44,marginBottom:10,opacity:0.25}}>🔍</div><div style={{fontWeight:700,fontSize:13,color:T.text}}>No results</div></div>}
</div>
)}
</div>}
{view==="updates"&&<div style={{animation:"fadeIn 0.25s ease"}}><div style={{padding:"12px 14px",borderBottom:"1px solid "+T.border}}><div onClick={()=>setShowAddS(p=>!p)} style={{display:"flex",alignItems:"center",gap:12,cursor:"pointer",padding:"2px 0"}}><div style={{width:52,height:52,borderRadius:17,background:myS.length>0?cfn(user&&user.displayName):T.card2,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:18,color:"#fff",border:myS.length>0?"2.5px solid "+T.blue:"2.5px dashed "+T.border,flexShrink:0,overflow:"hidden"}}>{pic?<img src={pic} alt="p" style={{width:52,height:52,objectFit:"cover"}} />:gi(user&&user.displayName)}</div><div style={{flex:1}}><div style={{fontWeight:700,fontSize:14,color:T.text}}>My Update</div><div style={{fontSize:11,color:T.muted,marginTop:2}}>{myS.length>0?tAgo(myS[0].timestamp):"Share what's on your mind"}</div></div><div style={{width:32,height:32,borderRadius:10,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,color:"#fff",boxShadow:T.shadow,flexShrink:0}}>+</div></div>{showAddS&&<div style={{marginTop:11,padding:13,background:T.card2,borderRadius:15,border:"1px solid "+T.border,animation:"slideDown 0.2s ease"}}><Inp value={sText} onChange={e=>setSText(e.target.value)} placeholder="What's on your mind?" style={{marginBottom:9}} /><div style={{display:"flex",gap:7}}><Btn onClick={()=>postS()} style={{flex:1,padding:"10px",borderRadius:11,fontSize:12}}>Share</Btn><Btn onClick={()=>sFRef.current&&sFRef.current.click()} v="g" style={{padding:"10px 13px",borderRadius:11}}>📷</Btn><Btn onClick={()=>setShowAddS(false)} v="g" style={{padding:"10px 13px",borderRadius:11}}>✕</Btn></div><input type="file" accept="image/*" ref={sFRef} onChange={handleSImg} style={{display:"none"}} /></div>}</div>{othS.length>0&&<div style={{padding:"7px 16px 4px",fontSize:9,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1.5}}>Recent</div>}{othS.map((st,i)=>(<div key={i} onClick={()=>setViewS(st)} style={{display:"flex",alignItems:"center",padding:"12px 16px",gap:12,cursor:"pointer",borderBottom:"1px solid "+T.border,transition:"background 0.15s",animation:"slideUp 0.3s "+(i*0.05)+"s ease both"}} onMouseEnter={e=>e.currentTarget.style.background=T.card} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><div style={{width:52,height:52,borderRadius:17,background:cfn(st.name),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:18,color:"#fff",border:"2.5px solid "+T.blue,flexShrink:0}}>{gi(st.name)}</div><div style={{flex:1}}><div style={{fontWeight:700,fontSize:14,color:T.text}}>{st.name}</div><div style={{fontSize:11,color:T.muted,marginTop:2}}>{tAgo(st.timestamp)}</div></div>{st.image&&<div style={{width:44,height:44,borderRadius:12,overflow:"hidden",flexShrink:0}}><img src={st.image} alt="s" style={{width:"100%",height:"100%",objectFit:"cover"}} /></div>}</div>))}{statuses.length===0&&<div style={{padding:50,textAlign:"center",color:T.muted}}><div style={{fontSize:50,marginBottom:12,opacity:0.25}}>✨</div><div style={{fontWeight:700,fontSize:14,color:T.text}}>No updates yet</div></div>}</div>}
{view==="calls"&&<div style={{animation:"fadeIn 0.25s ease"}}><div style={{display:"flex",padding:"2px 8px",background:T.card,borderBottom:"1px solid "+T.border,overflowX:"auto",gap:2}}>{["all","missed","incoming","outgoing"].map(f=>(<div key={f} onClick={()=>setCallF(f)} style={{padding:"9px 11px",cursor:"pointer",fontSize:10,fontWeight:700,whiteSpace:"nowrap",color:callF===f?T.blue:"rgba(74,85,104,0.65)",borderBottom:callF===f?"2.5px solid "+T.blue:"2.5px solid transparent",transition:"all 0.2s"}}>{f==="missed"?"Missed":f==="incoming"?"Incoming":f==="outgoing"?"Outgoing":"All"}</div>))}</div>{filtCalls.length===0?<div style={{padding:50,textAlign:"center",color:T.muted}}><div style={{fontSize:50,marginBottom:12,opacity:0.25}}>📞</div><div style={{fontWeight:700,fontSize:14,color:T.text}}>No calls yet</div></div>:filtCalls.map((call,i)=>(<div key={i} style={{display:"flex",alignItems:"center",padding:"12px 16px",gap:12,borderBottom:"1px solid "+T.border,animation:"slideUp 0.3s "+(Math.min(i*0.04,0.3))+"s ease both"}}><div style={{width:48,height:48,borderRadius:16,background:cfn(call.name),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:16,color:"#fff",flexShrink:0}}>{gi(call.name)}</div><div style={{flex:1}}><div style={{fontWeight:700,fontSize:14,color:T.text}}>{call.name}</div><div style={{fontSize:11,fontWeight:600,marginTop:2,color:call.status==="missed"?"#EF4444":call.direction==="incoming"?T.blue:T.purple}}>{call.status==="missed"?"Missed":call.direction==="incoming"?"Incoming":"Outgoing"}</div><div style={{fontSize:10,color:T.muted,marginTop:1}}>{new Date(call.timestamp).toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</div></div>{call.duration>0&&<div style={{fontSize:10,color:T.muted,flexShrink:0}}>{fD(call.duration)}</div>}</div>))}</div>}
</div>
<div style={{position:"absolute",bottom:0,left:0,right:0,display:"flex",background:T.card,borderTop:"1px solid "+T.border,zIndex:50,boxShadow:"0 -4px 20px rgba(0,0,0,0.3)"}}>
{[["home","🏠","Home",()=>{setView("messages");setShowNew(false);}],["compose","✏️","New",()=>{setView("messages");setShowNew(true);}],["updates","✨","Updates",()=>setView("updates")],["settings","⚙️","Settings",()=>setShowSett(true)]].map(([id,icon,label,fn])=>{
const isActive=(id==="home"&&view==="messages"&&!showNew&&!showSett)||(id==="compose"&&showNew)||(id==="updates"&&view==="updates")||(id==="settings"&&showSett);
return(<div key={id} onClick={fn} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"9px 4px 10px",cursor:"pointer",position:"relative",transition:"all 0.2s",minWidth:0}} onMouseDown={e=>e.currentTarget.style.opacity="0.65"} onMouseUp={e=>e.currentTarget.style.opacity="1"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}><div style={{width:36,height:36,borderRadius:12,background:isActive?T.grad:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,marginBottom:3,transition:"all 0.25s",boxShadow:isActive?T.shadow:"none",flexShrink:0}}>{icon}</div><span style={{fontSize:8,fontWeight:700,color:isActive?T.blue:T.muted,letterSpacing:0.3,fontFamily:"'Poppins',sans-serif",textTransform:"uppercase",whiteSpace:"nowrap"}}>{label}</span>{id==="home"&&totalUnread>0&&<div style={{position:"absolute",top:7,right:"14%",background:T.gradD,borderRadius:10,minWidth:15,height:15,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:800,color:"#fff",padding:"0 3px",animation:"badgePop 0.3s ease"}}>{totalUnread>9?"9+":totalUnread}</div>}</div>);
})}
</div>
{view==="messages"&&!showNew&&<div onClick={()=>setShowNew(true)} style={{position:"absolute",bottom:76,right:16,width:50,height:50,borderRadius:16,background:T.grad,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:20,boxShadow:T.shadowL,transition:"all 0.2s",zIndex:49}} onMouseDown={e=>e.currentTarget.style.transform="scale(0.92)"} onMouseUp={e=>e.currentTarget.style.transform="scale(1)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>✏️</div>}
</div>
)}
</div>
);
}
