/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { useRouter } from "../components/RouterContext";
import Mascot from "../components/Mascot";
import { 
  Lock, 
  Mail, 
  User, 
  Send, 
  Briefcase, 
  ArrowLeft,
  Chrome
} from "lucide-react";

export default function AuthPage() {
  const { navigate, query } = useRouter();
  
  // Detect if user signed up via specific project invite link
  const inviteProjectId = query.project || "";
  const inviteRole = query.role || "";

  // Form states
  const [role, setRole] = useState<"candidate" | "employer">(() => {
    // If arriving with project invite, they are highly likely a candidate
    return inviteProjectId ? "candidate" : "employer";
  });
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const [errorText, setErrorText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Authenticate & register
  const handleAuth = async (method: "google" | "telegram") => {
    setErrorText("");

    if (!name.trim()) {
      setErrorText("Пожалуйста, введите ваше имя.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorText("Пожалуйста, введите корректный Email.");
      return;
    }
    if (method === "telegram" && !telegramUsername.trim()) {
      setErrorText("Для регистрации через Telegram введите имя пользователя (@username).");
      return;
    }

    setIsLoading(true);

    try {
      if (role === "candidate") {
        // Post candidate to the server memory DB to bind to the employer's project!
        const payload = {
          name,
          email,
          telegramUsername: telegramUsername.replace("@", "").trim() || "tg_" + Math.random().toString(36).substr(2, 5),
          telegramId: telegramId || "778899",
          projectId: inviteProjectId || "sales-prod-1", // Fallback to sales-prod-1 seeded project if none supplied
          roleName: inviteRole || "Менеджер по продажам",
          registeredVia: method,
        };

        const res = await fetch("/api/candidates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error("Не удалось создать профиль кандидата.");
        }

        const candidate = await res.json();
        setIsSuccess(true);
        setTimeout(() => {
          // Store active candidate session details in localStorage
          localStorage.setItem("cand_session_id", candidate.id);
          localStorage.setItem("cand_role", "candidate");
          // Proceed to candidate workflow
          navigate("/candidate");
        }, 1200);

      } else {
        // Registering as Employer
        const payload = {
          name,
          email,
          telegramUsername: telegramUsername.replace("@", "").trim(),
          registeredVia: method, // "google" or "telegram"
          refBy: query.ref || ""
        };

        const res = await fetch("/api/employers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          throw new Error("Не удалось зарегистрировать личный кабинет.");
        }

        const employer = await res.json();

        setIsSuccess(true);
        setTimeout(() => {
          localStorage.setItem("employer_session_id", employer.id);
          localStorage.setItem("employer_name", employer.name);
          localStorage.setItem("employer_email", employer.email);
          localStorage.setItem("employer_tg", employer.telegramUsername);
          localStorage.setItem("employer_role", "employer");
          navigate("/employer/crm");
        }, 1200);
      }
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Ошибка соединения. Попробуйте еще раз.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#EFEFEF] min-h-screen text-[#1A1A1A] flex flex-col justify-between selection:bg-[#E7C768] selection:text-[#1A1A1A]">
      
      {/* Top Header */}
      <header className="bg-white border-b border-[#DBDBDB] px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate("/main")}
          className="cursor-pointer text-[#1E4468] hover:text-[#E7C768] flex items-center gap-1.5 text-xs md:text-sm font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" /> На главную
        </button>
        <span className="text-sm font-bold bg-[#EFEFEF] border border-[#DBDBDB] text-[#1D3E5E] px-3 py-1 rounded-full">
          Робот Рекрутер (RR)
        </span>
      </header>

      {/* Auth Box Container */}
      <main className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#DBDBDB] shadow-2xl overflow-hidden">
          
          {/* Accent Header Banner */}
          <div className="bg-gradient-to-r from-[#17344F] to-[#265582] text-white p-6 text-center relative border-b border-[#DBDBDB]">
            <Mascot state="greeting" size="sm" className="mx-auto mb-2" />
            <h2 className="text-xl font-bold">Добро пожаловать в RR!</h2>
            <p className="text-gray-300 text-xs mt-1">
              {role === "candidate" 
                ? "Вход для кандидата — прохождение собеседования и обучение" 
                : "Вход для работодателя — ИИ подбор персонала и CRM"
              }
            </p>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            
            {/* Project Invite Widget if parsed */}
            {inviteProjectId && (
              <div className="bg-[#E7C768]/15 border-2 border-[#E7C768] p-3 rounded-2xl text-xs text-[#1A1A1A] space-y-1">
                <div className="font-bold text-[#1E4468]">✨ Приглашение по прямой ссылке!</div>
                <div>Вы регистрируетесь на должность: <strong className="text-[#1E4468]">{inviteRole}</strong></div>
                <div className="text-[10px] text-gray-500">После регистрации Робот Рекрутер сразу откроет этап онбординга.</div>
              </div>
            )}

            {/* Role Toggles (Only if not arriving from direct project invitation) */}
            {!inviteProjectId && (
              <div className="grid grid-cols-2 p-1 bg-[#EFEFEF] rounded-2xl border border-[#DBDBDB]">
                <button
                  type="button"
                  onClick={() => setRole("candidate")}
                  className={`cursor-pointer text-xs md:text-sm font-bold py-2.5 rounded-xl transition-all ${
                    role === "candidate"
                      ? "bg-[#1E4468] text-white border border-[#1E4468] shadow"
                      : "text-gray-500 hover:text-[#1A1A1A]"
                  }`}
                >
                  Я Кандидат
                </button>
                <button
                  type="button"
                  onClick={() => setRole("employer")}
                  className={`cursor-pointer text-xs md:text-sm font-bold py-2.5 rounded-xl transition-all ${
                    role === "employer"
                      ? "bg-[#1E4468] text-white border border-[#1E4468] shadow"
                      : "text-gray-500 hover:text-[#1A1A1A]"
                  }`}
                >
                  Я Работодатель
                </button>
              </div>
            )}

            {/* Input Form Fields */}
            <div className="space-y-4">
              
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">ФИО / Полное Имя:</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Например: Иван Смирнов"
                    className={`w-full bg-[#EFEFEF] text-sm text-[#1A1A1A] pl-10 pr-4 py-2.5 rounded-xl border ${
                      errorText && !name ? "border-[#FF4C4C]" : "border-[#DBDBDB]"
                    } focus:outline-none focus:border-[#E7C768] focus:ring-1 focus:ring-[#E7C768] transition`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">Электронная почта (Email):</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="example@gmail.com"
                    className={`w-full bg-[#EFEFEF] text-sm text-[#1A1A1A] pl-10 pr-4 py-2.5 rounded-xl border ${
                      errorText && (!email || !email.includes("@")) ? "border-[#FF4C4C]" : "border-[#DBDBDB]"
                    } focus:outline-none focus:border-[#E7C768] focus:ring-1 focus:ring-[#E7C768] transition`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Telegram Handle */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 block">Имя пользователя TG (Telegram):</label>
                  <span className="text-[10px] text-gray-500">Для оперативных отчетов</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2 text-sm font-bold text-gray-400">@</span>
                  <input
                    type="text"
                    placeholder="nickname"
                    className="w-full bg-[#EFEFEF] text-sm text-[#1A1A1A] pl-8 pr-4 py-2.5 rounded-xl border border-[#DBDBDB] focus:outline-none focus:border-[#E7C768] focus:ring-1 focus:ring-[#E7C768] transition"
                    value={telegramUsername}
                    onChange={(e) => setTelegramUsername(e.target.value)}
                  />
                </div>
              </div>

              {/* Optional Telegram User ID */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block flex items-center justify-between">
                  <span>Ваш Telegram ID (опционально):</span>
                  <a
                    href="https://t.me/HR_RRbot"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-[#1E4468] hover:underline"
                  >
                    узнать у @HR_RRbot
                  </a>
                </label>
                <input
                  type="text"
                  placeholder="Например: 5894109"
                  className="w-full bg-[#EFEFEF] text-sm text-[#1A1A1A] px-4 py-2.5 rounded-xl border border-[#DBDBDB] focus:outline-none focus:border-[#E7C768] focus:ring-1 focus:ring-[#E7C768] transition"
                  value={telegramId}
                  onChange={(e) => setTelegramId(e.target.value)}
                />
              </div>

            </div>

            {/* Error Message banner */}
            {errorText && (
              <div className="bg-[#FF4C4C]/10 border-l-4 border-[#FF4C4C] p-3 text-xs text-[#FF4C4C] rounded font-semibold">
                ⚠️ {errorText}
              </div>
            )}

            {/* Success message banner */}
            {isSuccess && (
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 text-xs text-emerald-700 rounded animate-pulse font-semibold">
                ✅ Успешная авторизация! Вход в систему...
              </div>
            )}

            {/* Sign-In Action triggers */}
            <div className="flex flex-col gap-3 pt-2">
              <button
                type="button"
                id="btn_tg_register"
                disabled={isLoading || isSuccess}
                onClick={() => handleAuth("telegram")}
                className="cursor-pointer bg-gradient-to-r from-[#FF1A1A] to-[#E54C00] text-white hover:opacity-95 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-all shadow-md transform active:scale-98 disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-white" />
                Продолжить и войти
              </button>

              <button
                type="button"
                id="btn_google_register"
                disabled={isLoading || isSuccess}
                onClick={() => handleAuth("google")}
                className="cursor-pointer bg-[#EFEFEF] hover:bg-white border border-[#DBDBDB] text-[#1A1A1A] font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-all shadow transform active:scale-98 disabled:opacity-50"
              >
                <Chrome className="w-4 h-4 text-[#D99E41]" />
                Войти через аккаунт Google
              </button>
            </div>

            <div className="text-[10px] text-gray-500 text-center uppercase tracking-widest leading-relaxed">
              Сервис Робот Рекрутер гарантирует безопасность ваших данных
            </div>

          </div>

        </div>
      </main>

      {/* Small Legal text footer */}
      <footer className="py-4 text-center text-xs text-gray-600 border-t border-[#DBDBDB] bg-white">
        HR-RR.ru © 2026 Робот Рекрутер. Все права защищены.
      </footer>

    </div>
  );
}
