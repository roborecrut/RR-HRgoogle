import React, { useState } from "react";
import { 
  Briefcase, Sparkles, Building2, Rocket, DollarSign, Calendar, Users, Cpu,
  CheckCircle2, Clock, Award, PhoneCall, Check, UserCheck, Play, ArrowRight,
  TrendingUp, ShieldCheck, HeartHandshake, HelpCircle, Eye, CalendarDays, BarChart2,
  Calculator
} from "lucide-react";
import { JobProject } from "../types";

interface SectionProps {
  project: JobProject;
  onChangeText?: (field: string, val: string) => void;
  isEditable?: boolean;
}

// -------------------------------------------------------------
// 1. 💼 VACANCY VIEW
// -------------------------------------------------------------
export const VacancyView: React.FC<SectionProps> = ({ project, onChangeText, isEditable }) => {
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const text = project.vacancyText || "• Ведение переговоров с клиентами по готовой базе\n• Внесение информации в простую CRM\n• Консультирование по тарифам\n• Быстрый и вежливый отклик\n• Уверенный пользователь ПК\n• Базовые навыки общения";

  // Parse lines
  const lines = text.split("\n").map(l => l.replace(/^[•\s-*]+/, "").trim()).filter(Boolean);
  const tasks = lines.slice(0, Math.ceil(lines.length / 2));
  const requirements = lines.slice(Math.ceil(lines.length / 2));

  // Interactive micro-task simulator
  const sampleTasksSim = [
    { title: "📞 Консультация", desc: "Клиент интересуется возможностью автоматизации рекламы. Ваша задача - открыть Wiki и направить ссылку на тариф." },
    { title: "📝 Ведение CRM", desc: "Добавить краткую заметку по итогам звонка. Например: 'Интерес подтвержден, ждет ссылку на оплату'." },
    { title: "🤝 Решение возражения", desc: "Если клиент говорит 'Дорого', объяснить ценность окупаемости ИИ-сервисов за первый месяц работы." }
  ];

  return (
    <div className="space-y-6">
      {/* Dynamic Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Main Responsibilities Block */}
        <div className="bg-[#12283C]/85 border border-[#E7C768]/15 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Briefcase className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">Пул Ключевых Задач</h4>
          </div>

          {isEditable ? (
            <textarea
              className="w-full bg-[#112335]/90 text-xs p-3 rounded-xl border border-white/10 text-white font-mono focus:outline-[#E7C768]"
              rows={5}
              value={text}
              onChange={(e) => onChangeText?.("vacancyText", e.target.value)}
              placeholder="Каждая строка с новой строки"
            />
          ) : (
            <div className="space-y-3">
              {tasks.map((task, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{task}</span>
                </div>
              ))}
              {tasks.length === 0 && <span className="text-slate-400 italic">Задачи не указаны</span>}
            </div>
          )}
        </div>

        {/* Requirements Block */}
        <div className="bg-[#12283C]/85 border border-[#E7C768]/15 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">Требования к кандидату</h4>
          </div>

          {isEditable ? (
            <p className="text-[10px] text-slate-400 italic">Редактируется в поле слева, разбивается автоматически по строкам для визуализации требований.</p>
          ) : (
            <div className="space-y-3">
              {requirements.map((req, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{req}</span>
                </div>
              ))}
              {requirements.length === 0 && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5 text-xs text-slate-200"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /> Хорошая дикция и вежливый тон</div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-200"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /> Наличие гарнитуры и ПК</div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Interactive Interactive Task Simulator Section */}
      <div className="bg-black/20 border border-white/5 rounded-2xl p-4 sm:p-5 text-left">
        <h4 className="text-xs font-mono uppercase tracking-wider text-[#E7C768] mb-3 flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 animate-pulse" /> Симуляция задач: Чем вы будете заниматься?
        </h4>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {sampleTasksSim.map((t, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTaskIndex(idx)}
              className={`transition text-[10px] sm:text-xs font-bold p-2.5 rounded-xl border text-center cursor-pointer ${
                activeTaskIndex === idx 
                  ? "bg-[#E7C768] text-[#112335] border-[#E7C768]" 
                  : "bg-[#112335]/70 text-slate-300 border-white/5 hover:bg-white/5"
              }`}
            >
              {t.title}
            </button>
          ))}
        </div>
        <div className="bg-[#112335] border border-[#E7C768]/10 p-3.5 rounded-xl">
          <p className="text-xs text-slate-300 leading-relaxed font-sans">{sampleTasksSim[activeTaskIndex].desc}</p>
          <div className="mt-3 flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 inline" /> Все необходимые инструкции будут доступны в Wiki на ИИ-собеседовании!
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 2. 🔥 MOTIVATION VIEW
// -------------------------------------------------------------
export const MotivationView: React.FC<SectionProps> = ({ project, onChangeText, isEditable }) => {
  const text = project.motivationTextDetail || project.motivationText || "• Премии до 30% за высокую скорость заполнения карточек CRM\n• Еженедельные выплаты за успешные звонки\n• Компенсация затрат на интернет\n• Обучение за счет компании и кураторство";
  const points = text.split("\n").map(l => l.replace(/^[•\s-*]+/, "").trim()).filter(Boolean);

  return (
    <div className="space-y-6">
      {isEditable ? (
        <div className="space-y-3 bg-[#12283C]/80 border border-white/5 rounded-2xl p-5">
          <label className="text-xs font-bold text-amber-300 block">Полный текст мотивации и льгот:</label>
          <textarea
            className="w-full bg-[#112335]/90 text-xs p-3 rounded-xl border border-white/10 text-white font-mono focus:outline-[#E7C768]"
            rows={5}
            value={text}
            onChange={(e) => onChangeText?.("motivationTextDetail", e.target.value)}
            placeholder="Каждое преимущество пишите с новой строки для генерации анимированных карточек"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {points.map((pt, i) => (
            <div key={i} className="bg-gradient-to-br from-[#12283C] to-[#1A344D] border border-white/5 hover:border-amber-500/20 p-4 rounded-2xl flex items-start gap-3 transition hover:shadow-lg">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                {i % 2 === 0 ? <Sparkles className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">Бонус {i + 1}</span>
                <p className="text-xs text-white font-medium leading-relaxed mt-1">{pt}</p>
              </div>
            </div>
          ))}
          {points.length === 0 && (
            <span className="text-xs text-slate-400 italic">Специальные льготы пока не описаны. Вы можете отредактировать их в кабинете работодателя.</span>
          )}
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// 3. 🏢 COMPANY VIEW
// -------------------------------------------------------------
export const CompanyView: React.FC<SectionProps> = ({ project, onChangeText, isEditable }) => {
  const text = project.companyText || "• Мы поставляем автоматизированные скрипты и голосовых помощников на рынке СНГ.\n• Создали более 15 крупных интеграций года.\n• Горизонтальная структура команды - у вас всегда есть прямой доступ к лидерам проекта.";
  const bullets = text.split("\n").map(l => l.replace(/^[•\s-*]+/, "").trim()).filter(Boolean);

  const stats = [
    { label: "Клиентов в СНГ", value: "350+" },
    { label: "ИИ-диалогов в сутки", value: "15 000+" },
    { label: "Год основания", value: "2021" }
  ];

  return (
    <div className="space-y-6">
      {isEditable ? (
        <div className="space-y-3 bg-[#12283C]/80 border border-white/5 rounded-2xl p-5">
          <label className="text-xs font-bold text-amber-300 block">Презентация компании на лендинге:</label>
          <textarea
            className="w-full bg-[#112335]/90 text-xs p-3 rounded-xl border border-white/10 text-white font-mono focus:outline-[#E7C768]"
            rows={5}
            value={text}
            onChange={(e) => onChangeText?.("companyText", e.target.value)}
            placeholder="Каждый факт о масштабе пишите с новой строки для красивой верстки"
          />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Quote Block */}
          <div className="bg-gradient-to-r from-[#12283C] to-[#1A344D] border-l-4 border-[#E7C768] p-4 rounded-r-2xl text-left">
            <span className="text-2xl font-serif text-[#E7C768] leading-none select-none">“</span>
            <p className="text-xs italic text-slate-200 mt-1 font-sans">
              Наша миссия — избавить людей от рутины в холодных звонках, автоматизировав базовую квалификацию лидов. Каждый день мы упрощаем работу сотрудникам отделов продаж по всему миру.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {stats.map((st, i) => (
              <div key={i} className="bg-black/20 border border-white/5 p-3 rounded-xl text-center">
                <span className="text-sm font-black text-[#E7C768] block">{st.value}</span>
                <span className="text-[9px] text-slate-400 mt-0.5 block leading-tight">{st.label}</span>
              </div>
            ))}
          </div>

          {/* Bullet points fact checklist */}
          <div className="bg-[#12283C]/50 border border-white/5 p-4 rounded-xl space-y-3 text-left">
            <h5 className="text-[10px] font-bold text-[#E7C768] uppercase font-mono tracking-wider">Факты о компании:</h5>
            <div className="space-y-2.5">
              {bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{b}</span>
                </div>
              ))}
              {bullets.length === 0 && <span className="text-slate-400 italic">Сведения отсутствуют</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// 4. 🚀 ONBOARDING VIEW
// -------------------------------------------------------------
export const OnboardingView: React.FC<SectionProps> = ({ project, onChangeText, isEditable }) => {
  const text = project.onboardingText || "• Быстрое тестирование навыков через ИИ-Режим\n• Ознакомление с Wiki базой знаний\n• Первые симуляционные звонки с подсказками ИИ\n• Подписание договора (ГПХ или Самозанятость) за 1 день";
  const steps = text.split("\n").map(l => l.replace(/^[•\s-*]+/, "").trim()).filter(Boolean);

  const [viewStep, setViewStep] = useState(0);

  const defaultStepTitles = [
    "📝 1. Экспресс-тест",
    "📚 2. Изучение Wiki",
    "🤖 3. ИИ-Разговор",
    "✍️ 4. Оформление"
  ];

  return (
    <div className="space-y-6">
      {isEditable ? (
        <div className="space-y-3 bg-[#12283C]/80 border border-white/5 rounded-2xl p-5">
          <label className="text-xs font-bold text-amber-300 block">Этапы ввода в должность и оформления:</label>
          <textarea
            className="w-full bg-[#112335]/90 text-xs p-3 rounded-xl border border-white/10 text-white font-mono focus:outline-[#E7C768]"
            rows={5}
            value={text}
            onChange={(e) => onChangeText?.("onboardingText", e.target.value)}
            placeholder="Каждый шаг с новой строки для отрисовки красивой интерактивного таймлайна"
          />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#E7C768] font-mono">ЭТАПЫ АДАПТАЦИИ:</span>
          </div>

          {/* Stepper Header Navigation */}
          <div className="grid grid-cols-4 gap-1.5">
            {defaultStepTitles.map((label, idx) => (
              <button
                key={idx}
                onClick={() => setViewStep(idx)}
                className={`transition p-2 rounded-xl text-center border font-bold text-[9px] sm:text-xs cursor-pointer ${
                  viewStep === idx
                    ? "bg-[#E7C768] text-[#112335] border-[#E7C768]"
                    : "bg-[#112335]/40 text-slate-300 border-white/5 hover:bg-white/5"
                }`}
              >
                {label.split(" .")[0]}
              </button>
            ))}
          </div>

          {/* Stepper body display */}
          <div className="bg-[#12283C] p-4 sm:p-5 rounded-2xl border border-white/10 text-left relative overflow-hidden">
            <div className="absolute right-3 top-3 text-[50px] font-serif font-black select-none text-white/5">
              0{viewStep + 1}
            </div>

            <div className="space-y-2 relative z-10">
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
                {defaultStepTitles[viewStep]}
              </span>
              <p className="text-xs text-white leading-relaxed font-sans font-medium">
                {steps[viewStep] || "Информация по этапу в настоящий момент подгружается ИИ-координатором."}
              </p>
              <div className="mt-4 pt-3.5 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Вся процедура полностью автоматизирована
                </span>
                <span className="text-[10px] text-slate-400 leading-none">Шаг {viewStep + 1} из 4</span>
              </div>
            </div>
          </div>

          {/* Interactive Flow visual list */}
          <div className="border border-white/5 rounded-xl bg-black/10 p-3 space-y-2">
            <span className="text-[9px] text-[#E7C768] font-mono block">ПОЛНЫЙ ПУТЬ СОИСКАТЕЛЯ:</span>
            <div className="space-y-2.5">
              {steps.map((st, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${viewStep === idx ? "bg-[#E7C768] text-black" : "bg-white/15 text-white"}`}>
                    {idx + 1}
                  </div>
                  <span className={`text-xs ${viewStep === idx ? "text-white font-bold" : "text-slate-400"}`}>{st}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// 5. 💵 PAYOUTS VIEW
// -------------------------------------------------------------
export const PayoutsView: React.FC<SectionProps> = ({ project, onChangeText, isEditable }) => {
  const text = project.payoutsText || "• Фиксированная оплата за каждый пройденный качественный звонок (от 120 р).\n• Выплаты дважды в месяц без задержек (10 и 25 числа).\n• Официальные начисления на карту любого банка.\n• Бонус за приглашенных друзей - 5000 рублей.";
  const payoutLines = text.split("\n").map(l => l.replace(/^[•\s-*]+/, "").trim()).filter(Boolean);

  return (
    <div className="space-y-6">
      {isEditable ? (
        <div className="space-y-3 bg-[#12283C]/80 border border-white/5 rounded-2xl p-5">
          <label className="text-xs font-bold text-amber-300 block">Условия выплат и премий:</label>
          <textarea
            className="w-full bg-[#112335]/90 text-xs p-3 rounded-xl border border-white/10 text-white font-mono focus:outline-[#E7C768]"
            rows={5}
            value={text}
            onChange={(e) => onChangeText?.("payoutsText", e.target.value)}
            placeholder="Каждая строка текста с новой строки"
          />
        </div>
      ) : (
        <div className="space-y-5">
          
          {/* Visual Payout parameters from database */}
          <div className="bg-black/10 border border-white/5 p-4 rounded-xl space-y-3.5 text-left">
            <span className="text-[10px] font-mono text-slate-300 block uppercase tracking-wider">💳 Детали начислений и вознаграждения:</span>
            <div className="space-y-2.5">
              {payoutLines.map((pay, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-200">
                  <span className="w-5 h-5 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 text-[10px] font-bold font-mono">
                    {i + 1}
                  </span>
                  <span>{pay}</span>
                </div>
              ))}
              {payoutLines.length === 0 && <span className="text-slate-400 italic">Сведения пока отсутствуют.</span>}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// 6. 📅 SCHEDULE VIEW
// -------------------------------------------------------------
export const ScheduleView: React.FC<SectionProps> = ({ project, onChangeText, isEditable }) => {
  const text = project.scheduleText || "• Гибкие смены от 4 часов в день во временном интервале с 09:00 до 21:00.\n• Возможность брать выходные в любой день недели.\n• Вы заходите в систему ИИ тогда, когда вам это удобно.";
  const lines = text.split("\n").map(l => l.replace(/^[•\s-*]+/, "").trim()).filter(Boolean);

  return (
    <div className="space-y-6">
      {isEditable ? (
        <div className="space-y-3 bg-[#12283C]/80 border border-white/5 rounded-2xl p-5">
          <label className="text-xs font-bold text-amber-300 block">Разъяснение графика смен:</label>
          <textarea
            className="w-full bg-[#112335]/90 text-xs p-3 rounded-xl border border-white/10 text-white font-mono focus:outline-[#E7C768]"
            rows={5}
            value={text}
            onChange={(e) => onChangeText?.("scheduleText", e.target.value)}
            placeholder="Пишите каждую ключевую деталь о сменах с новой строки"
          />
        </div>
      ) : (
        <div className="space-y-5">
          
          {/* List parameters from DB */}
          <div className="bg-black/10 border border-white/5 p-4 rounded-xl space-y-3 text-left">
            <span className="text-[10px] font-mono text-slate-300 block uppercase tracking-widest">📅 Параметры гибкости и смен:</span>
            <div className="space-y-2.5">
              {lines.map((l, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0 mt-1" />
                  <span>{l}</span>
                </div>
              ))}
              {lines.length === 0 && <span className="text-slate-400 italic">Сведения уточняются при звонке.</span>}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// 7. 👥 TEAM VIEW (MEET THE LECTURERS & MENTORS)
// -------------------------------------------------------------
export const TeamView: React.FC<SectionProps> = ({ project, onChangeText, isEditable }) => {
  const text = project.teamText || "• Дмитрий - Тимлид команды. Автор продающих сценариев в Wiki.\n• Ольга - HR куратор. Сопровождает подписание ГПХ договоров.\n• Мария - Специфика обучения. Поможет войти в ритм ИИ-ассистента в первые часы.";
  const lines = text.split("\n").map(l => l.replace(/^[•\s-*]+/, "").trim()).filter(Boolean);

  const defaultMentors = [
    { title: "Дмитрий", subtitle: "Тимлид проектов", text: "Составил идеальные Wiki-разборы, проходя по которым легко закрыть любое возражение за секунду.", email: "dmitry-sales@company.ru" },
    { title: "Ольга", subtitle: "HR куратор", text: "Отвечает за регистрацию договоров в базе, выдачу документов и автоматизированные начисления.", email: "olga-hr@company.ru" },
    { title: "Мария", subtitle: "Обучение кадров", text: "Поможет сдать тестовый разговор в ИИ-режиме с первой попытки без лишнего стресса.", email: "maria-study@company.ru" }
  ];

  const linesToRender = lines.map((l, idx) => {
    // try to match "Name - Role. Description."
    const dashIx = l.indexOf("-");
    if (dashIx !== -1) {
      const name = l.substring(0, dashIx).trim();
      const rest = l.substring(dashIx + 1).trim();
      const dotIx = rest.indexOf(".");
      const role = dotIx !== -1 ? rest.substring(0, dotIx).trim() : "Куратор";
      const desc = dotIx !== -1 ? rest.substring(dotIx + 1).trim() : rest;
      return { title: name, subtitle: role, text: desc };
    }
    return defaultMentors[idx] || { title: "Сотрудник", subtitle: "Опека новичков", text: l };
  });

  return (
    <div className="space-y-6">
      {isEditable ? (
        <div className="space-y-3 bg-[#12283C]/80 border border-white/5 rounded-2xl p-5">
          <label className="text-xs font-bold text-amber-300 block">Команда адаптации соискателей:</label>
          <textarea
            className="w-full bg-[#112335]/90 text-xs p-3 rounded-xl border border-white/10 text-white font-mono focus:outline-[#E7C768]"
            rows={5}
            value={text}
            onChange={(e) => onChangeText?.("teamText", e.target.value)}
            placeholder="Пишите кураторов в формате: Имя - Должность. Описание кураторства."
          />
        </div>
      ) : (
        <div className="space-y-5">
          <span className="text-[10px] font-mono text-slate-300 block uppercase tracking-widest text-left">👥 Ваши персональные наставники:</span>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {linesToRender.map((m, i) => (
              <div key={i} className="bg-gradient-to-b from-[#12283C] to-[#1A344D] border border-white/15 p-4 rounded-2xl text-left space-y-2.5 relative hover:border-amber-500/20 transition hover:shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-[#E7C768]/10 text-[#E7C768] flex items-center justify-center font-bold text-sm border border-[#E7C768]/20 select-none">
                    {m.title.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-white">{m.title}</h5>
                    <span className="text-[9px] text-amber-300 font-mono font-bold uppercase tracking-wider">{m.subtitle}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-normal font-sans pt-1">
                  &ldquo;{m.text}&rdquo;
                </p>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                  <span>Консультирует 24/7</span>
                  <span className="text-emerald-400">В сети</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#1D3E5E]/60 border border-white/10 p-4 rounded-2xl text-left flex items-start gap-3">
            <HeartHandshake className="w-5 h-5 text-[#E7C768] shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-black text-white">Всегда на связи в Telegram</h5>
              <p className="text-[10px] text-slate-300 leading-relaxed mt-0.5">После успешной сдачи ИИ-собеседования вас автоматически подключат к чату адаптации вашей группы.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// 8. ⚙️ SYSTEM VIEW (DAILY WORKFLOW & CRM PLATFORMS DETAIL)
// -------------------------------------------------------------
export const SystemView: React.FC<SectionProps> = ({ project, onChangeText, isEditable }) => {
  const text = project.systemText || "• Ведение клиентской базы в amoCRM: своевременная смена этапов сделок, фиксация договоренностей и внесение комментариев.\n• Google Таблицы: ежедневное заполнение оперативной отчетности, учет звонков и ведение реестра договоров.\n• IP-Телефония: звонки клиентам осуществляются в один клик прямо из карточки сделки в amoCRM.\n• Четкие диалоговые регламенты: использование интерактивной Wiki для быстрой отработки сложных вопросов клиентов.\n• Координация в рабочих чатах: ежедневный разбор сложных кейсов с личным наставником.";
  const criteria = text.split("\n").map(l => l.replace(/^[•\s-*]+/, "").trim()).filter(Boolean);

  const [activeSystemTab, setActiveSystemTab] = useState<"crm" | "sheets" | "phone">("crm");

  const systemDetails = {
    crm: {
      title: "💻 Панель amoCRM",
      desc: "Вся база клиентов находится в структурированной воронке продаж. При звонке карточка открывается автоматически. Вам нужно зафиксировать этап сделки (например, 'Квалифицирован', 'Отправлено КП' или 'Отказ') и написать краткий комментарий по звонку. Система автоматически напомнит о следующем контакте.",
      tip: "💡 Регламент: Любое изменение статуса контрагента должно сопровождаться комментарием не менее 4-х слов."
    },
    sheets: {
      title: "📊 Google Таблицы (Отчетность)",
      desc: "Форма ежедневного планового зачета звонков и выполненных задач. Сюда заносится количество совершенных эффективных контактов за смену, отправленные коммерческие предложения и планируемые сделки на завтра. По этим таблицам искусственный интеллект и личные тимлиды проводят сверку показателей KPI и начисляют бонусы.",
      tip: "💡 Ежедневная отчетность должна заполняться до 20:30 МСК текущего рабочего дня."
    },
    phone: {
      title: "📞 IP-Телефония (Запись & Набор)",
      desc: "Набор номеров клиентов происходит прямо со встроенного софтфона в один клик. Нет необходимости вводить номера вручную. Все разговоры автоматически записываются и архивируются, чтобы вы и ваш наставник могли легко прослушать их, разобрать ошибки и скорректировать манеру ведения диалога.",
      tip: "💡 Для качественной работы требуется гарнитура с шумоподавлением и стабильное интернет-соединение."
    }
  };

  return (
    <div className="space-y-6">
      {isEditable ? (
        <div className="space-y-3 bg-[#12283C]/80 border border-white/5 rounded-2xl p-5">
          <label className="text-xs font-bold text-amber-300 block">Регламент и рабочие инструменты системы:</label>
          <textarea
            className="w-full bg-[#112335]/90 text-xs p-3 rounded-xl border border-white/10 text-white font-mono focus:outline-[#E7C768]"
            rows={6}
            value={text}
            onChange={(e) => onChangeText?.("systemText", e.target.value)}
            placeholder="Опишите регламент ежедневной работы и использования CRM, Google таблиц и телефонии по одной строке на пункт"
          />
        </div>
      ) : (
        <div className="space-y-5">
          
          {/* Interactive Work Tools Dashboard Panel */}
          <div className="bg-gradient-to-br from-[#12283C] to-[#142331] border-2 border-amber-500/20 rounded-2xl p-4 sm:p-5 text-left space-y-4">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-white/5">
              <Cpu className="w-5 h-5 text-amber-300 animate-pulse" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">Интерактивный кабинет: Рабочие платформы</h4>
                <p className="text-[10px] text-slate-400 block mt-0.5">Кликните по вкладке, чтобы подробно изучить ежедневные инструменты:</p>
              </div>
            </div>

            {/* Platform selection tabs */}
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(systemDetails) as Array<keyof typeof systemDetails>).map((tabKey) => {
                const isActive = activeSystemTab === tabKey;
                return (
                  <button
                    key={tabKey}
                    type="button"
                    onClick={() => setActiveSystemTab(tabKey)}
                    className={`transition text-[10px] sm:text-xs font-bold p-2 rounded-xl border text-center cursor-pointer whitespace-nowrap ${
                      isActive 
                        ? "bg-[#E7C768] text-[#112335] border-[#E7C768] shadow-md" 
                        : "bg-[#112335]/70 text-slate-300 border-white/5 hover:bg-white/5"
                    }`}
                  >
                    {systemDetails[tabKey].title.split(" (")[0]}
                  </button>
                );
              })}
            </div>

            {/* Platform workflow description block */}
            <div className="bg-[#112335] border border-[#E7C768]/15 p-4 rounded-xl space-y-2.5">
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest block">
                {systemDetails[activeSystemTab].title}
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {systemDetails[activeSystemTab].desc}
              </p>
              <div className="text-[10px] bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg text-amber-300 font-mono font-medium leading-tight">
                {systemDetails[activeSystemTab].tip}
              </div>
            </div>
          </div>

          {/* Core Daily Workflow Criteria Checklist */}
          <div className="bg-black/10 border border-white/5 p-4 rounded-xl space-y-3.5 text-left">
            <span className="text-[10px] font-mono text-slate-300 block uppercase tracking-widest">⚙️ Ежедневная система регламентов и отчетности:</span>
            <div className="space-y-2.5">
              {criteria.map((crt, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-200">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{crt}</span>
                </div>
              ))}
              {criteria.length === 0 && <span className="text-slate-400 italic">Сведения пока отсутствуют.</span>}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
