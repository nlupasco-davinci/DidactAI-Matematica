import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  BarChart3, 
  MessageSquare, 
  ChevronRight, 
  BrainCircuit, 
  CheckCircle2, 
  Lightbulb, 
  ArrowLeft,
  Menu,
  X,
  User as UserIcon,
  Settings,
  LogOut,
  Search,
  Timer,
  Trophy,
  AlertCircle,
  Sparkles,
  Zap,
  Sigma,
  Pi,
  FunctionSquare,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { cn } from './lib/utils';
import { exercises, categorii, Problem, getSimilarProblems } from './data/exercises';
import { nationalTests, NationalTest } from './data/tests';
import { MathRenderer } from './components/MathRenderer';
import { getTutorResponse, analyzeSolutionImage, AnalysisResult } from './lib/ai';
import { AIDashboard } from './components/AIDashboard';
import { 
  Camera,
  Upload,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  Send
} from 'lucide-react';
import { 
  auth, 
  db, 
  googleProvider, 
  User, 
  handleFirestoreError, 
  OperationType 
} from './lib/firebase';
import { 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  collection, 
  serverTimestamp,
  increment
} from 'firebase/firestore';

type View = 'home' | 'topics' | 'problem' | 'progress' | 'chat' | 'tests' | 'simulated-test' | 'ai-dashboard';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      let message = "A apărut o eroare neașteptată.";
      try {
        const errInfo = JSON.parse(this.state.error.message);
        if (errInfo.error.includes('permissions')) {
          message = "Nu ai permisiuni suficiente pentru această acțiune.";
        }
      } catch (e) {}
      
      return (
        <div className="flex flex-col items-center justify-center h-screen p-6 text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Ups! Ceva nu a mers bine.</h1>
          <p className="text-slate-600 max-w-md">{message}</p>
          <Button onClick={() => window.location.reload()}>Reîncarcă pagina</Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeView, setActiveView] = useState<View>('home');
  const [previousView, setPreviousView] = useState<View>('home');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [testDifficulty, setTestDifficulty] = useState<number | null>(null);
  const [showDifficultySelect, setShowDifficultySelect] = useState(true);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);
  const [similarProblems, setSimilarProblems] = useState<Problem[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [solvedProblems, setSolvedProblems] = useState<Record<string, 'solved' | 'failed'>>({});
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedTest, setSelectedTest] = useState<NationalTest | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [exerciseInput, setExerciseInput] = useState('');
  const [solutionImage, setSolutionImage] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageAnalysisResult, setImageAnalysisResult] = useState<AnalysisResult | null>(null);

  // Simulated Test State
  const [testQuestions, setTestQuestions] = useState<Problem[]>([]);
  const [testSimilarProblems, setTestSimilarProblems] = useState<Record<string, Problem[]>>({});
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [testTimer, setTestTimer] = useState(3600);
  const [testActive, setTestActive] = useState(false);
  const [testResults, setTestResults] = useState<{ correct: number, total: number } | null>(null);
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      
      if (currentUser) {
        // Sync user profile
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: currentUser.uid,
              displayName: currentUser.displayName,
              email: currentUser.email,
              photoURL: currentUser.photoURL,
              level: 'Explorator',
              xp: 0,
              totalSolved: 0,
              createdAt: serverTimestamp()
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${currentUser.uid}`);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !isAuthReady) return;

    const solvedRef = collection(db, 'users', user.uid, 'solvedProblems');
    const unsubSolved = onSnapshot(solvedRef, (snapshot) => {
      const statuses: Record<string, 'solved' | 'failed'> = {};
      snapshot.docs.forEach(doc => {
        statuses[doc.id] = (doc.data().status as 'solved' | 'failed') || 'solved';
      });
      setSolvedProblems(statuses);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/solvedProblems`);
    });

    const userRef = doc(db, 'users', user.uid);
    const unsubProfile = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserProfile(snapshot.data());
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    });

    return () => {
      unsubSolved();
      unsubProfile();
    };
  }, [user, isAuthReady]);

  // Sync profile data when it changes
  useEffect(() => {
    if (!isAuthReady) return;

    const statsRef = doc(db, 'stats', 'global');
    const unsubStats = onSnapshot(statsRef, (snapshot) => {
      if (snapshot.exists()) {
        setStats(snapshot.data());
      }
    });

    // Increment visitor count once per session
    const incrementVisitor = async () => {
      const sessionKey = 'didactai_session_visited';
      if (!sessionStorage.getItem(sessionKey)) {
        try {
          const snap = await getDoc(statsRef);
          const currentVisitors = snap.exists() ? (snap.data().visitors || 0) : 0;
          await setDoc(statsRef, { visitors: currentVisitors + 1 }, { merge: true });
          sessionStorage.setItem(sessionKey, 'true');
        } catch (e) {
          console.error("Error updating visitors:", e);
        }
      }
    };
    incrementVisitor();

    return () => unsubStats();
  }, [isAuthReady]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Te-ai conectat cu succes!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Eroare la conectare.');
    }
  };

  const renderTitle = (text: string, limit: number) => {
    // Clean up the text first (replace ... with . after = in the source if it exists)
    let processedText = text.replace(/=\s*\.\.\./g, '= .');

    if (processedText.length <= limit) {
      return <MathRenderer content={processedText} className="prose-sm !my-0 inline-block align-middle" />;
    }
    
    let truncated = processedText.substring(0, limit);
    
    // User request: if it ends with '=', use '.' instead of '...'
    let suffix = '...';
    if (truncated.trim().endsWith('=')) {
      suffix = ' .';
      truncated = truncated.trim();
    } else if (truncated.includes('=') && !truncated.includes('$', truncated.lastIndexOf('='))) {
      // If we are after an '=' and not inside a LaTeX block that started after '=', 
      // and we are truncating, the user might want a single dot if it looks like an equation result.
      // But let's stick to the explicit '=' case for now to avoid over-engineering.
    }
    
    // Ensure we don't break a LaTeX tag
    const dollarCount = (truncated.match(/\$/g) || []).length;
    if (dollarCount % 2 !== 0) {
      // If we have an odd number of $, we are inside a math block.
      // We should close it before adding the suffix.
      truncated += '$';
    }
    
    return <MathRenderer content={truncated + suffix} className="prose-sm !my-0 inline-block align-middle" />;
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Te-ai deconectat.');
      setActiveView('home');
      setSelectedTopic(null);
      setSelectedProblem(null);
      setSelectedTest(null);
    } catch (error) {
      toast.error('Eroare la deconectare.');
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const newMessage = { role: 'user' as const, content: chatInput };
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
    setAiLoading(true);

    try {
      const response = await getTutorResponse(chatInput, "Conversație generală cu elevul.", selectedProblem?.id);
      setChatMessages(prev => [...prev, { role: 'ai', content: response }]);
    } catch (error: any) {
      toast.error(error.message || 'Eroare la trimiterea mesajului.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Imaginea este prea mare (max 5MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setSolutionImage(base64);
        setImageAnalysisResult(null);
        
        // Auto-trigger analysis immediately with the base64 data to avoid race conditions
        if (selectedProblem) {
          triggerInferredAnalysis(base64, selectedProblem);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerInferredAnalysis = async (img: string, problem: Problem) => {
    setIsAnalyzingImage(true);
    try {
      const result = await analyzeSolutionImage(img, problem.problem, problem.solution);
      
      if (result.extractedResult) {
        setUserAnswer(result.extractedResult);
      }

      setImageAnalysisResult(result);
      
      if (result.isCorrect === true) {
        await markProblemAsSolved(problem, 'imagine');
        setUserAnswer(problem.answer);
        toast.success("Rezolvare validată! Progresul tău a fost salvat.");
      } else if (result.isCorrect === false) {
        await markProblemAsFailed(problem, 'imagine');
        toast.info("Am găsit o mică eroare în pașii tăi. Verifică feedback-ul AI.");
      }
    } catch (error: any) {
      console.error("Analysis trigger error:", error);
      toast.error("Salvarea a eșuat. Verifică conexiunea.");
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const analyzeImage = async () => {
    if (!solutionImage || !selectedProblem) return;
    await triggerInferredAnalysis(solutionImage, selectedProblem);
  };

  const handleTopicSelect = (categoryKey: string) => {
    setSelectedTopic(categoryKey);
    setPreviousView('home');
    setActiveView('topics');
  };

  const handleTestSelect = (test: NationalTest) => {
    setSelectedTest(test);
    setPreviousView('tests');
  };

  const startSimulatedTest = (difficulty: number) => {
    let pool = [...exercises];
    if (difficulty) {
      pool = pool.filter(p => p.difficulty === difficulty);
    }
    
    // If pool is smaller than 10, take what we have
    const randomQuestions = pool
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);
      
    const similarMap: Record<string, Problem[]> = {};
    randomQuestions.forEach(q => {
      similarMap[q.id] = getSimilarProblems(q, 1);
    });
    setTestSimilarProblems(similarMap);
    setTestQuestions(randomQuestions);
    setCurrentTestIndex(0);
    setTestTimer(3600);
    setTestActive(true);
    setTestResults(null);
    setTestAnswers({});
    setTestDifficulty(difficulty);
    setShowDifficultySelect(false);
    setActiveView('simulated-test');
  };

  const submitTest = () => {
    let correct = 0;
    testQuestions.forEach(q => {
      if (testAnswers[q.id]?.trim().toLowerCase() === q.answer.toLowerCase()) {
        correct++;
      }
    });
    setTestResults({ correct, total: testQuestions.length });
    setTestActive(false);
    
    // Award XP for test completion
    if (user) {
      const xpGain = correct * 20;
      const userRef = doc(db, 'users', user.uid);
      setDoc(userRef, {
        xp: (userProfile?.xp || 0) + xpGain
      }, { merge: true }).catch(err => console.error(err));
      toast.success(`Test finalizat! Ai obținut ${correct}/${testQuestions.length} corecte și +${xpGain} XP!`);
    } else {
      toast.success(`Test finalizat! Ai obținut ${correct}/${testQuestions.length} corecte!`);
    }
  };

  useEffect(() => {
    let interval: any;
    if (testActive && testTimer > 0) {
      interval = setInterval(() => {
        setTestTimer(prev => prev - 1);
      }, 1000);
    } else if (testTimer === 0 && testActive) {
      submitTest();
    }
    return () => clearInterval(interval);
  }, [testActive, testTimer]);

  const handleProblemSelect = (problem: Problem) => {
    // Explicitly reset everything related to previous problem state
    setSolutionImage(null);
    setImageAnalysisResult(null);
    setAiResponse('');
    setShowHint(false);
    setShowSolution(false);
    setShowSimilar(false);
    setExerciseInput('');
    
    setSelectedProblem(problem);
    setPreviousView(activeView);
    setSimilarProblems(getSimilarProblems(problem));
    
    if (solvedProblems[problem.id] === 'solved') {
      setUserAnswer(problem.answer);
    } else {
      setUserAnswer('');
    }
    
    setActiveView('problem');
  };

  const normalizeAnswer = (str: string) => {
    if (!str) return "";
    // Elimina spatiile, unifica majusculele si scoate simbolurile LaTeX ($) sau math (^, *)
    // De asemenea, tratam variatii comune de scriere pentru a asigura corectitudinea validarii
    return str.toLowerCase()
      .trim()
      .replace(/\s+/g, '') // scoate toate spatiile
      .replace(/\$/g, '') // scoate simbolul dollar pt LaTeX
      .replace(/sqrt\(/g, '') // scoate cuvantul sqrt
      .replace(/delta/g, '') // scoate delta text
      .replace(/[\(\)]/g, '') // scoate parantezele simple
      .replace(/[\u00b2\u2072²]/g, '2') // normalizează puterea 2 (superscript 2)
      .replace(/[\u00b3\u2073³]/g, '3') // normalizează puterea 3 (superscript 3)
      .replace(/[\u2074⁴]/g, '4') // normalizează puterea 4 (superscript 4)
      .replace(/\^/g, '') // scoate ^ pt putere
      .replace(/\*/g, '') // scoate * pt inmultire
      .replace(/\\cdot/g, '') // scoate punctul de inmultire LaTeX
      .replace(/\\times/g, '') // scoate semnul de inmultire LaTeX
      .replace(/\{/g, '') // scoate acoladele LaTeX
      .replace(/\}/g, '') // scoate acoladele LaTeX
      .replace(/,/g, '.') // unifica separatorul zecimal
      .replace(/х/g, 'x') // inlocuieste 'x' chirilic cu 'x' latin
      .replace(/[π\u03c0]/g, 'pi') // normalizeaza pi
      .replace(/\\pi/g, 'pi') // normalizeaza pi LaTeX
      .replace(/[⋅\u22c5]/g, '') // unifica operatorii de inmultire
      .replace(/×/g, ''); 
  };

  const markProblemAsSolved = async (problem: Problem, method: 'text' | 'imagine' | 'manual' = 'text') => {
    // Increment global stats
    const statsRef = doc(db, 'stats', 'global');
    try {
      await setDoc(statsRef, { totalCorrect: increment(1) }, { merge: true });
    } catch (e) {
      console.error("Global stats update error:", e);
    }

    if (user) {
      try {
        const solvedRef = doc(db, 'users', user.uid, 'solvedProblems', problem.id);
        await setDoc(solvedRef, {
          problemId: problem.id,
          domeniu: problem.domeniu,
          categorie: problem.categorie,
          difficulty: problem.difficulty,
          status: 'solved',
          solvedAt: serverTimestamp(),
          metoda: method
        }, { merge: true });

        const userRef = doc(db, 'users', user.uid);
        const xpBoost = method === 'imagine' ? 30 : (problem.difficulty === 1 ? 10 : problem.difficulty === 2 ? 25 : 50);
        await setDoc(userRef, {
          totalSolved: increment(1),
          xp: increment(problem.difficulty * xpBoost)
        }, { merge: true });
        
        // Optimistic update for local state
        setSolvedProblems(prev => ({ ...prev, [problem.id]: 'solved' }));
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/solvedProblems/${problem.id}`);
      }
    } else {
      setSolvedProblems(prev => ({ ...prev, [problem.id]: 'solved' }));
    }
  };

  const markProblemAsFailed = async (problem: Problem, method: 'text' | 'imagine' = 'text') => {
    if (user) {
      try {
        const solvedRef = doc(db, 'users', user.uid, 'solvedProblems', problem.id);
        await setDoc(solvedRef, {
          problemId: problem.id,
          domeniu: problem.domeniu,
          categorie: problem.categorie,
          difficulty: problem.difficulty,
          status: 'failed',
          lastAttempt: serverTimestamp(),
          metoda: method
        }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/solvedProblems/${problem.id}`);
      }
    } else {
      setSolvedProblems(prev => ({ ...prev, [problem.id]: 'failed' }));
    }

    // Track incorrect answer in global stats
    const statsRef = doc(db, 'stats', 'global');
    getDoc(statsRef).then(snap => {
      const incorrect = snap.exists() ? (snap.data().totalIncorrect || 0) : 0;
      setDoc(statsRef, { totalIncorrect: incorrect + 1 }, { merge: true });
    }).catch(e => console.error(e));
  };

  const checkAnswer = async () => {
    if (!selectedProblem) return;
    
    if (normalizeAnswer(userAnswer) === normalizeAnswer(selectedProblem.answer)) {
      toast.success('Corect! Felicitări!');
      await markProblemAsSolved(selectedProblem, 'text');
    } else {
      toast.error('Mai încearcă! Poți cere un indiciu dacă ai nevoie.');
      if (solvedProblems[selectedProblem.id] !== 'solved') {
        await markProblemAsFailed(selectedProblem, 'text');
      }
    }
  };

  const askAI = async (type: 'hint' | 'explanation' | 'custom' | 'theory') => {
    if (!selectedProblem) return;
    setAiLoading(true);
    setAiResponse('');
    
    let prompt = "";
    if (type === 'custom') {
      prompt = exerciseInput;
      setExerciseInput('');
    } else if (type === 'hint') {
      prompt = `Dă-mi un indiciu subtil pentru această problemă: ${selectedProblem.problem}. Nu mi-o rezolva încă, doar îndrumă-mă.`;
    } else if (type === 'theory') {
      prompt = `Explică-mi conceptele teoretice de bază necesare pentru a rezolva o problemă din capitolul "${selectedProblem.domeniu}". Include formulele principale. Te rog să te referi la curriculumul de clasa 9-a din Moldova.`;
    } else {
      prompt = `Te rog să-mi explici în detaliu, pas cu pas, cum se rezolvă această problemă: ${selectedProblem.problem}. Vreau să înțeleg logica din spatele fiecărei operații.`;
    }
    
    const response = await getTutorResponse(prompt, `Problema: ${selectedProblem.problem}, Domeniu: ${selectedProblem.domeniu}`, selectedProblem.id);
    setAiResponse(response);
    setAiLoading(false);
  };

  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <Sigma className="w-10 h-10 text-indigo-600" />
        </motion.div>
      </div>
    );
  }

  // Mock user if not logged in to allow bypassing login screen
  const currentUser = user || {
    uid: 'guest',
    displayName: 'Vizitator',
    email: 'guest@matemate.ro',
    photoURL: null
  };

  const solvedCount = Object.values(solvedProblems).filter(v => v === 'solved').length;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      <Toaster position="top-center" />
      
      {/* Settings Modal Moved to Root for proper overlay */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-xl font-bold">Setări</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowSettings(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold">Tema Întunecată</p>
                    <p className="text-xs text-slate-500">Activează aspectul dark.</p>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={(val) => {
                    setDarkMode(val);
                    if (val) document.documentElement.classList.add('dark');
                    else document.documentElement.classList.remove('dark');
                  }} />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aplicație</p>
                  <p className="text-sm">DidactAI Matematica v1.2</p>
                  <p className="text-xs text-slate-500">Creată pentru Evaluarea Națională la Matematică clasa a 9-a.</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                <Button onClick={() => setShowSettings(false)}>Închide</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 80 }}
        className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Sigma className="w-6 h-6 text-white" />
          </div>
          {sidebarOpen && <h1 className="font-bold text-xl tracking-tight">DidactAI Matematica</h1>}
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <NavItem 
            icon={<BookOpen />} 
            label="Exerciții pe categorii" 
            active={activeView === 'home' || activeView === 'topics' || activeView === 'problem'} 
            collapsed={!sidebarOpen}
            onClick={() => setActiveView('home')}
          />
          <NavItem 
            icon={<GraduationCap />} 
            label="Teste Naționale" 
            active={activeView === 'tests'} 
            collapsed={!sidebarOpen}
            onClick={() => setActiveView('tests')}
          />
          <NavItem 
            icon={<Timer />} 
            label="Test Simulat" 
            active={activeView === 'simulated-test'} 
            collapsed={!sidebarOpen}
            onClick={() => {
              setShowDifficultySelect(true);
              setTestActive(false);
              setTestResults(null);
              setActiveView('simulated-test');
            }}
          />
          <NavItem 
            icon={<BarChart3 />} 
            label="Progresul Meu" 
            active={activeView === 'progress'} 
            collapsed={!sidebarOpen}
            onClick={() => setActiveView('progress')}
          />
          <NavItem 
            icon={<MessageSquare />} 
            label="Asistent AI" 
            active={activeView === 'chat'} 
            collapsed={!sidebarOpen}
            onClick={() => setActiveView('chat')}
          />
          <NavItem 
            icon={<Brain />} 
            label="Arhitectura AI" 
            active={activeView === 'ai-dashboard'} 
            collapsed={!sidebarOpen}
            onClick={() => setActiveView('ai-dashboard')}
          />
          <NavItem 
            icon={<LogOut />} 
            label="Deconectare" 
            active={false} 
            collapsed={!sidebarOpen}
            onClick={handleLogout}
          />
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt={currentUser.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <UserIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              )}
            </div>
            {sidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{currentUser.displayName || 'Elev DidactAI'}</p>
                <p className="text-xs text-slate-500 truncate">{userProfile?.level || 'Explorator'}</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <div className="mt-4 text-center">
              <p className="text-[10px] text-slate-400 font-medium">
                © 2026 Sergiu Căruceru
              </p>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-6 z-10">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-4">
            {!user && (
              <Button variant="outline" size="sm" onClick={handleLogin} className="gap-2">
                <UserIcon className="w-4 h-4" /> Conectare
              </Button>
            )}
            <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
              <span className="text-xs font-medium text-slate-500">Nivel:</span>
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 border-none">
                {userProfile?.level || 'Explorator'}
              </Badge>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={(e) => {
                e.stopPropagation();
                setShowSettings(true);
              }}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-10 max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              {activeView === 'home' && (
                <motion.div 
                  key="home"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Salutare, {currentUser.displayName?.split(' ')[0] || 'Elev'}! 👋</h2>
                    <p className="text-slate-500 text-lg">Ești gata să excelezi la matematică astăzi?</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-indigo-600 text-white border-none shadow-lg shadow-indigo-200 dark:shadow-none">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5" />
                          Progres Total
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <span>{solvedCount} din 100 exerciții</span>
                            <span>{Math.min(100, Math.round((solvedCount / 100) * 100))}%</span>
                          </div>
                          <Progress value={Math.min(100, (solvedCount / 100) * 100)} className="bg-white/20 h-2" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="md:col-span-2 border-slate-200 dark:border-slate-800">
                      <CardHeader>
                        <CardTitle>Continuă de unde ai rămas</CardTitle>
                        <CardDescription>Ultima temă: Numere reale</CardDescription>
                      </CardHeader>
                      <CardContent className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-xl">
                            <Lightbulb className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <p className="font-medium">Calcule cu radicali</p>
                            <p className="text-sm text-slate-500">3 exerciții rămase</p>
                          </div>
                        </div>
                        <Button onClick={() => handleTopicSelect(Object.keys(categorii)[0])}>Continuă</Button>
                      </CardContent>
                    </Card>
                  </div>

          <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Explorează Categorii</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(categorii).map(([key, category]) => {
                        const categoryExercises = exercises.filter(ex => ex.categorie === key);
                        const solvedInCategory = categoryExercises.filter(ex => solvedProblems[ex.id] === 'solved').length;
                        const progress = categoryExercises.length > 0 ? (solvedInCategory / categoryExercises.length) * 100 : 0;
                        
                        return (
                          <Card 
                            key={key} 
                            className="hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors cursor-pointer group"
                            onClick={() => handleTopicSelect(key)}
                          >
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div className="text-2xl">{category.icon}</div>
                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-transform group-hover:translate-x-1" />
                              </div>
                              <CardTitle className="text-lg mt-2">{category.name}</CardTitle>
                              <CardDescription className="text-xs uppercase tracking-wider font-bold text-indigo-500">{category.domeniu}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                                  <span>{solvedInCategory} / {categoryExercises.length} rezolvate</span>
                                  <span>{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} className="h-1" />
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeView === 'topics' && selectedTopic && (
                <motion.div 
                  key="topics"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Button variant="ghost" className="gap-2" onClick={() => setActiveView('home')}>
                    <ArrowLeft className="w-4 h-4" /> Înapoi la teme
                  </Button>
                  
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">{categorii[selectedTopic]?.name}</h2>
                    <p className="text-slate-500">Domeniu: {categorii[selectedTopic]?.domeniu}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {exercises.filter(ex => ex.categorie === selectedTopic).map((problem) => (
                      <Card 
                        key={problem.id} 
                        className="hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors"
                        onClick={() => handleProblemSelect(problem)}
                      >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg line-clamp-1">{renderTitle(problem.problem, 100)}</CardTitle>
                              {solvedProblems[problem.id] && (
                                <Badge 
                                  variant={solvedProblems[problem.id] === 'solved' ? 'outline' : 'destructive'} 
                                  className={cn(
                                    "text-[10px] uppercase tracking-wider",
                                    solvedProblems[problem.id] === 'solved' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
                                  )}
                                >
                                  {solvedProblems[problem.id] === 'solved' ? 'Rezolvat' : 'Incorect'}
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Badge variant={problem.difficulty === 1 ? 'secondary' : problem.difficulty === 2 ? 'default' : 'destructive'} className="text-[10px] uppercase tracking-wider">
                                {problem.difficulty === 1 ? 'ușor' : problem.difficulty === 2 ? 'mediu' : 'greu'}
                              </Badge>
                              <span className="text-xs text-slate-400">{problem.domeniu}</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button variant="outline" size="sm">Rezolvă</Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-[10px] text-slate-400 gap-1 px-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProblemSelect(problem);
                                // The handleProblemSelect already opens the problem view where upload is available
                              }}
                            >
                              <Camera className="w-3 h-3" /> Foto
                            </Button>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeView === 'problem' && selectedProblem && (
                <motion.div 
                  key="problem"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                  <div className="lg:col-span-2 space-y-6">
                    <Button variant="ghost" className="gap-2" onClick={() => setActiveView(previousView)}>
                      <ArrowLeft className="w-4 h-4" /> Înapoi la {previousView === 'tests' ? 'listă teste' : previousView === 'home' ? 'Acasă' : 'listă subiecte'}
                    </Button>

                    <Card className="border-none shadow-xl">
                      <CardHeader className="bg-indigo-50 dark:bg-indigo-950/30 rounded-t-xl">
                        <div className="flex justify-between items-center">
                          <Badge className="bg-indigo-600">{selectedProblem.domeniu}</Badge>
                          <Badge variant="outline">{selectedProblem.difficulty === 1 ? 'ușor' : selectedProblem.difficulty === 2 ? 'mediu' : 'greu'}</Badge>
                        </div>
                        <CardTitle className="text-2xl mt-4 line-clamp-2">{renderTitle(selectedProblem.problem, 150)}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                          <MathRenderer content={selectedProblem.problem} />
                        </div>

                        <div className="mt-8 space-y-6">
                          <div className="space-y-4">
                            <Label htmlFor="answer">Răspunsul tău (text):</Label>
                            <div className="flex gap-2">
                              <Input 
                                id="answer" 
                                placeholder="Introdu rezultatul..." 
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                className="text-lg py-6"
                              />
                              <Button size="lg" className="px-8" onClick={checkAnswer}>Verifică</Button>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap gap-x-3">
                              <span>Notații:</span>
                              <span><code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">sqrt(x)</code> = √x</span>
                              <span><code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">x^2</code> = x²</span>
                              <span><code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">delta</code> = Δ</span>
                            </p>
                          </div>

                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-white dark:bg-slate-950 px-2 text-slate-500">sau încarcă rezolvarea scrisă</span>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {!solutionImage ? (
                              <div 
                                className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors cursor-pointer group"
                                onClick={() => document.getElementById('image-upload')?.click()}
                              >
                                <input 
                                  type="file" 
                                  id="image-upload" 
                                  className="hidden" 
                                  accept="image/*" 
                                  onChange={handleFileUpload}
                                />
                                <Upload className="w-10 h-10 text-slate-300 mx-auto mb-4 group-hover:text-indigo-400 transition-colors" />
                                <p className="text-sm font-medium">Click pentru a încărca o poză cu rezolvarea ta</p>
                                <p className="text-xs text-slate-400 mt-1">Acceptăm JPG, PNG (max 5MB)</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                  <img src={solutionImage} alt="Rezolvare" className="max-h-64 mx-auto object-contain" />
                                  <Button 
                                    variant="destructive" 
                                    size="icon" 
                                    className="absolute top-2 right-2 rounded-full"
                                    onClick={() => {
                                      setSolutionImage(null);
                                      setImageAnalysisResult(null);
                                    }}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>

                                {imageAnalysisResult ? (
                                  <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-4 rounded-xl border flex items-start gap-3 ${
                                      imageAnalysisResult.isCorrect === true
                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-300' 
                                        : imageAnalysisResult.isCorrect === false
                                        ? 'bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-300'
                                        : 'bg-indigo-50 border-indigo-100 text-indigo-800 dark:bg-indigo-950/20 dark:border-indigo-900 dark:text-indigo-300'
                                    }`}
                                  >
                                    {imageAnalysisResult.isCorrect === true ? (
                                      <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    ) : imageAnalysisResult.isCorrect === false ? (
                                      <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    ) : (
                                      <HelpCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    )}
                                    <div className="space-y-1 w-full">
                                      <div className="flex justify-between items-center w-full">
                                        <p className="font-bold">
                                          {imageAnalysisResult.isCorrect === true ? 'Rezolvare Corectă!' : 
                                           imageAnalysisResult.isCorrect === false ? 'Mai ai puțin de lucrat' : 
                                           'Verificare Manuală'}
                                        </p>
                                      </div>
                                      <div className="text-sm prose-sm dark:prose-invert">
                                        <MathRenderer content={imageAnalysisResult.feedback} />
                                      </div>

                                      {imageAnalysisResult.isCorrect === null && (
                                        <div className="pt-2 space-y-2">
                                          <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-md">
                                            <p className="text-xs text-indigo-600 font-medium">🤔 Verifică-ți rezolvarea de pe foaie. Ai ajuns la rezultatul corect?</p>
                                          </div>
                                          
                                          <div className="flex gap-2 w-full pt-1">
                                            <Button 
                                              size="sm" 
                                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-9 text-xs"
                                              onClick={() => {
                                                if (selectedProblem) {
                                                  markProblemAsSolved(selectedProblem, 'manual');
                                                  setImageAnalysisResult({
                                                    ...imageAnalysisResult!,
                                                    isCorrect: true,
                                                    feedback: "Bravo! Ai verificat lucrarea și este corectă. Continuă tot așa!",
                                                    isSimulated: false
                                                  });
                                                  toast.success("Exercițiu marcat ca rezolvat!");
                                                }
                                              }}
                                            >
                                              <Check className="w-3 h-3 mr-1" /> Rezolvarea este orectă!
                                            </Button>
                                            <Button 
                                              size="sm" 
                                              variant="outline"
                                              className="flex-1 h-9 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                              onClick={() => {
                                                setImageAnalysisResult(null); // Reset analysis so they can try again
                                                setSolutionImage(null); // Clear image
                                                
                                                toast.info("Încearcă să corectezi greșeala și revino cu o nouă poză!");

                                                // Record failure
                                                if (user && selectedProblem) {
                                                  const statsRef = doc(db, 'stats', 'global');
                                                  getDoc(statsRef).then(snap => {
                                                    const incorrect = snap.exists() ? (snap.data().totalIncorrect || 0) : 0;
                                                    setDoc(statsRef, { totalIncorrect: incorrect + 1 }, { merge: true });
                                                  }).catch(e => console.error(e));
                                                }
                                              }}
                                            >
                                              <X className="w-3 h-3 mr-1" /> Mai am de lucrat
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                ) : (
                                  <Button 
                                    id="trigger-analysis"
                                    className="w-full py-6 text-lg bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none"
                                    onClick={analyzeImage}
                                    disabled={isAnalyzingImage}
                                  >
                                    {isAnalyzingImage ? (
                                      <>
                                        <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                                        Analizăm rezolvarea ta...
                                      </>
                                    ) : (
                                      <>
                                        <Brain className="mr-2 h-5 w-5" />
                                        Verifică rezolvarea cu AI
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-wrap gap-2 border-t border-slate-100 dark:border-slate-800 pt-6">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-slate-500 ml-auto" 
                                  onClick={() => {
                                    if (!showSolution && solvedProblems[selectedProblem.id] !== 'solved') {
                                      if (confirm("Ești sigur că vrei să vezi soluția corectă? Încearcă să mai lucrezi puțin singur!")) {
                                        setShowSolution(true);
                                      }
                                    } else {
                                      setShowSolution(!showSolution);
                                    }
                                  }}
                                >
                                  {showSolution ? "Ascunde Soluția" : "Vezi Soluția"}
                                </Button>
                      </CardFooter>
                    </Card>

                    <div className="mt-4">
                      <Accordion className="w-full space-y-2">
                        <AccordionItem value="hint" className="border rounded-lg px-4 bg-amber-50/30 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900">
                          <AccordionTrigger className="hover:no-underline py-3">
                            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                              <Lightbulb className="w-4 h-4" />
                              <span className="font-semibold">Indicii</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-4">
                            <div className="text-sm text-amber-800 dark:text-amber-300 space-y-3">
                              {selectedProblem.hints && selectedProblem.hints.length > 0 ? (
                                selectedProblem.hints.map((h, i) => (
                                  <div key={i} className="flex gap-2">
                                    <span className="font-bold text-amber-600">{i + 1}.</span>
                                    <MathRenderer content={h} />
                                  </div>
                                ))
                              ) : (
                                <MathRenderer content={selectedProblem.hint || (selectedProblem.solution ? "Analizează pașii de rezolvare pentru a înțelege metoda." : "Cere un indiciu personalizat de la asistentul AI!")} />
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="similar" className="border rounded-lg px-4 bg-blue-50/30 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900">
                          <AccordionTrigger className="hover:no-underline py-3">
                            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                              <Search className="w-4 h-4" />
                              <span className="font-semibold">Exemple asemănătoare</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-4 space-y-4">
                            {similarProblems.map((sim, idx) => (
                              <div key={idx} className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-blue-100 dark:border-blue-900 shadow-sm space-y-3">
                                <div className="flex justify-between items-center">
                                  <Badge variant="outline" className="text-[10px]">{sim.domeniu}</Badge>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase">Exemplu {idx + 1}</span>
                                </div>
                                <MathRenderer content={sim.problem} />
                                <Accordion>
                                  <AccordionItem value="solution" className="border-none">
                                            <AccordionTrigger className="py-0 text-xs text-blue-600 hover:no-underline">Vezi exemplu derezolvare</AccordionTrigger>
                                    <AccordionContent className="pt-2 text-sm text-slate-600 dark:text-slate-400">
                                      <MathRenderer content={sim.similarExampleSolution || sim.solution} />
                                      <div className="mt-2 pt-2 border-t border-blue-50 dark:border-blue-900 font-bold text-blue-700 dark:text-blue-300">
                                        Răspuns: {sim.answer}
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              </div>
                            ))}
                            {similarProblems.length === 0 && (
                              <p className="text-sm text-slate-500 italic">Nu am găsit probleme similare în baza de date.</p>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>

                    <AnimatePresence>
                      {showSolution && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                          <Card className="border-emerald-200 dark:border-emerald-900 overflow-hidden">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                <CheckCircle2 className="w-4 h-4" /> Soluție completă
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <MathRenderer content={selectedProblem.solution} />
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-6">
                    <Card className="sticky top-6">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className="bg-indigo-600 p-1.5 rounded-md">
                            <Sigma className="w-4 h-4 text-white" />
                          </div>
                          Asistent DidactAI
                        </CardTitle>
                        <CardDescription>Ai nevoie de o explicație personalizată?</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg text-sm min-h-[100px] max-h-[300px] overflow-y-auto space-y-4">
                          {aiLoading ? (
                            <div className="flex items-center justify-center h-full">
                              <motion.div 
                                animate={{ rotate: 360 }} 
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                              >
                                <Sigma className="w-6 h-6 text-indigo-400" />
                              </motion.div>
                            </div>
                          ) : (
                            <>
                              {aiResponse && (
                                <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                                  <MathRenderer content={aiResponse} />
                                </div>
                              )}
                              <div className="flex gap-2 items-end">
                                <textarea 
                                  className="w-full bg-transparent border-none focus:ring-0 text-slate-600 dark:text-slate-300 placeholder:text-slate-400 italic resize-none min-h-[40px]"
                                  placeholder="Întreabă-mă orice (ex: 'explica')..."
                                  value={exerciseInput}
                                  onChange={(e) => setExerciseInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      askAI('custom');
                                    }
                                  }}
                                />
                                {exerciseInput.trim() && (
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-8 w-8 p-0 text-indigo-600"
                                    onClick={() => askAI('custom')}
                                  >
                                    <Send className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-10"
                            onClick={() => askAI('hint')} 
                            disabled={aiLoading || !!aiResponse}
                          >
                            <Lightbulb className="w-4 h-4 mr-2" /> Cere Indiciu
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-10"
                            onClick={() => {
                              setExerciseInput('explica');
                              askAI('custom');
                            }} 
                            disabled={aiLoading || !!aiResponse}
                          >
                            <BookOpen className="w-4 h-4 mr-2" /> Explică-mi
                          </Button>
                        </div>
                        <Button 
                          variant={aiResponse ? "ghost" : "secondary"} 
                          className={`w-full h-12 text-md font-bold transition-all ${!aiResponse ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md' : ''}`}
                          onClick={() => {
                            if (aiResponse) {
                              setAiResponse('');
                              setExerciseInput('');
                            } else if (exerciseInput.trim()) {
                              askAI('custom');
                            } else {
                              askAI('explanation');
                            }
                          }} 
                          disabled={aiLoading}
                        >
                          {aiLoading ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : aiResponse ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2" /> Întreabă iar
                            </>
                          ) : exerciseInput.trim() ? (
                            'Trimite Întrebarea'
                          ) : (
                            <>
                              <BrainCircuit className="w-5 h-5 mr-2" /> Explică-mi Pas cu Pas
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              )}

              {activeView === 'simulated-test' && (
                <motion.div 
                  key="simulated-test"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <h2 className="text-3xl font-bold tracking-tight">Test Simulat</h2>
                      <p className="text-slate-500 text-sm">
                        {testActive ? `10 întrebări de nivel ${testDifficulty === 1 ? 'Ușor' : testDifficulty === 2 ? 'Mediu' : testDifficulty === 3 ? 'Greu' : 'Personalizat'}.` : 'Alege nivelul de dificultate pentru a începe.'}
                      </p>
                    </div>
                    {testActive && (
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xl font-bold ${testTimer < 300 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>
                        <Timer className="w-5 h-5" />
                        {Math.floor(testTimer / 60)}:{(testTimer % 60).toString().padStart(2, '0')}
                      </div>
                    )}
                  </div>

                  {showDifficultySelect && !testActive && !testResults ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
                      <Card 
                        className="p-8 text-center hover:border-green-400 cursor-pointer transition-all group bg-gradient-to-b from-green-50/50 to-white"
                        onClick={() => startSimulatedTest(1)}
                      >
                        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                          <Zap className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Nivel Ușor</h3>
                        <p className="text-slate-500 text-sm">10 întrebări fundamentale pentru consolidarea cunoștințelor.</p>
                        <Button className="mt-6 w-full bg-green-600 hover:bg-green-700">Începe</Button>
                      </Card>

                      <Card 
                        className="p-8 text-center hover:border-amber-400 cursor-pointer transition-all group bg-gradient-to-b from-amber-50/50 to-white"
                        onClick={() => startSimulatedTest(2)}
                      >
                        <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                          <Zap className="w-8 h-8 text-amber-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Nivel Mediu</h3>
                        <p className="text-slate-500 text-sm">10 întrebări de dificultate medie, similare cu cele de la Evaluarea Nanțională clasa a 9-a la Matematică.</p>
                        <Button className="mt-6 w-full bg-amber-600 hover:bg-amber-700">Începe</Button>
                      </Card>

                      <Card 
                        className="p-8 text-center hover:border-red-400 cursor-pointer transition-all group bg-gradient-to-b from-red-50/50 to-white"
                        onClick={() => startSimulatedTest(3)}
                      >
                        <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                          <Zap className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Nivel Greu</h3>
                        <p className="text-slate-500 text-sm">10 întrebări provocatoare pentru cei care doresc nota maximă.</p>
                        <Button className="mt-6 w-full bg-red-600 hover:bg-red-700">Începe</Button>
                      </Card>
                    </div>
                  ) : testResults ? (
                    <Card className="text-center py-12 space-y-6 border-none shadow-2xl bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-slate-950">
                      <div className="relative inline-block">
                        <div className="w-32 h-32 rounded-full border-8 border-indigo-600 flex items-center justify-center mx-auto bg-white dark:bg-slate-800">
                          <span className="text-4xl font-bold text-indigo-600">{testResults.correct}</span>
                          <span className="text-slate-400 text-xl">/{testResults.total}</span>
                        </div>
                        <motion.div 
                          initial={{ scale: 0 }} 
                          animate={{ scale: 1 }} 
                          transition={{ type: 'spring', delay: 0.5 }}
                          className="absolute -top-2 -right-2 bg-amber-400 p-2 rounded-full shadow-lg"
                        >
                          <Trophy className="w-6 h-6 text-white" />
                        </motion.div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold">Test Finalizat!</h3>
                        <p className="text-slate-500">Ai obținut un scor de {Math.round((testResults.correct / testResults.total) * 100)}% la nivelul {testDifficulty === 1 ? 'Ușor' : testDifficulty === 2 ? 'Mediu' : 'Greu'}.</p>
                      </div>
                      <div className="flex justify-center gap-4">
                        <Button onClick={() => setShowDifficultySelect(true)}>Încearcă alt nivel</Button>
                        <Button variant="outline" onClick={() => setActiveView('home')}>Înapoi la Acasă</Button>
                      </div>
                    </Card>
                  ) : testActive ? (
                    <div className="space-y-6 pb-20">
                      {testQuestions.map((q, idx) => (
                        <Card key={q.id} className="overflow-hidden border-slate-200 dark:border-slate-800">
                          <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-center">
                              <Badge variant="outline">Problema {idx + 1}</Badge>
                              <Badge variant="secondary">{q.domeniu}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-6 space-y-4">
                            <MathRenderer content={q.problem} />
                            
                            <Accordion className="w-full">
                              <AccordionItem value="hint">
                                <AccordionTrigger className="text-indigo-600 hover:text-indigo-700 py-2">
                                  <div className="flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4" />
                                    <span>Vezi Indiciu</span>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-slate-600 bg-indigo-50/50 p-3 rounded-lg space-y-3">
                                  {q.hints && q.hints.length > 0 ? (
                                    q.hints.map((h, i) => (
                                      <div key={i} className="flex gap-2 text-sm">
                                        <span className="font-bold text-indigo-600">{i + 1}.</span>
                                        <MathRenderer content={h} />
                                      </div>
                                    ))
                                  ) : (
                                    <MathRenderer content={q.hint || "Gândește-te la pașii de bază ai problemei."} />
                                  )}
                                </AccordionContent>
                              </AccordionItem>
                              
                              <AccordionItem value="similar">
                                <AccordionTrigger className="text-amber-600 hover:text-amber-700 py-2">
                                  <div className="flex items-center gap-2">
                                    <Search className="w-4 h-4" />
                                    <span>Exemplu Asemănător</span>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="text-slate-600 bg-amber-50/50 p-3 rounded-lg space-y-4">
                                  {(testSimilarProblems[q.id] || []).map((sim, sIdx) => (
                                    <div key={sIdx} className="space-y-2">
                                      <div className="font-semibold text-xs text-amber-800">Problemă similară:</div>
                                      <MathRenderer content={sim.problem} />
                                      <div className="pt-2 border-t border-amber-100">
                                        <div className="font-semibold text-xs text-amber-800">Rezolvare:</div>
                                        <MathRenderer content={sim.similarExampleSolution || sim.solution} />
                                        <div className="mt-1 font-bold text-amber-900">Răspuns: {sim.answer}</div>
                                      </div>
                                    </div>
                                  ))}
                                  {(!testSimilarProblems[q.id] || testSimilarProblems[q.id].length === 0) && (
                                    <p>Rezolvă o problemă similară pentru a înțelege metoda.</p>
                                  )}
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>

                            <div className="flex justify-end">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-indigo-600 hover:bg-indigo-50 gap-2"
                                onClick={() => {
                                  const message = `Mă poți ajuta cu această problemă de la testul simulat? \n\n Problema: ${q.problem} \n Domeniu: ${q.domeniu}`;
                                  setChatInput(message);
                                  setActiveView('chat');
                                }}
                              >
                                <Sigma className="w-4 h-4" />
                                Întreabă Asistentul AI
                              </Button>
                            </div>

                            <div className="pt-4">
                              <Label htmlFor={`ans-${q.id}`} className="text-xs uppercase font-bold text-slate-400 tracking-wider">Răspunsul tău:</Label>
                              <Input 
                                id={`ans-${q.id}`}
                                placeholder="Introdu rezultatul..."
                                value={testAnswers[q.id] || ''}
                                onChange={(e) => setTestAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                className="mt-1"
                              />
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full mt-4 gap-2 border-dashed text-slate-500 hover:text-indigo-600 hover:border-indigo-200"
                              onClick={() => handleProblemSelect(q)}
                            >
                              <Camera className="w-4 h-4" />
                              Scanează rezolvarea scrisă
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 md:left-auto md:right-12 md:translate-x-0 z-30">
                        <Button size="lg" className="shadow-2xl px-12 py-7 text-lg rounded-full" onClick={submitTest}>
                          Finalizează Testul
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              )}

              {activeView === 'tests' && (
                <motion.div 
                  key="tests"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {!selectedTest ? (
                    <>
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="gap-2" onClick={() => setActiveView('home')}>
                          <ArrowLeft className="w-4 h-4" /> Acasă
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight">Teste Naționale</h2>
                        <p className="text-slate-500">Antrenează-te cu subiecte oficiale de la Evaluarea Națională.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {nationalTests.map((test) => (
                          <Card 
                            key={test.id} 
                            className="hover:border-indigo-400 cursor-pointer transition-all group"
                            onClick={() => handleTestSelect(test)}
                          >
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                                  Anul {test.year}
                                </Badge>
                                <Badge className="capitalize">{test.session}</Badge>
                              </div>
                              <CardTitle className="text-xl mt-4">Evaluarea Națională - Matematică</CardTitle>
                              <CardDescription>Sesiunea {test.session} {test.year}</CardDescription>
                            </CardHeader>
                            <CardFooter className="flex justify-between items-center text-sm text-slate-500">
                              <span>{test.problems.length} probleme</span>
                              <Button variant="ghost" size="sm" className="group-hover:text-indigo-600">
                                Începe Testul <ChevronRight className="w-4 h-4 ml-1" />
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-6">
                      <Button variant="ghost" className="gap-2" onClick={() => setSelectedTest(null)}>
                        <ArrowLeft className="w-4 h-4" /> Înapoi la listă teste
                      </Button>
                      <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight">EN {selectedTest.year} - {selectedTest.session}</h2>
                        <p className="text-slate-500">Selectează o problemă pentru a începe rezolvarea.</p>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {selectedTest.problems.map((problem) => (
                          <Card 
                            key={problem.id} 
                            className="hover:bg-slate-50 cursor-pointer transition-colors"
                            onClick={() => handleProblemSelect(problem)}
                          >
                            <CardHeader className="flex flex-row items-center justify-between">
                              <CardTitle className="text-lg line-clamp-1">{renderTitle(problem.problem, 50)}</CardTitle>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-[10px] text-slate-400 gap-1"
                                >
                                  <Camera className="w-3 h-3" /> Foto
                                </Button>
                                <Badge variant={solvedProblems[problem.id] ? "secondary" : "outline"}>
                                  {solvedProblems[problem.id] ? "Rezolvat" : "Nerezolvat"}
                                </Badge>
                              </div>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeView === 'chat' && (
                <motion.div 
                  key="chat"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-[calc(100vh-12rem)] flex flex-col"
                >
                  <Card className="flex-1 flex flex-col overflow-hidden border-none shadow-xl">
                    <CardHeader className="border-b bg-indigo-600 text-white">
                      <CardTitle className="flex items-center gap-2">
                        <Sigma className="w-6 h-6" />
                        Asistent DidactAI
                      </CardTitle>
                      <CardDescription className="text-indigo-100">Întreabă-mă orice despre matematică!</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden p-0">
                      <ScrollArea className="h-full p-6">
                        <div className="space-y-6">
                          {chatMessages.length === 0 && (
                            <div className="text-center py-12 space-y-4">
                              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                                <MessageSquare className="w-8 h-8 text-indigo-600" />
                              </div>
                              <div className="space-y-2">
                                <p className="font-medium text-lg">Cum te pot ajuta astăzi?</p>
                                <p className="text-slate-500 text-sm max-w-xs mx-auto">Poți să-mi ceri explicații pentru concepte, ajutor la teme sau să-mi pui întrebări despre examene.</p>
                              </div>
                            </div>
                          )}
                          {chatMessages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] p-4 rounded-2xl ${
                                msg.role === 'user' 
                                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none'
                              }`}>
                                <MathRenderer content={msg.content} />
                              </div>
                            </div>
                          ))}
                          {aiLoading && (
                            <div className="flex justify-start">
                              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                                <motion.div 
                                  animate={{ scale: [1, 1.2, 1] }} 
                                  transition={{ repeat: Infinity, duration: 1 }}
                                  className="w-2 h-2 bg-indigo-400 rounded-full"
                                />
                                <motion.div 
                                  animate={{ scale: [1, 1.2, 1] }} 
                                  transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                                  className="w-2 h-2 bg-indigo-400 rounded-full"
                                />
                                <motion.div 
                                  animate={{ scale: [1, 1.2, 1] }} 
                                  transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                                  className="w-2 h-2 bg-indigo-400 rounded-full"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                    <CardFooter className="p-4 border-t bg-slate-50 dark:bg-slate-900">
                      <form className="flex w-full gap-2" onSubmit={(e) => { e.preventDefault(); sendChatMessage(); }}>
                        <Input 
                          placeholder="Scrie întrebarea ta aici..." 
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          disabled={aiLoading}
                          className="flex-1"
                        />
                        <Button type="submit" disabled={aiLoading || !chatInput.trim()}>
                          Trimite
                        </Button>
                      </form>
                    </CardFooter>
                  </Card>
                </motion.div>
              )}
              {activeView === 'progress' && (
                <motion.div 
                  key="progress"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-8"
                >
                  <h2 className="text-3xl font-bold tracking-tight text-center">Evoluția Ta</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard label="Exerciții Rezolvate" value={solvedCount.toString()} sub={`din ${exercises.length}`} icon={<CheckCircle2 className="text-emerald-500" />} />
                    <StatCard label="Experiență (XP)" value={userProfile?.xp?.toString() || '0'} sub="puncte acumulate" icon={<BarChart3 className="text-indigo-500" />} />
                    <StatCard label="Nivel" value={userProfile?.level || 'Explorator'} sub="Top 10% elevi" icon={<GraduationCap className="text-amber-500" />} />
                  </div>

                  {/* Global Stats for Teachers */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Statistici globale (Profesori)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <StatCard 
                        label="Vizitatori Unici" 
                        value={stats?.visitors?.toString() || '0'} 
                        sub="Total vizite" 
                        icon={<UserIcon className="text-blue-500" />} 
                      />
                      <StatCard 
                        label="Răspunsuri Corecte" 
                        value={stats?.totalCorrect?.toString() || '0'} 
                        sub="La nivel de platformă" 
                        icon={<CheckCircle2 className="text-emerald-500" />} 
                      />
                      <StatCard 
                        label="Răspunsuri Greșite" 
                        value={stats?.totalIncorrect?.toString() || '0'} 
                        sub="Zone de dificultate" 
                        icon={<AlertCircle className="text-red-500" />} 
                      />
                      <StatCard 
                        label="Rata de Succes" 
                        value={stats?.totalCorrect ? `${Math.round((stats.totalCorrect / (stats.totalCorrect + (stats.totalIncorrect || 0))) * 100)}%` : '0%'} 
                        sub="Performanță medie" 
                        icon={<Zap className="text-amber-500" />} 
                      />
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Performanță pe Capitole</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {Object.entries(categorii).map(([key, category]) => {
                        const categoryExercises = exercises.filter(ex => ex.categorie === key);
                        const solvedInCategory = categoryExercises.filter(ex => solvedProblems[ex.id] === 'solved').length;
                        const progress = categoryExercises.length > 0 ? (solvedInCategory / categoryExercises.length) * 100 : 0;
                        return (
                          <ChapterProgress key={key} label={category.name} value={Math.round(progress)} />
                        );
                      })}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeView === 'ai-dashboard' && (
                <AIDashboard />
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, collapsed, onClick }: { icon: React.ReactNode, label: string, active: boolean, collapsed: boolean, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`
        flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200
        ${active 
          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold' 
          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'}
      `}
    >
      <div className={`${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
      </div>
      {!collapsed && <span className="text-sm">{label}</span>}
      {active && !collapsed && (
        <motion.div 
          layoutId="active-pill"
          className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"
        />
      )}
    </div>
  );
}

function StatCard({ label, value, sub, icon }: { label: string, value: string, sub: string, icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-xs text-slate-400">{sub}</p>
          </div>
          <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ChapterProgress({ label, value }: { label: string, value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-slate-500">{value}%</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
}
