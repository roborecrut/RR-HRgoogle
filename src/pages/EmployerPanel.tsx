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
  Chrome,
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
  Award,
  Sparkles,
  ChevronRight
} from "lucide-react";
import {
  VacancyView,
  MotivationView,
  CompanyView,
  OnboardingView,
  PayoutsView,
  ScheduleView,
  TeamView,
  SystemView
} from "../components/VacancySections";

export default function EmployerPanel() {
  const { path, navigate } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Derive active tab from subroute PATH
  let activeTab: "crm" | "vacancies" | "companies" | "tariff" | "profile" | "events" = "crm";
  if (path.includes("/vacancies")) {
    activeTab = "vacancies";
  } else if (path.includes("/companies")) {
    activeTab = "companies";
  } else if (path.includes("/tariff") || path.includes("/billing") || path.includes("/invoice") || path.includes("/payment") || path.includes("/accounts")) {
    activeTab = "tariff";
  } else if (path.includes("/profile")) {
    activeTab = "profile";
  } else if (path.includes("/events")) {
    activeTab = "events";
  } else {
    activeTab = "crm";
  }

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
  const [setupLogoUrl, setSetupLogoUrl] = useState("https://i.ibb.co/WWRbtPq0/RR-Logo.png");
  const [specialtySearch, setSpecialtySearch] = useState("");
  const [showAddNewVacancy, setShowAddNewVacancy] = useState(false);

  // Profile States
  const [adminTgId, setAdminTgId] = useState(() => localStorage.getItem("employer_tg_id") || "59384591");
  const [profileName, setProfileName] = useState("Сергей Ковалев");
  const [profileTitle, setProfileTitle] = useState("Директор по персоналу");
  const [profileEmail, setProfileEmail] = useState("hr-director@company.ru");
  const [profilePhone, setProfilePhone] = useState("+7 (926) 012-34-56");
  const [isProfileSaved, setIsProfileSaved] = useState(false);

  // High-fidelity Google and Telegram profile states
  const [googleName, setGoogleName] = useState("Сергей Ковалев");
  const [googleEmail, setGoogleEmail] = useState("hr-director@company.ru");
  const [googlePhoto, setGooglePhoto] = useState("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80");
  const [googleId, setGoogleId] = useState("g-1094857293049182743");
  const [googleVerified, setGoogleVerified] = useState(true);

  const [telegramIdState, setTelegramIdState] = useState("59384591");
  const [telegramPhoto, setTelegramPhoto] = useState("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2.2&w=256&h=256&q=80");
  const [telegramFirstName, setTelegramFirstName] = useState("Сергей");
  const [telegramLastName, setTelegramLastName] = useState("Ковалев");
  const [telegramUsernameState, setTelegramUsernameState] = useState("cowal_sales");

  // Billing & Tariff States
  const [employerId, setEmployerId] = useState(() => {
    let id = localStorage.getItem("employer_session_id");
    if (!id) {
      id = "emp-demo"; // Seeded demo employer
      localStorage.setItem("employer_session_id", id);
      localStorage.setItem("employer_name", "Сергей Ковалев");
      localStorage.setItem("employer_email", "hr-director@company.ru");
      localStorage.setItem("employer_tg", "cowal_sales");
      localStorage.setItem("employer_role", "employer");
    }
    return id;
  });

  const [balance, setBalance] = useState<number>(1000);
  const [limits, setLimits] = useState({
    interviews: 2,
    trainings: 2,
    landings: 1,
    interviewSystems: 1,
    trainingSystems: 1
  });

  const [topupAmountRub, setTopupAmountRub] = useState<number>(100);
  const [purchaseError, setPurchaseError] = useState<string>("");
  const [isBuying, setIsBuying] = useState<string | null>(null);
  const [isToppingUp, setIsToppingUp] = useState(false);

  const [tariffLevel, setTariffLevel] = useState<"bronze" | "silver" | "gold">("bronze");
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlanToBuy, setSelectedPlanToBuy] = useState<"silver" | "gold" | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Companies custom database state
  const [companiesList, setCompaniesList] = useState<any[]>([]);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyIndustry, setNewCompanyIndustry] = useState("");
  const [newCompanyStaff, setNewCompanyStaff] = useState("10-50 человек");
  const [newCompanyDesc, setNewCompanyDesc] = useState("");
  const [newCompanySite, setNewCompanySite] = useState("");
  const [newCompanyLogo, setNewCompanyLogo] = useState("");
  const [newCompanyFiles, setNewCompanyFiles] = useState("");
  const [isParsingFile, setIsParsingFile] = useState(false);

  // Project (Vacancy) edit state
  const [editingProject, setEditingProject] = useState<JobProject | null>(null);
  const [editorSubTab, setEditorSubTab] = useState<string>("company");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // System Audit Events State
  const [auditEvents, setAuditEvents] = useState<any[]>([
    { id: 1, type: "info", title: "Вход в панель управления", message: "Успешная авторизация в системе управления Робором.", timestamp: "12:15:30" },
    { id: 2, type: "success", title: "Обновление синхронизации", message: "Проекты и аналитика успешно считаны со встроенного БД сервера.", timestamp: "12:15:35" }
  ]);
  const [auditFilter, setAuditFilter] = useState<"all" | "info" | "success" | "warning">("all");

  // Synchronized Full-Stack Fetching
  const fetchCompanies = async () => {
    try {
      const res = await fetch("/api/companies");
      if (res.ok) {
        const list = await res.json();
        // Set all companies
        setCompaniesList(list);
      }
    } catch (err) {
      console.error("Error loading companies from server:", err);
    }
  };

  const fetchEmployerData = async () => {
    try {
      const res = await fetch(`/api/employers/${employerId}`);
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance || 0);
        if (data.limits) {
          setLimits(data.limits);
        }
        if (data.name) setProfileName(data.name);
        if (data.title) setProfileTitle(data.title);
        if (data.email) setProfileEmail(data.email);
        if (data.phone) setProfilePhone(data.phone);
        if (data.telegramId) setAdminTgId(data.telegramId);

        // Sub-profiles sync from server DB
        setGoogleName(data.googleName || data.name || "Сергей Ковалев");
        setGoogleEmail(data.googleEmail || data.email || "hr-director@company.ru");
        setGooglePhoto(data.googlePhoto || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80");
        setGoogleId(data.googleId || `g-1094857293049182743`);
        setGoogleVerified(data.googleVerified !== undefined ? data.googleVerified : true);

        setTelegramIdState(data.telegramId || data.telegramId || "59384591");
        setTelegramPhoto(data.telegramPhoto || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2.2&w=256&h=256&q=80");
        setTelegramFirstName(data.telegramFirstName || "Сергей");
        setTelegramLastName(data.telegramLastName || "Ковалев");
        setTelegramUsernameState(data.telegramUsername || data.telegramUsername || "cowal_sales");
      }
    } catch (err) {
      console.error("Error loading employer profile:", err);
    }
  };

  const handleUpdateProfile = async (customPayload?: any) => {
    try {
      const defaultPayload = {
        name: profileName,
        title: profileTitle,
        email: profileEmail,
        phone: profilePhone,
        telegramId: adminTgId,
        googleName,
        googleEmail,
        googlePhoto,
        googleId,
        googleVerified,
        telegramPhoto,
        telegramFirstName,
        telegramLastName,
        telegramUsername: telegramUsernameState
      };

      const payload = customPayload ? { ...defaultPayload, ...customPayload } : defaultPayload;

      const res = await fetch(`/api/employers/${employerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsProfileSaved(true);
        addAuditEvent("success", "Профиль сохранен", "HR менеджер успешно обновил личные контактные данные и интеграции.");
        setTimeout(() => setIsProfileSaved(false), 2500);
        fetchEmployerData();
      }
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

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

      // Fetch dynamic full-stack billing profile
      await fetchEmployerData();
      await fetchCompanies();

      // Mirror transactions from backend to payments listing
      const resPayments = await fetch("/api/admin/payments");
      if (resPayments.ok) {
        const paymentsData = await resPayments.json();
        const mappedHistory = paymentsData
          .filter((p: any) => p.companyName.includes(employerId) || p.companyName.includes(profileEmail))
          .map((p: any) => ({
            id: p.id,
            date: p.createdAt ? p.createdAt.split("T")[0] : "2026-05-30",
            plan: p.itemName,
            amount: p.itemType.startsWith("purchase_") ? `-${p.amount} RR` : `+${p.amount} RR`,
            status: "Успешно",
            method: p.itemType === "topup" ? "Карта/Калькулятор" : p.itemType === "referral_reward" ? "Реферал" : "Баланс RR"
          }));
        setPaymentHistory(mappedHistory);
      }
    } catch (err) {
      console.error("Error loading server data:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [employerId]);

  useEffect(() => {
    const pathIdMatch = path.match(/^\/employer([a-zA-Z0-9_-]+)/);
    if (pathIdMatch && pathIdMatch[1] !== employerId) {
      setEmployerId(pathIdMatch[1]);
      localStorage.setItem("employer_session_id", pathIdMatch[1]);
    }
  }, [path, employerId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/main");
  };

  // Action: Buy Service Limits via Balance RR
  const handlePurchaseItem = async (itemType: "interview" | "training" | "landing" | "system_interview" | "system_training") => {
    setPurchaseError("");
    setIsBuying(itemType);
    try {
      const res = await fetch(`/api/employers/${employerId}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Ошибка при списании баланса.");
      }
      setBalance(data.balance);
      if (data.limits) setLimits(data.limits);
      addAuditEvent("success", "Услуга приобретена", `Успешно куплено: ${itemType}`);
      fetchData();
    } catch (err: any) {
      setPurchaseError(err.message);
    } finally {
      setIsBuying(null);
    }
  };

  // Action: Top Up Balance 
  const handleTopupBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (topupAmountRub < 100) {
      alert("Начальный минимальный платеж 100 рублей.");
      return;
    }
    setIsToppingUp(true);
    try {
      const res = await fetch(`/api/employers/${employerId}/topup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountRubles: topupAmountRub })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Не удалось пополнить баланс.");
      }
      setBalance(data.balance);
      addAuditEvent("success", "Баланс пополнен", `Зачислено: +${topupAmountRub} RR`);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsToppingUp(false);
    }
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

    const matchedCompany = companiesList.find(c => c.name.toLowerCase() === setupCompanyName.toLowerCase());
    const companySlug = matchedCompany ? matchedCompany.slug : setupCompanyName.toLowerCase()
      .replace(/[^а-яёa-z0-9\s-]/gi, "")
      .trim()
      .replace(/\s+/g, "-");

    try {
      const res = await fetch("/api/generate-project-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: setupCompanyName,
          companySlug,
          employerId,
          roleName: setupRoleName,
          salaryTerms: setupSalary,
          scheduleTerms: setupSchedule,
          customWiki: setupCustomWiki,
          logoUrl: setupLogoUrl
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
          { 
            name: setupCompanyName, 
            slug: companySlug,
            industry: "Услуги / Производство", 
            staff: "10-25 человек", 
            description: "Интегрированная новая компания в экосистему адаптации сотрудников.", 
            activeVacancies: 1,
            employerId
          }
        ]);
      }

      addAuditEvent("success", "ИИ-Блок онбординга собран", `Программа лекций, ситуационных вопросов создана для ${setupRoleName}`);
      setShowAddNewVacancy(false);
      navigate(`/employer${employerId}/vacancies`);
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

  // Save edited project values
  const handleSaveEditedProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    setIsSavingEdit(true);
    try {
      const res = await fetch(`/api/projects/${editingProject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProject)
      });

      if (!res.ok) throw new Error("Не удалось сохранить изменения вакансии.");

      const updatedProj = await res.json();
      setProjects(prev => prev.map(p => p.id === updatedProj.id ? updatedProj : p));
      addAuditEvent("success", "Вакансия обновлена", `Изменения для вакансии "${updatedProj.roleName}" сохранены успешно.`);
      setEditingProject(null);
    } catch (err: any) {
      alert("Ошибка при сохранении: " + err.message);
    } finally {
      setIsSavingEdit(false);
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
  const handleAddCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName) return;

    // Transliterate to generate slug as requested: "Лендинг будет иметь адрес /ooo-roga-i-kopyta"
    const rus = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя";
    const lat = ["a","b","v","g","d","e","yo","zh","z","i","y","k","l","m","n","o","p","r","s","t","u","f","kh","ts","ch","sh","shch","","y","","e","yu","ya"];
    const slug = newCompanyName.toLowerCase()
      .replace(/[^а-яёa-z0-9\s-]/gi, "")
      .trim()
      .split("")
      .map(char => {
        const idx = rus.indexOf(char);
        return idx > -1 ? lat[idx] : char;
      })
      .join("")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    const payload = {
      name: newCompanyName,
      slug,
      industry: newCompanyIndustry || "Производство",
      staff: newCompanyStaff,
      description: newCompanyDesc || "Компания осуществляет подбор перспективных кадров.",
      sites: newCompanySite || "",
      logoUrl: newCompanyLogo || "",
      files: newCompanyFiles || "",
      employerId
    };

    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const saved = await res.json();
        setCompaniesList(prev => [...prev, saved]);
        addAuditEvent("success", "Создана компания", `Зарегистрирован бренд ${newCompanyName}`);
        
        // Reset inputs
        setNewCompanyName("");
        setNewCompanyDesc("");
        setNewCompanyIndustry("");
        setNewCompanySite("");
        setNewCompanyLogo("");
        setNewCompanyFiles("");
        setShowAddCompany(false);
      }
    } catch (err) {
      console.error("Failed to add company on server:", err);
    }
  };

  // Copy registration link to clipboard - updated to point to elegant corporate careers landing
  const handleCopyLink = (projectId: string, projCompanySlug?: string) => {
    const proj = projects.find(p => p.id === projectId);
    const matchedCompany = companiesList.find(c => c.name.toLowerCase() === proj?.companyName?.toLowerCase());
    const slug = projCompanySlug || proj?.companySlug || (matchedCompany ? matchedCompany.slug : "company-portal");
    const signupUrl = `${window.location.origin}/${slug}/${projectId}`;
    navigator.clipboard.writeText(signupUrl);
    setCopiedProjectId(projectId);
    setTimeout(() => setCopiedProjectId(null), 2000);
  };

  // Auto-recognize file for job vacancy conditions
  const handleAutoRecognizeFile = (filename: string) => {
    setIsParsingFile(true);
    addAuditEvent("info", "Анализ файла вакансии", `Запущен разбор вакансии из файла: ${filename}`);
    
    // Simulate smart parsing & fill out fields
    setTimeout(() => {
      setIsParsingFile(false);
      setSetupRoleName("Инженер по тестированию (QA)");
      setSetupSalary("95 000 - 130 000 руб");
      setSetupSchedule("Полный день, гибрид в Москве");
      setSetupCustomWiki(`Обязанности сотрудника компании:
- Проведение ручного и автоматизированного тестирования веб-приложений.
- Заведение багов в корпоративную систему таск-трекера.
- Подготовка тестовых сценариев и чек-листов.
- Взаимодействие с командой разработчиков.`);
      addAuditEvent("success", "Файл вакансии распознан", `ИИ успешно выгрузил условия для "Инженер по тестированию (QA)".`);
    }, 1500);
  };

  // Save TG ID
  const saveTgId = () => {
    localStorage.setItem("employer_tg_id", adminTgId);
    handleUpdateProfile();
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
            <button onClick={() => navigate("/employer/crm")} className="transition px-3 py-2 rounded-xl text-[#E7C768] bg-white/10 border border-[#E7C768]/20">
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
            <button onClick={() => { navigate("/employer/crm"); setMobileMenuOpen(false); }} className="transition text-left w-full px-4 py-3 rounded-xl text-[#E7C768] bg-white/10">Панель Работодателя</button>
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
                onClick={() => navigate(`/employer${employerId}/profile`)}
                className={`w-full text-left font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-between transition-all ${activeTab === "profile" ? "bg-[#1E4468] text-[#E7C768] border border-[#E7C768]/60 shadow" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
              >
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#D99E41]" /> 1. Профиль HR
                </span>
                <span className="text-[10px] bg-amber-900/40 text-[#E7C768] px-1.5 py-0.5 rounded font-mono">Шаг 1</span>
              </button>

              <button
                onClick={() => navigate(`/employer${employerId}/companies`)}
                className={`w-full text-left font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-between transition-all ${activeTab === "companies" ? "bg-[#1E4468] text-[#E7C768] border border-[#E7C768]/60 shadow" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
              >
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#D99E41]" /> 2. Мои Компании
                </span>
                <span className="text-[10px] bg-amber-900/40 text-[#E7C768] px-1.5 py-0.5 rounded font-mono">Шаг 2</span>
              </button>

              <button
                onClick={() => navigate(`/employer${employerId}/vacancies`)}
                className={`w-full text-left font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-between transition-all ${activeTab === "vacancies" ? "bg-[#1E4468] text-[#E7C768] border border-[#E7C768]/60 shadow" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
              >
                <span className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#D99E41]" /> 3. Вакансии & ИИ
                </span>
                <span className="bg-slate-800 text-[10px] text-slate-300 px-1.5 py-0.5 rounded font-mono">Шаг 3</span>
              </button>

              <button
                onClick={() => { navigate(`/employer${employerId}/crm`); setCrmViewMode("kanban"); }}
                className={`w-full text-left font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-between transition-all ${activeTab === "crm" ? "bg-[#1E4468] text-[#E7C768] border border-[#E7C768]/60 shadow" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#D99E41]" /> 4. CRM & Воронка
                </span>
                <span className="bg-amber-900/40 text-[10px] text-[#E7C768] px-1.5 py-0.5 rounded font-mono">{candidates.length}</span>
              </button>

              <button
                onClick={() => navigate(`/employer${employerId}/tariff`)}
                className={`w-full text-left font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-between transition-all ${activeTab === "tariff" ? "bg-[#1E4468] text-[#E7C768] border border-[#E7C768]/60 shadow" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
              >
                <span className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#D99E41]" /> 5. Тариф & Счета
                </span>
                <span className="bg-emerald-950 text-[10px] text-[#E7C768] font-bold uppercase px-1.5 py-0.5 rounded font-mono">{balance} RR</span>
              </button>

              <button
                onClick={() => navigate(`/employer${employerId}/events`)}
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

          {/* DYNAMIC ONBOARDING PROGRESS STEPPER */}
          {(activeTab === "profile" || activeTab === "companies" || activeTab === "vacancies") && (
            <div className="bg-[#1D3E5E]/85 border border-[#E7C768]/40 rounded-3xl p-5 shadow-xl text-left space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs text-[#E7C768] font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>Интерактивный онбординг работодателя</span>
                  </div>
                  <h3 className="text-base font-black text-white">Пройдите 3 простых шага, чтобы запустить ИИ рекрутинг под ключ</h3>
                </div>
                <span className="bg-[#E7C768]/10 text-[#E7C768] text-[10px] font-mono border border-[#E7C768]/30 px-2 py-0.5 rounded">
                  ID ЛК: {employerId}
                </span>
              </div>

              {/* Progress Stepper row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <button 
                  onClick={() => navigate(`/employer${employerId}/profile`)}
                  className={`text-left border p-3 rounded-2xl flex items-center gap-3 transition cursor-pointer ${
                    activeTab === "profile"
                      ? "bg-[#1E4468] border-[#E7C768] text-[#E7C768] shadow"
                      : "bg-black/20 border-white/5 text-slate-400 hover:border-white/10"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${activeTab === "profile" ? "bg-[#E7C768] text-[#1E4468]" : "bg-white/10 text-slate-300"}`}>
                    1
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-bold block leading-none text-[#E7C768]">Профиль</span>
                    <span className="text-xs font-bold block mt-0.5 truncate text-white">Учетные данные</span>
                  </div>
                </button>

                <button 
                  onClick={() => navigate(`/employer${employerId}/companies`)}
                  className={`text-left border p-3 rounded-2xl flex items-center gap-3 transition cursor-pointer ${
                    activeTab === "companies"
                      ? "bg-[#1E4468] border-[#E7C768] text-[#E7C768] shadow"
                      : "bg-black/20 border-white/5 text-slate-400 hover:border-white/10"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${activeTab === "companies" ? "bg-[#E7C768] text-[#1E4468]" : "bg-white/10 text-slate-300"}`}>
                    2
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-bold block leading-none text-[#E7C768]">Бренд</span>
                    <span className="text-xs font-bold block mt-0.5 truncate text-white">Создать лендинг</span>
                  </div>
                </button>

                <button 
                  onClick={() => navigate(`/employer${employerId}/vacancies`)}
                  className={`text-left border p-3 rounded-2xl flex items-center gap-3 transition cursor-pointer ${
                    activeTab === "vacancies"
                      ? "bg-[#1E4468] border-[#E7C768] text-[#E7C768] shadow"
                      : "bg-black/20 border-white/5 text-slate-400 hover:border-white/10"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${activeTab === "vacancies" ? "bg-[#E7C768] text-[#1E4468]" : "bg-white/10 text-slate-300"}`}>
                    3
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-bold block leading-none text-[#E7C768]">Робот ИИ</span>
                    <span className="text-xs font-bold block mt-0.5 truncate text-white">Запустить вакансию</span>
                  </div>
                </button>
              </div>
            </div>
          )}

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

                  {/* File intelligent import block */}
                  <div className="bg-black/25 p-4 rounded-3xl border border-white/10 space-y-3">
                    <span className="text-xs font-bold text-[#E7C768] block">Распознавание условий вакансии из файла</span>
                    <p className="text-[10.5px] text-slate-300">Перетащите сюда документ с традиционным описанием вакансии (PDF, DOC/DOCX, TXT) или нажмите для выбора — ИИ автоматически выкачает условия и обязанности.</p>
                    
                    <div 
                      onClick={() => {
                        const fInput = document.getElementById("vac-file-import") as HTMLInputElement;
                        if (fInput) fInput.click();
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleAutoRecognizeFile(e.dataTransfer.files[0].name);
                        }
                      }}
                      className="cursor-pointer border-2 border-dashed border-[#E7C768]/30 bg-[#1D3E5E]/40 hover:bg-[#1D3E5E]/70 rounded-2xl p-4 text-center space-y-1 transition text-white"
                    >
                      <input 
                        id="vac-file-import" 
                        type="file" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleAutoRecognizeFile(e.target.files[0].name);
                          }
                        }}
                      />
                      {isParsingFile ? (
                        <div className="flex flex-col items-center justify-center gap-1 text-[#E7C768] font-bold text-xs py-2">
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>ИИ распознает файлы... Выделение условий работы...</span>
                        </div>
                      ) : (
                        <div className="text-xs font-semibold text-slate-300">
                          Кликните или перетащите файл с описанием вакансии 📂
                        </div>
                      )}
                      <span className="text-[9.5px] text-slate-400 block font-mono">Поддерживаются .pdf, .docx, .txt файлы</span>
                    </div>
                  </div>

                  <form onSubmit={handleCreateOnboardingSystem} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-200 block mb-1">Компания:</label>
                        {companiesList.length > 0 ? (
                          <select
                            required
                            className="w-full bg-[#17344F] text-xs p-2.5 rounded-xl border border-white/10 text-white focus:outline-[#E7C768]"
                            value={setupCompanyName}
                            onChange={(e) => setSetupCompanyName(e.target.value)}
                          >
                            <option value="">Выберите компанию...</option>
                            {companiesList.map(c => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="space-y-1">
                            <input
                              type="text"
                              required
                              placeholder="Зарегистрируйте бренд в 'Мои Компании'"
                              className="w-full bg-[#17344F]/60 text-xs p-2.5 rounded-xl border border-red-500/50 text-slate-350 focus:outline-[#E7C768]"
                              value={setupCompanyName}
                              onChange={(e) => setSetupCompanyName(e.target.value)}
                            />
                            <span className="text-[10px] text-red-400 font-semibold block leading-tight">⚠ Внимание! Сначала зарегистрируйте Вашу Компанию на шаге 2, чтобы создать красивый адрес.</span>
                          </div>
                        )}
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

                    <div>
                      <label className="text-xs font-bold text-slate-200 block mb-1">Картинка логотипа вакансии (ссылка или файл):</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="flex-1 bg-[#17344F]/60 text-xs p-2.5 rounded-xl border border-white/10 focus:outline-[#E7C768]"
                          value={setupLogoUrl}
                          onChange={(e) => setSetupLogoUrl(e.target.value)}
                          placeholder="https://i.ibb.co/WWRbtPq0/RR-Logo.png"
                        />
                        <label className="cursor-pointer bg-[#1D3E5E] border border-white/10 hover:border-[#E7C768] text-xs px-3.5 py-2.5 rounded-xl text-white font-bold select-none text-center flex items-center shrink-0">
                          <span>📂 Загрузить файл</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  if (typeof reader.result === "string") {
                                    setSetupLogoUrl(reader.result);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                      {setupLogoUrl && (
                        <div className="mt-2 flex items-center gap-2 bg-black/15 p-2 rounded-xl border border-white/5">
                          <img src={setupLogoUrl} alt="Logo Preview" className="w-8 h-8 object-contain rounded" referrerPolicy="no-referrer" />
                          <span className="text-[10px] text-gray-400 truncate max-w-xs">{setupLogoUrl}</span>
                        </div>
                      )}
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
                        <div className="mt-2.5 bg-black/20 p-2.5 rounded-xl text-[11px] font-mono whitespace-pre-wrap leading-tight text-slate-300 line-clamp-2">
                          <strong>Инструкция/База Wiki:</strong> {proj.customWiki || "Пока пустая корпоративная вики."}
                        </div>

                        {/* Interactive dynamic link of vacancy page inside company career lander */}
                        <div className="mt-2.5 bg-black/35 p-2.5 rounded-xl border border-white/5 space-y-1">
                          <span className="text-[9px] uppercase font-bold text-[#E7C768] block leading-none font-mono">Адрес ИИ-страницы Вакансии (Лендинг):</span>
                          <a 
                            onClick={(e) => { e.preventDefault(); navigate(`/${proj.companySlug || "company-portal"}/${proj.id}`); }}
                            href={`/${proj.companySlug || "company-portal"}/${proj.id}`} 
                            className="cursor-pointer text-sky-300 font-mono text-[10.5px] hover:underline hover:text-sky-450 block truncate"
                          >
                            https://hr-rr.ru/{proj.companySlug || "company-portal"}/{proj.id}
                          </a>
                        </div>
                      </div>

                      {/* Lower Actions */}
                      <div className="mt-5 pt-3 border-t border-white/5 space-y-2">
                        <button
                          onClick={() => handleCopyLink(proj.id, proj.companySlug)}
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

                          <button
                            onClick={() => setEditingProject(proj)}
                            className="cursor-pointer flex-1 bg-[#E7C768]/10 hover:bg-[#E7C768]/20 text-[#E7C768] text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 border border-[#E7C768]/25"
                          >
                            🛠 Редактировать
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="Веб-сайт компании (например: www.company.ru)" 
                      className="bg-black/50 text-xs px-2.5 py-2 rounded-xl text-white border border-white/10 focus:outline-none"
                      value={newCompanySite}
                      onChange={(e) => setNewCompanySite(e.target.value)}
                    />
                    <input 
                      type="text" 
                      placeholder="Ссылка на файл логотипа (URL)" 
                      className="bg-black/50 text-xs px-2.5 py-2 rounded-xl text-white border border-white/10 focus:outline-none"
                      value={newCompanyLogo}
                      onChange={(e) => setNewCompanyLogo(e.target.value)}
                    />
                  </div>

                  {/* Drag-Drop / click base file uploader */}
                  <div 
                    onClick={() => {
                      const fileInput = document.getElementById("comp-file-upload") as HTMLInputElement;
                      if (fileInput) fileInput.click();
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        const file = e.dataTransfer.files[0];
                        setNewCompanyFiles(file.name);
                        addAuditEvent("info", "Файл загружен", `Прикреплен корпоративный регламент: ${file.name}`);
                      }
                    }}
                    className="cursor-pointer border-2 border-dashed border-white/15 bg-[#17344F]/40 hover:bg-[#17344F]/60 rounded-2xl p-4 text-center space-y-2 transition-all"
                  >
                    <input 
                      id="comp-file-upload" 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setNewCompanyFiles(e.target.files[0].name);
                          addAuditEvent("info", "Файл загружен", `Прикреплен файл: ${e.target.files[0].name}`);
                        }
                      }}
                    />
                    <div className="text-xs text-slate-300 font-bold">
                      {newCompanyFiles ? (
                        <span className="text-[#E7C768]">Прикреплен регламент: {newCompanyFiles} ✓</span>
                      ) : (
                        "Перетащите файлы/регламенты компании или кликните для выбора (PDF, DOCX)"
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block font-mono">Файл будет автоматически разобран ИИ-рекрутером для составления базы знаний</span>
                  </div>

                  <div className="flex justify-end gap-2 text-xs">
                    <button type="button" onClick={() => setShowAddCompany(false)} className="px-3 py-1 bg-white/5 rounded-lg">Отмена</button>
                    <button type="submit" className="px-4 py-1 bg-green-600 rounded-lg font-bold text-white">Сохранить</button>
                  </div>
                </form>
              )}

              {/* LIST VIEW */}
              <div className="space-y-4">
                {companiesList.length === 0 && (
                  <div className="bg-[#1D3E5E]/40 border border-white/5 p-8 rounded-3xl text-center text-slate-400 text-xs">
                    Компаний пока нет. Нажмите кнопку "Регистрация бренда" выше, чтобы добавить компанию и создать её ИИ-лендинг.
                  </div>
                )}
                {companiesList.map((comp, idx) => {
                  const compVacancies = projects.filter(p => p.companyName?.toLowerCase() === comp.name?.toLowerCase());

                  return (
                    <div key={idx} className="bg-[#1D3E5E]/60 border border-white/10 p-5 rounded-3xl space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3">
                          {comp.logoUrl ? (
                            <img src={comp.logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-lg bg-white/10 p-1 shrink-0" onError={(e) => { (e.target as any).style.display = "none"; }} />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-[#E7C768]/10 text-[#E7C768] font-bold flex items-center justify-center shrink-0 border border-[#E7C768]/20 font-mono text-sm">
                              {comp.name ? comp.name.substr(0, 2).toUpperCase() : "CO"}
                            </div>
                          )}
                          <div>
                            <span className="text-[10px] text-[#E7C768] font-bold tracking-wide uppercase font-mono">{comp.industry}</span>
                            <h3 className="text-base font-bold text-white mt-0.5">{comp.name}</h3>
                          </div>
                        </div>
                        <span className="bg-white/5 border border-white/5 text-[10px] text-slate-350 py-1 px-2.5 rounded-full font-mono">Штат: {comp.staff}</span>
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed font-normal">{comp.description}</p>
                      
                      {/* Expanded sites, files links */}
                      <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                        {comp.sites && (
                          <a 
                            href={comp.sites.startsWith("http") ? comp.sites : `https://${comp.sites}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-[#E7C768] hover:underline font-bold flex items-center gap-1"
                          >
                            🔗 Сайт: {comp.sites}
                          </a>
                        )}
                        {comp.files && (
                          <span className="text-slate-300 flex items-center gap-1 font-semibold">
                            📂 Регламент: <strong className="text-[#E7C768] font-mono">{comp.files}</strong> (Распознан ИИ)
                          </span>
                        )}
                      </div>

                      {/* AI Generated Careers Landing Link address */}
                      <div className="bg-black/20 border border-white/5 p-3 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                        <div className="space-y-0.5">
                          <span className="text-[9px] uppercase font-bold text-[#E7C768] block leading-none font-mono">ИИ-Лендинг Компании для Кандидатов</span>
                          <span className="text-[11.5px] text-slate-300 font-mono select-all">https://hr-rr.ru/{comp.slug}</span>
                        </div>
                        <button
                          onClick={() => navigate(`/${comp.slug}`)}
                          className="cursor-pointer bg-white/10 hover:bg-white/15 text-white font-bold text-[10.5px] py-1.5 px-3 rounded-lg transition text-center"
                        >
                          Открыть Лендинг 🔗
                        </button>
                      </div>
                      
                      <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2.5 text-[11px] text-slate-400">
                        <span>Задействованных вакансий в системе: <strong className="text-white">{compVacancies.length}</strong></span>
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

              {/* Onboarding Step 2 Next CTA */}
              <div className="bg-[#1E4468]/60 border border-[#E7C768]/30 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                <div className="text-left space-y-1">
                  <h4 className="text-[#E7C768] font-bold text-sm">Компания добавлена и бренд-лендинг готов?</h4>
                  <p className="text-xs text-slate-350">Переходите к финальному шагу онбординга — размещению вашей первой вакансии с ИИ-куратором.</p>
                </div>
                <button
                  onClick={() => navigate(`/employer${employerId}/vacancies`)}
                  className="cursor-pointer bg-gradient-to-r from-amber-500 to-orange-600 hover:scale-102 hover:shadow-lg text-white font-black text-xs py-3 px-6 rounded-2xl flex items-center gap-1.5 transition-all text-center shrink-0 w-full sm:w-auto justify-center animate-pulse"
                >
                  <span>Далее: Разместить вакансию</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}
          
          {/* PAGE 4: BILLS & ACCOUNTS - DYNAMIC BALANCE & SHIELD */}
          {activeTab === "tariff" && (
            <div className="space-y-6 text-left">
              
              {/* BALANCE SUMMARY PANEL CARD */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 font-medium">
                <div className="md:col-span-4 bg-[#1D3E5E]/95 border border-[#E7C768]/45 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-[#E7C768] tracking-widest uppercase font-mono block">Лицевой счет счета</span>
                    <h2 className="text-3xl font-extrabold text-white mt-1.5 font-mono select-none">{balance} <span className="text-lg font-bold text-[#E7C768]">RR</span></h2>
                    <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                      У вас бессрочный баланс. Оплата списывается исключительно за фактически приобретенные пакетные лимиты ИИ.
                    </p>
                  </div>
                  <div className="bg-black/25 rounded-2xl p-3 border border-white/5 space-y-1">
                    <span className="text-[9px] text-slate-400 font-bold block uppercase font-mono">Ваш ID аккаунта</span>
                    <span className="font-mono text-xs font-bold text-slate-300">{employerId}</span>
                  </div>
                </div>

                {/* LIMITS INSTRUCTION SHIELD */}
                <div className="md:col-span-8 bg-[#1D3E5E]/85 border border-white/15 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#E7C768] flex items-center gap-1.5 leading-snug">
                      <Award className="w-4 h-4 text-[#E7C768]" /> Текущие ИИ-Лимиты на балансе
                    </h3>
                    <p className="text-[11px] text-slate-350 mt-1">
                      Лимиты расходуются соискателями при прохождении ИИ-интервью, ИИ-обучения и создании новых адаптационных материалов.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 text-xs text-center py-2">
                    <div className="bg-black/20 p-2.5 rounded-2xl border border-white/5 hover:border-white/10 transition">
                      <span className="text-[10px] text-slate-400 block font-normal leading-tight">ИИ-Интервью</span>
                      <strong className="text-base text-white block mt-1 font-mono">
                        {limits.interviews} <span className="text-[10px] font-sans font-light text-slate-400 font-normal">шт</span>
                      </strong>
                    </div>
                    <div className="bg-black/20 p-2.5 rounded-2xl border border-white/5 hover:border-white/10 transition">
                      <span className="text-[10px] text-slate-400 block font-normal leading-tight">ИИ-Обучение</span>
                      <strong className="text-base text-white block mt-1 font-mono">
                        {limits.trainings} <span className="text-[10px] font-sans font-light text-slate-400 font-normal">шт</span>
                      </strong>
                    </div>
                    <div className="bg-black/20 p-2.5 rounded-2xl border border-white/5 hover:border-white/10 transition">
                      <span className="text-[10px] text-slate-400 block font-normal leading-tight">ИИ-Лендинги</span>
                      <strong className="text-base text-white block mt-1 font-mono">
                        {limits.landings} <span className="text-[10px] font-sans font-light text-slate-400 font-normal">шт</span>
                      </strong>
                    </div>
                    <div className="bg-black/20 p-2.5 rounded-2xl border border-white/5 hover:border-white/10 transition">
                      <span className="text-[10px] text-slate-400 block font-normal leading-tight">Систем интервью</span>
                      <strong className="text-base text-white block mt-1 font-mono">
                        {limits.interviewSystems} <span className="text-[10px] font-sans font-light text-slate-400 font-normal">шт</span>
                      </strong>
                    </div>
                    <div className="bg-black/20 p-2.5 rounded-2xl border border-white/5 hover:border-white/10 transition">
                      <span className="text-[10px] text-slate-400 block font-normal leading-tight">Систем обучения</span>
                      <strong className="text-base text-white block mt-1 font-mono">
                        {limits.trainingSystems} <span className="text-[10px] font-sans font-light text-slate-400 font-normal">шт</span>
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* PURCHASING MARKETPLACE TABLE AND CALCULATOR ROW */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. PURCHASE SERVICES DIRECTLY TABLE */}
                <div className="bg-[#1D3E5E]/85 border border-white/15 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#E7C768] flex items-center gap-1.5 uppercase tracking-wider font-mono text-[11px]">
                      🛍️ Купить лимиты ИИ услуг за RR
                    </h3>
                    <p className="text-xs text-slate-300">
                      Лимиты активируются мгновенно и не имеют срока давности.
                    </p>
                    
                    {purchaseError && (
                      <div className="bg-red-950/40 border border-red-500/35 text-red-300 rounded-xl p-2.5 text-[11px] mt-2 font-mono">
                        ⚠️ {purchaseError}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5 pt-2">
                    {/* Item 1: Interview */}
                    <div className="bg-black/15 p-3 rounded-2xl border border-white/5 flex items-center justify-between gap-3 text-xs font-normal">
                      <div className="max-w-[70%]">
                        <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                          <span className="text-amber-400">🎙️</span> ИИ Собеседование соискателя
                        </h4>
                        <p className="text-[10.5px] text-slate-300 mt-1 leading-relaxed">
                          <strong className="text-amber-400/90 font-semibold font-mono text-[9.5px]">Включает:</strong> ИИ Скрининг резюме + ИИ чек-лист по опыту и навыкам + ИИ ролевая игра с 3 ситуациями.
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-[#E7C768]">100 RR</span>
                        <button
                          onClick={(e) => handlePurchaseItem("interview")}
                          disabled={isBuying !== null}
                          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-[#17344F] font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-xl transition cursor-pointer"
                        >
                          {isBuying === "interview" ? "Куплю..." : "Купить"}
                        </button>
                      </div>
                    </div>

                    {/* Item 2: AI Training */}
                    <div className="bg-black/15 p-3 rounded-2xl border border-white/5 flex items-center justify-between gap-3 text-xs font-normal">
                      <div className="max-w-[70%]">
                        <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                          <span className="text-amber-400">🎓</span> Интерактивное ИИ Обучение соискателя
                        </h4>
                        <p className="text-[10.5px] text-slate-300 mt-1 leading-relaxed">
                          <strong className="text-amber-400/90 font-semibold font-mono text-[9.5px]">Включает:</strong> Профессиональное ИИ дообучение после интервью + ИИ обучение продукту + ИИ обучение системе работы и условиям.
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-[#E7C768]">100 RR</span>
                        <button
                          onClick={(e) => handlePurchaseItem("training")}
                          disabled={isBuying !== null}
                          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-[#17344F] font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-xl transition cursor-pointer"
                        >
                          {isBuying === "training" ? "Куплю..." : "Купить"}
                        </button>
                      </div>
                    </div>

                    {/* Item 3: Job AI Landing page */}
                    <div className="bg-black/15 p-3 rounded-2xl border border-white/5 flex items-center justify-between gap-3 text-xs font-normal">
                      <div className="max-w-[70%]">
                        <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                          <span className="text-amber-400">🌐</span> ИИ Лендинг созданной вакансии
                        </h4>
                        <p className="text-[10.5px] text-slate-300 mt-1 leading-relaxed">
                          <strong className="text-amber-400/90 font-semibold font-mono text-[9.5px]">Описание:</strong> Создание стильного внешнего мини-сайта для регистрации ваших кандидатов в системе с описанием вакансии, условий и информации о компании с ИИ консультантом по базе знаний.
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-[#E7C768]">500 RR</span>
                        <button
                          onClick={(e) => handlePurchaseItem("landing")}
                          disabled={isBuying !== null}
                          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-[#17344F] font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-xl transition cursor-pointer"
                        >
                          {isBuying === "landing" ? "Куплю..." : "Купить"}
                        </button>
                      </div>
                    </div>

                    {/* Item 4: AI Interview System creation */}
                    <div className="bg-black/15 p-3 rounded-2xl border border-white/5 flex items-center justify-between gap-3 text-xs font-normal">
                      <div className="max-w-[70%]">
                        <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                          <span className="text-amber-400">⚙️</span> ИИ Система Интервью
                        </h4>
                        <p className="text-[10.5px] text-slate-300 mt-1 leading-relaxed">
                          <strong className="text-amber-400/90 font-semibold font-mono text-[9.5px]">Описание:</strong> Генератор сценариев с тестами под вашу специальность и вакансию.
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-[#E7C768]">300 RR</span>
                        <button
                          onClick={(e) => handlePurchaseItem("system_interview")}
                          disabled={isBuying !== null}
                          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-[#17344F] font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-xl transition cursor-pointer"
                        >
                          {isBuying === "system_interview" ? "Куплю..." : "Купить"}
                        </button>
                      </div>
                    </div>

                    {/* Item 5: AI Training System creation */}
                    <div className="bg-black/15 p-3 rounded-2xl border border-white/5 flex items-center justify-between gap-3 text-xs font-normal">
                      <div className="max-w-[70%]">
                        <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                          <span className="text-amber-400">👁️‍🗨️</span> ИИ Система Обучения
                        </h4>
                        <p className="text-[10.5px] text-slate-300 mt-1 leading-relaxed">
                          <strong className="text-amber-400/90 font-semibold font-mono text-[9.5px]">Описание:</strong> ИИ создает Продвинутую индивидуальную тренажерную симуляцию для персонала, для аттестаций новых сотрудников, переаттестаций текущих и для быстрого онбординга.
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-[#E7C768]">200 RR</span>
                        <button
                          onClick={(e) => handlePurchaseItem("system_training")}
                          disabled={isBuying !== null}
                          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-[#17344F] font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-xl transition cursor-pointer"
                        >
                          {isBuying === "system_training" ? "Куплю..." : "Купить"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. TOP UP BILLING CALCULATOR CARD */}
                <div className="bg-[#1D3E5E]/85 border border-[#E7C768]/30 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
                  <form onSubmit={handleTopupBalance} className="space-y-4 flex flex-col justify-between h-full">
                    <div>
                      <h3 className="font-bold text-sm text-[#E7C768] flex items-center gap-1.5 uppercase tracking-wider font-mono text-[11px]">
                        💵 Калькулятор пополнения баланса
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        Выгодный курс: **1 рубль = 1 RR**. Начальный минимальный платеж 100 рублей.
                      </p>
                    </div>

                    <div className="space-y-3.5 my-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                          Вы вносите к оплате (в рублях):
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="100"
                            value={topupAmountRub}
                            onChange={(e) => setTopupAmountRub(Math.max(0, parseInt(e.target.value) || 0))}
                            className="bg-black/35 w-full rounded-2xl border border-white/10 px-4 py-3 font-mono font-extrabold text-white text-sm focus:outline-none focus:border-[#E7C768]"
                          />
                          <span className="absolute right-4 top-3 text-xs font-bold text-[#E7C768] font-mono">₽ (RUB)</span>
                        </div>
                        {topupAmountRub < 100 && (
                          <span className="text-[10px] text-amber-400 block mt-1 font-mono">⚠️ Минимум 100 рублей</span>
                        )}
                      </div>

                      {/* Quick pick templates */}
                      <div className="flex gap-2 text-[10px] font-mono font-bold leading-none">
                        <button
                          type="button"
                          onClick={() => setTopupAmountRub(100)}
                          className={`px-3 py-2 rounded-xl transition-all border ${topupAmountRub === 100 ? "bg-[#1E4468] text-[#E7C768] border-[#E7C768]/60 font-bold" : "bg-black/20 text-slate-400 border-white/5 hover:border-white/15 font-normal"}`}
                        >
                          100 ₽
                        </button>
                        <button
                          type="button"
                          onClick={() => setTopupAmountRub(500)}
                          className={`px-3 py-2 rounded-xl transition-all border ${topupAmountRub === 500 ? "bg-[#1E4468] text-[#E7C768] border-[#E7C768]/60 font-bold" : "bg-black/20 text-slate-400 border-white/5 hover:border-white/15 font-normal"}`}
                        >
                          500 ₽
                        </button>
                        <button
                          type="button"
                          onClick={() => setTopupAmountRub(1000)}
                          className={`px-3 py-2 rounded-xl transition-all border ${topupAmountRub === 1000 ? "bg-[#1E4468] text-[#E7C768] border-[#E7C768]/60 font-bold" : "bg-black/20 text-slate-400 border-white/5 hover:border-white/15 font-normal"}`}
                        >
                          1 000 ₽
                        </button>
                      </div>

                      {/* Equivalent calculation block */}
                      <div className="bg-emerald-950/20 p-3.5 rounded-2xl border border-emerald-500/20 text-xs flex justify-between items-center bg-black/20">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-normal">Будет начислено на счет баланса:</span>
                          <span className="text-sm font-extrabold text-[#E7C768] block mt-1 font-mono">
                            {topupAmountRub} RR
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 bg-white/5 hover:bg-white/10 transition px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
                          Курс 1:1
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isToppingUp || topupAmountRub < 100}
                      className="cursor-pointer bg-gradient-to-r from-emerald-500 to-teal-650 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-40 text-[#17344F] font-bold text-xs uppercase tracking-wider py-3.5 rounded-2xl w-full transition flex items-center justify-center gap-1.5"
                    >
                      {isToppingUp ? "Обработка шлюза..." : "🚀 Пополнить Баланс"}
                    </button>
                  </form>
                </div>
              </div>

              {/* REFERRAL PROGRAM CARD */}
              <div className="bg-[#1D3E5E]/60 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl select-none">🎁</span>
                  <div>
                    <h3 className="font-bold text-sm text-[#E7C768]">Зарабатывайте 1000 RR за рекомендацию друга!</h3>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-normal mt-0.5">
                      Пригласите другого руководителя или HR-менеджера. Когда они заригистрируются по вашей ссылке через Google или Telegram,
                      вам мгновенно зачислится бонус **1000 RR**, а приглашенный друг получит приветственные **1000 RR** на баланс!
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-black/15 p-3 rounded-2xl border border-white/5 space-y-1.5 text-xs text-left">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">Официальная реферальная ссылка:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`https://hr-rr.ru?ref=${employerId}`}
                        className="bg-black/30 w-full select-all font-mono font-normal text-slate-300 text-[11px] border border-white/5 p-1.5 rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://hr-rr.ru?ref=${employerId}`);
                          addAuditEvent("success", "Ссылка скопирована", "Официальная ссылка скопирована в буфер обмена.");
                          alert("Официальная ссылка скопирована!");
                        }}
                        className="bg-white/10 hover:bg-white/20 text-[#E7C768] px-2 py-1 border border-white/5 text-[10px] uppercase font-bold rounded cursor-pointer"
                      >
                        Копировать
                      </button>
                    </div>
                  </div>

                  <div className="bg-black/15 p-3 rounded-2xl border border-white/5 space-y-1.5 text-xs text-left">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono">Тестирование в Песочнице (Для проверки):</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/auth?ref=${employerId}`}
                        className="bg-black/30 w-full select-all font-mono font-normal text-emerald-400 text-[11px] border border-white/5 p-1.5 rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/auth?ref=${employerId}`);
                          addAuditEvent("success", "Ссылка скопирована", "Песочная тестовая ссылка скопирована.");
                          alert("Ссылка для тестирования скопирована!");
                        }}
                        className="bg-emerald-950 hover:bg-emerald-900 text-emerald-400 px-2 py-1 border border-emerald-500/20 text-[10px] uppercase font-bold rounded cursor-pointer"
                      >
                        Копировать
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* PAYMENT TRANSACTIONS RECEIPT REGISTRY FOR EMPOWERED TRACKING */}
              <div className="bg-[#1D3E5E]/45 border border-white/10 rounded-3xl overflow-hidden shadow">
                <div className="p-4 bg-gradient-to-r from-[#17344F] to-[#265582] text-xs font-bold font-mono tracking-wider text-slate-300">
                  История Платежей, Списаний & Бонусов счета
                </div>
                {paymentHistory.length === 0 ? (
                  <p className="p-4 text-xs text-slate-400 font-normal">Пока не зафиксировано ни одной операции по данному работодателю.</p>
                ) : (
                  <div className="overflow-x-auto text-xs font-mono">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-black/25 text-[#E7C768] border-b border-white/5 font-bold">
                          <th className="p-3">ID Операции</th>
                          <th className="p-3">Дата операции</th>
                          <th className="p-3">Название операции / наименование услуги</th>
                          <th className="p-3 text-right">Начислено / Списано</th>
                          <th className="p-3 text-right">Метод</th>
                          <th className="p-3 text-right">Статус</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-200 font-normal">
                        {paymentHistory.map((pt, i) => (
                          <tr key={i} className="hover:bg-white/5">
                            <td className="p-3 font-semibold text-slate-400">{pt.id}</td>
                            <td className="p-3">{pt.date}</td>
                            <td className="p-3 font-sans font-medium text-white">{pt.plan}</td>
                            <td className="p-3 text-right font-bold font-mono">
                              <span className={pt.amount.startsWith("-") ? "text-red-450" : "text-emerald-400"}>
                                {pt.amount}
                              </span>
                            </td>
                            <td className="p-3 text-right font-sans text-slate-300">{pt.method}</td>
                            <td className="p-3 text-right font-sans">
                              <span className="bg-emerald-950/80 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold text-[10px]">{pt.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PAGE 5: PROFILE & TELEGRAM PORTAL */}
          {activeTab === "profile" && (
            <div className="space-y-6 text-left">
              
              {/* Dynamic Header */}
              <div className="bg-[#1D3E5E]/80 border border-[#E7C768]/35 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-amber-400" />
                    Мульти-профиль HR Администратора
                  </h2>
                  <p className="text-xs text-slate-300">Авторизованные аккаунты Google и Telegram для интеграций ИИ-рекрутинга.</p>
                </div>
                <div className="bg-emerald-950/40 text-emerald-400 text-xs font-bold border border-emerald-500/30 px-3 py-1 rounded-full font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Сессия ID: {employerId}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* GOOGLE PROFILE ACCOUNT BLOCK */}
                <div className="bg-[#1D3E5E]/85 border border-white/15 rounded-3xl p-6 shadow-xl space-y-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="font-bold text-sm text-[#E7C768] uppercase font-mono tracking-wider flex items-center gap-2">
                      <Chrome className="w-4 h-4 text-sky-400" /> 1. Профиль Google
                    </h3>
                    <span className="bg-sky-500/10 text-sky-400 border border-sky-500/25 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      Google OAuth2 Verified
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
                    <div className="relative shrink-0">
                      <img 
                        src={googlePhoto} 
                        alt="Google avatar" 
                        className="w-16 h-16 rounded-full object-cover border-2 border-sky-400 shadow-md referrerPolicy='no-referrer'"
                        onError={(e) => {
                          (e.target as any).src = "https://lh3.googleusercontent.com/a/default-user=s96-c";
                        }}
                      />
                      <span className="absolute bottom-0 right-0 bg-emerald-500 w-4 h-4 rounded-full border-2 border-[#1E4468] flex items-center justify-center text-[8px] text-white font-bold" title="Синхронизировано">✓</span>
                    </div>

                    <div className="text-center sm:text-left min-w-0 flex-1 space-y-1">
                      <h4 className="text-sm font-extrabold text-white truncate">{googleName}</h4>
                      <p className="text-xs text-slate-350 font-mono truncate">{googleEmail}</p>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 font-mono text-[10px]">
                        <span className="bg-emerald-950/50 text-emerald-400 px-1.5 py-0.5 rounded font-bold border border-emerald-500/20">
                          ID: {googleId}
                        </span>
                        {googleVerified && (
                          <span className="bg-sky-950/40 text-sky-400 px-1.5 py-0.5 rounded border border-sky-500/20">
                            Gmail Verified ✓
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Form for Google info editing */}
                  <div className="space-y-3.5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-300 block mb-1 font-bold">Имя в аккаунте:</label>
                        <input 
                          type="text" 
                          className="w-full bg-[#17344F]/70 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400" 
                          value={googleName}
                          onChange={(e) => {
                            setGoogleName(e.target.value);
                            setProfileName(e.target.value);
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 block mb-1 font-bold">Email аккаунта:</label>
                        <input 
                          type="email" 
                          className="w-full bg-[#17344F]/70 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400" 
                          value={googleEmail}
                          onChange={(e) => {
                            setGoogleEmail(e.target.value);
                            setProfileEmail(e.target.value);
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-300 block mb-1 font-bold">Google ID:</label>
                        <input 
                          type="text" 
                          className="w-full bg-[#17344F]/70 border border-white/10 rounded-xl px-3 py-2 text-white font-mono" 
                          value={googleId}
                          onChange={(e) => setGoogleId(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 block mb-1 font-bold">Ссылка на фото Google:</label>
                        <input 
                          type="text" 
                          className="w-full bg-[#17344F]/70 border border-white/10 rounded-xl px-3 py-2 text-white text-[11px]" 
                          placeholder="Медиа URL"
                          value={googlePhoto}
                          onChange={(e) => setGooglePhoto(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">Последняя синхронизация Google: Сегодня</span>
                      <button 
                        type="button" 
                        onClick={() => handleUpdateProfile({
                          googleName,
                          googleEmail,
                          googlePhoto,
                          googleId,
                          googleVerified
                        })}
                        className="cursor-pointer bg-sky-600 hover:bg-sky-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition duration-150 shadow-md"
                      >
                        {isProfileSaved ? "Сохранено! ✓" : "Сохранить Google"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* TELEGRAM PROFILE BLOCK */}
                <div className="bg-[#1D3E5E]/85 border border-white/15 rounded-3xl p-6 shadow-xl space-y-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="font-bold text-sm text-[#E7C768] uppercase font-mono tracking-wider flex items-center gap-2">
                      <Send className="w-4 h-4 text-sky-400" /> 2. Профиль Telegram
                    </h3>
                    <span className="bg-[#E7C768]/15 text-[#E7C768] border border-[#E7C768]/30 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      TG Bot Active
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
                    <div className="relative shrink-0">
                      <img 
                        src={telegramPhoto} 
                        alt="Telegram avatar" 
                        className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shadow-md"
                        onError={(e) => {
                          (e.target as any).src = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2.2&w=256&h=256&q=80";
                        }}
                      />
                      <span className="absolute bottom-0 right-0 bg-amber-500 w-4 h-4 rounded-full border-2 border-[#1E4468] flex items-center justify-center text-[8px] text-white font-bold" title="Telegram Бот на связи">✓</span>
                    </div>

                    <div className="text-center sm:text-left min-w-0 flex-1 space-y-1">
                      <h4 className="text-sm font-extrabold text-white truncate">
                        {telegramFirstName} {telegramLastName}
                      </h4>
                      
                      {/* Clickable Username Link */}
                      <div className="text-xs font-semibold">
                        <span className="text-slate-400 mr-1.5 font-normal">Никнейм:</span>
                        <a 
                          href={telegramUsernameState ? `https://t.me/${telegramUsernameState.replace("@", "")}` : "https://t.me/HR_RRbot"} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-sky-305 hover:underline font-mono text-sm inline-flex items-center gap-1 font-black bg-sky-950/40 hover:bg-sky-950/60 transition px-2 py-0.5 rounded"
                        >
                          @{telegramUsernameState ? telegramUsernameState.replace("@", "") : "cowal_sales"} 🔗
                        </a>
                      </div>

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 font-mono text-[10px]">
                        <span className="bg-amber-950/60 text-[#E7C768] px-1.5 py-0.5 rounded font-bold border border-amber-500/25">
                          ID: {telegramIdState || adminTgId}
                        </span>
                        <span className="bg-emerald-950/40 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          Уведомления ВКЛ ✅
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Form for Telegram info editing */}
                  <div className="space-y-3.5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-300 block mb-1 font-bold">Имя (First Name):</label>
                        <input 
                          type="text" 
                          className="w-full bg-[#17344F]/70 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400" 
                          value={telegramFirstName}
                          onChange={(e) => setTelegramFirstName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 block mb-1 font-bold">Фамилия (Last Name):</label>
                        <input 
                          type="text" 
                          className="w-full bg-[#17344F]/70 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400" 
                          value={telegramLastName}
                          onChange={(e) => setTelegramLastName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-300 block mb-1 font-bold">Никнейм @username:</label>
                        <input 
                          type="text" 
                          className="w-full bg-[#17344F]/70 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400" 
                          placeholder="например: active_hr"
                          value={telegramUsernameState}
                          onChange={(e) => setTelegramUsernameState(e.target.value.replace("@", ""))}
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 block mb-1 font-bold">Telegram ID (Цифры):</label>
                        <div className="flex gap-1.5">
                          <input 
                            type="text" 
                            className="w-full bg-[#17344F]/70 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-center focus:outline-none focus:border-amber-400" 
                            placeholder="например: 59384591"
                            value={telegramIdState}
                            onChange={(e) => {
                              setTelegramIdState(e.target.value);
                              setAdminTgId(e.target.value);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              saveTgId();
                              handleUpdateProfile({
                                telegramId: telegramIdState,
                                telegramPhoto,
                                telegramFirstName,
                                telegramLastName,
                                telegramUsername: telegramUsernameState
                              });
                            }}
                            className="bg-amber-600 hover:bg-amber-500 font-bold px-3 py-2 text-white rounded-xl text-[10px]"
                          >
                            Привязать
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2.5">
                      <div className="bg-black/25 text-[9.5px] px-2.5 py-1.5 rounded-lg border border-white/5 text-slate-400 font-mono flex-1 leading-normal">
                        🤖 Для синхронизации ID напишите команду <strong className="text-[#E7C768]">/start</strong> боту <a href="https://t.me/HR_RRbot" target="_blank" rel="noreferrer" className="text-sky-305 underline">@HR_RRbot</a>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleUpdateProfile({
                          telegramId: telegramIdState,
                          telegramPhoto,
                          telegramFirstName,
                          telegramLastName,
                          telegramUsername: telegramUsernameState
                        })}
                        className="cursor-pointer bg-amber-500 hover:bg-amber-600 text-slate-900 font-black px-4 py-2 rounded-xl text-xs transition duration-150 shadow-md shrink-0"
                      >
                        {isProfileSaved ? "Сохранено! ✓" : "Сохранить TG"}
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* REFERRAL SYSTEM SECTION INTEGRATION INSIDE PROFILE TAB */}
              <div className="bg-[#1D3E5E]/85 border border-[#E7C768]/40 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl select-none">🎁</span>
                    <div>
                      <h3 className="font-extrabold text-white text-sm">Ваша персональная реферальная программа</h3>
                      <p className="text-[11px] text-slate-300 leading-normal font-normal">
                        Зарабатывайте рекрутинговые мили **1,000 RR** бонуса за каждого приглашенного HR-директора или работодателя!
                      </p>
                    </div>
                  </div>
                  <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-[10.5px] font-mono font-bold px-3 py-1 rounded-full uppercase">
                    Награда 1000 RR
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-normal font-normal">
                  Когда ваши коллеги регистрируют Личный Кабинет через подключение Google или Telegram по любой из реферальных ссылок ниже, вашему кабинету начисляется **1000 RR** для покупки авто-собеседований и ИИ-онбордингов, а ваш друг получает приветственный стартовый бонус **1000 RR**!
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-black/25 p-4 rounded-2xl border border-white/5 space-y-2 text-xs text-left">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono tracking-wider">🔗 Официальная реферальная ссылка:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`https://hr-rr.ru?ref=${employerId}`}
                        className="bg-black/40 w-full select-all font-mono font-normal text-[#E7C768] text-[11px] border border-white/10 p-2 rounded-xl focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://hr-rr.ru?ref=${employerId}`);
                          addAuditEvent("success", "Реф-ссылка скопирована", "Основная реферальная ссылка скопирована в буфер обмена.");
                          alert("Официальная реферальная ссылка скопирована!");
                        }}
                        className="bg-white/10 hover:bg-white/15 text-[#E7C768] px-3.5 py-2.5 border border-white/5 text-[10.5px] uppercase font-bold rounded-xl cursor-pointer shrink-0"
                      >
                        Копировать
                      </button>
                    </div>
                  </div>

                  <div className="bg-black/25 p-4 rounded-2xl border border-white/5 space-y-2 text-xs text-left">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono tracking-wider">🚀 Песочница тестирования ссылок (Проверка):</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/auth?ref=${employerId}`}
                        className="bg-black/40 w-full select-all font-mono font-normal text-emerald-400 text-[11px] border border-white/10 p-2 rounded-xl focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/auth?ref=${employerId}`);
                          addAuditEvent("success", "Sandbox реф-ссылка скопирована", "Тестовая ссылка для проверки в песочнице скопирована.");
                          alert("Ссылка для тестирования скопирована!");
                        }}
                        className="bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-400 px-3.5 py-2.5 border border-emerald-500/20 text-[10.5px] uppercase font-bold rounded-xl cursor-pointer shrink-0"
                      >
                        Копировать
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Onboarding Next Step CTA */}
              <div className="bg-[#1E4468]/60 border border-[#E7C768]/30 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left space-y-1">
                  <h4 className="text-[#E7C768] font-bold text-sm">Профиль заполнен и проверен?</h4>
                  <p className="text-xs text-slate-350">Переходите к следующему шагу — созданию вашей первой компании и ИИ-лендинга.</p>
                </div>
                <button
                  onClick={() => navigate(`/employer${employerId}/companies`)}
                  className="cursor-pointer bg-gradient-to-r from-amber-500 to-orange-600 hover:scale-102 hover:shadow-lg text-white font-black text-xs py-3.5 px-6 rounded-2xl flex items-center gap-1.5 transition-all text-center shrink-0 w-full sm:w-auto justify-center"
                >
                  <span>Далее: Настройка компании</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
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
            <button onClick={() => navigate("/employer/crm")} className="hover:text-white transition">Панель Руководителя</button>
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

      {/* MODAL WINDOW: EDIT VACANCY DETAILS AND SUBPAGES TEXTS */}
      {editingProject && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1D3E5E] border-2 border-[#E7C768]/60 p-6 sm:p-8 rounded-3xl w-full max-w-6xl text-left text-white shadow-2xl relative max-h-[95vh] overflow-y-auto space-y-5 animate-fadeIn">
            <button 
              onClick={() => setEditingProject(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold cursor-pointer bg-white/5 border border-white/5 w-8 h-8 rounded-full flex items-center justify-center transition"
            >
              ✕
            </button>

            <div className="border-b border-white/10 pb-3">
              <span className="text-[10px] font-bold text-[#E7C768] uppercase font-mono tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#E7C768] animate-pulse" />
                Редактирование &bull; ID вакансии: {editingProject.id}
              </span>
              <h2 className="text-xl font-bold text-white mt-1">
                {editingProject.roleName}
              </h2>
            </div>

            <form onSubmit={handleSaveEditedProject} className="space-y-5">
              
              {/* Top part: General Vacancy Parameters */}
              <div className="bg-black/25 p-4 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#E7C768] border-b border-white/5 pb-2">
                  📋 Основная информация (постоянная часть)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-200 block mb-1">Название должности:</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-[#112335] text-xs p-2.5 rounded-xl border border-white/10 text-white focus:outline-[#E7C768]"
                      value={editingProject.roleName}
                      onChange={(e) => setEditingProject({ ...editingProject, roleName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-200 block mb-1">Оплата (кратко на баннер):</label>
                    <input
                      type="text"
                      className="w-full bg-[#112335] text-xs p-2.5 rounded-xl border border-white/10 text-white focus:outline-[#E7C768]"
                      value={editingProject.salaryTerms || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, salaryTerms: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-200 block mb-1">График (кратко на баннер):</label>
                    <input
                      type="text"
                      className="w-full bg-[#112335] text-xs p-2.5 rounded-xl border border-white/10 text-white focus:outline-[#E7C768]"
                      value={editingProject.scheduleTerms || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, scheduleTerms: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-200 block mb-1">Условия мотивации (кратко):</label>
                    <input
                      type="text"
                      className="w-full bg-[#112335] text-xs p-2.5 rounded-xl border border-white/10 text-white focus:outline-[#E7C768]"
                      value={editingProject.motivationText || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, motivationText: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-200 block mb-1">База знаний Wiki (регламент):</label>
                    <input
                      type="text"
                      className="w-full bg-[#112335] text-xs p-2.5 rounded-xl border border-white/10 text-white focus:outline-[#E7C768]"
                      value={editingProject.customWiki || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, customWiki: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-200 block mb-1">Логотип вакансии (ссылка или файл):</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 bg-[#112335] text-xs p-2.5 rounded-xl border border-white/10 text-white focus:outline-[#E7C768]"
                        value={editingProject.logoUrl || ""}
                        onChange={(e) => setEditingProject({ ...editingProject, logoUrl: e.target.value })}
                        placeholder="https://i.ibb.co/WWRbtPq0/RR-Logo.png"
                      />
                      <label className="cursor-pointer bg-white/5 border border-white/10 hover:border-[#E7C768] text-xs px-2.5 py-2.5 rounded-xl text-white font-bold select-none text-center flex items-center shrink-0">
                        <span>📂 Файл</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                if (typeof reader.result === "string") {
                                  setEditingProject({ ...editingProject, logoUrl: reader.result });
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Section: Switcher of the 8 Interactive Subpages */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#E7C768]">
                    🛠️ Тексты и живой предпросмотр подстраниц
                  </span>
                  <span className="text-[10px] text-slate-400">Выберите раздел для редактирования</span>
                </div>

                 {/* Subpage Selectors Button Bar */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { key: "company", label: "🏢 Компания" },
                    { key: "vacancy", label: "💼 Вакансия" },
                    { key: "schedule", label: "📅 График" },
                    { key: "motivation", label: "🔥 Мотивация" },
                    { key: "payouts", label: "💵 Выплаты" },
                    { key: "onboarding", label: "🚀 Оформление" },
                    { key: "team", label: "👥 Команда" },
                    { key: "system", label: "⚙️ ИИ-Система" }
                  ].map((btn) => {
                    const isActive = editorSubTab === btn.key;
                    return (
                      <button
                        key={btn.key}
                        type="button"
                        onClick={() => setEditorSubTab(btn.key)}
                        className={`transition px-3 py-2 text-xs font-bold rounded-xl border cursor-pointer select-none ${
                          isActive
                            ? "bg-[#E7C768] text-[#112335] border-[#E7C768] shadow-md"
                            : "bg-[#112335]/70 text-slate-300 border-white/5 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {btn.label}
                      </button>
                    );
                  })}
                </div>

                {/* Split Workspace Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1.5">
                  
                  {/* Left Column: Focused text Area */}
                  <div className="lg:col-span-5 bg-black/15 p-4 rounded-2xl border border-white/5 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-white/5 p-2 rounded-xl border border-white/5">
                        <span className="text-[10px] font-mono text-emerald-400 uppercase font-black">Свойства поля</span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {editorSubTab}</span>
                      </div>

                      {editorSubTab === "vacancy" && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-200 block">Раздел: Обязанности & Требования</label>
                          <p className="text-[10px] text-slate-400 leading-tight">Каждый пункт пишите с новой строки (или используйте дефис/точку):</p>
                          <textarea
                            rows={8}
                            className="w-full bg-[#112335] text-xs p-3 rounded-xl border border-white/10 text-white font-mono focus:outline-[#E7C768]"
                            value={editingProject.vacancyText || ""}
                            onChange={(e) => setEditingProject({ ...editingProject, vacancyText: e.target.value })}
                          />
                        </div>
                      )}

                      {editorSubTab === "motivation" && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-200 block">Раздел: Мотивация и привилегии</label>
                          <p className="text-[10px] text-slate-400 leading-tight">Каждый бонус или карьерную опцию пишите с новой строки:</p>
                          <textarea
                            rows={8}
                            className="w-full bg-[#112335] text-xs p-3 rounded-xl border border-white/10 text-white font-mono focus:outline-[#E7C768]"
                            value={editingProject.motivationTextDetail || ""}
                            onChange={(e) => setEditingProject({ ...editingProject, motivationTextDetail: e.target.value })}
                          />
                        </div>
                      )}

                      {editorSubTab === "company" && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-200 block">Раздел: О компании и масштабе</label>
                          <p className="text-[10px] text-slate-400 leading-tight">Основные факты, масштаб и достижения компании по строкам:</p>
                          <textarea
                            rows={8}
                            className="w-full bg-[#112335] text-xs p-3 rounded-xl border border-white/10 text-white font-mono focus:outline-[#E7C768]"
                            value={editingProject.companyText || ""}
                            onChange={(e) => setEditingProject({ ...editingProject, companyText: e.target.value })}
                          />
                        </div>
                      )}

                      {editorSubTab === "onboarding" && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-200 block">Раздел: Процесс Оформления</label>
                          <p className="text-[10px] text-slate-400 leading-tight">Опишите по порядку этапы стажировки (4 этапа по очереди с новых строк):</p>
                          <textarea
                            rows={8}
                            className="w-full bg-[#112335] text-xs p-3 rounded-xl border border-white/10 text-white font-mono focus:outline-[#E7C768]"
                            value={editingProject.onboardingText || ""}
                            onChange={(e) => setEditingProject({ ...editingProject, onboardingText: e.target.value })}
                          />
                        </div>
                      )}

                      {editorSubTab === "payouts" && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-200 block">Раздел: Финансовые Выплаты</label>
                          <p className="text-[10px] text-slate-400 leading-tight">Опишите фикс, сроки аванса и регулярность выплат по строкам:</p>
                          <textarea
                            rows={8}
                            className="w-full bg-[#112335] text-xs p-3 rounded-xl border border-white/10 text-white font-mono focus:outline-[#E7C768]"
                            value={editingProject.payoutsText || ""}
                            onChange={(e) => setEditingProject({ ...editingProject, payoutsText: e.target.value })}
                          />
                        </div>
                      )}

                      {editorSubTab === "schedule" && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-200 block">Раздел: График Работы</label>
                          <p className="text-[10px] text-slate-400 leading-tight">Разъясните гибкость смен, тайм-слоты и минимальные часы с новых строк:</p>
                          <textarea
                            rows={8}
                            className="w-full bg-[#112335] text-xs p-3 rounded-xl border border-white/10 text-white font-mono focus:outline-[#E7C768]"
                            value={editingProject.scheduleText || ""}
                            onChange={(e) => setEditingProject({ ...editingProject, scheduleText: e.target.value })}
                          />
                        </div>
                      )}

                      {editorSubTab === "team" && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-200 block">Раздел: Наша Команда</label>
                          <p className="text-[10px] text-slate-400 leading-tight">Каждого куратора пишите в формате: Имя - Должность. Текст девиза.</p>
                          <textarea
                            rows={8}
                            className="w-full bg-[#112335] text-xs p-3 rounded-xl border border-white/10 text-white font-mono focus:outline-[#E7C768]"
                            value={editingProject.teamText || ""}
                            onChange={(e) => setEditingProject({ ...editingProject, teamText: e.target.value })}
                          />
                        </div>
                      )}

                      {editorSubTab === "system" && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-200 block">Раздел: ИИ-Система РобоРекрут</label>
                          <p className="text-[10px] text-slate-400 leading-tight">Опишите критерии оценки диалога, время на тест и сдачу по строкам:</p>
                          <textarea
                            rows={8}
                            className="w-full bg-[#112335] text-xs p-3 rounded-xl border border-white/10 text-white font-mono focus:outline-[#E7C768]"
                            value={editingProject.systemText || ""}
                            onChange={(e) => setEditingProject({ ...editingProject, systemText: e.target.value })}
                          />
                        </div>
                      )}
                    </div>

                    <div className="bg-emerald-500/10 border border-emerald-500/25 p-2.5 rounded-xl text-[10px] text-emerald-400 leading-tight">
                      ℹ️ Изменения на правой панели обновляются мгновенно в реальном времени. Нажмите кнопку сохранить внизу для записи.
                    </div>
                  </div>

                  {/* Right Column: Beautiful Live Render */}
                  <div className="lg:col-span-7 bg-[#112335] border border-white/10 rounded-2xl p-4.5 min-h-[340px] flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-2.5 right-3 flex items-center gap-1 bg-[#E7C768]/15 border border-[#E7C768]/20 text-[#E7C768] text-[9px] font-mono font-bold px-2 py-0.5 rounded-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E7C768] animate-pulse" />
                      ПРЕДПРОСМОТР БЛОКА ЛЕНДИНГА
                    </div>

                    <div className="pt-6 space-y-3">
                      <span className="text-[9px] text-slate-400 font-mono tracking-wider block uppercase">Активирован вид: /{editorSubTab}</span>
                      
                      <div className="bg-black/25 p-4 rounded-xl border border-white/5 shadow-inner">
                        {(() => {
                          switch (editorSubTab) {
                            case "motivation":
                              return <MotivationView project={editingProject} />;
                            case "company":
                              return <CompanyView project={editingProject} />;
                            case "onboarding":
                              return <OnboardingView project={editingProject} />;
                            case "payouts":
                              return <PayoutsView project={editingProject} />;
                            case "schedule":
                              return <ScheduleView project={editingProject} />;
                            case "team":
                              return <TeamView project={editingProject} />;
                            case "system":
                              return <SystemView project={editingProject} />;
                            case "vacancy":
                            default:
                              return <VacancyView project={editingProject} />;
                          }
                        })()}
                      </div>
                    </div>

                    <div className="text-[9px] text-slate-500 text-right font-mono mt-2 select-none border-t border-white/5 pt-1.5">
                      Viewport: 100% Responsive Adaptive Layout Template
                    </div>
                  </div>

                </div>
              </div>

              {/* Botton control buttons */}
              <div className="pt-4 border-t border-white/10 flex gap-3">
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="cursor-pointer flex-1 bg-gradient-to-r from-emerald-600 to-teal-700 font-extrabold py-3 px-5 rounded-xl hover:shadow-xl hover:brightness-110 transition disabled:opacity-55 text-sm"
                >
                  {isSavingEdit ? "Сохранение изменений в БД..." : "💾 Сохранить изменения вакансии"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-3 rounded-xl text-slate-300 font-bold transition text-sm"
                >
                  Отмена
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
