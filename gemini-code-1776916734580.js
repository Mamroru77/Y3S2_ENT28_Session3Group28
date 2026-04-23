import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sparkles,
  LogIn,
  LayoutDashboard,
  Search,
  ClipboardList,
  User,
  Moon,
  Wind,
  Volume2,
  House,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Filter,
  Users,
  Bell,
  Settings,
  ShieldCheck,
  MessageCircleMore,
  HeartHandshake,
  ChevronRight,
} from "lucide-react";

type QuestionType = "hard" | "weighted" | "open";
type QuestionInputType = "single" | "text";
type AppPage = "dashboard" | "discover" | "questionnaire" | "profile";

type Option = {
  value: string;
  label: string;
  score?: number;
  acceptable?: boolean;
};

type Question = {
  id: string;
  title: string;
  description?: string;
  type: QuestionType;
  inputType: QuestionInputType;
  weight?: number;
  options?: Option[];
};

type Profile = {
  name: string;
  bio: string;
  mbti: string;
  sleepTime: string;
  noiseTolerance: string;
  preferredTemp: string;
  cleanliness: string;
  hobbies: string;
  avatar: string;
  roommateGoal: string;
};

type UserRecord = {
  id: string;
  profile: Profile;
  questionnaire: Question[];
  tags: string[];
};

type AnswerMap = Record<string, string>;

type MatchBreakdown = {
  hardPassed: boolean;
  percentage: number;
  status: "高度契合" | "中度契合" | "低度契合" | "不適合";
  passedItems: string[];
  partialItems: string[];
  failedItems: string[];
};

const initialProfile: Profile = {
  name: "尼托 (Nyto)",
  bio: "安靜、獨立，重視個人空間。我偏好在搬進來之前先清楚討論生活公約。",
  mbti: "INTP",
  sleepTime: "午夜 12:00 前",
  noiseTolerance: "低",
  preferredTemp: "24°C",
  cleanliness: "中等整潔",
  hobbies: "歷史、音樂、遊戲",
  avatar: "N",
  roommateGoal: "尋找生活作息相合、界線清晰且冷靜的室友。",
};

const initialQuestions: Question[] = [
  {
    id: "q1",
    title: "你平日通常幾點睡覺？",
    description: "睡眠作息不合是我最無法接受的。",
    type: "hard",
    inputType: "single",
    options: [
      { value: "before-11", label: "晚上 11:00 前", acceptable: true },
      { value: "11-12", label: "晚上 11:00 - 午夜 12:00", acceptable: true },
      { value: "after-12", label: "午夜 12:00 以後", acceptable: false },
    ],
  },
  {
    id: "q2",
    title: "讀書或休息時，你能忍受多少噪音？",
    type: "weighted",
    inputType: "single",
    weight: 3,
    options: [
      { value: "low", label: "極低容忍度 (需要絕對安靜)", score: 3 },
      { value: "medium", label: "中等容忍度 (一般白噪音可)", score: 2 },
      { value: "high", label: "高容忍度 (不太怕吵)", score: 1 },
    ],
  },
  {
    id: "q3",
    title: "你偏好的冷氣溫度是？",
    type: "weighted",
    inputType: "single",
    weight: 2,
    options: [
      { value: "22-24", label: "22–24°C", score: 3 },
      { value: "24-26", label: "24–26°C", score: 2 },
      { value: "26+", label: "26°C 以上", score: 1 },
    ],
  },
  {
    id: "q4",
    title: "你能接受室友的書桌偶爾雜亂嗎？",
    type: "hard",
    inputType: "single",
    options: [
      { value: "yes", label: "可以", acceptable: true },
      { value: "sometimes", label: "偶爾可以接受", acceptable: true },
      { value: "no", label: "不行", acceptable: false },
    ],
  },
  {
    id: "q5",
    title: "未來室友還有什麼需要知道的嗎？",
    type: "open",
    inputType: "text",
  },
];

