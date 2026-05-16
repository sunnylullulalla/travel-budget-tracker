import { useState, useEffect, useCallback, useRef } from "react";

const CONFIG_KEY = "tbv3-config";
const DAYS_KEY_PREFIX = "tbv3-days-";

const CURRENCIES = [
  { code: "EUR", symbol: "€", label: "유로 (EUR)" },
  { code: "USD", symbol: "$", label: "달러 (USD)" },
  { code: "KRW", symbol: "₩", label: "원 (KRW)" },
  { code: "JPY", symbol: "¥", label: "엔 (JPY)" },
  { code: "GBP", symbol: "£", label: "파운드 (GBP)" },
  { code: "CNY", symbol: "¥", label: "위안 (CNY)" },
  { code: "THB", symbol: "฿", label: "바트 (THB)" },
  { code: "VND", symbol: "₫", label: "동 (VND)" },
  { code: "AUD", symbol: "A$", label: "호주달러 (AUD)" },
  { code: "CAD", symbol: "C$", label: "캐나다달러 (CAD)" },
  { code: "CHF", symbol: "Fr", label: "스위스프랑 (CHF)" },
  { code: "HKD", symbol: "HK$", label: "홍콩달러 (HKD)" },
  { code: "SGD", symbol: "S$", label: "싱가포르달러 (SGD)" },
  { code: "MXN", symbol: "$", label: "멕시코페소 (MXN)" },
  { code: "TRY", symbol: "₺", label: "터키리라 (TRY)" },
];


const LANGUAGES = [
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
];

