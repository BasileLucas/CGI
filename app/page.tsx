"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Calendar, { CalendarView } from "../components/calendar";
import {
  Workshop,
  Client,
  CLIENTS,
  COLOR_STYLES,
  getStoredWorkshops,
  saveStoredWorkshops,
  getClientHistory,
  buildClientSummaryText,
} from "../lib/workshops";

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [events, setEvents] = useState<Workshop[]>([]);
  const [viewDate, setViewDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<CalendarView>("month");

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
      return;
    }

    const defaultEvents: Workshop[] = [
      {
        id: "w1",
        title: "Cadrage du programme de modernisation CRM",
        date: "2026-03-10",
        time: "09:00",
        objective:
          "Aligner les équipes métier et IT sur le périmètre fonctionnel cible du futur CRM, identifier les quick wins et sécuriser les dépendances SI.",
        clientId: "c1",
        clientName: "Carrefour",
        clientColor: "blue",
        rawNotes: "",
        synthesisData: {
          risks:
            "Risque de désalignement entre les attentes métier et les capacités du SI existant.",
          infos: "Le sponsor métier souhaite une première version visible dès le T3.",
          decisions: "Validation d’un cadrage par lots fonctionnels.",
          actions: "Formaliser le backlog prioritaire et planifier un atelier de restitution.",
        },
        participants: [],
        prepGuide: "",
      },
      {
        id: "w2",
        title: "Revue des parcours clients omnicanaux",
        date: "2026-03-14",
        time: "14:00",
        objective:
          "Cartographier les parcours clients entre magasin, web et mobile afin d’identifier les points de friction et prioriser les améliorations.",
        clientId: "c1",
        clientName: "Carrefour",
        clientColor: "blue",
        rawNotes: "",
        synthesisData: {
          risks: "Risque de duplication des parcours entre canaux.",
          infos: "Les équipes e-commerce et magasin n’utilisent pas les mêmes référentiels.",
          decisions: "Lancer une cartographie cible commune.",
          actions: "Préparer une analyse des irritants clients par canal.",
        },
        participants: [],
        prepGuide: "",
      },
      {
        id: "w3",
        title: "Cadrage de la refonte du portail voyageurs",
        date: "2026-03-12",
        time: "10:30",
        objective:
          "Définir les objectifs de transformation du portail digital, clarifier les attentes des directions métiers et identifier les impacts organisationnels.",
        clientId: "c2",
        clientName: "SNCF",
        clientColor: "green",
        rawNotes: "",
        synthesisData: {
          risks: "Risque de divergence entre priorités UX et contraintes SI historiques.",
          infos: "Le portail actuel est jugé peu lisible par les métiers.",
          decisions: "Conduire une phase de cadrage centrée sur les parcours prioritaires.",
          actions: "Planifier des interviews utilisateurs et une revue de l’existant.",
        },
        participants: [],
        prepGuide: "",
      },
      {
        id: "w4",
        title: "Gouvernance du programme data mobilité",
        date: "2026-03-18",
        time: "11:00",
        objective:
          "Définir la gouvernance de la donnée, les priorités d’usage et les modalités de pilotage du programme data.",
        clientId: "c2",
        clientName: "SNCF",
        clientColor: "green",
        rawNotes: "",
        synthesisData: {
          risks: "Risque de faible appropriation des règles de gouvernance.",
          infos: "Plusieurs entités produisent des données sans cadre partagé.",
          decisions: "Nommer un référent data par domaine.",
          actions: "Préparer une matrice rôles et responsabilités.",
        },
        participants: [],
        prepGuide: "",
      },
      {
        id: "w5",
        title: "Harmonisation des parcours de souscription",
        date: "2026-03-16",
        time: "09:30",
        objective:
          "Identifier les écarts entre parcours actuels, définir les principes de convergence et aligner les parties prenantes sur la cible.",
        clientId: "c3",
        clientName: "AXA",
        clientColor: "purple",
        rawNotes: "",
        synthesisData: {
          risks: "Risque de résistance au changement sur les parcours historiques.",
          infos: "Les différentes lignes métier ont des pratiques non homogènes.",
          decisions: "Retenir une cible commune avec variantes limitées.",
          actions: "Documenter les écarts et proposer une trajectoire de convergence.",
        },
        participants: [],
        prepGuide: "",
      },
      {
        id: "w6",
        title: "Revue des exigences conformité et sécurité",
        date: "2026-03-20",
        time: "15:30",
        objective:
          "Recenser les contraintes réglementaires et sécurité applicables au projet et formaliser les actions à engager.",
        clientId: "c3",
        clientName: "AXA",
        clientColor: "purple",
        rawNotes: "",
        synthesisData: {
          risks: "Risque de non-conformité si certaines exigences sont traitées trop tard.",
          infos: "Le RSSI demande une revue complète des habilitations.",
          decisions: "Intégrer un point sécurité dans chaque comité projet.",
          actions: "Produire une checklist conformité et sécurité.",
        },
        participants: [],
        prepGuide: "",
      },
      {
        id: "w7",
        title: "Cadrage de la migration vers le cloud",
        date: "2026-03-11",
        time: "13:30",
        objective:
          "Identifier les applications concernées, définir les principes de migration et établir les premières hypothèses de trajectoire.",
        clientId: "c4",
        clientName: "Orange",
        clientColor: "orange",
        rawNotes: "",
        synthesisData: {
          risks: "Risque de sous-estimation des dépendances applicatives.",
          infos: "Certaines applications ont des contraintes fortes de disponibilité.",
          decisions: "Prioriser une approche par vagues de migration.",
          actions: "Construire une cartographie applicative cible.",
        },
        participants: [],
        prepGuide: "",
      },
      {
        id: "w8",
        title: "Atelier de coordination sécurité et infrastructure",
        date: "2026-03-21",
        time: "10:00",
        objective:
          "Aligner les exigences de sécurité avec les contraintes d’infrastructure et définir les mesures de remédiation prioritaires.",
        clientId: "c4",
        clientName: "Orange",
        clientColor: "orange",
        rawNotes: "",
        synthesisData: {
          risks: "Risque de friction entre exigences sécurité et contraintes d’exploitation.",
          infos: "Des écarts ont été remontés sur les environnements non productifs.",
          decisions: "Valider un plan d’action sécurité sur 3 mois.",
          actions: "Prioriser les remédiations et affecter les responsables.",
        },
        participants: [],
        prepGuide: "",
      },
      {
        id: "w9",
        title: "Cadrage de l’amélioration du parcours crédit",
        date: "2026-03-13",
        time: "09:00",
        objective:
          "Identifier les irritants du parcours actuel, formaliser les attentes métier et construire une première trajectoire d’amélioration.",
        clientId: "c5",
        clientName: "BNP Paribas",
        clientColor: "red",
        rawNotes: "",
        synthesisData: {
          risks: "Risque de complexité excessive sur certaines étapes du parcours.",
          infos: "Le taux d’abandon est jugé trop élevé sur la demande en ligne.",
          decisions: "Lancer une analyse détaillée des étapes bloquantes.",
          actions: "Préparer un diagnostic UX et métier.",
        },
        participants: [],
        prepGuide: "",
      },
      {
        id: "w10",
        title: "Atelier de pilotage des actions réglementaires",
        date: "2026-03-24",
        time: "16:00",
        objective:
          "Suivre l’état d’avancement des actions liées aux exigences réglementaires et arbitrer les priorités.",
        clientId: "c5",
        clientName: "BNP Paribas",
        clientColor: "red",
        rawNotes: "",
        synthesisData: {
          risks: "Risque de retard sur certaines actions à fort enjeu de conformité.",
          infos: "Plusieurs chantiers sont dépendants d’arbitrages encore en attente.",
          decisions: "Mettre en place un suivi hebdomadaire des points bloquants.",
          actions: "Consolider le plan d’actions réglementaires d’ici le prochain comité.",
        },
        participants: [],
        prepGuide: "",
      },
    ];

    setEvents(defaultEvents);
    saveStoredWorkshops(defaultEvents);
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
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2),
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
      const updatedEvents = events.filter((event: Workshop) => event.id !== id);
      setEvents(updatedEvents);
      saveStoredWorkshops(updatedEvents);
    }
  };

  const sortedEvents = [...events].sort((a, b) => {
    const aDate = new Date(`${a.date}T${a.time || "00:00"}`).getTime();
    const bDate = new Date(`${b.date}T${b.time || "00:00"}`).getTime();
    return aDate - bDate;
  });

  const goToday = () => {
    setViewDate(new Date());
  };

  const nextPeriod = () => {
    setViewDate((prev) => {
      const next = new Date(prev);

      if (calendarView === "month") {
        return new Date(next.getFullYear(), next.getMonth() + 1, 1);
      }

      if (calendarView === "week") {
        next.setDate(next.getDate() + 7);
        return new Date(next);
      }

      return new Date(next.getFullYear() + 1, 0, 1);
    });
  };

  const prevPeriod = () => {
    setViewDate((prev) => {
      const next = new Date(prev);

      if (calendarView === "month") {
        return new Date(next.getFullYear(), next.getMonth() - 1, 1);
      }

      if (calendarView === "week") {
        next.setDate(next.getDate() - 7);
        return new Date(next);
      }

      return new Date(next.getFullYear() - 1, 0, 1);
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-6 text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white p-2 pr-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-100">
                JD
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">
                  Consultant Senior CGI
                </p>
                <h2 className="text-sm font-bold text-slate-900 leading-none">
                  Jean Dupont
                </h2>
              </div>
            </div>

            <button
              onClick={() => alert("Lien d'invitation copié !")}
              className="bg-white border border-slate-200 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-2"
            >
              <span className="text-blue-600 text-base">+</span>
              Inviter
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

            <Link
              href="/clients"
              className="bg-white border border-slate-200 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
            >
              Vue clients
            </Link>

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
                    const selectedClient = CLIENTS.find(
                      (c: Client) => c.id === e.target.value
                    );

                    setWorkshopData((prev) => ({
                      ...prev,
                      clientId: selectedClient?.id || "",
                      clientName: selectedClient?.name || "",
                      clientColor: selectedClient?.color || "blue",
                    }));
                  }}
                >
                  <option value="">Sélectionner un client</option>
                  {CLIENTS.map((client: Client) => (
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
                  onChange={(e) =>
                    setWorkshopData({ ...workshopData, title: e.target.value })
                  }
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
                  onChange={(e) =>
                    setWorkshopData({ ...workshopData, date: e.target.value })
                  }
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
                  onChange={(e) =>
                    setWorkshopData({ ...workshopData, time: e.target.value })
                  }
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
                  onChange={(e) =>
                    setWorkshopData({ ...workshopData, objective: e.target.value })
                  }
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
                      {selectedClientHistory.slice(0, 3).map((item: Workshop) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl border border-slate-200 p-4"
                        >
                          <p className="text-sm font-black text-slate-800">
                            {item.title}
                          </p>
                          <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">
                            {item.date} {item.time ? `@ ${item.time}` : ""}
                          </p>
                          <p className="text-sm text-slate-600 mt-3">
                            {item.objective}
                          </p>
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

        <Calendar
          events={sortedEvents}
          onDelete={deleteEvent}
          viewDate={viewDate}
          calendarView={calendarView}
          onChangeView={setCalendarView}
          onNext={nextPeriod}
          onPrev={prevPeriod}
          onToday={goToday}
        />
      </div>
    </div>
  );
}