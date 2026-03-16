"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Workshop,
  Client,
  CLIENTS,
  getStoredWorkshops,
  getClientHistory,
  buildClientSummaryText,
  COLOR_STYLES,
} from "../../lib/workshops";

export default function ClientsPage() {
  const [events, setEvents] = useState<Workshop[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>(CLIENTS[0]?.id || "");

  useEffect(() => {
    const saved = getStoredWorkshops();
    setEvents(saved);
  }, []);

  const selectedClient = useMemo(() => {
    return CLIENTS.find((client: Client) => client.id === selectedClientId) || null;
  }, [selectedClientId]);

  const clientWorkshops = useMemo(() => {
    if (!selectedClientId) return [];

    return events
      .filter((event: Workshop) => event.clientId === selectedClientId)
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || "00:00"}`).getTime();
        const dateB = new Date(`${b.date}T${b.time || "00:00"}`).getTime();
        return dateB - dateA;
      });
  }, [events, selectedClientId]);

  const clientSummary = useMemo(() => {
    if (clientWorkshops.length === 0) return "";
    return buildClientSummaryText(clientWorkshops);
  }, [clientWorkshops]);

  const previousWorkshops = useMemo(() => {
    if (!selectedClientId) return [];
    return getClientHistory(events, selectedClientId);
  }, [events, selectedClientId]);

  if (!selectedClient) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-8 px-6 text-slate-900 font-sans">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm font-bold text-slate-500">Aucun client disponible.</p>
        </div>
      </div>
    );
  }

  const colorStyle = COLOR_STYLES[selectedClient.color];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-6 text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">
              Capitalisation client
            </p>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900">
              Vue détaillée par client
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-3 max-w-2xl">
              Sélectionne un client pour consulter tous les ateliers déjà réalisés, la synthèse
              consolidée et les éléments de contexte utiles pour préparer les prochaines instances.
            </p>
          </div>

          <Link
            href="/"
            className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all"
          >
            ← Retour dashboard
          </Link>
        </header>

        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8 mb-8">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
            Sélectionner un client
          </label>

          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full md:w-[320px] p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
            >
              {CLIENTS.map((client: Client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>

            <div
              className={`inline-flex items-center gap-2 px-4 py-3 rounded-2xl border font-black text-xs uppercase tracking-widest ${colorStyle.soft} ${colorStyle.border} ${colorStyle.text}`}
            >
              <span
                className={`w-3 h-3 rounded-full ${colorStyle.badge.split(" ")[0]}`}
              />
              {selectedClient.name}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <div className={`bg-white rounded-[32px] border shadow-sm overflow-hidden ${colorStyle.border}`}>
              <div className={`p-8 border-b ${colorStyle.soft} ${colorStyle.border}`}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div
                      className={`inline-flex items-center px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-4 ${colorStyle.badge}`}
                    >
                      {selectedClient.name}
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">
                      Historique des ateliers
                    </h2>
                    <p className="text-sm text-slate-500 font-medium mt-2">
                      {clientWorkshops.length} atelier(s) enregistré(s)
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl px-5 py-4 border border-slate-200 shadow-sm min-w-[120px] text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Dernier atelier
                    </p>
                    <p className="text-xs font-black text-slate-800">
                      {clientWorkshops[0]?.date || "Aucun"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {clientWorkshops.length > 0 ? (
                  <div className="space-y-4">
                    {clientWorkshops.map((workshop: Workshop) => (
                      <Link
                        key={workshop.id}
                        href={`/meeting/${workshop.id}`}
                        className="block bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl p-5 transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-black text-slate-900">
                              {workshop.title}
                            </p>
                            <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">
                              {workshop.date} {workshop.time ? `@ ${workshop.time}` : ""}
                            </p>
                            <p className="text-sm text-slate-600 mt-3">
                              {workshop.objective}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${colorStyle.badge}`}
                          >
                            Voir
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 font-bold italic">
                    Aucun atelier encore enregistré pour ce client.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                Synthèse consolidée
              </h3>

              <div className="bg-slate-900 rounded-[28px] p-6 text-white">
                {clientWorkshops.length > 0 ? (
                  <pre className="whitespace-pre-wrap text-xs leading-relaxed text-slate-200 font-sans">
                    {clientSummary}
                  </pre>
                ) : (
                  <p className="text-sm text-slate-400 font-medium">
                    Pas encore de matière consolidée pour ce client.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                Indicateurs rapides
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2">
                    Ateliers
                  </p>
                  <p className="text-2xl font-black text-slate-900">{clientWorkshops.length}</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2">
                    Décisions
                  </p>
                  <p className="text-2xl font-black text-slate-900">
                    {
                      clientWorkshops.filter(
                        (w: Workshop) =>
                          w.synthesisData?.decisions && w.synthesisData.decisions.trim()
                      ).length
                    }
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2">
                    Actions
                  </p>
                  <p className="text-2xl font-black text-slate-900">
                    {
                      clientWorkshops.filter(
                        (w: Workshop) =>
                          w.synthesisData?.actions && w.synthesisData.actions.trim()
                      ).length
                    }
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2">
                    Risques
                  </p>
                  <p className="text-2xl font-black text-slate-900">
                    {
                      clientWorkshops.filter(
                        (w: Workshop) =>
                          w.synthesisData?.risks && w.synthesisData.risks.trim()
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                Derniers ateliers utiles
              </h3>

              {previousWorkshops.length > 0 ? (
                <div className="space-y-3">
                  {previousWorkshops.slice(0, 3).map((workshop: Workshop) => (
                    <div
                      key={workshop.id}
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-4"
                    >
                      <p className="text-sm font-black text-slate-800">
                        {workshop.title}
                      </p>
                      <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">
                        {workshop.date} {workshop.time ? `@ ${workshop.time}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 font-bold italic">
                  Aucun historique complémentaire disponible.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}