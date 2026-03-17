"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Workshop,
  Participant,
  DIRECTORY,
  COLOR_STYLES,
  defaultSynthesis,
  getStoredWorkshops,
  saveStoredWorkshops,
  getClientHistory,
  buildClientSummaryText,
} from "../../../lib/workshops";

const RIDACard = ({
  title,
  color,
  value,
  onChange,
  icon,
}: {
  title: string;
  color: "red" | "blue" | "green" | "purple";
  value: string;
  onChange: (value: string) => void;
  icon: string;
}) => {
  const colorMap = {
    red: "border-l-red-500 text-red-600",
    blue: "border-l-blue-500 text-blue-600",
    green: "border-l-green-500 text-green-600",
    purple: "border-l-purple-500 text-purple-600",
  };

  return (
    <div
      className={`bg-white rounded-2xl p-6 border-l-4 ${colorMap[color]} border border-slate-200 shadow-sm`}
    >
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
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<"prep" | "rida">("prep");
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  const [rawNotes, setRawNotes] = useState("");
  const [synthesis, setSynthesis] = useState(defaultSynthesis());
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [showDirectory, setShowDirectory] = useState(false);
  const [prepGuide, setPrepGuide] = useState("");
  const [clientHistory, setClientHistory] = useState<Workshop[]>([]);
  const [importedFileName, setImportedFileName] = useState("");

  useEffect(() => {
    const saved = getStoredWorkshops();
    const found = saved.find((e: Workshop) => e.id === params.id);

    if (found) {
      setWorkshop(found);
      setSynthesis(found.synthesisData || defaultSynthesis());
      setRawNotes(found.rawNotes || "");
      setParticipants(found.participants || []);
      setPrepGuide(found.prepGuide || "");
      setClientHistory(getClientHistory(saved, found.clientId, found.id));
    }
  }, [params.id]);

  const saveToStorage = (updatedFields: Partial<Workshop>) => {
    if (!workshop) return;

    const saved = getStoredWorkshops();
    const newEvents = saved.map((e: Workshop) =>
      e.id === workshop.id
        ? {
            ...e,
            ...updatedFields,
          }
        : e
    );

    saveStoredWorkshops(newEvents);

    const updatedWorkshop = newEvents.find((e: Workshop) => e.id === workshop.id) || null;
    setWorkshop(updatedWorkshop);

    if (updatedWorkshop) {
      setClientHistory(
        getClientHistory(newEvents, updatedWorkshop.clientId, updatedWorkshop.id)
      );
    }
  };

  const toggleParticipant = (person: Participant) => {
    const isSelected = participants.some((p: Participant) => p.id === person.id);
    const updated = isSelected
      ? participants.filter((p: Participant) => p.id !== person.id)
      : [...participants, person];

    setParticipants(updated);
    saveToStorage({ participants: updated });
  };

  const clientSummary = useMemo(() => {
    if (clientHistory.length === 0) return "";
    return buildClientSummaryText(clientHistory);
  }, [clientHistory]);

  const normalizeImportedText = (text: string) => {
    return text
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  const extractTextFromTxtOrMd = async (file: File) => {
    const text = await file.text();
    return normalizeImportedText(text);
  };

  const extractTextFromDocx = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({
      arrayBuffer,
    });

    return normalizeImportedText(result.value || "");
  };

  const extractTextFromPdf = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

    const loadingTask = pdfjs.getDocument(new Uint8Array(arrayBuffer));

    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => ("str" in item ? item.str : ""))
        .join(" ");

      fullText += `${pageText}\n\n`;
    }

    return normalizeImportedText(fullText);
  };

  const handleImportedFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportLoading(true);

    try {
      const lowerName = file.name.toLowerCase();
      let extractedText = "";

      if (lowerName.endsWith(".txt") || lowerName.endsWith(".md")) {
        extractedText = await extractTextFromTxtOrMd(file);
      } else if (lowerName.endsWith(".docx")) {
        extractedText = await extractTextFromDocx(file);
      } else if (lowerName.endsWith(".pdf")) {
        extractedText = await extractTextFromPdf(file);
      } else {
        alert("Formats supportés : .txt, .md, .docx, .pdf");
        return;
      }

      if (!extractedText.trim()) {
        alert("Le fichier a bien été importé, mais aucun texte exploitable n’a été détecté.");
        return;
      }

      setRawNotes(extractedText);
      setImportedFileName(file.name);
      saveToStorage({ rawNotes: extractedText });
      setActiveTab("rida");
    } catch (error) {
      console.error("Erreur import fichier :", error);
      alert(
        "Impossible de lire ce fichier. Pour le MVP, privilégiez un .txt, .md, .docx ou un PDF contenant du texte sélectionnable."
      );
    } finally {
      setImportLoading(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const generateIA = async (mode: "RIDA" | "PREP") => {
    if (!workshop) return;

    if (mode === "RIDA" && !rawNotes.trim()) {
      alert("Merci de saisir ou importer des notes avant de lancer l’analyse RIDA.");
      return;
    }

    setAiLoading(true);

    try {
      
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: mode,
          prompt: mode === "RIDA" ? rawNotes : workshop.objective,
          
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

  if (!workshop) {
    return <div className="p-10 font-bold">Chargement de l'atelier...</div>;
  }

  const clientStyle = COLOR_STYLES[workshop.clientColor || "blue"];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="bg-white border-b border-slate-200 p-8 mb-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-6">
          <button
            onClick={() => router.push("/")}
            className="text-xs font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-all"
          >
            ← Dashboard
          </button>

          <div className="text-center">
            <div
              className={`inline-flex items-center px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-4 ${clientStyle.badge}`}
            >
              {workshop.clientName}
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
              {workshop.title}
            </h1>
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
        <div className="lg:col-span-2 space-y-8">
          <div className="flex gap-10 border-b border-slate-200">
            <button
              onClick={() => setActiveTab("prep")}
              className={`pb-4 text-[10px] font-black tracking-[0.2em] transition-all ${
                activeTab === "prep"
                  ? "text-blue-600 border-b-4 border-blue-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              CADRAGE
            </button>
            <button
              onClick={() => setActiveTab("rida")}
              className={`pb-4 text-[10px] font-black tracking-[0.2em] transition-all ${
                activeTab === "rida"
                  ? "text-blue-600 border-b-4 border-blue-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              SYNTHÈSE RIDA
            </button>
          </div>

          <div className="min-h-[500px]">
            {activeTab === "rida" ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                      <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic">
                        🎙️ Prise de notes brute
                      </h3>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-white/10 border border-white/20 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                        >
                          {importLoading ? "Import..." : "Importer un fichier"}
                        </button>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".txt,.md,.docx,.pdf,text/plain,text/markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={handleImportedFile}
                          className="hidden"
                        />
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 mb-4">
                      Vous pouvez saisir vos notes directement dans l’application ou importer
                      un fichier <span className="font-black">.txt</span>,{" "}
                      <span className="font-black">.md</span>,{" "}
                      <span className="font-black">.docx</span> ou{" "}
                      <span className="font-black">.pdf</span>.
                    </p>

                    {importedFileName && (
                      <div className="mb-4 inline-flex items-center gap-2 bg-white/10 border border-white/10 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-200">
                        Fichier importé : {importedFileName}
                      </div>
                    )}

                    <textarea
                      value={rawNotes}
                      onChange={(e) => {
                        setRawNotes(e.target.value);
                        saveToStorage({ rawNotes: e.target.value });
                      }}
                      className="w-full h-56 bg-slate-800/50 rounded-3xl p-6 outline-none border border-slate-700 text-sm mb-6 text-slate-200 placeholder:text-slate-500"
                      placeholder="Tapez vos notes ici ou importez un fichier pris pendant la réunion..."
                    />

                    <div className="flex flex-col md:flex-row gap-4">
                      <button
                        onClick={() => generateIA("RIDA")}
                        disabled={aiLoading}
                        className="flex-1 bg-blue-600 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/50"
                      >
                        {aiLoading
                          ? "L'IA analyse vos notes..."
                          : "🪄 Transformer en RIDA stratégique"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setRawNotes("");
                          setImportedFileName("");
                          saveToStorage({ rawNotes: "" });
                        }}
                        className="bg-white/10 border border-white/10 px-6 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-white/20 transition-all"
                      >
                        Vider les notes
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <RIDACard
                    title="Risques"
                    color="red"
                    icon="⚠️"
                    value={synthesis.risks}
                    onChange={(v) => {
                      const updated = { ...synthesis, risks: v };
                      setSynthesis(updated);
                      saveToStorage({ synthesisData: updated });
                    }}
                  />
                  <RIDACard
                    title="Informations"
                    color="blue"
                    icon="ℹ️"
                    value={synthesis.infos}
                    onChange={(v) => {
                      const updated = { ...synthesis, infos: v };
                      setSynthesis(updated);
                      saveToStorage({ synthesisData: updated });
                    }}
                  />
                  <RIDACard
                    title="Décisions"
                    color="green"
                    icon="✅"
                    value={synthesis.decisions}
                    onChange={(v) => {
                      const updated = { ...synthesis, decisions: v };
                      setSynthesis(updated);
                      saveToStorage({ synthesisData: updated });
                    }}
                  />
                  <RIDACard
                    title="Actions"
                    color="purple"
                    icon="🚀"
                    value={synthesis.actions}
                    onChange={(v) => {
                      const updated = { ...synthesis, actions: v };
                      setSynthesis(updated);
                      saveToStorage({ synthesisData: updated });
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-[40px] p-10 border border-slate-200 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                    Objectif de l'atelier
                  </h3>
                  <p className="text-xl font-bold text-slate-800 leading-relaxed mb-10">
                    {workshop.objective}
                  </p>

                  {clientSummary && (
                    <div className="mb-8 bg-slate-50 rounded-[32px] border border-slate-200 p-8">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                        Mémoire consolidée du client
                      </h3>
                      <pre className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700 font-sans">
                        {clientSummary}
                      </pre>
                    </div>
                  )}

                  <div className="p-8 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 min-h-[200px]">
                    {prepGuide ? (
                      <div className="prose prose-slate text-sm whitespace-pre-wrap font-medium text-slate-600">
                        {prepGuide}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-sm text-slate-400 font-bold mb-6 italic">
                          Besoin d'aide pour préparer cet atelier ?
                        </p>
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

                <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                    Historique client
                  </h3>

                  {clientHistory.length > 0 ? (
                    <div className="space-y-4">
                      {clientHistory.slice(0, 5).map((item) => (
                        <div
                          key={item.id}
                          className="p-5 rounded-2xl bg-slate-50 border border-slate-200"
                        >
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <p className="text-sm font-black text-slate-800">
                              {item.title}
                            </p>
                            <span
                              className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${clientStyle.badge}`}
                            >
                              {item.clientName}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">
                            {item.date} {item.time ? `@ ${item.time}` : ""}
                          </p>
                          <p className="text-sm text-slate-600 mt-3">{item.objective}</p>

                          {item.synthesisData && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="bg-white rounded-xl p-3 border border-slate-200">
                                <p className="text-[10px] font-black uppercase text-green-600 mb-2">
                                  Décisions
                                </p>
                                <p className="text-xs text-slate-600 whitespace-pre-wrap">
                                  {item.synthesisData.decisions || "Non renseigné"}
                                </p>
                              </div>
                              <div className="bg-white rounded-xl p-3 border border-slate-200">
                                <p className="text-[10px] font-black uppercase text-purple-600 mb-2">
                                  Actions
                                </p>
                                <p className="text-xs text-slate-600 whitespace-pre-wrap">
                                  {item.synthesisData.actions || "Non renseigné"}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 font-bold italic py-4">
                      Aucun atelier précédent pour ce client.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm sticky top-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Participants
              </h3>
              <button
                onClick={() => setShowDirectory(!showDirectory)}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold transition-all shadow-sm ${
                  showDirectory
                    ? "bg-red-500 text-white rotate-45"
                    : "bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white"
                }`}
              >
                +
              </button>
            </div>

            {showDirectory && (
              <div className="mb-8 p-4 bg-slate-50 rounded-[24px] border border-slate-200 space-y-2 animate-in zoom-in-95 duration-200">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-3 px-2">
                  Annuaire CGI / Client
                </p>
                {DIRECTORY.map((person: Participant) => {
                  const isSelected = participants.some((p: Participant) => p.id === person.id);
                  return (
                    <button
                      key={person.id}
                      onClick={() => toggleParticipant(person)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                        isSelected
                          ? "bg-blue-100 border-blue-200"
                          : "hover:bg-white bg-transparent border-transparent"
                      } border`}
                    >
                      <div
                        className={`w-8 h-8 ${person.color} rounded-lg flex items-center justify-center text-white text-[10px] font-black shadow-sm`}
                      >
                        {person.name[0]}
                      </div>
                      <div className="text-left">
                        <p className="text-[11px] font-black text-slate-800 leading-none">
                          {person.name}
                        </p>
                        <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-tighter">
                          {person.role}
                        </p>
                      </div>
                      {isSelected && <span className="ml-auto text-blue-600 font-bold">✓</span>}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="space-y-4">
              {participants.length > 0 ? (
                participants.map((p, index) => (
                  <div key={p.id || `participant-${index}`} className="flex items-center gap-4 p-1 group">
                    <div
                      className={`w-12 h-12 ${p.color || "bg-slate-400"} rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-100`}
                    >
                      {p.name ? p.name[0] : "?"}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 leading-none">
                        {p.name || "Inconnu"}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">
                        {p.role || "Externe"}
                      </p>
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
                <p className="text-xs text-slate-400 font-bold italic py-4">
                  Aucun participant sélectionné.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 