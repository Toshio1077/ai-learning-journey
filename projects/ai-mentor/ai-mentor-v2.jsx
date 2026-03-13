import { useState, useRef, useEffect, useCallback } from "react";

// ============================================================
// ROADMAP v5 DATA（マルチエージェント組織の専門家）
// ============================================================
const ROADMAP_V5 = {
  vision: "マルチAIエージェント組織の専門家として独立",
  phases: [
    {
      id: 1, label: "Phase 1", period: "2026年3〜7月", months: "5ヶ月",
      theme: "基盤構築 + Eval + 発信",
      color: "#16a34a",
      kpi: { revenue: "¥0〜1万", users: "身内1名", content: "Zenn 3本", cert: "G検定合格" },
      exitCriteria: [
        "身内1名が毎日ツールを使用",
        "Zenn記事3本公開",
        "G検定合格",
        "One-Coreの基本パイプラインが動作",
      ],
      months_detail: {
        "3-4月": {
          title: "Anthropic Academy + G検定 + Evalパイプライン骨格",
          isCurrent: true,
          tasks: {
            "技術学習": [
              "Anthropic Academy: Tool Useとプロンプト設計をマスター",
              "G検定: 法律・倫理章を「AIコンプラチェックの要件」として読む",
              "Evalsの骨格: NGワードフィルター＋業界用語チェックの最小版を実装",
              "「AIチャット→技術記事化」MVP作成（Claude API単体連携の練習）",
            ],
            "身内ヒアリング": [
              "家族（不動産/工務店）の業務を動画で撮影してもらう",
              "「一番面倒な手作業」をリスト化→AIで解決可能か検証",
            ],
            "発信": [
              "X: 毎日の学習ログ投稿を開始",
              "Zenn: 「Anthropic AcademyのTool Useを実践した話」記事化",
            ],
            "★ マルチエージェント": [
              "CrewAI公式チュートリアルを実行し学習ログをZennに投稿",
              "知人の1人起業家にヒアリング: どの業務を自動化したいか",
            ],
          },
        },
        "5月": {
          title: "G検定受験 → One-Core実装開始",
          isExam: true,
          tasks: {
            "前半（〜5/9 試験）": [
              "G検定弱点の高速復習＆本番受験（5/9）",
              "合格後即座に「G検定合格×SIer」としてX/Zennで発信",
            ],
            "後半（5/10〜）": [
              "One-Coreエンジン（LangChain / n8n）の基礎実装開始",
              "議事録AI（Whisper + Claude）のMVP作成（営業フック商品用）",
              "家族向け「Tinder風 承認UI」プロトタイプ作成",
            ],
            "★ マルチエージェント": [
              "CrewAIで「営業→経理引き継ぎ」の最小マルチエージェントデモを作成",
            ],
          },
        },
        "6-7月": {
          title: "身内ツール提供開始 + 受託#1",
          tasks: {
            "開発": [
              "家族にOne-Core + Tinder UIのベータ版を提供",
              "例: マイソク画像→物件紹介文AI（景表法Eval付き）",
              "例: 建設日報AI（写真+音声→安全書類、LINE BOT）",
              "毎日フィードバックを受け「泥臭い例外処理」をプロンプトに吸収",
            ],
            "発信・営業": [
              "Zenn: 「家族の不動産営業をAIで変えた話」記事化（バズ狙い）",
              "AI目標管理PWA（自分用）を公開しポートフォリオに",
            ],
            "★ マルチエージェント": [
              "知人の1人起業家にCrewAI/n8nでエージェント組織を構築（受託#1）",
              "月額保守契約（¥5,000〜）で初期の継続収益を確保",
              "受託の過程をZenn記事化→「AIエージェント組織の専門家」ポジション確立",
            ],
          },
        },
      },
    },
    {
      id: 2, label: "Phase 2", period: "2026年8月〜2027年2月", months: "7ヶ月",
      theme: "身内共創PMF + 初収益（2本柱戦略）",
      color: "#1d4ed8",
      kpi: { revenue: "¥3〜8万/月", users: "有料10社", content: "Zenn/Note 5本" },
      note: "SIer特化 + 身内コネクション1業界の2本柱。3業種同時は確実な死。",
      exitCriteria: [
        "月額有料ユーザー10社以上",
        "月収¥3万以上が3ヶ月連続",
        "身内が「なくてはならない」と言うツールが1つ以上",
        "One-Coreで2業界以上にマルチフロント展開済み",
      ],
    },
    {
      id: 3, label: "Phase 3", period: "2027年3〜8月", months: "6ヶ月",
      theme: "高単価SaaS + スターターキット",
      color: "#7c3aed",
      kpi: { revenue: "¥15〜25万/月", users: "有料30社", cert: "AWS AI Practitioner検討" },
      exitCriteria: [
        "月収¥15万以上が3ヶ月連続",
        "スターターキット有料ユーザー5社以上",
        "操作マニュアルツールがPhase 4統合可能な完成度",
      ],
    },
    {
      id: 4, label: "Phase 4", period: "2027年後半〜", months: "〜",
      theme: "統合パッケージ + AaaS（UI+API二段構え）",
      color: "#dc2626",
      kpi: { revenue: "¥50万+/月", milestone: "独立・法人設立", target: "M&A事業価値" },
    },
  ],
  claudeServices: [
    { id: "C1", title: "業界特化エージェントの「業務知識パック」", phase: 2, type: "MA", desc: "建設業の安全書類フォーマット・不動産の重要事項説明の定型文をプロンプト＋RAGナレッジ＋業界テンプレートとして販売。One-Coreの「知識レイヤー」。" },
    { id: "C2", title: "レガシーシステム接続アダプター", phase: 2, type: "MA", desc: "APIがないレインズ・建設発注システム・自治体電子申請等をPlaywright/RPAで橋渡し。泥臭すぎて大手は参入しない。" },
    { id: "C3", title: "「人間の承認」を最適化するUI", phase: 2, type: "MA", desc: "Tinder風承認UIの発展形。承認ワークフロー（この順番で誰が承認するか）を設計できるツール。稟議文化のある日本企業に刺さる。" },
    { id: "C4", title: "エージェントの「引き継ぎ」と「採用」", phase: 3, type: "MA", desc: "CrewAI→LangGraph移植ニーズ対応。引き継ぎ書ジェネレーター（v4案#08）＋お墓と履歴書（v4案#10）。Lettaの.afフォーマット連携も視野。" },
    { id: "C5", title: "AIがAIを「採用」するメタエージェント", phase: 3, type: "MA", desc: "複数LLM（Claude/GPT/Gemini）に同じタスクを実行させEvalで最優秀を自動選定。「面接官エージェントが候補エージェントをテスト」というUIで技術者でない起業家にも刺さる。" },
    { id: "C6", title: "エージェント組織の日本語マニュアル＋導入支援", phase: 1, type: "Content", desc: "CrewAI/LangGraphの公式は英語。日本の零細企業向け導入ガイドをZenn/Noteで体系化＋有料講座。即日始められる最低リスクの収益化。" },
    { id: "C7", title: "業務プロセス診断AI（営業ファネル）", phase: 2, type: "Consulting", desc: "「あなたの業務のどこをエージェント化するとROIが最高か」を診断する対話型ツール。コンサルの入口として使いパッケージ導入を提案。大手はコンサル的な入口を作らない。" },
    { id: "C8", title: "エージェント間「契約書」（SLA定義ツール）", phase: 3, type: "MA", desc: "エージェントAがBにタスクを依頼する際の「期待品質・レスポンス時間・エラー時挙動」を定義するDSL。人間の業務委託契約書のエージェント版。フレームワーク層ではなく業務設計層なので大手は作らない。" },
  ],
};

