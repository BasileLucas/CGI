"use client";

import Link from "next/link";
import { Workshop, COLOR_STYLES } from "../lib/workshops";

export type CalendarView = "month" | "week" | "year";

type CalendarProps = {
  events: Workshop[];
  onDelete: (id: string) => void;
  viewDate: Date;
  calendarView: CalendarView;
  onChangeView: (view: CalendarView) => void;
  onNext: () => void;
  onPrev: () => void;
  onToday: () => void;
};

type ViewProps = {
  events: Workshop[];
  viewDate: Date;
  onDelete: (id: string) => void;
};

type EventPillProps = {
  event: Workshop;
  onDelete: (id: string) => void;
  compact?: boolean;
};

const WEEK_DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return formatDateKey(a) === formatDateKey(b);
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

function getMonthGrid(viewDate: Date): Date[] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const firstWeekday = (firstDay.getDay() + 6) % 7;
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - firstWeekday);

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return date;
  });
}

function getYearMonths(viewDate: Date): Date[] {
  const year = viewDate.getFullYear();
  return Array.from({ length: 12 }, (_, month) => new Date(year, month, 1));
}

function getHeaderLabel(viewDate: Date, view: CalendarView): string {
  if (view === "month") {
    return viewDate.toLocaleString("fr-FR", { month: "long", year: "numeric" });
  }

  if (view === "week") {
    const weekDays = getWeekDays(viewDate);
    const start = weekDays[0];
    const end = weekDays[6];
    return `${start.getDate()} ${start.toLocaleString("fr-FR", {
      month: "short",
    })} – ${end.getDate()} ${end.toLocaleString("fr-FR", {
      month: "short",
      year: "numeric",
    })}`;
  }

  return viewDate.getFullYear().toString();
}

const EventPill = ({ event, onDelete, compact = false }: EventPillProps) => {
  const colorStyle = COLOR_STYLES[event.clientColor || "blue"];

  return (
    <div className="relative group/event">
      <Link
        href={`/meeting/${event.id}`}
        className={`block rounded-2xl text-white shadow-sm transition-all ${colorStyle.calendar} ${
          compact ? "px-2 py-1 text-[10px]" : "px-3 py-2 text-[11px]"
        }`}
        title={`${event.clientName} — ${event.title}`}
      >
        <div className="truncate font-black">
          {event.time ? `${event.time} · ` : ""}
          {event.title}
        </div>
        {!compact && (
          <div className="truncate text-[10px] opacity-80 mt-1">{event.clientName}</div>
        )}
      </Link>

      <button
        onClick={(e) => {
          e.preventDefault();
          onDelete(event.id);
        }}
        className="absolute right-2 top-2 opacity-0 group-hover/event:opacity-100 bg-black/25 hover:bg-red-500 text-white rounded-lg w-5 h-5 flex items-center justify-center text-[10px] transition-all"
      >
        ✕
      </button>
    </div>
  );
};

