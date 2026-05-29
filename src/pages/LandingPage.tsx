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
  ChevronRight
} from "lucide-react";

export default function LandingPage() {
  const { navigate } = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("Менеджер по продажам");

  // Filter specialties based on tag search
  const filteredSpecialties = BASIC_SPECIALTIES.filter(spec =>
    spec.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 16); // Show top 16 matching specialties

  return (
    <div className="bg-[#EFEFEF] min-h-screen text-[#1A1A1A] font-sans antialiased selection:bg-[#E7C768] selection:text-[#1A1A1A]">
      
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#DBDBDB] px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/main")}>
          <img 
            src="https://i.ibb.co/WWRbtPq0/RR-Logo.png" 
            alt="RR Робот Рекрутер Logo" 
            className="w-10 h-10 object-contain drop-shadow" 
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-[#17344F] to-[#265582] bg-clip-text text-transparent">
              Робот Рекрутер
            </span>
            <span className="text-[10px] font-mono tracking-wider uppercase text-gray-500">Автоматизация найма</span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#1E4468]">
          <a href="#features" className="hover:text-[#E7C768] transition">Как это работает</a>
          <a href="#specialties" className="hover:text-[#E7C768] transition">Покрываемые должности</a>
          <a href="#telegram-bot" className="hover:text-[#E7C768] transition">Telegram Бот</a>
          <a href="#supabase" className="hover:text-[#E7C768] transition">Интеграция Supabase</a>
        </nav>

        <div className="flex items-center gap-3">
          <button 
            id="btn_login"
            onClick={() => navigate("/auth")}
            className="cursor-pointer bg-gradient-to-r from-[#FF1A1A] to-[#E54C00] text-white text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl hover:shadow-lg hover:shadow-red-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 duration-150"
          >
            Личный кабинет RR
          </button>
        </div>
      </header>

      {/* Hero Visual Banner Section */}
      <section className="bg-gradient-to-b from-[#17344F] to-[#265582] text-white py-16 px-4 md:px-8 relative overflow-hidden">
        {/* Absolute design decorations */}
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
              Интеллектуальная RPA платформа, которая мгновенно подключает кандидатов, продает им условия вашей компании, проводит жесткий чек-лист опрос и ролевую игру. В конце ИИ составляет персональный план быстрого обучения, тестирует знания и выдает сертификат готовности к работе.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-4">
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

            {/* Platform Credential Note */}
            <p className="text-xs text-slate-200 font-mono mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Готово к интеграции с Supabase API и Telegram ботом
            </p>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            {/* Show landing narrator mascot */}
            <div className="bg-white rounded-3xl p-8 border border-[#DBDBDB] w-full max-w-md shadow-2xl flex flex-col items-center text-[#1A1A1A]">
              <Mascot state="greeting" size="lg" speechBubble="Привет! Я Робот Рекрутер. Помогу нанять и обучить персонал за 15 минут!" />
              <div className="w-full h-px bg-[#DBDBDB] my-6"></div>
              
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-[#1E4468]/10 p-3 rounded-xl border border-[#1E4468]/20 text-center">
                  <div className="text-[#1E4468] font-bold text-lg md:text-xl">94%</div>
                  <div className="text-xs text-gray-700">Автоматизация рутины</div>
                </div>
                <div className="bg-[#EFEFEF] p-3 rounded-xl border border-[#DBDBDB] text-center">
                  <div className="text-[#D99E41] font-bold text-lg md:text-xl">0 руб</div>
                  <div className="text-xs text-gray-700">Стоимость за резюме</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Core HR Replacement Sequence Section */}
      <section id="features" className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16 flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] tracking-tight">
            Как RR полностью замещает традиционный HR-отдел
          </h2>
          <div className="w-16 h-1.5 bg-[#E7C768] rounded-full mt-4"></div>
          <p className="text-gray-600 mt-4 max-w-2xl text-sm md:text-base">
            Робот автоматически ведет соискателя шаг за шагом: от первого знакомства до получения диплома о квалификации.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-[#DBDBDB] hover:border-[#E7C768] transition flex flex-col items-center text-center text-[#1A1A1A]">
            <div className="w-12 h-12 rounded-xl bg-[#EFEFEF] flex items-center justify-center text-[#1E4468] mb-4 border border-[#DBDBDB]">
              <TrendingUp className="w-6 h-6" />
            </div>
            <Mascot state="narrator" size="sm" />
            <h3 className="font-bold text-sm text-[#1E4468] mt-3">1. Продажа вакансии</h3>
            <p className="text-gray-600 text-xs mt-2 leading-relaxed">
              Детализирует KPI, график и мотивацию компании. Вызывает интерес и отсекает нецелевых.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-[#DBDBDB] hover:border-[#E7C768] transition flex flex-col items-center text-center text-[#1A1A1A]">
            <div className="w-12 h-12 rounded-xl bg-[#EFEFEF] flex items-center justify-center text-[#1E4468] mb-4 border border-[#DBDBDB]">
              <MessageSquare className="w-6 h-6" />
            </div>
            <Mascot state="recruitment" size="sm" />
            <h3 className="font-bold text-sm text-[#1E4468] mt-3">2. Чек-лист и диалог</h3>
            <p className="text-gray-600 text-xs mt-2 leading-relaxed">
              Проводит опрос о квалификации по вашему регламенту и принимает на разбор резюме в PDF.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-[#DBDBDB] hover:border-[#E7C768] transition flex flex-col items-center text-center text-[#1A1A1A]">
            <div className="w-12 h-12 rounded-xl bg-[#EFEFEF] flex items-center justify-center text-[#1E4468] mb-4 border border-[#DBDBDB]">
              <Cpu className="w-6 h-6" />
            </div>
            <Mascot state="chat" size="sm" />
            <h3 className="font-bold text-sm text-[#1E4468] mt-3">3. Ролевая игра</h3>
            <p className="text-gray-600 text-xs mt-2 leading-relaxed">
              Моделирует стрессовые и профессиональные кейсы для оценки поведения в реальном времени.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-[#DBDBDB] hover:border-[#E7C768] transition flex flex-col items-center text-center text-[#1A1A1A]">
            <div className="w-12 h-12 rounded-xl bg-[#EFEFEF] flex items-center justify-center text-[#1E4468] mb-4 border border-[#DBDBDB]">
              <Users className="w-6 h-6" />
            </div>
            <Mascot state="serious" size="sm" />
            <h3 className="font-bold text-sm text-[#1E4468] mt-3">4. Оценка ИИ</h3>
            <p className="text-gray-600 text-xs mt-2 leading-relaxed">
              Ставит баллы соискателю, анализирует пробелы в знаниях и формирует учебную траекторию.
            </p>
          </div>

          {/* Step 5 */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-[#DBDBDB] hover:border-[#E7C768] transition flex flex-col items-center text-center text-[#1A1A1A]">
            <div className="w-12 h-12 rounded-xl bg-[#EFEFEF] flex items-center justify-center text-[#1E4468] mb-4 border border-[#DBDBDB]">
              <Award className="w-6 h-6" />
            </div>
            <img src="https://i.ibb.co/WWRbtPq0/RR-Logo.png" alt="Diploma logo" className="w-10 h-10 object-contain my-3" />
            <h3 className="font-bold text-sm text-[#1E4468] mt-3">5. Индивидуальный Курс</h3>
            <p className="text-gray-600 text-xs mt-2 leading-relaxed">
              3 обучающих блока: Проф, Продукт, Процессы. По итогу — Диплом RR.
            </p>
          </div>

        </div>
      </section>

      {/* Specialties Cloud Section */}
      <section id="specialties" className="bg-[#EFEFEF] py-20 px-4 md:px-8 border-y border-[#DBDBDB]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            <div className="lg:col-span-5 text-left">
              <h2 className="text-3xl font-bold text-[#1A1A1A] leading-tight tracking-tight">
                Готовые должностные спецификации для 70+ профессий
              </h2>
              <p className="text-gray-700 mt-4 text-sm md:text-base leading-relaxed">
                Наш Робот Рекрутер уже обладает вшитыми базами знаний по всем ключевым должностям: продажи, разработка, логистика, СМО, HRD, бухгалтерия и юриспруденция.
              </p>
              <p className="text-gray-700 mt-2 text-sm md:text-base leading-relaxed">
                Вы можете выбрать готовую специальность из каталога или просто указать название произвольной должности, введя свои документы — ИИ разработает персональный скрипт адаптации соискателя прямо под ваш проект.
              </p>

              <div className="mt-6 p-4 rounded-xl bg-white border border-[#DBDBDB] text-[#1A1A1A] shadow-md">
                <div className="text-xs font-bold text-[#1E4468] uppercase tracking-wider">Пример генерации:</div>
                <div className="font-bold text-[#1A1A1A] mt-1 text-lg flex items-center gap-1.5">
                  <Briefcase className="w-5 h-5 text-[#E7C768]" />
                  {selectedSpecialty}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Для этой должности RR создаст индивидуальные кейс-задачи для ролевой игры и сформирует профессиональный курс подготовки "продуктовым тонкостям".
                </p>
              </div>

              {/* CRM Live Demo trigger */}
              <button
                onClick={() => navigate("/auth")}
                className="cursor-pointer mt-8 w-full bg-gradient-to-r from-[#FF1A1A] to-[#E54C00] text-white font-bold py-3.5 px-6 rounded-xl hover:opacity-90 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
              >
                Начать найм соискателей по роли {selectedSpecialty} <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#DBDBDB] shadow-md">
              <div className="flex items-center gap-2 mb-4 bg-[#EFEFEF] px-3 py-2.5 rounded-xl border border-[#DBDBDB]">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Поиск должности (например: Директор, Программист, SMM...)"
                  className="bg-transparent text-sm text-[#1A1A1A] focus:outline-none w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Tag Cloud */}
              <div className="flex flex-wrap gap-2 max-h-96 overflow-y-auto pr-2">
                {filteredSpecialties.map((spec) => {
                  const isSelected = selectedSpecialty === spec;
                  return (
                    <button
                      key={spec}
                      onClick={() => setSelectedSpecialty(spec)}
                      className={`cursor-pointer px-3.5 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all duration-150 ${
                        isSelected
                          ? "bg-[#1E4468] text-white border-2 border-[#E7C768] scale-102"
                          : "bg-white hover:bg-[#EFEFEF] text-gray-700 border border-[#DBDBDB]"
                      }`}
                    >
                      {spec}
                    </button>
                  );
                })}
              </div>
              <div className="text-right text-[10px] text-gray-500 mt-3 font-mono">
                Показано {filteredSpecialties.length} из {BASIC_SPECIALTIES.length}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Telegram Bot Integration Section */}
      <section id="telegram-bot" className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-[#17344F] to-[#265582] border border-[#DBDBDB] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-xl">
          {/* Accent Gold Border */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#E7C768]/15 blur-2xl rounded-full"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4 text-left">
              <span className="bg-[#E7C768] text-[#1A1A1A] font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full">
                Telegram Оповещения
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
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
              <div className="bg-white text-[#1A1A1A] p-6 rounded-2xl border border-[#DBDBDB] shadow-lg w-full max-w-sm flex flex-col gap-4 text-center">
                <Mascot state="chat" size="sm" />
                <div className="font-bold text-sm text-[#1E4468]">Telegram бот HR_RRbot</div>
                <p className="text-xs text-gray-600">
                  Запустите бота на своем смартфоне для моментальной привязки уведомлений к личному кабинету.
                </p>
                <a
                  href="https://t.me/HR_RRbot"
                  target="_blank"
                  rel="noreferrer"
                  className="cursor-pointer bg-[#1E4468] hover:bg-[#1E4468]/90 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-1.5 text-xs"
                >
                  Запустить @HR_RRbot в TG <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supabase API Connection Blueprint section */}
      <section id="supabase" className="bg-white py-16 px-4 md:px-8 border-t border-[#DBDBDB]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] tracking-tight">
            Полная интеграция с базой данных Supabase
          </h2>
          <p className="text-gray-600 mt-3 text-sm md:text-base leading-relaxed">
            В личном кабинете работодателя встроен интерактивный помощник подключения вашей собственной базы данных Supabase по API. Вам гарантировано независимое хранение всех логов, резюме и обучения сотрудников с полным доступом к администрированию.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate("/auth")}
              className="cursor-pointer bg-[#EFEFEF] border border-[#DBDBDB] hover:bg-white text-[#1E4468] font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm transition"
            >
              Инструкция и схема БД в СРМ <ChevronRight className="w-4 h-4 text-[#D99E41]" />
            </button>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-[#1A1A1A] text-white py-12 px-4 md:px-8 border-t-4 border-[#E7C768]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img 
              src="https://i.ibb.co/WWRbtPq0/RR-Logo.png" 
              alt="RR Logo" 
              className="w-8 h-8 object-contain" 
              referrerPolicy="no-referrer"
            />
            <div className="text-left font-bold text-sm text-gray-300">
              © 2026 Робот Рекрутер RR — HR-RR.ru
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-xs text-gray-400">
            <a href="#features" className="hover:text-white transition">Возможности</a>
            <a href="#specialties" className="hover:text-white transition">Профессии</a>
            <a href="https://t.me/HR_RRbot" target="_blank" rel="noreferrer" className="hover:text-white transition flex items-center gap-1">Telegram бот <ExternalLink className="w-3 h-3 text-[#E7C768]" /></a>
            <a href="/auth" className="hover:text-white transition font-bold text-[#E7C768]">Регистрация</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