// ============================================================
// TODAY'S INITIAL TASKS
// ============================================================
const INITIAL_TASKS = [
  { id: 1, time: "朝 06:30", label: "G検定アプリで問題10問", cat: "G検定", done: false },
  { id: 2, time: "朝 07:00", label: "X投稿：学習ログを投稿", cat: "発信", done: false },
  { id: 3, time: "夜 21:00", label: "Anthropic Academy「Tool Use」章を進める", cat: "Academy", done: false },
  { id: 4, time: "夜 21:30", label: "Python環境確認 or APIキーHello World", cat: "技術", done: false },
  { id: 5, time: "夜 22:00", label: "CrewAIの公式チュートリアルを確認（マルチエージェント入門）", cat: "MA", done: false },
];

const CAT = {
  "G検定":  { bg: "#052e16", border: "#4ade80",  text: "#4ade80"  },
  "発信":   { bg: "#1e1b4b", border: "#818cf8",  text: "#818cf8"  },
  "Academy":{ bg: "#431407", border: "#fb923c",  text: "#fb923c"  },
  "技術":   { bg: "#082f49", border: "#38bdf8",  text: "#38bdf8"  },
  "MA":     { bg: "#2e1065", border: "#c084fc",  text: "#c084fc"  },
  "副業":   { bg: "#4a044e", border: "#e879f9",  text: "#e879f9"  },
};

// ============================================================
// GITHUB SERVICE
// ============================================================
const GH_OWNER = "Toshio1077";
const GH_REPO = "ai-learning-journey";

