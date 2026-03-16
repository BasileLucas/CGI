"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Calendar, { CalendarView } from "../components/calendar";
import {
  Workshop,
  Client,
  CLIENTS,
  COLOR_STYLES,
  getStoredWorkshops,
  saveStoredWorkshops,
} from "../lib/workshops";

const CLIENTS_STORAGE_KEY = "workshop-pilot-clients";

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [events, setEvents] = useState<Workshop[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [viewDate, setViewDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<CalendarView>("month");

  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: "",
    color: "blue" as Workshop["clientColor"],
  });

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
      ];

      setEvents(defaultEvents);
      saveStoredWorkshops(defaultEvents);
    }

    if (typeof window !== "undefined") {
      const savedClients = localStorage.getItem(CLIENTS_STORAGE_KEY);
      if (savedClients) {
        try {
          const parsedClients: Client[] = JSON.parse(savedClients);
          const mergedClients = [...CLIENTS];

          parsedClients.forEach((savedClient) => {
            if (!mergedClients.some((client) => client.id === savedClient.id)) {
              mergedClients.push(savedClient);
            }
          });

          setClients(mergedClients);
        } catch {
          setClients(CLIENTS);
        }
      } else {
        setClients(CLIENTS);
      }
    }
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      saveStoredWorkshops(events);
    }
  }, [events]);

  useEffect(() => {
    if (clients.length > 0 && typeof window !== "undefined") {
      localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
    }
  }, [clients]);

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
      prepGuide: "",
    };

    const updatedEvents = [...events, newWorkshop];
    setEvents(updatedEvents);
    saveStoredWorkshops(updatedEvents);

    setShowForm(false);
    setShowNewClientForm(false);
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

  const handleCreateClient = () => {
    if (!newClientData.name.trim()) {
      alert("Merci de renseigner un nom de client.");
      return;
    }

    const newClient: Client = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `client-${Math.random().toString(36).slice(2)}`,
      name: newClientData.name.trim(),
      color: newClientData.color,
    };

    const updatedClients = [...clients, newClient];
    setClients(updatedClients);

    setWorkshopData((prev) => ({
      ...prev,
      clientId: newClient.id,
      clientName: newClient.name,
      clientColor: newClient.color,
    }));

    setNewClientData({
      name: "",
      color: "blue",
    });

    setShowNewClientForm(false);
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
                    const selectedClient = clients.find(
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
                  {clients.map((client: Client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setShowNewClientForm(!showNewClientForm)}
                  className="mt-3 text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700"
                >
                  + Nouveau client
                </button>
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

              {showNewClientForm && (
                <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-[28px] p-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                    Créer un nouveau client
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">
                        Nom du client
                      </label>
                      <input
                        placeholder="Ex : Air France"
                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                        value={newClientData.name}
                        onChange={(e) =>
                          setNewClientData({ ...newClientData, name: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">
                        Couleur
                      </label>
                      <select
                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                        value={newClientData.color}
                        onChange={(e) =>
                          setNewClientData({
                            ...newClientData,
                            color: e.target.value as Workshop["clientColor"],
                          })
                        }
                      >
                        <option value="blue">Bleu</option>
                        <option value="green">Vert</option>
                        <option value="purple">Violet</option>
                        <option value="orange">Orange</option>
                        <option value="red">Rouge</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleCreateClient}
                      className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all"
                    >
                      Enregistrer le client
                    </button>
                  </div>
                </div>
              )}

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