const MonthView = ({ events, viewDate, onDelete }: ViewProps) => {
  const gridDays = getMonthGrid(viewDate);
  const currentMonth = viewDate.getMonth();

  return (
    <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/70">
        {WEEK_DAYS.map((day) => (
          <div
            key={day}
            className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-[150px]">
        {gridDays.map((date) => {
          const dateKey = formatDateKey(date);
          const dayEvents = events
            .filter((e) => e.date === dateKey)
            .sort((a, b) => (a.time || "").localeCompare(b.time || ""));
          const inCurrentMonth = date.getMonth() === currentMonth;

          return (
            <div
              key={dateKey}
              className={`border-r border-b border-slate-100 p-3 transition-all hover:bg-slate-50/70 ${
                !inCurrentMonth ? "bg-slate-50/40" : "bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                    isToday(date)
                      ? "bg-slate-900 text-white"
                      : inCurrentMonth
                      ? "text-slate-700"
                      : "text-slate-300"
                  }`}
                >
                  {date.getDate()}
                </span>
              </div>

              <div className="space-y-2 overflow-y-auto max-h-[100px] pr-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <EventPill key={event.id} event={event} onDelete={onDelete} compact />
                ))}

                {dayEvents.length > 3 && (
                  <div className="text-[10px] font-black text-slate-400 px-1">
                    +{dayEvents.length - 3} autre(s)
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const WeekView = ({ events, viewDate, onDelete }: ViewProps) => {
  const weekDays = getWeekDays(viewDate);

  return (
    <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/70">
        {weekDays.map((date, index) => (
          <div
            key={date.toISOString()}
            className="p-4 text-center border-r last:border-r-0 border-slate-100"
          >
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
              {WEEK_DAYS[index]}
            </p>
            <div
              className={`mt-3 mx-auto w-10 h-10 rounded-full flex items-center justify-center text-sm font-black ${
                isToday(date) ? "bg-slate-900 text-white" : "text-slate-800"
              }`}
            >
              {date.getDate()}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 min-h-[520px]">
        {weekDays.map((date) => {
          const dateKey = formatDateKey(date);
          const dayEvents = events
            .filter((e) => e.date === dateKey)
            .sort((a, b) => (a.time || "").localeCompare(b.time || ""));

          return (
            <div
              key={dateKey}
              className="border-r last:border-r-0 border-slate-100 p-4 bg-white hover:bg-slate-50/50 transition-all"
            >
              <div className="space-y-3">
                {dayEvents.length > 0 ? (
                  dayEvents.map((event) => (
                    <EventPill key={event.id} event={event} onDelete={onDelete} />
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center text-[11px] font-bold text-slate-300">
                    Aucun atelier
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const YearView = ({ events, viewDate }: Omit<ViewProps, "onDelete">) => {
  const months = getYearMonths(viewDate);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {months.map((monthDate) => {
        const monthGrid = getMonthGrid(monthDate);
        const currentMonth = monthDate.getMonth();

        return (
          <div
            key={monthDate.toISOString()}
            className="bg-white border border-slate-200 rounded-[28px] shadow-sm overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/70">
              <h3 className="text-lg font-black tracking-tight text-slate-900">
                {monthDate.toLocaleString("fr-FR", { month: "long" })}
              </h3>
            </div>

            <div className="px-4 pt-4 grid grid-cols-7 gap-1">
              {WEEK_DAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-[9px] font-black text-slate-300 uppercase"
                >
                  {day[0]}
                </div>
              ))}
            </div>

            <div className="p-4 grid grid-cols-7 gap-1">
              {monthGrid.map((date) => {
                const dateKey = formatDateKey(date);
                const dayCount = events.filter((e) => e.date === dateKey).length;
                const firstEvent = events.find((e) => e.date === dateKey);
                const inCurrentMonth = date.getMonth() === currentMonth;

                return (
                  <Link
                    key={dateKey}
                    href={firstEvent ? `/meeting/${firstEvent.id}` : "#"}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all ${
                      inCurrentMonth ? "text-slate-700 hover:bg-slate-100" : "text-slate-300"
                    } ${isToday(date) ? "bg-slate-900 text-white hover:bg-slate-900" : ""}`}
                    onClick={(e) => {
                      if (!firstEvent) e.preventDefault();
                    }}
                  >
                    <span>{date.getDate()}</span>
                    {dayCount > 0 && !isToday(date) && (
                      <span className="text-[9px] mt-1 text-slate-400">{dayCount}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function Calendar({
  events,
  onDelete,
  viewDate,
  calendarView,
  onChangeView,
  onNext,
  onPrev,
  onToday,
}: CalendarProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-6 md:p-8">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">
              Planning
            </p>
            <h2 className="text-3xl font-black text-slate-900 capitalize tracking-tighter">
              {getHeaderLabel(viewDate, calendarView)}
            </h2>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="inline-flex bg-slate-100 rounded-2xl p-1">
              {(["year", "month", "week"] as CalendarView[]).map((view) => (
                <button
                  key={view}
                  onClick={() => onChangeView(view)}
                  className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    calendarView === view
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {view === "year" ? "Année" : view === "month" ? "Mois" : "Semaine"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onToday}
                className="px-5 py-3 rounded-2xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
              >
                Aujourd’hui
              </button>
              <button
                onClick={onPrev}
                className="w-12 h-12 rounded-2xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-all font-bold text-slate-600 shadow-sm"
              >
                ←
              </button>
              <button
                onClick={onNext}
                className="w-12 h-12 rounded-2xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-all font-bold text-slate-600 shadow-sm"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      {calendarView === "month" && (
        <MonthView events={events} viewDate={viewDate} onDelete={onDelete} />
      )}

      {calendarView === "week" && (
        <WeekView events={events} viewDate={viewDate} onDelete={onDelete} />
      )}

      {calendarView === "year" && <YearView events={events} viewDate={viewDate} />}
    </div>
  );
}