const browseUsers: UserRecord[] = [
  {
    id: "u1",
    profile: {
      name: "莉娜 (Lina)",
      bio: "安靜且愛乾淨。我通常在午夜前就寢，平日需要一個安靜的讀書環境。",
      mbti: "INFJ",
      sleepTime: "午夜 12:00 前",
      noiseTolerance: "低",
      preferredTemp: "23°C",
      cleanliness: "極度整潔",
      hobbies: "閱讀、看電影、跑咖啡廳",
      avatar: "L",
      roommateGoal: "尋找懂得互相尊重、能保持低音量的室友。",
    },
    tags: ["安靜", "專注課業", "愛乾淨"],
    questionnaire: [
      {
        id: "u1q1",
        title: "晚上 11 點後，講電話能長話短說嗎？",
        type: "hard",
        inputType: "single",
        options: [
          { value: "yes", label: "可以", acceptable: true },
          { value: "sometimes", label: "視情況而定", acceptable: false },
          { value: "no", label: "沒辦法", acceptable: false },
        ],
      },
      {
        id: "u1q2",
        title: "你在公共空間的整潔習慣如何？",
        type: "weighted",
        inputType: "single",
        weight: 3,
        options: [
          { value: "very", label: "非常整潔 (用完馬上收)", score: 3 },
          { value: "normal", label: "普通整潔 (定期整理)", score: 2 },
          { value: "messy", label: "偏向隨性/雜亂", score: 1 },
        ],
      },
      {
        id: "u1q3",
        title: "請分享一個你最在意的生活公約？",
        type: "open",
        inputType: "text",
      },
    ],
  },
  {
    id: "u2",
    profile: {
      name: "亞倫 (Aaron)",
      bio: "好相處但重視界線。週末會打電動，喜歡把規矩先講清楚。",
      mbti: "INTP",
      sleepTime: "午夜 12:00 - 凌晨 1:00",
      noiseTolerance: "中等",
      preferredTemp: "24°C",
      cleanliness: "中等",
      hobbies: "遊戲、健身、聽 Podcast",
      avatar: "A",
      roommateGoal: "找一個好溝通、性格隨和的室友。",
    },
    tags: ["好溝通", "有彈性", "偏晚睡"],
    questionnaire: [
      {
        id: "u2q1",
        title: "能接受週末晚上打電動到凌晨嗎？",
        type: "hard",
        inputType: "single",
        options: [
          { value: "yes", label: "可以", acceptable: true },
          { value: "depends", label: "取決於音量", acceptable: true },
          { value: "no", label: "不行", acceptable: false },
        ],
      },
      {
        id: "u2q2",
        title: "遇到摩擦時，你習慣直接溝通嗎？",
        type: "weighted",
        inputType: "single",
        weight: 2,
        options: [
          { value: "high", label: "非常習慣直接講", score: 3 },
          { value: "medium", label: "稍微有些抗拒", score: 2 },
          { value: "low", label: "不喜歡起衝突", score: 1 },
        ],
      },
      {
        id: "u2q3",
        title: "你平日通常幾點睡？",
        type: "weighted",
        inputType: "single",
        weight: 3,
        options: [
          { value: "before-11", label: "晚上 11 點前", score: 1 },
          { value: "11-12", label: "晚上 11 點 - 午夜 12 點", score: 3 },
          { value: "after-12", label: "午夜 12 點後", score: 2 },
        ],
      },
    ],
  },
  {
    id: "u3",
    profile: {
      name: "米卡 (Mika)",
      bio: "有創意且熱愛社交，但我仍重視互相尊重並嚴格遵守安靜時段。",
      mbti: "ENFP",
      sleepTime: "大約午夜 12:00",
      noiseTolerance: "中等",
      preferredTemp: "25°C",
      cleanliness: "中等整潔",
      hobbies: "攝影、音樂、參加活動",
      avatar: "M",
      roommateGoal: "找一個心態開放、互相尊重，且能接受偶爾有訪客的室友。",
    },
    tags: ["有創意", "愛社交", "有邊界感"],
    questionnaire: [
      {
        id: "u3q1",
        title: "能接受週末偶爾帶朋友來宿舍嗎？",
        type: "hard",
        inputType: "single",
        options: [
          { value: "yes", label: "可以", acceptable: true },
          { value: "sometimes", label: "有事先告知就可以", acceptable: true },
          { value: "no", label: "不行", acceptable: false },
        ],
      },
      {
        id: "u3q2",
        title: "你希望生活公約有多嚴格？",
        type: "weighted",
        inputType: "single",
        weight: 2,
        options: [
          { value: "high", label: "非常嚴格明確", score: 1 },
          { value: "medium", label: "取得平衡即可", score: 3 },
          { value: "low", label: "非常有彈性", score: 2 },
        ],
      },
      {
        id: "u3q3",
        title: "在共同生活中，你最看重什麼？",
        type: "open",
        inputType: "text",
      },
    ],
  },
];