const T = {
  ko: {
    appTitle: "여행 예산 관리",
    appSubtitle: "여행 정보를 입력하고 시작하세요",
    tripDays: "여행 일수",
    tripDaysPlaceholder: "예: 11",
    tripDaysUnit: "일",
    dailyBudget: "하루 평균 예산",
    dailyBudgetPlaceholder: "예: 120",
    totalBudgetPreview: (sym, total, days, daily) => `총 예산 ${sym}${total} (${days}일 × ${sym}${daily})`,
    inputMode: "입력 방식",
    modeTotal: "💳 총액만",
    modePreset: "📋 항목별",
    modeTotalDesc: "하루 지출을 숫자 하나로 간단하게 기록해요.",
    language: "언어",
    start: "시작하기 →",
    newItem: "새 항목",
    maxItems: "최대 7개",
    editItems: "항목 편집",
    saveItems: "저장",
    deleteWarning: "⚠ 항목을 삭제하면 해당 항목에 입력된 금액이 사라집니다.",
    budget: "여행 예산",
    saving: "저장 중…",
    saved: "✓ 저장됨",
    saveError: "저장 실패",
    reset: "재설정",
    remaining: "잔여",
    used: "사용",
    budgetLabel: "예산",
    editCats: "항목 편집",
    memo: "메모 (선택)",
    cumulative: (n) => `Day ${n}까지 누적`,
    slack: "여유",
    over: "초과",
    total: "합계",
    cumulativeDelta: "누적±",
    summaryTitle: "전체 일정 요약",
    grandTotal: "총 지출",
    dailyGoal: (sym, budget, days) => `하루 평균 목표 · ${sym}${budget} · ${days}일`,
    loading: "불러오는 중…",
    errorDays: "여행 일수를 1~60일 사이로 입력해주세요.",
    errorBudget: "하루 예산을 입력해주세요.",
    errorCats: "항목을 최소 1개 추가해주세요.",
    presetDining: "외식", presetTransport: "교통", presetActivity: "관광", presetShopping: "쇼핑",
    totalCatLabel: "지출",
  },
  en: {
    appTitle: "Travel Budget",
    appSubtitle: "Enter your trip info to get started",
    tripDays: "Trip Duration",
    tripDaysPlaceholder: "e.g. 11",
    tripDaysUnit: "days",
    dailyBudget: "Daily Budget",
    dailyBudgetPlaceholder: "e.g. 120",
    totalBudgetPreview: (sym, total, days, daily) => `Total ${sym}${total} (${days} days × ${sym}${daily})`,
    inputMode: "Tracking Mode",
    modeTotal: "💳 Total only",
    modePreset: "📋 By category",
    modeTotalDesc: "Log each day as a single number. Simple.",
    language: "Language",
    start: "Get Started →",
    newItem: "New item",
    maxItems: "Max 7",
    editItems: "Edit items",
    saveItems: "Save",
    deleteWarning: "⚠ Deleting a category will remove its recorded amounts.",
    budget: "Travel Budget",
    saving: "Saving…",
    saved: "✓ Saved",
    saveError: "Save failed",
    reset: "Reset",
    remaining: "Left",
    used: "Spent",
    budgetLabel: "budget",
    editCats: "Edit",
    memo: "Note (optional)",
    cumulative: (n) => `Cumulative through Day ${n}`,
    slack: "Under",
    over: "Over",
    total: "Total",
    cumulativeDelta: "Cum±",
    summaryTitle: "Full Trip Summary",
    grandTotal: "Total spent",
    dailyGoal: (sym, budget, days) => `Daily goal · ${sym}${budget} · ${days} days`,
    loading: "Loading…",
    errorDays: "Please enter trip duration between 1 and 60 days.",
    errorBudget: "Please enter a daily budget.",
    errorCats: "Please add at least one category.",
    presetDining: "Dining", presetTransport: "Transit", presetActivity: "Sights", presetShopping: "Shopping",
    totalCatLabel: "Expense",
  },
  ja: {
    appTitle: "旅行予算管理",
    appSubtitle: "旅行情報を入力して始めましょう",
    tripDays: "旅行日数",
    tripDaysPlaceholder: "例: 11",
    tripDaysUnit: "日",
    dailyBudget: "1日の平均予算",
    dailyBudgetPlaceholder: "例: 120",
    totalBudgetPreview: (sym, total, days, daily) => `合計 ${sym}${total}（${days}日 × ${sym}${daily}）`,
    inputMode: "入力方式",
    modeTotal: "💳 合計のみ",
    modePreset: "📋 項目別",
    modeTotalDesc: "1日の支出をひとつの数字でシンプルに記録。",
    language: "言語",
    start: "始める →",
    newItem: "新しい項目",
    maxItems: "最大7つ",
    editItems: "項目を編集",
    saveItems: "保存",
    deleteWarning: "⚠ 項目を削除すると、入力された金額も削除されます。",
    budget: "旅行予算",
    saving: "保存中…",
    saved: "✓ 保存済み",
    saveError: "保存失敗",
    reset: "リセット",
    remaining: "残り",
    used: "使用",
    budgetLabel: "予算",
    editCats: "編集",
    memo: "メモ（任意）",
    cumulative: (n) => `Day ${n}までの累計`,
    slack: "余裕",
    over: "超過",
    total: "合計",
    cumulativeDelta: "累計±",
    summaryTitle: "全日程サマリー",
    grandTotal: "総支出",
    dailyGoal: (sym, budget, days) => `1日平均目標 · ${sym}${budget} · ${days}日`,
    loading: "読み込み中…",
    errorDays: "旅行日数を1〜60日の間で入力してください。",
    errorBudget: "1日の予算を入力してください。",
    errorCats: "項目を1つ以上追加してください。",
    presetDining: "食事", presetTransport: "交通", presetActivity: "観光", presetShopping: "買物",
    totalCatLabel: "支出",
  },
  zh: {
    appTitle: "旅行预算管理",
    appSubtitle: "输入旅行信息，开始记账",
    tripDays: "旅行天数",
    tripDaysPlaceholder: "例: 11",
    tripDaysUnit: "天",
    dailyBudget: "每日平均预算",
    dailyBudgetPlaceholder: "例: 120",
    totalBudgetPreview: (sym, total, days, daily) => `总预算 ${sym}${total}（${days}天 × ${sym}${daily}）`,
    inputMode: "记录方式",
    modeTotal: "💳 仅总额",
    modePreset: "📋 按类别",
    modeTotalDesc: "每天只记一个数字，简单方便。",
    language: "语言",
    start: "开始 →",
    newItem: "新类别",
    maxItems: "最多7个",
    editItems: "编辑类别",
    saveItems: "保存",
    deleteWarning: "⚠ 删除类别后，该类别的金额记录也将消失。",
    budget: "旅行预算",
    saving: "保存中…",
    saved: "✓ 已保存",
    saveError: "保存失败",
    reset: "重置",
    remaining: "剩余",
    used: "已用",
    budgetLabel: "预算",
    editCats: "编辑",
    memo: "备注（可选）",
    cumulative: (n) => `第${n}天累计`,
    slack: "结余",
    over: "超支",
    total: "合计",
    cumulativeDelta: "累计±",
    summaryTitle: "全程汇总",
    grandTotal: "总支出",
    dailyGoal: (sym, budget, days) => `每日目标 · ${sym}${budget} · ${days}天`,
    loading: "加载中…",
    errorDays: "请输入1到60天的旅行天数。",
    errorBudget: "请输入每日预算。",
    errorCats: "请至少添加一个类别。",
    presetDining: "餐饮", presetTransport: "交通", presetActivity: "观光", presetShopping: "购物",
    totalCatLabel: "支出",
  },
  es: {
    appTitle: "Presupuesto de Viaje",
    appSubtitle: "Introduce los datos de tu viaje para empezar",
    tripDays: "Duración del viaje",
    tripDaysPlaceholder: "ej: 11",
    tripDaysUnit: "días",
    dailyBudget: "Presupuesto diario",
    dailyBudgetPlaceholder: "ej: 120",
    totalBudgetPreview: (sym, total, days, daily) => `Total ${sym}${total} (${days} días × ${sym}${daily})`,
    inputMode: "Modo de registro",
    modeTotal: "💳 Solo total",
    modePreset: "📋 Por categoría",
    modeTotalDesc: "Registra el gasto diario con un único número.",
    language: "Idioma",
    start: "Comenzar →",
    newItem: "Nueva categoría",
    maxItems: "Máx. 7",
    editItems: "Editar categorías",
    saveItems: "Guardar",
    deleteWarning: "⚠ Eliminar una categoría borrará sus importes registrados.",
    budget: "Presupuesto",
    saving: "Guardando…",
    saved: "✓ Guardado",
    saveError: "Error al guardar",
    reset: "Reiniciar",
    remaining: "Restante",
    used: "Gastado",
    budgetLabel: "presup.",
    editCats: "Editar",
    memo: "Nota (opcional)",
    cumulative: (n) => `Acumulado hasta el día ${n}`,
    slack: "Ahorro",
    over: "Exceso",
    total: "Total",
    cumulativeDelta: "Acum±",
    summaryTitle: "Resumen del viaje",
    grandTotal: "Total gastado",
    dailyGoal: (sym, budget, days) => `Meta diaria · ${sym}${budget} · ${days} días`,
    loading: "Cargando…",
    errorDays: "Introduce una duración entre 1 y 60 días.",
    errorBudget: "Introduce un presupuesto diario.",
    errorCats: "Añade al menos una categoría.",
    presetDining: "Comida", presetTransport: "Transporte", presetActivity: "Ocio", presetShopping: "Compras",
    totalCatLabel: "Gasto",
  },
  fr: {
    appTitle: "Budget Voyage",
    appSubtitle: "Entrez les infos de votre voyage pour commencer",
    tripDays: "Durée du voyage",
    tripDaysPlaceholder: "ex : 11",
    tripDaysUnit: "jours",
    dailyBudget: "Budget journalier moyen",
    dailyBudgetPlaceholder: "ex : 120",
    totalBudgetPreview: (sym, total, days, daily) => `Budget total ${sym}${total} (${days} j × ${sym}${daily})`,
    inputMode: "Mode de saisie",
    modeTotal: "💳 Total seul",
    modePreset: "📋 Par catégorie",
    modeTotalDesc: "Enregistrez chaque journée avec un seul chiffre.",
    language: "Langue",
    start: "Commencer →",
    newItem: "Nouvelle catégorie",
    maxItems: "Max 7",
    editItems: "Modifier les catégories",
    saveItems: "Enregistrer",
    deleteWarning: "⚠ Supprimer une catégorie effacera les montants saisis.",
    budget: "Budget voyage",
    saving: "Enregistrement…",
    saved: "✓ Enregistré",
    saveError: "Échec de l'enregistrement",
    reset: "Réinitialiser",
    remaining: "Restant",
    used: "Dépensé",
    budgetLabel: "budget",
    editCats: "Modifier",
    memo: "Note (facultatif)",
    cumulative: (n) => `Cumul jusqu'au jour ${n}`,
    slack: "Économie",
    over: "Dépassement",
    total: "Total",
    cumulativeDelta: "Cum±",
    summaryTitle: "Récapitulatif du voyage",
    grandTotal: "Total dépensé",
    dailyGoal: (sym, budget, days) => `Objectif quotidien · ${sym}${budget} · ${days} jours`,
    loading: "Chargement…",
    errorDays: "Entrez une durée entre 1 et 60 jours.",
    errorBudget: "Entrez un budget journalier.",
    errorCats: "Ajoutez au moins une catégorie.",
    presetDining: "Repas", presetTransport: "Transport", presetActivity: "Loisirs", presetShopping: "Achats",
    totalCatLabel: "Dépense",
  },
};


