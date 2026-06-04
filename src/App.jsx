import { useState, useEffect, useReducer } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────
const GROUPS = {
  A: ["México","Sudáfrica","Corea del Sur","Rep. Checa"],
  B: ["Canadá","Bosnia y Herz.","Qatar","Suiza"],
  C: ["Brasil","Marruecos","Haití","Escocia"],
  D: ["EE.UU.","Paraguay","Australia","Turquía"],
  E: ["Alemania","Curazao","Costa de Marfil","Ecuador"],
  F: ["Países Bajos","Japón","Suecia","Túnez"],
  G: ["Bélgica","Egipto","Irán","Nueva Zelanda"],
  H: ["España","Cabo Verde","Arabia Saudí","Uruguay"],
  I: ["Francia","Senegal","Irak","Noruega"],
  J: ["Argentina","Argelia","Austria","Jordania"],
  K: ["Portugal","RD Congo","Uzbekistán","Colombia"],
  L: ["Inglaterra","Croacia","Ghana","Panamá"],
};
const ALL_TEAMS = Object.values(GROUPS).flat();
const FLAG = {"México":"🇲🇽","Sudáfrica":"🇿🇦","Corea del Sur":"🇰🇷","Rep. Checa":"🇨🇿","Canadá":"🇨🇦","Bosnia y Herz.":"🇧🇦","Qatar":"🇶🇦","Suiza":"🇨🇭","Brasil":"🇧🇷","Marruecos":"🇲🇦","Haití":"🇭🇹","Escocia":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","EE.UU.":"🇺🇸","Paraguay":"🇵🇾","Australia":"🇦🇺","Turquía":"🇹🇷","Alemania":"🇩🇪","Curazao":"🇨🇼","Costa de Marfil":"🇨🇮","Ecuador":"🇪🇨","Países Bajos":"🇳🇱","Japón":"🇯🇵","Suecia":"🇸🇪","Túnez":"🇹🇳","Bélgica":"🇧🇪","Egipto":"🇪🇬","Irán":"🇮🇷","Nueva Zelanda":"🇳🇿","España":"🇪🇸","Cabo Verde":"🇨🇻","Arabia Saudí":"🇸🇦","Uruguay":"🇺🇾","Francia":"🇫🇷","Senegal":"🇸🇳","Irak":"🇮🇶","Noruega":"🇳🇴","Argentina":"🇦🇷","Argelia":"🇩🇿","Austria":"🇦🇹","Jordania":"🇯🇴","Portugal":"🇵🇹","RD Congo":"🇨🇩","Uzbekistán":"🇺🇿","Colombia":"🇨🇴","Inglaterra":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Croacia":"🇭🇷","Ghana":"🇬🇭","Panamá":"🇵🇦"};
const tf = t => (FLAG[t]||"🏳️")+" "+t;

