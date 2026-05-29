/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { useRouter } from "../components/RouterContext";
import Mascot from "../components/Mascot";
import { BASIC_SPECIALTIES } from "../types";
import { 
  Users, 
  Award, 
  Cpu, 
  MessageSquare, 
  BookOpen, 
  TrendingUp, 
  Briefcase, 
  Search, 
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  Heart,
  Menu,
  X
} from "lucide-react";

export default function LandingPage() {
  const { navigate, path } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // States for Interactive Tariff Calculator
  const [interviewsCount, setInterviewsCount] = useState(5);
  const [trainingsCount, setTrainingsCount] = useState(5);
  const [specialtiesCount, setSpecialtiesCount] = useState(1);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);

  return (
    <div className="bg-gradient-to-b from-[#17344F] to-[#265582] min-h-screen text-white font-sans antialiased selection:bg-[#E7C768] selection:text-[#1A1A1A] flex flex-col justify-between">
      
      {/* Top Header Navigation with Direct Access Bypasses */}
      <header className="sticky top-0 z-50 bg-[#17344F]/95 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-4">
        <div className="flex items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <img 
              src="https://i.ibb.co/WWRbtPq0/RR-Logo.png" 
              alt="RR Робот Рекрутер Logo" 
              className="w-10 h-10 object-contain drop-shadow" 
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col text-left">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-[#F4EE8E] to-[#E7C768] bg-clip-text text-transparent">
                Робот Рекрутер
              </span>
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-300">Автоматизация найма</span>
            </div>
          </div>

          {/* Global Multi-Page Navigation accessible without login */}
          <nav className="hidden md:flex items-center justify-center gap-2 md:gap-4 text-xs md:text-sm font-semibold">
            <button 
              id="nav_landing"
              onClick={() => navigate("/main")} 
              className="transition px-3 py-2 rounded-xl text-[#E7C768] bg-white/10 border border-[#E7C768]/20"
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
              onClick={() => {
                localStorage.setItem("employer_active_tab_intent", "crm");
                navigate("/employer");
              }} 
              className="transition px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-1 bg-white/5 border border-white/10"
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

          <div className="hidden md:block">
            <button 
              id="btn_login"
              onClick={() => navigate("/auth")}
              className="cursor-pointer bg-gradient-to-r from-[#FF1A1A] to-[#E54C00] text-white text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl hover:shadow-lg transition-transform active:scale-95 duration-100"
            >
              Личный кабинет RR
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
              className="transition text-left w-full px-4 py-3 rounded-xl text-[#E7C768] bg-white/10 border border-[#E7C768]/20"
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
                localStorage.setItem("employer_active_tab_intent", "crm");
                navigate("/employer");
                setMobileMenuOpen(false);
              }} 
              className="transition text-left w-full px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 flex items-center justify-between"
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
            <button 
              id="mobile_btn_login"
              onClick={() => {
                navigate("/auth");
                setMobileMenuOpen(false);
              }}
              className="w-full bg-gradient-to-r from-[#FF1A1A] to-[#E54C00] text-white font-bold py-3 rounded-xl text-center shadow-lg transition"
            >
              Личный кабинет RR
            </button>
          </div>
        )}
      </header>

      {/* Hero Visual Banner Section */}
      <section className="relative py-16 px-4 md:px-8 overflow-hidden border-b border-white/10">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#E7C768]/10 blur-3xl rounded-full translate-y-[-50%] pointer-events-none"></div>
        <div className="absolute top-10 right-0 w-[500px] h-[500px] bg-sky-500/5 blur-3xl rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 bg-[#E7C768]/10 border border-[#E7C768]/20 px-3 py-1.5 rounded-full w-max">
              <Cpu className="w-4 h-4 text-[#E7C768]" />
              <span className="text-xs font-semibold text-[#E7C768] uppercase tracking-wider">
                Сервис ИИ Найма на HR-RR.ru
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              Робот Рекрутер заменяет{" "}
              <span className="bg-gradient-to-r from-[#F4EE8E] to-[#D99E41] bg-clip-text text-transparent">
                весь функционал HR
              </span>
            </h1>

            <p className="text-gray-200 text-base md:text-lg leading-relaxed max-w-2xl">
              Интеллектуальная RPA платформа, которая мгновенно подключает кандидатов, презентует условия вашей компании, проводит жесткий чек-лист опрос и интерактивную ролевую игру. В конце ИИ составляет персональный план быстрого обучения, тестирует знания и выдает сертификат готовности к работе.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-2">
              <button
                onClick={() => navigate("/auth")}
                className="cursor-pointer bg-gradient-to-r from-[#FF1A1A] to-[#E54C00] text-white font-bold text-base px-6 py-4 rounded-xl text-center shadow-xl hover:shadow-orange-700/20 hover:-translate-y-0.5 active:translate-y-0 transition duration-150"
              >
                Создать систему онбординга бесплатно
              </button>
              
              <a
                href="https://t.me/HR_RRbot"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm px-6 py-4 rounded-xl transition duration-150"
              >
                Наш Telegram Бот @HR_RRbot <ExternalLink className="w-4 h-4 text-[#E7C768]" />
              </a>
            </div>
          </div>

          {/* Right side: Mascot visual box formatted in new theme */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="bg-[#1D3E5E]/80 rounded-3xl p-8 border border-white/15 w-full max-w-md shadow-2xl flex flex-col items-center text-white">
              <Mascot state="greeting" size="lg" speechBubble="Привет! Я Робот Рекрутер. Помогу нанять и обучить персонал за 15 минут!" />
              <div className="w-full h-px bg-white/10 my-6"></div>
              
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                  <div className="text-[#E7C768] font-bold text-lg md:text-xl">94%</div>
                  <div className="text-xs text-slate-300">Автоматизация рутины</div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
                  <div className="text-emerald-400 font-bold text-lg md:text-xl">0 руб</div>
                  <div className="text-xs text-slate-300">Стоимость за резюме</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Core HR Replacement Sequence Section */}
      <section id="features" className="py-20 px-4 md:px-8 max-w-7xl mx-auto border-b border-white/10">
        <div className="text-center mb-16 flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Как RR полностью замещает традиционный HR-отдел
          </h2>
          <div className="w-16 h-1.5 bg-[#E7C768] rounded-full mt-4"></div>
          <p className="text-slate-300 mt-4 max-w-2xl text-sm md:text-base">
            Робот автоматически ведет соискателя шаг за шагом: от первого знакомства до получения диплома о квалификации.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          
          {/* Step 1 */}
          <div className="bg-[#1D3E5E]/60 rounded-2xl p-6 shadow-md border border-white/10 hover:border-[#E7C768] transition flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-[#E7C768] mb-4 border border-white/10">
              <TrendingUp className="w-6 h-6" />
            </div>
            <Mascot state="narrator" size="sm" />
            <h3 className="font-bold text-sm text-[#E7C768] mt-3">1. Продажа вакансии</h3>
            <p className="text-slate-200 text-xs mt-2 leading-relaxed">
              Детализирует KPI, график и мотивацию компании. Вызывает интерес и отсекает нецелевых.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#1D3E5E]/60 rounded-2xl p-6 shadow-md border border-white/10 hover:border-[#E7C768] transition flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-[#E7C768] mb-4 border border-white/10">
              <MessageSquare className="w-6 h-6" />
            </div>
            <Mascot state="recruitment" size="sm" />
            <h3 className="font-bold text-sm text-[#E7C768] mt-3">2. Чек-лист и диалог</h3>
            <p className="text-slate-200 text-xs mt-2 leading-relaxed">
              Проводит опрос о квалификации по вашему регламенту и принимает на разбор резюме в PDF.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#1D3E5E]/60 rounded-2xl p-6 shadow-md border border-white/10 hover:border-[#E7C768] transition flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-[#E7C768] mb-4 border border-white/10">
              <Cpu className="w-6 h-6" />
            </div>
            <Mascot state="chat" size="sm" />
            <h3 className="font-bold text-sm text-[#E7C768] mt-3">3. Ролевая игра</h3>
            <p className="text-slate-200 text-xs mt-2 leading-relaxed">
              Моделирует стрессовые и профессиональные кейсы для оценки поведения в реальном времени.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-[#1D3E5E]/60 rounded-2xl p-6 shadow-md border border-white/10 hover:border-[#E7C768] transition flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-[#E7C768] mb-4 border border-white/10">
              <Users className="w-6 h-6" />
            </div>
            <Mascot state="serious" size="sm" />
            <h3 className="font-bold text-sm text-[#E7C768] mt-3">4. Оценка ИИ</h3>
            <p className="text-slate-200 text-xs mt-2 leading-relaxed">
              Ставит баллы соискателю, анализирует пробелы в знаниях и формирует учебную траекторию.
            </p>
          </div>

          {/* Step 5 */}
          <div className="bg-[#1D3E5E]/60 rounded-2xl p-6 shadow-md border border-white/10 hover:border-[#E7C768] transition flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-[#E7C768] mb-4 border border-white/10">
              <Award className="w-6 h-6" />
            </div>
            <img src="https://i.ibb.co/WWRbtPq0/RR-Logo.png" alt="Diploma logo" className="w-10 h-10 object-contain my-3" />
            <h3 className="font-bold text-sm text-[#E7C768] mt-3">5. Индивидуальный Курс</h3>
            <p className="text-slate-200 text-xs mt-2 leading-relaxed">
              3 обучающих блока: Проф, Продукт, Процессы. По итогу — Диплом RR.
            </p>
          </div>

        </div>
      </section>

      {/* Specialties Cloud Promotion Section pointing to /main */}
      <section className="bg-[#1D3E5E]/40 py-20 px-4 md:px-8 border-b border-white/10 text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 text-left space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#E7C768]/15 border border-[#E7C768]/30 px-3.5 py-1.5 rounded-full">
              <Sparkles className="w-4 h-4 text-[#E7C768]" />
              <span className="text-xs font-bold text-[#E7C768] uppercase tracking-wider">Глобальный ИИ Каталог</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight text-white">
              Готовые спецификации для абсолютно любой профессии
            </h2>

            <p className="text-slate-200 text-sm md:text-base leading-relaxed">
              Наш Робот Рекрутер уже обладает предустановленными базами знаний по всем ключевым должностям (продажи, разработка, логистика, маркетинг, бухгалтерия, менеджмент и юриспруденция). 
            </p>

            <div className="bg-[#17344F]/60 border border-white/10 p-5 rounded-3xl space-y-3">
              <div className="flex items-start gap-3">
                <span className="bg-[#E7C768] text-slate-900 rounded-full p-1 text-[10px] font-bold">✨</span>
                <div>
                  <h4 className="font-bold text-xs text-[#E7C768]">Укажите любую должность</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">В нашей системе ИИ генерирует персональный регламент тестирования и учебные блоки индивидуально под любой ваш поисковый запрос!</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-stretch">
              <button
                onClick={() => navigate("/main")}
                className="cursor-pointer bg-gradient-to-r from-[#FF1A1A] to-[#E54C00] text-white font-bold py-4 px-6 rounded-xl hover:opacity-95 active:scale-98 transition flex items-center justify-center gap-2 shadow-lg"
              >
                Открыть каталог должностей (all 70+) <ArrowRight className="w-5 h-5 text-[#E7C768]" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#1D3E5E]/60 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-sm text-[#E7C768]">Популярные Профессии в системе:</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/5 border border-white/5 p-2 rounded-xl text-center">Менеджер по продажам</div>
              <div className="bg-white/5 border border-white/5 p-2 rounded-xl text-center">SMM-специалист</div>
              <div className="bg-white/5 border border-white/5 p-2 rounded-xl text-center">Технический писатель</div>
              <div className="bg-white/5 border border-white/5 p-2 rounded-xl text-center">Аналитик данных</div>
              <div className="bg-white/5 border border-white/5 p-2 rounded-xl text-center">Директор по маркетингу</div>
              <div className="bg-white/5 border border-white/5 p-2 rounded-xl text-center">Инженер ПТО</div>
            </div>
            <div className="text-center pt-2">
              <button 
                onClick={() => navigate("/main")}
                className="text-xs text-[#E7C768] hover:underline flex items-center gap-1 mx-auto"
              >
                Посмотреть всю базу ролей <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Telegram Bot Integration Section */}
      <section id="telegram-bot" className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-[#17344F] to-[#265582] border-2 border-white/10 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#E7C768]/15 blur-2xl rounded-full"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4 text-left">
              <span className="bg-[#E7C768] text-[#1A1A1A] font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full">
                Telegram Оповещения
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                Интеграция с ботом <span className="text-[#E7C768]">@HR_RRbot</span>
              </h2>
              <p className="text-gray-200 text-sm md:text-base leading-relaxed">
                Наш робот работает в связке с официальным ботом в Telegram: <strong className="text-white">https://t.me/HR_RRbot</strong>. 
                После регистрации работодатель привязывает свой Telegram ID, и бот мгновенно присылает детальные отчеты о прохождении кандидата:
              </p>
              
              <ul className="space-y-2 text-sm text-gray-200">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E7C768]"></span>
                  Оповещение о начале собеседования кандидатом
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E7C768]"></span>
                  ИИ-оценка резюме и ответов на кейсы в режиме реального времени
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E7C768]"></span>
                  Оповещение о завершении обучения и выдаче сертификата специалисту
                </li>
              </ul>
            </div>

            <div className="lg:col-span-4 flex flex-col items-center">
              <div className="bg-[#1D3E5E]/80 text-white p-6 rounded-2xl border border-white/10 shadow-lg w-full max-w-sm flex flex-col gap-4 text-center">
                <Mascot state="chat" size="sm" />
                <div className="font-bold text-sm text-[#E7C768]">Telegram бот HR_RRbot</div>
                <p className="text-xs text-slate-300">
                  Запустите бота на своем смартфоне для моментальной привязки уведомлений к личному кабинету.
                </p>
                <a
                  href="https://t.me/HR_RRbot"
                  target="_blank"
                  rel="noreferrer"
                  className="cursor-pointer bg-gradient-to-r from-[#FF1A1A] to-[#E54C00] hover:opacity-95 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-1.5 text-xs shadow-md"
                >
                  Запустить @HR_RRbot в TG <ExternalLink className="w-3.5 h-3.5 text-[#E7C768]" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Tariff Calculator & Interactive Order (Интерактивный заказ) Section */}
      <section className="py-20 px-4 md:px-8 bg-[#1D3E5E]/40 border-t border-b border-white/10 relative overflow-hidden" id="tariffs">
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-sky-500/5 blur-3xl rounded-full translate-x-[-50%] translate-y-[-50%] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center space-y-12 relative z-10">
          
          <div className="space-y-3">
            <span className="bg-[#E7C768]/15 text-[#E7C768] font-bold text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-[#E7C768]/20">
              Гибкие Тарифы Платформы
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              Интерактивный Расчёт Стоимости
            </h2>
            <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              Платите только за реальные действия ИИ Робота-Рекрутера без ежемесячной абонентской платы. Тонко настройте и сымитируйте параметры вашего бюджета.
            </p>
          </div>

          {/* Pricing Configurator Box */}
          <div className="bg-[#1D3E5E]/85 border-2 border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl text-left grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Left side: Range selectors */}
            <div className="md:col-span-7 space-y-6">
              
              {/* Interviews parameter */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200">1. Собеседования Робота-Рекрутера (100 ₽ / шт):</span>
                  <span className="bg-emerald-500/10 text-emerald-300 font-bold px-2 py-0.5 rounded-lg">{interviewsCount} шт</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  className="w-full accent-[#E7C768] cursor-pointer bg-white/10 h-1.5 rounded-lg appearance-none"
                  value={interviewsCount}
                  onChange={(e) => setInterviewsCount(Number(e.target.value))}
                />
                <span className="text-[10px] block text-slate-400">Полный аудио/текстовый скрининг, оценка резюме и вынесение вердикта о баллах.</span>
              </div>

              {/* Trainings parameter */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200">2. Персональные курсы обучения (100 ₽ / шт):</span>
                  <span className="bg-emerald-500/10 text-emerald-300 font-bold px-2 py-0.5 rounded-lg">{trainingsCount} шт</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  className="w-full accent-[#E7C768] cursor-pointer bg-white/10 h-1.5 rounded-lg appearance-none"
                  value={trainingsCount}
                  onChange={(e) => setTrainingsCount(Number(e.target.value))}
                />
                <span className="text-[10px] block text-slate-400">Специфические ИИ лекции по вашим Вики-файлам с последующим тестированием.</span>
              </div>

              {/* Specialty templates count */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200">3. Создание систем под специальность (1,000 ₽ / шт):</span>
                  <span className="bg-emerald-500/10 text-emerald-300 font-bold px-2 py-0.5 rounded-lg">{specialtiesCount} шт</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSpecialtiesCount(Math.max(0, specialtiesCount - 1))}
                    className="w-9 h-9 bg-white/5 border border-white/15 hover:bg-white/10 rounded-xl font-bold flex items-center justify-center text-slate-200"
                  >
                    -
                  </button>
                  <span className="text-base font-bold text-white w-12 text-center font-mono">{specialtiesCount}</span>
                  <button
                    type="button"
                    onClick={() => setSpecialtiesCount(Math.min(10, specialtiesCount + 1))}
                    className="w-9 h-9 bg-white/5 border border-white/15 hover:bg-white/10 rounded-xl font-bold flex items-center justify-center text-slate-200"
                  >
                    +
                  </button>
                </div>
                <span className="text-[10px] block text-slate-400">Генерация полной базы профессиональных вопросов, симуляторов кейсов под ключ.</span>
              </div>

            </div>

            {/* Right side: Live Receipt breakdown */}
            <div className="md:col-span-5 bg-[#17344F]/60 border border-white/10 p-6 rounded-2xl flex flex-col justify-between h-full space-y-4">
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wide text-[#E7C768] pb-2 border-b border-white/10">
                  Ваша ИИ-конфигурация
                </h4>
                
                <div className="space-y-2 text-xs text-slate-300 font-semibold">
                  <div className="flex justify-between">
                    <span>Собеседования:</span>
                    <span className="font-mono text-white">{(interviewsCount * 100).toLocaleString()} ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Обучения:</span>
                    <span className="font-mono text-white">{(trainingsCount * 100).toLocaleString()} ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Специальности:</span>
                    <span className="font-mono text-white">{(specialtiesCount * 1000).toLocaleString()} ₽</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 text-left space-y-3">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold leading-none">Итоговая Стоимость:</span>
                <div className="text-3xl font-extrabold text-emerald-400 font-mono">
                  {(interviewsCount * 100 + trainingsCount * 100 + specialtiesCount * 1000).toLocaleString()} ₽
                </div>

                <button
                  type="button"
                  onClick={() => setShowOrderSuccess(true)}
                  className="w-full bg-[#E7C768] hover:bg-[#F4EE8E] text-[#17344F] font-bold py-3.5 px-4 rounded-xl text-center text-sm shadow-xl transition-all hover:scale-102 flex items-center justify-center gap-2 cursor-pointer"
                >
                  🚀 Оформить Интерактивный Заказ
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Success Order Trigger Dialog */}
      {showOrderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#1D3E5E] border-2 border-[#E7C768]/40 text-white rounded-3xl max-w-md w-full p-6 md:p-8 space-y-4 shadow-2xl relative text-left">
            
            <button
              onClick={() => setShowOrderSuccess(false)}
              className="absolute top-4 right-4 hover:bg-white/10 p-1.5 rounded-full text-slate-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center flex flex-col items-center gap-3">
              <Mascot state="recruitment" size="md" />
              <h3 className="text-xl font-extrabold text-[#E7C768]">Заявка успешно имитирована!</h3>
              <p className="text-xs text-slate-200">
                Робот Рекрутер RR сформировал предварительные ИИ-выделения под ваш бюджет.
              </p>
            </div>

            <div className="bg-[#17344F]/60 p-4 rounded-xl border border-white/5 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between font-bold text-white border-b border-white/10 pb-1.5 mb-1.5">
                <span>Услуга</span>
                <span>Насчитано</span>
              </div>
              <div className="flex justify-between">
                <span>ИИ Собеседования ({interviewsCount} шт.):</span>
                <span className="font-mono text-white font-bold">{interviewsCount * 100} ₽</span>
              </div>
              <div className="flex justify-between">
                <span>ИИ Обучения соискателей ({trainingsCount} шт.):</span>
                <span className="font-mono text-white font-bold">{trainingsCount * 100} ₽</span>
              </div>
              <div className="flex justify-between pb-1.5 mb-1.5 border-b border-white/5">
                <span>Базы специальностей ({specialtiesCount} шт.):</span>
                <span className="font-mono text-white font-bold">{specialtiesCount * 1000} ₽</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-emerald-400">
                <span>Общая калькуляция:</span>
                <span className="font-mono">{(interviewsCount * 100 + trainingsCount * 100 + specialtiesCount * 1000).toLocaleString()} ₽</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowOrderSuccess(false);
                  navigate("/employer");
                }}
                className="w-full bg-gradient-to-r from-[#FF1A1A] to-[#E54C00] text-white font-bold py-3 rounded-xl text-center text-sm shadow-md transition"
              >
                Создать онбординг прямо сейчас
              </button>
              <button
                type="button"
                onClick={() => setShowOrderSuccess(false)}
                className="w-full bg-white/5 border border-white/10 text-slate-300 py-3 rounded-xl text-center text-xs font-semibold hover:bg-white/10 hover:text-white"
              >
                Закрыть калькулятор
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Styled Theme Footer with NO Black background */}
      <footer className="bg-[#17344F] text-white py-12 px-4 md:px-8 border-t-2 border-[#E7C768]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img 
              src="https://i.ibb.co/WWRbtPq0/RR-Logo.png" 
              alt="RR Logo" 
              className="w-10 h-10 object-contain" 
              referrerPolicy="no-referrer"
            />
            <div className="text-left font-bold text-sm text-[#E7C768]">
              © 2026 Робот Рекрутер RR — HR-RR.ru
              <span className="text-xs text-slate-300 block font-normal">Безоговорочная роботизация подбора персонала</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-xs text-slate-300">
            <button onClick={() => navigate("/main")} className="hover:text-white transition">Главная</button>
            <button onClick={() => navigate("/vacancy")} className="hover:text-[#E7C768] transition">Каталог должностей</button>
            <button onClick={() => navigate("/employer")} className="hover:text-white transition">Панель Руководителя</button>
            <button onClick={() => navigate("/candidate")} className="hover:text-white transition">Панель Кандидата</button>
            <button onClick={() => navigate("/auth")} className="hover:text-white transition font-bold text-[#E7C768]">Авторизация</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
