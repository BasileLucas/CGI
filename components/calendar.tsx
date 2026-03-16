"use client";

import Link from "next/link";

interface Workshop {
  id: string;
  title: string;
  date: string;
  time?: string;
}

export default function Calendar({ 
  events = [], 
  onDelete,
  viewDate // On reçoit la date actuelle de navigation
}: { 
  events: Workshop[], 
  onDelete: (id: string) => void,
  viewDate: Date 
}) {
  
  // --- LOGIQUE GÉNÉRATION DU MOIS ---
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // 1. Nombre de jours dans le mois (ex: 28, 30 ou 31)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // 2. Jour de la semaine où commence le mois (0 = Dimanche, 1 = Lundi...)
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // 3. Création des tableaux pour la grille
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptySlots = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-sm">
      {/* En-tête des jours */}
      <div className="grid grid-cols-7 bg-slate-50/50 border-b border-slate-200">
        {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((d) => (
          <div key={d} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {d}
          </div>
        ))}
      </div>

      {/* Grille des jours */}
      <div className="grid grid-cols-7 auto-rows-[130px]">
        {/* Cases vides pour le début du mois */}
        {emptySlots.map((slot) => (
          <div key={`empty-${slot}`} className="border-r border-b border-slate-50 bg-slate-50/20" />
        ))}

        {/* Jours du mois */}
        {daysArray.map((day) => {
          // Formatage YYYY-MM-DD correct pour la comparaison
          const dateString = `${year}-${(month + 1).toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
          const dayEvents = events.filter((e) => e.date === dateString);

          return (
            <div key={day} className="border-r border-b border-slate-100 p-3 hover:bg-blue-50/30 transition-all group relative">
              <span className="text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                {day}
              </span>
              
              <div className="mt-2 space-y-1.5 overflow-y-auto max-h-[85px] scrollbar-hide">
                {dayEvents.map((event) => (
                  <div key={event.id} className="relative group/event">
                    <Link 
                      href={`/meeting/${event.id}`}
                      className="block px-2 py-1.5 text-[9px] font-bold leading-tight bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 truncate pr-6 transition-all"
                    >
                      {event.time && <span className="opacity-80 mr-1">{event.time}</span>}
                      {event.title}
                    </Link>
                    
                    {/* Bouton de suppression */}
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        onDelete(event.id);
                      }}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover/event:opacity-100 bg-red-500 hover:bg-red-600 text-white rounded-md w-4 h-4 flex items-center justify-center text-[8px] transition-all shadow-md"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}