const getPresetCats = (lang) => {
  const t = T[lang] || T.ko;
  return [
    { id: "dining",    label: t.presetDining,    icon: "🍽", color: "#E8845A" },
    { id: "transport", label: t.presetTransport,  icon: "🚌", color: "#7EB5D6" },
    { id: "activity",  label: t.presetActivity,   icon: "🎭", color: "#6DB88A" },
    { id: "shopping",  label: t.presetShopping,   icon: "🛍", color: "#F2C46D" },
  ];
};

const PRESET_CATEGORIES = [
  { id: "dining",    label: "외식",   icon: "🍽", color: "#E8845A" },
  { id: "transport", label: "교통",   icon: "🚌", color: "#7EB5D6" },
  { id: "activity",  label: "관광",   icon: "🎭", color: "#6DB88A" },
  { id: "shopping",  label: "쇼핑",   icon: "🛍", color: "#F2C46D" },
];

const CAT_COLORS = ["#E8845A","#F2C46D","#6DB88A","#7EB5D6","#C97DB5","#E06060","#A0C4A0","#D4A96A","#7ABFBF","#B0A0D0"];
const CAT_ICONS  = ["🍽","☕","🛒","🔒","🚗","🎭","🏨","🛍","💊","📸","🍺","🎯"];

const genId = () => Math.random().toString(36).slice(2, 8);

// Compact number for table cells: keeps to ~4 chars max
// e.g. 1234 → "1234", 12345 → "12K", 123456 → "123K", 1234567 → "1.2M"
const fmtCompact = (n) => {
  if (n === 0) return "·";
  if (n < 10000) return n.toLocaleString();
  if (n < 1000000) return Math.round(n / 1000) + "K";
  return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
};



const makeDay = (n, cats) => {
  const obj = { day: n, note: "" };
  cats.forEach(c => { obj[c.id] = ""; });
  return obj;
};
const makeDays = (n, cats) => Array.from({ length: n }, (_, i) => makeDay(i + 1, cats));

const inputBase = {
  background: "#0F0E0C", border: "1px solid #2A2822", borderRadius: 10,
  color: "#F0EDE6", fontSize: 18, padding: "14px 16px", outline: "none",
  fontFamily: "Georgia, serif", boxSizing: "border-box",
};
const focusOrange = (e) => e.target.style.borderColor = "#E8845A";
const blurGray    = (e) => e.target.style.borderColor = "#2A2822";

const Pill = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    padding: "9px 16px", borderRadius: 20, cursor: "pointer", fontSize: 13,
    fontFamily: "Georgia, serif", transition: "all 0.15s",
    background: active ? "#F0EDE6" : "#1A1814",
    color: active ? "#0F0E0C" : "#8A8070",
    border: active ? "none" : "1px solid #2A2822",
    fontWeight: active ? "bold" : "normal",
  }}>{children}</button>
);

