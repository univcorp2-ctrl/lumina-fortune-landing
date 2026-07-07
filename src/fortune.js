export const MAX_DAILY_READINGS = 3;

export const CONCERNS = {
  love: {
    label: '恋愛', icon: '♡',
    intro: '気持ちを急いで決めず、関係の温度を丁寧に確かめる日です。',
    actions: ['短い感謝をひとつ伝える', '相手の言葉を最後まで聴く', '自分が望む関係を3行で書く']
  },
  work: {
    label: '仕事', icon: '◇',
    intro: '大きな答えより、次の一手を小さく具体化すると流れが整います。',
    actions: ['15分だけ最優先の作業に着手する', '頼れる相手に一つ相談する', '今日やらないことを一つ決める']
  },
  money: {
    label: '金運', icon: '◉',
    intro: '増やすことと同じくらい、納得して使うことが運の土台になります。',
    actions: ['今日の支出を一度だけ確認する', '未来の自分に小額を取り分ける', '欲しい理由を言葉にしてから選ぶ']
  },
  self: {
    label: '自分探し', icon: '✦',
    intro: '周囲の正解から少し離れ、自分の感覚を取り戻す余白が役立ちます。',
    actions: ['気分が軽くなる場所を10分歩く', '本音を一文だけメモする', '今日できたことを一つ数える']
  }
};

const CARDS = [
  { name: '月の鏡', symbol: '☾', headline: '静かな本音が、次の道を映します。', body: 'まだ言葉にならない感覚を否定せず、少し待つことで輪郭が見えてきます。' },
  { name: '暁の鍵', symbol: '✧', headline: '小さな選択が、停滞をほどきます。', body: '完璧な準備より、いま選べる最小の行動が新しい扉を開きます。' },
  { name: '星の庭', symbol: '✦', headline: '育ててきたものに、光が当たる兆し。', body: '目立たない積み重ねも十分に価値があります。成果を急がず手入れを続けましょう。' },
  { name: '風の手紙', symbol: '⌁', headline: '伝え方を変えると、関係が軽くなります。', body: '結論を押しつけず、感じたことから話すと互いの余白が生まれます。' },
  { name: '水晶の舟', symbol: '◌', headline: '流れに乗る前に、荷物を一つ降ろす時。', body: '抱え込みすぎている役割を見直すと、本当に向かいたい方向へ進みやすくなります。' },
  { name: '金色の種', symbol: '❋', headline: '未来の実りは、今日の小さな種から。', body: 'すぐ結果が見えなくても、続けられる形で始めれば時間が味方になります。' },
  { name: '白い羽根', symbol: '⌇', headline: 'やさしい境界線が、あなたを守ります。', body: '断ることは関係を壊すことではありません。自分を守る言葉を穏やかに選びましょう。' },
  { name: '双星の環', symbol: '∞', headline: '違いを知るほど、つながりは深まります。', body: '同じであることより、異なる願いを理解し合うことが信頼につながります。' }
];
const COLORS = ['月白', '藤紫', '深海青', '琥珀色', '薄紅', '若草色'];
const FOCUS_WORDS = ['余白', '対話', '一歩', '手放す', '整える', '信じる'];

export function hashString(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getTokyoDateKey(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(now);
}

export function shiftDateKey(dateKey, days) {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function getQuotaState(history = [], now = new Date()) {
  const dateKey = getTokyoDateKey(now);
  const used = history.filter((item) => item.dateKey === dateKey).length;
  return { dateKey, used, remaining: Math.max(0, MAX_DAILY_READINGS - used), limit: MAX_DAILY_READINGS };
}

export function computeStreak(history = [], now = new Date()) {
  const dates = new Set(history.map((item) => item.dateKey).filter(Boolean));
  let cursor = getTokyoDateKey(now);
  if (!dates.has(cursor)) cursor = shiftDateKey(cursor, -1);
  let streak = 0;
  while (dates.has(cursor)) {
    streak += 1;
    cursor = shiftDateKey(cursor, -1);
  }
  return streak;
}

export function createReading(input, now = new Date()) {
  const concern = CONCERNS[input.concern] ? input.concern : 'self';
  const nickname = String(input.nickname || '').trim().slice(0, 20);
  const birthDate = String(input.birthDate || '').slice(0, 10);
  const dateKey = getTokyoDateKey(now);
  const seed = hashString(`${dateKey}|${concern}|${nickname.toLowerCase()}|${birthDate}`);
  const card = CARDS[seed % CARDS.length];
  const category = CONCERNS[concern];
  const action = category.actions[(seed >>> 3) % category.actions.length];
  const addressee = nickname ? `${nickname}さん` : 'あなた';
  return {
    id: `${dateKey}-${seed.toString(16)}`,
    createdAt: now.toISOString(), dateKey, concern, concernLabel: category.label,
    cardName: card.name, cardSymbol: card.symbol,
    headline: `${addressee}へ。${card.headline}`,
    interpretation: `${category.intro} ${card.body}`,
    action,
    luckyColor: COLORS[(seed >>> 5) % COLORS.length],
    focusWord: FOCUS_WORDS[(seed >>> 7) % FOCUS_WORDS.length],
    premiumPreview: [`${category.label}の7日間の流れ`, '迷いが出た時の選択ガイド', 'あなた専用の振り返り質問3つ']
  };
}

export function runReadingFlow(input, history = [], now = new Date()) {
  const quota = getQuotaState(history, now);
  if (quota.remaining <= 0) return { ok: false, reason: 'quota', quota, history };
  const reading = createReading(input, now);
  const nextHistory = [...history, reading].slice(-30);
  return {
    ok: true, reading, history: nextHistory,
    quota: getQuotaState(nextHistory, now), streak: computeStreak(nextHistory, now)
  };
}
