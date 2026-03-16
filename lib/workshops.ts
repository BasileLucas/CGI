export type ClientColorKey = "blue" | "green" | "purple" | "orange" | "red";

export interface Participant {
  id: string;
  name: string;
  role: string;
  color: string;
}

export interface SynthesisData {
  risks: string;
  infos: string;
  decisions: string;
  actions: string;
}

export interface Workshop {
  id: string;
  title: string;
  date: string;
  time?: string;
  objective: string;
  clientId: string;
  clientName: string;
  clientColor: ClientColorKey;
  rawNotes?: string;
  synthesisData?: SynthesisData;
  participants?: Participant[];
  prepGuide?: string;
}

export interface Client {
  id: string;
  name: string;
  color: ClientColorKey;
}

export const CLIENTS: Client[] = [
  { id: "c1", name: "Carrefour", color: "blue" },
  { id: "c2", name: "SNCF", color: "green" },
  { id: "c3", name: "AXA", color: "purple" },
  { id: "c4", name: "Orange", color: "orange" },
  { id: "c5", name: "BNP Paribas", color: "red" },
  { id: "c6", name: "Air France", color: "blue" },
  { id: "c7", name: "TotalEnergies", color: "green" },
  { id: "c8", name: "La Poste", color: "purple" },
];

export const DIRECTORY: Participant[] = [
  { id: "p1", name: "Jean Dupont", role: "Senior Manager CGI", color: "bg-blue-500" },
  { id: "p2", name: "Alice Martin", role: "Consultante Cloud", color: "bg-purple-500" },
  { id: "p3", name: "Thomas Durand", role: "DSI Client", color: "bg-orange-500" },
  { id: "p4", name: "Sarah Levêque", role: "Product Owner", color: "bg-green-500" },
  { id: "p5", name: "Kevin Morel", role: "Expert Sécurité", color: "bg-red-500" },
];

export const COLOR_STYLES: Record<
  ClientColorKey,
  {
    badge: string;
    soft: string;
    calendar: string;
    border: string;
    text: string;
  }
> = {
  blue: {
    badge: "bg-blue-600 text-white",
    soft: "bg-blue-50",
    calendar: "bg-blue-600 hover:bg-blue-700",
    border: "border-blue-200",
    text: "text-blue-600",
  },
  green: {
    badge: "bg-green-600 text-white",
    soft: "bg-green-50",
    calendar: "bg-green-600 hover:bg-green-700",
    border: "border-green-200",
    text: "text-green-600",
  },
  purple: {
    badge: "bg-purple-600 text-white",
    soft: "bg-purple-50",
    calendar: "bg-purple-600 hover:bg-purple-700",
    border: "border-purple-200",
    text: "text-purple-600",
  },
  orange: {
    badge: "bg-orange-500 text-white",
    soft: "bg-orange-50",
    calendar: "bg-orange-500 hover:bg-orange-600",
    border: "border-orange-200",
    text: "text-orange-600",
  },
  red: {
    badge: "bg-red-500 text-white",
    soft: "bg-red-50",
    calendar: "bg-red-500 hover:bg-red-600",
    border: "border-red-200",
    text: "text-red-600",
  },
};

export const defaultSynthesis = (): SynthesisData => ({
  risks: "",
  infos: "",
  decisions: "",
  actions: "",
});

export const getStoredWorkshops = (): Workshop[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("workshop-pilot-events") || "[]");
  } catch {
    return [];
  }
};

export const saveStoredWorkshops = (events: Workshop[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("workshop-pilot-events", JSON.stringify(events));
};

export const getClientHistory = (events: Workshop[], clientId: string, currentId?: string) => {
  return events
    .filter((e) => e.clientId === clientId && e.id !== currentId)
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || "00:00"}`).getTime();
      const dateB = new Date(`${b.date}T${b.time || "00:00"}`).getTime();
      return dateB - dateA;
    });
};

export const buildClientSummaryText = (history: Workshop[]) => {
  const recent = history.slice(0, 5);

  const block = (label: string, values: string[]) => {
    const filtered = values.map((v) => v?.trim()).filter(Boolean);
    if (filtered.length === 0) return `${label} : aucun élément consolidé.`;
    return `${label} :\n- ${filtered.join("\n- ")}`;
  };

  return [
    block(
      "Objectifs déjà traités",
      recent.map((w) => `${w.title} (${w.date}) — ${w.objective}`)
    ),
    "",
    block(
      "Décisions déjà prises",
      recent.map((w) => w.synthesisData?.decisions || "")
    ),
    "",
    block(
      "Actions déjà identifiées",
      recent.map((w) => w.synthesisData?.actions || "")
    ),
    "",
    block(
      "Risques déjà remontés",
      recent.map((w) => w.synthesisData?.risks || "")
    ),
    "",
    block(
      "Informations clés",
      recent.map((w) => w.synthesisData?.infos || "")
    ),
  ].join("\n");
};
export const groupWorkshopsByClient = (events: Workshop[]) => {
  return CLIENTS.map((client) => {
    const workshops = events
      .filter((event) => event.clientId === client.id)
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || "00:00"}`).getTime();
        const dateB = new Date(`${b.date}T${b.time || "00:00"}`).getTime();
        return dateB - dateA;
      });

    return {
      client,
      workshops,
      summary: buildClientSummaryText(workshops),
    };
  });
};