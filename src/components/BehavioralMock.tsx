// src/components/BehavioralMock.tsx
/**
 * BehavioralMock Component
 * Manages the advanced star-framework mock interview dashboard. Directs active webcam streaming feeds,
 * coordinates text-to-speech voicing models, and submissions toward Gemini for body language & metric grading.
 */


import React, { useState, useRef, useEffect } from "react";
import { InterviewSession, PresetBehavioralQuestion } from "../types.js";
import { PRESET_BEHAVIORAL_QUESTIONS } from "../lib/presetData.js";
import { 
  ArrowLeft, Users, Mic, Send, RefreshCw, BarChart2, Star, 
  CheckCircle, MessageSquareWarning, Sparkles, Volume2, Video, VideoOff, VolumeX
} from "lucide-react";
import { apiFetch } from "../api.ts";

interface BehavioralMockProps {
  session: InterviewSession;
  onBack: () => void;
  onSubmitResults: (results: {
    questionText: string;
    audioTranscript: string;
    gradingMetrics: {
      situationTask: number;
      action: number;
      result: number;
      communication: number;
    };
    aiFeedback: string;
    score: number;
  }) => Promise<void>;
}

export default function BehavioralMock({ session, onBack, onSubmitResults }: BehavioralMockProps) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const selectedQuestion = PRESET_BEHAVIORAL_QUESTIONS[questionIndex] || PRESET_BEHAVIORAL_QUESTIONS[0];

  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLoaderMessage, setCurrentLoaderMessage] = useState("");

  const [evaluation, setEvaluation] = useState<{
    gradingMetrics: {
      situationTask: number;
      action: number;
      result: number;
      communication: number;
      confidenceScore?: number;
    };
    aiFeedback: string;
    score: number;
  } | null>(null);

  // Video Mode States
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedThumbnail, setCapturedThumbnail] = useState<string | null>(null);

  // Speech States
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [isSpeakingFeedback, setIsSpeakingFeedback] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const loaderMessages = [
    "Establishing cloud audio assessment rails...",
    "Reviewing transcript syntax against leadership principles...",
    "Validating STAR methodology metrics...",
    "Extracting critical outcome indices...",
    "Consulting server-side Gemini 3.5 AI evaluator...",
    "Assembling structural improvement parameters...",
    "Conducting visual body language composure synthesis..."
  ];

  // Access and release webcam streaming
  useEffect(() => {
    if (isVideoMode) {
      navigator.mediaDevices.getUserMedia({ video: { width: 400, height: 300, facingMode: "user" }, audio: false })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch((err) => console.warn("Video play interrupted:", err));
          }
          setCameraError(null);
        })
        .catch((err) => {
          console.error("Webcam video mode access issue:", err);
          setCameraError("Webcam access denied or unavailable. Please grant camera permission in the browser frame.");
          setIsVideoMode(false);
        });
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isVideoMode]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Web Speech API text speaker
  const speakText = (text: string, onStart: () => void, onEnd: () => void) => {
    if (!window.speechSynthesis) return;
    // Cancel ongoing synthesis
    window.speechSynthesis.cancel();

    // Clean markdown symbols to read nicely
    const cleanText = text
      .replace(/[#*`_~:\-\t\n]/g, " ")
      .replace(/\[.*?\]\(.*?\)/g, "")
      .slice(0, 400); // comfortable summary bound

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Attempt standard english voice selection
    const voices = window.speechSynthesis.getVoices();
    const systemVoice = voices.find(v => v.lang.startsWith("en") && v.name.includes("Google")) || voices.find(v => v.lang.startsWith("en"));
    if (systemVoice) {
      utterance.voice = systemVoice;
    }
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => onStart();
    utterance.onend = () => onEnd();
    utterance.onerror = () => onEnd();

    window.speechSynthesis.speak(utterance);
  };

  const toggleSpeakQuestion = () => {
    if (isSpeakingQuestion) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
    } else {
      setIsSpeakingFeedback(false);
      speakText(
        `Behavioral interview prompt: ${selectedQuestion.questionText}`,
        () => setIsSpeakingQuestion(true),
        () => setIsSpeakingQuestion(false)
      );
    }
  };

  const toggleSpeakFeedback = () => {
    if (isSpeakingFeedback) {
      window.speechSynthesis.cancel();
      setIsSpeakingFeedback(false);
    } else {
      setIsSpeakingQuestion(false);
      if (evaluation) {
        const spokenReport = `Evaluation response completed. Your overall STAR score is ${evaluation.score} out of 100. Situation Task score is ${evaluation.gradingMetrics.situationTask} out of 10. Core actions score is ${evaluation.gradingMetrics.action} out of 10. Quantifiable Results metrics are graded ${evaluation.gradingMetrics.result} out of 10. Communication is ${evaluation.gradingMetrics.communication} out of 10.${evaluation.gradingMetrics.confidenceScore ? ` Visual body posture and confidence score is ${evaluation.gradingMetrics.confidenceScore} out of 10.` : ""}`;
        speakText(
          spokenReport,
          () => setIsSpeakingFeedback(true),
          () => setIsSpeakingFeedback(false)
        );
      }
    }
  };

  // Clean-up synthesis on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Helper to trigger voice simulator populate
  const simulateAudioRecording = () => {
    setIsRecording(true);
    setTranscript("Speech-to-text translating your voice in real-time...");
    
    setTimeout(() => {
      setIsRecording(false);
      setTranscript(
        "In my previous product position, we had a major release scheduled for Q3. However, one week before launch, our payment microservice crashed, threatening to affect about 10,000 active subscribers. I acted as the escalation lead. I quickly set up a telemetry war room, synchronized operations, and established a backup stripe ledger routing scheme. We successfully deployed the fix, launched on schedule, and kept outages below 0.1%, maintaining high retention."
      );
    }, 3500);
  };

  const executeSubmission = async () => {
    if (!transcript.trim()) return;

    setIsLoading(true);
    let messageIndex = 0;
    setCurrentLoaderMessage(loaderMessages[0]);

    const ticker = setInterval(() => {
      messageIndex = (messageIndex + 1) % loaderMessages.length;
      setCurrentLoaderMessage(loaderMessages[messageIndex]);
    }, 2800);

    // Capture canvas base64 image data if Video Mode is enabled
    let faceImagePayload: string | undefined = undefined;
    if (isVideoMode && videoRef.current) {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 400;
        canvas.height = 300;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          faceImagePayload = canvas.toDataURL("image/jpeg", 0.85);
          setCapturedThumbnail(faceImagePayload);
        }
      } catch (err) {
        console.error("Momentary visual snapshot failed:", err);
      }
    }

    try {
      const response = await apiFetch(`/api/sessions/${session.id}/submit-behavioral`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: selectedQuestion.questionText,
          audioTranscript: transcript,
          faceImage: faceImagePayload
        })
      });

      if (!response.ok) {
        throw new Error("Failed to post behavioral diagnostic evaluation request.");
      }

      const data = await response.json();

      const evalResult = {
        gradingMetrics: {
          situationTask: data.response.gradingMetrics.situationTask,
          action: data.response.gradingMetrics.action,
          result: data.response.gradingMetrics.result,
          communication: data.response.gradingMetrics.communication,
          confidenceScore: data.response.gradingMetrics.confidenceScore
        },
        aiFeedback: data.response.aiFeedback,
        score: data.session.score
      };

      setEvaluation(evalResult);

      await onSubmitResults({
        questionText: selectedQuestion.questionText,
        audioTranscript: transcript,
        gradingMetrics: {
          situationTask: evalResult.gradingMetrics.situationTask,
          action: evalResult.gradingMetrics.action,
          result: evalResult.gradingMetrics.result,
          communication: evalResult.gradingMetrics.communication
        },
        aiFeedback: evalResult.aiFeedback,
        score: evalResult.score
      });

    } catch (err) {
      console.error(err);
      setEvaluation({
        gradingMetrics: { situationTask: 0, action: 0, result: 0, communication: 0, confidenceScore: 0 },
        aiFeedback: `### Evaluation Blocked\n\nThere was an issue processing your behavioral mock response.\n\n**Details:** ${err instanceof Error ? err.message : String(err)}\n\nPlease ensure your workspace is active.`,
        score: 0
      });
    } finally {
      clearInterval(ticker);
      setIsLoading(false);
    }
  };

  const handleQuestionChange = (index: number) => {
    setQuestionIndex(index);
    setTranscript("");
    setEvaluation(null);
    setCapturedThumbnail(null);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeakingQuestion(false);
    setIsSpeakingFeedback(false);
  };

  return (
    <div className="space-y-6" id="behavioral-mock-workspace">
      {/* Workspace Header cockpit */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-zinc-200">
        <button
          id="btn-back-to-dashboard"
          type="button"
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3.5 py-2 rounded-lg cursor-pointer animate-fade-in"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Cockpit</span>
        </button>

        <div className="text-right">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Session ID</span>
          <span className="text-xs font-mono font-bold text-zinc-700">{session.id}</span>
        </div>
      </div>

      {/* Behavioral Round Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Left Hand: STAR Blueprint Matrix & Choice */}
        <div className="space-y-6" id="star-matrix-column">
          
          {/* Choice Selection List */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Choose Your Prompt</h3>
            <div className="space-y-2">
              {PRESET_BEHAVIORAL_QUESTIONS.map((q, i) => {
                const isActive = q.id === selectedQuestion.id;
                return (
                  <button
                    key={q.id}
                    id={`btn-bhq-select-${i}`}
                    type="button"
                    onClick={() => handleQuestionChange(i)}
                    className={`w-full text-left p-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      isActive
                        ? "bg-indigo-50 border-indigo-300 text-indigo-950 font-bold"
                        : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    <span className="block text-[9px] uppercase font-bold text-indigo-500 mb-1 leading-none">{q.category}</span>
                    <span className="line-clamp-1">{q.questionText}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prompt Detail Showcase with Speaking option */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Active Question</span>
              </h2>

              <button
                id="btn-speak-question"
                type="button"
                onClick={toggleSpeakQuestion}
                className={`py-1 px-2.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer transition-all ${
                  isSpeakingQuestion 
                    ? "bg-indigo-100 text-indigo-700 font-extrabold animate-pulse border border-indigo-250"
                    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                }`}
              >
                {isSpeakingQuestion ? <VolumeX className="w-3.5 h-3.5 text-indigo-700" /> : <Volume2 className="w-3.5 h-3.5 text-zinc-600" />}
                <span>{isSpeakingQuestion ? "Mute" : "Listen to Prompt"}</span>
              </button>
            </div>
            
            <h1 className="text-lg font-extrabold text-zinc-950 leading-snug">
              "{selectedQuestion.questionText}"
            </h1>
          </div>

          {/* STAR Methodology Helper Instructions card */}
          <div className="bg-gradient-to-tr from-zinc-950 to-zinc-900 text-white rounded-2xl border border-zinc-900 p-6 shadow-md">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4 flex items-center space-x-1.5">
              <Star className="w-4 h-4 fill-purple-400" />
              <span>STAR Grading Matrix Blueprint</span>
            </h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex items-start space-x-3">
                <span className="bg-purple-500/20 text-purple-300 px-2.5 py-1.5 rounded-lg font-black shrink-0 border border-purple-500/30">S</span>
                <div>
                  <h4 className="font-bold text-zinc-100">Situation / Context (0-10)</h4>
                  <p className="text-zinc-400 mt-1 leading-relaxed">Map the exact company environment, initial baseline system details, and immediate challenges.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="bg-purple-500/20 text-purple-300 px-2.5 py-1.5 rounded-lg font-black shrink-0 border border-purple-500/30">T</span>
                <div>
                  <h4 className="font-bold text-zinc-100">Task / Requirement (0-10)</h4>
                  <p className="text-zinc-400 mt-1 leading-relaxed">Define the constraints, key goals, and indicators of launch success.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="bg-purple-500/20 text-purple-300 px-2.5 py-1.5 rounded-lg font-black shrink-0 border border-purple-500/30">A</span>
                <div>
                  <h4 className="font-bold text-zinc-100">Action / Proactive Mediation (0-10)</h4>
                  <p className="text-zinc-400 mt-1 leading-relaxed">Map step-by-step algorithms, leadership mitigations, and actions you personally coordinated.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="bg-purple-500/20 text-purple-300 px-2.5 py-1.5 rounded-lg font-black shrink-0 border border-purple-500/30">R</span>
                <div>
                  <h4 className="font-bold text-zinc-100">Result / Business Highlights (0-10)</h4>
                  <p className="text-zinc-400 mt-1 leading-relaxed">Deliver concrete metrics, lessons learned, post-mortem analysis, and system scale outcomes.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Hand: Video feed portal, Transcript Input, Smart recording, and Feedback */}
        <div className="space-y-6" id="recording-editor-and-feedback">
          
          {/* Webcam Portal Card */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isVideoMode ? "bg-red-400" : "bg-zinc-450"}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isVideoMode ? "bg-red-500" : "bg-zinc-400"}`}></span>
                </span>
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">🎥 Webcam Composure Video Portal</h3>
              </div>

              <button
                id="btn-toggle-video-mode"
                type="button"
                onClick={() => setIsVideoMode(!isVideoMode)}
                className={`py-1.5 px-3 rounded-lg text-[11px] font-bold tracking-wider uppercase flex items-center space-x-1.5 transition-all cursor-pointer ${
                  isVideoMode
                    ? "bg-red-50 border border-red-200 text-red-700"
                    : "bg-zinc-900 hover:bg-zinc-950 text-white"
                }`}
              >
                {isVideoMode ? (
                  <>
                    <VideoOff className="w-3.5 h-3.5" />
                    <span>Turn Off Camera</span>
                  </>
                ) : (
                  <>
                    <Video className="w-3.5 h-3.5" />
                    <span>Activate Video Mode</span>
                  </>
                )}
              </button>
            </div>

            {cameraError && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[11px] p-3 rounded-lg leading-relaxed">
                {cameraError}
              </div>
            )}

            {isVideoMode ? (
              <div className="relative rounded-xl overflow-hidden aspect-video bg-black border border-zinc-350 shadow-inner flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                <div className="absolute top-2.5 left-2.5 bg-zinc-950/85 backdrop-blur-xs px-2.5 py-1 rounded text-[9px] font-mono text-emerald-400 uppercase tracking-widest flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span>AI Gaze Tracking Connected</span>
                </div>
                <div className="absolute bottom-2.5 right-2.5 bg-zinc-950/85 backdrop-blur-xs px-2.5 py-1 rounded text-[9px] font-mono text-zinc-300 uppercase tracking-wider">
                  Express Composure: LIVE
                </div>
              </div>
            ) : (
              <div 
                className="bg-zinc-50 hover:bg-zinc-100 border-2 border-dashed border-zinc-200 rounded-xl py-6 px-4 text-center cursor-pointer transition-all"
                onClick={() => setIsVideoMode(true)}
              >
                <Video className="w-8 h-8 text-indigo-500 mx-auto opacity-70 mb-2" />
                <p className="text-zinc-600 text-xs font-semibold max-w-sm mx-auto leading-relaxed">
                  Webcam Portal allows server-side Gemini 1.5/3.5 models to evaluate facial composure, eye contact, and confidence score during your speech.
                </p>
                <span className="text-indigo-600 text-[10px] font-black uppercase tracking-wider mt-2.5 inline-block bg-indigo-50 px-2.5 py-1 rounded">
                  Enable active camera feed
                </span>
              </div>
            )}

            {capturedThumbnail && (
              <div className="flex items-center space-x-3 bg-purple-50/70 border border-purple-100 p-2.5 rounded-lg text-xs text-purple-900 mt-2">
                <img 
                  src={capturedThumbnail} 
                  className="w-14 h-10 object-cover rounded-md border border-purple-250 shadow-xs shrink-0" 
                  alt="AI Evaluated Frame Source" 
                />
                <div>
                  <span className="block font-black text-purple-800">Snapshot Composure Frame Saved</span>
                  <span className="text-[10px] text-purple-600">Captured at moment of grade submission for posture & expressions assessment.</span>
                </div>
              </div>
            )}
          </div>

          {/* Transcript input card */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-5 space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1 block">Your Answer Transcription</h3>
            
            {/* STT Simulation Controls */}
            <div className="flex items-center space-x-3 bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl">
              <button
                id="btn-simulate-recording"
                type="button"
                onClick={simulateAudioRecording}
                disabled={isRecording || isLoading}
                className={`py-2 px-4 text-xs font-bold rounded-lg flex items-center space-x-2 transition-all cursor-pointer ${
                  isRecording 
                    ? "bg-rose-500 text-white animate-pulse font-bold shadow-xs" 
                    : "bg-zinc-800 hover:bg-zinc-900 text-white"
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{isRecording ? "Listening..." : "Simulate Mic Speech"}</span>
              </button>

              <div className="text-[11px] text-zinc-500 flex-1 leading-normal">
                {isRecording ? (
                  <div className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-3 bg-rose-500 rounded-sm animate-[bounce_0.6s_infinite_100ms]"></span>
                    <span className="w-1.5 h-5 bg-rose-500 rounded-sm animate-[bounce_0.6s_infinite_200ms]"></span>
                    <span className="w-1.5 h-3 bg-rose-500 rounded-sm animate-[bounce_0.6s_infinite_300ms]"></span>
                    <span className="w-1.5 h-4 bg-rose-500 rounded-sm animate-[bounce_0.6s_infinite_400ms]"></span>
                    <span className="w-1.5 h-2 bg-rose-500 rounded-sm animate-[bounce_0.6s_infinite_500ms]"></span>
                    <span className="font-semibold text-rose-600 pl-1">Recording Waveform...</span>
                  </div>
                ) : (
                  <span>Click to record standard STAR-formatted speech transcript, or type manually.</span>
                )}
              </div>
            </div>

            {/* Answer Text Area */}
            <textarea
              id="txt-behavioral-transcript"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="State context challenges, step actions, metrics, and quantitative conclusions directly here..."
              rows={8}
              className="w-full text-zinc-800 text-sm p-4 border border-zinc-200 rounded-xl focus:outline-hidden focus:border-indigo-500 transition-colors select-text"
            />

            <div className="flex justify-end pt-1">
              <button
                id="btn-submit-behavioral-answer"
                type="button"
                disabled={isLoading || !transcript.trim() || isRecording}
                onClick={executeSubmission}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2.5 px-6 rounded-lg flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-45 shadow-sm"
              >
                {isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{isVideoMode ? "Capture Frame & Assess Answer" : "Assess STAR Answer"}</span>
              </button>
            </div>
          </div>

          {/* Assessment Loading Status Block */}
          {isLoading && (
            <div className="bg-purple-50 rounded-2xl border border-purple-100 p-6 flex items-center space-x-4 animate-pulse" id="loader-box">
              <div className="bg-purple-600 p-3 rounded-xl text-white">
                <Volume2 className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-purple-900">Conducting Leadership Alignment evaluation</h4>
                <p className="text-xs text-purple-600 mt-1 max-w-sm font-medium">{currentLoaderMessage}</p>
              </div>
            </div>
          )}

          {/* Behavioral Evaluation results display */}
          {evaluation && !isLoading && (
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-6 animate-fade-in" id="feedback-display">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-100">
                <div>
                  <h3 className="text-base font-extrabold text-zinc-950 flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span>Grading Matrix Verified</span>
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">STAR details evaluated successfully by Gemini.</p>

                  <button
                    id="btn-speak-feedback"
                    type="button"
                    onClick={toggleSpeakFeedback}
                    className={`mt-2 py-1 px-2.5 rounded-md text-[10px] font-bold uppercase tracking-wider inline-flex items-center space-x-1.5 cursor-pointer transition-all ${
                      isSpeakingFeedback 
                        ? "bg-purple-150 text-purple-800 font-extrabold animate-pulse border border-purple-300"
                        : "bg-purple-50 hover:bg-purple-100 text-purple-700"
                    }`}
                  >
                    {isSpeakingFeedback ? <VolumeX className="w-3.5 h-3.5 text-purple-750" /> : <Volume2 className="w-3.5 h-3.5 text-purple-605" />}
                    <span>{isSpeakingFeedback ? "Stop Speaking" : "Speak Report Summary"}</span>
                  </button>
                </div>

                <div className="bg-purple-50 px-4 py-2 rounded-xl border border-purple-100 text-center">
                  <span className="block text-[9px] font-bold text-purple-500 uppercase tracking-widest leading-none font-bold">Mock Grade</span>
                  <span className="text-2xl font-black text-purple-700">{evaluation.score}/100</span>
                </div>
              </div>

              {/* STAR Bar Scores Grids */}
              <div className="space-y-3.5 bg-zinc-50 p-4.5 rounded-xl border border-zinc-150">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">STAR Score Breakdown</h4>
                
                <div className="space-y-3 mt-3">
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-zinc-700">
                      <span>S/T: Situation & Task Detail</span>
                      <span className="text-indigo-600">{evaluation.gradingMetrics.situationTask}/10</span>
                    </div>
                    <div className="bg-zinc-200 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" 
                        style={{ width: `${evaluation.gradingMetrics.situationTask * 10}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-zinc-700">
                      <span>A: Action specificity</span>
                      <span className="text-indigo-600">{evaluation.gradingMetrics.action}/10</span>
                    </div>
                    <div className="bg-zinc-200 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" 
                        style={{ width: `${evaluation.gradingMetrics.action * 10}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-zinc-700">
                      <span>R: Quantifiable Results & Metrics</span>
                      <span className="text-indigo-600">{evaluation.gradingMetrics.result}/10</span>
                    </div>
                    <div className="bg-zinc-200 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" 
                        style={{ width: `${evaluation.gradingMetrics.result * 10}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-bold text-zinc-700">
                      <span>C: Communication & Clarity</span>
                      <span className="text-indigo-600">{evaluation.gradingMetrics.communication}/10</span>
                    </div>
                    <div className="bg-zinc-200 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" 
                        style={{ width: `${evaluation.gradingMetrics.communication * 10}%` }}
                      ></div>
                    </div>
                  </div>

                  {evaluation.gradingMetrics.confidenceScore !== undefined && evaluation.gradingMetrics.confidenceScore > 0 && (
                    <div className="border-t border-zinc-200/60 pt-2.5 mt-2.5">
                      <div className="flex justify-between items-center text-xs font-extrabold text-zinc-800">
                        <span className="flex items-center space-x-1">
                          <span className="text-purple-600">🎥</span>
                          <span>AI Visual Composure & Comportment</span>
                        </span>
                        <span className="text-purple-600 font-black">{evaluation.gradingMetrics.confidenceScore}/10</span>
                      </div>
                      <div className="bg-zinc-200 h-2 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${evaluation.gradingMetrics.confidenceScore * 10}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-zinc-500 italic block mt-1">
                        Grades visual indicators including posture alignment, micro-expressions, gestures, and simulated lens engagement.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Detailed AI feedback Markdown content block */}
              <div className="prose prose-zinc max-w-none text-zinc-750 text-sm leading-relaxed whitespace-pre-wrap space-y-2 bg-gradient-to-b from-purple-50/10 to-zinc-50/20 p-5 rounded-2xl border border-zinc-150 font-sans">
                {evaluation.aiFeedback}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

// © 2026 Mag7Crack.ai SaaS Core. All rights preserved.

