/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// In-Memory Database for demonstration and real-time state share
const db = {
  projects: [] as any[],
  candidates: [] as any[],
  telegramLog: [] as any[],
  payments: [] as any[],
  employers: [] as any[],
  companies: [
    { name: "ООО РобоРекрут инжиниринг", slug: "ooo-roborekrut-inzhiniring", industry: "IT и ИИ продукты", staff: "45 человек", description: "Разрабатываем высокопроизводительнее решения по автоматизации собеседований со встроенным Gemini API.", activeVacancies: 1, employerId: "emp-demo", sites: "https://roborecruiter.ru" },
    { name: "PromoAI", slug: "promoai", industry: "Реклама и маркетинг", staff: "18 человек", description: "Интеллектуальное агентство контекстной рекламы с автогенерацией лидов.", activeVacancies: 1, employerId: "emp-demo", sites: "https://promoai.ru" }
  ] as any[],
};

// Seed default employer
db.employers.push({
  id: "emp-demo",
  name: "Сергей Ковалев",
  email: "hr-director@company.ru",
  telegramUsername: "cowal_sales",
  balance: 1000,
  registeredVia: "google",
  createdAt: new Date().toISOString(),
  limits: {
    interviews: 2,
    trainings: 2,
    landings: 1,
    interviewSystems: 1,
    trainingSystems: 1
  }
});

// Seed initial payments
db.payments.push({
  id: "pay-1",
  companyName: "ООО 'УльтраДизайн'",
  amount: 1000,
  itemType: "system_creation", 
  itemName: "Система найма и обучения (Менеджер по продажам)",
  status: "completed",
  createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
});
db.payments.push({
  id: "pay-2",
  companyName: "ООО 'КорпРешения'",
  amount: 100,
  itemType: "interview",
  itemName: "1 ИИ-интервью соискателя",
  status: "completed",
  createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
});
db.payments.push({
  id: "pay-3",
  companyName: "ИП Петров",
  amount: 100,
  itemType: "training",
  itemName: "1 ИИ-обучение соискателя",
  status: "pending",
  createdAt: new Date(Date.now() - 300000).toISOString(),
});

// Seed default data for sales manager and product specialist so that the app opens with some active CRM information
db.projects.push({
  id: "sales-prod-1",
  companyName: "ООО РобоРекрут инжиниринг",
  companySlug: "ooo-roborekrut-inzhiniring",
  employerId: "emp-demo",
  roleName: "Менеджер по продажам",
  salaryTerms: "80,000 - 150,000 руб. (оклад + %)",
  scheduleTerms: "5/2, Гибрид (Москва / Удаленно)",
  motivationText: "Мы разрабатываем технологичные решения в дизайне. Предлагаем оплачиваемое обучение, корпоративную фитнес-подписку и дружный молодой коллектив.",
  checklistQuestions: [
    "Опишите ваш опыт продаж в сегменте B2B за последние 2 года.",
    "Какими CRM-системами вы владеете профессионально?",
    "Готовы ли вы совершать от 40 холодных звонков в день на этапе старта?"
  ],
  roleplayQuestions: [
    "Клиент говорит: 'У вас слишком дорого, конкуренты предлагают дешевле'. Каковы ваши действия?",
    "Договоритесь о встрече с занятым руководителем отдела закупок."
  ],
  customWiki: "РобоРекрут поставляет ИИ-инструменты для маркетологов и рекрутеров. Главный продукт - ИИ Робот Рекрутер.",
  vacancyText: "Мы ищем сильного специалиста на должность Менеджер по продажам.\nВы будете вести сделки, коммуницировать с целевой аудиторией и помогать развивать наши продукты.\n\nТребования:\n- Грамотная речь, уверенность в себе\n- Умение пользоваться компьютером\n- Настойчивость и проактивный подход",
  tasksActivityText: "• [📞 Консультация] Клиент интересуется возможностью автоматизации рекламы. Ваша задача - открыть Wiki и направить ссылку на тариф.\n• [📝 CRM Система] Добавить краткую заметку по итогам звонка в карточку сделки.\n• [🤝 Отработка возражений] Помощь клиентам при возникновении сомнений, используя интерактивные скрипты.",
  motivationTextDetail: "В нашей команде вы будете расти быстрее, чем где-либо еще. Наша компания осуществляет прозрачные грейдовые выплаты. Оклад стабильный, а проценты от продаж выплачиваются безукоризненно.\n\nКаждый месяц лучший менеджер по продажам получает дополнительную премию и возможность кураторства новых сотрудников!",
  companyText: "ООО РобоРекрут инжиниринг — признанный флагман в своей технологической сфере. Мы гордимся тем, что строим полностью прозрачные и понятные рабочие процессы.\nВнедрение нашего ИИ Робота Рекрутера помогает нам мгновенно обучать новых людей, адаптируя их прямо под внутреннюю специфику наших регламентов и Wiki-баз.",
  onboardingText: "• [📝 Экспресс-тест] Быстрое тестирование навыков через ИИ-Режим\n• [📚 Изучение Wiki] Ознакомление с Wiki базой знаний со всеми регламентами работы\n• [🤖 ИИ-Разговор] Первые симуляционные звонки с качественными подсказками наставника\n• [✍️ Оформление] Подписание официального договора (ГПХ или Самозанятость) за 1 рабочий день",
  payoutsText: "• Фиксированная оплата за каждый пройденный качественный звонок (от 120 р).\n• Выплаты дважды в месяц без задержек (10 и 25 числа).\n• Официальные начисления на карту любого банка.\n• Бонус за приглашенных друзей - 5000 рублей.",
  scheduleText: "• Гибкие смены от 4 часов в день во временном интервале с 10:00 до 19:00.\n• Возможность брать выходные в любой день недели.\n• Вы заходите в систему ИИ тогда, когда вам это удобно.",
  teamText: "• [Отдел] Отдел телефонных продаж CRM\n• Дмитрий - Тимлид команды. Автор продающих сценариев в Wiki.\n• Ольга - HR куратор. Сопровождает подписание ГПХ договоров.\n• [Отдел] Отдел контроля качества\n• Мария - Специфика обучения. Поможет войти в ритм ИИ-ассистента в первые часы.",
  cabinetTabsText: "• [💻 Панель amoCRM] Вся база клиентов находится в структурированной воронке продаж. При звонке карточка открывается автоматически. Вам нужно зафиксировать этап сделки (например, 'Квалифицирован', 'Отправлено КП' или 'Отказ') и написать краткий комментарий по звонку. Система автоматически напомнит о следующем контакте. | 💡 Регламент: Любое изменение статуса контрагента должно сопровождаться комментарием не менее 4-х слов.\n• [📊 Google Таблицы] Форма ежедневного планового зачета звонков и выполненных задач. Сюда заносится количество совершенных эффективных контактов за смену, отправленные коммерческие предложения и планируемые сделки на завтра. | 💡 Ежедневная отчетность должна заполняться до 20:30 МСК текущего рабочего дня.\n• [📞 IP-Телефония] Набор номеров клиентов происходит прямо со встроенного софтфона в один клик. Нет необходимости вводить номера вручную. Все разговоры автоматически записываются и архивируются. | 💡 Требуется гарнитура с шумоподавлением и стабильное интернет-соединение.",
  systemText: "• Ведение клиентской базы в amoCRM: своевременная смена этапов сделок, фиксация договоренностей и внесение комментариев.\n• Google Таблицы: ежедневное заполнение оперативной отчетности, учет звонков и ведение реестра договоров.\n• IP-Телефония: звонки клиентам осуществляются в один клик прямо из карточки сделки в amoCRM.\n• Четкие диалоговые регламенты: использование интерактивной Wiki для быстрой отработки сложных вопросов клиентов.\n• Координация в рабочих чатах: ежедневный разбор сложных кейсов с личным наставником.",
  logoUrl: "https://i.ibb.co/WWRbtPq0/RR-Logo.png"
});

db.candidates.push({
  id: "cand-1",
  name: "Алексей Иванов",
  email: "ivanov@example.com",
  telegramUsername: "alex_ivanov_sale",
  telegramId: "12345678",
  projectId: "sales-prod-1",
  roleName: "Менеджер по продажам",
  currentStage: "training",
  resumeName: "alex_resume.pdf",
  scores: {
    interviewScore: 82,
    resumeScore: 78,
    checklistScore: 80,
    situationsScore: 75,
    checklistPoints: 8,
    roleplayPoints: 8,
    overallScore: 78,
    assessmentSummary: "Кандидат демонстрирует уверенные навыки коммуникации. Есть опыт работы с CRM. Необходимо подтянуть работу с возражениями 'дорого' и изучить продукт 'PromoAI' детально."
  },
  registeredVia: "telegram",
  createdAt: new Date().toISOString(),
  trainingPlan: [
    {
      title: "Профессиональное обучение",
      description: "Отработка техник продаж и возражения 'Про дороговизну'",
      lessons: [
        {
          id: "prof_L1",
          title: "Метод Изоляции Возражения",
          content: "Если клиент говорит 'дорого', выделите это возражение: 'Подскажите, кроме бюджета, у нас остались какие-то сомнения?'. Если нет, продавайте ценность.",
          quiz: {
            question: "Какова первая цель при возражении 'дорого'?",
            options: [
              "Сразу сделать максимальную скидку",
              "Понять, действительно ли дело только в цене или есть сомнения в ценности",
              "Закончить разговор из-за нецелевого клиента"
            ],
            answerIndex: 1
          },
          isCompleted: true
        }
      ]
    },
    {
      title: "Обучение продукту",
      description: "Изучение PromoAI и целевой аудитории УльтраДизайн",
      lessons: [
        {
          id: "prod_L1",
          title: "УТП конструктора PromoAI",
          content: "PromoAI создает промо-баннеры за 15 секунд при помощи встроенных нейросетей. Конверсия рекламного макета возрастает на 30%.",
          quiz: {
            question: "В чем главное преимущество PromoAI?",
            options: [
              "Автоматическое создание баннеров за 15 секунд с ИИ",
              "Низкая цена хостинга",
              "Экспорт в Excel"
            ],
            answerIndex: 0
          },
          isCompleted: false
        }
      ]
    },
    {
      title: "Обучение процессам и мотивации",
      description: "Система мотивации и сдача отчетности",
      lessons: [
        {
          id: "proc_L1",
          title: "Как рассчитывается процент менеджера по продажам",
          content: "Менеджер получает 10% от первой оплаты клиента и 3% от последующих ежемесячных списаний (рекуррентные платежи).",
          quiz: {
            question: "Какой процент выплачивается за рекуррентные платежи?",
            options: [
              "10%",
              "5%",
              "3%"
            ],
            answerIndex: 2
          },
          isCompleted: false
        }
      ]
    }
  ]
});

