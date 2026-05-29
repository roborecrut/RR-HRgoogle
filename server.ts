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
};

// Seed default data for sales manager and product specialist so that the app opens with some active CRM information
db.projects.push({
  id: "sales-prod-1",
  companyName: "ООО 'УльтраДизайн'",
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
  customWiki: "УльтраДизайн поставляет ИИ-инструменты для маркетологов. Главный продукт - конструктор 'PromoAI'."
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
    checklistPoints: 8,
    roleplayPoints: 8,
    overallScore: 80,
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
    const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
    res.json({
      active: hasKey,
      message: hasKey ? "Google Gemini API connected and ready." : "Running in realistic fallback mock mode (API key not configured)."
    });
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

  // DB APIs: Candidates
  app.get("/api/candidates", (req, res) => {
    res.json(db.candidates);
  });

  app.post("/api/candidates", (req, res) => {
    const { name, email, telegramUsername, telegramId, projectId, roleName, registeredVia } = req.body;
    const newCand = {
      id: "cand-" + Math.random().toString(36).substr(2, 9),
      name,
      email,
      telegramUsername,
      telegramId,
      projectId,
      roleName: roleName || "Специалист",
      currentStage: "terms",
      registeredVia: registeredVia || "google",
      createdAt: new Date().toISOString(),
      trainingPlan: []
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

    let motivationText = "Мы ищем ответственного специалиста в нашу команду. Предлагаем гибкий график, наставничество и огромные возможности роста.";

    if (aiClient) {
      try {
        const prompt = `Мы создаем систему подбора и онбординга персонала "Робот Рекрутер (RR)".
Компания: "${companyName}"
Должность: "${roleName}"
Описание / Документы / Вики: "${customWiki || "Нет дополнительных сведений"}"

Твоя задача — сгенерировать ИИ-систему адаптации в строго структурированном формате JSON:
1. "motivationText": Текст-продажа вакансии и условий, мотивирующий кандидата (2-3 абзаца).
2. "checklistQuestions": Массив из ровно 3 профессиональных вопросов-проверок (чек-лист) для оценки базовых требований.
3. "roleplayQuestions": Массив из ровно 2 ролевых гипотетических ситуаций (ролевая игра), в которых кандидат должен ответить от первого лица, показав навыки на практике.

Верни ТОЛЬКО валидный JSON-объект без форматирования markdown (без \`\`\`json \`\`\`), соответствующий схеме:
{
  "motivationText": "строка",
  "checklistQuestions": ["вопрос1", "вопрос2", "вопрос3"],
  "roleplayQuestions": ["ситуация1", "ситуация2"]
}`;

        const response = await aiClient.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.3
          }
        });

        const text = response.text || "";
        const parsed = JSON.parse(text.trim());
        if (parsed.motivationText) motivationText = parsed.motivationText;
        if (parsed.checklistQuestions) checklistQuestions = parsed.checklistQuestions;
        if (parsed.roleplayQuestions) roleplayQuestions = parsed.roleplayQuestions;

      } catch (err) {
        console.error("Gemini failed during project onboarding generation, using quality fallbacks:", err);
      }
    }

    const newProj = {
      id: "proj-" + Math.random().toString(36).substr(2, 9),
      companyName,
      roleName,
      salaryTerms: salaryTerms || "Конкурентные условия (по результатам интервью)",
      scheduleTerms: scheduleTerms || "Обсуждается индивидуально",
      motivationText,
      checklistQuestions,
      roleplayQuestions,
      customWiki: customWiki || ""
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

    if (aiClient) {
      try {
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

        const response = await aiClient.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.2
          }
        });

        const text = response.text || "";
        const parsed = JSON.parse(text.trim());
        if (parsed.interviewScore !== undefined) interviewScore = Number(parsed.interviewScore);
        if (parsed.resumeScore !== undefined) resumeScore = Number(parsed.resumeScore);
        if (parsed.checklistPoints !== undefined) checklistPoints = Number(parsed.checklistPoints);
        if (parsed.roleplayPoints !== undefined) roleplayPoints = Number(parsed.roleplayPoints);
        if (parsed.assessmentSummary) assessmentSummary = parsed.assessmentSummary;

      } catch (err) {
        console.error("Gemini evaluate failed, fallbacks applied:", err);
      }
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

    // Save to DB
    candidate.scores = scores;
    candidate.trainingPlan = trainingPlan;
    candidate.currentStage = "scoring"; // Candidate moves to score preview first

    res.json({
      scores,
      trainingPlan
    });
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
