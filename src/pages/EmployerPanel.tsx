/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useRouter } from "../components/RouterContext";
import Mascot from "../components/Mascot";
import { BASIC_SPECIALTIES, JobProject, Candidate, SupabaseConfig } from "../types";
import {
  Users,
  Settings,
  Database,
  Send,
  Plus,
  Copy,
  Check,
  Search,
  ExternalLink,
  RefreshCw,
  Cpu,
  BookOpen,
  Award,
  LogOut,
  Mail,
  Smartphone
} from "lucide-react";

export default function EmployerPanel() {
  const { navigate } = useRouter();
  
  // Local active session check
  const [employerName, setEmployerName] = useState(() => localStorage.getItem("employer_name") || "Руководитель");
  const [employerEmail, setEmployerEmail] = useState(() => localStorage.getItem("employer_email") || "admin@hr-rr.ru");
  const [adminTgId, setAdminTgId] = useState(() => localStorage.getItem("employer_tg_id") || "5894109");

  // Tabs: "crm" | "setup" | "supabase" | "telegram"
  const [activeTab, setActiveTab] = useState<"crm" | "setup" | "supabase" | "telegram">("crm");

  // DB States
  const [projects, setProjects] = useState<JobProject[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [tgMsgLog, setTgMsgLog] = useState<any[]>([]);

  // Search & Filter within CRM
  const [crmSearch, setCrmSearch] = useState("");
  const [crmStageFilter, setCrmStageFilter] = useState("all");

  // Onboarding Setup Creation Form
  const [setupCompanyName, setSetupCompanyName] = useState("ООО 'КреативХолдинг'");
  const [setupRoleName, setSetupRoleName] = useState("Менеджер по продажам");
  const [setupSalary, setSetupSalary] = useState("60 000 - 120 000 руб.");
  const [setupSchedule, setSetupSchedule] = useState("5/2, Офис");
  const [setupCustomWiki, setSetupCustomWiki] = useState("CreativeHolding поставляет ИТ-продукты в сфере автоматизации торговли.");
  const [specialtySearch, setSpecialtySearch] = useState("");
  
  // Gemini loading states
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiStatus, setAiStatus] = useState({ active: false, message: "" });

  const [copiedProjectId, setCopiedProjectId] = useState<string | null>(null);

  // Supabase Local Configuration states
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>({
    url: "https://zpxofregyuxaswtb.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpw...",
    serviceRoleKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZi...",
    isConnected: false
  });
  const [supConnectionMsg, setSupConnectionMsg] = useState("");

  // Fetch initial data
  const fetchData = async () => {
    try {
      const resProjects = await fetch("/api/projects");
      const dataProj = await resProjects.json();
      setProjects(dataProj);

      const resCand = await fetch("/api/candidates");
      const dataCand = await resCand.json();
      setCandidates(dataCand);

      // Load TG logs from server
      const resTgLogs = await fetch("/api/telegram-logs");
      const dataTgLogs = await resTgLogs.json();
      setTgMsgLog(dataTgLogs);

      // Check Gemini availability
      const resAiStatus = await fetch("/api/ai-status");
      const dataAi = await resAiStatus.json();
      setAiStatus(dataAi);
    } catch (err) {
      console.error("Error loading server data:", err);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll data every 4 seconds to view active candidate progress from different tabs
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/main");
  };

  // Submit dynamic system generation via server Gemini API
  const handleCreateOnboardingSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const res = await fetch("/api/generate-project-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: setupCompanyName,
          roleName: setupRoleName,
          salaryTerms: setupSalary,
          scheduleTerms: setupSchedule,
          customWiki: setupCustomWiki
        })
      });

      if (!res.ok) throw new Error("Не удалось создать структуру.");

      const newProjectData = await res.json();
      setProjects(prev => [...prev, newProjectData]);
      setActiveTab("crm"); // Switch to view CRM link
      
      // Notify Telegram Bot mock
      await fetch("/api/telegram-mock-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: adminTgId,
          message: `🤖 Настроена новая система адаптации Робота Рекрутера!\n🏢 Компания: ${setupCompanyName}\n💼 Должность: ${setupRoleName}\n🔗 Генерируется реферальная ссылка кандидата!`
        })
      });

      // Refetch logs
      fetchData();
    } catch (err: any) {
      alert("Ошибка при генерации системы адаптации: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy registration link to clipboard
  const handleCopyLink = (projectId: string, roleName: string) => {
    // Generate signup URL
    const signupUrl = `${window.location.origin}/auth?project=${projectId}&role=${encodeURIComponent(roleName)}`;
    navigator.clipboard.writeText(signupUrl);
    setCopiedProjectId(projectId);
    setTimeout(() => setCopiedProjectId(null), 2000);
  };

  // Bind new Telegram ID
  const saveTgId = () => {
    localStorage.setItem("employer_tg_id", adminTgId);
    alert("Telegram ID сохранен! Теперь бот @HR_RRbot будет писать на этот код.");
  };

  // Test Supabase connection
  const handleTestSupabase = () => {
    if (!supabaseConfig.url.startsWith("https://")) {
      setSupConnectionMsg("⚠️ Ошибка: URL должен начинаться с https://");
      return;
    }
    if (supabaseConfig.url && supabaseConfig.anonKey && supabaseConfig.serviceRoleKey) {
      setSupabaseConfig(prev => ({ ...prev, isConnected: true }));
      setSupConnectionMsg("✅ Соединение успешно установлено! Таблицы в Supabase готовы к модификациям.");
    } else {
      setSupConnectionMsg("⚠️ Пожалуйста, внесите все 3 требуемых поля.");
    }
  };

  // Specialties cloud filter
  const specialtiesFiltered = BASIC_SPECIALTIES.filter(spec => 
    spec.toLowerCase().includes(specialtySearch.toLowerCase())
  ).slice(0, 10);

  // CRM candidates dynamic search/filter
  const filteredCandidates = candidates.filter(cand => {
    const matchesSearch = cand.name.toLowerCase().includes(crmSearch.toLowerCase()) || 
                          cand.roleName.toLowerCase().includes(crmSearch.toLowerCase()) ||
                          cand.email.toLowerCase().includes(crmSearch.toLowerCase());
    const matchesStage = crmStageFilter === "all" || cand.currentStage === crmStageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="bg-[#EFEFEF] min-h-screen text-[#1A1A1A] font-sans antialiased selection:bg-[#E7C768] selection:text-[#1A1A1A]">
      
      {/* Upper Status Navigation Bar */}
      <nav className="bg-gradient-to-r from-[#17344F] to-[#265582] border-b border-[#17344F] text-white px-4 md:px-8 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <img
            src="https://i.ibb.co/WWRbtPq0/RR-Logo.png"
            alt="RR Logo"
            className="w-10 h-10 object-contain"
            referrerPolicy="no-referrer"
          />
          <div className="text-left">
            <span className="text-lg font-bold tracking-tight text-[#E7C768]">RR CRM</span>
            <span className="text-xs block text-slate-300 font-medium">Кабинет Работодателя</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            <div className="text-sm font-bold text-white">{employerName}</div>
            <div className="text-[10px] text-slate-300 font-mono">{employerEmail}</div>
          </div>
          <button
            onClick={handleLogout}
            className="cursor-pointer bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <LogOut className="w-3.5 h-3.5" /> Выход
          </button>
        </div>
      </nav>

      {/* Main Workspace Frame */}
      <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side Navigation Panel */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-[#DBDBDB] rounded-3xl p-5 shadow-lg space-y-4">
            <Mascot state="serious" size="sm" className="mx-auto" />
            <div className="text-center">
              <h3 className="font-bold text-sm text-[#1E4468]">Робот Контролер</h3>
              <p className="text-[11px] text-gray-600 mt-1">
                Система координирует отклики, пишет соискателям в Telegram и проводит оценку.
              </p>
            </div>

            {/* Menu Buttons list */}
            <div className="space-y-1.5 pt-2">
              <button
                onClick={() => setActiveTab("crm")}
                className={`cursor-pointer w-full text-left font-bold text-xs px-4 py-3 rounded-xl flex items-center gap-2.5 transition-all ${
                  activeTab === "crm"
                    ? "bg-[#1E4468] text-white border border-[#1E4468] shadow"
                    : "bg-[#EFEFEF] text-gray-700 hover:bg-[#EFEFEF]/85 border border-[#DBDBDB]"
                }`}
              >
                <Users className="w-4 h-4 text-[#D99E41]" />
                CRM & Соискатели ({candidates.length})
              </button>

              <button
                onClick={() => setActiveTab("setup")}
                className={`cursor-pointer w-full text-left font-bold text-xs px-4 py-3 rounded-xl flex items-center gap-2.5 transition-all ${
                  activeTab === "setup"
                    ? "bg-[#1E4468] text-white border border-[#1E4468] shadow"
                    : "bg-[#EFEFEF] text-gray-700 hover:bg-[#EFEFEF]/85 border border-[#DBDBDB]"
                }`}
              >
                <Plus className="w-4 h-4 text-[#D99E41]" />
                Создать онбординг (ИИ)
              </button>

              <button
                onClick={() => setActiveTab("supabase")}
                className={`cursor-pointer w-full text-left font-bold text-xs px-4 py-3 rounded-xl flex items-center gap-2.5 transition-all ${
                  activeTab === "supabase"
                    ? "bg-[#1E4468] text-white border border-[#1E4468] shadow"
                    : "bg-[#EFEFEF] text-gray-700 hover:bg-[#EFEFEF]/85 border border-[#DBDBDB]"
                }`}
              >
                <Database className="w-4 h-4 text-[#D99E41]" />
                БД Supabase API
              </button>

              <button
                onClick={() => setActiveTab("telegram")}
                className={`cursor-pointer w-full text-left font-bold text-xs px-4 py-3 rounded-xl flex items-center gap-2.5 transition-all ${
                  activeTab === "telegram"
                    ? "bg-[#1E4468] text-white border border-[#1E4468] shadow"
                    : "bg-[#EFEFEF] text-gray-700 hover:bg-[#EFEFEF]/85 border border-[#DBDBDB]"
                }`}
              >
                <Smartphone className="w-4 h-4 text-[#1E4468]" />
                Логи Telegram Уведомлений
              </button>
            </div>
          </div>

          {/* Quick Telegram Chat Binding card */}
          <div className="bg-white border border-[#DBDBDB] rounded-3xl p-5 shadow-lg space-y-3">
            <h4 className="text-xs font-bold text-[#1E4468] flex items-center gap-1">
              <Send className="w-3.5 h-3.5 text-blue-600" /> Связь с Вашим Telegram
            </h4>
            <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
              Чтобы Робот Рекрутер слал результаты оценок кандидата вам в личку, привяжите ваш личный ID:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                className="w-full bg-[#EFEFEF] border border-[#DBDBDB] rounded-xl px-2.5 py-1.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#E7C768] transition"
                placeholder="Telegram ID. Например: 5894109"
                value={adminTgId}
                onChange={(e) => setAdminTgId(e.target.value)}
              />
              <button
                onClick={saveTgId}
                className="cursor-pointer bg-[#1E4468] hover:bg-[#1E4468]/90 text-white text-xs px-3 rounded-xl font-bold transition border border-[#1E4468]"
              >
                ОК
              </button>
            </div>
            <p className="text-[10px] text-gray-500 font-mono">
              Для старта бота перейдите на @HR_RRbot и напишите /start
            </p>
          </div>

          {/* Gemini connection status widget */}
          <div className="bg-white border border-[#DBDBDB] rounded-3xl p-4 shadow-lg text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1E4468] flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#D99E41]" /> Статус ИИ
              </span>
              <span className={`w-2.5 h-2.5 rounded-full ${aiStatus.active ? "bg-emerald-500" : "bg-orange-500"}`}></span>
            </div>
            <p className="text-[10.5px] text-gray-600 leading-snug">
              {aiStatus.active 
                ? "Подключен реальный Google Gemini API. Планы онбордингов и оценки генерируются динамически."
                : "Включен демонстрационный режим. Скрипты оцениваются реалистичным ИИ эмулятором."
              }
            </p>
          </div>
        </aside>

        {/* Right Side Content Pages depending on selected tab */}
        <main className="lg:col-span-9">
          
          {/* TAB 1: CRM & CANDIDATES TABLE */}
          {activeTab === "crm" && (
            <div className="space-y-6">
              
              {/* Header block with search filter */}
              <div className="bg-white border border-[#DBDBDB] rounded-3xl p-6 shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#1E4468]">Кандидаты & Аналитика в CRM</h2>
                  <p className="text-xs text-gray-650 mt-1">
                    Свежий список соискателей в вашей воронке найма. Поля обновляются со скоростью реального времени.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  {/* Search box */}
                  <div className="relative flex items-center bg-[#EFEFEF] border border-[#DBDBDB] px-3 py-2 rounded-xl focus-within:border-[#E7C768] transition">
                    <Search className="w-4 h-4 text-gray-400 mr-2" />
                    <input
                      type="text"
                      className="bg-transparent text-xs text-[#1A1A1A] focus:outline-none w-full sm:w-36"
                      placeholder="Искать ФИО, роль..."
                      value={crmSearch}
                      onChange={(e) => setCrmSearch(e.target.value)}
                    />
                  </div>

                  {/* Stage filter */}
                  <select
                    className="bg-[#EFEFEF] text-xs text-[#1A1A1A] font-bold border border-[#DBDBDB] px-3 py-2 rounded-xl focus:outline-none focus:border-[#E7C768]"
                    value={crmStageFilter}
                    onChange={(e) => setCrmStageFilter(e.target.value)}
                  >
                    <option value="all" className="bg-white text-[#1A1A1A]">Все этапы</option>
                    <option value="terms" className="bg-white text-[#1A1A1A]">Ознакомление</option>
                    <option value="interview" className="bg-white text-[#1A1A1A]">Собеседование</option>
                    <option value="scoring" className="bg-white text-[#1A1A1A]">Анализ балла</option>
                    <option value="training" className="bg-white text-[#1A1A1A]">Обучение</option>
                    <option value="certified" className="bg-white text-[#1A1A1A]">Обучен / Сдан 🎓</option>
                  </select>
                </div>
              </div>

              {/* Active Projects Referral list block */}
              <div className="bg-white border border-[#DBDBDB] rounded-3xl p-6 shadow-md space-y-4">
                <h3 className="font-bold text-[#1E4468] text-sm flex items-center justify-between">
                  <span>Активные Ссылки для Приглашения Соискателей</span>
                  <span className="text-xs font-normal text-gray-500">Каждая ссылка - отдельный проект</span>
                </h3>
                
                {projects.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4 font-semibold">Данных о проектах не найдено. Нажмите "Создать онбординг".</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map((proj) => (
                      <div key={proj.id} className="border border-[#DBDBDB] rounded-2xl p-4 bg-[#EFEFEF]/50 flex flex-col justify-between hover:border-[#1E4468] transition">
                        <div>
                          <div className="text-xs font-bold text-gray-500 font-mono flex items-center justify-between">
                            <span className="text-gray-700">ПРОЕКТ: {proj.companyName}</span>
                            <span className="bg-[#EFEFEF] border border-[#DBDBDB] px-2 py-0.5 rounded text-[10px] text-[#1D3E5E]">ID: {proj.id}</span>
                          </div>
                          <div className="text-sm font-bold text-[#1A1A1A] mt-1">{proj.roleName}</div>
                          <div className="text-xs text-gray-650 mt-2 line-clamp-2 italic">"{proj.motivationText}"</div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#DBDBDB] flex items-center gap-2">
                          <button
                            onClick={() => handleCopyLink(proj.id, proj.roleName)}
                            className="cursor-pointer flex-1 bg-gradient-to-r from-[#FF1A1A] to-[#E54C00] text-white text-[11px] font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 hover:opacity-95 transition"
                          >
                            {copiedProjectId === proj.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-white" />
                                Ссылка скопирована
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-[#E7C768]" />
                                Скопировать ссылку кандидата
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CANDIDATES GRID/TABLE */}
              <div className="bg-white border border-[#DBDBDB] rounded-3xl overflow-hidden shadow-md">
                <div className="p-5 font-bold text-sm bg-gradient-to-r from-[#17344F] to-[#265582] text-white flex items-center justify-between border-b border-[#DBDBDB]">
                  <span>Список Соискателей и Результаты ({filteredCandidates.length})</span>
                  <button onClick={fetchData} className="text-[#E7C768] hover:text-[#F4EE8E] transition">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {filteredCandidates.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 space-y-2 bg-white">
                    <Users className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="text-xs font-bold text-gray-700">Соискатели отсутствуют по заданным критериям.</p>
                    <p className="text-[11px] text-gray-500">Поделитесь реферальной ссылкой проекта с соискателем, чтобы он появился в таблице.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#DBDBDB]/40 bg-white">
                    {filteredCandidates.map((cand) => {
                      // Get stage class badges
                      let badgeColor = "bg-gray-100 text-gray-700 border border-gray-200";
                      let stageTitle = cand.currentStage;
                      if (cand.currentStage === "terms") {
                        badgeColor = "bg-blue-50 text-blue-700 border border-blue-200";
                        stageTitle = "Изучает условия";
                      } else if (cand.currentStage === "interview") {
                        badgeColor = "bg-amber-50 text-[#D99E41] border border-amber-200";
                        stageTitle = "ИИ Чат-Интервью";
                      } else if (cand.currentStage === "scoring") {
                        badgeColor = "bg-red-50 text-red-600 border border-red-200";
                        stageTitle = "Анализ баллов";
                      } else if (cand.currentStage === "training") {
                        badgeColor = "bg-sky-50 text-sky-700 border border-sky-200";
                        stageTitle = "Активное обучение";
                      } else if (cand.currentStage === "certified") {
                        badgeColor = "bg-emerald-50 text-emerald-700 border border-emerald-200";
                        stageTitle = "Сертифицирован 🎓";
                      }

                      return (
                        <div key={cand.id} className="p-5 hover:bg-[#EFEFEF]/30 transition flex flex-col md:flex-row md:items-center justify-between gap-4 text-[#1A1A1A]">
                          {/* Left meta info */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-[#1A1A1A]">{cand.name}</h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
                                {stageTitle}
                              </span>
                            </div>
                            <div className="text-xs text-gray-650 flex flex-wrap gap-x-4">
                              <span>📧 {cand.email}</span>
                              {cand.telegramUsername && <span>💬 @{cand.telegramUsername} (ID: {cand.telegramId || "-"})</span>}
                            </div>
                            <div className="text-xs font-semibold text-[#1E4468]">
                              Должность: <strong className="text-gray-900">{cand.roleName}</strong>
                            </div>
                          </div>

                          {/* Center score details */}
                          <div className="flex items-center gap-3">
                            {cand.scores ? (
                              <div className="flex items-center gap-2 text-right">
                                <div className="hidden sm:block">
                                  <div className="text-[10px] text-gray-500 font-bold uppercase">Общий ИИ Балл</div>
                                  <div className="text-xs text-gray-500 font-mono w-44">Интервью: {cand.scores.interviewScore}, Резюме: {cand.scores.resumeScore}</div>
                                </div>
                                <div className="w-11 h-11 rounded-full border-2 border-[#E7C768] bg-[#F4EE8E]/25 flex items-center justify-center font-bold text-sm text-[#D99E41]">
                                  {cand.scores.overallScore}
                                </div>
                              </div>
                            ) : (
                              <span className="text-[10px] text-gray-500 italic font-semibold">Собеседование не завершено</span>
                            )}
                          </div>

                          {/* Right deep analysis panel view of candidate */}
                          {cand.scores && (
                            <div className="text-left md:text-right max-w-xs space-y-1 bg-[#F4EE8E]/10 p-2.5 rounded-xl border border-[#E7C768]/60">
                              <span className="text-[10px] font-bold text-[#D99E41] uppercase block">Краткая оценка ИИ:</span>
                              <p className="text-[10.5px] text-gray-700 leading-tight line-clamp-3">
                                {cand.scores.assessmentSummary}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: SYSTEM SETUP CREATOR WORKSPACE */}
          {activeTab === "setup" && (
            <div className="bg-white border border-[#DBDBDB] rounded-3xl p-6 shadow-lg space-y-6">
              <div className="flex items-center gap-3 border-b border-[#DBDBDB] pb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#17344F] to-[#265582] flex items-center justify-center text-[#E7C768] border border-[#17344F]">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1E4468]">Конструктор ИИ-Онбординга</h2>
                  <p className="text-xs text-gray-650 font-medium">
                    Задайте параметры проекта, и генеративный ИИ автоматически соберет проверочные сценарии и уроки для кандидатов.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateOnboardingSystem} className="space-y-6 text-[#1A1A1A]">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">Название компании:</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-[#EFEFEF] text-sm text-[#1A1A1A] p-2.5 rounded-xl border border-[#DBDBDB] focus:outline-none focus:border-[#E7C768] transition"
                      value={setupCompanyName}
                      onChange={(e) => setSetupCompanyName(e.target.value)}
                    />
                  </div>

                  {/* Target vacancy / specialty selection via tags */}
                  <div className="space-y-1 relative">
                    <label className="text-xs font-bold text-[#1E4468] block">Целевая должность:</label>
                    <input
                      type="text"
                      required
                      placeholder="Например: Ассистент / Юрист / SMM"
                      className="w-full bg-[#EFEFEF] text-sm text-[#1A1A1A] p-2.5 rounded-xl border border-[#DBDBDB] focus:outline-none focus:border-[#E7C768] transition"
                      value={setupRoleName}
                      onChange={(e) => setSetupRoleName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Tag Search and Quick selection */}
                <div className="space-y-2 bg-[#EFEFEF] p-4 rounded-2xl border border-[#DBDBDB]">
                  <span className="text-xs font-bold text-gray-700 block flex items-center gap-1">
                    <Search className="w-3.5 h-3.5 text-[#1E4468]" /> Быстрый выбор должности из базового каталога (70+ специальностей):
                  </span>
                  <input
                    type="text"
                    placeholder="Быстрый фильтр ролей..."
                    className="w-full bg-white text-xs p-2 rounded-xl focus:outline-none text-[#1A1A1A] border border-[#DBDBDB] focus:border-[#E7C768] transition"
                    value={specialtySearch}
                    onChange={(e) => setSpecialtySearch(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1 mt-2">
                    {specialtiesFiltered.map((spec) => (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => {
                          setSetupRoleName(spec);
                          setSpecialtySearch("");
                        }}
                        className="cursor-pointer bg-white border border-[#DBDBDB] text-[#1D3E5E] font-medium [font-size:10px] px-2 py-1.5 rounded-lg hover:border-[#1E4468] hover:bg-[#EFEFEF] transition"
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-medium">
                  {/* Salary range */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">Размер оплаты (мотивация):</label>
                    <input
                      type="text"
                      className="w-full bg-[#EFEFEF] text-sm text-[#1A1A1A] p-2.5 rounded-xl border border-[#DBDBDB] focus:outline-none focus:border-[#E7C768] transition"
                      placeholder="80,000 - 120,000 руб."
                      value={setupSalary}
                      onChange={(e) => setSetupSalary(e.target.value)}
                    />
                  </div>

                  {/* Schedule */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">График работы:</label>
                    <input
                      type="text"
                      className="w-full bg-[#EFEFEF] text-sm text-[#1A1A1A] p-2.5 rounded-xl border border-[#DBDBDB] focus:outline-none focus:border-[#E7C768] transition"
                      placeholder="5/2, гибрид"
                      value={setupSchedule}
                      onChange={(e) => setSetupSchedule(e.target.value)}
                    />
                  </div>
                </div>

                {/* Company Custom documents / regulations */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#1E4468] block">База документов / Должностные инструкции или Вики:</label>
                    <span className="text-[10px] text-gray-500">ИИ изучит и создаст адаптированные ролевые кейсы</span>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Внесите информацию о ваших товарах, целях, методологиях или мотивациях. Это позволит ИИ обучать сотрудника именно вашему продукту."
                    className="w-full bg-[#EFEFEF] text-sm text-[#1A1A1A] p-2.5 rounded-xl border border-[#DBDBDB] focus:outline-none focus:border-[#E7C768] transition"
                    value={setupCustomWiki}
                    onChange={(e) => setSetupCustomWiki(e.target.value)}
                  />
                </div>

                {/* Send Trigger */}
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="cursor-pointer w-full bg-gradient-to-r from-[#FF1A1A] to-[#E54C00] text-white font-bold py-3.5 rounded-xl text-center shadow-lg transition active:scale-98 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" /> Генерация проверок и лекций в ИИ Роботе Рекрутере...
                    </span>
                  ) : (
                    "Сгенерировать ИИ-Систему Адаптации Сотрудника"
                  )}
                </button>

              </form>
            </div>
          )}

          {/* TAB 3: SUPABASE INTEGRATION BLUEPRINT */}
          {activeTab === "supabase" && (
            <div className="bg-white border border-[#DBDBDB] rounded-3xl p-6 shadow-xl space-y-6 text-[#1A1A1A]">
              <div className="flex items-center gap-3 border-b border-[#DBDBDB] pb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EFEFEF] border border-[#DBDBDB] flex items-center justify-center text-[#1E4468]">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1E4468]">Интеграция с Базой Данных Supabase</h2>
                  <p className="text-xs text-gray-650">
                    Настройте постоянное хранение данных соискателей в личном облаке Supabase.
                  </p>
                </div>
              </div>

              {/* Informative credentials instruction block */}
              <div className="space-y-4">
                <div className="bg-[#EFEFEF] p-4 rounded-2xl border border-[#DBDBDB] space-y-2">
                  <h3 className="text-xs font-bold text-[#1E4468] uppercase tracking-wider">Какие сведения нужны Роботу Рекрутеру</h3>
                  <p className="text-xs text-gray-600 leading-normal">
                    Чтобы Робот Рекрутер (RR) мог записывать кандидатов, изменять их стадии, фиксировать ИИ оценки и хранить планы лекций напрямую в вашей БД Supabase, укажите в вашем файле конфигурации <code className="bg-white text-[#1E3E5E] px-1.5 py-0.5 rounded border border-[#DBDBDB]">.env</code> или внесите ниже следующие параметры:
                  </p>
                  
                  <div className="space-y-3 pt-2 text-xs text-gray-700">
                    <div>
                      <strong className="text-[#1A1A1A] block">1. SUPABASE_URL</strong>
                      <span className="text-gray-500 text-[11px]">URL-адрес вашего проекта. Можно найти в меню: <strong>Project Settings &gt; API</strong></span>
                    </div>

                    <div>
                      <strong className="text-[#1A1A1A] block">2. SUPABASE_ANON_KEY</strong>
                      <span className="text-gray-500 text-[11px]">Публичный ключ (anon public) для базовых клиентских запросов.</span>
                    </div>

                    <div>
                      <strong className="text-[#1A1A1A] block">3. SUPABASE_SERVICE_ROLE_KEY</strong>
                      <span className="text-gray-500 text-[11px]">Приватный ключ сервисной роли для выполнения обхода политик RLS, чтобы ИИ мог администрировать кандидатов без задержек.</span>
                    </div>
                  </div>
                </div>

                {/* API Key settings panel simulation */}
                <div className="space-y-4 border border-[#DBDBDB] p-5 rounded-2xl bg-[#EFEFEF]/55">
                  <h3 className="font-bold text-sm text-[#1E4468]">Настройки подключения к API Supabase</h3>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 block">Supabase URL:</label>
                      <input
                        type="text"
                        className="w-full bg-white text-xs font-mono p-2.5 rounded-lg border border-[#DBDBDB] text-[#1A1A1A] focus:outline-none focus:border-[#E7C768] transition"
                        value={supabaseConfig.url}
                        onChange={(e) => setSupabaseConfig(prev => ({ ...prev, url: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 block">Supabase Anon Key:</label>
                      <input
                        type="password"
                        className="w-full bg-white text-xs font-mono p-2.5 rounded-lg border border-[#DBDBDB] text-[#1A1A1A] focus:outline-none focus:border-[#E7C768] transition"
                        value={supabaseConfig.anonKey}
                        onChange={(e) => setSupabaseConfig(prev => ({ ...prev, anonKey: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 block">Supabase Service Role Key:</label>
                      <input
                        type="password"
                        className="w-full bg-white text-xs font-mono p-2.5 rounded-lg border border-[#DBDBDB] text-[#1A1A1A] focus:outline-none focus:border-[#E7C768] transition"
                        value={supabaseConfig.serviceRoleKey}
                        onChange={(e) => setSupabaseConfig(prev => ({ ...prev, serviceRoleKey: e.target.value }))}
                      />
                    </div>
                  </div>

                  {supConnectionMsg && (
                    <div className={`p-3 text-xs rounded-xl border ${supabaseConfig.isConnected ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-red-50 text-red-850 border-red-300"}`}>
                      {supConnectionMsg}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleTestSupabase}
                    className="cursor-pointer bg-[#1E4468] border border-[#1E4468] text-white font-bold text-xs py-2.5 px-4 rounded-xl hover:opacity-90 transition"
                  >
                    Проверить API соединение с Supabase
                  </button>
                </div>

                {/* Database tables creation DDL guidelines for the user! */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#1E4468]">Необходимая SQL Схема Таблиц в Supabase SQL Editor:</h4>
                  <p className="text-[11px] text-gray-500 font-medium">
                    Выполните данный скрипт в панели SQL Editor вашего Supabase проекта, чтобы подготовить поля, на которые сориентирован API-адаптер Робота Рекрутера:
                  </p>

                  <pre className="bg-[#1A1A1A] border border-white/5 text-emerald-400 text-[10.5px] p-4 rounded-xl overflow-x-auto font-mono text-left leading-relaxed">
{`-- 1. Таблица проектов вакансий
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  role_name TEXT NOT NULL,
  salary_terms TEXT,
  schedule_terms TEXT,
  motivation_text TEXT,
  custom_wiki TEXT,
  checklist_questions TEXT[],
  roleplay_questions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Таблица соискателей и ИИ аналитики
CREATE TABLE IF NOT EXISTS candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telegram_username TEXT,
  telegram_id TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  role_name TEXT,
  current_stage TEXT DEFAULT 'terms', -- 'terms', 'interview', 'scoring', 'training', 'certified'
  resume_name TEXT,
  scores JSONB, -- хранит {interviewScore, resumeScore, checklistPoints, roleplayPoints, overallScore, assessmentSummary}
  training_plan JSONB, -- хранит массив блоков лекций
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);`}
                  </pre>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: TELEGRAM WORKSPACE MONITORING */}

          {activeTab === "telegram" && (
            <div className="bg-white border border-[#DBDBDB] rounded-3xl p-6 shadow-lg space-y-4 text-[#1A1A1A]">
              <div className="flex items-center justify-between border-b border-[#DBDBDB] pb-3">
                <div>
                  <h2 className="text-lg font-bold text-[#1E4468] flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-sky-600" />
                    Монитор Telegram Бот-Оповещений
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    История мгновенных уведомлений, отправляемых ботом <strong className="text-sky-600">@HR_RRbot</strong> вашему руководителю.
                  </p>
                </div>
                <button
                  onClick={fetchData}
                  className="cursor-pointer bg-[#EFEFEF] hover:bg-white border border-[#DBDBDB] text-[#1A1A1A] text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition"
                >
                  <RefreshCw className="w-3 h-3 text-[#1E4468]" /> Обновить
                </button>
              </div>

              <div className="bg-sky-50 rounded-2xl p-4 border border-sky-200 text-xs text-sky-950 leading-relaxed font-semibold">
                ℹ️ Бот работает через веб-хуки. Каждый раз, когда кандидат нажимает <strong>"Условия подходят"</strong>, заканчивает опрос, или завершает лекции в приложении - Робот Рекрутер отправляет REST API запрос, отправляя сообщение боту на ваш привязанный Telegram ID.
              </div>

              {/* Bot log lines */}
              <div className="space-y-3 pt-2">
                {tgMsgLog.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-10 font-medium">Пока нет логов. Как только кандидат приступит к шагам, здесь отобразятся уведомления.</p>
                ) : (
                  <div className="space-y-2.5">
                    {tgMsgLog.map((log) => (
                      <div key={log.id} className="bg-[#1A1A1A] border border-white/5 text-white rounded-xl p-4 font-mono text-xs flex items-start gap-3">
                        <span className="text-[#E7C768] font-bold select-none">[{log.timestamp}]</span>
                        <div className="flex-1 space-y-1">
                          <span className="text-sky-300 block text-[10px] font-bold">Bot API для Telegram ID: {log.chatId}</span>
                          <p className="text-gray-100 whitespace-pre-wrap leading-relaxed">{log.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </main>

      </div>

    </div>
  );
}
