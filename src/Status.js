import { useState, useRef } from "react";
import { getDatabase, ref, push, onValue, serverTimestamp } from "firebase/database";

const db = getDatabase();

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return "Expired";
}

export default function Status({ user, onClose }) {
  const [statuses, setStatuses] = useState([]);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const fileInputRef = useRef(null);

  useState(() => {
    const statusRef = ref(db, "statuses");
    onValue(statusRef, (snap) => {
      const data = snap.val() || {};
      const arr = Object.values(data)
        .filter(s => Date.now() - s.timestamp < 86400000)
        .sort((a, b) => b.timestamp - a.timestamp);
      setStatuses(arr);
    });
  }, []);

  const postStatus = async (imageData = null) => {
    if (!text.trim() && !imageData) return;
    setPosting(true);
    await push(ref(db, "statuses"), {
      uid: user.uid,
      name: user.displayName || user.email,
      text: text.trim(),
      image: imageData || null,
      timestamp: Date.now(),
      views: {},
    });
    setText(""); setPosting(false); setShowAdd(false);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500000) { alert("Image must be under 500KB"); return; }
    const reader = new FileReader();
    reader.onload = ev => postStatus(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const myStatuses = statuses.filter(s => s.uid === user.uid);
  const othersStatuses = statuses.filter(s => s.uid !== user.uid);

  const COLORS = ["#25D366","#128C7E","#075E54","#34B7F1","#8B5CF6"];
  function colorFrom(name) {
    let sum = 0; for (let c of (name||"")) sum += c.charCodeAt(0);
    return COLORS[sum % COLORS.length];
  }
  function initials(name) {
    if (!name) return "?";
    return name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"#111b21", zIndex:9999, display:"flex", flexDirection:"column", fontFamily:"'Segoe UI',sans-serif", color:"#e9edef" }}>
      
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", padding:"12px 16px", background:"#202c33", gap:12 }}>
        <span onClick={onClose} style={{ fontSize:22, cursor:"pointer", color:"#8696a0" }}>←</span>
        <div style={{ fontWeight:700, fontSize:18, flex:1 }}>Status</div>
        <span onClick={() => setShowAdd(true)} style={{ fontSize:22, cursor:"pointer" }}>✏️</span>
      </div>

      {/* Add Status */}
      {showAdd && (
        <div style={{ padding:16, background:"#202c33", borderBottom:"1px solid #1f2c33" }}>
          <div style={{ fontSize:13, color:"#25D366", fontWeight:600, marginBottom:8 }}>Add Status</div>
          <input value={text} onChange={e => setText(e.target.value)}
            placeholder="Type your status..."
            style={{ width:"100%", padding:"10px 12px", background:"#2a3942", border:"none", borderRadius:10, color:"#e9edef", fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:8 }} />
          <div style={{ display:"flex", gap:8 }}>
            <div onClick={() => postStatus()} style={{ flex:1, padding:"10px", background: posting?"#128C7E":"#25D366", borderRadius:10, textAlign:"center", color:"#fff", fontWeight:700, cursor:"pointer" }}>
              {posting ? "Posting..." : "📝 Post Text"}
            </div>
            <div onClick={() => fileInputRef.current?.click()} style={{ padding:"10px 14px", background:"#2a3942", borderRadius:10, color:"#e9edef", cursor:"pointer", fontSize:16 }}>📷</div>
            <div onClick={() => setShowAdd(false)} style={{ padding:"10px 14px", background:"#2a3942", borderRadius:10, color:"#8696a0", cursor:"pointer" }}>✕</div>
          </div>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImage} style={{ display:"none" }} />
        </div>
      )}

      <div style={{ flex:1, overflowY:"auto" }}>
        {/* My Status */}
        <div style={{ padding:"8px 16px 4px", fontSize:12, color:"#8696a0", fontWeight:600, textTransform:"uppercase" }}>My Status</div>
        <div onClick={() => myStatuses.length > 0 ? setViewing(myStatuses[0]) : setShowAdd(true)}
          style={{ display:"flex", alignItems:"center", padding:"12px 16px", gap:12, cursor:"pointer", borderBottom:"1px solid #1a2530" }}>
          <div style={{ position:"relative" }}>
            <div style={{ width:52, height:52, borderRadius:"50%", background:colorFrom(user.displayName), display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:17, color:"#fff", border: myStatuses.length > 0 ? "3px solid #25D366" : "3px dashed #8696a0" }}>
              {initials(user.displayName)}
            </div>
            {myStatuses.length === 0 && <div style={{ position:"absolute", bottom:0, right:0, background:"#25D366", borderRadius:"50%", width:18, height:18, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, border:"2px solid #111b21" }}>+</div>}
          </div>
          <div>
            <div style={{ fontWeight:600, fontSize:15 }}>My Status</div>
            <div style={{ fontSize:13, color:"#8696a0" }}>{myStatuses.length > 0 ? timeAgo(myStatuses[0].timestamp) : "Tap to add status"}</div>
          </div>
        </div>

        {/* Others Status */}
        {othersStatuses.length > 0 && (
          <>
            <div style={{ padding:"8px 16px 4px", fontSize:12, color:"#8696a0", fontWeight:600, textTransform:"uppercase" }}>Recent Updates</div>
            {othersStatuses.map((s, i) => (
              <div key={i} onClick={() => setViewing(s)}
                style={{ display:"flex", alignItems:"center", padding:"12px 16px", gap:12, cursor:"pointer", borderBottom:"1px solid #1a2530" }}>
                <div style={{ width:52, height:52, borderRadius:"50%", background:colorFrom(s.name), display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:17, color:"#fff", border:"3px solid #25D366", flexShrink:0 }}>
                  {initials(s.name)}
                </div>
                <div style={{ flex:1, overflow:"hidden" }}>
                  <div style={{ fontWeight:600, fontSize:15 }}>{s.name}</div>
                  <div style={{ fontSize:13, color:"#8696a0" }}>{timeAgo(s.timestamp)}</div>
                </div>
              </div>
            ))}
          </>
        )}

        {statuses.length === 0 && !showAdd && (
          <div style={{ textAlign:"center", marginTop:60, color:"#8696a0" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>📸</div>
            <div style={{ fontSize:15 }}>No status updates yet</div>
            <div style={{ fontSize:13, marginTop:6 }}>Tap ✏️ to add your status</div>
          </div>
        )}
      </div>

      {/* View Status Modal */}
      {viewing && (
        <div onClick={() => setViewing(null)} style={{ position:"fixed", inset:0, background:"#000", zIndex:10000, display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"16px 20px", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:"50%", background:colorFrom(viewing.name), display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, color:"#fff" }}>
              {initials(viewing.name)}
            </div>
            <div>
              <div style={{ fontWeight:700, color:"#fff" }}>{viewing.name}</div>
              <div style={{ fontSize:12, color:"#aaa" }}>{timeAgo(viewing.timestamp)}</div>
            </div>
            <span style={{ marginLeft:"auto", fontSize:24, color:"#fff" }}>✕</span>
          </div>
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
            {viewing.image && <img src={viewing.image} alt="status" style={{ maxWidth:"100%", maxHeight:"70vh", borderRadius:12 }} />}
            {viewing.text && <p style={{ color:"#fff", fontSize:20, textAlign:"center", lineHeight:1.5 }}>{viewing.text}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