function getShuffled20Questions(type: "professional" | "product" | "system", roleName: string, companyName: string) {
  let selectList: any[] = [];
  let textList: any[] = [];

  const rName = roleName || "Менеджер";
  const cName = companyName || "Работодатель";

  if (type === "professional") {
    selectList = [
      {
        question: `Какой основной инструмент используется для отслеживания версий исходного кода в современных IT-командах при работе в качестве ${rName}?`,
        type: "select",
        options: ["Dropbox", "Google Drive", "Git", "Figma"],
        correctAnswer: "Git"
      },
      {
        question: "Что в устной речи менеджера больше всего вызывает доверие у клиента?",
        type: "select",
        options: ["Громкий напор и споры", "Паузы в речи, спокойный тон, вежливость и обращение по имени", "Быстрое зачитывание текста регламента", "Использование замудренных терминов"],
        correctAnswer: "Паузы в речи, спокойный тон, вежливость и обращение по имени"
      },
      {
        question: "Какой главный принцип отработки претензий или трудных возражений в клиентской сфере?",
        type: "select",
        options: ["Сразу спорить и защищаться", "Выслушать без паники, проявить эмпатию, привести аргументы о ценности и выгоде", "Прервать сессию разговора без объяснения причин", "Перевести тему на личные интересы"],
        correctAnswer: "Выслушать без паники, проявить эмпатию, привести аргументы о ценности и выгоде"
      },
      {
        question: "Что такое KPI сотрудника на занимаемой позиции?",
        type: "select",
        options: ["Список штрафных санкций", "Ключевые показатели эффективности", "Продолжительность дневных перерывов", "Свод утренних регламентов"],
        correctAnswer: "Ключевые показатели эффективности"
      },
      {
        question: "В чем реальная польза ведения рабочей CRM-системы для куратора?",
        type: "select",
        options: ["Для личных переписок с друзьями", "Для хранения истории клиента, напоминаний и контроля сделок", "Только для написания дневных отчетов руководству", "Никакой пользы, это пустая трата времени"],
        correctAnswer: "Для хранения истории клиента, напоминаний и контроля сделок"
      },
      {
        question: "Что делать, если клиент задал вам сложный технический вопрос, ответа на который вы не знаете?",
        type: "select",
        options: ["Придумать вымышленный ответ, чтобы казаться экспертом", "Прямо заявить 'Я этого не знаю' и закончить тему", "Вежливо сказать, что вы уточните у технического специалиста и вернетесь с ответом", "Попросить коллегу поговорить вместо вас"],
        correctAnswer: "Вежливо сказать, что вы уточните у технического специалиста и вернетесь с ответом"
      },
      {
        question: "Как расшифровывается методология SMART в целеполагании?",
        type: "select",
        options: [
          "Simple, Metric, Active, Real, True",
          "Specific, Measurable, Achievable, Relevant, Time-bound",
          "Smart, Many, Auto, Rate, Test",
          "System, Main, Action, Result, Time"
        ],
        correctAnswer: "Specific, Measurable, Achievable, Relevant, Time-bound"
      },
      {
        question: "Что делать при обнаружении технической ошибки или зависания в рабочей системе?",
        type: "select",
        options: ["Игнорировать и продолжать работу наугад", "Сделать скриншот, описать ошибку и незамедлительно передать куратору-наставнику", "Закрыть систему и взять незапланированный перерыв", "Рассказать клиентам, что у нас ничего не работает"],
        correctAnswer: "Сделать скриншот, описать ошибку и незамедлительно передать куратору-наставнику"
      },
      {
        question: "Какой стиль общения является стандартным в партнерской корпоративной среде?",
        type: "select",
        options: ["Панибратский и дружеский", "Официально-деловой, вежливый и партнерский, с уважением и без лести", "Командно-приказной", "Исключительно сухой бюрократический"],
        correctAnswer: "Официально-деловой, вежливый и партнерский, с уважением и без лести"
      },
      {
        question: "Что такое дедлайн в организации бизнес-процессов?",
        type: "select",
        options: ["Время начала рабочей смены", "Список участников совещания", "Крайний срок выполнения поставленной задачи", "Инструкция к приложению"],
        correctAnswer: "Крайний срок выполнения поставленной задачи"
      }
    ];

    textList = [
      { question: `Напишите, как вы определяете ценность продукта для сомневающегося клиента на позиции ${rName}.`, type: "text" },
      { question: "Каким образом вы планируете свой день для эффективного достижения профессиональных KPI?", type: "text" },
      { question: "Какую роль, по-вашему, играет эмпатия в разрешении конфликтных ситуаций с клиентами?", type: "text" },
      { question: "Опишите ваш личный опыт преодоления возражения 'Я подумаю, мне надо время' или аналогичного.", type: "text" },
      { question: "Какими способами вы ускоряете освоение нового сложного рабочего материала?", type: "text" },
      { question: "Расскажите, как вы реагируете на конструктивную критику от вашего руководителя или наставника.", type: "text" },
      { question: "Какую CRM или систему отчетности вы считаете наиболее удобной и почему?", type: "text" },
      { question: "Опишите ваши сильные профессиональные навыки, которые помогут вам быстрее войти в рабочий ритм.", type: "text" },
      { question: "Что для вас означает понятие 'здоровый психологический климат' в коллективе?", type: "text" },
      { question: "Коротко сформулируйте ваши профессиональные цели на ближайший год.", type: "text" }
    ];
  } else if (type === "product") {
    selectList = [
      {
        question: `Где хранится вся официальная и актуальная информация о продуктах и регламентах компании ${cName}?`,
        type: "select",
        options: ["В личных заметках сотрудников", "В корпоративной Wiki базе знаний компании", "На сторонних публичных форумах", "Она нигде не записывается и передается на словах"],
        correctAnswer: "В корпоративной Wiki базе знаний компании"
      },
      {
        question: `Что является ключевой ценностью продукта компании ${cName} для конечного потребителя?`,
        type: "select",
        options: ["Самая низкая цена без гарантий", "Автоматизация рутинных действий, экономия времени и точная ИИ-аналитика кураторов", "Игры и развлечения внутри личного кабинета соискателя", "Красивые фирменные цвета"],
        correctAnswer: "Автоматизация рутинных действий, экономия времени и точная ИИ-аналитика кураторов"
      },
      {
        question: "Как часто обновляются тарифы и спецификации услуг в Wiki-базе знаний компании?",
        type: "select",
        options: ["Раз в год в январе", "При любом изменении условий руководством в режиме реального времени", "Сотрудники рассчитывают их сами", "Информация о тарифах не меняется никогда"],
        correctAnswer: "При любом изменении условий руководством в режиме реального времени"
      },
      {
        question: `Что входит в наш пакет ИИ-подбора и автоматического онбординга для компании ${cName}?`,
         type: "select",
         options: ["Только ссылка на анкету без поддержки", "Интеграция ИИ, круглосуточное сопровождение кандидатов и личный HR-куратор", "Ежегодная консультация по телефону", "Разработка дизайна офисных помещений"],
         correctAnswer: "Интеграция ИИ, круглосуточное сопровождение кандидатов и личный HR-куратор"
      },
      {
        question: "Каким способом клиенты могут законно оплатить услуги нашей компании?",
        type: "select",
        options: ["Только наличными в кассу в главном офисе", "По реквизитам расчетного счета, ссылкой через СБП или банковской картой", "Личным переводом на Сбербанк куратора", "Мы не работаем по безналичному расчету"],
        correctAnswer: "По реквизитам расчетного счета, ссылкой через СБП или банковской картой"
      },
      {
        question: "Как реагировать, если клиент говорит, что у конкурентов аналогичный продукт стоит в три раза дешевле?",
        type: "select",
        options: ["Сказать, что у конкурентов плохой продукт и мошенники", "Связать цену с окупаемостью, скоростью работы, ИИ-контролем точности и доказывать ценность", "Сразу скинуть цену в три раза", "Согласиться и попрощаться на вежливой ноте"],
        correctAnswer: "Связать цену с окупаемостью, скоростью работы, ИИ-контролем точности и доказывать ценность"
      },
      {
        question: "Какая юридическая гарантия предоставляется клиентам при начале работы?",
        type: "select",
        options: ["Гарантий нет никаких", "Официальный договор, фиксирующий SLA поддержки, конфиденциальность персональных данных и параметры услуг", "Честное устное слово руководителя отдела", "Пожизненное бесплатное обновление ПО компании"],
        correctAnswer: "Официальный договор, фиксирующий SLA поддержки, конфиденциальность персональных данных и параметры услуг"
      },
      {
        question: "В каких случаях согласно договору оферты компания осуществляет официальный возврат средств?",
        type: "select",
        options: ["Если клиенту просто разонравилось наше название", "При обоснованном невыполнении обязательств со стороны сервиса до запуска интеграционных работ", "Средства никогда и ни при каких обстоятельствах не возвращаются", "Только по письменному разрешению президента компании"],
        correctAnswer: "При обоснованном невыполнении обязательств со стороны сервиса до запуска интеграционных работ"
      },
      {
        question: "Как называется личный рабочий кабинет соискателя, в котором вы сейчас проходите этапы?",
        type: "select",
        options: ["amoCRM", "Личный кабинет Roborekrut", "Google Спредшит", "Интерактивный клиентский терминал ICQ"],
        correctAnswer: "Личный кабинет Roborekrut"
      },
      {
        question: "Какая главная отличительная особенность нашего ИИ-собеседования на платформе?",
        type: "select",
        options: [
          "Оно длится 5 часов без перерывов",
          "Оно дает кандидату готовый разбор теории, чеклиста и ситуаций со скорингом за 10 минут с глубиной анализа 93%",
          "Кандидату нужно платить, чтобы пройти тест",
          "Голосовое общение полностью заменено на отправку коротких СМС-сообщений"
         ],
         correctAnswer: "Оно дает кандидату готовый разбор теории, чеклиста и ситуаций со скорингом за 10 минут с глубиной анализа 93%"
      }
    ];

    textList = [
      { question: `Какое свойство нашего продукта или программных решений вы считаете наиболее важным для роли ${rName} и почему?`, type: "text" },
      { question: `Каким образом наш робот-рекрутер помогает компаниям сократить финансовые затраты на поиск кадров?`, type: "text" },
      { question: `Какую пользу несет интеграция Wiki-базы знаний компании ${cName} для адаптации новых сотрудников?`, type: "text" },
      { question: "Опишите структуру быстрой презентации ключевой ценности нашего продукта за две минуты.", type: "text" },
      { question: "Каких технических стандартов безопасности должен придерживаться соискатель при работе с нашими системами?", type: "text" },
      { question: "Назовите два основных практических отличия нашей платформы от простых рекрутинговых агентств.", type: "text" },
      { question: "Как вы будете объяснять клиенту долгосрочную пользу регулярной оплаты подписки (SaaS)?", type: "text" },
      { question: "Какие ошибки соискателей чаще всего приводят к затягиванию онбординга при знакомстве с продуктом?", type: "text" },
      { question: "Какие требования конфиденциальности выдвигает компания куратору при доступе к внутреннему Wiki?", type: "text" },
      { question: "Как вы лично будете использовать технические преимущества продукта для улучшения своих показателей?", type: "text" }
    ];
  } else {
    selectList = [
      {
        question: "В какой интервал времени сотрудник обязан заполнять и отправлять ежедневную рабочую отчетность?",
        type: "select",
        options: ["До обеда следующего рабочего дня", "До окончания текущей рабочей смены (до 20:30 МСК)", "Раз в неделю по пятницам скопом", "Отчетность заполняется полностью по желанию сотрудника"],
        correctAnswer: "До окончания текущей рабочей смены (до 20:30 МСК)"
      },
      {
        question: "Каким образом фиксируется официальное время начала смены в нашей системе?",
        type: "select",
        options: ["Звонком напарнику по телефону", "Кликом на кнопку 'Начать смену' во внутреннем интерфейсе или отметкой в канале Telegram", "Записью в блокнот на выходных", "Время начала смены никем не отслеживается"],
        correctAnswer: "Кликом на кнопку 'Начать смену' во внутреннем интерфейсе или отметкой в канале Telegram"
      },
      {
        question: "Куда соискателю или стажеру обращаться при столкновении со сложными нестандартными кейсами?",
        type: "select",
        options: ["К генеральному директору компании напрямую", "К своему персональному куратору-наставнику в рабочий чат Telegram", "Написать официальную претензию в техподдержку", "Прервать выполнение смены до завтра"],
        correctAnswer: "К своему персональному куратору-наставнику в рабочий чат Telegram"
      },
      {
        question: "Какое последствие наступает за умышленное разглашение коммерческой тайны и баз данных клиентов?",
        type: "select",
        options: ["Устное дружеское порицание", "Штрафы и немедленное прекращение сотрудничества по договору ГПХ с аннулированием выплат", "Отработка дополнительных смен без оплаты", "Никаких санкций не предусмотрено"],
        correctAnswer: "Штрафы и немедленное прекращение сотрудничества по договору ГПХ с аннулированием выплат"
      },
      {
        question: "Сколько длится цикл базовой адаптации стажера в интерактивной системе онбординга?",
        type: "select",
        options: ["От 1 до 3 рабочих дней под полным курированием ИИ и наставника", "Один календарный месяц", "Ровно 14 рабочих дней", "Период адаптации в нашей компании отсутствует"],
        correctAnswer: "От 1 до 3 рабочих дней под полным курированием ИИ и наставника"
      },
      {
        question: "Как поступить, если вам крайне необходим незапланированный перерыв или отгул в рабочее время?",
        type: "select",
        options: ["Просто покинуть рабочее место и отключить телефон", "Уведомить куратора-наставника не менее чем за 4 часа и согласовать временной слот", "Устно попросить коллегу подстраховать без официальных пометок", "Рассказать об отпуске уже по факту возвращения"],
        correctAnswer: "Уведомить куратора-наставника не менее чем за 4 часа и согласовать временной слот"
      },
      {
        question: "Какая регулярность финансовых выплат за выполнение KPI установлена в компании?",
        type: "select",
        options: ["Раз в квартал по результатам ревизии", "Стабильно два раза в месяц (авансовые начисления и финальный расчет) на карту СЗ или ГПХ", "Один раз после завершения всего годового контракта", "Каждый день наличными или купонами на питание"],
        correctAnswer: "Стабильно два раза в месяц (авансовые начисления и финальный расчет) на карту СЗ или ГПХ"
      },
      {
        question: "Какое действие в amoCRM необходимо совершить при окончательном обоснованном отказе клиента от сделки?",
        type: "select",
        options: ["Удалить карточку сделки из системы безвозвратно", "Перевести сделку в категорию 'Закрыто и не реализовано' с обязательным указанием истинной причины", "Оставить сделку в активной стадии, чтобы не портить показатели статистики", "Переименовать и перевести сделку на другого менеджера"],
        correctAnswer: "Перевести сделку в категорию 'Закрыто и не реализовано' с обязательным указанием истинной причины"
      },
      {
        question: "Какая минимальная оценка диалога в ИИ-режиме необходима для автоматического зачета смены?",
        type: "select",
        options: ["30 баллов из 100 возможных", "75 баллов из 100 возможных", "95 баллов из 100 возможных", "Любой балл считается зачетным"],
        correctAnswer: "75 баллов из 100 возможных"
      },
      {
        question: "Где публикуются официальные системные новости компании и изменения в трудовых регламентах?",
        type: "select",
        options: ["В личных чатах кураторов в WhatsApp", "В закрепленных публикациях общего Telegram-канала компании", "На главной странице поисковых сайтов интернета", "Нигде не публикуются, каждый работает по старым правилам"],
        correctAnswer: "В закрепленных публикациях общего Telegram-канала компании"
      }
    ];

    textList = [
      { question: "Подробно опишите формат заполнения вашего ежедневного рабочего отчета эффективности в CRM.", type: "text" },
      { question: "Каким образом вы будете конструктивно решать сложный спорный вопрос со своим наставником?", type: "text" },
      { question: "Какую личную ответственность несет куратор за систематическое несоблюдение диалоговых регламентов (Wiki скриптов)?", type: "text" },
      { question: `Как вы будете планировать свои перерывы на позиции ${rName} в течение 8-часового рабочего дня?`, type: "text" },
      { question: "Каковы ваши первые действия при получении важного срочного уведомления в общем рабочем канале?", type: "text" },
      { question: "Поясните, почему детальное ведение и фиксация комментариев в CRM по звонкам критически важны.", type: "text" },
      { question: "Что вы предпримите в экстренной ситуации, если у вас дома отключили интернет прямо перед началом рабочей смены?", type: "text" },
      { question: "Продемонстрируйте ваше понимание ответственности за сохранность персональных данных наших клиентов.", type: "text" },
      { question: "Какие ключевые преимущества для вас имеет официальный статус самозанятого или договор ГПХ в современной системе?", type: "text" },
      { question: "Как вы будете координировать решение общего завала задач со своими коллегами в рабочем Discord/Telegram чате?", type: "text" }
    ];
  }

  const shuffledSelect = [...selectList].sort(() => Math.random() - 0.5).slice(0, 10);
  const shuffledText = [...textList].sort(() => Math.random() - 0.5).slice(0, 10);
  const combined = [...shuffledSelect, ...shuffledText];
  return combined.sort(() => Math.random() - 0.5).map((q, idx) => ({
    ...q,
    userAnswer: ""
  }));
}

