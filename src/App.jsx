import { useState, useEffect } from "react";

// ─── DATOS ───────────────────────────────────────────────────────────────────
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

// Partidos de fase de grupos: [local, visitante, jornada]
const GROUP_MATCHES = {
  A:[["México","Sudáfrica",1],["Corea del Sur","Rep. Checa",1],["Rep. Checa","Sudáfrica",2],["México","Corea del Sur",2],["Rep. Checa","México",3],["Sudáfrica","Corea del Sur",3]],
  B:[["Canadá","Bosnia y Herz.",1],["Qatar","Suiza",1],["Suiza","Bosnia y Herz.",2],["Canadá","Qatar",2],["Suiza","Canadá",3],["Bosnia y Herz.","Qatar",3]],
  C:[["Brasil","Marruecos",1],["Haití","Escocia",1],["Escocia","Marruecos",2],["Brasil","Haití",2],["Escocia","Brasil",3],["Marruecos","Haití",3]],
  D:[["EE.UU.","Paraguay",1],["Australia","Turquía",1],["EE.UU.","Australia",2],["Turquía","Paraguay",2],["Turquía","EE.UU.",3],["Paraguay","Australia",3]],
  E:[["Alemania","Costa de Marfil",1],["Ecuador","Curazao",1],["Alemania","Ecuador",2],["Costa de Marfil","Curazao",2],["Costa de Marfil","Alemania",3],["Curazao","Ecuador",3]],
  F:[["Países Bajos","Suecia",1],["Japón","Túnez",1],["Países Bajos","Japón",2],["Suecia","Túnez",2],["Suecia","Países Bajos",3],["Túnez","Japón",3]],
  G:[["Bélgica","Irán",1],["Egipto","Nueva Zelanda",1],["Bélgica","Egipto",2],["Irán","Nueva Zelanda",2],["Irán","Bélgica",3],["Nueva Zelanda","Egipto",3]],
  H:[["España","Arabia Saudí",1],["Cabo Verde","Uruguay",1],["España","Cabo Verde",2],["Arabia Saudí","Uruguay",2],["Arabia Saudí","España",3],["Uruguay","Cabo Verde",3]],
  I:[["Francia","Senegal",1],["Irak","Noruega",1],["Francia","Irak",2],["Senegal","Noruega",2],["Senegal","Francia",3],["Noruega","Irak",3]],
  J:[["Argentina","Argelia",1],["Austria","Jordania",1],["Argentina","Austria",2],["Argelia","Jordania",2],["Argelia","Argentina",3],["Jordania","Austria",3]],
  K:[["Portugal","Uzbekistán",1],["RD Congo","Colombia",1],["Portugal","RD Congo",2],["Uzbekistán","Colombia",2],["Uzbekistán","Portugal",3],["Colombia","RD Congo",3]],
  L:[["Inglaterra","Panamá",1],["Croacia","Ghana",1],["Inglaterra","Croacia",2],["Ghana","Panamá",2],["Ghana","Inglaterra",3],["Panamá","Croacia",3]],
};

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
const THIRD_ID  = 104;
const ALL_ELIM  = [...R32.map(m=>m.id),...R16_PAIRS.map(([id])=>`P${id}`),...QF_PAIRS.map(([id])=>`P${id}`),...SF_PAIRS.map(([id])=>`P${id}`),`P${FINAL_ID}`,`P${THIRD_ID}`];
const ROUNDS    = ["16avos","Octavos","Cuartos","Semis","Final"];

const FLAG = {"México":"🇲🇽","Sudáfrica":"🇿🇦","Corea del Sur":"🇰🇷","Rep. Checa":"🇨🇿","Canadá":"🇨🇦","Bosnia y Herz.":"🇧🇦","Qatar":"🇶🇦","Suiza":"🇨🇭","Brasil":"🇧🇷","Marruecos":"🇲🇦","Haití":"🇭🇹","Escocia":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","EE.UU.":"🇺🇸","Paraguay":"🇵🇾","Australia":"🇦🇺","Turquía":"🇹🇷","Alemania":"🇩🇪","Curazao":"🇨🇼","Costa de Marfil":"🇨🇮","Ecuador":"🇪🇨","Países Bajos":"🇳🇱","Japón":"🇯🇵","Suecia":"🇸🇪","Túnez":"🇹🇳","Bélgica":"🇧🇪","Egipto":"🇪🇬","Irán":"🇮🇷","Nueva Zelanda":"🇳🇿","España":"🇪🇸","Cabo Verde":"🇨🇻","Arabia Saudí":"🇸🇦","Uruguay":"🇺🇾","Francia":"🇫🇷","Senegal":"🇸🇳","Irak":"🇮🇶","Noruega":"🇳🇴","Argentina":"🇦🇷","Argelia":"🇩🇿","Austria":"🇦🇹","Jordania":"🇯🇴","Portugal":"🇵🇹","RD Congo":"🇨🇩","Uzbekistán":"🇺🇿","Colombia":"🇨🇴","Inglaterra":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Croacia":"🇭🇷","Ghana":"🇬🇭","Panamá":"🇵🇦"};
const tf = t => (FLAG[t]||"🏳️")+" "+t;
const ALL_TEAMS = Object.values(GROUPS).flat();

const FECHA_CIERRE = new Date("2026-06-11T17:00:00Z");
const porraAbierta = () => new Date() < FECHA_CIERRE;

// ─── PUNTUACIÓN POR DEFECTO ──────────────────────────────────────────────────
const DEFAULT_PTS = {
  // Fase de grupos - partidos
  g_signo: 0, g_dif: 0, g_exacto: 0, g_ajuste: 0,
  // Fase de grupos - posiciones
  pos1: 0, pos2: 0, pos3: 0, pos4: 0,
  // Clasificados
  clasif16: 0, clasif8: 0, clasif4: 0, clasifsemi: 0, clasiffinal34: 0, clasiffinal: 0,
  // 16avos - partidos
  r32_signo: 0, r32_dif: 0, r32_exacto: 0,
  // Octavos - partidos
  r16_signo: 0, r16_dif: 0, r16_exacto: 0,
  // Cuartos - partidos
  qf_signo: 0, qf_dif: 0, qf_exacto: 0,
  // Semis - partidos
  sf_signo: 0, sf_dif: 0, sf_exacto: 0,
  // 3er y 4º puesto - partido
  td_signo: 0, td_dif: 0, td_exacto: 0,
  // Final - partido
  f_signo: 0, f_dif: 0, f_exacto: 0,
  // Cuadro de honor
  campeon: 0, subcampeon: 0, tercero: 0,
  // Bota de Oro / Plata / Bronce
  bota_oro: 0, bota_plata: 0, bota_bronce: 0,
  // Balón de Oro / Plata / Bronce
  balon_oro: 0, balon_plata: 0, balon_bronce: 0,
};