function evaluateMatch(questions: Question[], answers: AnswerMap): MatchBreakdown {
  let hardPassed = true;
  let total = 0;
  let max = 0;
  const passedItems: string[] = [];
  const partialItems: string[] = [];
  const failedItems: string[] = [];

  for (const question of questions) {
    const answer = answers[question.id];
    if (!answer) continue;

    if (question.type === "hard" && question.options) {
      const selected = question.options.find((o) => o.value === answer);
      if (selected?.acceptable) passedItems.push(question.title);
      else {
        hardPassed = false;
        failedItems.push(question.title);
      }
    }

    if (question.type === "weighted" && question.options) {
      const selected = question.options.find((o) => o.value === answer);
      const score = selected?.score ?? 0;
      const weight = question.weight ?? 1;
      total += score * weight;
      max += 3 * weight;

      if (score === 3) passedItems.push(question.title);
      else if (score === 2) partialItems.push(question.title);
      else failedItems.push(question.title);
    }
  }

  const percentage = max > 0 ? Math.round((total / max) * 100) : 0;
  let status: MatchBreakdown["status"] = "高度契合";
  if (!hardPassed) status = "不適合";
  else if (percentage >= 80) status = "高度契合";
  else if (percentage >= 60) status = "中度契合";
  else status = "低度契合";

  return { hardPassed, percentage, status, passedItems, partialItems, failedItems };
}

function getStatusColor(status: MatchBreakdown["status"]) {
  switch (status) {
    case "高度契合":
      return "bg-green-100 text-green-700 border-green-200";
    case "中度契合":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "低度契合":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "不適合":
      return "bg-red-100 text-red-700 border-red-200";
  }
}

function IconForField({ label }: { label: string }) {
  if (label.includes("sleep")) return <Moon className="h-4 w-4" />;
  if (label.includes("noise")) return <Volume2 className="h-4 w-4" />;
  if (label.includes("temp")) return <Wind className="h-4 w-4" />;
  return <House className="h-4 w-4" />;
}

function AvatarPill({ text }: { text: string }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
      {text}
    </div>
  );
}

function NavButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${
        active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("student@university.edu.tw");
  const [password, setPassword] = useState("DormHarmony");

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative overflow-hidden bg-slate-950 p-8 text-white md:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_30%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <div className="mb-8 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="rounded-xl bg-white p-2 text-slate-950">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">宿舍和諧 (DormHarmony)</span>
              </div>
              <h1 className="max-w-xl text-4xl font-bold tracking-tight md:text-5xl">
                配對的是生活契合度，而不僅僅是隨機分配。
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-6 text-slate-300 md:text-base">
                由學生主導的室友探索平台，在住在一起之前，先定義好雙方的生活界線。
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["個人界線", "用戶自行定義絕對無法接受的條件。"],
                ["探索檔案", "在配對前先看清對方的生活風格。"],
                ["事前篩選", "問卷機制可減少同居後不必要的衝突。"],
              ].map(([title, desc]) => (
                <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="font-medium">{title}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-300">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-8 md:p-12">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            <Card className="rounded-[28px] border-0 shadow-none">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-3xl">歡迎回來</CardTitle>
                <CardDescription>
                  登入以管理您的個人檔案、問卷以及室友配對進度。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 px-0 pb-0">
                <div className="space-y-2">
                  <Label>電子郵件</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <Label>密碼</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-2xl" />
                </div>
                <Button onClick={onLogin} className="h-12 w-full rounded-2xl text-sm font-medium">
                  <LogIn className="mr-2 h-4 w-4" /> 登入
                </Button>
                <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-600">
                  示範帳號已預先填寫，讓您可立即預覽產品架構。
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function DormHarmonyApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [page, setPage] = useState<AppPage>("dashboard");
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [selectedUser, setSelectedUser] = useState<UserRecord>(browseUsers[0]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [newQuestion, setNewQuestion] = useState<Question>({
    id: "",
    title: "",
    description: "",
    type: "weighted",
    inputType: "single",
    weight: 2,
    options: [
      { value: "opt1", label: "選項 1", score: 3, acceptable: true },
      { value: "opt2", label: "選項 2", score: 2, acceptable: true },
      { value: "opt3", label: "選項 3", score: 1, acceptable: false },
    ],
  });

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return browseUsers;
    return browseUsers.filter((user) => {
      const text = [user.profile.name, user.profile.bio, user.profile.mbti, user.profile.hobbies, ...user.tags]
        .join(" ")
        .toLowerCase();
      return text.includes(q);
    });
  }, [searchQuery]);

  const completionRate = useMemo(() => {
    const values = Object.values(profile);
    const filled = values.filter((v) => String(v).trim().length > 0).length;
    return Math.round((filled / values.length) * 100);
  }, [profile]);

  const matchResult = useMemo(() => evaluateMatch(selectedUser.questionnaire, answers), [selectedUser, answers]);

  const updateProfile = (field: keyof Profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const updateAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const addQuestion = () => {
    if (!newQuestion.title.trim()) return;

    const questionToAdd: Question = {
      ...newQuestion,
      id: `custom-${Date.now()}`,
      inputType: newQuestion.type === "open" ? "text" : "single",
      options:
        newQuestion.type === "open"
          ? undefined
          : (newQuestion.options ?? []).map((o, idx) => ({
              ...o,
              value: o.value || `opt-${idx + 1}`,
              label: o.label || `選項 ${idx + 1}`,
            })),
    };

    setQuestions((prev) => [...prev, questionToAdd]);
    setNewQuestion({
      id: "",
      title: "",
      description: "",
      type: "weighted",
      inputType: "single",
      weight: 2,
      options: [
        { value: "opt1", label: "選項 1", score: 3, acceptable: true },
        { value: "opt2", label: "選項 2", score: 2, acceptable: true },
        { value: "opt3", label: "選項 3", score: 1, acceptable: false },
      ],
    });
  };

  if (!isLoggedIn) return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-slate-200 bg-white p-5">
          <div className="flex h-full flex-col">
            <div className="mb-8 flex items-center gap-3">
              <div className="rounded-2xl bg-slate-900 p-3 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">宿舍和諧</p>
                <p className="text-xs text-slate-500">室友配對 MVP</p>
              </div>
            </div>

            <div className="space-y-2">
              <NavButton active={page === "dashboard"} icon={<LayoutDashboard className="h-4 w-4" />} label="主控台" onClick={() => setPage("dashboard")} />
              <NavButton active={page === "discover"} icon={<Search className="h-4 w-4" />} label="探索室友" onClick={() => setPage("discover")} />
              <NavButton active={page === "questionnaire"} icon={<ClipboardList className="h-4 w-4" />} label="我的問卷" onClick={() => setPage("questionnaire")} />
              <NavButton active={page === "profile"} icon={<User className="h-4 w-4" />} label="個人檔案" onClick={() => setPage("profile")} />
            </div>

            <div className="mt-8 rounded-3xl bg-slate-950 p-5 text-white">
              <p className="text-sm font-medium">檔案完成度</p>
              <p className="mt-2 text-3xl font-bold">{completionRate}%</p>
              <Progress value={completionRate} className="mt-4 h-2 bg-white/15" />
              <p className="mt-4 text-xs leading-5 text-slate-300">
                完善您的個人檔案與問卷，以獲得更精準有意義的配對結果。
              </p>
            </div>

            <div className="mt-auto rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <AvatarPill text={profile.avatar || "N"} />
                <div>
                  <p className="font-medium">{profile.name}</p>
                  <p className="text-xs text-slate-500">{profile.mbti || "尚未設定 MBTI"}</p>
                </div>
              </div>
              <Button variant="outline" className="mt-4 w-full rounded-2xl" onClick={() => setIsLoggedIn(false)}>
                登出
              </Button>
            </div>
          </div>
        </aside>

        <main className="p-5 md:p-7">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm text-slate-500">由學生主導的室友篩選平台</p>
              <h1 className="text-3xl font-bold tracking-tight">
                {page === "dashboard" && "總覽"}
                {page === "discover" && "探索室友"}
                {page === "questionnaire" && "問卷建立器"}
                {page === "profile" && "個人檔案設定"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-full lg:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜尋用戶、標籤或風格"
                  className="h-11 rounded-2xl bg-white pl-10"
                />
              </div>
              <Button variant="outline" className="h-11 rounded-2xl px-4">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="h-11 rounded-2xl px-4">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {page === "dashboard" && (
            <div className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {[
                  { title: "檔案完整度", value: `${completionRate}%`, note: "越詳細的資料能提升配對品質。", icon: <ShieldCheck className="h-5 w-5" /> },
                  { title: "自訂問題", value: String(questions.length), note: "包含絕對條件與加權偏好。", icon: <ClipboardList className="h-5 w-5" /> },
                  { title: "潛在配對人數", value: String(browseUsers.length), note: "示範資料庫中的可配對室友。", icon: <Users className="h-5 w-5" /> },
                  { title: "目前契合度", value: `${matchResult.percentage}%`, note: `基於對 ${selectedUser.profile.name} 提問的回答。`, icon: <HeartHandshake className="h-5 w-5" /> },
                ].map((item) => (
                  <Card key={item.title} className="rounded-[28px] border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">{item.icon}</div>
                        <Badge variant="outline" className="rounded-xl">進行中</Badge>
                      </div>
                      <p className="mt-5 text-sm text-slate-500">{item.title}</p>
                      <p className="mt-1 text-3xl font-bold">{item.value}</p>
                      <p className="mt-3 text-xs leading-5 text-slate-500">{item.note}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <Card className="rounded-[28px] border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>推薦檔案</CardTitle>
                    <CardDescription>瀏覽室友候選人，並進入契合度篩選環節。</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {browseUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          setSelectedUser(user);
                          setAnswers({});
                          setPage("discover");
                        }}
                        className="flex w-full items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-white"
                      >
                        <div className="flex items-center gap-4">
                          <AvatarPill text={user.profile.avatar} />
                          <div>
                            <p className="font-medium">{user.profile.name}</p>
                            <p className="mt-1 text-sm text-slate-500">{user.profile.bio}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {user.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="rounded-xl">{tag}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      </button>
                    ))}
                  </CardContent>
                </Card>

                <Card className="rounded-[28px] border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>您的目前室友卡</CardTitle>
                    <CardDescription>這是其他人看到您的公開檔案樣貌。</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-[28px] bg-slate-950 p-6 text-white">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <AvatarPill text={profile.avatar || "N"} />
                          <div>
                            <p className="text-xl font-semibold">{profile.name}</p>
                            <p className="text-sm text-slate-300">{profile.mbti} • {profile.cleanliness}</p>
                          </div>
                        </div>
                        <Badge className="rounded-xl bg-white/10 text-white">開放配對</Badge>
                      </div>
                      <p className="mt-5 text-sm leading-6 text-slate-300">{profile.bio}</p>
                      <div className="mt-5 grid gap-3 text-sm md:grid-cols-2">
                        {[
                          ["作息", profile.sleepTime, "sleep"],
                          ["噪音", profile.noiseTolerance, "noise"],
                          ["溫度", profile.preferredTemp, "temp"],
                          ["休閒", profile.hobbies, "home"],
                        ].map(([label, value, iconKey]) => (
                          <div key={label} className="flex items-center gap-2 rounded-2xl bg-white/5 p-3">
                            <IconForField label={String(iconKey)} />
                            <span className="text-slate-300">{label}:</span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {page === "discover" && (
            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <Card className="rounded-[28px] border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle>瀏覽檔案</CardTitle>
                      <CardDescription>選擇室友候選人查看詳情，並回答他們的篩選問卷。</CardDescription>
                    </div>
                    <Button variant="outline" className="rounded-2xl">
                      <Filter className="mr-2 h-4 w-4" /> 篩選
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setSelectedUser(user);
                        setAnswers({});
                      }}
                      className={`w-full rounded-[24px] border p-4 text-left transition ${
                        selectedUser.id === user.id ? "border-slate-900 bg-slate-100" : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <AvatarPill text={user.profile.avatar} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-semibold">{user.profile.name}</p>
                            <Badge className="rounded-xl">{user.profile.mbti}</Badge>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{user.profile.bio}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {user.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="rounded-xl">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="rounded-[28px] border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>{selectedUser.profile.name} 的檔案</CardTitle>
                    <CardDescription>{selectedUser.profile.roommateGoal}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="flex items-start gap-4 rounded-[24px] bg-slate-50 p-5">
                      <AvatarPill text={selectedUser.profile.avatar} />
                      <div>
                        <p className="text-xl font-semibold">{selectedUser.profile.name}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{selectedUser.profile.bio}</p>
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {[
                        ["作息", selectedUser.profile.sleepTime, "sleep"],
                        ["噪音", selectedUser.profile.noiseTolerance, "noise"],
                        ["溫度", selectedUser.profile.preferredTemp, "temp"],
                        ["休閒", selectedUser.profile.hobbies, "home"],
                      ].map(([label, value, iconKey]) => (
                        <div key={label} className="flex items-center gap-2 rounded-2xl border border-slate-200 p-4 text-sm">
                          <IconForField label={String(iconKey)} />
                          <span className="text-slate-500">{label}:</span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[28px] border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle>契合度篩選</CardTitle>
                    <CardDescription>在發送室友邀請前，請先填寫 {selectedUser.profile.name} 的自訂問卷。</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {selectedUser.questionnaire.map((question) => (
                      <div key={question.id} className="rounded-[24px] bg-slate-50 p-4">
                        <div className="mb-3 flex items-center gap-2">
                          <p className="font-medium">{question.title}</p>
                          <Badge variant="secondary" className="rounded-xl">
                            {question.type === "hard" ? "絕對條件" : question.type === "weighted" ? "加權偏好" : "開放回答"}
                          </Badge>
                        </div>
                        {question.inputType === "single" && question.options ? (
                          <div className="grid gap-2">
                            {question.options.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => updateAnswer(question.id, option.value)}
                                className={`rounded-2xl border p-3 text-left text-sm transition ${
                                  answers[question.id] === option.value
                                    ? "border-slate-900 bg-white"
                                    : "border-slate-200 bg-white/80 hover:bg-white"
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <Textarea
                            value={answers[question.id] || ""}
                            onChange={(e) => updateAnswer(question.id, e.target.value)}
                            className="rounded-2xl bg-white"
                            placeholder="請在此寫下您的回答"
                          />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="rounded-[28px] border-0 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle>配對結果</CardTitle>
                      <Badge className={`rounded-xl border ${getStatusColor(matchResult.status)}`}>{matchResult.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                        <span>加權契合度</span>
                        <span>{matchResult.percentage}%</span>
                      </div>
                      <Progress value={matchResult.percentage} className="h-3" />
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl bg-green-50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-green-700">
                          <CheckCircle2 className="h-4 w-4" />
                          <p className="font-medium">通過</p>
                        </div>
                        <ul className="space-y-1 text-sm text-slate-700">
                          {matchResult.passedItems.length ? matchResult.passedItems.map((item) => <li key={item}>• {item}</li>) : <li>需回答更多問題</li>}
                        </ul>
                      </div>
                      <div className="rounded-2xl bg-amber-50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-amber-700">
                          <AlertTriangle className="h-4 w-4" />
                          <p className="font-medium">部分符合</p>
                        </div>
                        <ul className="space-y-1 text-sm text-slate-700">
                          {matchResult.partialItems.length ? matchResult.partialItems.map((item) => <li key={item}>• {item}</li>) : <li>無部分衝突項</li>}
                        </ul>
                      </div>
                      <div className="rounded-2xl bg-red-50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-red-700">
                          <XCircle className="h-4 w-4" />
                          <p className="font-medium">風險</p>
                        </div>
                        <ul className="space-y-1 text-sm text-slate-700">
                          {matchResult.failedItems.length ? matchResult.failedItems.map((item) => <li key={item}>• {item}</li>) : <li>無重大風險</li>}
                        </ul>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button className="rounded-2xl">
                        <MessageCircleMore className="mr-2 h-4 w-4" /> 發送邀請
                      </Button>
                      <Button variant="outline" className="rounded-2xl">儲存檔案</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {page === "questionnaire" && (
            <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
              <Card className="rounded-[28px] border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>您目前的問卷</CardTitle>
                  <CardDescription>這些問題將展示給想與您配對的人填寫。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {questions.map((q) => (
                    <div key={q.id} className="rounded-[24px] border border-slate-200 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <p className="font-medium">{q.title}</p>
                        <Badge variant="secondary" className="rounded-xl">
                          {q.type === "hard" ? "絕對條件" : q.type === "weighted" ? "加權偏好" : "開放回答"}
                        </Badge>
                        {q.type === "weighted" && <Badge variant="outline" className="rounded-xl">權重 {q.weight}</Badge>}
                      </div>
                      {q.description && <p className="text-sm text-slate-600">{q.description}</p>}
                      {q.options && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {q.options.map((option) => (
                            <Badge key={option.value} variant="outline" className="rounded-xl">{option.label}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-[28px] border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>新增問題</CardTitle>
                  <CardDescription>建立您專屬的篩選邏輯，而不僅僅依賴傳統的制式問卷。</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>問題標題</Label>
                    <Input
                      value={newQuestion.title}
                      onChange={(e) => setNewQuestion((prev) => ({ ...prev, title: e.target.value }))}
                      className="rounded-2xl"
                      placeholder="例如：你能接受晚上 9 點後有訪客嗎？"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>描述 (選填)</Label>
                    <Textarea
                      value={newQuestion.description}
                      onChange={(e) => setNewQuestion((prev) => ({ ...prev, description: e.target.value }))}
                      className="rounded-2xl"
                      placeholder="說明為什麼這點對您很重要"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>問題類型</Label>
                      <Select
                        value={newQuestion.type}
                        onValueChange={(value: QuestionType) =>
                          setNewQuestion((prev) => ({
                            ...prev,
                            type: value,
                            inputType: value === "open" ? "text" : "single",
                          }))
                        }
                      >
                        <SelectTrigger className="rounded-2xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hard">絕對條件 (Hard Rule)</SelectItem>
                          <SelectItem value="weighted">加權偏好 (Weighted)</SelectItem>
                          <SelectItem value="open">開放式問答 (Open)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>權重</Label>
                      <Input
                        type="number"
                        value={newQuestion.weight ?? 2}
                        onChange={(e) => setNewQuestion((prev) => ({ ...prev, weight: Number(e.target.value) || 1 }))}
                        disabled={newQuestion.type !== "weighted"}
                        className="rounded-2xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>輸入模式</Label>
                      <Input value={newQuestion.type === "open" ? "文字回覆" : "單選題"} disabled className="rounded-2xl" />
                    </div>
                  </div>

                  {newQuestion.type !== "open" && (
                    <div className="rounded-[24px] bg-slate-50 p-4">
                      <p className="mb-3 font-medium">設定選項</p>
                      <div className="space-y-3">
                        {(newQuestion.options ?? []).map((option, idx) => (
                          <div key={idx} className="grid gap-3 md:grid-cols-3">
                            <Input
                              value={option.label}
                              onChange={(e) => {
                                const next = [...(newQuestion.options ?? [])];
                                next[idx] = { ...next[idx], label: e.target.value };
                                setNewQuestion((prev) => ({ ...prev, options: next }));
                              }}
                              className="rounded-2xl bg-white"
                              placeholder="選項文字"
                            />
                            <Input
                              type="number"
                              value={option.score ?? 1}
                              onChange={(e) => {
                                const next = [...(newQuestion.options ?? [])];
                                next[idx] = { ...next[idx], score: Number(e.target.value) || 1 };
                                setNewQuestion((prev) => ({ ...prev, options: next }));
                              }}
                              disabled={newQuestion.type !== "weighted"}
                              className="rounded-2xl bg-white"
                              placeholder="分數"
                            />
                            <Select
                              value={String(option.acceptable ?? true)}
                              onValueChange={(value) => {
                                const next = [...(newQuestion.options ?? [])];
                                next[idx] = { ...next[idx], acceptable: value === "true" };
                                setNewQuestion((prev) => ({ ...prev, options: next }));
                              }}
                              disabled={newQuestion.type !== "hard"}
                            >
                              <SelectTrigger className="rounded-2xl bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">可接受</SelectItem>
                                <SelectItem value="false">不可接受</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button onClick={addQuestion} className="w-full rounded-2xl">
                    <Plus className="mr-2 h-4 w-4" /> 新增問題
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {page === "profile" && (
            <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
              <Card className="rounded-[28px] border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>編輯個人檔案</CardTitle>
                  <CardDescription>管理您向潛在室友公開展示的資訊。</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>暱稱</Label>
                      <Input value={profile.name} onChange={(e) => updateProfile("name", e.target.value)} className="rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>頭像縮寫</Label>
                      <Input value={profile.avatar} onChange={(e) => updateProfile("avatar", e.target.value.slice(0, 1).toUpperCase())} className="rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>MBTI 人格</Label>
                      <Input value={profile.mbti} onChange={(e) => updateProfile("mbti", e.target.value)} className="rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>整潔習慣</Label>
                      <Input value={profile.cleanliness} onChange={(e) => updateProfile("cleanliness", e.target.value)} className="rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>就寢時間</Label>
                      <Input value={profile.sleepTime} onChange={(e) => updateProfile("sleepTime", e.target.value)} className="rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>噪音容忍度</Label>
                      <Input value={profile.noiseTolerance} onChange={(e) => updateProfile("noiseTolerance", e.target.value)} className="rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>偏好冷氣溫度</Label>
                      <Input value={profile.preferredTemp} onChange={(e) => updateProfile("preferredTemp", e.target.value)} className="rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>興趣與休閒</Label>
                      <Input value={profile.hobbies} onChange={(e) => updateProfile("hobbies", e.target.value)} className="rounded-2xl" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>簡短自我介紹</Label>
                    <Textarea value={profile.bio} onChange={(e) => updateProfile("bio", e.target.value)} className="rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>尋找室友的目標</Label>
                    <Textarea value={profile.roommateGoal} onChange={(e) => updateProfile("roommateGoal", e.target.value)} className="rounded-2xl" />
                  </div>
                  <Button className="rounded-2xl">儲存變更</Button>
                </CardContent>
              </Card>

              <Card className="rounded-[28px] border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>公開預覽</CardTitle>
                  <CardDescription>這是其他人瀏覽您的檔案時會看到的樣子。</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
                    <div className="bg-slate-950 p-6 text-white">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <AvatarPill text={profile.avatar || "N"} />
                          <div>
                            <p className="text-2xl font-semibold">{profile.name}</p>
                            <p className="text-sm text-slate-300">{profile.mbti} • {profile.cleanliness}</p>
                          </div>
                        </div>
                        <Badge className="rounded-xl bg-white/10 text-white">開放配對</Badge>
                      </div>
                      <p className="mt-5 text-sm leading-6 text-slate-300">{profile.roommateGoal}</p>
                    </div>
                    <div className="p-6">
                      <p className="text-sm leading-6 text-slate-600">{profile.bio}</p>
                      <Separator className="my-5" />
                      <div className="grid gap-3 text-sm md:grid-cols-2">
                        {[
                          ["作息", profile.sleepTime, "sleep"],
                          ["噪音", profile.noiseTolerance, "noise"],
                          ["溫度", profile.preferredTemp, "temp"],
                          ["休閒", profile.hobbies, "home"],
                        ].map(([label, value, iconKey]) => (
                          <div key={label} className="flex items-center gap-2 rounded-2xl bg-slate-50 p-4">
                            <IconForField label={String(iconKey)} />
                            <span className="text-slate-500">{label}:</span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}