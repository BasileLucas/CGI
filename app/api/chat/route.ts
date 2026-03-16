import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, context, type } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Clé API non configurée" }, { status: 500 });
    }

    // --- LOGIQUE DE PERSONNALISATION DU COMPORTEMENT ---
    let systemMessage = "";
    let temperature = 0.5;

    if (type === "RIDA") {
      // MODE SYNTHÈSE STRATÉGIQUE (RIDA)
      systemMessage = `Tu es un Senior Manager chez CGI. Ton rôle est de transformer des notes de réunion brutes en une synthèse RIDA à haute valeur ajoutée.
      
      CONSIGNES STRICTES :
      1. REFORMULATION : Interdiction de faire du copier-coller pur. Transforme le langage parlé en langage business percutant (ex: "Il faut que Marc envoie le planning" devient "• Pilotage : Transmission du planning projet (Resp: Marc)").
      2. TRI INTELLIGENT : Supprime 100% des hésitations, des politesses et des répétitions. Ne garde que l'essentiel.
      3. PROFESSIONNALISME : Utilise des listes à puces (•) et structure par thématiques.
      
      RÉPONDS UNIQUEMENT EN JSON AVEC CES CLÉS :
      - risks : Alertes critiques (budget, planning, ressources), menaces ou points de vigilance.
      - infos : Faits marquants, contexte validé et informations clés.
      - decisions : Validations client, choix stratégiques actés.
      - actions : Plan d'action précis avec responsables et échéances mentionnés.`;
      
      temperature = 0.1; // Précision maximale
    } else {
      // MODE COACH PRÉPARATION (PREP)
      systemMessage = `Tu es un Consultant Senior CGI. Ton objectif est de préparer le consultant pour son atelier. 
      Génère un guide "Gold Standard" incluant :
      1. Un agenda détaillé (timing précis par phase).
      2. 5 questions stratégiques à fort impact pour challenger le client.
      3. Les livrables attendus et 3 points de vigilance métier.
      Utilise un ton expert, structuré avec des titres et des emojis.`;
      
      temperature = 0.7; // Créativité pour l'animation
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "WorkshopPilot CGI",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b:free", 
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: `CONTEXTE : ${context}. REQUÊTE : ${prompt}` }
        ],
        temperature: temperature,
      }),
    });

    const data = await response.json();

    // Vérification de la réponse OpenRouter
    if (!response.ok) {
      console.error("Erreur OpenRouter:", data);
      return NextResponse.json({ error: data.error?.message || "Erreur API" }, { status: response.status });
    }

    const aiText = data.choices?.[0]?.message?.content;

    if (!aiText) {
      return NextResponse.json({ text: "L'IA est momentanément indisponible ou la réponse est vide." });
    }

    return NextResponse.json({ text: aiText });

  } catch (error: any) {
    console.error("Erreur Serveur POST:", error);
    return NextResponse.json({ error: "Erreur serveur : " + error.message }, { status: 500 });
  }
}