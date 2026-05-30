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
  X,
  Briefcase,
  Building2,
  CreditCard,
  User,
  Activity,
  Bell,
  Mail,
  Layers,
  Trash2,
  Play,
  Pause,
  ShieldCheck,
  Sliders,
  DollarSign,
  Award
} from "lucide-react";

export default function EmployerPanel() {
  const { navigate } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Main navigation tabs
  const [activeTab, setActiveTab] = useState<"crm" | "vacancies" | "companies" | "tariff" | "profile" | "events">("crm");

  // CRM sub-view styles
  const [crmViewMode, setCrmViewMode] = useState<"kanban" | "table" | "mailing">("kanban");

  // Fetching data state
  const [projects, setProjects] = useState<JobProject[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [tgMsgLog, setTgMsgLog] = useState<{ id: string; chatId: string; message: string; timestamp: string }[]>([]);
  const [aiStatus, setAiStatus] = useState({ active: true, model: "" });

  const [copiedProjectId, setCopiedProjectId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // CRM States
  const [crmSearch, setCrmSearch] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // Mailing States
  const [mailingSegment, setMailingSegment] = useState<string>("all");
  const [mailingTemplate, setMailingTemplate] = useState<string>("welcome");
  const [mailingText, setMailingText] = useState("Здравствуйте! Рады видеть вас в команде. Пожалуйста, пройдите ИИ-собеседование для активации.");
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [mailingLogs, setMailingLogs] = useState<string[]>([]);

  // Vacancy States
  const [pausedProjectIds, setPausedProjectIds] = useState<string[]>([]);
  const [setupCompanyName, setSetupCompanyName] = useState("ООО РобоРекрут инжиниринг");
  const [setupRoleName, setSetupRoleName] = useState("Менеджер по продажам");
  const [setupSalary, setSetupSalary] = useState("80000 - 120000 руб");
  const [setupSchedule, setSetupSchedule] = useState("5/2, гибридный график");
  const [setupCustomWiki, setSetupCustomWiki] = useState("Правила адаптации: мы поставляем ИИ-сервисы. Кандидат должен владеть техниками продаж.");
  const [specialtySearch, setSpecialtySearch] = useState("");
  const [showAddNewVacancy, setShowAddNewVacancy] = useState(false);

  // Profile States
  const [adminTgId, setAdminTgId] = useState(() => localStorage.getItem("employer_tg_id") || "59384591");
  const [profileName, setProfileName] = useState("Сергей Ковалев");
  const [profileTitle, setProfileTitle] = useState("Директор по персоналу");
  const [profileEmail, setProfileEmail] = useState("hr-director@company.ru");
  const [profilePhone, setProfilePhone] = useState("+7 (926) 012-34-56");
  const [isProfileSaved, setIsProfileSaved] = useState(false);

  // Billing & Tariff States
  const [tariffLevel, setTariffLevel] = useState<"bronze" | "silver" | "gold">("bronze");
  const [paymentHistory, setPaymentHistory] = useState<any[]>([
    { id: "TX-1049", date: "2026-05-15", plan: "Старт (Бронза)", amount: "0 ₽", status: "Успешно", method: "Бесплатно" }
  ]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlanToBuy, setSelectedPlanToBuy] = useState<"silver" | "gold" | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Companies custom database state
  const [companiesList, setCompaniesList] = useState([
    { name: "ООО РобоРекрут инжиниринг", industry: "IT и ИИ продукты", staff: "45 человек", description: "Разрабатываем высокопроизводительнее решения по автоматизации собеседований со встроенным Gemini API.", activeVacancies: 1 },
    { name: "PromoAI", industry: "Реклама и маркетинг", staff: "18 человек", description: "Интеллектуальное агентство контекстной рекламы с автогенерацией лидов.", activeVacancies: 1 }
  ]);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyIndustry, setNewCompanyIndustry] = useState("");
  const [newCompanyStaff, setNewCompanyStaff] = useState("10-50 человек");
  const [newCompanyDesc, setNewCompanyDesc] = useState("");

  // System Audit Events State
  const [auditEvents, setAuditEvents] = useState<any[]>([
    { id: 1, type: "info", title: "Вход в панель управления", message: "Успешная авторизация в системе управления Робором.", timestamp: "12:15:30" },
    { id: 2, type: "success", title: "Обновление синхронизации", message: "Проекты и аналитика успешно считаны со встроенного БД сервера.", timestamp: "12:15:35" }
  ]);
  const [auditFilter, setAuditFilter] = useState<"all" | "info" | "success" | "warning">("all");

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
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/main");
  };

  // Log automated events helper
  const addAuditEvent = (type: "info" | "success" | "warning", title: string, message: string) => {
    const timeStr = new Date().toTimeString().split(' ')[0];
    setAuditEvents(prev => [
      { id: Date.now(), type, title, message, timestamp: timeStr },
      ...prev
    ]);
  };

  // Change candidate stage through live PATCH server endpoint
  const handleUpdateCandidateStage = async (candId: string, newStage: "terms" | "interview" | "scoring" | "training" | "certified") => {
    try {
      const res = await fetch(`/api/candidates/${candId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentStage: newStage })
      });

      if (res.ok) {
        const updated = await res.json();
        setCandidates(prev => prev.map(c => c.id === candId ? updated : c));
        if (selectedCandidate?.id === candId) {
          setSelectedCandidate(updated);
        }
        addAuditEvent("success", "Этап кандидата изменен", `Кандидат продвинут на этап: ${newStage}`);
        fetchData();
      }
    } catch (err) {
      console.error("Error modifying candidate stage:", err);
    }
  };

  // Submit dynamic system generation via server Gemini API
  const handleCreateOnboardingSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    addAuditEvent("info", "Старт ИИ Генерации", `Запуск ИИ-сборки онбординга для вакансии: ${setupRoleName}`);

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
      
      // Notify Telegram Bot mock
      await fetch("/api/telegram-mock-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: adminTgId,
          message: `🤖 Настроена новая система адаптации Робота Рекрутера!\n🏢 Компания: ${setupCompanyName}\n💼 Должность: ${setupRoleName}`
        })
      });

      // Insert new company into local listing if unique
      if (!companiesList.some(comp => comp.name.toLowerCase() === setupCompanyName.toLowerCase())) {
        setCompaniesList(prev => [
          ...prev,
          { name: setupCompanyName, industry: "Услуги / Производство", staff: "10-25 человек", description: "Интегрированная новая компания в экосистему адаптации сотрудников.", activeVacancies: 1 }
        ]);
      }

      addAuditEvent("success", "ИИ-Блок онбординга собран", `Программа лекций, ситуационных вопросов создана для ${setupRoleName}`);
      setShowAddNewVacancy(false);
      setActiveTab("vacancies");
      fetchData();
    } catch (err: any) {
      alert("Ошибка при генерации: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle Pause Vacancy Action
  const togglePauseVacancy = (projId: string) => {
    const isPaused = pausedProjectIds.includes(projId);
    if (isPaused) {
      setPausedProjectIds(prev => prev.filter(id => id !== projId));
      addAuditEvent("success", "Вакансия активирована", `Проект ${projId} снова принимает соискателей`);
    } else {
      setPausedProjectIds(prev => [...prev, projId]);
      addAuditEvent("warning", "Вакансия на паузе", `Прием заявок по проекту ${projId} временно остановлен`);
    }
  };

  // Bulk mailing dispatcher tool
  const handleLaunchMailing = async () => {
    setIsSendingMail(true);
    setMailingLogs([]);
    addAuditEvent("info", "Старт массовой рассылки", `Запускается отправка сообщений по сегменту: ${mailingSegment}`);

    // Filter recipients
    const recipients = candidates.filter(cand => {
      if (mailingSegment === "all") return true;
      return cand.currentStage === mailingSegment;
    });

    if (recipients.length === 0) {
      setMailingLogs(["Соискатели в выбранном сегменте не найдены."]);
      setIsSendingMail(false);
      return;
    }

    try {
      for (const rec of recipients) {
        setMailingLogs(prev => [...prev, `Отправка уведомления для: ${rec.name} (@${rec.telegramUsername || "telegram"})...`]);
        await fetch("/api/telegram-mock-send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatId: rec.telegramId || adminTgId,
            message: `📣 СООБЩЕНИЕ ОТ РАБОТОДАТЕЛЯ:\n\n${mailingText}\n\n🤖 Пожалуйста, продолжите в панели соискателя!`
          })
        });
      }
      setMailingLogs(prev => [...prev, `✅ Готово! Успешно отправлено сообщений: ${recipients.length}`]);
      addAuditEvent("success", "Рассылка завершена", `Доставлено сообщений соискателям: ${recipients.length}`);
      fetchData();
    } catch (err) {
      console.error(err);
      setMailingLogs(prev => [...prev, "Произошла техническая заминка при рассылке."]);
    } finally {
      setIsSendingMail(false);
    }
  };

  // Trigger simulated payment for subscription
  const handleConfirmPayment = () => {
    if (!selectedPlanToBuy) return;
    setIsProcessingPayment(true);
    
    setTimeout(() => {
      const planName = selectedPlanToBuy === "silver" ? "Серебро Про" : "Золото Безлимит";
      const priceVal = selectedPlanToBuy === "silver" ? "14 900 ₽" : "39 900 ₽";
      setTariffLevel(selectedPlanToBuy);
      
      const newTx = {
        id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString().split('T')[0],
        plan: planName + " (ИИ)",
        amount: priceVal,
        status: "Успешно",
        method: "Банковская карта (Мир)"
      };

      setPaymentHistory(prev => [newTx, ...prev]);
      addAuditEvent("success", "Оплата подписки", `Тариф повышен до ${planName}. Наслаждайтесь расширенным лимитом.`);
      setIsProcessingPayment(false);
      setShowPaymentModal(false);
      setSelectedPlanToBuy(null);
    }, 2000);
  };

  // Save modified company profile
  const handleAddCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName) return;

    setCompaniesList(prev => [
      ...prev,
      { name: newCompanyName, industry: newCompanyIndustry || "Производство", staff: newCompanyStaff, description: newCompanyDesc || "Описание отсутствует.", activeVacancies: 0 }
    ]);

    addAuditEvent("success", "Создана компания", `Зарегистрирован бренд ${newCompanyName}`);
    setNewCompanyName("");
    setNewCompanyDesc("");
    setNewCompanyIndustry("");
    setShowAddCompany(false);
  };

  // Copy registration link to clipboard
  const handleCopyLink = (projectId: string, roleName: string) => {
    const signupUrl = `${window.location.origin}/auth?project=${projectId}&role=${encodeURIComponent(roleName)}`;
    navigator.clipboard.writeText(signupUrl);
    setCopiedProjectId(projectId);
    setTimeout(() => setCopiedProjectId(null), 2000);
  };

  // Save TG ID
  const saveTgId = () => {
    localStorage.setItem("employer_tg_id", adminTgId);
    setIsProfileSaved(true);
    addAuditEvent("success", "Telegram ID привязан", `Бот интегрирован на канал ${adminTgId}`);
    setTimeout(() => setIsProfileSaved(false), 2500);
  };

  // Filtering candidates
  const filteredCandidates = candidates.filter(cand => {
    return cand.name.toLowerCase().includes(crmSearch.toLowerCase()) || 
           cand.roleName.toLowerCase().includes(crmSearch.toLowerCase()) ||
           cand.email.toLowerCase().includes(crmSearch.toLowerCase());
  });

  // Calculate stats
  const totalVerified = candidates.filter(c => c.currentStage === "certified").length;
  const averageAllScores = candidates.length > 0 
    ? Math.round(candidates.reduce((acc, c) => acc + (c.scores?.overallScore || 70), 0) / candidates.length)
    : 78;

  // Render content area based on six main tabs
  return (
    <div className="bg-gradient-to-b from-[#17344F] to-[#265582] min-h-screen text-white font-sans antialiased selection:bg-[#E7C768] selection:text-[#17344F] flex flex-col justify-between">
      
      {/* Top Header Navigation */}
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

          <nav className="hidden md:flex items-center justify-center gap-2 md:gap-4 text-xs md:text-sm font-semibold">
            <button onClick={() => navigate("/main")} className="transition px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10">
              Главная
            </button>
            <button onClick={() => navigate("/vacancy")} className="transition px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10">
              Каталог Профессий
            </button>
            <button onClick={() => setActiveTab("crm")} className="transition px-3 py-2 rounded-xl text-[#E7C768] bg-white/10 border border-[#E7C768]/20">
              Панель Работодателя 💼
            </button>
            <button onClick={() => navigate("/candidate")} className="transition px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 bg-white/5 border border-white/10">
              Кабинет Соискателя 🎓
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs block text-[#E7C768] font-bold">{profileName}</span>
              <span className="text-[10px] block text-slate-300 font-mono">{profileEmail}</span>
            </div>
            <button onClick={handleLogout} className="cursor-pointer bg-white/10 hover:bg-white/20 text-white rounded-xl px-3 py-2 text-xs font-bold transition flex items-center gap-1 border border-white/10">
              <LogOut className="w-3.5 h-3.5" /> Выйти
            </button>
          </div>

          <button className="md:hidden flex items-center justify-center p-2 rounded-xl hover:bg-white/10 text-white transition-all" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6 text-[#E7C768]" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-white/10 flex flex-col gap-3 font-semibold">
            <button onClick={() => { navigate("/main"); setMobileMenuOpen(false); }} className="transition text-left w-full px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5">Главная</button>
            <button onClick={() => { navigate("/vacancy"); setMobileMenuOpen(false); }} className="transition text-left w-full px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5">Каталог Профессий</button>
            <button onClick={() => { setActiveTab("crm"); setMobileMenuOpen(false); }} className="transition text-left w-full px-4 py-3 rounded-xl text-[#E7C768] bg-white/10">Панель Работодателя</button>
            <button onClick={() => { navigate("/candidate"); setMobileMenuOpen(false); }} className="transition text-left w-full px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5">Кабинет Соискателя</button>
            <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="transition text-left w-full px-4 py-3 rounded-xl text-red-300 hover:bg-red-950/25">Выйти из кабинета</button>
          </div>
        )}
      </header>

      {/* Main Workspace Frame */}
      <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 w-full flex-1">
        
        {/* Left Side Tab Drawer */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-[#1D3E5E]/85 border border-white/15 rounded-3xl p-5 shadow-xl space-y-4 text-center">
            <Mascot state="recruitment" size="sm" className="mx-auto" />
            <div>
              <h3 className="font-bold text-sm text-[#E7C768]">Пульт Управления Рекрутом</h3>
              <p className="text-[10px] text-slate-300 mt-1">Обучайте агента, координируйте воронку и контролируйте KPI.</p>
            </div>

            {/* SIX REQUIRED PAGES */}
            <div className="space-y-1.5 pt-2 text-left">
              <button
                onClick={() => { setActiveTab("crm"); setCrmViewMode("kanban"); }}
                className={`w-full text-left font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-between transition-all ${activeTab === "crm" ? "bg-[#1E4468] text-[#E7C768] border border-[#E7C768]/60 shadow" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#D99E41]" /> 1. CRM & Воронка
                </span>
                <span className="bg-amber-900/40 text-[10px] text-[#E7C768] px-1.5 py-0.5 rounded font-mono">{candidates.length}</span>
              </button>

              <button
                onClick={() => setActiveTab("vacancies")}
                className={`w-full text-left font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-between transition-all ${activeTab === "vacancies" ? "bg-[#1E4468] text-[#E7C768] border border-[#E7C768]/60 shadow" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
              >
                <span className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#D99E41]" /> 2. Вакансии & ИИ
                </span>
                <span className="bg-slate-800 text-[10px] text-slate-300 px-1.5 py-0.5 rounded font-mono">{projects.length}</span>
              </button>

              <button
                onClick={() => setActiveTab("companies")}
                className={`w-full text-left font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-between transition-all ${activeTab === "companies" ? "bg-[#1E4468] text-[#E7C768] border border-[#E7C768]/60 shadow" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
              >
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#D99E41]" /> 3. Мои Компании
                </span>
              </button>

              <button
                onClick={() => setActiveTab("tariff")}
                className={`w-full text-left font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-between transition-all ${activeTab === "tariff" ? "bg-[#1E4468] text-[#E7C768] border border-[#E7C768]/60 shadow" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
              >
                <span className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#D99E41]" /> 4. Тариф & Счета
                </span>
                <span className="bg-emerald-950 text-[9px] text-emerald-400 font-bold uppercase px-1 py-0.5 rounded">{tariffLevel}</span>
              </button>

              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-between transition-all ${activeTab === "profile" ? "bg-[#1E4468] text-[#E7C768] border border-[#E7C768]/60 shadow" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
              >
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#D99E41]" /> 5. Профиль HR
                </span>
              </button>

              <button
                onClick={() => setActiveTab("events")}
                className={`w-full text-left font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-between transition-all ${activeTab === "events" ? "bg-[#1E4468] text-[#E7C768] border border-[#E7C768]/60 shadow" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
              >
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#D99E41]" /> 6. События & Логи
                </span>
              </button>
            </div>
          </div>

          {/* Quick Realtime Limit Monitor Tracker Widget */}
          <div className="bg-[#1D3E5E]/85 border border-white/15 rounded-3xl p-4 shadow-xl text-xs space-y-2 text-left">
            <span className="text-[#E7C768] font-bold block uppercase tracking-wider font-mono text-[9px]">Текущие Ограничения</span>
            <div className="space-y-1.5">
              <div className="text-[11px] flex justify-between">
                <span className="text-slate-300">Вакансии:</span>
                <span className="font-mono text-white font-bold">{projects.length} / {tariffLevel === "bronze" ? 2 : tariffLevel === "silver" ? 5 : "Безлимит"}</span>
              </div>
              <div className="text-[11px] flex justify-between">
                <span className="text-slate-300">Соискатели за месяц:</span>
                <span className="font-mono text-white font-bold">{candidates.length} / {tariffLevel === "bronze" ? 5 : tariffLevel === "silver" ? 50 : "Безлимит"}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Side Main Workspaces */}
        <main className="lg:col-span-9 space-y-6">

          {/* PAGE 1: CRM & FUNNEL */}
          {activeTab === "crm" && (
            <div className="space-y-6 text-left">
              
              {/* Layout controls */}
              <div className="bg-[#1D3E5E]/85 border border-white/15 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#E7C768] flex items-center gap-1.5">
                    <Users className="w-5 h-5 text-amber-400" /> ИИ-Воронка и CRM-Кандидаты
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">Отслеживайте прогресс соискателей на каждом этапе адаптации и запускайте рассылки.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  {/* View selectors */}
                  <div className="bg-black/25 p-1 rounded-xl border border-white/10 flex gap-1">
                    <button 
                      onClick={() => setCrmViewMode("kanban")} 
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${crmViewMode === "kanban" ? "bg-[#1E4468] text-[#E7C768]" : "text-slate-300 hover:text-white"}`}
                    >
                      Канбан
                    </button>
                    <button 
                      onClick={() => setCrmViewMode("table")} 
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${crmViewMode === "table" ? "bg-[#1E4468] text-[#E7C768]" : "text-slate-300 hover:text-white"}`}
                    >
                      Таблица
                    </button>
                    <button 
                      onClick={() => setCrmViewMode("mailing")} 
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${crmViewMode === "mailing" ? "bg-[#1E4468] text-[#E7C768]" : "text-slate-300 hover:text-white"}`}
                    >
                      Рассылка
                    </button>
                  </div>

                  {/* Search filter input */}
                  <div className="relative flex items-center bg-[#17344F]/50 border border-white/15 px-2.5 py-1 rounded-xl focus-within:border-[#E7C768]">
                    <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
                    <input
                      type="text"
                      className="bg-transparent text-xs text-white focus:outline-none w-full sm:w-32"
                      placeholder="Искать ФИО..."
                      value={crmSearch}
                      onChange={(e) => setCrmSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* KANBAN FUNNEL LAYOUT */}
              {crmViewMode === "kanban" && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { stage: "terms", title: "1. Ознакомление", bg: "bg-blue-650/40 border-blue-500/20" },
                    { stage: "interview", title: "2. Собеседование (ИИ)", bg: "bg-amber-650/40 border-amber-500/20" },
                    { stage: "training", title: "3. Обучение Wiki", bg: "bg-sky-650/40 border-sky-500/20" },
                    { stage: "certified", title: "4. Сдал & Обучен 🎓", bg: "bg-emerald-650/40 border-emerald-500/20" }
                  ].map(column => {
                    const colCandidates = filteredCandidates.filter(c => {
                      if (column.stage === "interview") {
                        return c.currentStage === "interview" || c.currentStage === "scoring";
                      }
                      return c.currentStage === column.stage;
                    });

                    return (
                      <div 
                        key={column.stage} 
                        className={`bg-[#1D3E5E]/40 border border-white/5 rounded-2xl p-3 space-y-3 min-h-[350px] shadow`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          // Drag & drop triggers action
                          const draggedId = localStorage.getItem("dragged_candidate_id");
                          if (draggedId) {
                            handleUpdateCandidateStage(draggedId, column.stage as any);
                            localStorage.removeItem("dragged_candidate_id");
                          }
                        }}
                      >
                        <div className="flex items-center justify-between border-b border-white/5 pb-2 text-xs font-bold text-slate-300">
                          <span>{column.title}</span>
                          <span className="bg-black/30 font-mono px-2 py-0.5 rounded-full text-[10px] text-[#E7C768]">{colCandidates.length}</span>
                        </div>

                        <div className="space-y-2.5">
                          {colCandidates.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 text-[11px] font-medium font-semibold">Пусто</div>
                          ) : (
                            colCandidates.map(cand => (
                              <div
                                key={cand.id}
                                draggable
                                onDragStart={() => localStorage.setItem("dragged_candidate_id", cand.id)}
                                className="bg-[#17344F]/85 border border-white/10 hover:border-[#E7C768] p-3 rounded-xl transition cursor-grab shadow-sm active:cursor-grabbing space-y-2"
                              >
                                <div className="text-xs font-bold text-[#E7C768] hover:underline" onClick={() => setSelectedCandidate(cand)}>
                                  {cand.name}
                                </div>
                                <div className="text-[10px] text-slate-300 line-clamp-1">{cand.roleName}</div>

                                {/* Dynamic Score Indicator if interview has elements */}
                                {cand.scores && (
                                  <div className="flex justify-between items-center text-[10px] bg-black/40 p-1.5 rounded border border-white/5 font-mono">
                                    <span className="text-slate-400">Балл ИИ:</span>
                                    <span className="text-[#E7C768] font-bold">
                                      {Math.round(((cand.scores.resumeScore || 70) + (cand.scores.checklistScore || 80) + (cand.scores.situationsScore || 75)) / 3)}/100
                                    </span>
                                  </div>
                                )}

                                {/* Interactive Stage Promotional arrows */}
                                <div className="flex justify-between gap-1 pt-1 border-t border-white/5">
                                  <button
                                    disabled={cand.currentStage === "terms"}
                                    onClick={() => {
                                      const prevStageMap: Record<string, any> = { "interview": "terms", "scoring": "interview", "training": "interview", "certified": "training" };
                                      handleUpdateCandidateStage(cand.id, prevStageMap[cand.currentStage] || "terms");
                                    }}
                                    className="cursor-pointer bg-white/5 hover:bg-white/15 px-1 py-0.5 rounded text-[9px] text-gray-300 font-bold disabled:opacity-30"
                                    title="На уровень назад"
                                  >
                                    ◀
                                  </button>
                                  <button
                                    onClick={() => setSelectedCandidate(cand)}
                                    className="cursor-pointer text-[10px] text-sky-300 hover:text-white font-bold"
                                  >
                                    Инфо
                                  </button>
                                  <button
                                    disabled={cand.currentStage === "certified"}
                                    onClick={() => {
                                      const nextStageMap: Record<string, any> = { "terms": "interview", "interview": "training", "scoring": "training", "training": "certified" };
                                      handleUpdateCandidateStage(cand.id, nextStageMap[cand.currentStage] || "certified");
                                    }}
                                    className="cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-700 hover:shadow py-0.5 px-2 rounded text-[9px] text-white font-black"
                                    title="Продвинуть кандидата вперед"
                                  >
                                    ▶
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TABLE LAYOUT FOR DATA-RICH CHECKS */}
              {crmViewMode === "table" && (
                <div className="bg-[#1D3E5E]/40 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-[#17344F] text-[#E7C768] font-bold border-b border-white/10 uppercase tracking-wider text-[10px] font-mono">
                          <th className="p-4">ФИО Кандидата</th>
                          <th className="p-4">Интерес / Должность</th>
                          <th className="p-4">Текущий Этап</th>
                          <th className="p-4 text-center">Резюме</th>
                          <th className="p-4 text-center">Чек-лист</th>
                          <th className="p-4 text-center">Ситуации</th>
                          <th className="p-4 text-center">Средний Балл</th>
                          <th className="p-4 text-right">Действия</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredCandidates.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-slate-400 font-semibold">Соискатели отсутствуют.</td>
                          </tr>
                        ) : (
                          filteredCandidates.map(cand => {
                            const rScore = cand.scores?.resumeScore !== undefined ? cand.scores.resumeScore : 70;
                            const cScore = cand.scores?.checklistScore !== undefined ? cand.scores.checklistScore : 80;
                            const sScore = cand.scores?.situationsScore !== undefined ? cand.scores.situationsScore : 75;
                            const avg = Math.round((rScore + cScore + sScore) / 3);

                            return (
                              <tr key={cand.id} className="hover:bg-white/5 transition">
                                <td className="p-4 font-bold text-white">
                                  <div>{cand.name}</div>
                                  <div className="text-[10px] text-slate-400 font-normal">{cand.email}</div>
                                </td>
                                <td className="p-4">{cand.roleName}</td>
                                <td className="p-4">
                                  <select 
                                    className="bg-black/40 text-xs rounded border border-white/10 px-2 py-1 text-[#E7C768]"
                                    value={cand.currentStage}
                                    onChange={(e) => handleUpdateCandidateStage(cand.id, e.target.value as any)}
                                  >
                                    <option value="terms" className="bg-slate-900">Ознакомление</option>
                                    <option value="interview" className="bg-slate-900">ИИ Интервью</option>
                                    <option value="training" className="bg-slate-900">Обучение</option>
                                    <option value="certified" className="bg-slate-900">Обучен 🎓</option>
                                  </select>
                                </td>
                                <td className="p-4 text-center font-mono font-bold text-sky-300">{rScore}/100</td>
                                <td className="p-4 text-center font-mono font-bold text-sky-300">{cScore}/100</td>
                                <td className="p-4 text-center font-mono font-bold text-sky-300">{sScore}/100</td>
                                <td className="p-4 text-center">
                                  <span className="bg-[#E7C768]/15 text-[#E7C768] font-bold font-mono px-2 py-1 rounded border border-[#E7C768]/20">{avg}</span>
                                </td>
                                <td className="p-4 text-right">
                                  <button onClick={() => setSelectedCandidate(cand)} className="cursor-pointer text-sky-300 hover:underline font-bold text-[11px]">Карточка ИИ</button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* INTEGRATED BULK MAILER */}
              {crmViewMode === "mailing" && (
                <div className="bg-[#1D3E5E]/85 border border-white/15 rounded-3xl p-6 shadow-xl space-y-6">
                  <div className="border-b border-white/10 pb-3 flex justify-between items-center">
                    <h3 className="font-bold text-sm text-[#E7C768] uppercase tracking-wider flex items-center gap-2">
                      <Mail className="w-4 h-4 text-sky-400" /> Конструктор массовой рассылки Telegram
                    </h3>
                    <span className="text-slate-300 text-xs">Всего кандидатов в базе: {candidates.length}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left settings */}
                    <div className="space-y-4 text-left">
                      <div>
                        <label className="text-xs font-bold text-slate-200 block mb-1">Кому отправить (Сегментация соискателей):</label>
                        <select 
                          className="w-full bg-black/40 text-xs text-white border border-white/15 px-3 py-2.5 rounded-xl accent-[#E7C768]"
                          value={mailingSegment}
                          onChange={(e) => setMailingSegment(e.target.value)}
                        >
                          <option value="all">📣 Всем кандидатам во всей воронке</option>
                          <option value="terms">Ознакамливающимся с условиями смены</option>
                          <option value="interview">Проходящим ИИ Чат-разговор</option>
                          <option value="training">Ученикам раздела корпоративной Вики</option>
                          <option value="certified">Только Обученным соискателям 🎓</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-200 block mb-1">Шаблон сообщения:</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: "welcome", label: "Добро пожаловать" },
                            { key: "reminder", label: "Напоминание о чате" },
                            { key: "wiki_unlocked", label: "Лекции открыты" },
                            { key: "certificate", label: "Сдача сертификации" }
                          ].map(t => (
                            <button
                              key={t.key}
                              className={`p-2 rounded-xl text-center text-[10px] font-bold border transition ${mailingTemplate === t.key ? "bg-[#1E4468]/90 border-[#E7C768] text-[#E7C768]" : "bg-black/35 border-white/10 hover:border-white/20 text-slate-300"}`}
                              onClick={() => {
                                setMailingTemplate(t.key);
                                if (t.key === "welcome") {
                                  setMailingText("Здравствуйте! Вы прошли первичную регистрацию. Робот Рекрутер готов протестировать вас. Пожалуйста, запустите ИИ-собеседование.");
                                } else if (t.key === "reminder") {
                                  setMailingText("Внимание! Подходит к концу дедлайн по вашему тестовому интервью. Завершите собеседование для получения решения HR.");
                                } else if (t.key === "wiki_unlocked") {
                                  setMailingText("Ура! Ваши баллы интервью достаточны для допуска к изучению Wiki-материалов и наставничества. Ждем вас в Личном Кабинете.");
                                } else if (t.key === "certificate") {
                                  setMailingText("Поздравляем с квалификацией! Вы успешно подтвердили знания нашего продукта. HR свяжется с вами для финального оффера в ТГ.");
                                }
                              }}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-200 block mb-1">Текст сообщения:</label>
                        <textarea
                          rows={4}
                          className="w-full bg-black/40 text-xs p-3 rounded-xl border border-white/15 focus:outline-none focus:border-[#E7C768] font-normal"
                          value={mailingText}
                          onChange={(e) => setMailingText(e.target.value)}
                        />
                      </div>

                      <button
                        onClick={handleLaunchMailing}
                        disabled={isSendingMail}
                        className="cursor-pointer w-full bg-gradient-to-r from-red-650 to-orange-700 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:shadow transition disabled:opacity-50"
                      >
                        {isSendingMail ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Запустить рассылку в Telegram
                      </button>
                    </div>

                    {/* Right Log Console */}
                    <div className="bg-black/40 p-4 rounded-2xl border border-white/15 flex flex-col justify-between font-mono">
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider mb-2">Лог отправки в реальном времени:</span>
                        <div className="space-y-1 max-h-56 overflow-y-auto text-left text-[11px] text-emerald-300 pr-1 select-none">
                          {mailingLogs.length === 0 ? (
                            <span className="text-gray-500 italic">Ожидание запуска...</span>
                          ) : (
                            mailingLogs.map((lg, i) => (
                              <div key={i}>{lg}</div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-slate-400 leading-normal text-left font-sans">
                        ⚠️ В целях безопасности, сообщения уходят на зарегистрированный соискателем Telegram ID либо эмулируются на ваш рабочий канал.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PAGE 2: VACANCIES & AI CREATOR */}
          {activeTab === "vacancies" && (
            <div className="space-y-6 text-left">
              <div className="bg-[#1D3E5E]/85 border border-white/15 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#E7C768] flex items-center gap-1.5">
                    <Briefcase className="w-5 h-5 text-amber-500" /> Вакансии & ИИ Онбординги
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">Здесь сосредоточены все созданные системы кураторства, реферальные ссылки и кастомные Вики.</p>
                </div>

                <button 
                  onClick={() => setShowAddNewVacancy(!showAddNewVacancy)}
                  className="cursor-pointer bg-gradient-to-r from-[#FF1A1A] to-[#E54C00] hover:scale-102 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1 shadow transition-all"
                >
                  <Plus className="w-4 h-4" /> Добавить вакансию
                </button>
              </div>

              {/* DYNAMIC VACANCY CREATOR FROM FORM OR DIRECT IMPORT */}
              {showAddNewVacancy && (
                <div className="bg-[#1D3E5E]/95 border border-[#E7C768]/60 p-6 rounded-3xl space-y-6 shadow-2xl animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-xs font-bold text-[#E7C768] uppercase font-mono tracking-wider block">Конструктор вакансии с поддержкой Gemini API</span>
                    <button onClick={() => setShowAddNewVacancy(false)} className="text-slate-400 hover:text-white">✕ Close</button>
                  </div>

                  <form onSubmit={handleCreateOnboardingSystem} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-200 block mb-1">Компания:</label>
                        <input
                          type="text"
                          required
                          className="w-full bg-[#17344F]/60 text-xs p-2.5 rounded-xl border border-white/10 focus:outline-[#E7C768]"
                          value={setupCompanyName}
                          onChange={(e) => setSetupCompanyName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-200 block mb-1">Должность:</label>
                        <input
                          type="text"
                          required
                          className="w-full bg-[#17344F]/60 text-xs p-2.5 rounded-xl border border-white/10 focus:outline-[#E7C768]"
                          value={setupRoleName}
                          onChange={(e) => setSetupRoleName(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Pre-fill quick selector helper */}
                    <div className="bg-black/20 p-3 rounded-2xl border border-white/5 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-300 block">Быстрый подбор справочника:</span>
                      <input 
                        type="text" 
                        placeholder="Фильтровать профессии..." 
                        className="bg-black/40 text-[10.5px] p-1.5 w-full rounded border border-white/10"
                        value={specialtySearch}
                        onChange={(e) => setSpecialtySearch(e.target.value)}
                      />
                      <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto mt-2 pr-1">
                        {BASIC_SPECIALTIES.filter(s => s.toLowerCase().includes(specialtySearch.toLowerCase())).slice(0, 8).map(spec => (
                          <button
                            key={spec}
                            type="button"
                            onClick={() => { setSetupRoleName(spec); setSpecialtySearch(""); }}
                            className="bg-[#1D3E5E]/85 border border-white/5 hover:border-[#E7C768] text-[9.5px] px-2 py-0.5 rounded text-white transition"
                          >
                            {spec}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-200 block mb-1">Условия оплаты:</label>
                        <input
                          type="text"
                          className="w-full bg-[#17344F]/60 text-xs p-2.5 rounded-xl border border-white/10 focus:outline-[#E7C768]"
                          value={setupSalary}
                          onChange={(e) => setSetupSalary(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-200 block mb-1">График работы:</label>
                        <input
                          type="text"
                          className="w-full bg-[#17344F]/60 text-xs p-2.5 rounded-xl border border-white/10 focus:outline-[#E7C768]"
                          value={setupSchedule}
                          onChange={(e) => setSetupSchedule(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-200 block mb-1">Регламенты и база Wiki для обучения кандидата:</label>
                      <textarea
                        rows={3}
                        className="w-full bg-[#17344F]/60 text-xs p-2.5 rounded-xl border border-white/10 focus:outline-[#E7C768]"
                        value={setupCustomWiki}
                        onChange={(e) => setSetupCustomWiki(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isGenerating}
                      className="cursor-pointer w-full bg-gradient-to-r from-[#FF1A1A] to-[#E54C00] text-sm py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Генерация лекций и ситуаций при помощи ИИ Gemini...
                        </>
                      ) : (
                        "Создать систему адаптации и форму соискателя"
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* LIST OF CURRENT PLACED VACANCIES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map(proj => {
                  const isPaused = pausedProjectIds.includes(proj.id);
                  const assignedCandidates = candidates.filter(c => c.projectId === proj.id);
                  const columnCountTerms = assignedCandidates.filter(c => c.currentStage === "terms").length;
                  const columnCountInterview = assignedCandidates.filter(c => c.currentStage === "interview" || c.currentStage === "scoring").length;
                  const columnCountTraining = assignedCandidates.filter(c => c.currentStage === "training").length;
                  const columnCountCertified = assignedCandidates.filter(c => c.currentStage === "certified").length;

                  return (
                    <div 
                      key={proj.id} 
                      className={`border p-5 rounded-3xl flex flex-col justify-between hover:shadow-xl transition-all ${isPaused ? "bg-black/30 border-white/5 filter grayscale opacity-70" : "bg-[#1D3E5E]/60 border-white/10 hover:border-[#E7C768]"}`}
                    >
                      <div>
                        {/* Status bar */}
                        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 font-bold uppercase">
                          <span>🏢 {proj.companyName || "Компания"}</span>
                          <span className={`px-2 py-0.5 rounded ${isPaused ? "bg-orange-950 text-orange-400" : "bg-emerald-950 text-emerald-400 font-extrabold"}`}>
                            {isPaused ? "На паузе" : "Активна"}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-white mt-1.5">{proj.roleName}</h3>
                        <div className="text-slate-300 text-xs mt-1 font-mono">{proj.salaryTerms || "Сдельная"} | {proj.scheduleTerms || "По согласованию"}</div>
                        
                        {/* Mini statistics visualization */}
                        <div className="grid grid-cols-4 gap-1.5 mt-4 text-center font-mono">
                          <div className="bg-black/35 p-1.5 rounded">
                            <div className="text-[10px] text-gray-400 uppercase">Озн</div>
                            <div className="text-xs font-bold text-white">{columnCountTerms}</div>
                          </div>
                          <div className="bg-black/35 p-1.5 rounded">
                            <div className="text-[10px] text-gray-400 uppercase">Чат</div>
                            <div className="text-xs font-bold text-white">{columnCountInterview}</div>
                          </div>
                          <div className="bg-black/35 p-1.5 rounded">
                            <div className="text-[10px] text-gray-400 uppercase">Обуч</div>
                            <div className="text-xs font-bold text-white">{columnCountTraining}</div>
                          </div>
                          <div className="bg-black/35 p-1.5 rounded">
                            <div className="text-[10px] text-gray-400 uppercase">Сдал</div>
                            <div className="text-xs font-bold text-emerald-400 font-black">{columnCountCertified}</div>
                          </div>
                        </div>

                        {/* Attached custom Wiki display toggle */}
                        <div className="mt-3 bg-black/20 p-2.5 rounded-xl text-[11px] font-mono whitespace-pre-wrap leading-tight text-slate-300 line-clamp-3">
                          <strong>Бага Wiki базы:</strong> {proj.customWiki || "Пока пустая корпоративная вики."}
                        </div>
                      </div>

                      {/* Lower Actions */}
                      <div className="mt-5 pt-3 border-t border-white/5 space-y-2">
                        <button
                          onClick={() => handleCopyLink(proj.id, proj.roleName)}
                          className="cursor-pointer w-full bg-gradient-to-r from-red-650 to-orange-600 hover:shadow-md text-white text-[11px] font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5"
                        >
                          {copiedProjectId === proj.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-white" /> Ссылка скопирована
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-[#E7C768]" /> Скопировать реф-ссылку соискателя
                            </>
                          )}
                        </button>

                        <div className="flex gap-2">
                          <button
                            onClick={() => togglePauseVacancy(proj.id)}
                            className="cursor-pointer flex-1 bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 border border-white/5"
                          >
                            {isPaused ? (
                              <>
                                <Play className="w-3 h-3 text-emerald-400" /> Запустить прием
                              </>
                            ) : (
                              <>
                                <Pause className="w-3 h-3 text-orange-400" /> Приостановить
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PAGE 3: MY COMPANIES */}
          {activeTab === "companies" && (
            <div className="space-y-6 text-left">
              <div className="bg-[#1D3E5E]/85 border border-white/15 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#E7C768] flex items-center gap-1.5">
                    <Building2 className="w-5 h-5 text-amber-400" /> Зарегистрированные компании
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">Описания ваших юридических лиц или брендов, под которыми Робот публикует онбординги.</p>
                </div>

                <button 
                  onClick={() => setShowAddCompany(!showAddCompany)} 
                  className="cursor-pointer bg-gradient-to-r from-green-650 to-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow transition"
                >
                  Регистрация бренда
                </button>
              </div>

              {/* BRAND CREATOR */}
              {showAddCompany && (
                <form onSubmit={handleAddCompanySubmit} className="bg-black/45 border border-green-500/30 p-5 rounded-3xl space-y-4 shadow-xl">
                  <span className="text-xs font-bold text-green-300 block font-mono">Добавление профиля организации</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input 
                      type="text" 
                      placeholder="Название. Например: ООО СофтЛаб" 
                      className="bg-black/50 text-xs px-2.5 py-2 rounded-xl text-white border border-white/10 focus:outline-none" 
                      required
                      value={newCompanyName}
                      onChange={(e) => setNewCompanyName(e.target.value)}
                    />
                    <input 
                      type="text" 
                      placeholder="Отрасль. Например: Производство" 
                      className="bg-black/50 text-xs px-2.5 py-2 rounded-xl text-white border border-white/10 focus:outline-none"
                      value={newCompanyIndustry}
                      onChange={(e) => setNewCompanyIndustry(e.target.value)}
                    />
                    <select 
                      className="bg-[#17344F] text-xs px-2.5 py-2 rounded-xl text-white border border-white/10 focus:outline-none"
                      value={newCompanyStaff}
                      onChange={(e) => setNewCompanyStaff(e.target.value)}
                    >
                      <option value="менее 10 сотрудников">До 10 сотрудников</option>
                      <option value="10-50 человек">10 - 50 сотрудников</option>
                      <option value="50-250 человек">50 - 250 сотрудников</option>
                      <option value="свыше 250 сотрудников">Более 250 человек</option>
                    </select>
                  </div>
                  <textarea 
                    placeholder="Описание миссии, бренда, основных продуктов компании" 
                    className="w-full bg-black/50 text-xs p-2.5 rounded-xl border border-white/10 text-white"
                    rows={2}
                    value={newCompanyDesc}
                    onChange={(e) => setNewCompanyDesc(e.target.value)}
                  />
                  <div className="flex justify-end gap-2 text-xs">
                    <button type="button" onClick={() => setShowAddCompany(false)} className="px-3 py-1 bg-white/5 rounded-lg">Отмена</button>
                    <button type="submit" className="px-4 py-1 bg-green-600 rounded-lg font-bold text-white">Сохранить</button>
                  </div>
                </form>
              )}

              {/* LIST VIEW */}
              <div className="space-y-4">
                {companiesList.map((comp, idx) => {
                  const compVacancies = projects.filter(p => p.companyName.toLowerCase() === comp.name.toLowerCase());

                  return (
                    <div key={idx} className="bg-[#1D3E5E]/60 border border-white/10 p-5 rounded-3xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs text-[#E7C768] font-bold tracking-wide uppercase font-mono">{comp.industry}</span>
                          <h3 className="text-base font-bold text-white mt-0.5">{comp.name}</h3>
                        </div>
                        <span className="bg-white/5 border border-white/5 text-[10px] text-slate-350 py-1 px-2.5 rounded-full font-mono">Штат: {comp.staff}</span>
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed font-normal">{comp.description}</p>
                      
                      <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2.5 text-[11px] text-slate-400">
                        <span>Задействованных вакансий: <strong className="text-white">{compVacancies.length}</strong></span>
                        <div className="flex gap-1.5">
                          {compVacancies.map(p => (
                            <span key={p.id} className="bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 px-2 py-0.5 rounded font-mono text-[9.5px]">
                              {p.roleName}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PAGE 4: TARIFFS & BILLS */}
          {activeTab === "tariff" && (
            <div className="space-y-6 text-left">
              <div className="bg-[#1D3E5E]/85 border border-white/15 rounded-3xl p-6 shadow-xl space-y-4">
                <h2 className="text-lg font-bold text-[#E7C768] flex items-center gap-1.5">
                  <CreditCard className="w-5 h-5 text-[#E7C768]" /> Подписки, Лимиты и Счета
                </h2>
                <p className="text-xs text-slate-300">
                  Управляйте тарифами Робота-Рекрутера. Лимиты сбрасываются каждые 30 дней с момента оплаты расчетного периода.
                </p>

                {/* Meter gauge */}
                <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                  <div className="flex justify-between text-xs font-bold text-slate-200 mb-1.5">
                    <span>Использованный ИИ Лимит Соискателей:</span>
                    <span className="font-mono text-[#E7C768]">
                      {candidates.length} / {tariffLevel === "bronze" ? "5" : tariffLevel === "silver" ? "50" : "Безлимитно"}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-red-650 h-2.5 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (candidates.length / (tariffLevel === "bronze" ? 5 : tariffLevel === "silver" ? 50 : 100)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* THREE SUBSCRIPTION PLANS TIERS CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-medium">
                
                {/* Bronze */}
                <div className={`p-5 rounded-3xl border flex flex-col justify-between ${tariffLevel === "bronze" ? "bg-[#1E4468]/95 border-[#E7C768]/65 shadow-lg" : "bg-black/25 border-white/10"}`}>
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Стандарт</span>
                    <h3 className="text-base font-bold text-white flex items-baseline gap-1">Бронза <span className="text-xs text-[#E7C768] font-mono">0 ₽</span></h3>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-normal">Для тестирования и малых объемов первой фильтрации кадров.</p>
                    <ul className="text-[10px] space-y-1.5 text-slate-200 list-disc list-inside">
                      <li>До 5 соискателей в месяц</li>
                      <li>До 2 активных вакансий</li>
                      <li>Базовые ИИ-сценарии GPT</li>
                      <li>Привязка 1 Telegram ID</li>
                    </ul>
                  </div>
                  <button disabled className="mt-6 w-full text-center text-[10px] font-bold uppercase py-2 rounded bg-white/5 border border-white/5 text-slate-350">
                    {tariffLevel === "bronze" ? "Активен" : "Начальный план"}
                  </button>
                </div>

                {/* Silver */}
                <div className={`p-5 rounded-3xl border flex flex-col justify-between ${tariffLevel === "silver" ? "bg-[#1E4468]/95 border-[#E7C768]/65 shadow-lg" : "bg-[#17344F]/50 border-white/10"}`}>
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-sky-400 uppercase font-mono block">Продвинутый</span>
                    <h3 className="text-base font-bold text-white flex items-baseline gap-1">Серебро <span className="text-xs text-[#E7C768] font-mono">14 900 ₽</span></h3>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-normal">Идеально для растущих отделов продаж и филиалов.</p>
                    <ul className="text-[10px] space-y-1.5 text-slate-200 list-disc list-inside">
                      <li>До 50 соискателей в месяц</li>
                      <li>До 5 активных вакансий</li>
                      <li>Режим Gemini Flash API</li>
                      <li>Привязка Telegram ботов</li>
                      <li>Своя база Wiki Wiki</li>
                    </ul>
                  </div>
                  <button 
                    disabled={tariffLevel === "silver" || tariffLevel === "gold"}
                    onClick={() => { setSelectedPlanToBuy("silver"); setShowPaymentModal(true); }}
                    className="cursor-pointer mt-6 w-full text-center text-[11px] font-bold uppercase py-2 rounded bg-gradient-to-r from-amber-500 to-amber-600 border border-[#E7C768]/20 text-white disabled:opacity-40"
                  >
                    {tariffLevel === "silver" ? "Активен" : tariffLevel === "gold" ? "Приобретено" : "Купить Серебро"}
                  </button>
                </div>

                {/* Gold / VIP */}
                <div className={`p-5 rounded-3xl border flex flex-col justify-between ${tariffLevel === "gold" ? "bg-[#1E4468]/95 border-[#E7C768]/65 shadow-lg" : "bg-[#2A2A2A]/25 border-white/10"}`}>
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono block">Премимум решение</span>
                    <h3 className="text-base font-bold text-white flex items-baseline gap-1">VIP Золото <span className="text-xs text-[#E7C768] font-mono">39 900 ₽</span></h3>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-normal">Безлимитный ИИ И ураганная скорость набора сотрудников.</p>
                    <ul className="text-[10px] space-y-1.5 text-slate-200 list-disc list-inside">
                      <li>Абсолютный безлимит кадров</li>
                      <li>Безлимитные проекты Wiki</li>
                      <li>Выделенная ИИ-шина Gemini Pro</li>
                      <li>Выгрузка в корпоративные CRM</li>
                    </ul>
                  </div>
                  <button 
                    disabled={tariffLevel === "gold"}
                    onClick={() => { setSelectedPlanToBuy("gold"); setShowPaymentModal(true); }}
                    className="cursor-pointer mt-6 w-full text-center text-[11px] font-bold uppercase py-2 rounded bg-gradient-to-r from-emerald-600 to-teal-700 text-white disabled:opacity-40"
                  >
                    {tariffLevel === "gold" ? "Сверх-доступ активен" : "Подключить Безлимит"}
                  </button>
                </div>

              </div>

              {/* PAYMENT TRANSACTIONS RECEIPTS REGISTRY LIST */}
              <div className="bg-[#1D3E5E]/40 border border-white/10 rounded-3xl overflow-hidden shadow">
                <div className="p-4 bg-gradient-to-r from-[#17344F] to-[#265582] text-xs font-bold font-mono tracking-wider text-slate-300">
                  История Платежей & Выставленные счета
                </div>
                <div className="overflow-x-auto text-xs font-mono">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-black/25 text-gray-400 border-b border-white/5">
                        <th className="p-3">ID Транзакции</th>
                        <th className="p-3">Дата операции</th>
                        <th className="p-3">Тарифный план</th>
                        <th className="p-3">Сумма</th>
                        <th className="p-3">Способ</th>
                        <th className="p-3 text-right">Статус</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-200 font-normal">
                      {paymentHistory.map((pt, i) => (
                        <tr key={i} className="hover:bg-white/5">
                          <td className="p-3 font-bold">{pt.id}</td>
                          <td className="p-3">{pt.date}</td>
                          <td className="p-3 font-sans font-bold text-[#E7C768]">{pt.plan}</td>
                          <td className="p-3 font-bold">{pt.amount}</td>
                          <td className="p-3 font-sans text-slate-300">{pt.method}</td>
                          <td className="p-3 text-right font-sans">
                            <span className="bg-emerald-950/80 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold text-[10px]">{pt.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 5: PROFILE & TELEGRAM PORTAL */}
          {activeTab === "profile" && (
            <div className="space-y-6 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Profile manager form details */}
                <div className="bg-[#1D3E5E]/85 border border-white/15 rounded-3xl p-6 shadow-xl space-y-4">
                  <h3 className="font-bold text-sm text-[#E7C768] uppercase font-mono tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-[#D99E41]" /> Учетные данные Работодателя
                  </h3>
                  
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-slate-300 block mb-1 font-bold">ФИО представителя компании:</label>
                      <input 
                        type="text" 
                        className="w-full bg-[#17344F]/65 border border-white/10 rounded-xl px-3 py-2 text-white" 
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 block mb-1 font-bold">Должность в штате:</label>
                      <input 
                        type="text" 
                        className="w-full bg-[#17344F]/65 border border-white/10 rounded-xl px-3 py-2 text-white" 
                        value={profileTitle}
                        onChange={(e) => setProfileTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 block mb-1 font-bold">Электронная почта:</label>
                      <input 
                        type="email" 
                        className="w-full bg-[#17344F]/65 border border-white/10 rounded-xl px-3 py-2 text-white" 
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 block mb-1 font-bold">Мобильный телефон:</label>
                      <input 
                        type="text" 
                        className="w-full bg-[#17344F]/65 border border-white/10 rounded-xl px-3 py-2 text-white" 
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                      />
                    </div>

                    <div className="pt-2">
                      <button 
                        type="button" 
                        onClick={() => {
                          setIsProfileSaved(true);
                          addAuditEvent("success", "Профиль сохранен", "HR менеджер успешно обновил личные контактные данные.");
                          setTimeout(() => setIsProfileSaved(false), 2000);
                        }}
                        className="cursor-pointer bg-[#E7C768] text-slate-900 font-bold px-4 py-2 rounded-xl text-xs hover:bg-[#F3D78E] shadow"
                      >
                        {isProfileSaved ? "Сохранено! ✓" : "Сохранить профиль"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Telegram notifications integration configurations */}
                <div className="bg-[#1D3E5E]/85 border border-white/15 rounded-3xl p-6 shadow-xl space-y-4">
                  <h3 className="font-bold text-sm text-[#E7C768] uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-sky-400" /> Связь с Вашим Telegram
                  </h3>
                  <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                    Чтобы Робот Рекрутер исправно уведомлял Вашего руководителя об этапах прохождения соискателей в реальном времени, прикрепите личный идентификатор.
                  </p>

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="w-full bg-[#17344F]/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                        placeholder="Telegram ID. Например: 59384591"
                        value={adminTgId}
                        onChange={(e) => setAdminTgId(e.target.value)}
                      />
                      <button
                        onClick={saveTgId}
                        className="cursor-pointer bg-gradient-to-r from-red-650 to-orange-700 text-white font-bold px-4 rounded-xl text-xs"
                      >
                        Привязать
                      </button>
                    </div>

                    <div className="bg-black/30 p-4 rounded-2xl border border-white/5 font-mono text-[10.5px] leading-relaxed space-y-1.5">
                      <div className="font-bold text-[#E7C768] text-[11px] font-sans">Инструкция синхронизации:</div>
                      <div>1. Перейдите в Telegram на адрес <strong className="text-sky-300">@HR_RRbot</strong></div>
                      <div>2. Запустите бота командой <strong className="text-sky-300">/start</strong></div>
                      <div>3. Бот сразу спишет ваш ID; скопируйте его и подставьте в окно привязки выше.</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* PAGE 6: EVENTS & LOGGER HISTORY LOG */}
          {activeTab === "events" && (
            <div className="bg-[#1D3E5E]/85 border border-white/15 rounded-3xl p-6 shadow-xl space-y-5 text-left">
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-white/10 pb-3 gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[#E7C768] flex items-center gap-2">
                    <Activity className="w-5 h-5 text-amber-400 animate-pulse" />
                    Журнал Событий и Кандидат Логи
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">Системные логи изменения соискателей, ИИ начислений баллов и триггеров бота оповещений.</p>
                </div>

                <div className="flex gap-2 font-bold font-mono">
                  <select 
                    className="bg-black/45 text-[11px] text-slate-300 px-2 py-1 rounded border border-white/10 focus:outline-none"
                    value={auditFilter}
                    onChange={(e) => setAuditFilter(e.target.value as any)}
                  >
                    <option value="all">Все события</option>
                    <option value="info">Инфо ℹ️</option>
                    <option value="success">Успех ✅</option>
                    <option value="warning">Пауза ⚠️</option>
                  </select>

                  <button onClick={fetchData} className="bg-white/5 border border-white/10 rounded px-2.5 py-1 hover:bg-white/10 transition flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 text-[#E7C768]" /> Свежие
                  </button>
                </div>
              </div>

              {/* STATS LOGGER SUMMARIZER PRE-CARD */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center font-mono text-xs">
                <div className="bg-black/25 p-3 rounded-2xl border border-white/5">
                  <span className="text-[10px] text-gray-400 block pb-1">Успешных сертификаций</span>
                  <strong className="text-[#E7C768] text-base font-black uppercase font-sans">{totalVerified}</strong>
                </div>
                <div className="bg-black/25 p-3 rounded-2xl border border-white/5">
                  <span className="text-[10px] text-gray-400 block pb-1">Средний балл воронки</span>
                  <strong className="text-sky-300 text-base font-black uppercase font-sans">{averageAllScores}/100</strong>
                </div>
                <div className="bg-black/25 p-3 rounded-2xl border border-white/5">
                  <span className="text-[10px] text-gray-400 block pb-1">Активность Gemini</span>
                  <strong className="text-emerald-400 text-base font-black uppercase font-sans">100% ONLINE</strong>
                </div>
              </div>

              {/* STREAM CONTAINER LIST */}
              <div className="space-y-4">
                
                {/* 1. Audit events stream merged with real-time fetch logs */}
                <div className="space-y-2.5">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider font-mono">1. Журнал Действий Администратора:</span>
                  {auditEvents.filter(ev => {
                    if (auditFilter === "all") return true;
                    return ev.type === auditFilter;
                  }).map(ev => {
                    return (
                      <div key={ev.id} className="bg-[#17344F]/40 border border-white/5 rounded-xl p-3 flex items-start gap-3 text-xs leading-relaxed font-mono">
                        <span className="text-gray-400 font-bold select-none whitespace-nowrap">[{ev.timestamp}]</span>
                        <div className="space-y-0.5">
                          <strong className={`font-bold block font-sans ${ev.type === "success" ? "text-emerald-400" : ev.type === "warning" ? "text-amber-400" : "text-sky-300"}`}>
                            {ev.type === "success" ? "✓" : ev.type === "warning" ? "⚠" : "ℹ"} {ev.title}
                          </strong>
                          <span className="text-slate-300 text-[11px] block">{ev.message}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 2. Telegram message logger stream */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider font-mono">2. Журнал Оповещения в Телеграм-канале бота:</span>
                  {tgMsgLog.length === 0 ? (
                    <div className="text-xs text-slate-500 italic py-6 text-center select-none bg-black/10 rounded-2xl border border-white/5">Пока нет отправленных Rest API уведомлений.</div>
                  ) : (
                    tgMsgLog.slice(0, 15).map(lg => (
                      <div key={lg.id} className="bg-black/45 border border-white/5 rounded-xl p-3 flex items-start gap-2 text-xs font-mono select-none">
                        <span className="text-slate-400 font-bold whitespace-nowrap">[{lg.timestamp}]</span>
                        <div className="flex-1 space-y-1">
                          <span className="bg-sky-950 text-sky-400 text-[9px] px-1.5 py-0.2 rounded font-bold">API TG-Bot</span>
                          <span className="text-slate-200 block text-[11px] leading-tight whitespace-pre-wrap">{lg.message}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* FOOTER AREA */}
      <footer className="bg-[#17344F] border-t-2 border-[#E7C768] py-8 text-white text-center font-normal">
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

          <div className="flex gap-4 text-xs text-slate-400 font-semibold">
            <button onClick={() => navigate("/main")} className="hover:text-white transition">Главная</button>
            <button onClick={() => navigate("/vacancy")} className="hover:text-white transition">Каталог</button>
            <button onClick={() => setActiveTab("crm")} className="hover:text-white transition">Панель Руководителя</button>
            <button onClick={() => navigate("/candidate")} className="hover:text-white transition">Панель Кандидата</button>
          </div>
        </div>
      </footer>

      {/* MODAL WINDOW 1: DETAILED INTEGRATED CANDIDATE CARD VIEWER */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1D3E5E] border border-[#E7C768]/60 p-6 rounded-3xl w-full max-w-2xl text-left text-white shadow-2xl relative max-h-[85vh] overflow-y-auto space-y-5">
            <button 
              onClick={() => setSelectedCandidate(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>

            {/* Title card banner */}
            <div className="border-b border-white/10 pb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Федеральный профиль соискателя №{selectedCandidate.id.substring(0, 8)}</span>
              <h2 className="text-xl font-bold text-[#E7C768] mt-1 flex items-center gap-2">
                <User className="w-5 h-5 text-amber-400" /> {selectedCandidate.name}
              </h2>
              <div className="text-xs text-slate-300 flex flex-wrap gap-x-4 mt-1 font-mono">
                <span>📧 {selectedCandidate.email}</span>
                {selectedCandidate.telegramUsername && <span>💬 @{selectedCandidate.telegramUsername}</span>}
                <span>📅 от: {selectedCandidate.createdAt ? new Date(selectedCandidate.createdAt).toLocaleDateString() : "Недавно"}</span>
              </div>
            </div>

            {/* Score ring stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                <span className="text-[9px] text-gray-400 block uppercase">1. Резюме</span>
                <span className="text-white text-base font-bold">{selectedCandidate.scores?.resumeScore || 70}/100</span>
              </div>
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                <span className="text-[9px] text-gray-400 block uppercase">2. Чек-лист</span>
                <span className="text-white text-base font-bold">{selectedCandidate.scores?.checklistScore || 80}/100</span>
              </div>
              <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                <span className="text-[9px] text-gray-400 block uppercase">3. Ситуации</span>
                <span className="text-white text-base font-bold">{selectedCandidate.scores?.situationsScore || 75}/100</span>
              </div>
              <div className="bg-[#E7C768]/10 p-2.5 rounded-xl border border-[#E7C768]/20">
                <span className="text-[9px] text-[#E7C768] block uppercase font-bold">Общий балл</span>
                <span className="text-[#E7C768] text-base font-black">
                  {Math.round(
                    ((selectedCandidate.scores?.resumeScore !== undefined ? selectedCandidate.scores.resumeScore : 70) +
                     (selectedCandidate.scores?.checklistScore !== undefined ? selectedCandidate.scores.checklistScore : 80) +
                     (selectedCandidate.scores?.situationsScore !== undefined ? selectedCandidate.scores.situationsScore : 75)) / 3
                  )}/100
                </span>
              </div>
            </div>

            {/* Deep summaries */}
            <div className="space-y-3 font-normal text-xs leading-relaxed text-slate-200">
              <div className="bg-black/25 p-4 rounded-2xl border border-white/5 space-y-1.5">
                <span className="text-[10px] font-bold text-[#E7C768] block uppercase font-mono">ИИ Сводка результатов Робоконкурса:</span>
                <p className="italic">"{selectedCandidate.scores?.assessmentSummary || "Кандидат продемонстрировал хорошие базовые результаты на собеседовании. Отлично коммуницирует."}"</p>
              </div>

              {selectedCandidate.resumeText && (
                <div className="space-y-1">
                  <span className="font-bold text-white block">Текст резюме куратора:</span>
                  <div className="bg-black/45 p-3 rounded-xl border border-white/5 font-mono text-[10.5px] max-h-32 overflow-y-auto whitespace-pre-wrap">
                    {selectedCandidate.resumeText}
                  </div>
                </div>
              )}
            </div>

            {/* Change progress controls directly inside details popup */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-xs">
                <span>Перевести соискателя: </span>
                <strong className="text-white">{selectedCandidate.currentStage}</strong>
              </div>

              <div className="flex gap-2 text-xs font-semibold">
                <button
                  onClick={() => {
                    handleUpdateCandidateStage(selectedCandidate.id, "training");
                    setSelectedCandidate(null);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg shadow"
                >
                  Перевести на обучение 📖
                </button>
                <button
                  onClick={() => {
                    handleUpdateCandidateStage(selectedCandidate.id, "certified");
                    setSelectedCandidate(null);
                  }}
                  className="bg-emerald-650 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg shadow font-bold"
                >
                  Выдать Сертификат 🎓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL WINDOW 2: INTERACTIVE SIMULATED TARIFFS PURCHASE BILLING */}
      {showPaymentModal && selectedPlanToBuy && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1D3E5E] border-2 border-[#E7C768]/60 p-6 rounded-3xl w-full max-w-md text-left text-white shadow-2xl relative space-y-4">
            <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold">✕</button>

            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono block">Simulated Safe Gateway v2.2</span>
              <h2 className="text-base font-bold text-white mt-1">Оплата обновления аккаунта Робот Рекрутер</h2>
              <p className="text-xs text-slate-300 mt-1">Комиссия банка: 0% | Безопасная транзакция в российских рублях.</p>
            </div>

            <div className="bg-black/35 p-4 rounded-2xl border border-white/5 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Выбранный пакет:</span>
                <span className="font-bold text-[#E7C768] uppercase">{selectedPlanToBuy === "silver" ? "Тариф Серебро ИИ" : "Тариф VIP Золото"}</span>
              </div>
              <div className="flex justify-between">
                <span>Итого к оплате:</span>
                <span className="font-bold text-white font-mono">{selectedPlanToBuy === "silver" ? "14 900 ₽" : "39 900 ₽"}</span>
              </div>
            </div>

            {/* Mock Credit Card selection form details screen */}
            <div className="space-y-3 font-normal text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Номер банковской карты или СБП телефон:</label>
                <input 
                  type="text" 
                  className="w-full bg-[#17344F]/80 border border-white/10 rounded-xl px-3 py-2 text-white font-mono" 
                  placeholder="2202 0000 0000 1234"
                  defaultValue="2202 5901 2294 1049"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="text-slate-300 block mb-0.5 font-sans">Срок действия:</label>
                  <input type="text" className="w-full bg-[#17344F]/80 border border-white/10 rounded-xl px-3 py-2 text-center text-white" placeholder="05/29" defaultValue="08/29" />
                </div>
                <div>
                  <label className="text-slate-300 block mb-0.5 font-sans">Код CVC2/CVV2:</label>
                  <input type="password" className="w-full bg-[#17344F]/80 border border-white/10 rounded-xl px-3 py-2 text-center text-white" placeholder="***" defaultValue="943" />
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirmPayment}
              disabled={isProcessingPayment}
              className="cursor-pointer w-full bg-gradient-to-r from-emerald-600 to-teal-700 py-3 rounded-xl text-center text-xs font-bold text-white uppercase shadow-md transition disabled:opacity-40"
            >
              {isProcessingPayment ? (
                <span className="flex items-center justify-center gap-1">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Связь с сервером платежного шлюза...
                </span>
              ) : (
                `Оплатить ${selectedPlanToBuy === "silver" ? "14 900 ₽" : "39 900 ₽"}`
              )}
            </button>

            <span className="text-[10px] text-zinc-400 leading-normal block text-center italic">Вы также можете пропустить оплату, вся система адаптации полноценно работает в тестовом режиме Бронза.</span>
          </div>
        </div>
      )}

    </div>
  );
}
