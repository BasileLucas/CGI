"use client";

import { useEffect, useMemo, useState } from "react";
import Calendar from "@/components/calendar";
import {
  Workshop,
  CLIENTS,
  COLOR_STYLES,
  getStoredWorkshops,
  saveStoredWorkshops,
  getClientHistory,
  buildClientSummaryText,
} from "@/lib/workshops";

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [events, setEvents] = useState<Workshop[]>([]);
  const [viewDate, setViewDate] = useState(new Date());

  const [workshopData, setWorkshopData] = useState({
    title: "",
    date: "",
    time: "",
    objective: "",
    clientId: "",
    clientName: "",
    clientColor: "blue" as Workshop["clientColor"],
  });

  useEffect(() => {
    const savedEvents = getStoredWorkshops();

    if (savedEvents.length > 0) {
      setEvents(savedEvents);
    } else {
      const defaultEvents: Workshop[] = [
        {
          id: "1",
          title: "Cadrage CRM Client A",
          date: "2026-03-12",
          time: "10:00",
          objective: "Clarifier le périmètre fonctionnel du CRM",
          clientId: "c1",
          clientName: "Client A",
          clientColor: "blue",
          rawNotes: "",
          synthesisData: { risks: "", infos: "", decisions: "", actions: "" },
          participants: [],
          prepGuide: "",
        },
      ];
      setEvents(defaultEvents);
      saveStoredWorkshops(defaultEvents);
    }
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      saveStoredWorkshops(events);
    }
  }, [events]);

  const selectedClientHistory = useMemo(() => {
    if (!workshopData.clientId) return [];
    return getClientHistory(events, workshopData.clientId);
  }, [events, workshopData.clientId]);

  const selectedClientSummary = useMemo(() => {
    if (selectedClientHistory.length === 0) return "";
    return buildClientSummaryText(selectedClientHistory);
  }, [selectedClientHistory]);

  const handleCreate = () => {
    if (
      !workshopData.title ||
      !workshopData.date ||
      !workshopData.time ||
      !workshopData.objective ||
      !workshopData.clientId
    ) {
      alert("Merci de renseigner le client, le titre, la date, l'heure et l'objectif.");
      return;
    }

    const newWorkshop: Workshop = {
      id: crypto.randomUUID(),
      title: workshopData.title,
      date: workshopData.date,
      time: workshopData.time,
      objective: workshopData.objective,
      clientId: workshopData.clientId,
      clientName: workshopData.clientName,
      clientColor: workshopData.clientColor,
      rawNotes: "",
      synthesisData: { risks: "", infos: "", decisions: "", actions: "" },
      participants: [],
      prepGuide: selectedClientSummary
        ? `Contexte consolidé avant atelier :\n\n${selectedClientSummary}`
        : "",
    };

    const updatedEvents = [...events, newWorkshop];
    setEvents(updatedEvents);
    saveStoredWorkshops(updatedEvents);

    setShowForm(false);
    setWorkshopData({
      title: "",
      date: "",
      time: "",
      objective: "",
      clientId: "",
      clientName: "",
      clientColor: "blue",
    });
  };

  const deleteEvent = (id: string) => {
    if (confirm("Supprimer cet atelier ?")) {
      const updatedEvents = events.filter((event) => event.id !== id);
      setEvents(updatedEvents);
      saveStoredWorkshops(updatedEvents);
    }
  };

  const sortedEvents = [...events].sort((a, b) => {
    const aDate = new Date(`${a.date}T${a.time || "00:00"}`).getTime();
    const bDate = new Date(`${b.date}T${b.time || "00:00"}`).getTime();
    return aDate - bDate;
  });

  const nextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-6 text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white p-2 pr-6 rounded-2xl border border-slate-200 shadow-sm transition-hover hover:shadow-md">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-100">
                JD
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">
                  Consultant Senior CGI
                </p>
                <h2 className="text-sm font-bold text-slate-900 leading-none">Jean Dupont</h2>
              </div>
            </div>

            <button
              onClick={() => alert("Lien d'invitation copié !")}
              className="bg-white border border-slate-200 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-2"
            >
              <span className="text-blue-600 text-base">+</span> Inviter
            </button>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="text-right mr-4 hidden md:block">
              <h1 className="text-xl font-black italic tracking-tighter">
                WorkshopPilot<span className="text-blue-600">.</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Augmented Intelligence
              </p>
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-200 active:scale-95"
            >
              {showForm ? "Fermer" : "Créer un atelier"}
            </button>
          </div>
        </header>

        {showForm && (
          <div className="bg-white rounded-[32px] shadow-2xl border border-blue-50 p-10 mb-10 animate-in slide-in-from-top duration-500">
            <h2 className="text-2xl font-black mb-8 text-slate-900 uppercase tracking-tight italic">
              ✨ Configuration de l'atelier
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">
                  Client
                </label>
                <select
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                  value={workshopData.clientId}
                  onChange={(e) => {
                    const selectedClient = CLIENTS.find((c) => c.id === e.target.value);
                    setWorkshopData((prev) => ({
                      ...prev,
                      clientId: selectedClient?.id || "",
                      clientName: selectedClient?.name || "",
                      clientColor: selectedClient?.color || "blue",
                    }));
                  }}
                >
                  <option value="">Sélectionner un client</option>
                  {CLIENTS.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                {workshopData.clientId && (
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-3 rounded-2xl border font-black text-xs uppercase tracking-widest ${COLOR_STYLES[workshopData.clientColor].soft} ${COLOR_STYLES[workshopData.clientColor].border} ${COLOR_STYLES[workshopData.clientColor].text}`}
                  >
                    <span
                      className={`w-3 h-3 rounded-full ${COLOR_STYLES[workshopData.clientColor].badge.split(" ")[0]}`}
                    />
                    {workshopData.clientName}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">
                  Titre du Workshop
                </label>
                <input
                  placeholder="ex: Cadrage Stratégique - Architecture Cloud"
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                  value={workshopData.title}
                  onChange={(e) => setWorkshopData({ ...workshopData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">
                  Date d'intervention
                </label>
                <input
                  type="date"
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                  value={workshopData.date}
                  onChange={(e) => setWorkshopData({ ...workshopData, date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">
                  Heure de début
                </label>
                <input
                  type="time"
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                  value={workshopData.time}
                  onChange={(e) => setWorkshopData({ ...workshopData, time: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">
                  Objectif à atteindre
                </label>
                <textarea
                  placeholder="Décrivez les résultats attendus..."
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 h-32 text-slate-800 font-medium resize-none"
                  value={workshopData.objective}
                  onChange={(e) => setWorkshopData({ ...workshopData, objective: e.target.value })}
                />
              </div>
            </div>

            {workshopData.clientId && (
              <div className="mb-8 bg-slate-50 rounded-[28px] border border-slate-200 p-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                  Mémoire client avant nouvel atelier
                </h3>

                {selectedClientHistory.length > 0 ? (
                  <>
                    <p className="text-sm font-bold text-slate-700 mb-4">
                      {selectedClientHistory.length} atelier(s) précédent(s) retrouvé(s) pour{" "}
                      {workshopData.clientName}
                    </p>

                    <div className="space-y-3 mb-6">
                      {selectedClientHistory.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl border border-slate-200 p-4"
                        >
                          <p className="text-sm font-black text-slate-800">{item.title}</p>
                          <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">
                            {item.date} {item.time ? `@ ${item.time}` : ""}
                          </p>
                          <p className="text-sm text-slate-600 mt-3">{item.objective}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-slate-900 rounded-3xl p-6 text-white">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-3">
                        Synthèse consolidée
                      </p>
                      <pre className="whitespace-pre-wrap text-xs leading-relaxed text-slate-200 font-sans">
                        {selectedClientSummary}
                      </pre>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-500 font-bold italic">
                    Aucun historique disponible pour ce client. Cet atelier servira de base de
                    capitalisation.
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleCreate}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-black transition-all shadow-2xl"
            >
              Ajouter au planning stratégique
            </button>
          </div>
        )}

        <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 p-10">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 capitalize tracking-tighter">
                {viewDate.toLocaleString("fr-FR", { month: "long", year: "numeric" })}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                  Pilotage en temps réel
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={prevMonth}
                className="w-12 h-12 rounded-2xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all font-bold text-slate-600 shadow-sm active:scale-90"
              >
                ←
              </button>
              <button
                onClick={nextMonth}
                className="w-12 h-12 rounded-2xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all font-bold text-slate-600 shadow-sm active:scale-90"
              >
                →
              </button>
            </div>
          </div>

          <Calendar events={sortedEvents} onDelete={deleteEvent} viewDate={viewDate} />
        </div>
      </div>
    </div>
  );
}