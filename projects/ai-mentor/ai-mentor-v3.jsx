import { useState, useRef, useEffect } from "react";

// ── Design tokens (hardcoded for React artifact env) ─────────
const C = {
  bg0:     "#080811",   // deepest bg
  bg1:     "#0f0f1c",   // panel bg
  bg2:     "#141425",   // card bg
  bg3:     "#1a1a30",   // hover bg
  border:  "#232338",   // default border
  border2: "#2e2e4a",   // emphasis border

  text0:   "#e8e8f4",   // primary text
  text1:   "#9090b0",   // secondary text
  text2:   "#55556a",   // muted text

  purple:  "#a78bfa",   // accent purple
  purpleDim:"#2d1f5e",  // purple bg
  purpleMid:"#5b3fc4",  // purple mid

  green:   "#4ade80",   // success
  greenDim:"#0a2215",

  amber:   "#fbbf24",   // warning
  amberDim:"#2a1a00",

  blue:    "#60a5fa",   // info
  blueDim: "#0a1a35",

  red:     "#f87171",   // danger
  redDim:  "#2a0a0a",

  orange:  "#fb923c",   // exam countdown
  orangeDim:"#2a1000",
};

const TAG_C = {
  "Academy": { bg: C.amberDim, color: C.amber, border: "#4a3000" },
  "戦略":    { bg: C.blueDim,  color: C.blue,  border: "#0a2855" },
  "技術":    { bg: C.bg3,      color: C.text1, border: C.border2 },
  "G検定":   { bg: C.greenDim, color: C.green, border: "#0a3a1a" },
  "副業":    { bg: C.purpleDim,color: C.purple,border: "#3d2080" },
  "振り返り":{ bg: C.bg3,      color: C.text1, border: C.border2 },
  "その他":  { bg: C.bg3,      color: C.text1, border: C.border2 },
};

const CAT_C = {
  "G検定":  { bg: C.greenDim,  color: C.green  },
  "発信":   { bg: C.purpleDim, color: C.purple },
  "Academy":{ bg: C.amberDim,  color: C.amber  },
  "技術":   { bg: C.blueDim,   color: C.blue   },
  "MA":     { bg: C.redDim,    color: C.red    },
};

// ── Storage ──────────────────────────────────────────────────
const store = {
  async get(key) {
    try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; }
    catch { return null; }
  },
  async set(key, val) {
    try { await window.storage.set(key, JSON.stringify(val)); return true; }
    catch { return false; }
  },
};

// ── Seed context ──────────────────────────────────────────────
const SEED_CTX = [
  {
    id: "ctx_academy_roadmap",
    title: "Anthropic Academy 受講ロードマップ",
    source: "claude.ai チャット 2026-03-14",
    tag: "Academy",
    pinned: true,
    createdAt: "2026-03-14",
    content: `【現在地】Claude 101 ✅修了 / AI Fluency: Framework & Foundations 🔄進行中

【Skilljar コース推奨順】
① Claude 101（1h）✅ 修了
② AI Fluency: Framework & Foundations（1.1h）🔄 進行中
③ Building with the Claude API（8.1h・84講義）← Phase 1メイン
   Module 1: API Fundamentals
   Module 2: Prompt Engineering
   Module 3: ★ Tool Use ← ロードマップ記載の「Tool Useの章」はここ
   Module 4: RAG / Retrieval
   Module 5〜7: Agentic Workflows
④ Introduction to MCP（1h）← Phase 1後半
⑤ MCP: Advanced Topics（1.1h）← Phase 2以降

【GitHub anthropics/courses（Jupyter Notebookハンズオン）】
1. anthropic_api_fundamentals
2. prompt_engineering_interactive_tutorial
3. real_world_prompting
4. prompt_evaluations ← Evalsの骨格に直結
5. tool_use ← ★ ターゲット

【最短ルート】AI Fluency修了 → Building with Claude API Module 1〜3（約3〜4時間）`,
  },
  {
    id: "ctx_v5_strategy",
    title: "ロードマップ v5 重要決定事項",
    source: "claude.ai チャット 2026-03-14",
    tag: "戦略",
    pinned: true,
    createdAt: "2026-03-14",
    content: `【ビジョン】マルチAIエージェント組織の専門家として独立（2027年後半〜）
【One-Core】バックエンド1つ、LP/プロンプトのみ業界別。マルチプロダクトは確実な死。
【受託ルール】プロンプト/テンプレートのカスタマイズは可、コードカスタマイズは不可。
【Phase 2は2本柱】SIer特化 + 身内コネクション1業界のみ。3業界同時は「確実な死」。
【個人が狙える層】
C1: 業界特化エージェントの業務知識パック
C2: レガシーシステム接続アダプター（Playwright/RPA）
C3: 人間の承認を最適化するUI（Tinder風UIの発展形）
C4: エージェントの引き継ぎと採用（フレームワーク間移植）
C5: AIがAIを採用するメタエージェント
C6: エージェント組織の日本語マニュアル＋導入支援
C7: 業務プロセス診断AI（コンサルの入口）
C8: エージェント間SLA定義ツール`,
  },
];

