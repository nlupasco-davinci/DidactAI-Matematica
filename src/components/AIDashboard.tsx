import React from 'react';
import { motion } from 'motion/react';
import { Brain, Database, FileText, Settings, ShieldCheck, Activity, BarChart3, Binary, Workflow } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { StructuredMLService } from '@/lib/ml/structured';
import { UnstructuredMLService } from '@/lib/ml/unstructured';

const ML_STATS = [
  { name: 'Acuratețe recomandare', value: 92, fill: '#6366f1' },
  { name: 'Match semantic', value: 85, fill: '#8b5cf6' },
  { name: 'Timp procesare (ms)', value: 12, fill: '#10b981' },
  { name: 'Eficiență pipeline', value: 78, fill: '#f59e0b' },
];

export const AIDashboard: React.FC = () => {
  const structuredInfo = StructuredMLService.getModelInfo();
  const unstructuredInfo = UnstructuredMLService.getPipelineInfo();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
          Arhitectura Soluției AI
        </h2>
        <p className="text-slate-500">
          Documentația tehnică a serviciilor Machine Learning integrate local pentru Evaluarea Națională la Matematică pentru clasa a 9-a.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-lg bg-indigo-50/50 dark:bg-indigo-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-600">
              <Database className="w-5 h-5" /> 1. Problemă și importanță
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p><strong>Problema:</strong> Lipsa de personalizare în pregătirea standard pentru examene.</p>
            <p><strong>Obiectiv:</strong> Optimizarea timpului de studiu prin algoritmi de feedback imediat.</p>
            <p><strong>Beneficiar:</strong> Elevii de clasa a VIII-a și a IX-a.</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-600">
              <Workflow className="w-5 h-5" /> 2. Arhitectura
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p><strong>Tip:</strong> Hybrid Local ML (Edge AI).</p>
            <p><strong>Servicii:</strong> 2 modele distincte integrate în frontend pentru zero-latency.</p>
            <p><strong>Scalabilitate:</strong> Arhitectură modulară bazată pe TS/JS.</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-violet-50/50 dark:bg-violet-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-violet-600">
              <ShieldCheck className="w-5 h-5" /> 8. Etică și siguranță
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p><strong>Privacy:</strong> Datele nu părăsesc dispozitivul utilizatorului.</p>
            <p><strong>Bias:</strong> Antrenat pe curriculumul oficial din Republica Moldova.</p>
            <p><strong>Hardening:</strong> Validare strictă a inputului matematic.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service 1: Structured */}
        <Card className="border-none shadow-xl border-t-4 border-t-indigo-500">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Binary className="w-5 h-5 text-indigo-500" /> Serviciu ML: Date Structurate
                </CardTitle>
                <CardDescription>Model de recomandare progresivă</CardDescription>
              </div>
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">Local</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 font-mono text-xs">
              <p className="text-indigo-600 font-bold mb-2">// 3.1 Dataset: {structuredInfo.datasetSize} exerciții</p>
              <div className="space-y-1">
                {structuredInfo.features.map((f, i) => <p key={i}>- Feature {i+1}: {f}</p>)}
                <p>- Preprocessing: {structuredInfo.scaling}</p>
                <p>- Algorithm: {structuredInfo.algorithm}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-semibold flex items-center gap-2">
                <Settings className="w-4 h-4" /> 3.2 Preprocesare
              </p>
              <p className="text-slate-500">Utilizăm One-Hot Encoding pentru categorii și Vectorizarea dificultății pentru a calcula distanța Euclidiană între cunoștințele elevului și exercițiile disponibile.</p>
            </div>
          </CardContent>
        </Card>

        {/* Service 2: Unstructured */}
        <Card className="border-none shadow-xl border-t-4 border-t-violet-500">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-violet-500" /> Serviciu ML: Date Nestructurate
                </CardTitle>
                <CardDescription>Pipeline NLP & Local Semantic Search</CardDescription>
              </div>
              <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">Local</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 font-mono text-xs">
              <p className="text-violet-600 font-bold mb-2">// 4.1 Dataset: Text natural / Interogări</p>
              <div className="space-y-1">
                {unstructuredInfo.stages.map((s, i) => <p key={i}>- Stage {i+1}: {s}</p>)}
                <p>- Intent Classification: {unstructuredInfo.intentClasses.length} clase</p>
                <p>- Model: {unstructuredInfo.name}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4" /> 4.2 Preprocesare
              </p>
              <p className="text-slate-500">Limbaj natural (Română): Pipeline de curățare, eliminare stop-words și stemming pentru a mapa întrebările nestructurate ale elevilor pe schema de ajutor a platformei.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-slate-500" /> Performanța modelelor locale
          </CardTitle>
          <CardDescription>Evaluare numerică a eficienței algoritmilor locali vs cloud.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ML_STATS}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} unit="%" />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={50}>
                {ML_STATS.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