const R32 = [
  {id:"P73",a:{pos:2,g:"A"},b:{pos:2,g:"B"}},
  {id:"P74",a:{pos:1,g:"E"},b:{pos:3,pool:["A","B","C","D","F"]}},
  {id:"P75",a:{pos:1,g:"F"},b:{pos:2,g:"C"}},
  {id:"P76",a:{pos:1,g:"D"},b:{pos:2,g:"F"}},
  {id:"P77",a:{pos:1,g:"I"},b:{pos:3,pool:["C","D","F","G","H"]}},
  {id:"P78",a:{pos:2,g:"E"},b:{pos:2,g:"I"}},
  {id:"P79",a:{pos:1,g:"A"},b:{pos:3,pool:["C","E","F","H","I"]}},
  {id:"P80",a:{pos:1,g:"L"},b:{pos:3,pool:["E","H","I","J","K"]}},
  {id:"P81",a:{pos:1,g:"D"},b:{pos:3,pool:["B","E","F","I","J"]}},
  {id:"P82",a:{pos:1,g:"G"},b:{pos:3,pool:["A","E","H","I","J"]}},
  {id:"P83",a:{pos:2,g:"K"},b:{pos:2,g:"L"}},
  {id:"P84",a:{pos:1,g:"H"},b:{pos:2,g:"J"}},
  {id:"P85",a:{pos:1,g:"B"},b:{pos:3,pool:["E","F","G","I","J"]}},
  {id:"P86",a:{pos:1,g:"J"},b:{pos:2,g:"H"}},
  {id:"P87",a:{pos:1,g:"K"},b:{pos:3,pool:["D","E","I","J","L"]}},
  {id:"P88",a:{pos:2,g:"D"},b:{pos:2,g:"G"}},
];
const R16_PAIRS = [[89,[74,77]],[90,[73,75]],[91,[76,78]],[92,[79,80]],[93,[83,84]],[94,[81,82]],[95,[86,88]],[96,[85,87]]];
const QF_PAIRS  = [[97,[89,90]],[98,[93,94]],[99,[91,92]],[100,[95,96]]];
const SF_PAIRS  = [[101,[97,98]],[102,[99,100]]];
const FINAL_ID  = 103;
const ROUNDS    = ["16avos","Octavos","Cuartos","Semis","Final"];
const PTS       = {groupExact:3,groupPass:1,third:2,r32:4,r16:6,qf:8,sf:10,final:12,champion:15};
const ROUND_PTS = {};
R32.forEach(m=>{ ROUND_PTS[m.id]=PTS.r32; });
R16_PAIRS.forEach(([id])=>{ ROUND_PTS[`P${id}`]=PTS.r16; });
QF_PAIRS.forEach(([id])=>{  ROUND_PTS[`P${id}`]=PTS.qf; });
SF_PAIRS.forEach(([id])=>{  ROUND_PTS[`P${id}`]=PTS.sf; });
ROUND_PTS[`P${FINAL_ID}`]=PTS.final;

