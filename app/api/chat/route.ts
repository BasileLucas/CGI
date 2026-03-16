import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, context, type } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Clé API non configurée" }, { status: 500 });
    }

    // --- LOGIQUE DE PERSONNALISATION ---
    let instruction = "";
    let temperature = 0.5;

    if (type === "RIDA") {
      instruction = `Tu es un Senior Manager chez CGI. Ton rôle est de transformer des notes de réunion brutes en une synthèse RIDA à haute valeur ajoutée.
      
      CONSIGNES STRICTES :
      1. REFORMULATION : Interdiction de faire du copier-coller pur. Transforme le langage parlé en langage business percutant.
      2. TRI INTELLIGENT : Supprime 100% des hésitations et répétitions.
      3. PROFESSIONNALISME : Utilise des listes à puces (•).
      
      RÉPONDS UNIQUEMENT EN JSON AVEC CES CLÉS :
      - risks : Alertes critiques (budget, planning, ressources).
      - infos : Faits marquants et informations clés.
      - decisions : Validations client, choix stratégiques actés.
      - actions : Plan d'action précis avec responsables.`;
      
      temperature = 0.1; 
    } else {
      instruction = `Tu es un Consultant Senior CGI expert en préparation d'ateliers. 
      Génère un guide "Gold Standard" incluant un agenda précis, 5 questions stratégiques, les livrables attendus et 3 points de vigilance.
      Utilise un ton expert, structuré avec des titres et des emojis.`;
      
      temperature = 0.7;
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
        // Changement de modèle conseillé pour éviter les bugs de quota/compatibilité
        model: "openai/gpt-oss-120b:free", 
        messages: [
          { 
            role: "user", 
            content: `INSTRUCTIONS : ${instruction}\n\nCONTEXTE : ${context}\nREQUÊTE À TRAITER : ${prompt}` 
          }
        ],
        temperature: temperature,
        // On force le format JSON pour éviter que l'IA ne mette du texte autour du bloc de code
        response_format: type === "RIDA" ? { type: "json_object" } : undefined
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erreur OpenRouter:", data);
      return NextResponse.json({ error: data.error?.message || "Erreur API" }, { status: response.status });
    }

    const aiText = data.choices?.[0]?.message?.content;

    if (!aiText) {
      return NextResponse.json({ text: "L'IA n'a pas renvoyé de contenu." });
    }

    return NextResponse.json({ text: aiText });

  } catch (error: any) {
    console.error("Erreur Serveur POST:", error);
    return NextResponse.json({ error: "Erreur serveur : " + error.message }, { status: 500 });
  }
}