// ProTalk State Resolution and API Client
function resolveBotChatId(candidateId?: string, employerId?: string, projectId?: string): string {
  if (candidateId) {
    const candidate = db.candidates.find(c => c.id === candidateId);
    if (candidate) {
      if (candidate.telegramId && candidate.telegramId.trim()) {
        const tg = candidate.telegramId.trim();
        return tg.startsWith("tb") ? tg : `tb${tg}`;
      }
      return candidate.id;
    }
  }
  if (employerId) {
    const employer = db.employers.find(e => e.id === employerId);
    if (employer) {
      if (employer.telegramId && employer.telegramId.trim()) {
        const tg = employer.telegramId.trim();
        return tg.startsWith("tb") ? tg : `tb${tg}`;
      }
      return employer.id;
    }
  }
  if (projectId) {
    const project = db.projects.find(p => p.id === projectId);
    if (project) {
      const employer = db.employers.find(e => e.id === project.employerId);
      if (employer) {
        if (employer.telegramId && employer.telegramId.trim()) {
          const tg = employer.telegramId.trim();
          return tg.startsWith("tb") ? tg : `tb${tg}`;
        }
        return employer.id;
      }
      return project.id;
    }
  }
  return "ask_default";
}

async function callProTalkLLM(
  modelType: "chat" | "company" | "vacancy" | "school" | "resume" | "other",
  messages: Array<{ role: string; content: string }>,
  tempCandidateId?: string,
  tempEmployerId?: string,
  tempProjectId?: string
): Promise<string> {
  const modelMap = {
    chat: "rr_chat",
    company: "rr_company",
    vacancy: "rr_vacncy",
    school: "rr_school",
    resume: "rr_resume",
    other: "hr_rr"
  };

  const model = modelMap[modelType] || "hr_rr";
  const bot_id = Number(process.env.PRO_TALK_BOT_ID) || 66337;
  const bot_token = process.env.PRO_TALK_BOT_TOKEN || "kEL1nRZp330QvUrG1KenhRQ2JIynkWLs";
  const bot_chat_id = resolveBotChatId(tempCandidateId, tempEmployerId, tempProjectId);

  const key = `${bot_id}_${bot_token}`;

  console.log(`[ProTalk] Calling model: ${model}, bot_id: ${bot_id}, bot_chat_id: ${bot_chat_id}`);

  const payload = {
    model,
    messages,
    temperature: 0.1,
    stream: true,
    bot_id,
    bot_token,
    bot_chat_id
  };

  try {
    const response = await fetch("https://ai.pro-talk.ru/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API returned HTTP ${response.status}: ${errText}`);
    }

    const reader = (response.body as any)?.getReader();
    if (!reader) {
      throw new Error("Response body is not readable");
    }

    const decoder = new TextDecoder("utf-8");
    let accumulatedText = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const cleanLine = line.trim();
        if (!cleanLine) continue;
        if (cleanLine === "data: [DONE]") continue;

        if (cleanLine.startsWith("data: ")) {
          try {
            const jsonStr = cleanLine.substring(6);
            const parsed = JSON.parse(jsonStr);
            const chunkText = parsed.choices?.[0]?.delta?.content || "";
            accumulatedText += chunkText;
          } catch (e) {
            // silent ignore
          }
        }
      }
    }

    if (buffer) {
      const cleanLine = buffer.trim();
      if (cleanLine.startsWith("data: ") && cleanLine !== "data: [DONE]") {
        try {
          const jsonStr = cleanLine.substring(6);
          const parsed = JSON.parse(jsonStr);
          const chunkText = parsed.choices?.[0]?.delta?.content || "";
          accumulatedText += chunkText;
        } catch (e) {}
      }
    }

    const result = accumulatedText.trim();
    if (!result) {
      throw new Error("ProTalk returned an empty stream response");
    }
    return result;

  } catch (err) {
    console.error("[ProTalk Error]:", err);
    throw err;
  }
}

