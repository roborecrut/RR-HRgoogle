/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useRouter } from "../components/RouterContext";
import Mascot from "../components/Mascot";
import { JobProject, Candidate, BASIC_SPECIALTIES } from "../types";
import {
  Users,
  Smartphone,
  Plus,
  Send,
  Cpu,
  Search,
  RefreshCw,
  Copy,
  Check,
  CheckCircle,
  FileText,
  LogOut,
  Settings,
  ArrowLeftRight,
  Menu,
  X
} from "lucide-react";

export default function EmployerPanel() {
  const { navigate, path } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Local state for fetching
  const [projects, setProjects] = useState<JobProject[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [tgMsgLog, setTgMsgLog] = useState<{ id: string; chatId: string; message: string; timestamp: string }[]>([]);
  const [aiStatus, setAiStatus] = useState({ active: true, model: "" });

  const [activeTab, setActiveTab] = useState<"crm" | "setup" | "telegram">("crm");

  // Local form state for custom creation
  const [setupCompanyName, setSetupCompanyName] = useState("Мой Бизнес");
  const [setupRoleName, setSetupRoleName] = useState("Менеджер по продажам");
  const [setupSalary, setSetupSalary] = useState("70,000 - 110,000 руб");
  const [setupSchedule, setSetupSchedule] = useState("5/2, гибрид или удаленка");
  const [setupCustomWiki, setSetupCustomWiki] = useState("Мы — прогрессивная компания. Ценим честность, инициативность и скорость. Наш основной продукт – автоматизированное программное обеспечение. Кандидат должен владеть базовыми техниками отработки возражений и уметь составить коммерческое предложение.");

  const [adminTgId, setAdminTgId] = useState(() => localStorage.getItem("employer_tg_id") || "59384591");

  // Search filter terms
  const [specialtySearch, setSpecialtySearch] = useState("");
  const [crmSearch, setCrmSearch] = useState("");
  const [crmStageFilter, setCrmStageFilter] = useState("all");

  const [copiedProjectId, setCopiedProjectId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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

    // Check for parent navigation prefills
    const intentTab = localStorage.getItem("employer_active_tab_intent");
    if (intentTab) {
      setActiveTab(intentTab as any);
      localStorage.removeItem("employer_active_tab_intent");
    }

    const prefillRole = localStorage.getItem("employer_setup_role_prefill");
    if (prefillRole) {
      setSetupRoleName(prefillRole);
      setActiveTab("setup");
      localStorage.removeItem("employer_setup_role_prefill");
    }

    // Poll data every 4 seconds
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
    <div className="bg-gradient-to-b from-[#17344F] to-[#265582] min-h-screen text-white font-sans antialiased selection:bg-[#E7C768] selection:text-[#17344F] flex flex-col justify-between">
      
      {/* Top Header Navigation with Direct Access Bypasses */}
      <header className="sticky top-0 z-50 bg-[#17344F]/95 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-4">
        <div className="flex items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <img 
              src="https://i.ibb.co/WWRbtPq0/RR-Logo.png" 
              alt="RR Робот Рекрутер" 
              className="w-10 h-10 object-contain drop-shadow" 
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col text-left">
              <span className="text-xl font-bold tracking-tight text-[#E7C768]">
                Робот Рекрутер
              </span>
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-300">Кабинет Работодателя</span>
            </div>
          </div>

          {/* Global Multi-Page Navigation without authentication lock */}
          <nav className="hidden md:flex items-center justify-center gap-2 md:gap-4 text-xs md:text-sm font-semibold">
            <button 
              id="nav_landing"
              onClick={() => navigate("/main")} 
              className="transition px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10"
            >
              Главная
            </button>
            <button 
              id="nav_catalog"
              onClick={() => navigate("/vacancy")} 
              className="transition px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10"
            >
              Каталог Профессий
            </button>
            <button 
              id="nav_employer"
              onClick={() => setActiveTab("crm")} 
              className="transition px-3 py-2 rounded-xl text-[#E7C768] bg-white/10 border border-[#E7C768]/20"
            >
              Панель Работодателя 💼
            </button>
            <button 
              id="nav_candidate"
              onClick={() => navigate("/candidate")} 
              className="transition px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-1 bg-white/5 border border-white/10"
            >
              Кабинет Соискателя 🎓
            </button>
            <button 
              id="nav_admin"
              onClick={() => navigate("/admin")} 
              className="transition px-3 py-2 rounded-xl text-indigo-300 hover:text-indigo-150 flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20"
            >
              Админ ⚙️
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs block text-[#E7C768] font-bold">Руководитель</span>
              <span className="text-[10px] block text-slate-300 font-mono">admin@hr-rr.ru</span>
            </div>
            <button 
              onClick={handleLogout}
              className="cursor-pointer bg-white/10 hover:bg-white/20 text-white rounded-xl px-3 py-2 text-xs font-bold transition flex items-center gap-1 border border-white/10"
            >
              <LogOut className="w-3.5 h-3.5" /> Выйти
            </button>
          </div>

          {/* Mobile Burger Toggle Button */}
          <button 
            type="button"
            className="md:hidden flex items-center justify-center p-2 rounded-xl hover:bg-white/10 text-white transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-[#E7C768]" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-white/10 flex flex-col gap-3 font-semibold">
            <button 
              id="mobile_nav_landing"
              onClick={() => {
                navigate("/main");
                setMobileMenuOpen(false);
              }} 
              className="transition text-left w-full px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5"
            >
              Главная
            </button>
            <button 
              id="mobile_nav_catalog"
              onClick={() => {
                navigate("/vacancy");
                setMobileMenuOpen(false);
              }} 
              className="transition text-left w-full px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5"
            >
              Каталог Профессий
            </button>
            <button 
              id="mobile_nav_employer"
              onClick={() => {
                setActiveTab("crm");
                setMobileMenuOpen(false);
              }} 
              className="transition text-left w-full px-4 py-3 rounded-xl text-[#E7C768] bg-white/10 border border-[#E7C768]/20 flex items-center justify-between"
            >
              <span>Панель Работодателя</span>
              <span>💼</span>
            </button>
            <button 
              id="mobile_nav_candidate"
              onClick={() => {
                navigate("/candidate");
                setMobileMenuOpen(false);
              }} 
              className="transition text-left w-full px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 flex items-center justify-between"
            >
              <span>Кабинет Соискателя</span>
              <span>🎓</span>
            </button>
            <button 
              id="mobile_nav_admin"
              onClick={() => {
                navigate("/admin");
                setMobileMenuOpen(false);
              }} 
              className="transition text-left w-full px-4 py-3 border border-indigo-500/20 rounded-xl text-indigo-300 hover:text-indigo-150 bg-indigo-500/10"
            >
              Кабинет Администратора ⚙️
            </button>
            <div className="h-px bg-white/10 my-1"></div>
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 rounded-xl">
              <div className="text-left">
                <span className="text-[10px] block text-[#E7C768] font-bold">Руководитель</span>
                <span className="text-[9px] block text-slate-300 font-mono">admin@hr-rr.ru</span>
              </div>
              <button 
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="cursor-pointer bg-white/10 hover:bg-white/20 text-white rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1 border border-white/10"
              >
                <LogOut className="w-3.5 h-3.5 block" /> Выйти
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Workspace Frame */}
      <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 w-full flex-1">
        
        {/* Left Side Navigation Panel */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-[#1D3E5E]/85 border border-white/15 rounded-3xl p-5 shadow-xl space-y-4">
            <Mascot state="serious" size="sm" className="mx-auto" />
            <div className="text-center">
              <h3 className="font-bold text-sm text-[#E7C768]">Робот Контролер</h3>
              <p className="text-[11px] text-slate-200 mt-1">
                Система координирует отклики, пишет соискателям в Telegram и проводит оценку.
              </p>
            </div>

            {/* Menu Buttons list */}
            <div className="space-y-1.5 pt-2">
              <button
                onClick={() => setActiveTab("crm")}
                className={`cursor-pointer w-full text-left font-bold text-xs px-4 py-3 rounded-xl flex items-center gap-2.5 transition-all ${
                  activeTab === "crm"
                    ? "bg-[#1E4468] text-[#E7C768] border-2 border-[#E7C768] shadow"
                    : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
                }`}
              >
                <Users className="w-4 h-4 text-[#D99E41]" />
                CRM & Соискатели ({candidates.length})
              </button>

              <button
                onClick={() => setActiveTab("setup")}
                className={`cursor-pointer w-full text-left font-bold text-xs px-4 py-3 rounded-xl flex items-center gap-2.5 transition-all ${
                  activeTab === "setup"
                    ? "bg-[#1E4468] text-[#E7C768] border-2 border-[#E7C768] shadow"
                    : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
                }`}
              >
                <Plus className="w-4 h-4 text-[#D99E41]" />
                Создать онбординг (ИИ)
              </button>

              <button
                onClick={() => setActiveTab("telegram")}
                className={`cursor-pointer w-full text-left font-bold text-xs px-4 py-3 rounded-xl flex items-center gap-2.5 transition-all ${
                  activeTab === "telegram"
                    ? "bg-[#1E4468] text-[#E7C768] border-2 border-[#E7C768] shadow"
                    : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
                }`}
              >
                <Smartphone className="w-4 h-4 text-[#D99E41]" />
                Логи Бот-Оповещений
              </button>
            </div>
          </div>

          {/* Quick Telegram Chat Binding card */}
          <div className="bg-[#1D3E5E]/85 border border-white/15 rounded-3xl p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-[#E7C768] flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-sky-400" /> Связь с Вашим Telegram
            </h4>
            <p className="text-[11px] text-slate-200 leading-relaxed font-semibold">
              Чтобы Робот Рекрутер слал результаты оценок кандидата вам в личку, привяжите ваш личный ID:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                className="w-full bg-[#17344F]/50 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#E7C768] transition"
                placeholder="Telegram ID. Например: 5894109"
                value={adminTgId}
                onChange={(e) => setAdminTgId(e.target.value)}
              />
              <button
                onClick={saveTgId}
                className="cursor-pointer bg-gradient-to-r from-[#FF1A1A] to-[#E54C00] text-white text-xs px-3 rounded-xl font-bold transition"
              >
                ОК
              </button>
            </div>
            <p className="text-[10px] text-slate-300 font-mono">
              Для старта бота перейдите на @HR_RRbot и напишите /start
            </p>
          </div>

          {/* Gemini connection status widget */}
          <div className="bg-[#1D3E5E]/85 border border-white/15 rounded-3xl p-4 shadow-xl text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#E7C768] flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> Статус ИИ Режима
              </span>
              <span className={`w-2.5 h-2.5 rounded-full ${aiStatus.active ? "bg-emerald-500" : "bg-orange-500"}`}></span>
            </div>
            <p className="text-[10.5px] text-slate-300 leading-snug">
              {aiStatus.active 
                ? "Подключен реальный Google Gemini API на сервере. Оценки генерируются и анализируются динамически."
                : "Включен демонстрационный режим. Скрипты оцениваются эмулятором встроенного интеллекта."
              }
            </p>
          </div>
        </aside>

        {/* Right Side Content Pages depending on selected tab */}
        <main className="lg:col-span-9">
          
          {/* TAB 1: CRM & CANDIDATES TABLE */}
          {activeTab === "crm" && (
            <div className="space-y-6 text-white text-left">
              
              {/* Header block with search filter */}
              <div className="bg-[#1D3E5E]/85 border border-white/15 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#E7C768]">Кандидаты & Аналитика в CRM</h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Свежий список соискателей в вашей воронке найма. Поля обновляются со скоростью реального времени.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  {/* Search box */}
                  <div className="relative flex items-center bg-[#17344F]/50 border border-white/15 px-3 py-2 rounded-xl focus-within:border-[#E7C768] transition">
                    <Search className="w-4 h-4 text-slate-400 mr-2" />
                    <input
                      type="text"
                      className="bg-transparent text-xs text-white focus:outline-none w-full sm:w-36"
                      placeholder="Искать ФИО, роль..."
                      value={crmSearch}
                      onChange={(e) => setCrmSearch(e.target.value)}
                    />
                  </div>

                  {/* Stage filter */}
                  <select
                    className="bg-[#17344F] text-xs text-white font-bold border border-white/15 px-3 py-2 rounded-xl focus:outline-none focus:border-[#E7C768]"
                    value={crmStageFilter}
                    onChange={(e) => setCrmStageFilter(e.target.value)}
                  >
                    <option value="all" className="bg-[#17344F] text-white">Все этапы</option>
                    <option value="terms" className="bg-[#17344F] text-white">Ознакомление</option>
                    <option value="interview" className="bg-[#17344F] text-white">Собеседование</option>
                    <option value="scoring" className="bg-[#17344F] text-white">Анализ балла</option>
                    <option value="training" className="bg-[#17344F] text-white">Обучение</option>
                    <option value="certified" className="bg-[#17344F] text-white font-semibold">Обучен / Сдан 🎓</option>
                  </select>
                </div>
              </div>

              {/* Active Projects Referral list block */}
              <div className="bg-[#1D3E5E]/60 border border-white/10 rounded-3xl p-6 shadow-md space-y-4">
                <h3 className="font-bold text-[#E7C768] text-sm flex items-center justify-between">
                  <span>Активные Ссылки для Приглашения Соискателей</span>
                  <span className="text-xs font-normal text-slate-300">Каждая ссылка - отдельный проект</span>
                </h3>
                
                {projects.length === 0 ? (
                  <p className="text-xs text-slate-300 text-center py-4 font-semibold">Данных о проектах не найдено. Нажмите "Создать онбординг" или перейдите в каталог.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map((proj) => (
                      <div key={proj.id} className="border border-white/10 rounded-2xl p-4 bg-[#17344F]/50 flex flex-col justify-between hover:border-[#E7C768] transition">
                        <div>
                          <div className="text-xs font-bold text-slate-400 font-mono flex items-center justify-between">
                            <span className="text-slate-300">ПРОЕКТ: {proj.companyName}</span>
                            <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px] text-[#E7C768]">ID: {proj.id}</span>
                          </div>
                          <div className="text-sm font-bold text-white mt-1">{proj.roleName}</div>
                          <div className="text-xs text-slate-300 mt-2 line-clamp-2 italic">"{proj.motivationText}"</div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
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
                                Скопировать ссылку соискателя
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
              <div className="bg-[#1D3E5E]/40 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                <div className="p-5 font-bold text-sm bg-gradient-to-r from-[#17344F] to-[#265582] text-white flex items-center justify-between border-b border-white/10">
                  <span>Список Соискателей и Результаты ({filteredCandidates.length})</span>
                  <button onClick={fetchData} className="text-[#E7C768] hover:text-[#F4EE8E] transition">
                    <RefreshCw className="w-4 h-4 anim-spin" />
                  </button>
                </div>

                {filteredCandidates.length === 0 ? (
                  <div className="text-center py-12 text-slate-300 space-y-2 bg-[#1D3E5E]/10">
                    <Users className="w-10 h-10 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-200">Соискатели отсутствуют по заданным критериям.</p>
                    <p className="text-[11px] text-slate-400">Поделитесь реферальной ссылкой проекта с соискателем, чтобы он появился в таблице.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/10 bg-[#1D3E5E]/30 text-white">
                    {filteredCandidates.map((cand) => {
                      let badgeColor = "bg-slate-700/50 text-slate-300 border border-slate-600";
                      let stageTitle = cand.currentStage;
                      if (cand.currentStage === "terms") {
                        badgeColor = "bg-blue-500/20 text-blue-300 border border-blue-500/40";
                        stageTitle = "Изучает условия";
                      } else if (cand.currentStage === "interview") {
                        badgeColor = "bg-amber-500/20 text-[#E7C768] border border-amber-500/40";
                        stageTitle = "ИИ Чат-Интервью";
                      } else if (cand.currentStage === "scoring") {
                        badgeColor = "bg-red-500/20 text-red-300 border border-red-500/40";
                        stageTitle = "Анализ баллов";
                      } else if (cand.currentStage === "training") {
                        badgeColor = "bg-sky-500/20 text-sky-200 border border-sky-500/40";
                        stageTitle = "Активное обучение";
                      } else if (cand.currentStage === "certified") {
                        badgeColor = "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40";
                        stageTitle = "Сертифицирован 🎓";
                      }

                      return (
                        <div key={cand.id} className="p-5 hover:bg-white/5 transition flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
                          
                          {/* Left meta info */}
                          <div className="space-y-1 text-left">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-[#E7C768]">{cand.name}</h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
                                {stageTitle}
                              </span>
                            </div>
                            <div className="text-xs text-slate-300 flex flex-wrap gap-x-4">
                              <span>📧 {cand.email}</span>
                              {cand.telegramUsername && <span>💬 @{cand.telegramUsername} (ID: {cand.telegramId || "-"})</span>}
                            </div>
                            <div className="text-xs font-semibold text-slate-200">
                              Должность: <strong className="text-white">{cand.roleName}</strong>
                            </div>
                          </div>

                          {/* Center score details */}
                          <div className="flex items-center gap-3">
                            {cand.scores ? (
                              <div className="flex items-center gap-2 text-right">
                                <div className="hidden sm:block">
                                  <div className="text-[10px] text-slate-400 font-bold uppercase">Общий ИИ Балл</div>
                                  <div className="text-xs text-slate-300 font-mono w-44">Интервью: {cand.scores.interviewScore}, Резюме: {cand.scores.resumeScore}</div>
                                </div>
                                <div className="w-11 h-11 rounded-full border-2 border-[#E7C768] bg-[#E7C768]/20 flex items-center justify-center font-bold text-sm text-[#E7C768]">
                                  {cand.scores.overallScore}
                                </div>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic font-semibold">Собеседование не завершено</span>
                            )}
                          </div>

                          {/* Right deep analysis panel view of candidate */}
                          {cand.scores && (
                            <div className="text-left md:text-right max-w-xs space-y-1 bg-white/5 p-2.5 rounded-xl border border-white/10">
                              <span className="text-[10px] font-bold text-[#E7C768] uppercase block">Оценка ИИ:</span>
                              <p className="text-[10.5px] text-slate-300 leading-tight line-clamp-3">
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
            <div className="bg-[#1D3E5E]/85 border border-white/15 rounded-3xl p-6 shadow-xl space-y-6 text-white text-left">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#17344F] to-[#265582] flex items-center justify-center text-[#E7C768] border border-white/10">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#E7C768]">Конструктор ИИ-Онбординга</h2>
                  <p className="text-xs text-slate-300 font-semibold">
                    Задайте параметры проекта, и генеративный ИИ автоматически соберет проверочные сценарии и уроки для кандидатов.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateOnboardingSystem} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-200 block">Название компании:</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-[#17344F]/50 text-sm text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#E7C768] transition"
                      value={setupCompanyName}
                      onChange={(e) => setSetupCompanyName(e.target.value)}
                    />
                  </div>

                  {/* Target vacancy / specialty selection via tags */}
                  <div className="space-y-1 relative">
                    <label className="text-xs font-bold text-slate-200 block">Целевая должность:</label>
                    <input
                      type="text"
                      required
                      placeholder="Например: Ассистент / Юрист / SMM"
                      className="w-full bg-[#17344F]/50 text-sm text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#E7C768] transition"
                      value={setupRoleName}
                      onChange={(e) => setSetupRoleName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Tag Search and Quick selection */}
                <div className="space-y-2 bg-[#17344F]/40 p-4 rounded-2xl border border-white/10">
                  <span className="text-xs font-bold text-slate-200 block flex items-center gap-1">
                    <Search className="w-3.5 h-3.5 text-[#E7C768]" /> Предустановленный справочник (выберите для предзаполнения):
                  </span>
                  <input
                    type="text"
                    placeholder="Быстрый фильтр специальностей..."
                    className="w-full bg-[#17344F]/80 text-xs p-2 rounded-xl focus:outline-none text-white border border-white/10 focus:border-[#E7C768] transition"
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
                        className="cursor-pointer bg-[#1D3E5E]/80 border border-white/10 text-white font-medium [font-size:10px] px-2 py-1.5 rounded-lg hover:border-[#E7C768] transition"
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-medium">
                  {/* Salary range */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-200 block">Размер оплаты (мотивация):</label>
                    <input
                      type="text"
                      className="w-full bg-[#17344F]/50 text-sm text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#E7C768] transition"
                      placeholder="80,000 - 120,000 руб."
                      value={setupSalary}
                      onChange={(e) => setSetupSalary(e.target.value)}
                    />
                  </div>

                  {/* Schedule */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-200 block">График работы:</label>
                    <input
                      type="text"
                      className="w-full bg-[#17344F]/50 text-sm text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#E7C768] transition"
                      placeholder="5/2, гибрид"
                      value={setupSchedule}
                      onChange={(e) => setSetupSchedule(e.target.value)}
                    />
                  </div>
                </div>

                {/* Company Custom documents / regulations */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 block">Регламенты компании или Вики для ИИ-Изучения:</label>
                    <span className="text-[10px] text-slate-400">ИИ индивидуально сформирует тесты именно под этот текст</span>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Внесите параметры ваших товаров или методов. Это приучит Робота Рекрутера тестировать людей именно под специфику ваших рабочих регламентов."
                    className="w-full bg-[#17344F]/50 text-sm text-white p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#E7C768] transition"
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

          {/* TAB 4: TELEGRAM WORKSPACE MONITORING */}
          {activeTab === "telegram" && (
            <div className="bg-[#1D3E5E]/85 border border-white/15 rounded-3xl p-6 shadow-xl space-y-4 text-white text-left">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-[#E7C768] flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-sky-400" />
                    Монитор Telegram Бот-Оповещений
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    История мгновенных уведомлений, отправляемых ботом <strong className="text-sky-300">@HR_RRbot</strong> вашему руководителю.
                  </p>
                </div>
                <button
                  onClick={fetchData}
                  className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition"
                >
                  <RefreshCw className="w-3 h-3 text-[#E7C768]" /> Обновить
                </button>
              </div>

              <div className="bg-[#17344F]/50 rounded-2xl p-4 border border-white/10 text-xs text-slate-200 leading-relaxed font-semibold">
                ℹ️ Бот работает через веб-хуки. Каждый раз, когда кандидат нажимает <strong>"Условия подходят"</strong>, заканчивает опрос, или завершает лекции в приложении - Робот Рекрутер отправляет REST API запрос, отправляя сообщение боту на ваш привязанный Telegram ID.
              </div>

              {/* Bot log lines */}
              <div className="space-y-3 pt-2">
                {tgMsgLog.length === 0 ? (
                  <p className="text-xs text-slate-300 text-center py-10 font-medium font-semibold">Пока нет логов. Как только кандидат приступит к шагам, здесь отобразятся уведомления.</p>
                ) : (
                  <div className="space-y-2.5">
                    {tgMsgLog.map((log) => (
                      <div key={log.id} className="bg-[#17344F]/95 border border-white/5 text-white rounded-xl p-4 font-mono text-xs flex items-start gap-3">
                        <span className="text-[#E7C768] font-bold select-none">[{log.timestamp}]</span>
                        <div className="flex-1 space-y-1">
                          <span className="text-sky-300 block text-[10px] font-bold">Bot API для Telegram ID: {log.chatId}</span>
                          <p className="text-slate-100 whitespace-pre-wrap leading-relaxed text-[11px]">{log.message}</p>
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

      {/* Footer using requested gradient styling, no black */}
      <footer className="bg-[#17344F] border-t-2 border-[#E7C768] py-8 text-white text-center">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img 
              src="https://i.ibb.co/WWRbtPq0/RR-Logo.png" 
              alt="RR Logo" 
              className="w-8 h-8 object-contain" 
              referrerPolicy="no-referrer"
            />
            <span className="text-xs text-slate-300 font-bold">© 2026 Робот Рекрутер RR — HR-RR.ru</span>
          </div>

          <div className="flex gap-4 text-xs text-slate-400">
            <button onClick={() => navigate("/main")} className="hover:text-white transition">Главная</button>
            <button onClick={() => navigate("/vacancy")} className="hover:text-white transition">Каталог</button>
            <button onClick={() => navigate("/employer")} className="hover:text-white transition">Панель Руководителя</button>
            <button onClick={() => navigate("/candidate")} className="hover:text-white transition">Панель Кандидата</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