// ─── UTILIDADES DE GRUPOS ────────────────────────────────────────────────────
function calcStandings(scores) {
  // scores: { "México-Sudáfrica": {h:2,a:1}, ... }
  const teams = {};
  Object.values(GROUPS).flat().forEach(t => { teams[t] = {pts:0,j:0,g:0,e:0,p:0,gf:0,gc:0,dg:0}; });
  Object.entries(scores).forEach(([key, sc]) => {
    if (sc.h==null||sc.a==null||sc.h===""||sc.a==="") return;
    const [home, away] = key.split("§");
    const h=parseInt(sc.h), a=parseInt(sc.a);
    if(isNaN(h)||isNaN(a)) return;
    teams[home].j++; teams[away].j++;
    teams[home].gf+=h; teams[home].gc+=a; teams[home].dg+=(h-a);
    teams[away].gf+=a; teams[away].gc+=h; teams[away].dg+=(a-h);
    if(h>a){ teams[home].pts+=3; teams[home].g++; teams[away].p++; }
    else if(h<a){ teams[away].pts+=3; teams[away].g++; teams[home].p++; }
    else { teams[home].pts+=1; teams[away].pts+=1; teams[home].e++; teams[away].e++; }
  });
  return teams;
}

function sortGroup(groupLetter, standings) {
  return [...GROUPS[groupLetter]].sort((a,b)=>{
    const ta=standings[a]||{pts:0,dg:0,gf:0};
    const tb=standings[b]||{pts:0,dg:0,gf:0};
    if(tb.pts!==ta.pts) return tb.pts-ta.pts;
    if(tb.dg!==ta.dg) return tb.dg-ta.dg;
    return tb.gf-ta.gf;
  });
}

