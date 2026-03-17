import { NextResponse } from "next/server";

type RidaPayload = {
  risks: string;
  infos: string;
  decisions: string;
  actions: string;
};

function sanitizeRidaPayload(input: unknown): RidaPayload {
  const safeText = (value: unknown) => {
    if (typeof value === "string") return value.trim();
    if (value === null || value === undefined) return "";
    return String(value).trim();
  };

  const obj = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;

  return {
    risks: safeText(obj.risks),
    infos: safeText(obj.infos),
    decisions: safeText(obj.decisions),
    actions: safeText(obj.actions),
  };
}

export async function POST(req: Request) {
  try {
    const { prompt, context, type } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Clé API non configurée" },
        { status: 500 }
      );
    }

    const normalizedPrompt =
      typeof prompt === "string"
        ? prompt.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim()
        : "";

    const normalizedContext =
      typeof context === "string"
        ? context.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim()
        : "";

    if (!normalizedPrompt) {
      return NextResponse.json(
        { error: "Aucun contenu à analyser." },
        { status: 400 }
      );
    }

    let systemPrompt = "";
    let userPrompt = "";
    let temperature = 0.2;
    let responseFormat: { type: "json_object" } | undefined = undefined;

    if (type === "RIDA") {
      systemPrompt = `
Tu es un Senior Manager CGI spécialisé en animation d’ateliers, pilotage de projet, cadrage et restitution client.

Ta mission est de transformer des notes de réunion brutes en une synthèse RIDA de qualité cabinet de conseil.

RIDA signifie :
- risks : risques, points de vigilance, blocages potentiels, impacts possibles
- infos : informations factuelles, contexte utile, constats clés, éléments structurants
- decisions : décisions explicitement prises, arbitrages actés, validations formelles
- actions : actions concrètes à engager, suivre ou planifier

OBJECTIF :
Produire une synthèse directement exploitable par un consultant, un chef de projet ou un comité de pilotage.

RÈGLES IMPÉRATIVES :
1. Tu réponds UNIQUEMENT en JSON valide.
2. Tu ne mets aucun texte avant ou après le JSON.
3. Le JSON doit respecter EXACTEMENT cette structure :
{
  "risks": "...",
  "infos": "...",
  "decisions": "...",
  "actions": "..."
}
4. Chaque champ doit être une chaîne de caractères.
5. Si un champ n’a pas de contenu, renvoie une chaîne vide.
6. Reformule les notes dans un langage professionnel, synthétique, orienté client.
7. Supprime totalement les hésitations, répétitions, formulations orales et bruit conversationnel.
8. N’invente aucune décision ni aucune action absente des notes.
9. Si un élément est ambigu, place-le dans "infos" ou "risks", mais ne le transforme pas artificiellement en "decision".
10. Dans "actions", privilégie des verbes d’action concrets : préparer, consolider, partager, formaliser, planifier, valider, lancer, arbitrer, documenter.
11. Dans "decisions", ne conserve que les éléments réellement actés ou arbitrés.
12. Dans "risks", fais apparaître l’impact potentiel quand il est identifiable.
13. Chaque champ doit être rédigé sous forme de points courts séparés par des sauts de ligne commençant par "- ".
14. Le style attendu est celui d’un consultant CGI préparant un compte-rendu de restitution client.
15. Ne fais pas de copier-coller brut. Reformule toujours intelligemment.
16. Ne mets pas de responsable fictif dans les actions si aucun responsable n’est explicitement mentionné.
17. Si les notes décrivent surtout du contexte sans arbitrage, "decisions" peut être vide.
18. Si les notes sont riches, priorise les éléments vraiment structurants pour le pilotage.

EXEMPLE DE FORMAT ATTENDU :
{
  "risks": "- Risque de désalignement entre les attentes métier et les contraintes du SI existant.\\n- Risque de dérive de périmètre si le MVP n’est pas clarifié rapidement.",
  "infos": "- Le portail actuel est jugé peu lisible par les métiers.\\n- Les parcours les plus sensibles concernent la recherche d’itinéraire et l’information trafic.",
  "decisions": "- Lancer un cadrage centré sur les parcours prioritaires.\\n- Retenir une approche par lots avec un MVP en première étape.",
  "actions": "- Consolider la liste des irritants utilisateurs.\\n- Préparer une cartographie des parcours existants.\\n- Partager les contraintes techniques majeures avant le prochain atelier."
}
      `.trim();

      userPrompt = `
Contexte atelier :
${normalizedContext || "Non précisé"}

Notes brutes :
${normalizedPrompt}

Transforme ces notes en synthèse RIDA consultant.
Réponds uniquement avec un JSON valide.
      `.trim();

      temperature = 0.1;
      responseFormat = { type: "json_object" };
    } else {
      systemPrompt = `
Tu es un Consultant Senior CGI expert en préparation et animation d’ateliers clients.

Ta mission est de produire un guide de préparation d’atelier de niveau cabinet de conseil.

OBJECTIF :
Aider un consultant à préparer rapidement un atelier structuré, utile et crédible face à un client.

CONSINGES :
1. Rédige en français.
2. Adopte un ton professionnel, clair, structuré, orienté conseil.
3. Ne fais pas de texte inutilement long.
4. Le rendu doit être immédiatement exploitable.
5. Produis un guide contenant :
   - un objectif reformulé
   - un agenda d’atelier structuré
   - 5 questions stratégiques à poser
   - les livrables attendus
   - les points de vigilance
   - une recommandation de posture d’animation
6. Le style doit être premium, simple et concret.
7. Utilise une structure très lisible avec titres et sous-parties.
8. Mets en avant les éléments de cadrage, d’alignement et de pilotage.
      `.trim();

      userPrompt = `
Contexte :
${normalizedContext || "Non précisé"}

Besoin à préparer :
${normalizedPrompt}

Génère un guide d’animation d’atelier structuré, orienté consultant CGI.
      `.trim();

      temperature = 0.5;
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "WorkshopPilot CGI",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b:free",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature,
        response_format: responseFormat,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erreur OpenRouter:", data);
      return NextResponse.json(
        { error: data.error?.message || "Erreur API" },
        { status: response.status }
      );
    }

    const aiText = data.choices?.[0]?.message?.content;

    if (!aiText) {
      return NextResponse.json({
        text:
          type === "RIDA"
            ? JSON.stringify({
                risks: "",
                infos: "",
                decisions: "",
                actions: "",
              })
            : "L'IA n'a pas renvoyé de contenu.",
      });
    }

    if (type === "RIDA") {
      try {
        const parsed = JSON.parse(aiText);
        const cleaned = sanitizeRidaPayload(parsed);
        return NextResponse.json({ text: JSON.stringify(cleaned) });
      } catch {
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            const cleaned = sanitizeRidaPayload(parsed);
            return NextResponse.json({ text: JSON.stringify(cleaned) });
          } catch {
            return NextResponse.json({
              text: JSON.stringify({
                risks: "",
                infos: "- Les notes ont été reçues mais la structuration automatique a échoué partiellement.",
                decisions: "",
                actions: "- Relancer l’analyse avec des notes plus structurées.",
              }),
            });
          }
        }

        return NextResponse.json({
          text: JSON.stringify({
            risks: "",
            infos: "- Les notes ont été reçues mais le format de réponse IA n’a pas pu être interprété.",
            decisions: "",
            actions: "- Relancer l’analyse avec un contenu mieux structuré.",
          }),
        });
      }
    }

    return NextResponse.json({ text: aiText });
  } catch (error: any) {
    console.error("Erreur Serveur POST:", error);
    return NextResponse.json(
      { error: "Erreur serveur : " + error.message },
      { status: 500 }
    );
  }
}