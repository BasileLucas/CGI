"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

const DIRECTORY = [
  { id: "p1", name: "Jean Dupont", role: "Senior Manager CGI", color: "bg-blue-500" },
  { id: "p2", name: "Alice Martin", role: "Consultante Cloud", color: "bg-purple-500" },
  { id: "p3", name: "Thomas Durand", role: "DSI Client", color: "bg-orange-500" },
  { id: "p4", name: "Sarah Levêque", role: "Product Owner", color: "bg-green-500" },
  { id: "p5", name: "Kevin Morel", role: "Expert Sécurité", color: "bg-red-500" },
];

const RIDACard = ({ title, color, value, onChange, icon }: any) => {
  const colorMap: any = {
    red: "border-l-red-500 text-red-600",
    blue: "border-l-blue-500 text-blue-600",
    green: "border-l-green-500 text-green-600",
    purple: "border-l-purple-500 text-purple-600",
  };

  return (
    <div className={`bg-white rounded-2xl p-6 border-l-4 ${colorMap[color]} border border-slate-200 shadow-sm`}>
      <h3 className="font-bold mb-4 flex items-center gap-2 uppercase text-[10px] tracking-widest">
        {icon} {title}
      </h3>
      <textarea 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-32 bg-slate-50 rounded-xl p-3 outline-none text-slate-800 text-xs leading-relaxed resize-none" 
        placeholder="..."
      />
    </div>
  );
};