// ─── API ─────────────────────────────────────────────────────────────────────
async function apiGet(p){ const r=await fetch(`/api/${p}`); if(!r.ok) throw new Error(); return r.json(); }
async function apiPost(p,b){ const r=await fetch(`/api/${p}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)}); if(!r.ok) throw new Error(); return r.json(); }

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [store, setStore] = useState({users:{},results:{groups:{},groupStandings:{},bracket:{},pts:DEFAULT_PTS,bonus:{}}});
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState("home");
  const [activeUser, setActiveUser] = useState(null);

  const fetchStore = async()=>{ try{const d=await apiGet("store");setStore(d);}catch(e){console.error(e);}finally{setLoading(false);} };
  useEffect(()=>{fetchStore();},[]);

  const saveUser = async(name,pred)=>{ await apiPost("store",{action:"saveUser",name,pred}); await fetchStore(); };
  const deleteUser = async(name)=>{ await apiPost("store",{action:"deleteUser",name}); await fetchStore(); };
  const saveResults = async(results)=>{ await apiPost("store",{action:"saveResults",results}); await fetchStore(); };

  const go=(s,user=null)=>{setScreen(s); if(user!==undefined) setActiveUser(user);};

  if(loading) return <div style={{...S.page,justifyContent:"center"}}><div style={{fontSize:48}}>⚽</div><p style={{color:"#94a3b8"}}>Cargando...</p></div>;
  if(screen==="ranking") return <RankingScreen store={store} onBack={()=>go("home")} />;
  if(screen==="admin")   return <AdminScreen store={store} saveResults={saveResults} deleteUser={deleteUser} onBack={()=>go("home")} />;
  if(screen==="predict") return <PredictScreen user={activeUser} store={store} saveUser={saveUser} onBack={()=>go("home",null)} onDone={()=>go("ranking",null)} />;
  return <HomeScreen store={store} onEnter={n=>go("predict",n)} onRanking={()=>go("ranking")} onAdmin={()=>go("admin")} />;
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomeScreen({store,onEnter,onRanking,onAdmin}){
  const [name,setName]=useState("");
  const count=Object.keys(store.users).length;
  const abierta=porraAbierta();
  return(
    <div style={S.page}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontSize:56}}>🏆</div>
        <h1 style={S.title}>Porra Mundial 2026</h1>
        <p style={{color:"#94a3b8",margin:"4px 0"}}>USA · México · Canadá</p>
        <p style={{color:"#64748b",fontSize:13}}>11 Jun – 19 Jul 2026</p>
        {count>0&&<p style={{color:"#22c55e",fontSize:13,marginTop:8}}>👥 {count} participante{count!==1?"s":""}</p>}
      </div>
      <div style={S.card}>
        {abierta?(
          <>
            <p style={{fontWeight:600,color:"#e2e8f0",marginTop:0}}>¿Cuál es tu nombre?</p>
            <input style={S.input} placeholder="Tu nombre..." value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&name.trim()&&onEnter(name.trim())}/>
            <Btn onClick={()=>name.trim()&&onEnter(name.trim())}>Entrar a mi porra →</Btn>
          </>
        ):(
          <>
            <p style={{fontWeight:600,color:"#e2e8f0",marginTop:0}}>¿Cuál es tu nombre?</p>
            <input style={S.input} placeholder="Tu nombre..." value={name} onChange={e=>setName(e.target.value)}/>
            <div style={{background:"#7f1d1d",border:"1px solid #ef4444",borderRadius:10,padding:"12px",textAlign:"center"}}>
              <p style={{color:"#fca5a5",fontWeight:700,margin:0}}>🔒 Porra cerrada</p>
              <p style={{color:"#f87171",fontSize:13,margin:"4px 0 0"}}>Plazo terminado el 11 de junio a las 19:00h</p>
            </div>
          </>
        )}
      </div>
      <div style={{display:"flex",gap:10,marginTop:4}}>
        <Btn secondary onClick={onRanking}>🏅 Clasificación</Btn>
        <Btn secondary onClick={onAdmin}>⚙️ Admin</Btn>
      </div>
    </div>
  );
}

// ─── PREDICT SCREEN ───────────────────────────────────────────────────────────
function PredictScreen({user,store,saveUser,onBack,onDone}){
  const existing=store.users[user];
  const [step,setStep]=useState(0); // 0=grupos, 1=terceros, 2=eliminatoria, 3=honor, 4=done
  const [scores,setScores]=useState(existing?.scores||{});
  const [thirds,setThirds]=useState(existing?.thirds||[]);
  const [bracket,setBracket]=useState(existing?.bracket||{});
  const [honor,setHonor]=useState(existing?.honor||{camp:"",sub:"",ter:"",cuar:""});
  const [saving,setSaving]=useState(false);

  const standings=calcStandings(scores);
  const sortedGroups=Object.fromEntries(Object.keys(GROUPS).map(g=>[g,sortGroup(g,standings)]));
  const myThirds=Object.entries(sortedGroups).map(([g,arr])=>({team:arr[2],group:g}));

  const resolveSlot=(slot)=>{
    if(!slot) return null;
    if(slot.pos===3){
      const m=thirds.find(t=>{const e=myThirds.find(x=>x.team===t); return e&&slot.pool?.includes(e.group);});
      return m||null;
    }
    return sortedGroups[slot.g]?.[slot.pos-1]||null;
  };
  const getTeams=m=>({a:resolveSlot(m.a),b:resolveSlot(m.b)});

  const doSave=async(done=false)=>{
    if(!porraAbierta()){alert("La porra está cerrada.");return false;}
    setSaving(true);
    await saveUser(user,{scores,thirds,bracket,honor,done});
    setSaving(false);
    return true;
  };

  if(step===0) return <GroupsStep user={user} scores={scores} setScores={setScores} sortedGroups={sortedGroups} standings={standings} onBack={onBack} onNext={async()=>{const ok=await doSave();if(ok)setStep(1);}} saving={saving}/>;
  if(step===1) return <ThirdsStep myThirds={myThirds} thirds={thirds} setThirds={setThirds} onBack={()=>setStep(0)} onNext={async()=>{const ok=await doSave();if(ok)setStep(2);}} saving={saving}/>;
  if(step===2) return <EliminatoriaStep sortedGroups={sortedGroups} thirds={thirds} myThirds={myThirds} resolveSlot={resolveSlot} getTeams={getTeams} bracket={bracket} setBracket={setBracket} onBack={()=>setStep(1)} onNext={async()=>{const ok=await doSave();if(ok)setStep(3);}} saving={saving}/>;
  if(step===3) return <HonorStep honor={honor} setHonor={setHonor} onBack={()=>setStep(2)} onDone={async()=>{const ok=await doSave(true);if(ok)setStep(4);}} saving={saving}/>;

  return(
    <div style={S.page}>
      <TopBar title="Tu Porra" onBack={onBack}/>
      <div style={{...S.card,textAlign:"center",maxWidth:380}}>
        <div style={{fontSize:48}}>✅</div>
        <h2 style={{color:"#22c55e",margin:"8px 0"}}>¡Porra guardada!</h2>
        <p style={{color:"#94a3b8",margin:0}}>{user}, tu predicción está lista.</p>
        {honor.camp&&<p style={{fontSize:20,margin:"12px 0 0"}}>{FLAG[honor.camp]||"🏆"} <strong style={{color:"#fbbf24"}}>{honor.camp}</strong></p>}
      </div>
      <div style={{display:"flex",gap:10,marginTop:10}}>
        {porraAbierta()&&<Btn secondary onClick={()=>setStep(0)}>✏️ Editar</Btn>}
        <Btn onClick={onDone}>Ver clasificación</Btn>
      </div>
    </div>
  );
}

// ─── PASO 0: GRUPOS ───────────────────────────────────────────────────────────
function GroupsStep({user,scores,setScores,sortedGroups,standings,onBack,onNext,saving}){
  const [activeGroup,setActiveGroup]=useState("A");
  const setScore=(key,side,val)=>setScores(p=>({...p,[key]:{...(p[key]||{}), [side]:val}}));

  return(
    <div style={S.page}>
      <TopBar title={`Grupos — ${user}`} onBack={onBack}/>
      <p style={{color:"#94a3b8",fontSize:12,textAlign:"center",marginBottom:12}}>Introduce el marcador que predices para cada partido</p>
      {/* Selector de grupo */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center",marginBottom:16}}>
        {"ABCDEFGHIJKL".split("").map(g=>(
          <button key={g} onClick={()=>setActiveGroup(g)}
            style={{padding:"6px 12px",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer",border:"2px solid "+(activeGroup===g?"#3b82f6":"#334155"),background:activeGroup===g?"#1d4ed8":"#1e293b",color:"#e2e8f0"}}>
            {g}
          </button>
        ))}
      </div>
      {/* Vista del grupo activo */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,width:"100%",maxWidth:700}}>
        {/* Partidos */}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div style={{fontWeight:700,color:"#60a5fa",fontSize:13,marginBottom:4}}>Grupo {activeGroup} — Partidos</div>
          {[1,2,3].map(j=>(
            <div key={j}>
              <div style={{color:"#475569",fontSize:10,marginBottom:4}}>Jornada {j}</div>
              {GROUP_MATCHES[activeGroup].filter(m=>m[2]===j).map(([home,away])=>{
                const key=`${home}§${away}`;
                const sc=scores[key]||{};
                return(
                  <div key={key} style={{background:"#1e293b",borderRadius:8,padding:"8px 10px",marginBottom:6,border:"1px solid #334155",display:"flex",alignItems:"center",gap:6}}>
                    <span style={{flex:1,fontSize:11,color:"#e2e8f0",textAlign:"right"}}>{tf(home)}</span>
                    <input type="number" min="0" max="20" value={sc.h??""} onChange={e=>setScore(key,"h",e.target.value)}
                      style={{...S.scoreInput}}/>
                    <span style={{color:"#64748b",fontSize:12}}>-</span>
                    <input type="number" min="0" max="20" value={sc.a??""} onChange={e=>setScore(key,"a",e.target.value)}
                      style={{...S.scoreInput}}/>
                    <span style={{flex:1,fontSize:11,color:"#e2e8f0"}}>{tf(away)}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {/* Clasificación */}
        <div>
          <div style={{fontWeight:700,color:"#60a5fa",fontSize:13,marginBottom:4}}>Clasificación</div>
          <div style={{background:"#1e293b",borderRadius:8,border:"1px solid #334155",overflow:"hidden"}}>
            <div style={{display:"grid",gridTemplateColumns:"20px 1fr 28px 24px 24px 24px 28px",gap:2,padding:"6px 8px",background:"#0f172a",fontSize:10,color:"#64748b",fontWeight:700}}>
              <span>Pos</span><span>Equipo</span><span>Pts</span><span>J</span><span>GF</span><span>GC</span><span>DG</span>
            </div>
            {sortedGroups[activeGroup]?.map((team,i)=>{
              const st=standings[team]||{pts:0,j:0,gf:0,gc:0,dg:0};
              const colors=["#fbbf24","#94a3b8","#64748b","#475569"];
              const bg=i<2?"#1a2a3a":i===2?"#1a2a1a":"#1e293b";
              return(
                <div key={team} style={{display:"grid",gridTemplateColumns:"20px 1fr 28px 24px 24px 24px 28px",gap:2,padding:"6px 8px",background:bg,borderTop:"1px solid #334155",fontSize:11,alignItems:"center"}}>
                  <span style={{color:colors[i],fontWeight:700}}>{i+1}</span>
                  <span style={{color:"#e2e8f0",fontSize:10}}>{tf(team)}</span>
                  <span style={{color:"#fbbf24",fontWeight:700,textAlign:"center"}}>{st.pts}</span>
                  <span style={{color:"#94a3b8",textAlign:"center"}}>{st.j}</span>
                  <span style={{color:"#94a3b8",textAlign:"center"}}>{st.gf}</span>
                  <span style={{color:"#94a3b8",textAlign:"center"}}>{st.gc}</span>
                  <span style={{color:st.dg>0?"#22c55e":st.dg<0?"#ef4444":"#94a3b8",textAlign:"center"}}>{st.dg>0?"+":""}{st.dg}</span>
                </div>
              );
            })}
          </div>
          <div style={{marginTop:8,fontSize:10,color:"#475569"}}>
            <span style={{background:"#1a2a3a",padding:"2px 6px",borderRadius:4,marginRight:6}}>Azul = clasifica directo</span>
            <span style={{background:"#1a2a1a",padding:"2px 6px",borderRadius:4}}>Verde = posible 3º</span>
          </div>
        </div>
      </div>
      <Btn onClick={onNext} style={{marginTop:20,maxWidth:400}} disabled={saving}>
        {saving?"Guardando...":"Siguiente: mejores terceros →"}
      </Btn>
    </div>
  );
}

// ─── PASO 1: TERCEROS ─────────────────────────────────────────────────────────
function ThirdsStep({myThirds,thirds,setThirds,onBack,onNext,saving}){
  return(
    <div style={S.page}>
      <TopBar title="Mejores Terceros" onBack={onBack}/>
      <p style={{fontWeight:600,color:"#e2e8f0",marginBottom:4}}>Elige los 8 terceros que crees que pasarán</p>
      <p style={{color:"#94a3b8",fontSize:13,marginBottom:16}}>Son los 3º de tu clasificación predicha</p>
      <div style={{display:"flex",flexDirection:"column",gap:6,width:"100%",maxWidth:380}}>
        {myThirds.map(({team,group})=>{
          const sel=thirds.includes(team);
          return(
            <button key={team} onClick={()=>{ if(sel) setThirds(p=>p.filter(t=>t!==team)); else if(thirds.length<8) setThirds(p=>[...p,team]); }}
              style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:9,background:sel?"#1d4ed8":"#1e293b",border:"2px solid "+(sel?"#3b82f6":"#334155"),color:"#e2e8f0",fontSize:13,cursor:"pointer"}}>
              <span style={{fontSize:11,color:sel?"#93c5fd":"#64748b",minWidth:52}}>Grupo {group}</span>
              <span style={{flex:1}}>{tf(team)}</span>
              {sel&&<span style={{color:"#60a5fa",fontSize:12}}>✓ {thirds.indexOf(team)+1}º</span>}
            </button>
          );
        })}
      </div>
      <p style={{color:thirds.length===8?"#22c55e":"#f59e0b",fontWeight:600,marginTop:10}}>{thirds.length}/8 seleccionados</p>
      <Btn onClick={onNext} disabled={thirds.length!==8||saving} style={{maxWidth:380}}>
        {saving?"Guardando...":"Siguiente: fase eliminatoria →"}
      </Btn>
    </div>
  );
}

// ─── PASO 2: ELIMINATORIA ─────────────────────────────────────────────────────
function EliminatoriaStep({sortedGroups,thirds,myThirds,resolveSlot,getTeams,bracket,setBracket,onBack,onNext,saving}){
  const [rnd,setRnd]=useState(0);
  const pick=(id,team)=>{ if(team) setBracket(p=>({...p,[id]:team})); };

  const buildMatches=()=>{
    if(rnd===0) return R32.map(m=>({id:m.id,...getTeams(m)}));
    const pairs=[R16_PAIRS,QF_PAIRS,SF_PAIRS,[[FINAL_ID,[SF_PAIRS[0][0],SF_PAIRS[1][0]]]]];
    return pairs[rnd-1].map(([id,[p1,p2]])=>({id:`P${id}`,a:bracket[`P${p1}`]||null,b:bracket[`P${p2}`]||null}));
  };
  const matches=buildMatches();
  const complete=matches.every(m=>bracket[m.id]);

  return(
    <div style={S.page}>
      <TopBar title={`Bracket — ${ROUNDS[rnd]}`} onBack={rnd===0?onBack:()=>setRnd(r=>r-1)}/>
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
      <Btn onClick={rnd===4?onNext:()=>setRnd(r=>r+1)} disabled={(!complete&&rnd<4)||saving} style={{marginTop:12,maxWidth:400}}>
        {saving?"Guardando...":(rnd===4?"Siguiente: cuadro de honor →":`Siguiente: ${ROUNDS[rnd+1]} →`)}
      </Btn>
    </div>
  );
}

// ─── PASO 3: CUADRO DE HONOR ──────────────────────────────────────────────────
function HonorStep({honor,setHonor,onBack,onDone,saving}){
  const set=(k,v)=>setHonor(p=>({...p,[k]:v}));
  const items=[
    {key:"camp",label:"🥇 Campeón"},
    {key:"sub",label:"🥈 Subcampeón"},
    {key:"ter",label:"🥉 3er puesto"},
    {key:"cuar",label:"4️⃣ 4º puesto"},
  ];
  return(
    <div style={S.page}>
      <TopBar title="Cuadro de Honor" onBack={onBack}/>
      <p style={{color:"#94a3b8",fontSize:13,marginBottom:16}}>¿Quién acabará en cada posición?</p>
      <div style={{display:"flex",flexDirection:"column",gap:12,width:"100%",maxWidth:380}}>
        {items.map(({key,label})=>(
          <div key={key} style={S.card}>
            <p style={{fontWeight:600,color:"#e2e8f0",marginTop:0,marginBottom:8}}>{label}</p>
            <select style={{...S.input,marginBottom:0}} value={honor[key]||""} onChange={e=>set(key,e.target.value)}>
              <option value="">-- Seleccionar --</option>
              {ALL_TEAMS.map(t=><option key={t} value={t}>{tf(t)}</option>)}
            </select>
          </div>
        ))}
      </div>
      <Btn onClick={onDone} disabled={saving} style={{marginTop:16,maxWidth:380}}>
        {saving?"Guardando...":"💾 Guardar porra ✅"}
      </Btn>
    </div>
  );
}

// ─── RANKING ─────────────────────────────────────────────────────────────────
function RankingScreen({store,onBack}){
  const pts=store.results?.pts||DEFAULT_PTS;
  const scores=Object.entries(store.users)
    .map(([name,pred])=>({name,pts:calcPoints(pred,store.results,pts),done:pred.done}))
    .sort((a,b)=>b.pts-a.pts);
  return(
    <div style={S.page}>
      <TopBar title="🏅 Clasificación" onBack={onBack}/>
      {scores.length===0
        ?<div style={{...S.card,textAlign:"center",color:"#64748b"}}>Aún no hay participantes</div>
        :<div style={{width:"100%",maxWidth:480}}>
          {scores.map((s,i)=>(
            <div key={s.name} style={{...S.card,display:"flex",alignItems:"center",gap:12,marginBottom:8,
              background:i===0?"#1e3a5f":i===1?"#1c2e1c":i===2?"#2d1e0a":"#1e293b",
              border:"1px solid "+(i===0?"#3b82f6":i===1?"#22c55e":i===2?"#f59e0b":"#334155")}}>
              <span style={{fontSize:22}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}.`}</span>
              <div style={{flex:1}}>
                <p style={{fontWeight:700,color:"#e2e8f0",margin:0}}>{s.name}</p>
                <p style={{color:"#64748b",fontSize:11,margin:0}}>{s.done?"Completa":"En progreso"}</p>
              </div>
              <span style={{fontSize:22,fontWeight:700,color:"#fbbf24"}}>{s.pts}</span>
              <span style={{color:"#64748b",fontSize:12}}>pts</span>
            </div>
          ))}
        </div>
      }
      <PointsTable pts={pts}/>
    </div>
  );
}