// ── Academy data ──────────────────────────────────────────────
const ACADEMY = [
  { id:"ac_101", title:"Claude 101", hours:"1h", lectures:12, defaultStatus:"done",
    url:"https://anthropic.skilljar.com/claude-101", desc:"Claudeの基本操作・日常活用", modules:[] },
  { id:"ac_fluency", title:"AI Fluency: Framework & Foundations", hours:"1.1h", lectures:14, defaultStatus:"active",
    url:"https://anthropic.skilljar.com/ai-fluency-framework-foundations", desc:"AIと協働するための4Dフレームワーク", modules:[] },
  { id:"ac_api", title:"Building with the Claude API", hours:"8.1h", lectures:84, defaultStatus:"next", isMain:true,
    url:"https://anthropic.skilljar.com/claude-with-the-anthropic-api", desc:"Phase 1最重要コース（副業・サービス開発直結）",
    modules:[
      { id:"m1", title:"Module 1: API Fundamentals", desc:"APIキー・モデル選択・基本呼び出し" },
      { id:"m2", title:"Module 2: Prompt Engineering", desc:"システムプロンプト・構造化出力" },
      { id:"m3", title:"Module 3: Tool Use ★", desc:"ロードマップの「Tool Use章」はここ", isTarget:true },
      { id:"m4", title:"Module 4: RAG / Retrieval", desc:"埋め込み・ベクターDB" },
      { id:"m5", title:"Module 5〜7: Agentic Workflows", desc:"マルチエージェントへの橋" },
    ] },
  { id:"ac_mcp", title:"Introduction to MCP", hours:"1h", lectures:16, defaultStatus:"future",
    url:"https://anthropic.skilljar.com/introduction-to-model-context-protocol", desc:"Phase 1後半", modules:[] },
  { id:"ac_mcp_adv", title:"MCP: Advanced Topics", hours:"1.1h", lectures:15, defaultStatus:"future",
    url:"https://anthropic.skilljar.com/model-context-protocol-advanced-topics", desc:"Phase 2以降", modules:[] },
];

const GH_COURSES = [
  { id:"gh1", title:"anthropic_api_fundamentals", desc:"Module 1と同内容・ハンズオン" },
  { id:"gh2", title:"prompt_engineering_interactive_tutorial", desc:"Module 2の実践版" },
  { id:"gh3", title:"real_world_prompting", desc:"プロンプト実務応用" },
  { id:"gh4", title:"prompt_evaluations ★", desc:"Evalsの骨格に直結（v5戦略）", isTarget:true },
  { id:"gh5", title:"tool_use ★", desc:"Tool Useのハンズオン実装版", isTarget:true },
];

const INIT_TASKS = [
  { id:1, time:"朝 06:30", label:"G検定アプリで問題10問", cat:"G検定", done:false },
  { id:2, time:"朝 07:00", label:"X投稿：学習ログを投稿", cat:"発信", done:false },
  { id:3, time:"夜 21:00", label:"AI Fluency 残り章を完了させる", cat:"Academy", done:false },
  { id:4, time:"夜 21:30", label:"Building with the Claude API Module 1 を開始", cat:"Academy", done:false },
  { id:5, time:"夜 22:00", label:"GitHub: anthropics/courses をcloneしてapi_fundamentalsを確認", cat:"技術", done:false },
];

function buildSP(ctxBlocks, streak) {
  const txt = ctxBlocks.map(c => `【${c.title}】\n${c.content}`).join("\n\n---\n\n");
  return `あなたはSIerエンジニア（35歳・Java/VB.NET）のAIエンジニア転向を支援する「総合メンター」です。連続学習${streak}日目。

━━ チャットから同期されたコンテキスト ━━
${txt}
━━━━━━━━━━━━━━━━━━━━━━

上記をすべて把握した上で回答してください。毎日チェックインを受けたら「明日の日次タスク（時間込み3〜5個）」を必ず返してください。回答は日本語・簡潔・行動ベースで。`;
}