// ─── API HELPERS ─────────────────────────────────────────────────────────────
async function apiGet(path) {
  const r = await fetch(`/api/${path}`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function apiPost(path, body) {
  const r = await fetch(`/api/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [store, setStore] = useState({ users: {}, results: { groups: {}, bracket: {} } });
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState("home");
  const [activeUser, setActiveUser] = useState(null);

  const fetchStore = async () => {
    try { const d = await apiGet("store"); setStore(d); }
    catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStore(); }, []);

  const saveUser = async (name, pred) => {
    await apiPost("store", { action: "saveUser", name, pred });
    await fetchStore();
  };
  const deleteUser = async (name) => {
    await apiPost("store", { action: "deleteUser", name });
    await fetchStore();
  };
  const saveResultGroup = async (g, order) => {
    await apiPost("store", { action: "setResultGroup", g, order });
    await fetchStore();
  };
  const saveResultMatch = async (id, winner) => {
    await apiPost("store", { action: "setResultMatch", id, winner });
    await fetchStore();
  };

  const go = (s, user = null) => { setScreen(s); if (user !== undefined) setActiveUser(user); };

  if (loading) return (
    <div style={{...S.page, justifyContent:"center"}}>
      <div style={{fontSize:48}}>⚽</div>
      <p style={{color:"#94a3b8",marginTop:12}}>Cargando porra...</p>
    </div>
  );

  if (screen==="ranking") return <RankingScreen store={store} onBack={()=>go("home")} />;
  if (screen==="admin")   return <AdminScreen store={store} saveResultGroup={saveResultGroup} saveResultMatch={saveResultMatch} deleteUser={deleteUser} onBack={()=>go("home")} />;
  if (screen==="predict") return <PredictScreen user={activeUser} store={store} saveUser={saveUser} onBack={()=>go("home",null)} onDone={()=>go("ranking",null)} />;

  return <HomeScreen store={store} onEnter={name=>go("predict",name)} onRanking={()=>go("ranking")} onAdmin={()=>go("admin")} />;
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomeScreen({ store, onEnter, onRanking, onAdmin }) {
  const [name, setName] = useState("");
  const count = Object.keys(store.users).length;
  return (
    <div style={S.page}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{fontSize:60}}>🏆</div>
        <h1 style={S.title}>Porra Mundial 2026</h1>
        <p style={{color:"#94a3b8",margin:"4px 0"}}>Estados Unidos · México · Canadá</p>
        <p style={{color:"#64748b",fontSize:13}}>11 Jun – 19 Jul 2026</p>
        {count>0 && <p style={{color:"#22c55e",fontSize:13,marginTop:8}}>👥 {count} participante{count!==1?"s":""} registrado{count!==1?"s":""}</p>}
      </div>
      <div style={S.card}>
        <p style={{fontWeight:600,color:"#e2e8f0",marginTop:0}}>¿Cuál es tu nombre?</p>
        <input style={S.input} placeholder="Tu nombre..." value={name}
          onChange={e=>setName(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&name.trim()&&onEnter(name.trim())} />
        <Btn onClick={()=>name.trim()&&onEnter(name.trim())}>Entrar a mi porra →</Btn>
      </div>
      <div style={{display:"flex",gap:10,marginTop:4}}>
        <Btn secondary onClick={onRanking}>🏅 Clasificación</Btn>
        <Btn secondary onClick={onAdmin}>⚙️ Admin</Btn>
      </div>
    </div>
  );
}

// ─── PREDICT ─────────────────────────────────────────────────────────────────
function PredictScreen({ user, store, saveUser, onBack, onDone }) {
  const existing = store.users[user];
  const [step, setStep] = useState(0);
  const [grps, setGrps]    = useState(existing?.groups  || Object.fromEntries(Object.entries(GROUPS).map(([k,v])=>[k,[...v]])));
  const [thirds, setThirds] = useState(existing?.thirds || []);
  const [bracket, setBracket] = useState(existing?.bracket || {});
  const [saving, setSaving] = useState(false);

  const myThirds = Object.entries(grps).map(([g,arr])=>({team:arr[2],group:g}));
  const resolveSlot = slot => {
    if (!slot) return null;
    if (slot.pos===3) { const m=thirds.find(t=>{const e=myThirds.find(x=>x.team===t); return e&&slot.pool?.includes(e.group);}); return m||null; }
    return grps[slot.g]?.[slot.pos-1]||null;
  };
  const getTeams = m => ({ a: resolveSlot(m.a), b: resolveSlot(m.b) });

  const doSave = async (done=false) => {
    setSaving(true);
    await saveUser(user, { groups:grps, thirds, bracket, done });
    setSaving(false);
  };

  if (step===0) return (
    <div style={S.page}>
      <TopBar title={`Grupos — ${user}`} onBack={onBack} />
      <p style={{color:"#94a3b8",fontSize:13,textAlign:"center",marginBottom:16}}>Ordena cada grupo según tu predicción (1º arriba)</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,width:"100%",maxWidth:620}}>
        {Object.entries(grps).map(([g,teams])=>(
          <GroupEditor key={g} letter={g} teams={teams} onChange={t=>setGrps(p=>({...p,[g]:t}))} />
        ))}
      </div>
      <Btn onClick={async()=>{await doSave();setStep(1);}} style={{marginTop:20,maxWidth:400}} disabled={saving}>
        {saving?"Guardando...":"Siguiente: mejores terceros →"}
      </Btn>
    </div>
  );

  if (step===1) return (
    <div style={S.page}>
      <TopBar title="Mejores Terceros" onBack={()=>setStep(0)} />
      <p style={{fontWeight:600,color:"#e2e8f0",marginBottom:4}}>Elige los 8 terceros que crees que pasarán</p>
      <p style={{color:"#94a3b8",fontSize:13,marginBottom:16}}>Son los equipos que quedan 3º en tu predicción de cada grupo</p>
      <div style={{display:"flex",flexDirection:"column",gap:6,width:"100%",maxWidth:380}}>
        {myThirds.map(({team,group})=>{
          const sel=thirds.includes(team);
          return (
            <button key={team} onClick={()=>{ if(sel) setThirds(p=>p.filter(t=>t!==team)); else if(thirds.length<8) setThirds(p=>[...p,team]); }}
              style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:9,
                background:sel?"#1d4ed8":"#1e293b",border:"2px solid "+(sel?"#3b82f6":"#334155"),
                color:"#e2e8f0",fontSize:13,cursor:"pointer",textAlign:"left"}}>
              <span style={{fontSize:11,color:sel?"#93c5fd":"#64748b",minWidth:52}}>Grupo {group}</span>
              <span style={{flex:1}}>{tf(team)}</span>
              {sel&&<span style={{color:"#60a5fa",fontSize:12}}>✓ {thirds.indexOf(team)+1}º</span>}
            </button>
          );
        })}
      </div>
      <p style={{color:thirds.length===8?"#22c55e":"#f59e0b",fontWeight:600,marginTop:10}}>{thirds.length}/8 seleccionados</p>
      <Btn onClick={async()=>{await doSave();setStep(2);}} disabled={thirds.length!==8||saving} style={{maxWidth:380}}>
        {saving?"Guardando...":"Siguiente: rellenar bracket →"}
      </Btn>
    </div>
  );

  if (step===2) return (
    <BracketEditor resolveSlot={resolveSlot} getTeams={getTeams}
      bracket={bracket} setBracket={setBracket}
      onBack={()=>setStep(1)}
      onDone={async()=>{await doSave(true);setStep(3);}}
      saving={saving}
    />
  );

  const champion = bracket[`P${FINAL_ID}`];
  return (
    <div style={S.page}>
      <TopBar title="Tu Porra" onBack={onBack} />
      <div style={{...S.card,textAlign:"center",maxWidth:380}}>
        <div style={{fontSize:48}}>✅</div>
        <h2 style={{color:"#22c55e",margin:"8px 0"}}>¡Porra guardada!</h2>
        <p style={{color:"#94a3b8",margin:0}}>{user}, tu predicción está lista.</p>
        {champion&&<p style={{fontSize:22,margin:"12px 0 0"}}>{FLAG[champion]||"🏆"} <strong style={{color:"#fbbf24"}}>{champion}</strong></p>}
      </div>
      <div style={{display:"flex",gap:10,marginTop:10}}>
        <Btn secondary onClick={()=>setStep(0)}>✏️ Editar</Btn>
        <Btn onClick={onDone}>Ver clasificación</Btn>
      </div>
    </div>
  );
}

// ─── GROUP EDITOR ─────────────────────────────────────────────────────────────
function GroupEditor({ letter, teams, onChange }) {
  const move=(i,d)=>{const t=[...teams],j=i+d;if(j<0||j>=t.length)return;[t[i],t[j]]=[t[j],t[i]];onChange(t);};
  const pc=["#fbbf24","#94a3b8","#64748b","#475569"];
  return (
    <div style={{background:"#1e293b",borderRadius:10,padding:10,border:"1px solid #334155"}}>
      <div style={{fontWeight:700,color:"#60a5fa",marginBottom:8,fontSize:13}}>Grupo {letter}</div>
      {teams.map((team,i)=>(
        <div key={team} style={{display:"flex",alignItems:"center",gap:5,marginBottom:5}}>
          <span style={{fontSize:11,color:pc[i],width:14,textAlign:"right",fontWeight:700}}>{i+1}º</span>
          <span style={{flex:1,fontSize:12,color:"#e2e8f0"}}>{tf(team)}</span>
          <button style={S.arrow} onClick={()=>move(i,-1)} disabled={i===0}>↑</button>
          <button style={S.arrow} onClick={()=>move(i,1)} disabled={i===teams.length-1}>↓</button>
        </div>
      ))}
    </div>
  );
}

// ─── BRACKET EDITOR ───────────────────────────────────────────────────────────
function BracketEditor({ resolveSlot, getTeams, bracket, setBracket, onBack, onDone, saving }) {
  const [rnd, setRnd] = useState(0);
  const pick=(id,team)=>{ if(team) setBracket(p=>({...p,[id]:team})); };

  const buildMatches=()=>{
    if(rnd===0) return R32.map(m=>({id:m.id,...getTeams(m)}));
    const pairs=[R16_PAIRS,QF_PAIRS,SF_PAIRS,[[FINAL_ID,[SF_PAIRS[0][0],SF_PAIRS[1][0]]]]];
    return pairs[rnd-1].map(([id,[p1,p2]])=>({id:`P${id}`,a:bracket[`P${p1}`]||null,b:bracket[`P${p2}`]||null}));
  };

  const matches=buildMatches();
  const complete=matches.every(m=>bracket[m.id]);

  return (
    <div style={S.page}>
      <TopBar title={`Bracket — ${ROUNDS[rnd]}`} onBack={rnd===0?onBack:()=>setRnd(r=>r-1)} />
      <div style={{display:"flex",gap:5,marginBottom:16,flexWrap:"wrap",justifyContent:"center"}}>
        {ROUNDS.map((r,i)=>(
          <span key={r} style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,
            background:i===rnd?"#1d4ed8":i<rnd?"#065f46":"#1e293b",
            color:i<=rnd?"#fff":"#64748b",border:"1px solid "+(i===rnd?"#3b82f6":i<rnd?"#10b981":"#334155")}}>
            {r}
          </span>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8,width:"100%",maxWidth:400}}>
        {matches.map(m=>(
          <div key={m.id} style={{background:"#1e293b",borderRadius:10,padding:10,border:"1px solid #334155"}}>
            <p style={{color:"#475569",fontSize:10,margin:"0 0 6px"}}>{m.id}</p>
            <div style={{display:"flex",gap:6}}>
              {[m.a,m.b].map((t,si)=>(
                <button key={si} disabled={!t} onClick={()=>pick(m.id,t)}
                  style={{flex:1,padding:"9px 6px",borderRadius:8,fontSize:12,fontWeight:bracket[m.id]===t?700:400,
                    border:"2px solid "+(bracket[m.id]===t?"#3b82f6":"#334155"),
                    background:bracket[m.id]===t?"#1d4ed8":"#0f172a",
                    color:t?"#e2e8f0":"#475569",cursor:t?"pointer":"default"}}>
                  {t?tf(t):<span style={{fontSize:11,color:"#334155"}}>Por definir</span>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {!complete&&<p style={{color:"#f59e0b",fontSize:12,marginTop:8}}>Selecciona todos los ganadores para continuar</p>}
      <Btn onClick={rnd===4?onDone:()=>setRnd(r=>r+1)} disabled={!complete||saving} style={{marginTop:12,maxWidth:400}}>
        {saving?"Guardando...":(rnd===4?"Guardar porra ✅":`Siguiente: ${ROUNDS[rnd+1]} →`)}
      </Btn>
    </div>
  );
}

// ─── RANKING ─────────────────────────────────────────────────────────────────
function RankingScreen({ store, onBack }) {
  const scores=Object.entries(store.users).map(([name,pred])=>({name,pts:calcPoints(pred,store.results),done:pred.done})).sort((a,b)=>b.pts-a.pts);
  return (
    <div style={S.page}>
      <TopBar title="🏅 Clasificación" onBack={onBack} />
      {scores.length===0
        ? <div style={{...S.card,textAlign:"center",color:"#64748b"}}>Aún no hay participantes</div>
        : <div style={{width:"100%",maxWidth:480}}>
            {scores.map((s,i)=>(
              <div key={s.name} style={{...S.card,display:"flex",alignItems:"center",gap:12,marginBottom:8,
                background:i===0?"#1e3a5f":i===1?"#1c2e1c":i===2?"#2d1e0a":"#1e293b",
                border:"1px solid "+(i===0?"#3b82f6":i===1?"#22c55e":i===2?"#f59e0b":"#334155")}}>
                <span style={{fontSize:22}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}.`}</span>
                <div style={{flex:1}}>
                  <p style={{fontWeight:700,color:"#e2e8f0",margin:0}}>{s.name}</p>
                  <p style={{color:"#64748b",fontSize:11,margin:0}}>{s.done?"Porra completa":"En progreso"}</p>
                </div>
                <span style={{fontSize:22,fontWeight:700,color:"#fbbf24"}}>{s.pts}</span>
                <span style={{color:"#64748b",fontSize:12}}>pts</span>
              </div>
            ))}
          </div>
      }
      <div style={{...S.card,marginTop:12,maxWidth:480}}>
        <p style={{fontWeight:600,color:"#60a5fa",marginTop:0,marginBottom:10}}>Sistema de puntos</p>
        {[["Posición exacta en grupo","3 pts"],["Clasificado (orden erróneo)","1 pt"],["Mejor tercero acertado","2 pts"],
          ["Llega a 16avos","4 pts"],["Llega a Octavos","6 pts"],["Llega a Cuartos","8 pts"],
          ["Llega a Semis","10 pts"],["Llega a Final","12 pts"],["Campeón","15 pts"]
        ].map(([k,v])=>(
          <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#94a3b8",padding:"4px 0",borderBottom:"1px solid #1e293b"}}>
            <span>{k}</span><span style={{color:"#fbbf24",fontWeight:600}}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────
function AdminScreen({ store, saveResultGroup, saveResultMatch, deleteUser, onBack }) {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [tab, setTab]   = useState("users");
  const [saving, setSaving] = useState(false);

  if (!auth) return (
    <div style={S.page}>
      <TopBar title="⚙️ Administrador" onBack={onBack} />
      <div style={{...S.card,maxWidth:360}}>
        <p style={{fontWeight:600,color:"#e2e8f0",marginTop:0}}>Contraseña de administrador</p>
        <input type="password" style={S.input} placeholder="Contraseña..." value={pass}
          onChange={e=>setPass(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&(pass==="admin2026"?setAuth(true):alert("Contraseña incorrecta"))} />
        <Btn onClick={()=>pass==="admin2026"?setAuth(true):alert("Contraseña incorrecta")}>Entrar</Btn>
        <p style={{color:"#475569",fontSize:12,marginBottom:0}}>Contraseña: <code>admin2026</code></p>
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <TopBar title="⚙️ Resultados Reales" onBack={onBack} />
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        {["users","groups","bracket"].map(t=>(
          <Btn key={t} secondary onClick={()=>setTab(t)} style={{background:tab===t?"#1d4ed8":"#1e293b",color:"#e2e8f0"}}>
            {t==="users"?"👥 Participantes":t==="groups"?"📊 Grupos":"🏆 Eliminatoria"}
          </Btn>
        ))}
      </div>

      {tab==="users"&&(
        <div style={{width:"100%",maxWidth:480}}>
          <p style={{color:"#94a3b8",fontSize:13,marginBottom:12}}>{Object.keys(store.users).length} participante{Object.keys(store.users).length!==1?"s":""}</p>
          {Object.keys(store.users).length===0
            ? <div style={{...S.card,textAlign:"center",color:"#64748b"}}>No hay participantes aún</div>
            : Object.entries(store.users).map(([name,pred])=>(
              <div key={name} style={{...S.card,display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                <div style={{flex:1}}>
                  <p style={{fontWeight:700,color:"#e2e8f0",margin:0}}>{name}</p>
                  <p style={{color:"#64748b",fontSize:11,margin:"2px 0 0"}}>{pred.done?"Porra completa":"En progreso"}</p>
                </div>
                <button onClick={async()=>{
                  if(window.confirm(`¿Borrar la porra de ${name}?`)){
                    setSaving(true); await deleteUser(name); setSaving(false);
                  }
                }} disabled={saving} style={{padding:"7px 14px",borderRadius:8,background:"#7f1d1d",border:"1px solid #ef4444",color:"#fca5a5",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                  🗑️ Borrar
                </button>
              </div>
            ))
          }
        </div>
      )}

      {tab==="groups"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,width:"100%",maxWidth:620}}>
          {Object.entries(GROUPS).map(([g,teams])=>{
            const cur=store.results.groups[g]||[...teams];
            const move=async(i,d)=>{
              const t=[...cur],j=i+d; if(j<0||j>=t.length)return; [t[i],t[j]]=[t[j],t[i]];
              setSaving(true); await saveResultGroup(g,t); setSaving(false);
            };
            return (
              <div key={g} style={{background:"#1e293b",borderRadius:10,padding:10,border:"1px solid #f59e0b33"}}>
                <div style={{fontWeight:700,color:"#f59e0b",marginBottom:8,fontSize:13}}>Grupo {g} — Real</div>
                {cur.map((team,i)=>(
                  <div key={team} style={{display:"flex",alignItems:"center",gap:5,marginBottom:5}}>
                    <span style={{fontSize:11,color:"#f59e0b",width:14,textAlign:"right"}}>{i+1}º</span>
                    <span style={{flex:1,fontSize:12,color:"#e2e8f0"}}>{tf(team)}</span>
                    <button style={S.arrow} onClick={()=>move(i,-1)} disabled={i===0||saving}>↑</button>
                    <button style={S.arrow} onClick={()=>move(i,1)} disabled={i===cur.length-1||saving}>↓</button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {tab==="bracket"&&(
        <div style={{width:"100%",maxWidth:420}}>
          <p style={{color:"#94a3b8",fontSize:13,marginBottom:12}}>Selecciona el ganador real de cada partido</p>
          {[...R32.map(m=>m.id),...R16_PAIRS.map(([id])=>`P${id}`),...QF_PAIRS.map(([id])=>`P${id}`),...SF_PAIRS.map(([id])=>`P${id}`),`P${FINAL_ID}`].map((pid,idx)=>{
            const round=idx<16?"16avos":idx<24?"Octavos":idx<28?"Cuartos":idx<30?"Semis":"Final";
            return (
              <div key={pid} style={{background:"#1e293b",borderRadius:8,padding:10,marginBottom:6,border:"1px solid #334155"}}>
                <p style={{color:"#475569",fontSize:10,margin:"0 0 5px"}}>{round} · {pid}</p>
                <select style={{...S.input,marginBottom:0,padding:"8px 10px"}} value={store.results.bracket[pid]||""}
                  onChange={async e=>{ setSaving(true); await saveResultMatch(pid,e.target.value); setSaving(false); }}>
                  <option value="">-- Ganador --</option>
                  {ALL_TEAMS.map(t=><option key={t} value={t}>{tf(t)}</option>)}
                </select>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── POINTS ───────────────────────────────────────────────────────────────────
function calcPoints(pred, results) {
  if (!pred?.groups) return 0;
  let pts=0;
  Object.entries(results.groups||{}).forEach(([g,real])=>{
    const my=pred.groups[g]||[];
    real.forEach((team,i)=>{ const p=my.indexOf(team); if(p===i) pts+=PTS.groupExact; else if(p<=1&&i<=1) pts+=PTS.groupPass; });
  });
  const realEight=Object.entries(results.groups||{}).map(([,arr])=>arr[2]).filter(Boolean).slice(0,8);
  (pred.thirds||[]).forEach(t=>{ if(realEight.includes(t)) pts+=PTS.third; });
  Object.entries(pred.bracket||{}).forEach(([mid,team])=>{
    if(results.bracket?.[mid]===team){ pts+=ROUND_PTS[mid]||0; if(mid===`P${FINAL_ID}`) pts+=PTS.champion-PTS.final; }
  });
  return pts;
}

// ─── SHARED ───────────────────────────────────────────────────────────────────
function TopBar({ title, onBack }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,width:"100%",maxWidth:640}}>
      <button onClick={onBack} style={{background:"#1e293b",border:"1px solid #334155",color:"#94a3b8",borderRadius:8,padding:"7px 14px",cursor:"pointer",fontSize:14,flexShrink:0}}>
        ← Volver
      </button>
      <h2 style={{margin:0,color:"#e2e8f0",fontSize:17,fontWeight:700}}>{title}</h2>
    </div>
  );
}
function Btn({ children, onClick, secondary, disabled, style }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{width:"100%",padding:"11px 16px",borderRadius:10,fontWeight:700,fontSize:14,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.4:1,
        background:secondary?"#1e293b":"linear-gradient(135deg,#1d4ed8,#7c3aed)",color:secondary?"#94a3b8":"#fff",
        border:secondary?"1px solid #334155":"none",...style}}>
      {children}
    </button>
  );
}
const S={
  page:{minHeight:"100vh",background:"#0f172a",display:"flex",flexDirection:"column",alignItems:"center",padding:"20px 16px",fontFamily:"system-ui,sans-serif",color:"#e2e8f0"},
  title:{margin:"8px 0 4px",fontSize:28,fontWeight:800,background:"linear-gradient(135deg,#60a5fa,#a78bfa)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"},
  card:{background:"#1e293b",borderRadius:14,padding:18,width:"100%",border:"1px solid #334155",marginBottom:8},
  input:{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #334155",background:"#0f172a",color:"#e2e8f0",fontSize:14,marginBottom:12,boxSizing:"border-box",outline:"none"},
  arrow:{background:"#0f172a",border:"1px solid #334155",color:"#94a3b8",borderRadius:6,width:22,height:22,cursor:"pointer",fontSize:11,padding:0,display:"flex",alignItems:"center",justifyContent:"center"},
};
