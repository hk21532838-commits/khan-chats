import{useState,useEffect,useRef}from"react";
import{initializeApp}from"firebase/app";
import{getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,onAuthStateChanged,updateProfile}from"firebase/auth";
import{getDatabase,ref,push,onValue,set,get,serverTimestamp,off,onDisconnect}from"firebase/database";
const FC={apiKey:"AIzaSyDJt8Pf6bC938Q9Ufxwj6xSREV0xcQf6_I",authDomain:"khan-chats-d9607.firebaseapp.com",projectId:"khan-chats-d9607",storageBucket:"khan-chats-d9607.firebasestorage.app",messagingSenderId:"646302896729",appId:"1:646302896729:web:41b2d05775c704ad43d748",databaseURL:"https://khan-chats-d9607-default-rtdb.firebaseio.com"};
const fbApp=initializeApp(FC);
const auth=getAuth(fbApp);
const db=getDatabase(fbApp);
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
const hlText=(text,q)=>{
  if(!q)return text;
  const parts=text.split(new RegExp("("+q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+")","ig"));
  return parts.map((p,i)=>p.toLowerCase()===q.toLowerCase()?<mark key={i} style={{background:"#F59E0B",color:"#080E1A",borderRadius:3,padding:"0 1px"}}>{p}</mark>:p);
};
const fLS=ts=>{if(!ts)return"";return"last seen "+dayLbl(ts)+" at "+ft(ts);};
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
const[otherSeen,setOtherSeen]=useState(0);
const[readReceiptsOn,setReadReceiptsOn]=useState(true);
const[showOnl,setShowOnl]=useState(true);const[showLS,setShowLS]=useState(true);
const[peer,setPeer]=useState({});const[peerPrefs,setPeerPrefs]=useState({});
const[onlineMap,setOnlineMap]=useState({});
const[showMsgSearch,setShowMsgSearch]=useState(false);const[msgSearchQ,setMsgSearchQ]=useState("");const[matchIdx,setMatchIdx]=useState(0);

const endRef=useRef(null);const fileRef=useRef(null);const sFRef=useRef(null);const picRef=useRef(null);
const lvRef=useRef(null);const rvRef=useRef(null);const pcRef=useRef(null);const lsRef=useRef(null);
const typTimer=useRef(null);const notifId=useRef(0);const recTimer=useRef(null);
const msgMenuRef=useRef(null);const aiEndRef=useRef(null);const reactRef=useRef(null);
const onlineSubs=useRef(new Set());const msgRefs=useRef({});

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
  if(activeChat&&user&&msgs.length>0)markSeen(activeChat.chatId);
},[msgs,activeChat]);
useEffect(()=>{
  if(!user)return;
  const h=()=>{
    const vis=document.visibilityState==="visible";
    set(ref(db,"users/"+user.uid+"/online"),vis).catch(()=>{});
    if(!vis)set(ref(db,"users/"+user.uid+"/lastSeen"),serverTimestamp()).catch(()=>{});
  };
  document.addEventListener("visibilitychange",h);
  return()=>document.removeEventListener("visibilitychange",h);
},[user]);

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
      if(!onlineSubs.current.has(data[cId].with)){
        onlineSubs.current.add(data[cId].with);
        onValue(ref(db,"users/"+data[cId].with+"/online"),os=>{setOnlineMap(p=>({...p,[data[cId].with]:os.val()===true}));});
        onValue(ref(db,"presencePrefs/"+data[cId].with),ps=>{const v=ps.val()||{};if(v.online===false)setOnlineMap(p=>({...p,[data[cId].with]:false}));});
      }
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
  onValue(ref(db,"readReceiptsPref/"+u.uid),snap=>{setReadReceiptsOn(snap.val()===false?false:true);});
  onValue(ref(db,"presencePrefs/"+u.uid),snap=>{const v=snap.val()||{};setShowOnl(v.online!==false);setShowLS(v.lastSeen!==false);});
  onValue(ref(db,".info/connected"),snap=>{
    if(snap.val()===true){
      onDisconnect(ref(db,"users/"+u.uid+"/online")).set(false);
      onDisconnect(ref(db,"users/"+u.uid+"/lastSeen")).set(serverTimestamp());
      set(ref(db,"users/"+u.uid+"/online"),true).catch(()=>{});
    }
  });
};

const markSeen=chatId=>{if(user)set(ref(db,"chats/"+chatId+"/seen/"+user.uid),Date.now());};
const togglePresence=async k=>{const cur=k==="online"?showOnl:showLS;await set(ref(db,"presencePrefs/"+user.uid+"/"+k),!cur);};
const toggleReadReceipts=async()=>{const nv=!readReceiptsOn;setReadReceiptsOn(nv);await set(ref(db,"readReceiptsPref/"+user.uid),nv);};

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
    const res=await fetch("/api/khan-ai",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        system_instruction:{parts:[{text:"You are Khan AI, a friendly helpful assistant for Khan Chats by Hamza Khan. Speak English and Urdu. Be warm and concise."}]},
        contents:[...hist,{role:"user",parts:[{text:txt}]}]
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
  if(user){await set(ref(db,"users/"+user.uid+"/online"),false);await set(ref(db,"users/"+user.uid+"/lastSeen"),serverTimestamp());}
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
  setActiveChat(c);setNav("chat");setShowEmoji(false);setReplyTo(null);setMsgMenu(null);setReactBar(null);setOtherSeen(0);
  set(ref(db,"userChats/"+user.uid+"/"+c.chatId+"/unread"),0);
  setUnread(p=>({...p,[c.chatId]:0}));
  off(ref(db,"chats/"+c.chatId+"/messages"));
  off(ref(db,"chats/"+c.chatId+"/seen/"+c.uid));
  off(ref(db,"users/"+c.uid));off(ref(db,"presencePrefs/"+c.uid));
  setPeer({});setPeerPrefs({});
  onValue(ref(db,"users/"+c.uid),snap=>{setPeer(snap.val()||{});});
  onValue(ref(db,"presencePrefs/"+c.uid),snap=>{setPeerPrefs(snap.val()||{});});
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
  onValue(ref(db,"chats/"+c.chatId+"/seen/"+c.uid),snap=>{setOtherSeen(s