export default function MeetingDetail() {
  const params = useParams();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("prep");
  const [workshop, setWorkshop] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  
  const [rawNotes, setRawNotes] = useState("");
  const [synthesis, setSynthesis] = useState({ risks: "", infos: "", decisions: "", actions: "" });
  const [participants, setParticipants] = useState<any[]>([]);
  const [showDirectory, setShowDirectory] = useState(false);
  const [prepGuide, setPrepGuide] = useState(""); // État pour le guide de préparation

  // 1. CHARGEMENT
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("workshop-pilot-events") || "[]");
    const found = saved.find((e: any) => e.id === params.id);
    if (found) {
      setWorkshop(found);
      setSynthesis(found.synthesisData || { risks: "", infos: "", decisions: "", actions: "" });
      setRawNotes(found.rawNotes || "");
      setParticipants(found.participants || []);
      setPrepGuide(found.prepGuide || "");
    }
  }, [params.id]);

  // 2. SAUVEGARDE
  const saveToStorage = (updatedFields: any) => {
    const saved = JSON.parse(localStorage.getItem("workshop-pilot-events") || "[]");
    const newEvents = saved.map((e: any) => 
      e.id === params.id ? { ...e, ...updatedFields } : e
    );
    localStorage.setItem("workshop-pilot-events", JSON.stringify(newEvents));
  };

  // 3. ACTIONS PARTICIPANTS
  const toggleParticipant = (person: any) => {
    const isSelected = participants.some(p => p.id === person.id);
    const updated = isSelected 
      ? participants.filter(p => p.id !== person.id) 
      : [...participants, person];
    
    setParticipants(updated);
    saveToStorage({ participants: updated });
  };

  // 4. GÉNÉRATION IA (RIDA ou PREP)
  const generateIA = async (mode: "RIDA" | "PREP") => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: mode, 
          prompt: mode === "RIDA" ? rawNotes : workshop.objective, 
          context: workshop.title 
        }),
      });
      const data = await res.json();
      
      if (mode === "RIDA") {
        const jsonMatch = data.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          setSynthesis(result);
          saveToStorage({ synthesisData: result, rawNotes });
        }
      } else {
        setPrepGuide(data.text);
        saveToStorage({ prepGuide: data.text });
      }
    } catch (e) {
      console.error("Erreur IA:", e);
      alert("Erreur lors de la génération");
    } finally {
      setAiLoading(false);
    }
  };

  if (!workshop) return <div className="p-10 font-bold">Chargement de l'atelier...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* HEADER FIXE */}
      <div className="bg-white border-b border-slate-200 p-8 mb-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button onClick={() => router.push('/')} className="text-xs font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-all">
            ← Dashboard
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">{workshop.title}</h1>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.3em] mt-2 italic">
              {workshop.date} @ {workshop.time}
            </p>
          </div>
          <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all">
            Exporter PDF
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* COLONNE GAUCHE : CONTENU PRINCIPAL */}
        <div className="lg:col-span-2 space-y-8">
          {/* NAVIGATION ONGLETS */}
          <div className="flex gap-10 border-b border-slate-200">
            <button 
              onClick={() => setActiveTab("prep")} 
              className={`pb-4 text-[10px] font-black tracking-[0.2em] transition-all ${activeTab === "prep" ? "text-blue-600 border-b-4 border-blue-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              CADRAGE
            </button>
            <button 
              onClick={() => setActiveTab("rida")} 
              className={`pb-4 text-[10px] font-black tracking-[0.2em] transition-all ${activeTab === "rida" ? "text-blue-600 border-b-4 border-blue-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              SYNTHÈSE RIDA
            </button>
          </div>

          {/* CONTENU ONGLETS */}
          <div className="min-h-[500px]">
            {activeTab === "rida" ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 italic">🎙️ Prise de notes brute</h3>
                    <textarea 
                      value={rawNotes} 
                      onChange={(e) => setRawNotes(e.target.value)}
                      className="w-full h-56 bg-slate-800/50 rounded-3xl p-6 outline-none border border-slate-700 text-sm mb-6 text-slate-200 placeholder:text-slate-500" 
                      placeholder="Tapez vos notes ici (les décisions, les actions, les râlements du client...)" 
                    />
                    <button 
                      onClick={() => generateIA("RIDA")} 
                      disabled={aiLoading}
                      className="w-full bg-blue-600 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/50"
                    >
                      {aiLoading ? "L'IA analyse vos notes..." : "🪄 Transformer en RIDA Stratégique"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <RIDACard title="Risques" color="red" icon="⚠️" value={synthesis.risks} onChange={(v:any) => { setSynthesis({...synthesis, risks:v}); saveToStorage({synthesisData: {...synthesis, risks:v}}); }} />
                  <RIDACard title="Informations" color="blue" icon="ℹ️" value={synthesis.infos} onChange={(v:any) => { setSynthesis({...synthesis, infos:v}); saveToStorage({synthesisData: {...synthesis, infos:v}}); }} />
                  <RIDACard title="Décisions" color="green" icon="✅" value={synthesis.decisions} onChange={(v:any) => { setSynthesis({...synthesis, decisions:v}); saveToStorage({synthesisData: {...synthesis, decisions:v}}); }} />
                  <RIDACard title="Actions" color="purple" icon="🚀" value={synthesis.actions} onChange={(v:any) => { setSynthesis({...synthesis, actions:v}); saveToStorage({synthesisData: {...synthesis, actions:v}}); }} />
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-[40px] p-10 border border-slate-200 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Objectif de l'atelier</h3>
                  <p className="text-xl font-bold text-slate-800 leading-relaxed mb-10">{workshop.objective}</p>
                  
                  <div className="p-8 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 min-h-[200px]">
                    {prepGuide ? (
                      <div className="prose prose-slate text-sm whitespace-pre-wrap font-medium text-slate-600">
                        {prepGuide}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-sm text-slate-400 font-bold mb-6 italic">Besoin d'aide pour préparer cet atelier ?</p>
                        <button 
                          onClick={() => generateIA("PREP")}
                          disabled={aiLoading}
                          className="bg-white border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          {aiLoading ? "Préparation..." : "Générer mon guide d'animation"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLONNE DROITE : PARTICIPANTS */}
        <div className="space-y-6">
          <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm sticky top-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Participants</h3>
              <button 
                onClick={() => setShowDirectory(!showDirectory)}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold transition-all shadow-sm ${showDirectory ? 'bg-red-500 text-white rotate-45' : 'bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white'}`}
              >
                +
              </button>
            </div>

            {/* ANNUAIRE FLOTTANT */}
            {showDirectory && (
              <div className="mb-8 p-4 bg-slate-50 rounded-[24px] border border-slate-200 space-y-2 animate-in zoom-in-95 duration-200">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-3 px-2">Annuaire CGI / Client</p>
                {DIRECTORY.map((person) => {
                  const isSelected = participants.some(p => p.id === person.id);
                  return (
                    <button
                      key={person.id}
                      onClick={() => toggleParticipant(person)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${isSelected ? 'bg-blue-100 border-blue-200' : 'hover:bg-white bg-transparent border-transparent'} border`}
                    >
                      <div className={`w-8 h-8 ${person.color} rounded-lg flex items-center justify-center text-white text-[10px] font-black shadow-sm`}>
                        {person.name[0]}
                      </div>
                      <div className="text-left">
                        <p className="text-[11px] font-black text-slate-800 leading-none">{person.name}</p>
                        <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-tighter">{person.role}</p>
                      </div>
                      {isSelected && <span className="ml-auto text-blue-600 font-bold">✓</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {/* LISTE DES SÉLECTIONNÉS */}
            <div className="space-y-4">
            {participants.length > 0 ? (
                participants.map((p, index) => (
                // On utilise p.id s'il existe, sinon l'index pour garantir l'unicité
                <div key={p.id || `participant-${index}`} className="flex items-center gap-4 p-1 group">
                    <div className={`w-12 h-12 ${p.color || 'bg-slate-400'} rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-100`}>
                    {p.name ? p.name[0] : "?"}
                    </div>
                    <div>
                    <p className="text-sm font-black text-slate-800 leading-none">{p.name || "Inconnu"}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">{p.role || "Externe"}</p>
                    </div>
                    <button 
                    onClick={() => toggleParticipant(p)}
                    className="ml-auto w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all text-[8px]"
                    >
                    ✕
                    </button>
                </div>
                ))
            ) : (
                <p className="text-xs text-slate-400 font-bold italic py-4">Aucun participant sélectionné.</p>
            )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}