function PointsTable({pts}){
  return(
    <div style={{...S.card,marginTop:12,maxWidth:480}}>
      <p style={{fontWeight:600,color:"#60a5fa",marginTop:0,marginBottom:10}}>Sistema de puntos</p>
      {[
        ["Signo 1X2 acertado",pts.signo+" pts"],
        ["Diferencia de goles (con signo)",pts.diferencia+" pts"],
        ["Resultado exacto",pts.exacto+" pts"],
        ["Ajuste desvío goles",pts.ajuste===0?"Sin ajuste":pts.ajuste+"%"],
        ["1º exacto en grupo",pts.pos1+" pts"],
        ["2º exacto en grupo",pts.pos2+" pts"],
        ["3º exacto en grupo",pts.pos3+" pts"],
        ["4º exacto en grupo",pts.pos4+" pts"],
        ["Clasificado a 16avos",pts.clasif16+" pts"],
        ["Ganador ronda elim. (base)",pts.elimWin+" pts × mult."],
        ["Campeón",pts.campeon+" pts"],
        ["Subcampeón",pts.subcampeon+" pts"],
        ["3er puesto",pts.tercero+" pts"],
        ["4º puesto",pts.cuarto+" pts"],
      ].map(([k,v])=>(
        <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#94a3b8",padding:"3px 0",borderBottom:"1px solid #1e293b"}}>
          <span>{k}</span><span style={{color:"#fbbf24",fontWeight:600}}>{v}</span>
        </div>
      ))}
    </div>
  );
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────
function AdminScreen({store,saveResults,deleteUser,onBack}){
  const [auth,setAuth]=useState(false);
  const [pass,setPass]=useState("");
  const [tab,setTab]=useState("groups");
  const [saving,setSaving]=useState(false);
  const [activeGroup,setActiveGroup]=useState("A");

  const initResults=()=>({
    groups: store.results?.groups||{},
    groupStandings: store.results?.groupStandings||{},
    bracket: store.results?.bracket||{},
    pts: store.results?.pts||DEFAULT_PTS,
    bonus: store.results?.bonus||{},
  });
  const [draft,setDraft]=useState(initResults);
  const [dirty,setDirty]=useState(false);

  const realStandings=calcStandings(draft.groups);
  const realSorted=Object.fromEntries(Object.keys(GROUPS).map(g=>[g,sortGroup(g,realStandings)]));

  const setScore=(key,side,val)=>{ setDraft(p=>({...p,groups:{...p.groups,[key]:{...(p.groups[key]||{}),[side]:val}}})); setDirty(true); };
  const setPts=(k,v)=>{ setDraft(p=>({...p,pts:{...p.pts,[k]:parseFloat(v)||0}})); setDirty(true); };
  const setBonus=(pid,v)=>{ setDraft(p=>({...p,bonus:{...p.bonus,[pid]:parseInt(v)||1}})); setDirty(true); };
  const setBracketWinner=(pid,v)=>{ setDraft(p=>({...p,bracket:{...p.bracket,[pid]:v}})); setDirty(true); };

  const guardar=async()=>{ setSaving(true); await saveResults({...draft,groupStandings:realSorted}); setDirty(false); setSaving(false); alert("✅ Guardado"); };
  const resetear=async()=>{
    if(!window.confirm("¿Resetear todo?")) return;
    const empty={groups:{},groupStandings:{},bracket:{},pts:DEFAULT_PTS,bonus:{}};
    setSaving(true); await saveResults(empty); setDraft(empty); setDirty(false); setSaving(false); alert("✅ Reseteado");
  };

  if(!auth) return(
    <div style={S.page}>
      <TopBar title="⚙️ Admin" onBack={onBack}/>
      <div style={{...S.card,maxWidth:360}}>
        <p style={{fontWeight:600,color:"#e2e8f0",marginTop:0}}>Contraseña</p>
        <input type="password" style={S.input} placeholder="Contraseña..." value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){if(pass==="admin2026")setAuth(true);else alert("Incorrecta");}}}/>
        <Btn onClick={()=>pass==="admin2026"?setAuth(true):alert("Incorrecta")}>Entrar</Btn>
      </div>
    </div>
  );

  return(
    <div style={S.page}>
      <TopBar title="⚙️ Resultados Reales" onBack={onBack}/>
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        {["groups","bracket","users","pts"].map(t=>(
          <Btn key={t} secondary onClick={()=>setTab(t)} style={{background:tab===t?"#1d4ed8":"#1e293b",color:"#e2e8f0",width:"auto",padding:"8px 14px"}}>
            {t==="groups"?"📊 Grupos":t==="bracket"?"🏆 Eliminatoria":t==="users"?"👥 Participantes":"⚙️ Puntos"}
          </Btn>
        ))}
      </div>

      {tab==="groups"&&(
        <div style={{width:"100%",maxWidth:700}}>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center",marginBottom:12}}>
            {"ABCDEFGHIJKL".split("").map(g=>(
              <button key={g} onClick={()=>setActiveGroup(g)}
                style={{padding:"5px 10px",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer",border:"2px solid "+(activeGroup===g?"#f59e0b":"#334155"),background:activeGroup===g?"#78350f":"#1e293b",color:"#e2e8f0"}}>
                {g}
              </button>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div>
              <div style={{fontWeight:700,color:"#f59e0b",fontSize:13,marginBottom:8}}>Grupo {activeGroup} — Resultados reales</div>
              {[1,2,3].map(j=>(
                <div key={j}>
                  <div style={{color:"#475569",fontSize:10,marginBottom:4}}>Jornada {j}</div>
                  {GROUP_MATCHES[activeGroup].filter(m=>m[2]===j).map(([home,away])=>{
                    const key=`${home}§${away}`;
                    const sc=draft.groups[key]||{};
                    const bon=draft.bonus[key]||1;
                    return(
                      <div key={key} style={{background:"#1e293b",borderRadius:8,padding:"8px 10px",marginBottom:6,border:"1px solid #334155"}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                          <span style={{flex:1,fontSize:11,color:"#e2e8f0",textAlign:"right"}}>{tf(home)}</span>
                          <input type="number" min="0" max="20" value={sc.h??""} onChange={e=>setScore(key,"h",e.target.value)} style={S.scoreInput}/>
                          <span style={{color:"#64748b",fontSize:12}}>-</span>
                          <input type="number" min="0" max="20" value={sc.a??""} onChange={e=>setScore(key,"a",e.target.value)} style={S.scoreInput}/>
                          <span style={{flex:1,fontSize:11,color:"#e2e8f0"}}>{tf(away)}</span>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"center"}}>
                          <span style={{fontSize:10,color:"#64748b"}}>Bonus:</span>
                          {[1,2,3].map(b=>(
                            <button key={b} onClick={()=>setBonus(key,b)}
                              style={{padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",border:"1px solid "+(bon===b?"#f59e0b":"#334155"),background:bon===b?"#78350f":"#0f172a",color:bon===b?"#fbbf24":"#64748b"}}>
                              x{b}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div>
              <div style={{fontWeight:700,color:"#f59e0b",fontSize:13,marginBottom:8}}>Clasificación real</div>
              <div style={{background:"#1e293b",borderRadius:8,border:"1px solid #334155",overflow:"hidden"}}>
                <div style={{display:"grid",gridTemplateColumns:"20px 1fr 28px 24px 24px 24px 28px",gap:2,padding:"6px 8px",background:"#0f172a",fontSize:10,color:"#64748b",fontWeight:700}}>
                  <span>Pos</span><span>Equipo</span><span>Pts</span><span>J</span><span>GF</span><span>GC</span><span>DG</span>
                </div>
                {realSorted[activeGroup]?.map((team,i)=>{
                  const st=realStandings[team]||{pts:0,j:0,gf:0,gc:0,dg:0};
                  const colors=["#fbbf24","#94a3b8","#64748b","#475569"];
                  const bg=i<2?"#1a2a3a":i===2?"#1a2a1a":"#1e293b";
                  return(
                    <div key={team} style={{display:"grid",gridTemplateColumns:"20px 1fr 28px 24px 24px 24px 28px",gap:2,padding:"6px 8px",background:bg,borderTop:"1px solid #334155",fontSize:11,alignItems:"center"}}>
                      <span style={{color:colors[i],fontWeight:700}}>{i+1}</span>
                      <span style={{color:"#e2e8f0",fontSize:10}}>{tf(team)}</span>
                      <span style={{color:"#fbbf24",fontWeight:700,textAlign:"center"}}>{st.pts}</span>
                      <span style={{color:"#94a3b8",textAlign:"center"}}>{st.j}</span>
                      <span style={{color:"#94a3b8",textAlign:"center"}}>{st.gf}</span>
                      <span style={{color:"#94a3b8",textAlign:"center"}}>{st.gc}</span>
                      <span style={{color:st.dg>0?"#22c55e":st.dg<0?"#ef4444":"#94a3b8",textAlign:"center"}}>{st.dg>0?"+":""}{st.dg}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab==="bracket"&&(
        <div style={{width:"100%",maxWidth:420}}>
          <p style={{color:"#94a3b8",fontSize:13,marginBottom:12}}>Ganador real de cada partido eliminatorio</p>
          {ALL_ELIM.map((pid,idx)=>{
            const round=idx<16?"16avos":idx<24?"Octavos":idx<28?"Cuartos":idx<30?"Semis":idx===30?"Final":"3er puesto";
            const bon=draft.bonus[pid]||1;
            return(
              <div key={pid} style={{background:"#1e293b",borderRadius:8,padding:10,marginBottom:6,border:"1px solid #334155"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <p style={{color:"#475569",fontSize:10,margin:0}}>{round} · {pid}</p>
                  <div style={{display:"flex",gap:4}}>
                    {[1,2,3].map(b=>(
                      <button key={b} onClick={()=>setBonus(pid,b)}
                        style={{padding:"2px 6px",borderRadius:4,fontSize:10,fontWeight:700,cursor:"pointer",border:"1px solid "+(bon===b?"#f59e0b":"#334155"),background:bon===b?"#78350f":"#0f172a",color:bon===b?"#fbbf24":"#64748b"}}>
                        x{b}
                      </button>
                    ))}
                  </div>
                </div>
                <select style={{...S.input,marginBottom:0,padding:"8px 10px"}} value={draft.bracket[pid]||""} onChange={e=>setBracketWinner(pid,e.target.value)}>
                  <option value="">-- Ganador --</option>
                  {ALL_TEAMS.map(t=><option key={t} value={t}>{tf(t)}</option>)}
                </select>
              </div>
            );
          })}
        </div>
      )}

      {tab==="users"&&(
        <div style={{width:"100%",maxWidth:480}}>
          <p style={{color:"#94a3b8",fontSize:13,marginBottom:12}}>{Object.keys(store.users).length} participante{Object.keys(store.users).length!==1?"s":""}</p>
          {Object.keys(store.users).length===0
            ?<div style={{...S.card,textAlign:"center",color:"#64748b"}}>No hay participantes</div>
            :Object.entries(store.users).map(([name,pred])=>(
              <div key={name} style={{...S.card,display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                <div style={{flex:1}}>
                  <p style={{fontWeight:700,color:"#e2e8f0",margin:0}}>{name}</p>
                  <p style={{color:"#64748b",fontSize:11,margin:"2px 0 0"}}>{pred.done?"Completa":"En progreso"}</p>
                </div>
                <button onClick={async()=>{ if(window.confirm(`¿Borrar porra de ${name}?`)){setSaving(true);await deleteUser(name);setSaving(false);}}} disabled={saving}
                  style={{padding:"7px 14px",borderRadius:8,background:"#7f1d1d",border:"1px solid #ef4444",color:"#fca5a5",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                  🗑️
                </button>
              </div>
            ))
          }
        </div>
      )}

      {tab==="pts"&&(
        <div style={{width:"100%",maxWidth:500}}>
          <p style={{color:"#94a3b8",fontSize:13,marginBottom:12}}>Pon a 0 los criterios que no quieras usar</p>
          {[
            {section:"📊 FASE DE GRUPOS — Partidos", items:[
              {k:"g_signo",label:"Signo 1X2 (local, empate, visitante)"},
              {k:"g_dif",label:"Diferencia/Distancia de goles (con 1X2)"},
              {k:"g_exacto",label:"Resultado exacto"},
              {k:"g_ajuste",label:"% Ajuste desvío goles (0 = sin ajuste)"},
            ]},
            {section:"📊 FASE DE GRUPOS — Posiciones", items:[
              {k:"pos1",label:"Posición exacta (1º)"},
              {k:"pos2",label:"Posición exacta (2º)"},
              {k:"pos3",label:"Posición exacta (3º)"},
              {k:"pos4",label:"Posición exacta (4º)"},
            ]},
            {section:"✅ CLASIFICADOS POR RONDA", items:[
              {k:"clasif16",label:"Equipo clasificado para DIECISEISAVOS"},
              {k:"clasif8",label:"Equipo clasificado para OCTAVOS"},
              {k:"clasif4",label:"Equipo clasificado para CUARTOS"},
              {k:"clasifsemi",label:"Equipo clasificado para SEMIFINALES"},
              {k:"clasiffinal34",label:"Equipo clasificado para 3º y 4º puesto"},
              {k:"clasiffinal",label:"Equipo clasificado para FINAL"},
            ]},
            {section:"⚡ DIECISEISAVOS — Partidos", items:[
              {k:"r32_signo",label:"Signo 1X2"},
              {k:"r32_dif",label:"Diferencia/Distancia de goles (con 1X2)"},
              {k:"r32_exacto",label:"Resultado exacto"},
            ]},
            {section:"⚡ OCTAVOS — Partidos", items:[
              {k:"r16_signo",label:"Signo 1X2"},
              {k:"r16_dif",label:"Diferencia/Distancia de goles (con 1X2)"},
              {k:"r16_exacto",label:"Resultado exacto"},
            ]},
            {section:"⚡ CUARTOS — Partidos", items:[
              {k:"qf_signo",label:"Signo 1X2"},
              {k:"qf_dif",label:"Diferencia/Distancia de goles (con 1X2)"},
              {k:"qf_exacto",label:"Resultado exacto"},
            ]},
            {section:"⚡ SEMIFINALES — Partidos", items:[
              {k:"sf_signo",label:"Signo 1X2"},
              {k:"sf_dif",label:"Diferencia/Distancia de goles (con 1X2)"},
              {k:"sf_exacto",label:"Resultado exacto"},
            ]},
            {section:"⚡ 3º y 4º PUESTO — Partido", items:[
              {k:"td_signo",label:"Signo 1X2"},
              {k:"td_dif",label:"Diferencia/Distancia de goles (con 1X2)"},
              {k:"td_exacto",label:"Resultado exacto"},
            ]},
            {section:"⚡ FINAL — Partido", items:[
              {k:"f_signo",label:"Signo 1X2"},
              {k:"f_dif",label:"Diferencia/Distancia de goles (con 1X2)"},
              {k:"f_exacto",label:"Resultado exacto"},
            ]},
            {section:"🏆 CUADRO DE HONOR", items:[
              {k:"campeon",label:"Campeón"},
              {k:"subcampeon",label:"Subcampeón"},
              {k:"tercero",label:"3º puesto"},
            ]},
            {section:"👟 BOTA DE ORO", items:[
              {k:"bota_oro",label:"Bota de Oro (máximo goleador)"},
              {k:"bota_plata",label:"Bota de Plata (2º máximo goleador)"},
              {k:"bota_bronce",label:"Bota de Bronce (3º máximo goleador)"},
            ]},
            {section:"⚽ BALÓN DE ORO", items:[
              {k:"balon_oro",label:"Balón de Oro (mejor jugador)"},
              {k:"balon_plata",label:"Balón de Plata (2º mejor jugador)"},
              {k:"balon_bronce",label:"Balón de Bronce (3º mejor jugador)"},
            ]},
          ].map(({section,items})=>(
            <div key={section} style={{marginBottom:16}}>
              <div style={{background:"#0f172a",borderRadius:8,padding:"6px 12px",marginBottom:6,fontSize:12,fontWeight:700,color:"#60a5fa",border:"1px solid #1e3a5f"}}>
                {section}
              </div>
              {items.map(({k,label})=>(
                <div key={k} style={{display:"flex",alignItems:"center",gap:10,marginBottom:6,background:"#1e293b",borderRadius:8,padding:"8px 12px",border:"1px solid #334155"}}>
                  <span style={{flex:1,fontSize:12,color:"#e2e8f0"}}>{label}</span>
                  <input type="number" min="0" step="0.5" value={draft.pts[k]??0} onChange={e=>setPts(k,e.target.value)}
                    style={{width:60,padding:"4px 8px",borderRadius:6,border:"1px solid #334155",background:"#0f172a",color:"#fbbf24",fontSize:13,fontWeight:700,textAlign:"center",outline:"none"}}/>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <SaveBar dirty={dirty} saving={saving} onSave={guardar} onReset={resetear}/>
    </div>
  );
}

// ─── CÁLCULO DE PUNTOS ────────────────────────────────────────────────────────
function calcPoints(pred, results, pts){
  if(!pred?.scores||!results) return 0;
  let total=0;
  const bonus=results.bonus||{};

  // Partidos de grupos
  Object.entries(results.groups||{}).forEach(([key,real])=>{
    const pred_sc=pred.scores[key];
    if(!pred_sc||pred_sc.h===""||pred_sc.a===""||real.h===""||real.a==="") return;
    const rh=parseInt(real.h),ra=parseInt(real.a);
    const ph=parseInt(pred_sc.h),pa=parseInt(pred_sc.a);
    if(isNaN(rh)||isNaN(ra)||isNaN(ph)||isNaN(pa)) return;
    const bon=bonus[key]||1;
    let matchPts=0;

    // Signo
    const rSign=rh>ra?"1":rh<ra?"2":"X";
    const pSign=ph>pa?"1":ph<pa?"2":"X";
    const signoOk=rSign===pSign;
    if(signoOk) matchPts+=pts.signo;

    // Diferencia
    if(signoOk){
      const rDif=Math.abs(rh-ra), pDif=Math.abs(ph-pa);
      if(rSign==="X"){
        // empate: desvío = diferencia de goles marcados
        const desv=Math.abs(Math.max(rh,ra)-Math.max(ph,pa));
        if(desv===0) matchPts+=pts.diferencia;
        else if(pts.ajuste>0) matchPts+=Math.max(0,pts.diferencia-(desv*(pts.ajuste/100)*pts.diferencia));
      } else {
        const desv=Math.abs(rDif-pDif);
        if(desv===0) matchPts+=pts.diferencia;
        else if(pts.ajuste>0) matchPts+=Math.max(0,pts.diferencia-(desv*(pts.ajuste/100)*pts.diferencia));
      }
    }

    // Exacto
    if(rh===ph&&ra===pa) matchPts+=pts.exacto;

    total+=matchPts*bon;
  });

  // Posiciones en grupos
  const realSorted=results.groupStandings||{};
  Object.entries(realSorted).forEach(([g,realOrder])=>{
    const predStandings=calcStandings(pred.scores);
    const predOrder=sortGroup(g,predStandings);
    realOrder.forEach((team,i)=>{
      const posPts=[pts.pos1,pts.pos2,pts.pos3,pts.pos4][i]||0;
      if(predOrder[i]===team) total+=posPts;
    });
  });

  // Clasificados a 16avos
  const realAll16=Object.values(realSorted).flatMap(arr=>arr.slice(0,2));
  // + mejores terceros reales (simplificado: terceros de cada grupo reales)
  const realThirds=Object.values(realSorted).map(arr=>arr[2]).filter(Boolean);
  // los usuarios eligieron sus 8 terceros
  const allClassif=[...realAll16,...realThirds.slice(0,8)];
  const predAll16=Object.entries(calcStandings(pred.scores)).length>0
    ?Object.keys(GROUPS).flatMap(g=>sortGroup(g,calcStandings(pred.scores)).slice(0,2))
    :[];
  const predClassif=[...predAll16,...(pred.thirds||[])];
  predClassif.forEach(t=>{ if(allClassif.includes(t)) total+=pts.clasif16; });

  // Rondas eliminatorias
  const roundMult={"P73":1,"P74":1,"P75":1,"P76":1,"P77":1,"P78":1,"P79":1,"P80":1,"P81":1,"P82":1,"P83":1,"P84":1,"P85":1,"P86":1,"P87":1,"P88":1};
  R16_PAIRS.forEach(([id])=>{ roundMult[`P${id}`]=1.5; });
  QF_PAIRS.forEach(([id])=>{ roundMult[`P${id}`]=2; });
  SF_PAIRS.forEach(([id])=>{ roundMult[`P${id}`]=2.5; });
  roundMult[`P${FINAL_ID}`]=3; roundMult[`P${THIRD_ID}`]=2;

  Object.entries(pred.bracket||{}).forEach(([mid,team])=>{
    const realW=results.bracket?.[mid];
    if(realW&&realW===team){
      const mult=roundMult[mid]||1;
      const bon=bonus[mid]||1;
      total+=pts.elimWin*mult*bon;
    }
  });

  // Cuadro de honor
  const rBracket=results.bracket||{};
  const realCamp=rBracket[`P${FINAL_ID}`];
  const realSub=rBracket[`P${FINAL_ID}_loser`]||""; // simplificado
  const h=pred.honor||{};
  if(realCamp&&h.camp===realCamp) total+=pts.campeon;

  return Math.round(total*10)/10;
}

// ─── COMPONENTES COMPARTIDOS ──────────────────────────────────────────────────
function SaveBar({dirty,saving,onSave,onReset}){
  return(
    <div style={{position:"sticky",bottom:16,display:"flex",gap:10,marginTop:16,width:"100%",maxWidth:700}}>
      <button onClick={onReset} disabled={saving} style={{padding:"11px 16px",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",background:"#7f1d1d",border:"1px solid #ef4444",color:"#fca5a5",flexShrink:0}}>
        🔄 Reset
      </button>
      <button onClick={onSave} disabled={!dirty||saving} style={{flex:1,padding:"11px 16px",borderRadius:10,fontWeight:700,fontSize:14,cursor:(!dirty||saving)?"not-allowed":"pointer",opacity:(!dirty||saving)?0.4:1,background:"linear-gradient(135deg,#065f46,#047857)",border:"none",color:"#fff"}}>
        {saving?"Guardando...":"💾 Guardar resultados"}
      </button>
    </div>
  );
}

function TopBar({title,onBack}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,width:"100%",maxWidth:700}}>
      <button onClick={onBack} style={{background:"#1e293b",border:"1px solid #334155",color:"#94a3b8",borderRadius:8,padding:"7px 14px",cursor:"pointer",fontSize:14,flexShrink:0}}>← Volver</button>
      <h2 style={{margin:0,color:"#e2e8f0",fontSize:17,fontWeight:700}}>{title}</h2>
    </div>
  );
}

function Btn({children,onClick,secondary,disabled,style}){
  return(
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
  scoreInput:{width:36,padding:"4px",borderRadius:6,border:"1px solid #334155",background:"#0f172a",color:"#fbbf24",fontSize:14,fontWeight:700,textAlign:"center",outline:"none"},
  arrow:{background:"#0f172a",border:"1px solid #334155",color:"#94a3b8",borderRadius:6,width:22,height:22,cursor:"pointer",fontSize:11,padding:0},
};
