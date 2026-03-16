"use client";

import { useState, useEffect } from "react";
import Calendar from "@/components/calendar";

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [workshopData, setWorkshopData] = useState({ 
    title: "", 
    date: "", 
    time: "", 
    objective: "" 
  });

  // ÉTAT POUR LA NAVIGATION DU CALENDRIER
  const [viewDate, setViewDate] = useState(new Date());

  // Chargement initial
  useEffect(() => {
    const savedEvents = localStorage.getItem("workshop-pilot-events");
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    } else {
      setEvents([{ id: "1", title: "Cadrage CRM Client A", date: "2026-03-12", time: "10:00", objective: "Initial" }]);
    }
  }, []);

  // Sauvegarde automatique
  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem("workshop-pilot-events", JSON.stringify(events));
    }
  }, [events]);

  const handleCreate = () => {
    if (!workshopData.title || !workshopData.date || !workshopData.time) return;

    const newWorkshop = {
      id: Math.random().toString(36).substr(2, 9),
      ...workshopData,
      synthesis: "" 
    };

    setEvents([...events, newWorkshop]);
    setShowForm(false);
    setWorkshopData({ title: "", date: "", time: "", objective: "" });
  };

  const deleteEvent = (id: string) => {
    if (confirm("Supprimer cet atelier ?")) {
      const updatedEvents = events.filter(event => event.id !== id);
      setEvents(updatedEvents);
      localStorage.setItem("workshop-pilot-events", JSON.stringify(updatedEvents));
    }
  };

  const sortedEvents = [...events].sort((a, b) => a.time.localeCompare(b.time));

  // FONCTIONS DE NAVIGATION CALENDRIER
  const nextMonth = () => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)));
  const prevMonth = () => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)));

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-6 text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER : PROFIL & ACTIONS --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="flex items-center gap-4">
            {/* Avatar Consultant */}
            <div className="flex items-center gap-3 bg-white p-2 pr-6 rounded-2xl border border-slate-200 shadow-sm transition-hover hover:shadow-md">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-100">
                JD
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Consultant Senior CGI</p>
                <h2 className="text-sm font-bold text-slate-900 leading-none">Jean Dupont</h2>
              </div>
            </div>
            
            {/* Bouton Inviter */}
            <button 
              onClick={() => alert("Lien d'invitation copié !")}
              className="bg-white border border-slate-200 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-2"
            >
              <span className="text-blue-600 text-base">+</span> Inviter
            </button>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="text-right mr-4 hidden md:block">
                <h1 className="text-xl font-black italic tracking-tighter">WorkshopPilot<span className="text-blue-600">.</span></h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Augmented Intelligence</p>
             </div>
            <button 
              onClick={() => setShowForm(!showForm)}
              className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-200 active:scale-95"
            >
              {showForm ? "Fermer" : "Créer un atelier"}
            </button>
          </div>
        </header>

        {/* --- FORMULAIRE DE CRÉATION --- */}
        {showForm && (
          <div className="bg-white rounded-[32px] shadow-2xl border border-blue-50 p-10 mb-10 animate-in slide-in-from-top duration-500">
            <h2 className="text-2xl font-black mb-8 text-slate-900 uppercase tracking-tight italic">✨ Configuration de l'atelier</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Titre du Workshop</label>
                <input 
                  placeholder="ex: Cadrage Stratégique - Architecture Cloud"
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                  value={workshopData.title}
                  onChange={(e) => setWorkshopData({...workshopData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Date d'intervention</label>
                <input 
                  type="date" 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                  value={workshopData.date}
                  onChange={(e) => setWorkshopData({...workshopData, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Heure de début</label>
                <input 
                  type="time" 
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                  value={workshopData.time}
                  onChange={(e) => setWorkshopData({...workshopData, time: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Objectif à atteindre</label>
                <textarea 
                  placeholder="Décrivez les résultats attendus..."
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 h-32 text-slate-800 font-medium resize-none"
                  value={workshopData.objective}
                  onChange={(e) => setWorkshopData({...workshopData, objective: e.target.value})}
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

        {/* --- SECTION CALENDRIER --- */}
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-200 p-10">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-black text-slate-900 capitalize tracking-tighter">
                {viewDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Pilotage en temps réel</p>
              </div>
            </div>
            
            {/* Contrôles de navigation mois */}
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

          {/* Calendrier avec passage de la date de vue et des événements */}
          <Calendar 
            events={sortedEvents} 
            onDelete={deleteEvent} 
            viewDate={viewDate} 
          />
        </div>
      </div>
    </div>
  );
}