async function ghRequest(pat, method, path, body) {
  const res = await fetch(`https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${path}`, {
    method,
    headers: {
      Authorization: `token ${pat}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github.v3+json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res;
}

function buildDailyLogMarkdown(dateStr, tasks, memo, streak) {
  const done = tasks.filter(t => t.done);
  const notDone = tasks.filter(t => !t.done);
  const rate = Math.round((done.length / tasks.length) * 100);

  return `# ${dateStr} — Day ${streak}

## 📊 達成率: ${rate}% (${done.length}/${tasks.length})

## ✅ 達成タスク
${done.map(t => `- [x] [${t.cat}] ${t.label}`).join("\n") || "- なし"}

## ❌ 未達成タスク
${notDone.map(t => `- [ ] [${t.cat}] ${t.label}`).join("\n") || "- なし"}

## 📝 メモ・気づき
${memo || "（記録なし）"}

---
*G検定まであと${Math.ceil((new Date("2026-05-09") - new Date()) / 86400000)}日 | 連続${streak}日目*
`;
}

// ============================================================
// SYSTEM PROMPT
// ============================================================
function buildSystemPrompt(ctx) {
  return `あなたはSIerエンジニア（35歳・Java/VB.NET経験）のAIエンジニア転向・副業独立を支援する「総合メンター」です。

【目標】マルチAIエージェント組織の専門家として独立（2027年後半〜）

【Phase構成】
Phase 1（3〜7月）: G検定合格・Anthropic Academy・Evals骨格・CrewAI入門・身内ヒアリング
Phase 2（8月〜2027年2月）: 2本柱（SIer特化 + 身内コネクション1業界）・初収益¥3〜8万
Phase 3（2027年3〜8月）: 高単価SaaS・スターターキット・¥15〜25万
Phase 4（2027年後半〜）: AaaS・SIerテスト自動化・独立

【現在地】2026年3〜4月 / Phase 1
重要日：G検定 2026年5月9日（土）残り約${Math.ceil((new Date("2026-05-09") - new Date()) / 86400000)}日

【戦略上の重要な決定事項】
- One-Coreアーキテクチャ（バックエンド1つ、LP/プロンプトだけ業界別に差し替え）
- 受託ルール：「プロンプト/テンプレートのカスタマイズは可、コードカスタマイズは不可」
- ダッシュボードは単体SaaSにしない→スターターキットの1機能として内包
- Computer Useはフォールバック、Playwright/Puppeteerを第一選択
- Phase 2は3業界同時ではなく「SIer + 身内コネクション1業界」の2本柱

【大手が取る層・個人が狙う層】
避ける：エージェント実行基盤・汎用監視ツール・セキュリティ基盤（全部大手が取る）
狙う：業界特化業務知識パック・レガシー接続アダプター・「人間の承認」最適化UI・エージェントの引き継ぎ/採用・日本語マニュアル・業務プロセス診断・エージェント間SLA定義ツール

【前日の状況】
${ctx.yesterday || "初回（まだ記録なし）"}

【現在の状態】
連続学習日数：${ctx.streak}日目 | 累計達成タスク：${ctx.totalDone}件

【メンターとしての振る舞い】
- 毎日チェックイン報告を受けたら必ず「明日の日次タスク3〜5個（時間込み）」を返す
- 未達成タスクを翌日・翌週に自動で再スケジュールする
- ロードマップの月次目標との整合を確認し、遅れがあれば軽い軌道修正を提案
- SIer経験（VB.NET・C#・品質管理・ドキュメント文化）をマルチエージェント設計の強みとして活かす視点を持つ
- 回答は簡潔・具体的・行動ベースで。過度な励ましより現実的なアドバイスを優先
- 日本語で回答すること`;
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function AIMentorV2() {
  const [view, setView] = useState("dashboard");
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [memo, setMemo] = useState("");
  const [checkinDone, setCheckinDone] = useState(false);
  const [streak, setStreak] = useState(1);
  const [totalDone, setTotalDone] = useState(0);
  const [ghPat, setGhPat] = useState("");
  const [ghStatus, setGhStatus] = useState(null); // null | "pushing" | "success" | "error" | string
  const [showGhSettings, setShowGhSettings] = useState(false);
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [expandedService, setExpandedService] = useState(null);
  const chatEndRef = useRef(null);

  const today = new Date("2026-03-14");
  const dateStr = `2026年3月14日（土）`;
  const logFileName = `2026-03-14.md`;
  const logPath = `daily-log/2026-03/${logFileName}`;
  const daysToExam = Math.ceil((new Date("2026-05-09") - today) / 86400000);
  const doneTasks = tasks.filter(t => t.done).length;

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setMessages([{
      role: "assistant",
      text: `おはようございます！🌅

**${dateStr} — Day ${streak}スタート**

G検定まであと **${daysToExam}日**。ロードマップはv5に更新されました。

今日の目標：**「マルチエージェント組織の専門家」** への第一歩
→ CrewAIチュートリアルの確認と、G検定10問が今日の最重要タスクです。

**GitHubとの連携について：**
右上の ⚙️ からPersonal Access Token（PAT）を設定すると、
今日のタスク報告が自動で \`daily-log/2026-03/\` にコミットされます。

何か質問・相談があればどうぞ。`,
    }]);
  }, []);

  // ── Toggle task ──────────────────────────────────────────
  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nd = !t.done;
        setTotalDone(n => n + (nd ? 1 : -1));
        return { ...t, done: nd };
      }
      return t;
    }));
  };

  // ── GitHub push ──────────────────────────────────────────
  const pushToGitHub = async (mdContent) => {
    if (!ghPat) return null;
    setGhStatus("pushing");
    try {
      // Check if file exists (to get SHA)
      const checkRes = await ghRequest(ghPat, "GET", logPath);
      let sha = null;
      if (checkRes.ok) {
        const data = await checkRes.json();
        sha = data.sha;
      }

      const body = {
        message: `docs: daily log ${logFileName.replace(".md", "")} - ${doneTasks}/${tasks.length} tasks done`,
        content: btoa(unescape(encodeURIComponent(mdContent))),
      };
      if (sha) body.sha = sha;

      const putRes = await ghRequest(ghPat, "PUT", logPath, body);
      if (putRes.ok) {
        setGhStatus("success");
        return true;
      } else {
        const err = await putRes.json();
        setGhStatus(`error: ${err.message}`);
        return false;
      }
    } catch (e) {
      setGhStatus(`error: ${e.message}`);
      return false;
    }
  };

  // ── Daily checkin ────────────────────────────────────────
  const handleCheckin = async () => {
    const done = tasks.filter(t => t.done);
    const notDone = tasks.filter(t => !t.done);
    const rate = Math.round((done.length / tasks.length) * 100);

    const summary = `【本日のチェックイン ${dateStr}】
達成率: ${rate}% (${done.length}/${tasks.length})

✅ 達成:
${done.map(t => `・[${t.cat}] ${t.label}`).join("\n") || "なし"}

❌ 未達成:
${notDone.map(t => `・[${t.cat}] ${t.label}`).join("\n") || "なし"}

📝 メモ: ${memo || "なし"}

→ 未達成タスクを翌日に再スケジュールし、明日の日次タスクを設定してください。`;

    // GitHub push
    if (ghPat) {
      const md = buildDailyLogMarkdown(dateStr, tasks, memo, streak);
      await pushToGitHub(md);
    }

    // AI check-in
    await sendMessage(summary, true);
    setCheckinDone(true);
    setStreak(s => s + 1);
  };

  // ── Send message ─────────────────────────────────────────
  const sendMessage = async (text, isCheckin = false) => {
    const userText = text || input.trim();
    if (!userText) return;
    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setInput("");
    setLoading(true);

    const sp = buildSystemPrompt({ yesterday: "初回", streak, totalDone });
    const history = messages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text }));

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: sp,
          messages: [...history, { role: "user", content: userText }],
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "応答を取得できませんでした。";
      setMessages(prev => [...prev, { role: "assistant", text: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", text: `エラー: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  // ── Render helpers ───────────────────────────────────────
  const renderMd = (text) =>
    text.split("\n").map((line, i) => {
      const h = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                    .replace(/`([^`]+)`/g, "<code style='background:#1e1e2e;padding:1px 5px;border-radius:3px;font-size:11px'>$1</code>");
      return <p key={i} style={{ margin: "1px 0", lineHeight: 1.75 }} dangerouslySetInnerHTML={{ __html: h }} />;
    });

  // ============================================================
  // STYLES
  // ============================================================
  const S = {
    app: { fontFamily: "'Noto Sans JP', sans-serif", background: "#080810", color: "#dde0ee", minHeight: "100vh", display: "flex", flexDirection: "column", fontSize: 13 },
    header: { background: "#0c0c18", borderBottom: "1px solid #1a1a2a", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 },
    logo: { fontWeight: 900, fontSize: 15, letterSpacing: "-0.5px", color: "#fff" },
    accentPurple: { color: "#a78bfa" },
    accentGreen: { color: "#4ade80" },
    nav: { display: "flex", gap: 3 },
    navBtn: (a) => ({ padding: "4px 12px", borderRadius: 5, border: "none", cursor: "pointer", fontSize: 11.5, fontWeight: a ? 700 : 400, background: a ? "#7c3aed" : "transparent", color: a ? "#fff" : "#666", transition: "all 0.15s" }),
    ghBtn: { padding: "4px 10px", borderRadius: 5, border: "1px solid #2a2a3a", background: "transparent", color: "#666", fontSize: 11, cursor: "pointer" },
    body: { display: "flex", flex: 1, overflow: "hidden", height: "calc(100vh - 48px)" },
    // LEFT
    left: { width: 270, flexShrink: 0, background: "#0c0c18", borderRight: "1px solid #1a1a2a", display: "flex", flexDirection: "column", overflow: "hidden" },
    statsRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, padding: "10px 12px", borderBottom: "1px solid #1a1a2a" },
    stat: { background: "#111120", border: "1px solid #1a1a28", borderRadius: 7, padding: "8px 6px", textAlign: "center" },
    statNum: { fontSize: 19, fontWeight: 900, lineHeight: 1, color: "#fff" },
    statLbl: { fontSize: 9, color: "#555", marginTop: 2 },
    bar: { height: 3, background: "#1a1a2a", borderRadius: 2, overflow: "hidden", margin: "8px 12px 4px" },
    barFill: (w) => ({ height: "100%", width: `${w}%`, background: "linear-gradient(90deg,#7c3aed,#a78bfa)", transition: "width 0.4s" }),
    barLbl: { display: "flex", justifyContent: "space-between", padding: "0 12px 6px", fontSize: 10, color: "#555" },
    sLabel: { fontSize: 9, letterSpacing: 2, color: "#444", fontWeight: 700, padding: "10px 12px 4px", textTransform: "uppercase" },
    taskList: { flex: 1, overflowY: "auto", padding: "4px 10px" },
    taskItem: (done) => ({ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 8px", marginBottom: 5, borderRadius: 7, background: done ? "#0a140a" : "#0e0e1c", border: `1px solid ${done ? "#1a2e1a" : "#1a1a2a"}`, cursor: "pointer", transition: "all 0.12s" }),
    chk: (done) => ({ width: 16, height: 16, borderRadius: 3, flexShrink: 0, marginTop: 1, border: `2px solid ${done ? "#4ade80" : "#2a2a3a"}`, background: done ? "#4ade80" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#000", fontWeight: 900 }),
    taskTime: { fontSize: 9, color: "#444", marginBottom: 1, fontFamily: "monospace" },
    taskLbl: (done) => ({ fontSize: 11.5, color: done ? "#3a6a3a" : "#bbb", lineHeight: 1.4, textDecoration: done ? "line-through" : "none" }),
    catBadge: (cat) => ({ fontSize: 8, padding: "1px 5px", borderRadius: 8, fontWeight: 700, background: (CAT[cat] || CAT["技術"]).bg, color: (CAT[cat] || CAT["技術"]).text, border: `1px solid ${(CAT[cat] || CAT["技術"]).border}`, display: "inline-block", marginTop: 3 }),
    memoBox: { padding: "6px 12px", borderBottom: "1px solid #1a1a2a" },
    memoInput: { width: "100%", background: "#0e0e1c", border: "1px solid #1a1a2a", borderRadius: 5, color: "#ccc", fontSize: 11, padding: "5px 8px", resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.5 },
    examCard: { margin: "8px 10px", background: "linear-gradient(135deg,#1a0a00,#2a1500)", border: "1px solid #f97316", borderRadius: 7, padding: "8px 12px" },
    examLabel: { fontSize: 9, color: "#f97316", fontWeight: 700, letterSpacing: 1 },
    examDays: { fontSize: 24, fontWeight: 900, color: "#fff", lineHeight: 1, marginTop: 1 },
    examSub: { fontSize: 10, color: "#666", marginTop: 1 },
    checkinBtn: (disabled) => ({ margin: "8px 10px", padding: "9px", borderRadius: 7, border: "none", cursor: disabled ? "default" : "pointer", background: disabled ? "#1a1a2a" : "linear-gradient(135deg,#7c3aed,#a78bfa)", color: disabled ? "#444" : "#fff", fontSize: 12, fontWeight: 700, transition: "all 0.15s" }),
    ghStatus: (s) => ({ margin: "0 10px 8px", padding: "6px 10px", borderRadius: 5, fontSize: 10, background: s === "success" ? "#052e16" : s === "pushing" ? "#0f172a" : "#2a0a0a", color: s === "success" ? "#4ade80" : s === "pushing" ? "#818cf8" : "#f87171", border: `1px solid ${s === "success" ? "#166534" : s === "pushing" ? "#3730a3" : "#7f1d1d"}` }),
    // RIGHT
    right: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
    chatMsgs: { flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 },
    bubble: (r) => ({ maxWidth: "80%", alignSelf: r === "assistant" ? "flex-start" : "flex-end", background: r === "assistant" ? "#0e0e1c" : "#160e2e", border: `1px solid ${r === "assistant" ? "#1a1a2a" : "#2a1a4a"}`, borderRadius: r === "assistant" ? "3px 12px 12px 12px" : "12px 3px 12px 12px", padding: "10px 14px", fontSize: 12.5, lineHeight: 1.75, color: "#dde" }),
    bubbleName: (r) => ({ fontSize: 9, color: r === "assistant" ? "#7c3aed" : "#6366f1", fontWeight: 700, letterSpacing: 1, marginBottom: 5, textTransform: "uppercase" }),
    inputRow: { borderTop: "1px solid #1a1a2a", padding: "10px 16px", display: "flex", gap: 8, alignItems: "flex-end", background: "#0c0c18" },
    textarea: { flex: 1, background: "#0e0e1c", border: "1px solid #1a1a2a", borderRadius: 8, color: "#dde", fontSize: 12.5, padding: "8px 12px", resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.5, minHeight: 38, maxHeight: 100 },
    sendBtn: { padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: loading ? "#1a1a2a" : "#7c3aed", color: "#fff", fontSize: 12.5, fontWeight: 700, flexShrink: 0 },
    loadRow: { display: "flex", gap: 4, padding: "2px 0" },
    // DASHBOARD
    dash: { flex: 1, overflowY: "auto", padding: 20 },
    dashH: { fontSize: 16, fontWeight: 900, color: "#fff", marginBottom: 14 },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 660, marginBottom: 20 },
    dayCard: (color) => ({ background: "#0e0e1c", border: `1px solid #1a1a2a`, borderLeft: `3px solid ${color}`, borderRadius: 7, padding: "12px 14px" }),
    dayLbl: (color) => ({ fontSize: 9, color, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }),
    dayText: { fontSize: 12, color: "#aaa", lineHeight: 1.6 },
    // ROADMAP
    rmWrap: { flex: 1, overflowY: "auto", padding: 20 },
    phaseCard: (color, open) => ({ marginBottom: 10, borderRadius: 8, overflow: "hidden", border: `1px solid ${open ? color : "#1a1a2a"}` }),
    phaseHd: (color) => ({ background: `${color}22`, borderBottom: `1px solid ${color}44`, padding: "12px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }),
    phaseTitle: { fontWeight: 900, fontSize: 13, color: "#fff" },
    phaseSub: { fontSize: 10, color: "#666", marginTop: 2 },
    kpiRow: { display: "flex", gap: 8, padding: "10px 14px", background: "#0a0a14", borderBottom: "1px solid #1a1a2a" },
    kpiItem: { fontSize: 11, color: "#888", background: "#111120", border: "1px solid #1a1a2a", borderRadius: 5, padding: "5px 10px" },
    kpiVal: { fontWeight: 900, color: "#fff", marginRight: 3 },
    // SERVICES
    svcList: { flex: 1, overflowY: "auto", padding: 20 },
    svcCard: (open) => ({ marginBottom: 8, borderRadius: 7, border: `1px solid ${open ? "#7c3aed" : "#1a1a2a"}`, overflow: "hidden" }),
    svcHd: { padding: "10px 14px", background: "#0e0e1c", cursor: "pointer", display: "flex", gap: 10, alignItems: "center" },
    svcBody: { padding: "10px 14px", background: "#0a0a14", fontSize: 12, color: "#888", lineHeight: 1.7 },
    // GITHUB SETTINGS
    overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" },
    modal: { background: "#0e0e1c", border: "1px solid #2a2a3a", borderRadius: 10, padding: 24, width: 360, maxWidth: "90vw" },
    modalH: { fontSize: 14, fontWeight: 900, color: "#fff", marginBottom: 14 },
    inputFld: { width: "100%", background: "#111120", border: "1px solid #2a2a3a", borderRadius: 6, color: "#dde", fontSize: 12, padding: "8px 10px", outline: "none", fontFamily: "monospace" },
    saveBtn: { width: "100%", marginTop: 12, padding: "9px", borderRadius: 7, border: "none", cursor: "pointer", background: "#7c3aed", color: "#fff", fontSize: 12.5, fontWeight: 700 },
    note: { fontSize: 11, color: "#555", marginTop: 8, lineHeight: 1.6 },
  };

  const renderRoadmap = () => (
    <div style={S.rmWrap}>
      <div style={{ maxWidth: 680 }}>
        <h2 style={{ fontSize: 16, fontWeight: 900, color: "#fff", marginBottom: 4 }}>ロードマップ v5</h2>
        <p style={{ color: "#555", fontSize: 11, marginBottom: 18 }}>マルチAIエージェント組織の専門家 · 2026年3月〜2027年後半</p>

        {ROADMAP_V5.phases.map(ph => {
          const open = expandedPhase === ph.id;
          return (
            <div key={ph.id} style={S.phaseCard(ph.color, open)}>
              <div style={S.phaseHd(ph.color)} onClick={() => setExpandedPhase(open ? null : ph.id)}>
                <div>
                  <div style={S.phaseTitle}>{ph.label}: {ph.theme}</div>
                  <div style={S.phaseSub}>{ph.period} · {ph.months} {ph.id === 1 ? "· 現在地" : ""}</div>
                </div>
                <span style={{ color: ph.color, fontSize: 12 }}>{open ? "▲" : "▼"}</span>
              </div>
              {open && (
                <>
                  <div style={S.kpiRow}>
                    {Object.entries(ph.kpi || {}).map(([k, v]) => (
                      <div key={k} style={S.kpiItem}><span style={S.kpiVal}>{v}</span>{k}</div>
                    ))}
                  </div>
                  {ph.note && (
                    <div style={{ padding: "8px 14px", background: "#100a00", borderBottom: "1px solid #2a1a00", fontSize: 11, color: "#fb923c" }}>
                      ⚠️ {ph.note}
                    </div>
                  )}
                  {ph.exitCriteria && (
                    <div style={{ padding: "10px 14px", background: "#0a0a14" }}>
                      <div style={{ fontSize: 9, color: "#555", fontWeight: 700, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>Phase移行条件</div>
                      {ph.exitCriteria.map((c, i) => (
                        <div key={i} style={{ fontSize: 11, color: "#777", marginBottom: 3 }}>✦ {c}</div>
                      ))}
                    </div>
                  )}
                  {ph.months_detail && Object.entries(ph.months_detail).map(([mo, detail]) => (
                    <div key={mo} style={{ borderTop: "1px solid #1a1a2a", padding: "10px 14px" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                        <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "#fff" }}>{mo}</span>
                        <span style={{ fontSize: 11, color: "#888" }}>{detail.title}</span>
                        {detail.isCurrent && <span style={{ fontSize: 9, background: "#7c3aed", color: "#fff", padding: "1px 6px", borderRadius: 8, fontWeight: 700 }}>NOW</span>}
                        {detail.isExam && <span style={{ fontSize: 9, background: "#f97316", color: "#fff", padding: "1px 6px", borderRadius: 8, fontWeight: 700 }}>G検定</span>}
                      </div>
                      {Object.entries(detail.tasks).map(([cat, ts]) => (
                        <div key={cat} style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: 9, fontWeight: 700, color: cat.includes("★") ? "#c084fc" : "#555", letterSpacing: 1, marginBottom: 4, textTransform: "uppercase" }}>{cat}</div>
                          {ts.map((t, i) => (
                            <div key={i} style={{ fontSize: 11.5, color: cat.includes("★") ? "#a78bfa" : "#777", paddingLeft: 10, borderLeft: `2px solid ${cat.includes("★") ? "#4c1d95" : "#1a1a2a"}`, marginBottom: 3 }}>{t}</div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderServices = () => (
    <div style={S.svcList}>
      <h2 style={{ fontSize: 16, fontWeight: 900, color: "#fff", marginBottom: 4 }}>Claude提案サービス案 8選</h2>
      <p style={{ color: "#555", fontSize: 11, marginBottom: 16 }}>大手が取らない層・個人が狙える層のサービスアイデア</p>
      {ROADMAP_V5.claudeServices.map(s => {
        const open = expandedService === s.id;
        const phColor = ROADMAP_V5.phases.find(p => p.id === s.phase)?.color || "#555";
        return (
          <div key={s.id} style={S.svcCard(open)}>
            <div style={S.svcHd} onClick={() => setExpandedService(open ? null : s.id)}>
              <span style={{ fontFamily: "monospace", fontSize: 10, color: "#555", minWidth: 22 }}>{s.id}</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "#dde", flex: 1 }}>{s.title}</span>
              <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 8, background: `${phColor}33`, color: phColor, fontWeight: 700 }}>Ph{s.phase}</span>
              <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 8, background: "#2e1065", color: "#c084fc", fontWeight: 700, marginLeft: 4 }}>{s.type}</span>
              <span style={{ color: "#444", fontSize: 11, marginLeft: 8 }}>{open ? "▲" : "▼"}</span>
            </div>
            {open && <div style={S.svcBody}>{s.desc}</div>}
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #080810; }
        ::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 2px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        textarea::placeholder { color: #333; }
        input::placeholder { color: #333; }
      `}</style>

      {/* GITHUB SETTINGS MODAL */}
      {showGhSettings && (
        <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && setShowGhSettings(false)}>
          <div style={S.modal}>
            <div style={S.modalH}>⚙️ GitHub連携設定</div>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>
              リポジトリ: <code style={{ color: "#a78bfa" }}>Toshio1077/ai-learning-journey</code>
            </div>
            <div style={{ fontSize: 11, color: "#666", marginBottom: 8 }}>Personal Access Token (PAT)</div>
            <input
              type="password"
              style={S.inputFld}
              value={ghPat}
              onChange={e => setGhPat(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
            />
            <div style={S.note}>
              Settings → Developer settings → Personal access tokens → Tokens (classic)<br />
              スコープ: <strong style={{ color: "#c084fc" }}>repo</strong> にチェックを入れて生成してください。<br />
              保存先: このセッションのみ（外部には送信されません）
            </div>
            <button style={S.saveBtn} onClick={() => setShowGhSettings(false)}>
              ✓ 保存して閉じる
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={S.logo}>AI<span style={S.accentPurple}>Mentor</span> <span style={{ fontSize: 10, color: "#444", fontWeight: 400 }}>v5</span></div>
          <div style={{ fontSize: 10, color: "#444", fontFamily: "monospace" }}>{dateStr}</div>
          <div style={{ fontSize: 10, color: "#555" }}>🎯 マルチエージェント組織の専門家</div>
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <div style={S.nav}>
            {[["dashboard","📊 今週"], ["chat","💬 相談"], ["roadmap","🗺️ MAP"], ["services","🤖 サービス案"]].map(([v,l]) => (
              <button key={v} style={S.navBtn(view === v)} onClick={() => setView(v)}>{l}</button>
            ))}
          </div>
          <button style={{ ...S.ghBtn, color: ghPat ? "#4ade80" : "#666" }} onClick={() => setShowGhSettings(true)}>
            {ghPat ? "✓ GitHub連携中" : "⚙️ GitHub設定"}
          </button>
        </div>
      </div>

      <div style={S.body}>
        {/* LEFT PANEL */}
        <div style={S.left}>
          {/* Stats */}
          <div style={S.statsRow}>
            <div style={S.stat}>
              <div style={S.statNum}>{streak}</div>
              <div style={S.statLbl}>連続日</div>
            </div>
            <div style={S.stat}>
              <div style={{ ...S.statNum, color: "#4ade80" }}>{doneTasks}</div>
              <div style={S.statLbl}>完了</div>
            </div>
            <div style={S.stat}>
              <div style={{ ...S.statNum, color: "#f97316" }}>{daysToExam}</div>
              <div style={S.statLbl}>G検定</div>
            </div>
          </div>
          {/* Progress bar */}
          <div style={S.bar}><div style={S.barFill((doneTasks / tasks.length) * 100)} /></div>
          <div style={S.barLbl}><span>今日の進捗</span><span style={{ color: "#fff", fontWeight: 700 }}>{doneTasks}/{tasks.length}</span></div>

          {/* Tasks */}
          <div style={S.sLabel}>📋 今日のタスク</div>
          <div style={S.taskList}>
            {tasks.map(t => (
              <div key={t.id} style={S.taskItem(t.done)} onClick={() => toggleTask(t.id)}>
                <div style={S.chk(t.done)}>{t.done && "✓"}</div>
                <div style={{ flex: 1 }}>
                  <div style={S.taskTime}>{t.time}</div>
                  <div style={S.taskLbl(t.done)}>{t.label}</div>
                  <span style={S.catBadge(t.cat)}>{t.cat}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Memo */}
          <div style={S.memoBox}>
            <div style={{ fontSize: 9, color: "#444", marginBottom: 4, letterSpacing: 1, textTransform: "uppercase" }}>📝 今日のメモ（Git logに記録）</div>
            <textarea
              style={S.memoInput}
              value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="気づき・詰まったこと・SIer経験との接点など..."
              rows={2}
            />
          </div>

          {/* Exam countdown */}
          <div style={S.examCard}>
            <div style={S.examLabel}>G検定カウントダウン</div>
            <div style={S.examDays}>{daysToExam}<span style={{ fontSize: 12, color: "#888", marginLeft: 4 }}>days</span></div>
            <div style={S.examSub}>2026年5月9日（土）</div>
          </div>

          {/* GitHub status */}
          {ghStatus && (
            <div style={S.ghStatus(ghStatus === "success" ? "success" : ghStatus === "pushing" ? "pushing" : "error")}>
              {ghStatus === "pushing" && "⏳ GitHubにプッシュ中..."}
              {ghStatus === "success" && `✅ daily-log/2026-03/${logFileName} に記録完了`}
              {ghStatus !== "pushing" && ghStatus !== "success" && `❌ ${ghStatus}`}
            </div>
          )}

          {/* Checkin button */}
          <button style={S.checkinBtn(checkinDone || loading)} onClick={handleCheckin} disabled={checkinDone || loading}>
            {checkinDone ? "✅ 本日のチェックイン完了" : ghPat ? "📊 報告 + GitHubに記録" : "📊 今日の達成を報告"}
          </button>
        </div>

        {/* RIGHT PANEL */}
        <div style={S.right}>
          {view === "roadmap" && renderRoadmap()}
          {view === "services" && renderServices()}
          {view === "dashboard" && (
            <div style={S.dash}>
              <div style={S.dashH}>Phase 1 — 今週のリズム</div>
              <div style={S.grid2}>
                {[
                  ["平日 朝（30分）", "#38bdf8", "G検定アプリ10問 + X投稿（学習ログ）"],
                  ["平日 夜（60〜90分）", "#8b5cf6", "Anthropic Academy / API実装 / CrewAI入門"],
                  ["土曜（3〜4時間）", "#4ade80", "まとまった実装 + Zenn記事下書き + 身内ヒアリング"],
                  ["日曜（2〜3時間）", "#f97316", "週次振り返り + 翌週計画 + GitHubコミット確認"],
                ].map(([l, c, t]) => (
                  <div key={l} style={S.dayCard(c)}>
                    <div style={S.dayLbl(c)}>{l}</div>
                    <div style={S.dayText}>{t}</div>
                  </div>
                ))}
              </div>

              <div style={S.dashH}>今月末の達成ゴール（3月）</div>
              <div style={{ maxWidth: 660, background: "#0e0e1c", border: "1px solid #7c3aed", borderRadius: 8, padding: "14px 18px", marginBottom: 20 }}>
                {[
                  ["✅", "Hello World APIが動いている（Anthropic API）", "#4ade80"],
                  ["🎯", "G検定の学習習慣が定着している（毎日10問）", "#f97316"],
                  ["📣", "X発信を10回以上している", "#818cf8"],
                  ["★", "CrewAIチュートリアルを1つ動かした（マルチエージェント入門）", "#c084fc"],
                ].map(([icon, text, color]) => (
                  <div key={text} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid #1a1a2a" }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{icon}</span>
                    <span style={{ fontSize: 12, color: "#aaa" }}>{text}</span>
                  </div>
                ))}
              </div>

              <div style={S.dashH}>戦略メモ（v5 重要決定）</div>
              <div style={{ maxWidth: 660, display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "One-Coreアーキテクチャ", text: "バックエンド1つ、LP/プロンプトだけ業界別に差し替え。マルチプロダクトは確実な死。", color: "#4ade80" },
                  { label: "受託ルール", text: "プロンプト/テンプレートのカスタマイズは可、コードカスタマイズは不可のライン。受託で蓄積するのはコードではなく業務パターンのドキュメント。", color: "#38bdf8" },
                  { label: "Phase 2は2本柱", text: "SIer特化 + 身内コネクション1業界のみ。3業界同時は「確実な死」（Gemini指摘）。", color: "#f97316" },
                  { label: "個人が狙う層", text: "業界特化業務知識パック・レガシー接続アダプター・人間の承認UI・エージェントSLA定義ツール。大手が絶対やらない泥臭い領域。", color: "#c084fc" },
                ].map(d => (
                  <div key={d.label} style={{ background: "#0e0e1c", border: `1px solid #1a1a2a`, borderLeft: `3px solid ${d.color}`, borderRadius: 7, padding: "10px 14px" }}>
                    <div style={{ fontSize: 10, color: d.color, fontWeight: 700, marginBottom: 4, letterSpacing: 0.5 }}>{d.label}</div>
                    <div style={{ fontSize: 11.5, color: "#888", lineHeight: 1.6 }}>{d.text}</div>
                  </div>
                ))}
              </div>

              {/* GitHub info */}
              <div style={{ maxWidth: 660, marginTop: 20, background: "#0a0a14", border: "1px solid #1a1a2a", borderRadius: 8, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", marginBottom: 8 }}>📁 GitHub daily-log 連携</div>
                <div style={{ fontSize: 11, color: "#666", lineHeight: 1.7 }}>
                  リポジトリ: <code style={{ color: "#a78bfa", fontSize: 10 }}>Toshio1077/ai-learning-journey</code><br />
                  記録先: <code style={{ color: "#a78bfa", fontSize: 10 }}>daily-log/2026-03/{logFileName}</code><br />
                  {ghPat
                    ? <span style={{ color: "#4ade80" }}>✓ PAT設定済み。チェックインボタンで自動コミットされます。</span>
                    : <span>右上の「⚙️ GitHub設定」からPATを設定するとチェックイン時に自動コミットされます。</span>
                  }
                </div>
              </div>
            </div>
          )}
          {view === "chat" && (
            <>
              <div style={S.chatMsgs}>
                {messages.map((m, i) => (
                  <div key={i} style={S.bubble(m.role)}>
                    <div style={S.bubbleName(m.role)}>{m.role === "assistant" ? "🤖 総合メンター (v5)" : "👤 あなた"}</div>
                    {renderMd(m.text)}
                  </div>
                ))}
                {loading && (
                  <div style={S.bubble("assistant")}>
                    <div style={S.bubbleName("assistant")}>🤖 総合メンター (v5)</div>
                    <div style={S.loadRow}>{[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#7c3aed", animation: `pulse 0.9s ${i*0.2}s infinite` }} />)}</div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div style={S.inputRow}>
                <textarea
                  style={S.textarea}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="質問・相談・今日の報告など（Enterで送信、Shift+Enterで改行）"
                  rows={2}
                />
                <button style={S.sendBtn} onClick={() => sendMessage()} disabled={loading}>送信</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}