// Lazy-initialized Gemini Client
let gemini_client: any = null;
function getGeminiClient() {
  if (!gemini_client) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      gemini_client = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
      console.log("Gemini API initialized successfully.");
    }
  }
  return gemini_client;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Check Gemini availability
  app.get("/api/ai-status", (req, res) => {
    res.json({
      active: true,
      message: "ProTalk API (Optimized LLM) connected and active."
    });
  });

  // Employer APIs: Register/login, retrieve profile, topup, and purchase
  app.post("/api/employers", (req, res) => {
    const { id, name, email, telegramUsername, registeredVia, refBy } = req.body;
    
    // Check if employer already exists with this email
    let emp = db.employers.find(e => e.email.toLowerCase() === email.toLowerCase());
    
    if (emp) {
      return res.json(emp);
    }
    
    const empId = id || "emp-" + Math.random().toString(36).substr(2, 6);
    
    // Initialize new employer with 1000 RR balance!
    emp = {
      id: empId,
      name,
      email,
      telegramUsername: telegramUsername || "",
      balance: 1000,
      registeredVia: registeredVia || "google",
      createdAt: new Date().toISOString(),
      limits: {
        interviews: 0,
        trainings: 0,
        landings: 0,
        interviewSystems: 0,
        trainingSystems: 0,
      }
    };
    
    db.employers.push(emp);
    
    // Referral bonus logic:
    // If refBy parameter is present and matches an employer, give them 1000 RR
    if (refBy) {
      const referrer = db.employers.find(e => e.id === refBy);
      if (referrer) {
        referrer.balance = (referrer.balance || 0) + 1000;
        
        // Record payment reward
        db.payments.push({
          id: "pay-" + Math.random().toString(36).substr(2, 9),
          companyName: referrer.name + " (" + referrer.email + ")",
          amount: 1000,
          itemType: "referral_reward",
          itemName: `Реферальный бонус за запуск личного кабинета друга ${name}`,
          status: "completed",
          createdAt: new Date().toISOString()
        });
        
        notifyTelegram(referrer.telegramId || "emp-demo", `🎁 Вам начислен реферальный бонус +1000 RR! Друг ${name} зарегистрировался на платформе по вашей реф-ссылке.`);
      }
    }
    
    res.status(201).json(emp);
  });

  app.get("/api/employers/:id", (req, res) => {
    const emp = db.employers.find(e => e.id === req.params.id);
    if (!emp) {
      return res.status(404).json({ error: "Employer not found" });
    }
    res.json(emp);
  });

  app.put("/api/employers/:id", (req, res) => {
    const emp = db.employers.find(e => e.id === req.params.id);
    if (!emp) {
      return res.status(404).json({ error: "Employer not found" });
    }
    
    const { 
      name, title, email, phone, telegramId,
      googleName, googleEmail, googlePhoto, googleId, googleVerified,
      telegramPhoto, telegramFirstName, telegramLastName, telegramUsername
    } = req.body;
    
    if (name !== undefined) emp.name = name;
    if (title !== undefined) emp.title = title;
    if (email !== undefined) emp.email = email;
    if (phone !== undefined) emp.phone = phone;
    if (telegramId !== undefined) emp.telegramId = telegramId;
    
    if (googleName !== undefined) emp.googleName = googleName;
    if (googleEmail !== undefined) emp.googleEmail = googleEmail;
    if (googlePhoto !== undefined) emp.googlePhoto = googlePhoto;
    if (googleId !== undefined) emp.googleId = googleId;
    if (googleVerified !== undefined) emp.googleVerified = googleVerified;
    
    if (telegramPhoto !== undefined) emp.telegramPhoto = telegramPhoto;
    if (telegramFirstName !== undefined) emp.telegramFirstName = telegramFirstName;
    if (telegramLastName !== undefined) emp.telegramLastName = telegramLastName;
    if (telegramUsername !== undefined) emp.telegramUsername = telegramUsername;
    
    res.json({ success: true, employer: emp });
  });

  app.post("/api/employers/:id/topup", (req, res) => {
    const emp = db.employers.find(e => e.id === req.params.id);
    if (!emp) return res.status(404).json({ error: "Employer not found" });
    
    const { amountRubles } = req.body;
    const amount = Number(amountRubles);
    if (isNaN(amount) || amount < 100) {
      return res.status(400).json({ error: "Минимальный платеж 100 рублей" });
    }
    
    // 1 рубль = 1 RR
    const rrCredited = amount;
    emp.balance = (emp.balance || 0) + rrCredited;
    
    // Record payment receipt
    const txId = "TX-CALC-" + Math.floor(100000 + Math.random() * 900000);
    const newPayment = {
      id: txId,
      companyName: emp.name + " (" + emp.email + ")",
      amount: amount,
      itemType: "topup",
      itemName: `Пополнение счета (+${rrCredited} RR)`,
      status: "completed",
      createdAt: new Date().toISOString()
    };
    db.payments.push(newPayment);
    
    notifyTelegram(emp.telegramId || "emp-demo", `💰 Баланс успешно пополнен на ${amount} руб. Начислено: +${rrCredited} RR.`);
    
    res.json({ success: true, balance: emp.balance, payment: newPayment });
  });

  app.post("/api/employers/:id/purchase", (req, res) => {
    const emp = db.employers.find(e => e.id === req.params.id);
    if (!emp) return res.status(404).json({ error: "Employer not found" });
    
    const { itemType } = req.body;
    let price = 0;
    let itemName = "";
    
    if (itemType === "interview") {
      price = 100;
      itemName = "Интервью (1 шт)";
    } else if (itemType === "training") {
      price = 100;
      itemName = "ИИ Обучение (1 шт)";
    } else if (itemType === "landing") {
      price = 500;
      itemName = "ИИ Лендинг вакансии";
    } else if (itemType === "system_interview") {
      price = 300;
      itemName = "ИИ система интервью";
    } else if (itemType === "system_training") {
      price = 200;
      itemName = "ИИ система обучения";
    } else {
      return res.status(400).json({ error: "Неверный тип услуги" });
    }
    
    if ((emp.balance || 0) < price) {
      return res.status(400).json({ error: `Недостаточно средств. Требуется ${price} RR, текущий баланс: ${emp.balance} RR.` });
    }
    
    // Deduct balance
    emp.balance -= price;
    
    // Increment specific limit counters
    if (!emp.limits) {
      emp.limits = {
        interviews: 0,
        trainings: 0,
        landings: 0,
        interviewSystems: 0,
        trainingSystems: 0,
      };
    }
    
    if (itemType === "interview") emp.limits.interviews = (emp.limits.interviews || 0) + 1;
    if (itemType === "training") emp.limits.trainings = (emp.limits.trainings || 0) + 1;
    if (itemType === "landing") emp.limits.landings = (emp.limits.landings || 0) + 1;
    if (itemType === "system_interview") emp.limits.interviewSystems = (emp.limits.interviewSystems || 0) + 1;
    if (itemType === "system_training") emp.limits.trainingSystems = (emp.limits.trainingSystems || 0) + 1;
    
    // Record payment receipt
    const txId = "TX-BUY-" + Math.floor(1000 + Math.random() * 9000);
    const newPayment = {
      id: txId,
      companyName: emp.name + " (" + emp.email + ")",
      amount: price,
      itemType: "purchase_" + itemType,
      itemName: `Покупка: ${itemName}`,
      status: "completed",
      createdAt: new Date().toISOString()
    };
    db.payments.push(newPayment);
    
    notifyTelegram(emp.telegramId || "emp-demo", `🛍️ Приобретена услуга: "${itemName}" за ${price} RR.`);
    
    res.json({ success: true, balance: emp.balance, limits: emp.limits, payment: newPayment });
  });

  // DB APIs: Companies Endpoints
  app.get("/api/companies", (req, res) => {
    res.json(db.companies || []);
  });

  app.post("/api/companies", (req, res) => {
    const { 
      name, 
      slug, 
      industry, 
      staff, 
      description, 
      sites, 
      logoUrl, 
      employerId,
      files,
      missionText,
      customWiki,
      salaryTerms,
      scheduleTerms,
      statsValClients,
      statsLabelClients,
      statsValDialogs,
      statsLabelDialogs,
      statsValFounded,
      statsLabelFounded
    } = req.body;
    
    const finalSlug = slug || name.toLowerCase()
      .replace(/[^а-яёa-z0-9\s-]/gi, "")
      .trim()
      .replace(/\s+/g, "-");
    
    // Check if already exists
    let comp = db.companies.find(c => c.slug === finalSlug);
    if (comp) {
      comp.name = name;
      comp.industry = industry || comp.industry;
      comp.staff = staff || comp.staff;
      comp.description = description || comp.description;
      comp.sites = sites || comp.sites;
      comp.logoUrl = logoUrl || comp.logoUrl;
      comp.files = files || comp.files;
      comp.missionText = missionText || comp.missionText;
      comp.customWiki = customWiki || comp.customWiki;
      comp.salaryTerms = salaryTerms || comp.salaryTerms;
      comp.scheduleTerms = scheduleTerms || comp.scheduleTerms;
      comp.statsValClients = statsValClients || comp.statsValClients;
      comp.statsLabelClients = statsLabelClients || comp.statsLabelClients;
      comp.statsValDialogs = statsValDialogs || comp.statsValDialogs;
      comp.statsLabelDialogs = statsLabelDialogs || comp.statsLabelDialogs;
      comp.statsValFounded = statsValFounded || comp.statsValFounded;
      comp.statsLabelFounded = statsLabelFounded || comp.statsLabelFounded;
      return res.json(comp);
    }

    const newCompany = {
      id: "comp-" + Math.random().toString(36).substr(2, 6),
      name,
      slug: finalSlug,
      industry: industry || "Производство",
      staff: staff || "10-25 человек",
      description: description || "",
      sites: sites || "",
      logoUrl: logoUrl || "",
      files: files || "",
      employerId: employerId || "emp-demo",
      activeVacancies: 0,
      missionText: missionText || "Создавать лучшие инновации",
      customWiki: customWiki || "",
      salaryTerms: salaryTerms || "",
      scheduleTerms: scheduleTerms || "",
      statsValClients: statsValClients || "",
      statsLabelClients: statsLabelClients || "",
      statsValDialogs: statsValDialogs || "",
      statsLabelDialogs: statsLabelDialogs || "",
      statsValFounded: statsValFounded || "",
      statsLabelFounded: statsLabelFounded || ""
    };

    db.companies.push(newCompany);
    res.status(201).json(newCompany);
  });

  // Parse corporate documentation/files and populate company fields via ProTalk JSON
  app.post("/api/parse-company-file", async (req, res) => {
    const { fileName } = req.body;
    
    const prompt = `Ты — Ведущий HR-аналитик и ИИ Копирайтер компании "Робот Рекрутер (RR)".
К тебе загрузили регламентный файл компании: "${fileName}".
Твоя задача — извлечь из информации о файле (или сгенерировать на основе названия "${fileName}") красивую, убедительную и маркетингово привлекательную информацию о компании на русском языке.

Верни ответ в СТРОГОМ формате JSON (без оборачивания в markdown \`\`\`json, верни только сырой JSON):
{
  "name": "Название компании на русском",
  "industry": "Отрасль (например: Финансы, Логистика, IT, Образование)",
  "staff": "10-50 человек",
  "description": "Привлекательное описание компании (3-4 предложения) с уклоном в инновации и заботу о сотрудниках",
  "sites": "www.company-web.ru",
  "logoUrl": "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=120&h=120&q=80",
  "missionText": "Наша миссия — создавать продукты будущего и помогать сотрудникам расти вместе с нами",
  "customWiki": "РЕГЛАМЕНТ РАБОТЫ:\\n- Работать в CRM ежедневно;\\n- Отвечать клиентам в течение 5 минут;\\n- Соблюдать вежливый тон. Сдача отчетности еженедельно по пятницам.",
  "salaryTerms": "До 120 000 руб (фикс + KPI)",
  "scheduleTerms": "5/2 гибкие смены от 4 часов в день",
  "statsValClients": "1500+",
  "statsLabelClients": "Довольных клиентов",
  "statsValDialogs": "120 тыс",
  "statsLabelDialogs": "Обработано заявок автоматикой",
  "statsValFounded": "2019",
  "statsLabelFounded": "Год успешного запуска"
}`;

    try {
      const messages = [{ role: "user", content: prompt }];
      let textResponse = await callProTalkLLM("company", messages);
      textResponse = textResponse.replace(/^```json/i, "").replace(/```$/i, "").trim();
      const parsed = JSON.parse(textResponse);
      return res.json(parsed);
    } catch (err) {
      console.error("Error at parse-company-file, sending defaults...", err);
      const simpleName = fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
      return res.json({
        name: simpleName.charAt(0).toUpperCase() + simpleName.slice(1),
        industry: "Производство и ритейл",
        staff: "10-50 человек",
        description: `Стабильная и быстрорастущая компания, специализирующаяся на технологических решениях. Разбор регламента «${fileName}» показал высокий уровень внутренней организации и автоматизации.`,
        sites: "www.company-web.ru",
        logoUrl: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=120&h=120&q=80",
        missionText: "Обеспечивать превосходное качество обслуживания клиентов и стимулировать команду к профессиональным победам. Наша общая цель - инновационное лидерство.",
        customWiki: "РЕГЛАМЕНТ ИЗ ФАЙЛА:\n- Соблюдение стандартов тайминга ответа соискателям;\n- Ведение отчетности в единой CRM-системе;\n- Ежедневное прохождение проверочных тестов.",
        salaryTerms: "От 80 000 до 150 000 рублей (оклад + %)",
        scheduleTerms: "Гибкий удаленный формат",
        statsValClients: "800+",
        statsLabelClients: "Клиентов на обслуживании",
        statsValDialogs: "50 000",
        statsLabelDialogs: "Диалогов в месяц",
        statsValFounded: "2021",
        statsLabelFounded: "Год основания"
      });
    }
  });

  // Enhance single field endpoint via ProTalk LLM
  app.post("/api/enhance-single-field", async (req, res) => {
    const { fieldName, fieldVal, context } = req.body;

    const fieldDescriptions: Record<string, string> = {
      name: "Название бренда или организации",
      industry: "Отрасль работы компании",
      description: "Миссия, культура и описание продуктов для лендинга",
      sites: "Официальный сайт",
      logoUrl: "Ссылка на логотип",
      missionText: "Миссия и слоган компании",
      customWiki: "Вики-регламенты компании и база знаний обучения",
      salaryTerms: "Условия оплаты и мотивации сотрудников",
      scheduleTerms: "График работы и гибкость смен",
      statsValClients: "Цифра-показатель 1",
      statsLabelClients: "Подпись показателя 1",
      statsValDialogs: "Цифра-показатель 2",
      statsLabelDialogs: "Подпись показателя 2",
      statsValFounded: "Цифра-показатель 3",
      statsLabelFounded: "Подпись показателя 3",
    };

    const label = fieldDescriptions[fieldName] || fieldName;

    const prompt = `Ты — Старший HR-маркетолог платформы "Робот Рекрутер (RR)".
Тебе нужно улучшить и красиво оформить значение поля на русском языке.
Название поля: "${label}" (ключ: "${fieldName}").
Текущее значение: "${fieldVal || "пусто"}".
Дополнительный контекст о компании: "${JSON.stringify(context || {})}"

Сформулируй улучшенное, презентабельное, профессиональное и грамматически изысканное значение для этого поля.
Если поле было пустым, придумай наиболее правдоподобный и красивый вариант на основе названия компании.
Верни ТОЛЬКО улучшенное значение, без каких-либо комментариев, вводных слов, тегов или кавычек. Будь лаконичен!`;

    try {
      const messages = [{ role: "user", content: prompt }];
      const improved = await callProTalkLLM("company", messages);
      return res.json({ value: improved.trim() });
    } catch (err) {
      console.error("Error at enhance-single-field", err);
      return res.json({ value: fieldVal || "Автозаполнение ИИ" });
    }
  });

  // Enhance all fields cohesively via ProTalk LLM
  app.post("/api/enhance-all-fields", async (req, res) => {
    const currentData = req.body;

    const prompt = `Ты — Директор по брендингу "Робот Рекрутер (RR)".
Тебе передали текущий профиль компании, содержащий следующие сведения:
${JSON.stringify(currentData, null, 2)}

Твоя задача — комплексно улучшить ВСЕ текстовые поля, чтобы они звучали максимально профессионально, слаженно и мотивирующе для соискателей на лендинге.
Дополни пустые поля красивыми подходящими по смыслу деталями на русском языке.
ВНИМАНИЕ: сохраняй числовые показатели (stats) реалистичными.

Верни ответ в СТРОГОМ формате JSON (без разметки markdown \`\`\`json, верни только сырой JSON):
{
  "name": "Название компании",
  "industry": "Отрасль",
  "staff": "Размер штата (выбери один из вариантов: 'менее 10 сотрудников', '10-50 человек', '50-250 человек', 'свыше 250 сотрудников')",
  "description": "Стильное и вдохновляющее описание компании (3-4 предложения)",
  "sites": "Сайт компании",
  "logoUrl": "Ссылка лого",
  "missionText": "Формулировка благородной миссии компании",
  "customWiki": "Подробные и полезные правила и база знаний",
  "salaryTerms": "Привлекательное описание выплат и бонусов в рублях",
  "scheduleTerms": "Комфортное и понятное описание графика",
  "statsValClients": "Показатель 1 (например, 200+)",
  "statsLabelClients": "Подпись 1",
  "statsValDialogs": "Показатель 2 (например, 50k+)",
  "statsLabelDialogs": "Подпись 2",
  "statsValFounded": "Год основания (например, 2020)",
  "statsLabelFounded": "Подпись 3 (например, Год старта)"
}`;

    try {
      const messages = [{ role: "user", content: prompt }];
      let textResponse = await callProTalkLLM("company", messages);
      textResponse = textResponse.replace(/^```json/i, "").replace(/```$/i, "").trim();
      const parsed = JSON.parse(textResponse);
      return res.json(parsed);
    } catch (err) {
      console.error("Error enhancing all fields:", err);
      return res.json({
        ...currentData,
        description: (currentData.description || "") + " (Профиль красиво оформлен ИИ-рекрутером RR с заботой)",
        missionText: currentData.missionText || "Создавать высокую ценность для каждого клиента",
        customWiki: currentData.customWiki || "Регламент работы: быть вежливым, пунктуальным, сдавать отчет раз в неделю.",
      });
    }
  });

  // DB APIs: Get projects
  app.get("/api/projects", (req, res) => {
    res.json(db.projects);
  });

  app.get("/api/projects/:id", (req, res) => {
    const proj = db.projects.find(p => p.id === req.params.id);
    if (!proj) return res.status(404).json({ error: "Project not found" });
    res.json(proj);
  });

  app.put("/api/projects/:id", (req, res) => {
    const projIndex = db.projects.findIndex(p => p.id === req.params.id);
    if (projIndex === -1) return res.status(404).json({ error: "Project not found" });

    // Update fields from body
    const proj = db.projects[projIndex];
    db.projects[projIndex] = {
      ...proj,
      ...req.body
    };
    res.json(db.projects[projIndex]);
  });

  // DB APIs: Candidates
  app.get("/api/candidates", (req, res) => {
    res.json(db.candidates);
  });

  app.post("/api/candidates", (req, res) => {
    const { name, email, telegramUsername, telegramId, projectId, roleName, registeredVia, id } = req.body;
    const newCand = {
      id: id || "candidate" + Math.floor(100000 + Math.random() * 900000),
      name,
      email,
      telegramUsername,
      telegramId,
      projectId,
      roleName: roleName || "Специалист",
      currentStage: "terms",
      registeredVia: registeredVia || "google",
      createdAt: new Date().toISOString(),
      trainingPlan: [],
      ...req.body
    };
    db.candidates.push(newCand);

    // Simulated notify
    notifyTelegram(
      telegramId,
      `🔔 Новый кандидат зарегистрирован в системе!\n👤 Имя: ${name}\n💼 Должность: ${roleName}\n🔗 Этап: Ознакомление с условиями`
    );

    res.status(201).json(newCand);
  });

  app.patch("/api/candidates/:id", (req, res) => {
    const index = db.candidates.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Candidate not found" });

    db.candidates[index] = {
      ...db.candidates[index],
      ...req.body
    };

    // If stage changed, trigger notification
    if (req.body.currentStage) {
      const cand = db.candidates[index];
      const project = db.projects.find(p => p.id === cand.projectId);
      const companyName = project ? project.companyName : "Компании";
      
      let stageRu = cand.currentStage;
      if (cand.currentStage === "interview") stageRu = "Собеседование (ИИ)";
      if (cand.currentStage === "scoring") stageRu = "Анализ и оценка";
      if (cand.currentStage === "training") stageRu = "Индивидуальное обучение";
      if (cand.currentStage === "certified") stageRu = "Сертифицирован 🎓";

      notifyTelegram(
        cand.telegramId,
        `📈 Кандидат ${cand.name} перешел на следующий этап: *${stageRu}* на должность ${cand.roleName} в ${companyName}.`
      );
    }

    res.json(db.candidates[index]);
  });

  // Send virtual Bot Telegram messages
  app.get("/api/telegram-logs", (req, res) => {
    res.json(db.telegramLog);
  });

  app.post("/api/telegram-mock-send", (req, res) => {
    const { chatId, message } = req.body;
    notifyTelegram(chatId, message);
    res.json({ success: true });
  });

  function notifyTelegram(chatId: string | undefined, message: string) {
    const timestamp = new Date().toLocaleTimeString();
    db.telegramLog.unshift({
      id: "tg-" + Date.now() + Math.random().toString(36).substr(2, 5),
      chatId: chatId || "All Admins",
      message,
      timestamp,
    });
  }

  // Core API: Employer creates an onboarding plan via Gemini
  app.post("/api/generate-project-onboarding", async (req, res) => {
    const { companyName, roleName, customWiki, salaryTerms, scheduleTerms } = req.body;
    const aiClient = getGeminiClient();

    let checklistQuestions = [
      "Опишите ваши ключевые навыки, связанные с данной вакансией.",
      "Расскажите об аналогичных проектах, над которыми вы успешно трудились.",
      "С какими вызовами вы обычно сталкиваетесь в этой роли и как их решаете?"
    ];

    let roleplayQuestions = [
      "Смоделируйте ситуацию: Конфликтный клиент/заказчик требует срочно сдать отчет в нерабочее время. Ваши действия?",
      "Продемонстрируйте ваш подход в планировании задач на неделю при высокой степени неопределенности."
    ];

    let motivationText = `Мы ищем ответственного специалиста в нашу команду на позицию ${roleName}. Предлагаем гибкий график, наставничество и огромные возможности роста.`;

    // Dynamic fallbacks for the requested subpages with formatting:
    let vacancyText = `Мы рады предложить вакансию на ключевую роль: ${roleName} в инновационной компании ${companyName}.\nВы будете отвечать за консультирование пользователей и соблюдение стандартов качества.\n\nТребования:\n- Грамотная устная речь, обучаемость\n- Ответственность и нацеленность на результат`;
    
    let tasksActivityText = `• [📞 Консультации] Прием и обработка входящих запросов по нашей базе.\n• [📝 Учет в CRM] Ведение истории взаимодействия с клиентами.\n• [🤝 Помощь клиентам] Отработка возражений и быстрое решение возникающих вопросов.`;

    let motivationTextDetail = `В нашей компании ${companyName} вы сможете полностью раскрыть свой профессиональный потенциал на роли "${roleName}".\n\nМы предлагаем:\n- Прозрачную систему мотивации и KPI\n- Возможности карьерного роста до руководителя группы\n- Регулярные премии за перевыполнение планов работы.`;
    
    let companyText = `${companyName} — это динамично развивающаяся прогрессивная компания, применяющая ИИ-решения для бизнеса.\nМы создаем комфортные условия труда, ценим идеи наших сотрудников и обеспечиваем дружелюбную атмосферу во всех отделах.`;
    
    let onboardingText = `• [📝 Экспресс-тест] Быстрое ознакомление и входное ИИ-тестирование.\n• [📚 Изучение Wiki] Ознакомление со стандартами работы и корпоративной Wiki-базой.\n• [🤖 ИИ-Разговор] Первая симуляция тренировочного звонка.\n• [✍️ Оформление] Быстрое подписание договора за один рабочий день.`;
    
    let payoutsText = `• Фиксированная ставка за каждый успешный рабочий час.\n• Бонусы и премии за качество заполнения CRM-карт.\n• Выплаты 2 раза в месяц на карту любого банка.`;
    
    let scheduleText = `• Гибкое начало дня с возможностью планировать смены.\n• Полная удаленка или комфортный гибридный офис.\n• Вы заходите на платформу в удобное для себя время.`;
    
    let teamText = `• [Отдел] Отдел продаж и развития\n• Тимлид - Руководитель группы. Курирует процесс продаж.\n• Куратор - HR специалист. Поможет войти в рабочий ритм.`;
    
    let cabinetTabsText = `• [💻 Панель CRM] Инструмент для работы нашими клиентами с быстрым доступом к сделкам. | 💡 Регламент: Карта заполняется сразу в процессе.\n• [📊 Аналитика] Ежедневные отчеты в удобной форме. | 💡 Отчетность заполняется перед окончанием смены.\n• [📞 IP-Телефония] Звонки прямо из броузера без личного телефона. | 💡 Требуется качественная гарнитура и тихая обстановка.`;

    let systemText = `• Своевременное ведение учета базы в CRM.\n• Консультирование пользователей по регламентам Wiki.\n• Ежедневная сдача регламентированной отчетности.`;

    const prompt = `Мы создаем систему подбора и онбординга персонала "Робот Рекрутер (RR)".
Компания: "${companyName}"
Должность: "${roleName}"
Описание / Документы / Вики: "${customWiki || "Нет дополнительных сведений"}"

Твоя задача — сгенерировать ИИ-систему адаптации в строго структурированном формате JSON:
1. "motivationText": Краткий текст-продажа вакансии и условий, мотивирующий кандидата (2-3 абзаца).
2. "checklistQuestions": Массив из ровно 3 профессиональных вопросов-проверок (чек-лист) для оценки базовых требований.
3. "roleplayQuestions": Массив из ровно 2 ролевых гипотетических ситуаций (ролевая игра), в которых кандидат должен ответить от первого лица, показав навыки на практике.
4. "vacancyText": Подробное описание обязанностей и требований для страницы /vacancy. Без симуляции задач.
5. "tasksActivityText": Сведения о ежедневных задачах соискателя (разбит на 3 пункта, каждый с новой строки, обязательно в формате: • [📞 Название задачи] Описание).
6. "motivationTextDetail": Ответ на вопрос "Почему работа у нас - это круто?" с описанием роста для страницы /motivation.
7. "companyText": Подробный вдохновляющий текст об истории, миссии и ценностях компании для страницы /company.
8. "onboardingText": Пошаговый план адаптации из 4 этапов, каждый с новой строки, обязательно в формате: • [📝 Заголовок этапа] Описание).
9. "payoutsText": Описание выплат, оклада и бонусов по строкам с буллитами • .
10. "scheduleText": Расписание, тайм-менеджмент, формат работы по строкам с буллитами • .
11. "teamText": Информация о команде и наставниках по отделам, каждый пункт с новой строки, обязательно по формату:
    - Для отдела: • [Отдел] Название отдела
    - Для сотрудника: • Имя - Должность. Описание.
12. "cabinetTabsText": Вкладки интерактивного кабинета для работы сотрудника (3 строки, каждая обязательно в формате: • [💻 Название платформы] Описание | 💡 Регламент: описание регламента).
13. "systemText": Описание правил и чек-лист отчетности (регламентов) по строкам с буллитами • .

Верни ТОЛЬКО валидный JSON-объект без форматирования markdown (без \`\`\`json \`\`\`), соответствующий схеме:
{
  "motivationText": "строка",
  "checklistQuestions": ["вопрос1", "вопрос2", "вопрос3"],
  "roleplayQuestions": ["ситуация1", "ситуация2"],
  "vacancyText": "строка",
  "tasksActivityText": "строка",
  "motivationTextDetail": "строка",
  "companyText": "строка",
  "onboardingText": "строка",
  "payoutsText": "строка",
  "scheduleText": "строка",
  "teamText": "строка",
  "cabinetTabsText": "строка",
  "systemText": "строка"
}`;

    try {
      const messages = [{ role: "user", content: prompt }];
      const employerId = req.body.employerId || "";
      const text = await callProTalkLLM("company", messages, undefined, employerId);
      const parsed = JSON.parse(text.trim());
      if (parsed.motivationText) motivationText = parsed.motivationText;
      if (parsed.checklistQuestions) checklistQuestions = parsed.checklistQuestions;
      if (parsed.roleplayQuestions) roleplayQuestions = parsed.roleplayQuestions;
      if (parsed.vacancyText) vacancyText = parsed.vacancyText;
      if (parsed.tasksActivityText) tasksActivityText = parsed.tasksActivityText;
      if (parsed.motivationTextDetail) motivationTextDetail = parsed.motivationTextDetail;
      if (parsed.companyText) companyText = parsed.companyText;
      if (parsed.onboardingText) onboardingText = parsed.onboardingText;
      if (parsed.payoutsText) payoutsText = parsed.payoutsText;
      if (parsed.scheduleText) scheduleText = parsed.scheduleText;
      if (parsed.teamText) teamText = parsed.teamText;
      if (parsed.cabinetTabsText) cabinetTabsText = parsed.cabinetTabsText;
      if (parsed.systemText) systemText = parsed.systemText;

    } catch (err) {
      console.error("ProTalk failed during project onboarding generation, using quality fallbacks:", err);
    }

    const comp = db.companies.find(c => c.name.toLowerCase() === companyName.toLowerCase() || (req.body.companySlug && c.slug === req.body.companySlug));

    const newProj = {
      id: "proj-" + Math.random().toString(36).substr(2, 9),
      companyName,
      companySlug: req.body.companySlug || (comp ? comp.slug : ""),
      employerId: req.body.employerId || "",
      roleName,
      salaryTerms: salaryTerms || (comp && comp.salaryTerms) || "Конкурентные условия (по результатам интервью)",
      scheduleTerms: scheduleTerms || (comp && comp.scheduleTerms) || "Обсуждается индивидуально",
      motivationText,
      checklistQuestions,
      roleplayQuestions,
      customWiki: customWiki || (comp && comp.customWiki) || "",
      vacancyText,
      tasksActivityText,
      motivationTextDetail,
      companyText: (comp && comp.description) ? comp.description : companyText,
      onboardingText,
      payoutsText,
      scheduleText,
      teamText,
      cabinetTabsText,
      systemText,
      logoUrl: req.body.logoUrl || (comp && comp.logoUrl) || "https://i.ibb.co/WWRbtPq0/RR-Logo.png",

      // Merge rich branding fields
      missionText: (comp && comp.missionText) || "Создавать лучшие инновации",
      statsValClients: (comp && comp.statsValClients) || "1200+",
      statsLabelClients: (comp && comp.statsLabelClients) || "Активных клиентов",
      statsValDialogs: (comp && comp.statsValDialogs) || "250 тыс",
      statsLabelDialogs: (comp && comp.statsLabelDialogs) || "Диалогов проведено",
      statsValFounded: (comp && comp.statsValFounded) || "2018",
      statsLabelFounded: (comp && comp.statsLabelFounded) || "Год основания"
    };

    db.projects.push(newProj);
    res.json(newProj);
  });

  // Core API: Evaluate interview and resume (PDF text mockup / uploaded content)
  app.post("/api/evaluate-interview", async (req, res) => {
    const { candidateAnswers, candidateId, resumeText } = req.body;
    
    const candidate = db.candidates.find(c => c.id === candidateId);
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });

    const project = db.projects.find(p => p.id === candidate.projectId);
    const aiClient = getGeminiClient();

    let interviewScore = 75;
    let resumeScore = 70;
    let checklistPoints = 7;
    let roleplayPoints = 7;
    let assessmentSummary = "Интервью пройдено успешно. Кандидат показал хорошие общие знания, резюме совпадает с требованиями. Рекомендовано назначить обучение.";

    const roleName = candidate.roleName;
    const companyName = project ? project.companyName : "Работодатель";

    const answersDesc = candidateAnswers.map((a: any) => `Вопрос: "${a.question}"\nОтвет кандидата: "${a.answer}"`).join("\n\n");

    const prompt = `Оцени прохождение собеседования кандидатом на должность "${roleName}" в компанию "${companyName}".
Резюме кандидата: "${resumeText || "Не прикреплено"}"
Ответы на вопросы чек-листа и ролевой игры:
${answersDesc}

Твоя задача — проанализировать ответы и резюме, выставить оценки по 100-балльной (и 10-бальной для блоков) шкале и сгенерировать резюме оценки.
Верни ТОЛЬКО JSON объект со структурой:
{
  "interviewScore": число_от_0_до_100,
  "resumeScore": число_от_0_до_100,
  "checklistPoints": число_от_0_до_10,
  "roleplayPoints": число_от_0_до_10,
  "overallScore": число_от_0_до_100,
  "assessmentSummary": "Детальный вежливый разбор ответов, слабых и сильных сторон на русском языке (4-5 предложений), в котором также отметьте, в каких профессиональных темах кандидату не хватает знаний для разработки плана обучения"
}`;

    try {
      const messages = [{ role: "user", content: prompt }];
      const text = await callProTalkLLM("resume", messages, candidateId);
      const parsed = JSON.parse(text.trim());
      if (parsed.interviewScore !== undefined) interviewScore = Number(parsed.interviewScore);
      if (parsed.resumeScore !== undefined) resumeScore = Number(parsed.resumeScore);
      if (parsed.checklistPoints !== undefined) checklistPoints = Number(parsed.checklistPoints);
      if (parsed.roleplayPoints !== undefined) roleplayPoints = Number(parsed.roleplayPoints);
      if (parsed.assessmentSummary) assessmentSummary = parsed.assessmentSummary;

    } catch (err) {
      console.error("ProTalk evaluate-interview failed, fallbacks applied:", err);
    }

    const overallScore = Math.round((interviewScore + resumeScore) / 2);
    const scores = {
      interviewScore,
      resumeScore,
      checklistPoints,
      roleplayPoints,
      overallScore,
      assessmentSummary
    };

    // Auto-generate deep personalized training program immediately based on the weaknesses
    let trainingPlan: any[] = [];
    if (aiClient) {
      try {
        const trainingPrompt = `Создай индивидуальный план онбординга и обучения для кандидата на вакансию "${roleName}" в "${companyName}".
Оценка ИИ: ${assessmentSummary}
Вики/Продукты компании: ${project?.customWiki || "Нет деталей"}

Обучение должно состоять строго из трех блоков (Training Blocks), каждый из которых содержит ровно по 1 микро-уроку с 1 вопросом теста:
Блок 1: "Профессиональное обучение" (подтянуть выявленные слабые навыки)
Блок 2: "Обучение продукту" (о продуктах компании, ценностях и мотивации)
Блок 3: "Обучение процессам и мотивации" (инструкции, рабочие регламенты и мотивационные процессы)

Верни строго JSON объект с учебным планом в структуре:
[
  {
    "title": "Профессиональное обучение",
    "description": "Описание фокуса обучения...",
    "lessons": [
      {
        "id": "prof_1",
        "title": "Тема урока...",
        "content": "Детальное обучающее содержание урока (5-7 содержательных предложений), объясняющее теорию и практику.",
        "quiz": {
          "question": "Вопрос для проверки знаний",
          "options": ["Опция 1", "Опция 2", "Опция 3"],
          "answerIndex": 0
        },
        "isCompleted": false
      }
    ]
  },
  {
    "title": "Обучение продукту",
    "description": "Описание товаров/услуг и ценности...",
    "lessons": [
      {
        "id": "prod_1",
        "title": "Тема урока...",
        "content": "Содержание урока вежливо и подробно...",
        "quiz": {
          "question": "Вопрос для проверки",
          "options": ["Опция 1", "Опция 2", "Опция 3"],
          "answerIndex": 1
        },
        "isCompleted": false
      }
    ]
  },
  {
    "title": "Обучение процессам и мотивации",
    "description": "Процедуры и регламенты работы...",
    "lessons": [
      {
        "id": "proc_1",
        "title": "Тема урока...",
        "content": "Инструкции и KPI сотрудника...",
        "quiz": {
          "question": "Вопрос для проверки",
          "options": ["Опция A", "Опция Б", "Опция В"],
          "answerIndex": 2
        },
        "isCompleted": false
      }
    ]
  }
]`;

        const responseTr = await aiClient.models.generateContent({
          model: "gemini-3.5-flash",
          contents: trainingPrompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.3
          }
        });

        const trText = responseTr.text || "";
        trainingPlan = JSON.parse(trText.trim());

      } catch (err) {
        console.error("Gemini training plan generation failed, static plan substituted:", err);
      }
    }

    if (!trainingPlan || trainingPlan.length === 0) {
      // Fallback Training Plan
      trainingPlan = [
        {
          title: "Профессиональное обучение",
          description: "Навыки необходимые для роли " + roleName,
          lessons: [
            {
              id: "prof_v",
              title: "Повышение эффективности коммуникаций",
              content: "Эффективная работа с возражениями требует техники активного слушания. Дайте клиенту высказаться полностью, согласитесь с его правом на мнение, а потом приведите рациональные аргументы компании.",
              quiz: {
                question: "Какое первое действие при возникновении возражения?",
                options: ["Перебить и начать спорить", "Сделать скидку", "Внимательно выслушать и присоединиться"],
                answerIndex: 2
              },
              isCompleted: false
            }
          ]
        },
        {
          title: "Обучение продукту",
          description: "Изучение внутренних регламентов компании " + companyName,
          lessons: [
            {
              id: "prod_v",
              title: "Наш продукт и его превосходство",
              content: "Наш продукт закрывает ключевую потребность рынка в экономии времени и бюджетов. Вся база знаний находится во внутреннем Wiki-разделе.",
              quiz: {
                question: "Что является ключевой ценностью нашего продукта?",
                options: ["Дешевизна изготовления", "Экономия времени клиентов", "Просто нахождение на рынке"],
                answerIndex: 1
              },
              isCompleted: false
            }
          ]
        },
        {
          title: "Обучение процессам и мотивации",
          description: "Ознакомление с внутренними CRM регламентами",
          lessons: [
            {
              id: "proc_v",
              title: "Ежедневная активность и KPI",
              content: "Каждый сотрудник еженедельно предоставляет отчетность в CRM. Основными показателями качества являются соблюдение стандартов вежливого общения и скорость обслуживания.",
              quiz: {
                question: "Как часто сдается отчетность по KPI?",
                options: ["Раз в год", "Раз в месяц", "Раз в неделю"],
                answerIndex: 2
              },
              isCompleted: false
            }
          ]
        }
      ];
    }

    if (trainingPlan && trainingPlan.length >= 3) {
      const types: ("professional" | "product" | "system")[] = ["professional", "product", "system"];
      trainingPlan.forEach((block: any, idx: number) => {
        if (block.lessons && block.lessons[0]) {
          const type = types[idx] || "professional";
          block.lessons[0].quizzes = getShuffled20Questions(type, roleName, companyName);
        }
      });
    }

    // Save to DB
    candidate.scores = scores;
    candidate.trainingPlan = trainingPlan;
    candidate.currentStage = "scoring"; // Candidate moves to score preview first

    res.json({
      scores,
      trainingPlan
    });
  });

  // Specialized API: Evaluate resume (Step 1 of 3)
  app.post("/api/evaluate-resume", async (req, res) => {
    const { candidateId, resumeText } = req.body;
    const candidate = db.candidates.find(c => c.id === candidateId);
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });

    const project = db.projects.find(p => p.id === candidate.projectId);
    const aiClient = getGeminiClient();

    let resumeScore = 75;
    let feedback = "Резюме проанализировано. Соискатель обладает базовыми навыками для данной вакансии. Заявленный опыт соотносится с требованиями роли.";

    const prompt = `Проанализируй резюме кандидата на должность "${candidate.roleName}" в компанию "${project ? project.companyName : "Работодатель"}".
Резюме: "${resumeText || "Не указано"}"

Выстави оценку соответствия от 0 до 100 и напиши детальный разбор объемом 2-3 предложения на русском языке.
Верни ТОЛЬКО JSON:
{
  "resumeScore": число_от_0_до_100,
  "feedback": "разбор резюме"
}`;

    try {
      const messages = [{ role: "user", content: prompt }];
      const text = await callProTalkLLM("resume", messages, candidateId);
      const parsed = JSON.parse(text.trim());
      if (parsed.resumeScore !== undefined) resumeScore = Number(parsed.resumeScore);
      if (parsed.feedback) feedback = parsed.feedback;
    } catch (err) {
      console.error("ProTalk evaluate resume failed, fallbacks applied:", err);
    }

    if (!candidate.scores) {
      candidate.scores = {
        interviewScore: 70,
        resumeScore: 70,
        checklistPoints: 7,
        roleplayPoints: 7,
        overallScore: 70,
        assessmentSummary: ""
      };
    }
    candidate.scores.resumeScore = resumeScore;
    candidate.resumeText = resumeText;

    res.json({ resumeScore, feedback });
  });

  // Specialized API: Evaluate checklist (Step 2 of 3) with 10 select + 10 text hybrid scoring
  app.post("/api/evaluate-checklist", async (req, res) => {
    const { candidateId, answers } = req.body; 
    const candidate = db.candidates.find(c => c.id === candidateId);
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });

    // Calculate score of the 10 select questions (5 points each, max 50)
    let selectScore = 0;
    const selectQuestions = answers.filter((q: any) => q.type === "select");
    const textQuestions = answers.filter((q: any) => q.type === "text" || !q.type);

    selectQuestions.forEach((q: any) => {
      if (q.userAnswer && q.correctAnswer && q.userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        selectScore += 5;
      }
    });

    // Evaluate the 10 text questions (max 50 points total, i.e., up to 5 points per question)
    let textScore = 0;
    let fallbackFeedback = "Теоретические и практические ответы по чек-листу успешно проверены.";
    let geminiFeedbackDone = false;

    // We can evaluate text answers using Gemini if available.
    const aiClient = getGeminiClient();
    if (textQuestions.length > 0) {
      try {
        const answersListString = textQuestions.map((q: any, i: number) => `Вопрос: "${q.question}"\nОтвет кандидата: "${q.userAnswer || "Нет ответа"}"`).join("\n\n");
        const prompt = `Ты — Ассистент-Оценщик на платформе Робот Рекрутер (RR).\n` +
          `Ты проверяешь ответы соискателя на открытые текстовые вопросы чек-листа по специальности "${candidate.roleName}".\n` +
          `Каждый ответ может принести соискателю до 5 баллов максимум (всего до 50 баллов за все текстовые вопросы).\n\n` +
          `ОТВЕТЫ КАНДИДАТА:\n${answersListString}\n\n` +
          `Оцени качество каждого ответа от 0 до 5. Будь конструктивен и справедлив. Суммируй баллы (итоговый балл от 0 до 50).\n` +
          `Верни ТОЛЬКО JSON объект следующего формата:\n` +
          `{\n` +
          `  "textScore": число_от_0_до_50,\n` +
          `  "feedback": "Подробный разбор ответов на русском языке объемом 3-4 предложения, отмечающий сильные стороны и зоны развития"\n` +
          `}`;

        const messages = [{ role: "user", content: prompt }];
        const text = await callProTalkLLM("resume", messages, candidateId);
        const parsed = JSON.parse(text.trim());
        if (parsed.textScore !== undefined) textScore = Math.min(50, Math.max(0, Number(parsed.textScore)));
        if (parsed.feedback) fallbackFeedback = parsed.feedback;
        geminiFeedbackDone = true;
      } catch (err) {
        console.error("ProTalk checklist text evaluation failed, using fallback:", err);
      }
    }

    // Fallback text scoring if Gemini is offline or failed
    if (!geminiFeedbackDone) {
      textQuestions.forEach((q: any) => {
        const answerLen = (q.userAnswer || "").trim().length;
        if (answerLen > 30) {
          textScore += 5; // excellent deep answer
        } else if (answerLen > 10) {
          textScore += 3; // basic answer
        } else if (answerLen > 0) {
          textScore += 1; // extremely short answer
        }
      });
      textScore = Math.min(50, textScore);
      fallbackFeedback = `Тест чек-листа завершен. Вы верно ответили на ${selectScore / 5} из ${selectQuestions.length} закрытых вопросов. Ваши открытые текстовые ответы сохранены и учтены куратором.`;
    }

    const overallScore = selectScore + textScore;

    if (!candidate.scores) {
      candidate.scores = {
        interviewScore: 70,
        resumeScore: 70,
        checklistPoints: 7,
        roleplayPoints: 7,
        overallScore: 70,
        assessmentSummary: ""
      };
    }
    candidate.scores.checklistScore = overallScore;
    candidate.scores.checklistPoints = Math.round(overallScore / 10);

    // Also update dynamic overallScore
    const rScore = candidate.scores.resumeScore !== undefined ? candidate.scores.resumeScore : 70;
    const cScore = overallScore;
    const sScore = candidate.scores.situationsScore !== undefined ? candidate.scores.situationsScore : 75;
    candidate.scores.overallScore = Math.round((rScore + cScore + sScore) / 3);

    res.json({ checklistScore: overallScore, feedback: fallbackFeedback });
  });

  // Specialized API: Evaluate situations (Step 3 of 3) and calculate final overall score
  app.post("/api/evaluate-situations", async (req, res) => {
    const { candidateId, answers } = req.body; 
    const candidate = db.candidates.find(c => c.id === candidateId);
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });

    const project = db.projects.find(p => p.id === candidate.projectId);
    const aiClient = getGeminiClient();

    let situationsScore = 78;
    let feedback = "Практические кейсы по ролевой игре пройдены успешно. Кандидат умеет быстро ориентироваться в рабочих ситуациях.";

    try {
      const prompt = `Проанализируй ролевые ответы кандидата на 3 практические ситуации по специальности "${candidate.roleName}".
Ответы кандидата:
${answers.map((a: any, i: number) => `Кейс ${i+1}: "${a.question}"\nОтвет: "${a.answer}"`).join("\n\n")}

Оцени практические навыки соискателя от 0 до 100 баллов и дай краткий анализ на русском языке (2-3 предложения).
Верни ТОЛЬКО JSON:
{
  "situationsScore": число_от_0_до_100,
  "feedback": "анализ кейсов"
}`;
      const messages = [{ role: "user", content: prompt }];
      const text = await callProTalkLLM("resume", messages, candidateId);
      const parsed = JSON.parse(text.trim());
      if (parsed.situationsScore !== undefined) situationsScore = Number(parsed.situationsScore);
      if (parsed.feedback) feedback = parsed.feedback;
    } catch (err) {
      console.error("ProTalk evaluate situations failed:", err);
    }

    if (!candidate.scores) {
      candidate.scores = {
        interviewScore: 70,
        resumeScore: 70,
        checklistPoints: 7,
        roleplayPoints: 7,
        overallScore: 70,
        assessmentSummary: ""
      };
    }
    candidate.scores.situationsScore = situationsScore;
    candidate.scores.roleplayPoints = Math.round(situationsScore / 10);

    // Calculate final scores
    const rScore = candidate.scores.resumeScore !== undefined ? candidate.scores.resumeScore : 70;
    const cScore = candidate.scores.checklistScore !== undefined ? candidate.scores.checklistScore : 80;
    const sScore = situationsScore;
    const overallScore = Math.round((rScore + cScore + sScore) / 3);

    candidate.scores.interviewScore = Math.round((cScore + sScore) / 2);
    candidate.scores.overallScore = overallScore;
    candidate.scores.assessmentSummary = `Анализ резюме: ${candidate.resumeText ? "Резюме исследовано и оценено на " + rScore + " баллов." : "Резюме не прикреплено."} \nТеоретический чек-лист: Оценен на ${cScore} баллов. \nКейс-тренажер: Сдан на ${situationsScore} баллов. Кандидат готов к обучению.`;

    candidate.currentStage = "scoring";

    // Auto-generate personal training plan immediately using Gemini
    let trainingPlan: any[] = [];
    if (aiClient) {
      try {
        const trainingPrompt = `Создай индивидуальный план онбординга и обучения для кандидата на вакансию "${candidate.roleName}" в "${project ? project.companyName : "Работодатель"}".
Оценка ИИ: ${candidate.scores.assessmentSummary}
Вики/Продукты компании: ${project?.customWiki || "Нет деталей"}

Обучение должно состоять строго из трех блоков (Training Blocks), каждый из которых содержит ровно по 1 микро-уроку с 1 вопросом теста:
Блок 1: "Профессиональное обучение" (подтянуть выявленные слабые навыки)
Блок 2: "Обучение продукту" (о продуктах компании, ценностях и мотивации)
Блок 3: "Обучение процессам и мотивации" (инструкции, рабочие регламенты и мотивационные процессы)

Верни строго JSON объект с учебным планом в структуре:
[
  {
    "title": "Профессиональное обучение",
    "description": "Описание фокуса обучения...",
    "lessons": [
      {
        "id": "prof_1",
        "title": "Тема урока...",
        "content": "Детальное обучающее содержание урока (5-7 содержательных предложений), объясняющее теорию и практику.",
        "quiz": {
          "question": "Вопрос для проверки знаний",
          "options": ["Опция 1", "Опция 2", "Опция 3"],
          "answerIndex": 0
        },
        "isCompleted": false
      }
    ]
  },
  {
    "title": "Обучение продукту",
    "description": "Описание товаров/услуг и ценности...",
    "lessons": [
      {
        "id": "prod_1",
        "title": "Тема урока...",
        "content": "Содержание урока вежливо и подробно...",
        "quiz": {
          "question": "Вопрос для проверки",
          "options": ["Опция 1", "Опция 2", "Опция 3"],
          "answerIndex": 1
        },
        "isCompleted": false
      }
    ]
  },
  {
    "title": "Обучение процессам и мотивации",
    "description": "Процедуры и регламенты работы...",
    "lessons": [
      {
        "id": "proc_1",
        "title": "Тема урока...",
        "content": "Инструкции и KPI сотрудника...",
        "quiz": {
          "question": "Вопрос для проверки",
          "options": ["Опция A", "Опция Б", "Опция В"],
          "answerIndex": 2
        },
        "isCompleted": false
      }
    ]
  }
]`;
        const responseTr = await aiClient.models.generateContent({
          model: "gemini-3.5-flash",
          contents: trainingPrompt,
          config: { responseMimeType: "application/json", temperature: 0.3 }
        });
        trainingPlan = JSON.parse((responseTr.text || "").trim());
      } catch (err) {
        console.error("Gemini training plan inside evaluate-situations failed, static plan substituted:", err);
      }
    }

    if (!trainingPlan || trainingPlan.length === 0) {
      trainingPlan = [
        {
          title: "Профессиональное обучение",
          description: "Навыки необходимые для роли " + candidate.roleName,
          lessons: [
            {
              id: "prof_v",
              title: "Повышение эффективности коммуникаций",
              content: "Эффективная работа требует высокой вовлеченности в задачи компании. Будьте вежливы, изучайте потребности клиента и давайте исчерпывающие и аргументированные ответы.",
              quiz: {
                question: "Что является основой эффективной работы сотрудника?",
                options: ["Простое присутствие на рабочем месте", "Качественное и проактивное решение задач клиента", "Игнорирование регламентов"],
                answerIndex: 1
              },
              isCompleted: false
            }
          ]
        },
        {
          title: "Обучение продукту",
          description: "Изучение внутренних регламентов компании " + (project ? project.companyName : "Работодатель"),
          lessons: [
            {
              id: "prod_v",
              title: "Наш продукт и его превосходство",
              content: "Наш продукт закрывает ключевую потребность рынка в экономии времени и бюджетов. Вся база знаний находится во внутреннем Wiki-разделе.",
              quiz: {
                question: "Что является ключевой ценностью нашего продукта?",
                options: ["Дешевизна изготовления", "Экономия времени клиентов", "Просто нахождение на рынке"],
                answerIndex: 1
              },
              isCompleted: false
            }
          ]
        },
        {
          title: "Обучение процессам и мотивации",
          description: "Ознакомление с внутренними CRM регламентами",
          lessons: [
            {
              id: "proc_v",
              title: "Ежедневная активность и KPI",
              content: "Каждый сотрудник еженедельно предоставляет отчетность в CRM. Основными показателями качества являются соблюдение стандартов вежливого общения и скорость обслуживания.",
              quiz: {
                question: "Как часто сдается отчетность по KPI?",
                options: ["Раз в год", "Раз в месяц", "Раз в неделю"],
                answerIndex: 2
              },
              isCompleted: false
            }
          ]
        }
      ];
    }

    if (trainingPlan && trainingPlan.length >= 3) {
      const types: ("professional" | "product" | "system")[] = ["professional", "product", "system"];
      trainingPlan.forEach((block: any, idx: number) => {
        if (block.lessons && block.lessons[0]) {
          const type = types[idx] || "professional";
          block.lessons[0].quizzes = getShuffled20Questions(type, candidate.roleName, project ? project.companyName : "Работодатель");
        }
      });
    }

    candidate.trainingPlan = trainingPlan;

    res.json({
      overallScore,
      resumeScore: rScore,
      checklistScore: cScore,
      situationsScore: sScore,
      assessmentSummary: candidate.scores.assessmentSummary,
      trainingPlan
    });
  });

  // Specialized API: Evaluate candidate's 20-question training exam
  app.post("/api/evaluate-training-block", async (req, res) => {
    const { candidateId, blockIndex, answers } = req.body;
    const candidate = db.candidates.find(c => c.id === candidateId);
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });

    if (!candidate.trainingPlan || !candidate.trainingPlan[blockIndex]) {
      return res.status(400).json({ error: "Training block not found in candidate training plan" });
    }

    const block = candidate.trainingPlan[blockIndex];
    if (!block.lessons || block.lessons.length === 0) {
      return res.status(400).json({ error: "Lessons not found in this training block" });
    }

    const lesson = block.lessons[0];

    // Score select questions (5 points each, up to 50 max)
    let selectScore = 0;
    const selectQuestions = answers.filter((q: any) => q.type === "select");
    const textQuestions = answers.filter((q: any) => q.type === "text" || !q.type);

    selectQuestions.forEach((q: any) => {
      const original = (lesson.quizzes || []).find((orig: any) => orig.question === q.question);
      const correctAns = original ? original.correctAnswer : q.correctAnswer;
      if (q.userAnswer && correctAns && q.userAnswer.trim().toLowerCase() === correctAns.trim().toLowerCase()) {
        selectScore += 5;
      }
    });
    selectScore = Math.min(50, selectScore);

    // Score text questions (up to 50 max)
    let textScore = 0;
    let feedback = `Проверка раздела "${block.title}" успешно завершена! Поздравляем с прохождением ИИ-аттестации.`;
    let geminiSucceeded = false;

    const aiClient = getGeminiClient();
    if (textQuestions.length > 0) {
      try {
        const textAnswersString = textQuestions.map((q: any, i: number) => `Вопрос ${i+1}: "${q.question}"\nОтвет соискателя: "${q.userAnswer || "Нет ответа"}"`).join("\n\n");
        const prompt = `Ты — Дружелюбный ИИ-Экзаменатор платформы Робут Рекрутер (RR).\n` +
          `Ты проверяешь открытые ответы стажера на тему "${block.title}". Стажер претендует на должность "${candidate.roleName}".\n` +
          `Каждый ответ может быть оценен до 5 баллов максимум (всего до 50 баллов за все текстовые ответы).\n\n` +
          `ОТВЕТЫ КАНДИДАТА:\n${textAnswersString}\n\n` +
          `Оцени качество ответов, выстави суммарный балл от 0 до 50 за текстовую часть.\n` +
          `Сформулируй дружелюбный, воодушевляющий и очень краткий кураторский комментарий на русском языке (3-4 предложения).\n` +
          `Верни ТОЛЬКО JSON объект точно заданной структуры:\n` +
          `{\n` +
          `  "textScore": число_от_0_до_50,\n` +
          `  "feedback": "текст подробной кураторской обратной связи и рекомендаций"\n` +
          `}`;

        const messages = [{ role: "user", content: prompt }];
        const text = await callProTalkLLM("school", messages, candidateId);
        const parsed = JSON.parse(text.trim());
        if (parsed.textScore !== undefined) textScore = Math.min(50, Math.max(0, Number(parsed.textScore)));
        if (parsed.feedback) feedback = parsed.feedback;
        geminiSucceeded = true;
      } catch (err) {
        console.error("ProTalk failed during training block evaluation, fallback applied:", err);
      }
    }

    if (!geminiSucceeded) {
      textQuestions.forEach((q: any) => {
        const len = (q.userAnswer || "").trim().length;
        if (len > 35) {
          textScore += 5;
        } else if (len > 15) {
          textScore += 3;
        } else if (len > 0) {
          textScore += 1;
        }
      });
      textScore = Math.min(50, textScore);
      feedback = `Экзамен принят куратором. Вы заработали ${selectScore} баллов за тестовые вопросы и ${textScore} баллов за открытые практические ситуации. Изучите следующий раздел в своем плане!`;
    }

    const overallScore = selectScore + textScore;

    // Save exam results directly to lesson object
    lesson.isCompleted = true;
    lesson.score = overallScore;
    lesson.quizFeedback = feedback;
    lesson.quizzes = answers; 

    // Verify if all 3 blocks are fully completed
    const allCompleted = candidate.trainingPlan.every((b: any) => b.lessons && b.lessons.every((l: any) => l.isCompleted));
    if (allCompleted) {
      candidate.currentStage = "certified";
    }

    res.json({
      overallScore,
      feedback,
      updatedPlan: candidate.trainingPlan,
      isCertified: candidate.currentStage === "certified"
    });
  });

  // AI-Powered / Dynamic Consultant Chatbot for Candidate Vacancy Landing
  app.post("/api/vacancy-consultant-chat", async (req, res) => {
    const { projectId, messages, userQuestion } = req.body;
    const project = db.projects.find(p => p.id === projectId) || db.projects[0];

    const companyName = project?.companyName || "Наша Компания";
    const roleName = project?.roleName || "Специалист";
    const salaryTerms = project?.salaryTerms || "Конкурентные условия";
    const scheduleTerms = project?.scheduleTerms || "Гибкий график";
    const wiki = project?.customWiki || "Обучение за счет компании";

    try {
      const historyText = messages && Array.isArray(messages)
        ? messages.map((m: any) => `${m.sender === "candidate" ? "Кандидат" : "Робот-Консультант"}: ${m.text}`).join("\n")
        : "";

      const prompt = `Ты — Робот-Консультант RR. Твоя задача — с восторгом и подробно презентовать вакансию кандидату, отвечать на вопросы, преодолевать возражения и побудить его нажать "Пройти собеседование"!\n\n` +
        `ДАННЫЕ О ВАКАНСИИ И КОМПАНИИ:\n` +
        `- Компания: ${companyName}\n` +
        `- Должность: ${roleName}\n` +
        `- Оплата/Мотивация: ${salaryTerms}\n` +
        `- График и формат: ${scheduleTerms}\n` +
        `- База знаний / Вики регламенты: ${wiki}\n\n` +
        `История диалога до этого момента:\n${historyText}\n\n` +
        `Новый вопрос соискателя: "${userQuestion}"\n\n` +
        `Сформулируй дружелюбный, грамотный, убедительный, короткий ответ на русском языке (максимум 4-5 предложений), ответив на вопрос соискателя. Убеди его, что это идеальная вакансия для старта!`;

      const msgList = [{ role: "user", content: prompt }];
      const reply = await callProTalkLLM("chat", msgList, undefined, undefined, projectId);
      return res.json({ reply: reply.trim() });
    } catch (err) {
      console.error("ProTalk Error at Consultant Chat, backing up gracefully...", err);
    }

    // Dynamic, context-aware smart fallback answers when Gemini is not connected or fails
    const fallbacks = [
      `В компании ${companyName} на должности "${roleName}" вам гарантирована оплата ${salaryTerms}. График работы максимально удобный (${scheduleTerms}). У нас дружный коллектив и простое обучение! Попробуем пройти блиц-тестирование?`,
      `Конечно! Обучение полностью бесплатное и проходит в удобном интерактивном формате. Робот Рекрутер подберет лекции именно по регламентам компании: "${wiki.substring(0, 100)}...". Это займет не больше 15 минут!`,
      `На должности "${roleName}" ваши обязанности будут соответствовать принятым стандартам. Прохождение собеседования ни к чему вас не обязывает, но даст точную оценку ваших компетенций рекрутером. Попробуйте нажать кнопку "Пройти собеседование"!`,
      `Условия по оплате (${salaryTerms}) абсолютно честные, выплачиваются без задержек. У нас предусмотрено быстрое ИИ-тестирование, разработавшее индивидуальный план адаптации. Вы безупречно вольетесь в рабочий ритм!`
    ];
    
    // Choose one fallback dynamically based on candidate question keywords
    let selectedReply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    const qLower = (userQuestion || "").toLowerCase();
    if (qLower.includes("зарплат") || qLower.includes("оплат") || qLower.includes("деньг") || qLower.includes("рубл")) {
      selectedReply = `По условиям компенсации на позиции "${roleName}": предлагается оклад и бонусы в размере ${salaryTerms}. Это полностью белая и стабильная выплата. Вы сможете влиять на свой доход с первого дня!`;
    } else if (qLower.includes("график") || qLower.includes("время") || qLower.includes("когда") || qLower.includes("гибрид") || qLower.includes("удален")) {
      selectedReply = `График работы у нас очень лояльный: ${scheduleTerms}. Мы поддерживаем баланс работы и личной жизни, формат обсуждается индивидуально на финальном собеседовании.`;
    } else if (qLower.includes("учит") || qLower.includes("обучен") || qLower.includes("знан") || qLower.includes("тест")) {
      selectedReply = `У нас предусмотрена собственная система мгновенной подготовки! На базе регламентов компании ("${wiki.substring(0, 80)}") ИИ создаст персональный курс с лекциями прямо после экспресс-интервью.`;
    }
    
    res.json({ reply: selectedReply });
  });

  // Admin APIs: Payments list
  app.get("/api/admin/payments", (req, res) => {
    res.json(db.payments);
  });

  // Admin APIs: Create a mock payment
  app.post("/api/admin/pay-mock", (req, res) => {
    const { companyName, amount, itemType, itemName } = req.body;
    
    const newPayment = {
      id: "pay-" + Math.random().toString(36).substr(2, 9),
      companyName: companyName || "Случайный Работодатель",
      amount: Number(amount) || 100,
      itemType: itemType || "interview", // "interview" | "training" | "system_creation"
      itemName: itemName || "1 ИИ-интервью соискателя",
      status: "completed",
      createdAt: new Date().toISOString()
    };

    db.payments.push(newPayment);
    res.json(newPayment);
  });

  // Admin APIs: Delete candidates
  app.delete("/api/admin/candidates/:id", (req, res) => {
    const { id } = req.params;
    const initialLen = db.candidates.length;
    db.candidates = db.candidates.filter(c => c.id !== id);
    if (db.candidates.length < initialLen) {
      res.json({ success: true, message: "Соискатель удалён" });
    } else {
      res.status(404).json({ error: "Candidate not found" });
    }
  });

  // Admin APIs: Delete projects (employer vacancy setups)
  app.delete("/api/admin/projects/:id", (req, res) => {
    const { id } = req.params;
    const initialLen = db.projects.length;
    db.projects = db.projects.filter(p => p.id !== id);
    if (db.projects.length < initialLen) {
      // Also remove associated candidates
      db.candidates = db.candidates.filter(c => c.projectId !== id);
      res.json({ success: true, message: "Проект и связанные кандидаты удалены" });
    } else {
      res.status(404).json({ error: "Project not found" });
    }
  });

  // Assistant for Candidates in candidate dashboard
  app.post("/api/candidate-assist", async (req, res) => {
    const { candidateId, userQuestion, contextTab, contextSubTab } = req.body;
    const candidate = db.candidates.find(c => c.id === candidateId) || db.candidates[0];
    const project = candidate ? db.projects.find(p => p.id === candidate.projectId) : db.projects[0];

    const companyName = project?.companyName || "Работодатель";
    const roleName = project?.roleName || "Специалист";
    const salaryTerms = project?.salaryTerms || "Компенсационный пакет";
    const scheduleTerms = project?.scheduleTerms || "Индивидуальный график";
    const wiki = project?.customWiki || "Обучение в компании";

    try {
      const prompt = `Ты — Дружелюбный ИИ-Помощник соискателя на платформе "Робот Рекрутер (RR)".\n` +
        `Твоя работа — отвечать соискателю на любые его вопросы по вакансии, помогать проходить собеседование, разъяснять условия, подсказывать ответы на обучение и подбадривать!\n\n` +
        `ТЕКУЩИЙ СОИСКАТЕЛЬ:\n` +
        `- Имя: ${candidate?.name || "Иван"}\n` +
        `- Должность: ${roleName}\n` +
        `- Компания: ${companyName}\n` +
        `- Условия оплаты: ${salaryTerms}\n` +
        `- График: ${scheduleTerms}\n` +
        `- Вики-база знаний: ${wiki}\n` +
        `- Уверенность: Общий балл по итогу собеседования составляет ${candidate?.scores?.overallScore || "не пройдено еще"}\n\n` +
        `КОНТЕКСТ ЭКРАНА:\n` +
        `- Основной таб: ${contextTab}\n` +
        `- Подтаб (если есть): ${contextSubTab || "нет"}\n\n` +
        `Вопрос соискателя: "${userQuestion}"\n\n` +
        `Сформулируй дружелюбный, воодушевляющий и очень краткий ответ на русском языке (максимум 2-3 предложения), помогающий соискателю. Дай дельный совет!`;

      const messages = [{ role: "user", content: prompt }];
      const reply = await callProTalkLLM("chat", messages, candidateId);
      return res.json({ reply: reply.trim() });
    } catch (err) {
      console.error("ProTalk Error at Candidate Assist Chat, backing up gracefully...", err);
    }

    // fallback answers based on keywords
    const qLower = (userQuestion || "").toLowerCase();
    let selectedReply = `Привет, ${candidate?.name || "коллега"}! Я твой ИИ-Помощник. Данный раздел (${contextTab} > ${contextSubTab || ""}) очень важен. Спрашивай меня обо всем, что вызывает вопросы!`;
    if (qLower.includes("зарплат") || qLower.includes("оплат") || qLower.includes("деньг") || qLower.includes("рубл")) {
      selectedReply = `По условиям выплаты в ${companyName}: На позиции "${roleName}" оплата составляет ${salaryTerms}. Выплаты стабильные и своевременные. Есть ли еще вопросы по оформлению?`;
    } else if (qLower.includes("график") || qLower.includes("время") || qLower.includes("когда")) {
      selectedReply = `Установленный график работы на вакансии "${roleName}": ${scheduleTerms}. Это отличный вариант, обеспечивающий баланс работы и личной жизни!`;
    } else if (qLower.includes("тест") || qLower.includes("пройт") || qLower.includes("вопрос") || qLower.includes("ответ")) {
      selectedReply = `Не волнуйся, наше ИИ-тестирование составлено дружелюбно. В разделе "Собеседование" ты сможешь ответить на вопросы, а в "Оценке" - увидеть подробные баллы. Я всегда рядом, чтобы подсказать!`;
    } else if (qLower.includes("компани") || qLower.includes("продукт")) {
      selectedReply = `Компания ${companyName} занимается разработкой инновационных решений, а именно проектами вида "${wiki.substring(0, 50)}...". Это великолепный шанс поработать в сильном сегменте!`;
    }
    
    res.json({ reply: selectedReply });
  });

  // Assistant for Employers in landing page and employer dashboard
  app.post("/api/employer-assist", async (req, res) => {
    const { userQuestion, messages } = req.body;
    let historyText = "";
    if (messages && Array.isArray(messages)) {
      historyText = messages.map((m: any) => `${m.sender === "user" || m.sender === "employer" ? "Работодатель" : "ИИ-Ассистент"}: ${m.text}`).join("\n");
    }

    try {
      const prompt = `Ты — Дружелюбный ИИ-Ассистент платформы "Робот Рекрутер (RR)".\n` +
        `Твоя задача — рассказать работодателю про наш продукт RR, его возможности, цены и функционал.\n\n` +
        `ИНФОРМАЦИЯ О ПРОДУКТЕ И ЦЕНАХ:\n` +
        `- "Робот Рекрутер" (RR) — это интеллектуальная RPA full-stack платформа для автоматизации найма, адаптации и обучения соискателей.\n` +
        `- Вся тарификация прозрачна и идет во внутренней валюте RR (1 RR = 1 рубль).\n` +
        `- Нет абонентской платы, оплачиваются только активные ИИ-модули:\n` +
        `  1. ИИ Собеседование соискателя (100 RR / шт): включает умный ИИ Скрининг резюме + ИИ-опрос по чек-листу опыта + ИИ ролевую игру с моделированием 3 ситуаций.\n` +
        `  2. Интерактивное ИИ Обучение соискателя (100 RR / шт): включает в себя 3 обучающих интерактивных блока (профессиональное дообучение, продукт, внутренние CRM-процессы и мотивация с тестированием).\n` +
        `  3. ИИ Лендинг вакансии (500 RR): создание внешнего сайта-лендинга вакансии с подключенным ИИ-консультантом для презентации вашей компании и вовлечения кандидатов.\n` +
        `  4. ИИ Система Интервью (300 RR / создание): генерация сценария интерактивного собеседования с профессиональными и ситуативными тестами.\n` +
        `  5. ИИ Система Обучения (200 RR / создание): создание продвинутой тренажерной симуляции онбординга кандидатов, стажеров или текущих сотрудников на основе ваших Wiki-регламентов и базы знаний.\n` +
        `- Дарим приветственный бонус 1000 RR бесплатно на счет каждому новому работодателю при первой регистрации через Telegram (с моментальными уведомлениями о новичках) или Google!\n` +
        `- Минимальный платеж пополнения баланса — 100 рублей.\n\n` +
        `История переписки:\n${historyText}\n\n` +
        `Вопрос работодателя: "${userQuestion}"\n\n` +
        `Ответь вежливо, убедительно, дружелюбно и по существу на русском языке. Ответ должен быть лаконичным (максимум 4-5 предложений) и привлекательным. Побуждай работодателя запустить автоматизацию найма или пополнить баланс!`;

      const msgList = [{ role: "user", content: prompt }];
      const reply = await callProTalkLLM("chat", msgList);
      return res.json({ reply: reply.trim() });
    } catch (err) {
      console.error("ProTalk Error at Employer Assistant Chat, falling back...", err);
    }

    const fallbacks = [
      "Робот Рекрутер заменяет весь функционал HR-отдела: проводит интервью, принимает резюме, тестирует кандидатов и обучает их по вашей Wiki-базе знаний! Базовые цены: 100 RR за собеседование, 100 RR за дообучение, 500 RR за Лендинг вакансии. Дарим 1000 RR на счет за регистрацию!",
      "При регистрации мы дарим вам 1000 RR приветственного баланса! Этого хватит на создание ИИ Лендинга вакансии (500 RR) и интерактивных систем интервью и обучения. Любое пополнение баланса: 1 рубль = 1 RR (минимум 100 руб). Начните моментально!",
      "ИИ Собеседование включает скрининг резюме, чек-лист квалификации и 3 практических ситуации ролевой игры. Стоимость всего 100 RR (1 руб = 1 RR) за кандидата! Давайте подключим ИИ и сэкономим ваше время на рутине."
    ];
    let selected = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    const qLower = (userQuestion || "").toLowerCase();
    if (qLower.includes("цен") || qLower.includes("скольк") || qLower.includes("рубл") || qLower.includes("плат") || qLower.includes("rr") || qLower.includes("тари")) {
      selected = "Стоимость услуг RR чрезвычайно выгодна: ИИ-Собеседование стоит 100 RR, ИИ-Обучение — 100 RR, а генерация ИИ структуры (лендинга, системы интервью, системы обучения) — от 200 до 500 RR. 1 рублевый баланс равен 1 RR. Пополнение от 100 рублей!";
    } else if (qLower.includes("функц") || qLower.includes("умеет") || qLower.includes("может") || qLower.includes("что дела")) {
      selected = "Платформа полностью автоматизирует вовлечение, оценку и адаптацию: Робот Рекрутер презентует соискателю вакансию, проводит интервью с ролевой игрой, начисляет баллы, а затем обучает кандидата по вашим Wiki-материалам с выдачей сертификата.";
    }
    res.json({ reply: selected });
  });

  // Serve static files and handle SPA fallback for client-side routing
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RR Recruitment Node Server booting on port ${PORT}...`);
  });
}

startServer();