// ─────────────────────────────────────────────────────────────
export default function AIMentorV3() {
  const [view, setView] = useState("dashboard");
  const [tasks, setTasks] = useState(INIT_TASKS);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streak, setStreak] = useState(1);
  const [checkinDone, setCheckinDone] = useState(false);
  const [memo, setMemo] = useState("");

  // Context
  const [ctx, setCtx] = useState(SEED_CTX);
  const [ctxLoaded, setCtxLoaded] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTag, setNewTag] = useState("戦略");
  const [newSource, setNewSource] = useState("claude.ai チャット");

  // Academy
  const initAP = () => {
    const p = {};
    ACADEMY.forEach(c => {
      p[c.id] = c.defaultStatus;
      c.modules.forEach(m => { p[m.id] = "todo"; });
    });
    GH_COURSES.forEach(g => { p[g.id] = "todo"; });
    return p;
  };
  const [ap, setAp] = useState(initAP);

  const chatEndRef = useRef(null);
  const doneTasks = tasks.filter(t => t.done).length;
  const daysToExam = 56;

  // Load storage
  useEffect(() => {
    (async () => {
      const sc = await store.get("m_ctx_v3"); if (sc?.length) setCtx(sc);
      const sa = await store.get("m_ap_v3");  if (sa) setAp(sa);
      const ss = await store.get("m_streak_v3"); if (ss) setStreak(ss);
      setCtxLoaded(true);
    })();
  }, []);

  useEffect(() => { if (ctxLoaded) store.set("m_ctx_v3", ctx); }, [ctx, ctxLoaded]);
  useEffect(() => { if (ctxLoaded) store.set("m_ap_v3", ap); }, [ap, ctxLoaded]);
  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setMessages([{ role:"assistant", text:`おはようございます！ Day ${streak} スタート 🌅\n\nG検定まであと**${daysToExam}日**。\n\n今日の最優先：AI Fluency残り章 → Building with Claude API Module 1。\n\nチャットでの決定事項（Academyロードマップ・v5戦略）は「コンテキスト」タブに同期済みです。` }]);
  }, []);

  // Handlers
  const toggleTask = id => setTasks(p => p.map(t => t.id===id ? {...t, done:!t.done} : t));

  const cycleAP = id => {
    const cy = { todo:"active", active:"done", done:"todo" };
    setAp(p => ({ ...p, [id]: cy[p[id]] || "todo" }));
  };

  const handleAddCtx = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const block = { id:`ctx_${Date.now()}`, title:newTitle.trim(), source:newSource, tag:newTag, content:newContent.trim(), createdAt:"2026-03-14", pinned:false };
    setCtx(p => [block, ...p]);
    setMessages(p => [...p, { role:"assistant", text:`✅ 「**${block.title}**」をコンテキストに追加しました。以降の回答に反映します。` }]);
    setNewTitle(""); setNewContent(""); setAddOpen(false);
  };

  const handleCheckin = async () => {
    const done = tasks.filter(t=>t.done), notDone = tasks.filter(t=>!t.done);
    const msg = `【チェックイン Day ${streak}】\n✅ 達成（${done.length}件）: ${done.map(t=>t.label).join("、")||"なし"}\n❌ 未達成（${notDone.length}件）: ${notDone.map(t=>t.label).join("、")||"なし"}\n📝 ${memo||"メモなし"}\n\n→ 明日のタスクを設定してください。`;
    await sendMsg(msg);
    setCheckinDone(true);
    const ns = streak+1; setStreak(ns); store.set("m_streak_v3", ns);
  };

  const sendMsg = async (text) => {
    const t = text || input.trim(); if (!t) return;
    setMessages(p => [...p, {role:"user", text:t}]);
    setInput(""); setLoading(true);
    const pinned = ctx.filter(b=>b.pinned), rest = ctx.filter(b=>!b.pinned);
    const sp = buildSP([...pinned,...rest], streak);
    const hist = messages.map(m => ({ role: m.role==="assistant"?"assistant":"user", content:m.text }));
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system:sp, messages:[...hist,{role:"user",content:t}] }),
      });
      const d = await res.json();
      setMessages(p => [...p, {role:"assistant", text: d.content?.[0]?.text||"エラー"}]);
    } catch(e) {
      setMessages(p => [...p, {role:"assistant", text:`エラー: ${e.message}`}]);
    } finally { setLoading(false); }
  };

  const renderMd = txt => txt.split("\n").map((line,i) => (
    <p key={i} style={{margin:"1px 0",lineHeight:1.75,fontSize:13}}
      dangerouslySetInnerHTML={{__html: line.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")}} />
  ));

  // Status helpers
  const STATUS = {
    done:   { label:"✓ 修了",   bg:"#0a2215", color:C.green,  border:"#0a3a1a" },
    active: { label:"▶ 進行中", bg:C.amberDim,color:C.amber,  border:"#4a3000" },
    next:   { label:"→ 次はこれ",bg:C.blueDim, color:C.blue,  border:"#0a2855" },
    future: { label:"後で",     bg:C.bg3,      color:C.text1, border:C.border2 },
    todo:   { label:"未着手",   bg:C.bg3,      color:C.text1, border:C.border2 },
  };

  const StatusBadge = ({id, defaultSt}) => {
    const st = STATUS[ap[id]||defaultSt||"todo"];
    return (
      <span onClick={()=>cycleAP(id)} style={{
        fontSize:11, padding:"2px 9px", borderRadius:20, cursor:"pointer", userSelect:"none",
        background:st.bg, color:st.color, border:`1px solid ${st.border}`, fontWeight:600,
      }}>{st.label}</span>
    );
  };

  const ModuleDot = ({id}) => {
    const s = ap[id]||"todo";
    const col = s==="done" ? C.green : s==="active" ? C.amber : C.text2;
    const sym = s==="done" ? "✓" : s==="active" ? "▶" : "○";
    return <span onClick={()=>cycleAP(id)} style={{color:col,fontSize:14,cursor:"pointer",userSelect:"none",flexShrink:0}}>{sym}</span>;
  };

  // Shared card style
  const card = (extra={}) => ({
    background:C.bg2, border:`1px solid ${C.border}`,
    borderRadius:10, padding:"14px 16px", marginBottom:10, ...extra,
  });

  const TABS = [["dashboard","ダッシュボード"],["chat","メンター相談"],["academy","Academy進捗"],["context","コンテキスト"]];

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:C.bg0,color:C.text0,fontFamily:"'Noto Sans JP',sans-serif",fontSize:14}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap');
        * { box-sizing:border-box; }
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:${C.bg0}} ::-webkit-scrollbar-thumb{background:${C.border2};border-radius:2px}
        textarea,input,select{background:${C.bg3};border:1px solid ${C.border2};color:${C.text0};border-radius:7px;outline:none;font-family:inherit;}
        textarea::placeholder,input::placeholder{color:${C.text2}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{background:C.bg1,borderBottom:`1px solid ${C.border}`,padding:"10px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{fontWeight:700,fontSize:16}}>
            AI<span style={{color:C.purple}}>Mentor</span>
            <span style={{fontSize:10,color:C.text2,marginLeft:4,fontWeight:400}}>v3</span>
          </div>
          <div style={{fontSize:11,color:C.text2,fontFamily:"monospace"}}>2026-03-14 · Day {streak} · G検定まで{daysToExam}日</div>
          <div style={{fontSize:10,padding:"2px 9px",borderRadius:20,background:C.blueDim,color:C.blue,border:`1px solid #0a2855`,fontWeight:600}}>
            コンテキスト {ctx.length}件 同期済み
          </div>
        </div>
        <nav style={{display:"flex",gap:3}}>
          {TABS.map(([v,l]) => (
            <button key={v} onClick={()=>setView(v)} style={{
              padding:"5px 13px",borderRadius:7,border:"none",cursor:"pointer",fontSize:12,fontWeight:view===v?700:400,
              background:view===v?C.purpleDim:C.bg1,color:view===v?C.purple:C.text1,
              outline:view===v?`1px solid ${C.purpleMid}`:"none",
            }}>{l}</button>
          ))}
        </nav>
      </div>

      <div style={{display:"flex",flex:1,overflow:"hidden"}}>

        {/* ── LEFT SIDEBAR ── */}
        <div style={{width:268,flexShrink:0,background:C.bg1,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          {/* Stats */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,padding:"10px 10px 6px"}}>
            {[[streak,"連続日",C.purple],[doneTasks,"完了",C.green],[daysToExam,"G検定",C.orange]].map(([v,l,c]) => (
              <div key={l} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 4px",textAlign:"center"}}>
                <div style={{fontSize:22,fontWeight:700,lineHeight:1,color:c}}>{v}</div>
                <div style={{fontSize:9,color:C.text2,marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{padding:"4px 10px 8px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:11,color:C.text2}}>
              <span>今日の進捗</span>
              <span style={{fontWeight:700,color:C.text0}}>{doneTasks}/{tasks.length}</span>
            </div>
            <div style={{height:3,background:C.border,borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${(doneTasks/tasks.length)*100}%`,background:`linear-gradient(90deg,${C.purpleMid},${C.purple})`,transition:"width 0.4s"}} />
            </div>
          </div>

          {/* Tasks */}
          <div style={{fontSize:9,letterSpacing:2,color:C.text2,fontWeight:700,padding:"4px 10px 4px",textTransform:"uppercase"}}>📋 今日のタスク</div>
          <div style={{flex:1,overflowY:"auto",padding:"0 8px"}}>
            {tasks.map(t => (
              <div key={t.id} onClick={()=>toggleTask(t.id)} style={{
                display:"flex",alignItems:"flex-start",gap:8,padding:"8px",marginBottom:4,
                borderRadius:8,cursor:"pointer",
                background:t.done?C.greenDim:C.bg2,
                border:`1px solid ${t.done?"#0a3a1a":C.border}`,
                opacity:t.done?0.75:1,
              }}>
                <div style={{
                  width:16,height:16,borderRadius:4,flexShrink:0,marginTop:1,
                  border:`2px solid ${t.done?C.green:C.border2}`,
                  background:t.done?C.green:"transparent",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:9,color:C.bg0,fontWeight:900,
                }}>{t.done&&"✓"}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:9,color:C.text2,fontFamily:"monospace",marginBottom:1}}>{t.time}</div>
                  <div style={{fontSize:11.5,lineHeight:1.4,textDecoration:t.done?"line-through":"none",color:t.done?C.text2:C.text0}}>{t.label}</div>
                  <span style={{fontSize:9,padding:"1px 6px",borderRadius:8,marginTop:3,display:"inline-block",...(CAT_C[t.cat]||CAT_C["技術"])}}>{t.cat}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Memo */}
          <div style={{padding:"6px 10px",borderTop:`1px solid ${C.border}`}}>
            <div style={{fontSize:9,color:C.text2,marginBottom:3,textTransform:"uppercase",letterSpacing:1}}>📝 今日のメモ</div>
            <textarea value={memo} onChange={e=>setMemo(e.target.value)} rows={2}
              placeholder="気づき・詰まったこと..."
              style={{width:"100%",fontSize:11,padding:"5px 8px",resize:"none",lineHeight:1.5}} />
          </div>

          {/* Exam card */}
          <div style={{margin:"6px 10px",background:C.orangeDim,border:`1px solid #5a2800`,borderRadius:8,padding:"8px 12px"}}>
            <div style={{fontSize:9,color:C.orange,fontWeight:700,letterSpacing:1}}>G検定カウントダウン</div>
            <div style={{fontSize:26,fontWeight:700,color:C.text0,lineHeight:1,marginTop:2}}>{daysToExam}<span style={{fontSize:12,color:C.text2,marginLeft:4}}>days</span></div>
            <div style={{fontSize:10,color:C.text2,marginTop:1}}>2026年5月9日（土）</div>
          </div>

          {/* Checkin */}
          <button onClick={handleCheckin} disabled={checkinDone||loading} style={{
            margin:"0 10px 10px",padding:"9px",borderRadius:8,border:"none",cursor:checkinDone?"default":"pointer",
            background:checkinDone?C.bg3:`linear-gradient(135deg,${C.purpleMid},${C.purple})`,
            color:checkinDone?C.text2:C.bg0,fontSize:12,fontWeight:700,
          }}>
            {checkinDone?"✅ チェックイン完了":"📊 達成を報告して明日を設定"}
          </button>
        </div>

        {/* ── MAIN ── */}
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",background:C.bg0}}>

          {/* DASHBOARD */}
          {view==="dashboard" && (
            <div style={{flex:1,overflowY:"auto",padding:"22px 26px"}}>
              <h2 style={{fontSize:18,fontWeight:700,marginBottom:18,color:C.text0}}>今週の学習計画</h2>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,maxWidth:660,marginBottom:26}}>
                {[
                  ["平日 朝（30分）",   "G検定10問 + X投稿",                              C.blue],
                  ["平日 夜（90分）",   "AI Fluency修了 → Claude API Module 1〜3",         C.amber],
                  ["土曜（3〜4時間）",  "Module 3（Tool Use）実装 + GitHub Notebookで手を動かす", C.green],
                  ["日曜（2時間）",     "週次振り返り + コンテキスト更新 + 翌週計画",       C.text1],
                ].map(([l,t,c]) => (
                  <div key={l} style={{...card(),borderLeft:`3px solid ${c}`,borderRadius:0,borderTopRightRadius:8,borderBottomRightRadius:8}}>
                    <div style={{fontSize:11,color:c,fontWeight:700,marginBottom:5}}>{l}</div>
                    <div style={{fontSize:12,color:C.text1,lineHeight:1.65}}>{t}</div>
                  </div>
                ))}
              </div>

              <h2 style={{fontSize:18,fontWeight:700,marginBottom:12,color:C.text0}}>今月末の到達ゴール（3月）</h2>
              <div style={{...card({maxWidth:660,borderColor:C.purpleMid})}}>
                {[
                  ["✓","Hello World APIが動いている（Anthropic API）",         true],
                  ["✓","AI Fluency: Framework & Foundations を修了",           true],
                  ["○","Building with Claude API Module 1〜3（Tool Use）を完了", false],
                  ["○","G検定の学習習慣が定着している（毎日10問）",               false],
                  ["○","X発信を10回以上している",                                false],
                ].map(([icon,text,done]) => (
                  <div key={text} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
                    <span style={{fontSize:14,color:done?C.green:C.text2,flexShrink:0,marginTop:1}}>{icon}</span>
                    <span style={{fontSize:12.5,color:done?C.text0:C.text1,lineHeight:1.6}}>{text}</span>
                  </div>
                ))}
              </div>

              <h2 style={{fontSize:18,fontWeight:700,margin:"26px 0 12px",color:C.text0}}>コンテキスト同期の使い方</h2>
              <div style={{...card({maxWidth:660,background:C.blueDim,borderColor:"#0a2855"})}}>
                <div style={{fontSize:13,color:C.blue,lineHeight:1.9}}>
                  <strong>チャットとアプリをシームレスにつなぐ方法：</strong><br/>
                  1. このチャットで新しい知識・決定事項が出る<br/>
                  2. 「コンテキスト」タブを開いてテキストを貼り付けて追加<br/>
                  3. メンターAIが次回から自動でその内容を把握して回答する<br/>
                  4. データは <code style={{fontSize:11,background:C.bg3,padding:"1px 5px",borderRadius:4}}>window.storage</code> に保存され次回起動時も引き継がれる
                </div>
              </div>
            </div>
          )}

          {/* CHAT */}
          {view==="chat" && (
            <>
              <div style={{flex:1,overflowY:"auto",padding:"16px 20px",display:"flex",flexDirection:"column",gap:14}}>
                {messages.map((m,i) => (
                  <div key={i} style={{
                    maxWidth:"80%",alignSelf:m.role==="assistant"?"flex-start":"flex-end",
                    background:m.role==="assistant"?C.bg2:C.purpleDim,
                    border:`1px solid ${m.role==="assistant"?C.border:C.purpleMid}`,
                    borderRadius:m.role==="assistant"?"3px 12px 12px 12px":"12px 3px 12px 12px",
                    padding:"10px 14px",
                  }}>
                    <div style={{fontSize:9,color:m.role==="assistant"?C.purple:C.blue,fontWeight:700,marginBottom:5,textTransform:"uppercase",letterSpacing:1}}>
                      {m.role==="assistant"?"🤖 総合メンター":"👤 あなた"}
                    </div>
                    {renderMd(m.text)}
                  </div>
                ))}
                {loading && (
                  <div style={{alignSelf:"flex-start",background:C.bg2,border:`1px solid ${C.border}`,borderRadius:"3px 12px 12px 12px",padding:"12px 16px"}}>
                    <div style={{display:"flex",gap:5}}>
                      {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:C.purple,animation:`bounce 0.9s ${i*0.2}s infinite`}}/>)}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef}/>
              </div>
              <div style={{borderTop:`1px solid ${C.border}`,padding:"10px 16px",display:"flex",gap:8,alignItems:"flex-end",background:C.bg1}}>
                <textarea value={input} onChange={e=>setInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg();}}}
                  rows={2} placeholder="質問・相談・今日の報告（Enterで送信、Shift+Enterで改行）"
                  style={{flex:1,fontSize:13,padding:"8px 12px",resize:"none",lineHeight:1.5}} />
                <button onClick={()=>sendMsg()} disabled={loading} style={{
                  padding:"8px 18px",borderRadius:8,border:"none",cursor:"pointer",
                  background:loading?C.bg3:C.purpleMid,color:C.text0,fontSize:13,fontWeight:700,
                }}>送信</button>
              </div>
            </>
          )}

          {/* ACADEMY */}
          {view==="academy" && (
            <div style={{flex:1,overflowY:"auto",padding:"22px 26px"}}>
              <h2 style={{fontSize:18,fontWeight:700,marginBottom:4,color:C.text0}}>Anthropic Academy 進捗管理</h2>
              <p style={{fontSize:12,color:C.text2,marginBottom:20}}>バッジをクリックするとステータスを切り替えられます。</p>

              <div style={{fontSize:9,color:C.text2,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Skilljar コース（推奨順）</div>
              {ACADEMY.map(course => (
                <div key={course.id} style={{...card(),borderLeft:course.isMain?`3px solid ${C.amber}`:"none"}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                        <span style={{fontSize:13,fontWeight:700,color:C.text0}}>{course.title}</span>
                        {course.isMain&&<span style={{fontSize:9,padding:"2px 7px",borderRadius:20,background:C.amberDim,color:C.amber,border:`1px solid #4a3000`,fontWeight:700}}>Phase 1 メイン</span>}
                      </div>
                      <div style={{fontSize:12,color:C.text1,marginBottom:4}}>{course.desc}</div>
                      <div style={{fontSize:11,color:C.text2,fontFamily:"monospace"}}>{course.lectures}講義 · {course.hours}</div>
                    </div>
                    <StatusBadge id={course.id} defaultSt={course.defaultStatus}/>
                  </div>

                  {course.modules.length>0 && (
                    <div style={{marginTop:12,paddingTop:10,borderTop:`1px solid ${C.border}`}}>
                      {course.modules.map(m => (
                        <div key={m.id} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
                          <ModuleDot id={m.id}/>
                          <div style={{flex:1}}>
                            <span style={{fontSize:12,fontWeight:m.isTarget?700:400,color:m.isTarget?C.amber:C.text0}}>{m.title}</span>
                            {m.isTarget&&<span style={{fontSize:9,marginLeft:7,padding:"1px 7px",borderRadius:20,background:C.amberDim,color:C.amber,border:`1px solid #4a3000`,fontWeight:700}}>ターゲット</span>}
                            <div style={{fontSize:11,color:C.text2}}>{m.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div style={{fontSize:9,color:C.text2,fontWeight:700,letterSpacing:2,textTransform:"uppercase",margin:"20px 0 10px"}}>GitHub anthropics/courses（Jupyter Notebookハンズオン）</div>
              <div style={card()}>
                <div style={{fontSize:11,color:C.text2,marginBottom:10,fontFamily:"monospace"}}>https://github.com/anthropics/courses</div>
                {GH_COURSES.map(g => (
                  <div key={g.id} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
                    <ModuleDot id={g.id}/>
                    <div style={{flex:1}}>
                      <span style={{fontSize:12,fontFamily:"monospace",fontWeight:g.isTarget?700:400,color:g.isTarget?C.amber:C.text0}}>{g.title}</span>
                      {g.isTarget&&<span style={{fontSize:9,marginLeft:7,padding:"1px 7px",borderRadius:20,background:C.amberDim,color:C.amber,border:`1px solid #4a3000`,fontWeight:700}}>ターゲット</span>}
                      <div style={{fontSize:11,color:C.text2}}>{g.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CONTEXT */}
          {view==="context" && (
            <div style={{flex:1,overflowY:"auto",padding:"22px 26px"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:6}}>
                <div>
                  <h2 style={{fontSize:18,fontWeight:700,marginBottom:2,color:C.text0}}>コンテキストライブラリ</h2>
                  <p style={{fontSize:12,color:C.text2}}>チャットで得た知識をここに追加 → メンターAIが自動で参照します</p>
                </div>
                <button onClick={()=>setAddOpen(v=>!v)} style={{
                  padding:"6px 16px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,
                  background:addOpen?C.bg3:C.purpleDim,color:addOpen?C.text1:C.purple,outline:`1px solid ${addOpen?C.border2:C.purpleMid}`,
                }}>
                  {addOpen?"キャンセル":"＋ 追加"}
                </button>
              </div>

              {/* Add form */}
              {addOpen && (
                <div style={{...card({background:C.blueDim,borderColor:"#0a2855",marginBottom:18})}}>
                  <div style={{fontSize:13,color:C.blue,fontWeight:700,marginBottom:12}}>チャットからコンテキストを追加</div>
                  <div style={{marginBottom:10}}>
                    <div style={{fontSize:11,color:C.text2,marginBottom:4}}>タイトル</div>
                    <input value={newTitle} onChange={e=>setNewTitle(e.target.value)}
                      placeholder="例：G検定 弱点リスト"
                      style={{width:"100%",fontSize:12,padding:"7px 10px"}} />
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                    <div>
                      <div style={{fontSize:11,color:C.text2,marginBottom:4}}>タグ</div>
                      <select value={newTag} onChange={e=>setNewTag(e.target.value)}
                        style={{width:"100%",fontSize:12,padding:"7px 10px"}}>
                        {["戦略","Academy","技術","G検定","副業","振り返り","その他"].map(t=><option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <div style={{fontSize:11,color:C.text2,marginBottom:4}}>情報源</div>
                      <input value={newSource} onChange={e=>setNewSource(e.target.value)}
                        placeholder="claude.ai チャット 日付"
                        style={{width:"100%",fontSize:12,padding:"7px 10px"}} />
                    </div>
                  </div>
                  <div style={{marginBottom:12}}>
                    <div style={{fontSize:11,color:C.text2,marginBottom:4}}>内容（チャットのテキストをそのまま貼り付けてOK）</div>
                    <textarea value={newContent} onChange={e=>setNewContent(e.target.value)} rows={6}
                      placeholder="チャットでの結論・ロードマップ更新内容・学習メモなどを貼り付けてください..."
                      style={{width:"100%",fontSize:12,padding:"8px 10px",resize:"vertical",lineHeight:1.6}} />
                  </div>
                  <button onClick={handleAddCtx} disabled={!newTitle.trim()||!newContent.trim()} style={{
                    padding:"8px 20px",borderRadius:8,border:"none",cursor:"pointer",
                    background:C.greenDim,color:C.green,fontSize:12,fontWeight:700,outline:`1px solid #0a3a1a`,
                  }}>追加してメンターに反映</button>
                </div>
              )}

              {/* Pinned */}
              {ctx.filter(b=>b.pinned).length>0 && (
                <>
                  <div style={{fontSize:9,color:C.text2,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>📌 ピン留め（常に参照）</div>
                  {ctx.filter(b=>b.pinned).map(b=><CtxCard key={b.id} block={b} onDelete={id=>setCtx(p=>p.filter(x=>x.id!==id))} onPin={id=>setCtx(p=>p.map(x=>x.id===id?{...x,pinned:!x.pinned}:x))} />)}
                </>
              )}
              {ctx.filter(b=>!b.pinned).length>0 && (
                <>
                  <div style={{fontSize:9,color:C.text2,fontWeight:700,letterSpacing:2,textTransform:"uppercase",margin:"14px 0 8px"}}>その他</div>
                  {ctx.filter(b=>!b.pinned).map(b=><CtxCard key={b.id} block={b} onDelete={id=>setCtx(p=>p.filter(x=>x.id!==id))} onPin={id=>setCtx(p=>p.map(x=>x.id===id?{...x,pinned:!x.pinned}:x))} />)}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CtxCard({block, onDelete, onPin}) {
  const [open, setOpen] = useState(false);
  const tc = TAG_C[block.tag] || TAG_C["その他"];
  return (
    <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",marginBottom:8}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:open?8:0}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3,flexWrap:"wrap"}}>
            <span style={{fontSize:13,fontWeight:700,color:C.text0}}>{block.title}</span>
            <span style={{fontSize:9,padding:"2px 7px",borderRadius:20,background:tc.bg,color:tc.color,border:`1px solid ${tc.border}`,fontWeight:700}}>{block.tag}</span>
            {block.pinned&&<span style={{fontSize:11}}>📌</span>}
          </div>
          <div style={{fontSize:11,color:C.text2}}>{block.source} · {block.createdAt}</div>
        </div>
        <div style={{display:"flex",gap:4,flexShrink:0}}>
          <button onClick={()=>onPin(block.id)} style={{border:"none",background:C.bg3,borderRadius:5,cursor:"pointer",fontSize:10,color:C.text1,padding:"3px 8px"}}>
            {block.pinned?"unpin":"📌"}
          </button>
          <button onClick={()=>setOpen(v=>!v)} style={{border:"none",background:C.bg3,borderRadius:5,cursor:"pointer",fontSize:10,color:C.text1,padding:"3px 8px"}}>
            {open?"▲":"▼"}
          </button>
          <button onClick={()=>onDelete(block.id)} style={{border:"none",background:C.redDim,borderRadius:5,cursor:"pointer",fontSize:10,color:C.red,padding:"3px 8px"}}>削除</button>
        </div>
      </div>
      {open && (
        <div style={{marginTop:8,padding:"10px",background:C.bg1,borderRadius:7,fontSize:11.5,color:C.text1,lineHeight:1.75,whiteSpace:"pre-wrap",fontFamily:"monospace",maxHeight:280,overflowY:"auto"}}>
          {block.content}
        </div>
      )}
    </div>
  );
}