import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || ""; // 예: '' 또는 'http://localhost:8000'

function useLocalStorage(key, initial) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); return s!=null? JSON.parse(s): initial; }
    catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {console.error(e)} }, [key, v]);
  return [v, setV];
}

function fmtTime(ts){
  if(!ts) return ""; const d=new Date(ts);
  if(Number.isNaN(d.getTime())) return ts;
  const yyyy=d.getFullYear(), mm=String(d.getMonth()+1).padStart(2,"0"),
        dd=String(d.getDate()).padStart(2,"0"), hh=String(d.getHours()).padStart(2,"0"),
        mi=String(d.getMinutes()).padStart(2,"0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}
function sameDay(ts, now=new Date()){ const d=new Date(ts);
  return d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth() && d.getDate()===now.getDate(); }

export default function AdminPage(){
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [token, setToken] = useLocalStorage("admin_token", "");
  const [search, setSearch] = useLocalStorage("admin_search", "");
  const [auto, setAuto] = useLocalStorage("admin_auto", 10);      // 0/5/10/30
  const [hideVisited, setHideVisited] = useLocalStorage("admin_hideVisited", true);
  const [onlyToday, setOnlyToday] = useLocalStorage("admin_onlyToday", false);

  const timerRef = useRef(null);

  const headers = useMemo(() => {
    const h = {};
    if (token && token.trim()) h["X-Admin-Token"] = token.trim();
    return h;
  }, [token]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`${API_BASE}/api/waiting/list`, { headers });
      if (!r.ok) throw new Error(`/api/waiting/list -> ${r.status}`);
      const data = await r.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }, [headers]);
  

  async function act(kind, phone){
    try{
      const r = await fetch(`${API_BASE}/api/waiting/${encodeURIComponent(phone)}/${kind}`, {
        method:"PATCH", headers
      });
      if(!r.ok) throw new Error(`${kind} ${r.status}`);
      refresh();
    }catch(e){ console.error(e); alert(`${kind} failed: ${e?.message||e}`); }
  }

  useEffect(()=>{ refresh(); }, [refresh]);
  useEffect(()=>{
    if(timerRef.current){ clearInterval(timerRef.current); timerRef.current=null; }
    const sec = Number(auto)||0;
    if(sec>0){ timerRef.current=setInterval(refresh, sec*1000); return ()=>clearInterval(timerRef.current); }
  }, [auto, refresh]);

  const filtered = useMemo(()=>{
    let out = rows.slice();
    if(hideVisited) out = out.filter(r=>!r.visited);
    if(onlyToday)  out = out.filter(r=>sameDay(r.ts));
    const q=(search||"").toLowerCase().trim();
    if(q) out = out.filter(r => (r.name||"").toLowerCase().includes(q) || (r.phone||"").toLowerCase().includes(q));
    return out;
  }, [rows, hideVisited, onlyToday, search]);

  return (
    <div className="min-h-dvh bg-gray-50 text-gray-900 p-4">
      <header className="max-w-5xl mx-auto mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={refresh} disabled={loading}
            className="px-3 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-100">
            {loading? "Loading..." : "Refresh"}
          </button>

          <label className="text-sm flex items-center gap-2">
            Auto
            <select className="px-2 py-1 rounded-lg border border-gray-300 bg-white"
              value={auto} onChange={e=>setAuto(Number(e.target.value))}>
              <option value={0}>Off</option><option value={5}>5s</option>
              <option value={10}>10s</option><option value={30}>30s</option>
            </select>
          </label>

          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" className="scale-110" checked={hideVisited}
              onChange={e=>setHideVisited(e.target.checked)} /> Hide visited
          </label>

          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" className="scale-110" checked={onlyToday}
              onChange={e=>setOnlyToday(e.target.checked)} /> Today only
          </label>

          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search name/phone"
            className="px-3 py-2 rounded-xl border border-gray-300 bg-white min-w-[220px]" />
        </div>

        <input value={token} onChange={e=>setToken(e.target.value)}
          placeholder="X-Admin-Token (optional)"
          className="px-3 py-2 rounded-xl border border-gray-300 bg-white min-w-[260px]" />
      </header>

      <main className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-separate [border-spacing:0]">
            <thead className="bg-gray-100 text-left text-sm">
              <tr>
                <th className="px-4 py-3 border-b">#</th>
                <th className="px-4 py-3 border-b">Name</th>
                <th className="px-4 py-3 border-b">Phone</th>
                <th className="px-4 py-3 border-b">Adults/Children</th>
                <th className="px-4 py-3 border-b">Created</th>
                <th className="px-4 py-3 border-b">Called</th>
                <th className="px-4 py-3 border-b">Visited</th>
                <th className="px-4 py-3 border-b">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {error && <tr><td colSpan={8} className="px-4 py-4 text-red-600">{error}</td></tr>}
              {!error && filtered.length===0 &&
                <tr><td colSpan={8} className="px-4 py-6 text-gray-500">{loading? "Loading..." : "No data"}</td></tr>}
              {!error && filtered.map((r, i)=>(
                <tr key={`${r.phone}-${r.ts}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border-t">{i+1}</td>
                  <td className="px-4 py-3 border-t">{r.name}</td>
                  <td className="px-4 py-3 border-t font-mono">{r.phone}</td>
                  <td className="px-4 py-3 border-t">{r.adults}/{r.children}</td>
                  <td className="px-4 py-3 border-t whitespace-nowrap">{fmtTime(r.ts)}</td>
                  <td className="px-4 py-3 border-t">
                    <span className={r.called ? "inline-block px-2 py-1 rounded-full text-xs bg-emerald-600 text-white"
                                               : "inline-block px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"}>{r.called ? "Yes":"No"}</span>
                  </td>
                  <td className="px-4 py-3 border-t">
                    <span className={r.visited? "inline-block px-2 py-1 rounded-full text-xs bg-emerald-600 text-white"
                                               : "inline-block px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"}>{r.visited? "Yes":"No"}</span>
                  </td>
                  <td className="px-4 py-3 border-t">
                    <div className="flex gap-2">
                      <button onClick={()=>act("call", r.phone)} disabled={r.called}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-100">Call</button>
                      <button onClick={()=>act("visit", r.phone)} disabled={r.visited}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-100">Visit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
