import { useState, useEffect } from "react";
import { getDatabase, ref, onValue, push, serverTimestamp } from "firebase/database";

const db = getDatabase();

function formatTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

function formatDuration(seconds) {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const COLORS = ["#25D366","#128C7E","#075E54","#34B7F1","#8B5CF6"];
function colorFrom(name) {
  let sum = 0; for (let c of (name||"")) sum += c.charCodeAt(0);
  return COLORS[sum % COLORS.length];
}
function initials(name) {
  if (!name) return "?";
  return name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
}

export default function CallHistory({ user, onClose, onCall }) {
  const [calls, setCalls] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const callsRef = ref(db, `callHistory/${user.uid}`);
    onValue(callsRef, (snap) => {
      const data = snap.val() || {};
      const arr = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);
      setCalls(arr);
    });
  }, [user.uid]);

  const filtered = calls.filter(c => {
    if (filter === "missed") return c.status === "missed";
    if (filter === "incoming") return c.direction === "incoming";
    if (filter === "outgoing") return c.direction === "outgoing";
    return true;
  });

  function getIcon(call) {
    if (call.status === "missed") return "📵";
    if (call.direction === "incoming") return call.type === "video" ? "📹" : "📞";
    return call.type === "video" ? "🎥" : "📲";
  }

  function getColor(call) {
    if (call.status === "missed") return "#ef4444";
    if (call.direction === "incoming") return "#25D366";
    return "#34B7F1";
  }

  function getLabel(call) {
    if (call.status === "missed") return "Missed";
    if (call.direction === "incoming") return "Incoming";
    return "Outgoing";
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"#111b21", zIndex:9999, display:"flex", flexDirection:"column", fontFamily:"'Segoe UI',sans-serif", color:"#e9edef" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", padding:"12px 16px", background:"#202c33", gap:12 }}>
        <span onClick={onClose} style={{ fontSize:22, cursor:"pointer", color:"#8696a0" }}>←</span>
        <div style={{ fontWeight:700, fontSize:18, flex:1 }}>Call History</div>
        <span style={{ fontSize:14, color:"#8696a0" }}>{calls.length} calls</span>
      </div>

      {/* Filter Tabs */}
      <div style={{ display:"flex", background:"#202c33", padding:"0 16px", gap:4, borderBottom:"1px solid #1f2c33" }}>
        {["all","missed","incoming","outgoing"].map(f => (
          <div key={f} onClick={() => setFilter(f)}
            style={{ padding:"10px 14px", cursor:"pointer", fontSize:13, fontWeight:600, color: filter===f ? "#25D366" : "#8696a0", borderBottom: filter===f ? "2px solid #25D366" : "2px solid transparent", textTransform:"capitalize" }}>
            {f === "all" ? "All" : f === "missed" ? "📵 Missed" : f === "incoming" ? "📞 Incoming" : "📲 Outgoing"}
          </div>
        ))}
      </div>

      {/* Call List */}
      <div style={{ flex:1, overflowY:"auto" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign:"center", marginTop:80, color:"#8696a0" }}>
            <div style={{ fontSize:60, marginBottom:16 }}>📋</div>
            <div style={{ fontSize:16, fontWeight:600, marginBottom:8 }}>No calls yet</div>
            <div style={{ fontSize:13 }}>Your call history will appear here</div>
          </div>
        ) : filtered.map((call, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", padding:"12px 16px", gap:12, borderBottom:"1px solid #1a2530" }}>
            {/* Avatar */}
            <div style={{ width:50, height:50, borderRadius:"50%", background:colorFrom(call.name), display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:16, color:"#fff", flexShrink:0 }}>
              {initials(call.name)}
            </div>

            {/* Info */}
            <div style={{ flex:1, overflow:"hidden" }}>
              <div style={{ fontWeight:700, fontSize:15, marginBottom:3 }}>{call.name}</div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:14 }}>{getIcon(call)}</span>
                <span style={{ fontSize:13, color:getColor(call), fontWeight:600 }}>{getLabel(call)}</span>
                <span style={{ fontSize:12, color:"#8696a0" }}>· {call.type === "video" ? "Video" : "Audio"}</span>
              </div>
              <div style={{ fontSize:12, color:"#8696a0", marginTop:2 }}>{formatTime(call.timestamp)}</div>
            </div>

            {/* Duration & Call Back */}
            <div style={{ textAlign:"right", display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
              {call.status !== "missed" && call.duration > 0 && (
                <div style={{ fontSize:12, color:"#8696a0" }}>⏱️ {formatDuration(call.duration)}</div>
              )}
              <div style={{ display:"flex", gap:8 }}>
                <span onClick={() => onCall(call.contactEmail, "audio")} style={{ width:34, height:34, borderRadius:"50%", background:"#25D366", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:16 }}>📞</span>
                <span onClick={() => onCall(call.contactEmail, "video")} style={{ width:34, height:34, borderRadius:"50%", background:"#128C7E", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:16 }}>📹</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function saveCallToHistory(uid, callData) {
  push(ref(db, `callHistory/${uid}`), {
    ...callData,
    timestamp: Date.now(),
  });
}
