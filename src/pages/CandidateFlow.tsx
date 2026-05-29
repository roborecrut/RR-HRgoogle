/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "../components/RouterContext";
import Mascot from "../components/Mascot";
import { JobProject, Candidate, Message, TrainingBlock } from "../types";
import {
  FileText,
  Upload,
  Send,
  Loader,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Cpu,
  Bookmark,
  CheckCircle,
  HelpCircle,
  X,
  ExternalLink
} from "lucide-react";

export default function CandidateFlow() {
  const { navigate } = useRouter();

  // Active state ids
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [project, setProject] = useState<JobProject | null>(null);

  // Flow navigation stage index: "terms" | "interview" | "scoring" | "training" | "certified"
  const [currentStage, setCurrentStage] = useState<string>("terms");

  // Load candidate session from localStorage
  const loadSession = async () => {
    const candId = localStorage.getItem("cand_session_id");
    if (!candId) {
      // Create a default session to prevent block
      const fallbackId = "cand-1"; // Seeded Lex Ivanov
      localStorage.setItem("cand_session_id", fallbackId);
      localStorage.setItem("cand_role", "candidate");
    }

    const activeId = localStorage.getItem("cand_session_id") || "cand-1";
    try {
      const resCand = await fetch(`/api/candidates`);
      const candidatesList = await resCand.json();
      const activeCand = candidatesList.find((c: any) => c.id === activeId);

      if (activeCand) {
        setCandidate(activeCand);
        setCurrentStage(activeCand.currentStage || "terms");

        // Fetch corresponding project details
        const resProj = await fetch(`/api/projects/${activeCand.projectId}`);
        if (resProj.ok) {
          const activeProj = await resProj.ok ? await resProj.json() : null;
          setProject(activeProj);
        }
      }
    } catch (err) {
      console.error("Error loading candidate session:", err);
    }
  };

  useEffect(() => {
    loadSession();
  }, []);

  // Sync stage to backend
  const updateStageOnBackend = async (newStage: string, additionalPayload: any = {}) => {
    if (!candidate) return;

    try {
      const res = await fetch(`/api/candidates/${candidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentStage: newStage,
          ...additionalPayload
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setCandidate(updated);
        setCurrentStage(newStage);
      }
    } catch (err) {
      console.error("Error syncing candidate stage:", err);
    }
  };

  // Stage 1 -> Stage 2 (Interviewing)
  const handleStartInterview = () => {
    initiateInterviewChat();
    updateStageOnBackend("interview");
  };

  // --- STAGE 2: CHAT INTERVIEW RECRUITMENT LOGIC ---
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [userTextInput, setUserTextInput] = useState("");
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [candidateResponseCollection, setCandidateResponseCollection] = useState<{question: string, answer: string}[]>([]);
  
  // File upload state for Resume
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeTextEntry, setResumeTextEntry] = useState("Имеется высшее образование, 3 года успешных продаж в ИТ-компании, владею amoCRM, навыки активного ведения переговоров.");
  const [isDragOver, setIsDragOver] = useState(false);
  const [attachmentUploaded, setAttachmentUploaded] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat questions compiled from project
  const initiateInterviewChat = () => {
    const qList = project ? [...project.checklistQuestions, ...project.roleplayQuestions] : [
      "Каков ваш профессиональный опыт на аналогичной должности?",
      "Смоделируйте как вы улаживаете конфликт с недовольным заказчиком?"
    ];

    setChatMessages([
      {
        sender: "recruiter",
        text: `Приветствую вас! Мое имя Робот Рекрутер RR. 🤖 Проведем интервью на должность: ${project?.roleName || "Специалист"}. Для детального изучения прикрепите ваше резюме PDF/DOC в форму слева, либо впишите данные о ваших навыках.\n\nДавайте начнем с первого вопроса:\n📌 ${qList[0]}`,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
    setCurrentQuestionIdx(0);
  };

  const handleSendMessage = () => {
    if (!userTextInput.trim()) return;

    const qList = project ? [...project.checklistQuestions, ...project.roleplayQuestions] : [
      "Каков ваш профессиональный опыт на аналогичной должности?",
      "Смоделируйте как вы улаживаете конфликт с недовольным заказчиком?"
    ];

    // Save answer
    const currentQuestion = qList[currentQuestionIdx];
    const newAnswers = [...candidateResponseCollection, { question: currentQuestion, answer: userTextInput }];
    setCandidateResponseCollection(newAnswers);

    const userMsg: Message = {
      sender: "candidate",
      text: userTextInput,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setUserTextInput("");

    // Scroll chat down
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    const nextIdx = currentQuestionIdx + 1;
    if (nextIdx < qList.length) {
      setTimeout(() => {
        const systemReply: Message = {
          sender: "recruiter",
          text: `Спасибо, ответ записан.\n\nСледующий вопрос:\n📌 ${qList[nextIdx]}`,
          timestamp: new Date().toLocaleTimeString()
        };
        setChatMessages(prev => [...prev, systemReply]);
        setCurrentQuestionIdx(nextIdx);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }, 1000);
    } else {
      // Conduct final evaluation
      setTimeout(async () => {
        const finalWaitReply: Message = {
          sender: "recruiter",
          text: `🎉 Все вопросы пройдены! Начинаю ИИ-анализ ваших ответов и резюме. Робот рассчитывает баллы соответствия и конструирует индивидуальный план обучения... Пожалуйста, подождите.`,
          timestamp: new Date().toLocaleTimeString()
        };
        setChatMessages(prev => [...prev, finalWaitReply]);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

        // Submit to backend evaluation
        await triggerEvaluateAndOnboard(newAnswers);
      }, 1000);
    }
  };

  // Evaluate candidate
  const triggerEvaluateAndOnboard = async (answers: any[]) => {
    if (!candidate) return;

    try {
      const res = await fetch("/api/evaluate-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: candidate.id,
          candidateAnswers: answers,
          resumeText: resumeTextEntry + (resumeFile ? ` [Файл резюме: ${resumeFile.name}]` : "")
        })
      });

      if (res.ok) {
        const result = await res.json();
        // Automatically fetch updated Candidate object
        updateStageOnBackend("scoring");
      }
    } catch (err) {
      console.error("Evaluation trigger errored:", err);
    }
  };

  // Resume Drag & Drop Usability handling
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => {
    setIsDragOver(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setResumeFile(e.dataTransfer.files[0]);
      setAttachmentUploaded(true);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
      setAttachmentUploaded(true);
    }
  };

  // --- STAGE 4: INTERACTIVE TRAINING & LESSON PANEL ---
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [activeBlockIdx, setActiveBlockIdx] = useState(0);

  // Active quiz choice
  const [selectedQuizIdx, setSelectedQuizIdx] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizMessage, setQuizMessage] = useState("");
  const [quizError, setQuizError] = useState(false);

  const handleLessonQuizSubmit = () => {
    if (!candidate || !candidate.trainingPlan) return;
    if (selectedQuizIdx === null) return;

    const block = candidate.trainingPlan[activeBlockIdx];
    const lesson = block.lessons[activeLessonIdx];

    if (lesson.quiz) {
      const isCorrect = selectedQuizIdx === lesson.quiz.answerIndex;
      setQuizSubmitted(true);

      if (isCorrect) {
        setQuizError(false);
        setQuizMessage("✨ Отлично! Правильный ответ! Вы успешно усвоили урок.");
        
        // Mark lesson complete dynamically in training plan arrays
        const updatedPlan = [...candidate.trainingPlan];
        updatedPlan[activeBlockIdx].lessons[activeLessonIdx].isCompleted = true;

        // Check if all lessons across all blocks are finished
        const allCompleted = updatedPlan.every(b => b.lessons.every(l => l.isCompleted));
        
        if (allCompleted) {
          updateStageOnBackend("certified", { trainingPlan: updatedPlan });
        } else {
          // Sync current block complete back to backend
          updateStageOnBackend("training", { trainingPlan: updatedPlan });
        }
      } else {
        setQuizError(true);
        setQuizMessage("❌ Неверный ответ. Пожалуйста, внимательно изучите теорию урока выше и попробуйте еще раз.");
      }
    }
  };

  const handleNextLesson = () => {
    if (!candidate || !candidate.trainingPlan) return;

    setSelectedQuizIdx(null);
    setQuizSubmitted(false);
    setQuizMessage("");

    const block = candidate.trainingPlan[activeBlockIdx];
    const nextLessonIdx = activeLessonIdx + 1;

    if (nextLessonIdx < block.lessons.length) {
      setActiveLessonIdx(nextLessonIdx);
    } else {
      // Move to next block if available
      const nextBlockIdx = activeBlockIdx + 1;
      if (nextBlockIdx < candidate.trainingPlan.length) {
        setActiveBlockIdx(nextBlockIdx);
        setActiveLessonIdx(0);
      }
    }
  };


  return (
    <div className="bg-[#121212] min-h-screen text-[#EFEFEF] flex flex-col justify-between selection:bg-[#E7C768]">
      
      {/* Top Banner Navigation */}
      <header className="bg-[#1A1A1A]/90 border-b border-white/10 px-4 md:px-8 py-3.5 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <img src="https://i.ibb.co/WWRbtPq0/RR-Logo.png" alt="RR" className="w-8 h-8 object-contain" />
          <div className="text-left">
            <span className="font-bold text-sm tracking-tight text-[#E7C768]">Робот Рекрутер (RR)</span>
            <span className="text-[10px] block font-mono text-gray-400 uppercase">Обучение & Онбординг</span>
          </div>
        </div>

        {candidate && (
          <div className="text-right text-xs">
            <span className="text-gray-400">Кандидат: </span>
            <strong className="text-[#E7C768] font-bold">{candidate.name}</strong>
          </div>
        )}
      </header>

      {/* Main interactive Stepper panel */}
      <main className="flex-1 py-8 px-4 md:px-8 max-w-5xl mx-auto w-full">
        
        {/* Step progress indicators indicator */}
        <div className="mb-8 grid grid-cols-5 gap-2 text-center text-[10px] md:text-xs">
          {[
            { id: "terms", title: "1. Условия вакансии" },
            { id: "interview", title: "2. Собеседование" },
            { id: "scoring", title: "3. Анализ баллов" },
            { id: "training", title: "4. ИИ Обучение" },
            { id: "certified", title: "5. Сертификация 🎓" }
          ].map((st, i) => {
            const isCompleted = ["terms", "interview", "scoring", "training", "certified"].indexOf(currentStage) >= i;
            const isActive = currentStage === st.id;
            return (
              <div 
                key={st.id} 
                className={`py-2 rounded-xl font-bold border transition ${
                  isActive 
                    ? "bg-[#1E4468] text-white border-[#E7C768] shadow-lg" 
                    : isCompleted 
                    ? "bg-[#1E4468]/30 text-gray-300 border-white/5 opacity-80" 
                    : "bg-black/35 text-gray-400 border-white/10"
                }`}
              >
                {st.title}
              </div>
            );
          })}
        </div>

        {/* STEP 1: PRESENT JOB TERMS & DETAILS FOR THE APPLICANT */}
        {currentStage === "terms" && (
          <div className="bg-[#1E4468]/15 border border-white/10 shadow-2xl backdrop-blur-md rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
            <div className="md:col-span-4 bg-gradient-to-b from-[#17344F] to-[#265582] p-8 text-white flex flex-col justify-between text-center items-center border-r border-white/10">
              <Mascot state="narrator" size="lg" speechBubble="Привет! Давай знакомиться с условиями!" />
              
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-[#E7C768]">Продай свой опыт ИИ</h3>
                <p className="text-[11px] text-gray-300 leading-snug">
                  Если условия ниже вас устраивают, Робот Рекрутер начнет мгновенную сессию вопросов.
                </p>
              </div>
            </div>

            <div className="md:col-span-8 p-6 md:p-8 space-y-6">
              <div>
                <span className="text-[#E7C768] font-bold text-xs uppercase tracking-wider block">Новое приглашение к найму</span>
                <h2 className="text-2xl font-bold text-white mt-1">{project?.roleName || "Специалист"}</h2>
                <p className="text-gray-300 text-sm mt-1">Организация: <strong className="text-[#E7C768]">{project?.companyName || "ООО 'Компания'"}</strong></p>
              </div>

              {/* Salary & Conditions tags */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/35 p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Предлагаемая оплата</span>
                  <div className="text-sm font-bold text-[#FF4C4C] mt-1">{project?.salaryTerms || "Сдельная"}</div>
                </div>

                <div className="bg-black/35 p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-gray-400">График работы</span>
                  <div className="text-sm font-bold text-[#E7C768] mt-1">{project?.scheduleTerms || "Гибкий"}</div>
                </div>
              </div>

              {/* Motivation block */}
              <div className="space-y-2 bg-black/30 border-l-4 border-[#E7C768] p-4 rounded-r-2xl">
                <span className="text-xs font-bold text-[#E7C768] uppercase block">О компании и ценностях:</span>
                <p className="text-xs text-gray-200 leading-relaxed italic">
                  "{project?.motivationText || "Мы предлагаем комфортный климат для инноваций, стабильный оклад и крутые возможности карьерной лестницы."}"
                </p>
              </div>

              {/* Wiki quick guide */}
              {project?.customWiki && (
                <div className="space-y-1.5 bg-[#E7C768]/5 p-4 rounded-2xl border border-[#E7C768]/20">
                  <span className="text-xs font-bold text-[#E7C768] uppercase block">Вводный буклет / Вики сотрудника:</span>
                  <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">
                    {project.customWiki}
                  </p>
                </div>
              )}

              {/* CTA button */}
              <button
                id="btn_accept_terms"
                onClick={handleStartInterview}
                className="cursor-pointer w-full bg-gradient-to-r from-[#FF1A1A] to-[#E54C00] text-white font-bold py-3.5 rounded-xl text-center shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Согласен с условиями, начать собеседование!
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CHAT INTERVIEW RECRUITER QUESTIONING */}
        {currentStage === "interview" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar resume upload container */}
            <div className="md:col-span-5 bg-[#1E4468]/15 border border-white/10 shadow-xl backdrop-blur-md rounded-3xl p-6  space-y-5 text-white">
              <div className="text-center">
                <FileText className="w-8 h-8 text-[#E7C768] mx-auto" />
                <h3 className="font-bold text-sm text-[#E7C768] mt-2">Резюме и Опыт</h3>
                <p className="text-[11px] text-gray-300 mt-1">Прикрепите PDF файл для изучения.</p>
              </div>

              {/* Drag drop area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-5 text-center transition ${
                  isDragOver 
                    ? "border-[#E7C768] bg-amber-950/20" 
                    : attachmentUploaded 
                    ? "border-emerald-500 bg-emerald-950/20" 
                    : "border-white/10 bg-black/20 hover:border-[#E7C768]"
                }`}
              >
                <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                <div className="text-xs font-bold text-gray-300 mt-2">
                  {attachmentUploaded ? "✅ Файл резюме прикреплен" : "Перетащите PDF сюда"}
                </div>
                {resumeFile ? (
                  <p className="text-[10px] text-emerald-400 font-mono mt-1 font-bold">{resumeFile.name}</p>
                ) : (
                  <p className="text-[10px] text-gray-400 mt-1">или выберите на компьютере</p>
                )}

                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-file-input"
                />
                
                <label
                  htmlFor="resume-file-input"
                  className="cursor-pointer block mt-3 w-full bg-white/5 border border-white/10 shadow-sm text-xs font-bold py-1.5 rounded-lg hover:bg-white/10 transition"
                >
                  Обзор файлов
                </label>
              </div>

              {/* Text Resume Alternative */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300 block">Либо введите информацию вручную:</label>
                <textarea
                  rows={4}
                  className="w-full bg-black/35 text-white text-xs p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#E7C768]"
                  placeholder="Опишите ваши сильные стороны, навыки, проекты..."
                  value={resumeTextEntry}
                  onChange={(e) => setResumeTextEntry(e.target.value)}
                />
              </div>
            </div>

            {/* Chatbot module */}
            <div className="md:col-span-7 bg-[#1E4468]/15 border border-white/10 shadow-2xl backdrop-blur-md rounded-3xl overflow-hidden flex flex-col h-[520px]">
              
              {/* Chat head */}
              <div className="bg-[#1E4468]/60 text-white p-4 flex items-center justify-between border-b border-[#E7C768]/60">
                <div className="flex items-center gap-2">
                  <Mascot state="recruitment" size="sm" className="w-8 h-8 pointer-events-none" />
                  <div>
                    <h4 className="font-bold text-xs text-[#E7C768]">ИИ Скрининг-Интервьюёр</h4>
                    <span className="text-[9px] text-gray-300">Прямое подключение к HR Роботу</span>
                  </div>
                </div>
              </div>

              {/* Messages space */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg, i) => {
                  const isRecruiter = msg.sender === "recruiter";
                  return (
                    <div
                      key={i}
                      className={`flex ${isRecruiter ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-xs xl:max-w-md p-3.5 rounded-2xl text-xs leading-relaxed space-y-1 ${
                          isRecruiter
                            ? "bg-black/35 text-white rounded-tl-none border border-white/10"
                            : "bg-[#1E4468] border border-white/10 text-white rounded-tr-none shadow"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        <span className="text-[8px] opacity-75 block text-right font-mono">
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Send console */}
              <div className="p-3 border-t border-white/10 bg-black/45 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Впишите ваш ответ..."
                  className="flex-1 bg-black/30 border border-white/10 px-3 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-[#E7C768]"
                  value={userTextInput}
                  onChange={(e) => setUserTextInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  className="cursor-pointer bg-gradient-to-r from-[#FF1A1A] to-[#E54C00] text-white p-2.5 rounded-xl transition shadow"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        )}

        {/* STEP 3: SCORE PORTAL DETAILS */}
        {currentStage === "scoring" && (
          <div className="bg-[#1E4468]/15 border border-white/10 shadow-2xl backdrop-blur-md rounded-3xl p-6 md:p-8 space-y-6 text-center max-w-2xl mx-auto">
            <Mascot state="serious" size="lg" />
            
            <div>
              <span className="bg-[#E7C768] text-[#1A1A1A] font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider inline-block">ИИ Оценка Завершена!</span>
              <h2 className="text-2xl font-bold text-[#E7C768] mt-2">Результаты вашего тестирования</h2>
              <p className="text-xs text-gray-300 mt-1">Оценка сведена в баллах на основе ответов на опрос и разбора вашего резюме.</p>
            </div>

            {/* Score Ring indicator */}
            <div className="flex items-center justify-center py-4">
              <div className="w-32 h-32 rounded-full border-4 border-[#E7C768] bg-amber-950/45 flex flex-col items-center justify-center shadow-md">
                <span className="text-4xl font-black text-[#E7C768]">{candidate?.scores?.overallScore || 75}</span>
                <span className="text-[10px] font-bold uppercase text-gray-300 font-mono">Общий балл</span>
              </div>
            </div>

            {/* Assessment critique */}
            <div className="bg-black/45 p-5 rounded-2xl text-left border border-white/10 space-y-2">
              <span className="text-xs font-bold text-[#E7C768] uppercase flex items-center gap-1">
                <Cpu className="w-4 h-4 text-[#E7C768]" /> Разбор ваших навыков ИИ Роботом:
              </span>
              <p className="text-xs text-gray-200 leading-relaxed italic">
                "{candidate?.scores?.assessmentSummary || "Кандидат продемонстрировал хорошие базовые результаты на собеседовании. Выявлены отличные черты коммуникатора. Следующий шаг - изучение специфики нашего продукта и преодоление пробелов в знаниях."}"
              </p>
            </div>

            {/* Training action CTA */}
            <button
              onClick={() => updateStageOnBackend("training")}
              className="cursor-pointer w-full bg-gradient-to-r from-[#FF1A1A] to-[#E54C00] text-white font-bold py-3.5 rounded-xl text-center shadow-lg transition flex items-center justify-center gap-2"
            >
              Открыть персональный курс ИИ-обучения <ArrowRight className="w-4.5 h-4.5" />
            </button>
          </div>
        )}

        {/* STEP 4: TRAINING LESSON PANELS & INTERACTIVE QUIZZES */}
        {currentStage === "training" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left side Lesson navigator */}
            <aside className="lg:col-span-4 bg-[#1E4468]/15 border border-white/10 backdrop-blur-md rounded-3xl p-5 shadow-xl space-y-4">
              <h3 className="font-bold text-xs text-[#E7C768] uppercase tracking-wider flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-[#E7C768]" /> Учебная Траектория
              </h3>
              
              <div className="space-y-2 text-xs">
                {candidate?.trainingPlan?.map((block, bIdx) => (
                  <div key={bIdx} className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase font-mono">Блок {bIdx + 1}:</span>
                    <button
                      onClick={() => {
                        setActiveBlockIdx(bIdx);
                        setActiveLessonIdx(0);
                      }}
                      className={`cursor-pointer w-full text-left font-bold p-3 rounded-xl border text-xs transition duration-150 ${
                        activeBlockIdx === bIdx 
                          ? "bg-[#1E4468] text-white border-[#E7C768] shadow" 
                          : "bg-white/5 text-gray-300 hover:bg-white/10 border-white/5"
                      }`}
                    >
                      {block.title}
                    </button>
                  </div>
                ))}
              </div>
            </aside>

            {/* Main Lesson Reader panel */}
            <main className="lg:col-span-8 bg-[#1E4468]/15 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
              {candidate?.trainingPlan && candidate.trainingPlan[activeBlockIdx] ? (
                (() => {
                  const block = candidate.trainingPlan[activeBlockIdx];
                  const lesson = block.lessons[activeLessonIdx];

                  return (
                    <div className="p-6 md:p-8 space-y-6">
                      {/* Lesson title bar */}
                      <div className="border-b border-white/10 pb-4">
                        <span className="text-[10px] uppercase font-mono font-bold text-[#E7C768] tracking-wider block bg-[#1E4468]/80 w-max px-2.5 py-0.5 rounded border border-white/10">
                          {block.title}
                        </span>
                        <h2 className="text-xl font-bold text-white mt-2">{lesson.title}</h2>
                        <p className="text-xs text-gray-300 mt-1">{block.description}</p>
                      </div>

                      {/* Content panel */}
                      <div className="bg-black/35 p-6 rounded-2xl border border-white/10 text-xs text-gray-200 leading-relaxed font-normal whitespace-pre-wrap">
                        {lesson.content}
                      </div>

                      {/* Lesson Quiz Form */}
                      {lesson.quiz && (
                        <div className="space-y-4 border-t border-white/10 pt-6">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-[#E7C768]" />
                            <h4 className="font-bold text-xs text-[#E7C768] uppercase">Проверочный Вопрос Робота (Квиз):</h4>
                          </div>

                          <div className="space-y-2">
                            <p className="font-semibold text-sm text-white">{lesson.quiz.question}</p>
                            
                            <div className="space-y-2 mt-3">
                              {lesson.quiz.options.map((opt, oIdx) => {
                                const isSelected = selectedQuizIdx === oIdx;
                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    onClick={() => !quizSubmitted && setSelectedQuizIdx(oIdx)}
                                    disabled={quizSubmitted && lesson.isCompleted}
                                    className={`cursor-pointer w-full text-left text-xs p-3.5 rounded-xl border transition-all ${
                                      isSelected
                                        ? "bg-[#1E4468] text-white border-[#E7C768]"
                                        : "bg-white/5 hover:bg-white/10 text-white border-white/10"
                                    }`}
                                  >
                                    <span className="font-bold mr-2">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Quiz notification message banner */}
                          {quizMessage && (
                            <div className={`p-4 text-xs rounded-xl border ${quizError ? "bg-[#FF4C4C]/10 text-[#FF4C4C] border-[#FF4C4C]/20" : "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"}`}>
                              {quizMessage}
                            </div>
                          )}

                          {/* Submit controls */}
                          <div className="flex gap-2">
                            {!quizSubmitted && (
                              <button
                                type="button"
                                onClick={handleLessonQuizSubmit}
                                className="cursor-pointer bg-gradient-to-r from-[#FF1A1A] to-[#E54C00] text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-1 hover:shadow-md active:scale-98"
                              >
                                Отправить ответ на проверку
                              </button>
                            )}
                            
                            {(quizSubmitted || lesson.isCompleted) && (
                              <button
                                type="button"
                                onClick={handleNextLesson}
                                className="cursor-pointer bg-[#1E4468] hover:bg-[#1E4468]/95 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-1 hover:shadow"
                              >
                                Далее <ArrowRight className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="p-12 text-center text-gray-400">
                  <Loader className="w-8 h-8 animate-spin mx-auto text-gray-300" />
                  <p className="text-xs mt-2">Загружаем ваш курс обучения от Робота Рекрутера...</p>
                </div>
              )}
            </main>

          </div>
        )}

        {/* STEP 5: CERTIFICATE ISSUED SUCCESS AREA */}
        {currentStage === "certified" && (
          <div className="space-y-8 max-w-2xl mx-auto">
            
            {/* Visual Issued Certificate styled like a physical luxury diploma */}
            <div className="bg-[#161616] rounded-3xl border-8 border-double border-[#E7C768] shadow-2xl p-8 relative overflow-hidden text-center select-none bg-gradient-to-tr from-stone-900 via-[#1A1A1A] to-stone-900">
              
              {/* Corner Ornaments */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-[#E7C768]"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-[#E7C768]"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-[#E7C768]"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-[#E7C768]"></div>

              {/* Watermark Logo */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <img src="https://i.ibb.co/WWRbtPq0/RR-Logo.png" alt="watermark" className="w-80 h-80 object-contain" />
              </div>

              {/* Certificate Head */}
              <div className="space-y-2 relative z-10">
                <img src="https://i.ibb.co/WWRbtPq0/RR-Logo.png" alt="RR Logo" className="w-16 h-16 object-contain mx-auto drop-shadow" />
                <h1 className="text-xs uppercase tracking-[0.2em] font-bold text-[#E7C768]">
                  Сертификат Соответствия Квалификации
                </h1>
                <div className="text-[10px] text-gray-400 font-serif italic">Выдан платформой автоматического онбординга Робот Рекрутер (RR)</div>
              </div>

              {/* Line ornament */}
              <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-[#E7C768] to-transparent mx-auto my-6"></div>

              {/* Certification Statement */}
              <div className="space-y-6 relative z-10">
                <p className="text-xs text-gray-300 font-serif italic">Настоящим подтверждается, что соискатель</p>
                <div className="text-2xl md:text-3xl font-black tracking-tight text-[#E7C768] font-serif">
                  {candidate?.name || "Иван Иванов"}
                </div>
                
                <p className="text-xs text-gray-300 leading-relaxed max-w-md mx-auto">
                  Успешно завершил индивидуальную программу скрининга, кейс-собеседование ИИ и обучающий экспресс-курс подготовки по должности
                </p>

                <div className="bg-[#1E4468] text-[#E7C768] font-bold text-sm md:text-base py-2.5 px-6 rounded-xl inline-block border-2 border-[#E7C768] shadow-md">
                  {candidate?.roleName || "Менеджер"}
                </div>

                <p className="text-xs text-gray-400">
                  на проект компании: <strong className="text-white font-bold">{project?.companyName || "ООО Работодатель"}</strong>
                </p>
              </div>

              {/* Stamps and Signatures */}
              <div className="mt-10 grid grid-cols-2 gap-8 items-end relative z-10 text-left px-4">
                <div className="space-y-1">
                  <div className="text-[9px] uppercase tracking-wider text-gray-400">Выдан Почтой:</div>
                  <div className="text-[11px] font-bold font-mono text-[#E7C768]">HR-RR.ru (ИИ Аудит)</div>
                  <div className="w-24 h-px bg-white/20"></div>
                  <div className="text-[9px] text-gray-400">Уполномоченная подпись системного робота</div>
                </div>

                <div className="text-right flex flex-col items-end">
                  {/* Luxury Stamp icon */}
                  <div className="w-16 h-16 rounded-full border-4 border-double border-[#E7C768] flex flex-col items-center justify-center text-[#E7C768] bg-black/40 transform rotate-12 scale-90 shadow-sm leading-none font-black text-[9px] select-none font-serif">
                    <span>RR</span>
                    <span>CERTIFIED</span>
                    <span className="text-[6px]">2026</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Actions list */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  alert("Диплом успешно сохранен на ваше устройство! Ссылка отправлена работодателю в CRM.");
                  updateStageOnBackend("certified");
                }}
                className="cursor-pointer w-full bg-gradient-to-r from-[#FF1A1A] to-[#E54C00] text-white font-bold py-3.5 rounded-xl text-center shadow-lg transition flex items-center justify-center gap-2"
              >
                Сохранить сертификат в PDF
              </button>

              <button
                onClick={() => {
                  localStorage.clear();
                  navigate("/main");
                }}
                className="cursor-pointer w-full bg-white/5 border border-white/10 text-white font-bold py-2.5 rounded-xl text-center text-xs transition hover:bg-white/10"
              >
                Войти под другим профилем
              </button>
            </div>

          </div>
        )}

      </main>

      {/* Small footer */}
      <footer className="py-4 text-center text-xs text-gray-400 border-t border-white/5 bg-[#1A1A1A]">
        HR-RR.ru © 2026 Робот Рекрутер. Система обучения соискателей.
      </footer>

    </div>
  );
}