// ── SetupScreen ───────────────────────────────────────────────────────────────
function SetupScreen({ onStart, prevConfig, isReset }) {
  const [tripDays, setTripDays] = useState(prevConfig ? String(prevConfig.tripDays) : "");
  const [dailyBudget, setDailyBudget] = useState(prevConfig ? String(prevConfig.dailyBudget) : "");
  const [currency, setCurrency] = useState(prevConfig ? prevConfig.currency : "EUR");
  const [mode, setMode] = useState(prevConfig ? prevConfig.mode : "preset");
  const [cats, setCats] = useState(prevConfig ? prevConfig.cats.map(c => ({ ...c })) : getPresetCats(prevConfig ? (prevConfig.lang || "ko") : "ko"));
  const [newLabel, setNewLabel] = useState("");
  const [lang, setLang] = useState(prevConfig ? (prevConfig.lang || "ko") : "ko");
  const [error, setError] = useState("");

  // Retranslate preset category labels when language changes
  const PRESET_IDS = ["dining", "transport", "activity", "shopping"];
  const handleLangChange = (newLang) => {
    setLang(newLang);
    setCats(prev => {
      const newPreset = getPresetCats(newLang);
      return prev.map(cat => {
        const preset = newPreset.find(p => p.id === cat.id);
        // Only retranslate if it's a preset id (user-added custom items keep their label)
        return preset && PRESET_IDS.includes(cat.id) ? { ...cat, label: preset.label } : cat;
      });
    });
  };
  const addInputRef = useRef(null);

  const t = T[lang] || T.ko;
  const curr = CURRENCIES.find(c => c.code === currency);

  const removeCat = (id) => { if (cats.length > 1) setCats(p => p.filter(c => c.id !== id)); };
  const updateCatBudget = (id, val) => setCats(p => p.map(c => c.id === id ? { ...c, budget: val } : c));

  const addCat = () => {
    const label = newLabel.trim();
    if (!label || cats.length >= 7) return;
    const idx = cats.length % CAT_COLORS.length;
    setCats(p => [...p, { id: genId(), label, icon: CAT_ICONS[idx], color: CAT_COLORS[idx] }]);
    setNewLabel("");
    addInputRef.current?.focus();
  };

  const handleStart = () => {
    const d = parseInt(tripDays), b = parseFloat(dailyBudget);
    if (!d || d < 1 || d > 60) { setError(t.errorDays); return; }
    if (!b || b <= 0) { setError(t.errorBudget); return; }
    if (mode === "preset" && cats.length === 0) { setError(t.errorCats); return; }
    const finalCats = mode === "total"
      ? [{ id: "total", label: t.totalCatLabel, icon: "💳", color: "#E8845A" }]
      : cats;
    onStart({ tripDays: d, dailyBudget: b, currency, mode, cats: finalCats, lang });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0F0E0C", color: "#F0EDE6", fontFamily: "Georgia, serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#E8845A,#7EB5D6)", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>✈</div>
          <h1 style={{ fontSize: 22, fontWeight: "normal", margin: "0 0 6px", letterSpacing: "-0.02em" }}>{t.appTitle}</h1>
          <p style={{ fontSize: 13, color: "#6A6050", margin: 0 }}>{t.appSubtitle}</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Days */}
          <div>
            <label style={{ fontSize: 11, color: "#8A8070", letterSpacing: "0.15em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>{t.tripDays}</label>
            <div style={{ position: "relative" }}>
              <input type="number" placeholder={t.tripDaysPlaceholder} value={tripDays} min={1} max={60}
                onChange={e => { setTripDays(e.target.value); setError(""); }}
                style={{ ...inputBase, width: "100%", paddingRight: 44 }}
                onFocus={focusOrange} onBlur={blurGray} />
              <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#6A6050" }}>{t.tripDaysUnit}</span>
            </div>
          </div>

          {/* Budget + currency */}
          <div>
            <label style={{ fontSize: 11, color: "#8A8070", letterSpacing: "0.15em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>{t.dailyBudget}</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="number" placeholder={t.dailyBudgetPlaceholder} value={dailyBudget} min={1}
                onChange={e => { setDailyBudget(e.target.value); setError(""); }}
                style={{ ...inputBase, flex: 1, minWidth: 0 }}
                onFocus={focusOrange} onBlur={blurGray} />
              <select value={currency} onChange={e => setCurrency(e.target.value)} style={{
                ...inputBase, width: 116, flexShrink: 0, fontSize: 14,
                padding: "14px 28px 14px 10px", cursor: "pointer", appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238A8070' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center",
              }}>
                {CURRENCIES.map(c => <option key={c.code} value={c.code} style={{ background: "#1A1814" }}>{c.symbol} {c.code}</option>)}
              </select>
            </div>
            {dailyBudget && tripDays && !isNaN(parseFloat(dailyBudget)) && !isNaN(parseInt(tripDays)) && (
              <p style={{ fontSize: 12, color: "#6DB88A", margin: "8px 0 0" }}>
                {t.totalBudgetPreview(curr.symbol, (parseFloat(dailyBudget) * parseInt(tripDays)).toLocaleString(), tripDays, parseFloat(dailyBudget).toLocaleString())}
              </p>
            )}
          </div>

          {/* Mode selector */}
          <div>
            <label style={{ fontSize: 11, color: "#8A8070", letterSpacing: "0.15em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>{t.inputMode}</label>
            <div style={{ display: "flex", gap: 8 }}>
              <Pill active={mode === "total"}  onClick={() => setMode("total")}>{t.modeTotal}</Pill>
              <Pill active={mode === "preset"} onClick={() => setMode("preset")}>{t.modePreset}</Pill>
            </div>

            {mode === "total" && (
              <p style={{ fontSize: 12, color: "#6A6050", margin: "12px 0 0", lineHeight: 1.6 }}>{t.modeTotalDesc}</p>
            )}

            {mode === "preset" && (() => {
              const allocTotal = cats.reduce((s, c) => s + (parseFloat(c.budget) || 0), 0);
              const allocRemaining = parseFloat(dailyBudget) - allocTotal;
              const allocOver = allocTotal > parseFloat(dailyBudget);
              const allocExact = dailyBudget && allocTotal === parseFloat(dailyBudget);
              const hasAnyBudget = cats.some(c => c.budget);
              return (
              <div style={{ marginTop: 14 }}>
                {/* Category rows */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                  {/* Column headers */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 4, borderBottom: "1px solid #2A2822" }}>
                    <span style={{ flex: 1, fontSize: 10, color: "#6A6050", letterSpacing: "0.1em", textTransform: "uppercase" }}>항목</span>
                    <span style={{ fontSize: 10, color: "#6A6050", letterSpacing: "0.1em", textTransform: "uppercase", width: 100, textAlign: "right" }}>예산 (선택)</span>
                    <span style={{ width: 20 }} />
                  </div>

                  {cats.map(cat => {
                    const val = parseFloat(cat.budget) || 0;
                    const catPct = dailyBudget ? Math.min((val / parseFloat(dailyBudget)) * 100, 100) : 0;
                    return (
                      <div key={cat.id}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{
                            flex: 1, display: "inline-flex", alignItems: "center", gap: 5,
                            background: "#1A1814", border: "1px solid #2A2822",
                            borderRadius: 20, padding: "6px 12px",
                            fontSize: 13, color: "#C0B8A8", minWidth: 0,
                          }}>
                            <span style={{ fontSize: 14, flexShrink: 0 }}>{cat.icon}</span>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat.label}</span>
                          </span>
                          <div style={{ display: "flex", alignItems: "center", background: "#0F0E0C", border: `1px solid ${val > 0 ? cat.color + "55" : "#2A2822"}`, borderRadius: 10, overflow: "hidden", width: 100, flexShrink: 0 }}>
                            <input
                              type="number" placeholder="—" min={0}
                              value={cat.budget || ""}
                              onChange={e => updateCatBudget(cat.id, e.target.value)}
                              style={{
                                flex: 1, background: "transparent", border: "none", outline: "none",
                                color: val > 0 ? "#F0EDE6" : "#4A4840", fontSize: 13,
                                fontFamily: "monospace", padding: "7px 6px 7px 10px", width: 0,
                              }}
                            />
                            <span style={{ fontSize: 11, color: "#4A4840", paddingRight: 8, flexShrink: 0 }}>{curr ? curr.symbol : ""}</span>
                          </div>
                          {cats.length > 1 && (
                            <button onClick={() => removeCat(cat.id)} style={{
                              background: "none", border: "none", color: "#6A6050",
                              cursor: "pointer", fontSize: 16, lineHeight: 1,
                              padding: "0", width: 20, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                            }}>×</button>
                          )}
                        </div>
                        {val > 0 && (
                          <div style={{ marginTop: 4, marginLeft: 2, height: 2, background: "#1E1C18", borderRadius: 2, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${catPct}%`, background: cat.color, borderRadius: 2, transition: "width 0.25s ease" }} />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Add row */}
                  {cats.length < 7 ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, display: "inline-flex", alignItems: "center", background: "#1A1814", border: "1px dashed #3A3830", borderRadius: 20, overflow: "hidden" }}>
                        <input
                          ref={addInputRef}
                          type="text" placeholder={t.newItem} value={newLabel}
                          onChange={e => setNewLabel(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") addCat(); }}
                          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#C0B8A8", fontSize: 13, fontFamily: "Georgia, serif", padding: "6px 4px 6px 14px" }}
                        />
                        <button onClick={addCat} style={{ background: "none", border: "none", color: "#8A8070", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "4px 10px", display: "flex", alignItems: "center" }}>+</button>
                      </div>
                      <span style={{ width: 100, flexShrink: 0 }} />
                      <span style={{ width: 20, flexShrink: 0 }} />
                    </div>
                  ) : (
                    <span style={{ fontSize: 11, color: "#6A6050", padding: "6px 12px", background: "#1A1814", border: "1px solid #2A2822", borderRadius: 20, alignSelf: "flex-start" }}>{t.maxItems}</span>
                  )}
                </div>

                {/* Allocation summary bar — only shown if any budget entered AND dailyBudget set */}
                {hasAnyBudget && dailyBudget && (
                  <div style={{
                    background: allocOver ? "#1A1414" : "#141A16",
                    border: `1px solid ${allocOver ? "#3A2020" : allocExact ? "#1E4020" : "#1E2A20"}`,
                    borderRadius: 12, padding: "12px 14px",
                  }}>
                    {/* Stacked bar */}
                    <div style={{ height: 5, background: "#1E1C18", borderRadius: 4, overflow: "hidden", marginBottom: 10, display: "flex" }}>
                      {cats.map(cat => {
                        const v = parseFloat(cat.budget) || 0;
                        const w = Math.min((v / parseFloat(dailyBudget)) * 100, 100);
                        return w > 0 ? <div key={cat.id} style={{ width: `${w}%`, height: "100%", background: cat.color, transition: "width 0.25s ease" }} /> : null;
                      })}
                    </div>
                    {/* Numbers */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 10, color: "#8A8070" }}>배분 합계</p>
                        <p style={{ margin: "2px 0 0", fontSize: 16, fontFamily: "monospace", fontWeight: "bold", color: allocOver ? "#E06060" : "#F0EDE6" }}>
                          {curr ? curr.symbol : ""}{allocTotal.toLocaleString()}
                          <span style={{ fontSize: 12, color: "#4A4840", fontWeight: "normal" }}> / {curr ? curr.symbol : ""}{parseFloat(dailyBudget).toLocaleString()}</span>
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        {allocOver ? (
                          <>
                            <p style={{ margin: 0, fontSize: 10, color: "#E06060" }}>초과</p>
                            <p style={{ margin: "2px 0 0", fontSize: 14, fontFamily: "monospace", color: "#E06060", fontWeight: "bold" }}>+{curr ? curr.symbol : ""}{Math.abs(allocRemaining).toLocaleString()}</p>
                          </>
                        ) : allocExact ? (
                          <>
                            <p style={{ margin: 0, fontSize: 10, color: "#6DB88A" }}>딱 맞아요</p>
                            <p style={{ margin: "2px 0 0", fontSize: 16 }}>👍</p>
                          </>
                        ) : (
                          <>
                            <p style={{ margin: 0, fontSize: 10, color: "#6DB88A" }}>잔여 배분</p>
                            <p style={{ margin: "2px 0 0", fontSize: 14, fontFamily: "monospace", color: "#6DB88A", fontWeight: "bold" }}>{curr ? curr.symbol : ""}{allocRemaining.toLocaleString()}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              );
            })()}
          </div>

          {/* Language dropdown — only on first setup */}
          {!isReset && (
          <div>
            <label style={{ fontSize: 11, color: "#8A8070", letterSpacing: "0.15em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>{t.language}</label>
            <select value={lang} onChange={e => handleLangChange(e.target.value)} style={{
              ...inputBase, width: "100%", fontSize: 14,
              padding: "14px 28px 14px 16px", cursor: "pointer", appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238A8070' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
            }}>
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code} style={{ background: "#1A1814" }}>
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
          </div>
          )}

          {error && (
            <p style={{ fontSize: 12, color: "#E06060", margin: 0, padding: "10px 14px", background: "#1A1414", borderRadius: 8, border: "1px solid #301E1E" }}>{error}</p>
          )}

          <button onClick={handleStart} style={{
            marginTop: 4, padding: "16px",
            background: "linear-gradient(135deg,#E8845A,#7EB5D6)",
            border: "none", borderRadius: 12, color: "#0F0E0C",
            fontSize: 16, fontFamily: "Georgia, serif", fontWeight: "bold", cursor: "pointer",
          }}
            onMouseEnter={e => e.target.style.opacity = "0.85"}
            onMouseLeave={e => e.target.style.opacity = "1"}>
            {t.start}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CategoryEditor (bottom sheet) ───────────────────────────────────────────────────────────────
function CategoryEditor({ cats, onSave, onClose, t, sym }) {
  const [draft, setDraft] = useState(cats.map(c => ({ ...c })));
  const [newLabel, setNewLabel] = useState("");
  const addRef = useRef(null);

  const remove = (id) => { if (draft.length > 1) setDraft(p => p.filter(c => c.id !== id)); };
  const updateBudget = (id, val) => setDraft(p => p.map(c => c.id === id ? { ...c, budget: val } : c));
  const addCat = () => {
    const label = newLabel.trim();
    if (!label || draft.length >= 7) return;
    const idx = draft.length % CAT_COLORS.length;
    setDraft(p => [...p, { id: genId(), label, icon: CAT_ICONS[idx], color: CAT_COLORS[idx], budget: "" }]);
    setNewLabel("");
    addRef.current?.focus();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 480, background: "#1A1814", borderRadius: "20px 20px 0 0", padding: "24px 20px 36px", maxHeight: "80vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: "normal" }}>{t.editItems}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#8A8070", fontSize: 22, cursor: "pointer", padding: "4px 8px", lineHeight: 1 }}>×</button>
        </div>

        {/* Row layout with budget */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 6, borderBottom: "1px solid #2A2822" }}>
            <span style={{ flex: 1, fontSize: 10, color: "#6A6050", letterSpacing: "0.1em", textTransform: "uppercase" }}>항목</span>
            <span style={{ fontSize: 10, color: "#6A6050", letterSpacing: "0.1em", textTransform: "uppercase", width: 90, textAlign: "right" }}>예산 (선택)</span>
            <span style={{ width: 20 }} />
          </div>

          {draft.map(cat => {
            const val = parseFloat(cat.budget) || 0;
            return (
              <div key={cat.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    flex: 1, display: "inline-flex", alignItems: "center", gap: 6,
                    background: "#0F0E0C", border: `1px solid ${cat.color}44`,
                    borderRadius: 20, padding: "6px 12px", fontSize: 13, color: "#C0B8A8", minWidth: 0,
                  }}>
                    <span style={{ flexShrink: 0 }}>{cat.icon}</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat.label}</span>
                  </span>
                  <div style={{ display: "flex", alignItems: "center", background: "#0F0E0C", border: `1px solid ${val > 0 ? cat.color + "55" : "#2A2822"}`, borderRadius: 10, overflow: "hidden", width: 90, flexShrink: 0 }}>
                    <input
                      type="number" placeholder="—" min={0}
                      value={cat.budget || ""}
                      onChange={e => updateBudget(cat.id, e.target.value)}
                      style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: val > 0 ? "#F0EDE6" : "#4A4840", fontSize: 13, fontFamily: "monospace", padding: "7px 4px 7px 10px", width: 0 }}
                    />
                    <span style={{ fontSize: 11, color: "#4A4840", paddingRight: 8, flexShrink: 0 }}>{sym}</span>
                  </div>
                  {draft.length > 1 && (
                    <button onClick={() => remove(cat.id)} style={{ background: "none", border: "none", color: "#6A6050", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 0, width: 20, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add row */}
          {draft.length < 7 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1, display: "inline-flex", alignItems: "center", background: "#0F0E0C", border: "1px dashed #3A3830", borderRadius: 20, overflow: "hidden" }}>
                <input
                  ref={addRef}
                  type="text" placeholder={t.newItem} value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addCat(); }}
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#C0B8A8", fontSize: 13, fontFamily: "Georgia, serif", padding: "6px 4px 6px 14px" }}
                />
                <button onClick={addCat} style={{ background: "none", border: "none", color: "#8A8070", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "4px 10px", display: "flex", alignItems: "center" }}>+</button>
              </div>
              <span style={{ width: 90, flexShrink: 0 }} />
              <span style={{ width: 20, flexShrink: 0 }} />
            </div>
          ) : (
            <span style={{ fontSize: 11, color: "#6A6050", padding: "6px 12px", background: "#0F0E0C", border: "1px solid #2A2822", borderRadius: 20, alignSelf: "flex-start" }}>{t.maxItems}</span>
          )}
        </div>

        <p style={{ fontSize: 11, color: "#6A6050", margin: "0 0 16px", lineHeight: 1.6 }}>
          {t.deleteWarning}
        </p>

        <button onClick={() => onSave(draft)} style={{
          width: "100%", padding: "14px",
          background: "linear-gradient(135deg,#E8845A,#7EB5D6)",
          border: "none", borderRadius: 12, color: "#0F0E0C",
          fontSize: 15, fontFamily: "Georgia, serif", fontWeight: "bold", cursor: "pointer",
        }}>{t.saveItems}</button>
      </div>
    </div>
  );
}
// ── Tracker ───────────────────────────────────────────────────────────────────
function Tracker({ config, onReset }) {
  const { tripDays, dailyBudget, currency, mode, lang } = config;
  const t = T[lang] || T.ko;
  const curr = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  const sym = curr.symbol;
  const TOTAL_BUDGET = dailyBudget * tripDays;
  const daysStorageKey = DAYS_KEY_PREFIX + tripDays + "-" + currency;

  const [cats, setCats] = useState(config.cats);
  const [days, setDays] = useState(() => makeDays(tripDays, config.cats));
  const [activeDay, setActiveDay] = useState(1);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(daysStorageKey);
      if (raw) {
        const { savedDays } = JSON.parse(raw);
        // Always use config.cats (reflects latest setup changes incl. budgets)
        // Only restore day amount data
        if (savedDays && savedDays.length === tripDays) setDays(savedDays);
      }
    } catch (e) {}
  }, [daysStorageKey, tripDays]);

  const persist = useCallback((newDays, newCats) => {
    setSaveStatus("saving");
    try {
      localStorage.setItem(daysStorageKey, JSON.stringify({ savedCats: newCats, savedDays: newDays }));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1400);
    } catch (e) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  }, [daysStorageKey]);

  const updateDay = (dayNum, field, value) => {
    setDays(prev => {
      const next = prev.map(d => d.day === dayNum ? { ...d, [field]: value } : d);
      persist(next, cats);
      return next;
    });
  };

  const handleSaveCats = (newCats) => {
    const newDays = days.map(d => {
      const obj = { day: d.day, note: d.note };
      newCats.forEach(c => { obj[c.id] = d[c.id] !== undefined ? d[c.id] : ""; });
      return obj;
    });
    setCats(newCats);
    setDays(newDays);
    persist(newDays, newCats);
    setShowEditor(false);
  };

  const getDayTotal = (d) => cats.reduce((s, c) => s + (parseFloat(d[c.id]) || 0), 0);
  const getCumulative = (n) => days.slice(0, n).reduce((s, d) => s + getDayTotal(d), 0);

  const totalSpent = getCumulative(tripDays);
  const remaining = TOTAL_BUDGET - totalSpent;
  const activeDayData = days.find(d => d.day === activeDay) || days[0];
  const activeDayTotal = getDayTotal(activeDayData);
  const cumulativeAtActive = getCumulative(activeDay);
  const budgetAtActive = dailyBudget * activeDay;
  const delta = budgetAtActive - cumulativeAtActive;
  const gridCols = Math.min(tripDays, 11);
  const isTotal = mode === "total";
  const showCatCols = !isTotal && lang === "ko"; // category breakdown only for Korean

  return (
    <div style={{ minHeight: "100vh", background: "#0F0E0C", color: "#F0EDE6", fontFamily: "Georgia, serif", overflowX: "hidden" }}>
      {showEditor && <CategoryEditor cats={cats} onSave={handleSaveCats} onClose={() => setShowEditor(false)} t={t} sym={sym} />}

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#1A1814,#0F0E0C)", borderBottom: "1px solid #2A2822", padding: "22px 18px 16px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <p style={{ fontSize: 11, letterSpacing: "0.2em", color: "#8A8070", margin: 0, textTransform: "uppercase" }}>{t.budget}</p>
                {saveStatus === "saving" && <span style={{ fontSize: 10, color: "#8A8070" }}>{t.saving}</span>}
                {saveStatus === "saved"  && <span style={{ fontSize: 10, color: "#6DB88A" }}>{t.saved}</span>}
                {saveStatus === "error"  && <span style={{ fontSize: 10, color: "#E06060" }}>{t.saveError}</span>}
              </div>
              <h1 style={{ fontSize: 20, fontWeight: "normal", margin: 0, letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {tripDays}일 · {sym}{TOTAL_BUDGET.toLocaleString()}
                <button onClick={onReset} style={{ fontSize: 10, color: "#6A6050", background: "none", border: "1px solid #2A2822", borderRadius: 6, padding: "2px 8px", cursor: "pointer", fontFamily: "Georgia, serif" }}>{t.reset}</button>
              </h1>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 11, color: "#8A8070", margin: "0 0 3px" }}>{t.remaining}</p>
              <p style={{ fontSize: 20, fontWeight: "bold", margin: 0, color: remaining >= 0 ? "#6DB88A" : "#E06060" }}>
                {remaining >= 0 ? "+" : ""}{remaining.toLocaleString()}<span style={{ fontSize: 11 }}>{sym}</span>
              </p>
            </div>
          </div>
          <div style={{ marginTop: 12, background: "#1E1C18", borderRadius: 4, height: 5, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 4, transition: "width 0.4s ease", width: `${Math.min((totalSpent / TOTAL_BUDGET) * 100, 100)}%`, background: totalSpent > TOTAL_BUDGET ? "linear-gradient(90deg,#E8845A,#E06060)" : "linear-gradient(90deg,#6DB88A,#7EB5D6)" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
            <span style={{ fontSize: 11, color: "#8A8070" }}>{t.used} {sym}{totalSpent.toLocaleString()}</span>
            <span style={{ fontSize: 11, color: "#8A8070" }}>{((totalSpent / TOTAL_BUDGET) * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "16px 14px" }}>
        {/* Day tabs */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gap: 4, marginBottom: 16 }}>
          {days.map(d => {
            const total = getDayTotal(d);
            const hasData = total > 0;
            const over = total > dailyBudget;
            const isActive = d.day === activeDay;
            return (
              <button key={d.day} onClick={() => setActiveDay(d.day)} style={{
                padding: "7px 0", borderRadius: 8, cursor: "pointer",
                background: isActive ? "#F0EDE6" : hasData ? (over ? "#2A1818" : "#141A16") : "#1A1814",
                border: isActive ? "none" : `1px solid ${over && hasData ? "#3A2020" : "#2A2822"}`,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3, transition: "all 0.15s",
              }}>
                <span style={{ fontSize: 11, color: isActive ? "#0F0E0C" : "#8A8070", fontFamily: "monospace" }}>{d.day}</span>
                {hasData && <div style={{ width: 4, height: 4, borderRadius: "50%", background: isActive ? "#0F0E0C" : over ? "#E06060" : "#6DB88A" }} />}
              </button>
            );
          })}
        </div>

        {/* Day panel */}
        <div style={{ background: "#1A1814", border: "1px solid #2A2822", borderRadius: 16, padding: "16px", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: "normal" }}>
              Day {activeDay}
              <span style={{ fontSize: 12, color: "#8A8070", marginLeft: 8 }}>/ {sym}{dailyBudget.toLocaleString()} {t.budgetLabel}</span>
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {!isTotal && (
                <button onClick={() => setShowEditor(true)} style={{ fontSize: 11, color: "#8A8070", background: "none", border: "1px solid #2A2822", borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontFamily: "Georgia, serif" }}>
                  {t.editCats}
                </button>
              )}
              <span style={{ fontSize: 19, fontWeight: "bold", color: activeDayTotal > dailyBudget ? "#E06060" : activeDayTotal > 0 ? "#F0EDE6" : "#4A4840" }}>
                {activeDayTotal > 0 ? activeDayTotal.toLocaleString() : "—"}<span style={{ fontSize: 12, color: "#8A8070" }}>{sym}</span>
              </span>
            </div>
          </div>

          {isTotal ? (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#0F0E0C", borderRadius: 12, padding: "16px 20px", border: "1px solid #2A2822" }}>
                <span style={{ fontSize: 22 }}>💳</span>
                <input type="number" placeholder="0"
                  value={activeDayData["total"] || ""}
                  onChange={e => updateDay(activeDay, "total", e.target.value)}
                  style={{ flex: 1, background: "transparent", border: "none", borderBottom: `1px solid ${activeDayData["total"] ? "#E8845A" : "#2A2822"}`, color: "#F0EDE6", fontSize: 32, fontFamily: "monospace", padding: "4px 0", outline: "none", minWidth: 0 }}
                />
                <span style={{ fontSize: 16, color: "#4A4840" }}>{sym}</span>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: cats.length === 1 ? "1fr" : "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {cats.map(cat => {
                const catBudget = cat.budget ? parseFloat(cat.budget) : null;
                const catSpent = days.reduce((s, d) => s + (parseFloat(d[cat.id]) || 0), 0);
                const catOver = catBudget !== null && catSpent > catBudget;
                return (
                  <div key={cat.id} style={{ background: "#0F0E0C", borderRadius: 10, padding: "11px", border: `1px solid ${catOver ? "#3A2020" : "#2A2822"}` }}>
                    {/* Label + budget badge */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: "#8A8070" }}>{cat.icon} {cat.label}</span>
                      {catBudget !== null && (
                        <span style={{ fontSize: 10, color: catOver ? "#E06060" : "#6A6050", fontFamily: "monospace" }}>
                          {fmtCompact(catBudget)}{sym}
                        </span>
                      )}
                    </div>
                    {/* Mini progress bar if budget set */}
                    {catBudget !== null && (
                      <div style={{ height: 2, background: "#1E1C18", borderRadius: 2, marginBottom: 8, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 2,
                          width: `${Math.min((catSpent / catBudget) * 100, 100)}%`,
                          background: catOver ? "#E06060" : cat.color,
                          transition: "width 0.3s ease",
                        }} />
                      </div>
                    )}
                    {/* Amount input */}
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <input type="number" placeholder="0"
                        value={activeDayData[cat.id] || ""}
                        onChange={e => updateDay(activeDay, cat.id, e.target.value)}
                        style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${activeDayData[cat.id] ? cat.color : "#2A2822"}`, color: "#F0EDE6", fontSize: 20, fontFamily: "monospace", padding: "2px 0", outline: "none" }}
                      />
                      <span style={{ fontSize: 12, color: "#4A4840" }}>{sym}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <input type="text" placeholder={t.memo} value={activeDayData.note}
            onChange={e => updateDay(activeDay, "note", e.target.value)}
            style={{ width: "100%", background: "#0F0E0C", border: "1px solid #2A2822", borderRadius: 8, color: "#8A8070", fontSize: 13, padding: "10px 12px", outline: "none", boxSizing: "border-box", fontFamily: "Georgia, serif" }}
          />
        </div>

        {/* Cumulative */}
        <div style={{ background: delta >= 0 ? "#141A16" : "#1A1414", border: `1px solid ${delta >= 0 ? "#1E3020" : "#301E1E"}`, borderRadius: 12, padding: "12px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, color: "#8A8070" }}>{t.cumulative(activeDay)}</p>
            <p style={{ margin: "4px 0 0", fontSize: 14 }}>
              {t.used} <strong style={{ color: "#F0EDE6" }}>{sym}{cumulativeAtActive.toLocaleString()}</strong>
              <span style={{ color: "#4A4840", margin: "0 5px" }}>/</span>
              {t.budgetLabel} {sym}{budgetAtActive.toLocaleString()}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: 11, color: "#8A8070" }}>{delta >= 0 ? t.slack : t.over}</p>
            <p style={{ margin: "2px 0 0", fontSize: 20, fontWeight: "bold", color: delta >= 0 ? "#6DB88A" : "#E06060" }}>
              {delta >= 0 ? "+" : ""}{delta.toLocaleString()}{sym}
            </p>
          </div>
        </div>

        {/* Summary */}
        <div style={{ background: "#1A1814", border: "1px solid #2A2822", borderRadius: 12, overflow: "hidden" }}>
          {/* Header: label row */}
          <div style={{ display: "flex", alignItems: "center", padding: "7px 10px", borderBottom: "1px solid #2A2822", gap: 3, background: "#141210" }}>
            <span style={{ width: "auto", flexShrink: 0, paddingRight: 4 }} />
            {showCatCols && (
              <div style={{ flex: 1, display: "flex", gap: 3 }}>
                {cats.map(cat => (
                  <span key={cat.id} style={{ flex: 1, fontSize: cats.length >= 6 ? 9 : 10, color: cat.color, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: "0.02em" }}>
                    {cat.label}
                  </span>
                ))}
              </div>
            )}
            <span style={{ fontSize: 9, color: "#8A8070", width: 40, textAlign: "right", flexShrink: 0, letterSpacing: "0.05em" }}>{t.total}</span>
            <span style={{ fontSize: 9, color: "#6A6050", width: 40, textAlign: "right", flexShrink: 0, letterSpacing: "0.05em" }}>{t.cumulativeDelta}</span>
          </div>
          {/* Day rows */}
          {days.map(d => {
            const total = getDayTotal(d);
            const cum = getCumulative(d.day);
            const diff = dailyBudget * d.day - cum;
            const hasData = total > 0;
            return (
              <div key={d.day} onClick={() => setActiveDay(d.day)} style={{ display: "flex", alignItems: "center", padding: "6px 10px", borderBottom: "1px solid #1E1C18", cursor: "pointer", background: activeDay === d.day ? "#201E1A" : "transparent", transition: "background 0.1s", gap: 3 }}>
                <span style={{ fontSize: 11, color: "#4A4840", fontFamily: "monospace", flexShrink: 0, paddingRight: 4 }}>D{d.day}</span>
                {showCatCols && (
                  <div style={{ flex: 1, display: "flex", gap: 3 }}>
                    {cats.map(cat => {
                      const val = parseFloat(d[cat.id]) || 0;
                      return (
                        <span key={cat.id} style={{ flex: 1, fontSize: cats.length >= 6 ? 10 : 11, fontFamily: "monospace", color: val > 0 ? "#C0B8A8" : "#2A2822", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {fmtCompact(val)}
                        </span>
                      );
                    })}
                  </div>
                )}
                {!showCatCols && <div style={{ flex: 1 }} />}
                <span style={{ fontSize: cats.length >= 6 ? 11 : 12, fontFamily: "monospace", fontWeight: hasData ? "bold" : "normal", color: hasData ? "#F0EDE6" : "#3A3830", width: 40, textAlign: "right", flexShrink: 0 }}>
                  {hasData ? fmtCompact(total) : "—"}
                </span>
                <span style={{ fontSize: 10, fontFamily: "monospace", color: hasData ? (diff >= 0 ? "#6DB88A" : "#E06060") : "transparent", width: 40, textAlign: "right", flexShrink: 0 }}>
                  {hasData ? `${diff >= 0 ? "+" : ""}${fmtCompact(Math.abs(diff))}` : "·"}
                </span>
              </div>
            );
          })}
          {/* Footer: per-cat totals + grand total */}
          <div style={{ display: "flex", alignItems: "center", padding: "7px 10px", borderTop: "1px solid #2A2822", gap: 3, background: "#141210" }}>
            <span style={{ fontSize: 10, color: "#6A6050", flexShrink: 0, paddingRight: 4 }}>{t.total}</span>
            {showCatCols && (
              <div style={{ flex: 1, display: "flex", gap: 3 }}>
                {cats.map(cat => {
                  const catTotal = days.reduce((s, d) => s + (parseFloat(d[cat.id]) || 0), 0);
                  return (
                    <span key={cat.id} style={{ flex: 1, fontSize: cats.length >= 6 ? 10 : 11, fontFamily: "monospace", color: catTotal > 0 ? cat.color : "#3A3830", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {fmtCompact(catTotal)}
                    </span>
                  );
                })}
              </div>
            )}
            {!showCatCols && <div style={{ flex: 1 }} />}
            <span style={{ fontSize: 12, fontFamily: "monospace", fontWeight: "bold", color: totalSpent > TOTAL_BUDGET ? "#E06060" : "#6DB88A", width: 40, textAlign: "right", flexShrink: 0 }}>
              {fmtCompact(totalSpent)}
            </span>
            <span style={{ fontSize: 10, color: "#4A4840", width: 40, textAlign: "right", flexShrink: 0 }}>
              /{TOTAL_BUDGET.toLocaleString()}
            </span>
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: "#3A3830", marginTop: 18, letterSpacing: "0.08em" }}>
          {t.dailyGoal(sym, dailyBudget.toLocaleString(), tripDays)}
        </p>
        <p style={{ textAlign: "center", fontSize: 10, color: "#2A2820", marginTop: 6, letterSpacing: "0.05em" }}>
          © 이 앱의 소유권은 @minorimaiori에게 있습니다
        </p>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [config, setConfig] = useState(null);
  const [prevConfig, setPrevConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CONFIG_KEY);
      if (raw) setConfig(JSON.parse(raw));
    } catch (e) {}
    setLoading(false);
  }, []);

  const handleStart = (cfg) => {
    try { localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg)); } catch (e) {}
    setConfig(cfg);
  };

  const handleReset = () => {
    try { localStorage.removeItem(CONFIG_KEY); } catch (e) {}
    setPrevConfig(config);
    setConfig(null);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0F0E0C", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#4A4840", fontSize: 13, fontFamily: "Georgia, serif" }}>{T["ko"].loading}</span>
    </div>
  );

  return config ? <Tracker config={config} onReset={handleReset} /> : <SetupScreen onStart={handleStart} prevConfig={prevConfig} isReset={!!prevConfig} />;
}
