// Délivre un jeton d'accès à l'appel audio LiveKit, uniquement aux utilisateurs connectés.
const crypto = require("crypto");
const b64 = (o) => Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64url");
exports.handler = async (event) => {
  const h = { "Content-Type": "application/json" };
  const fail = (c, m) => ({ statusCode: c, headers: h, body: JSON.stringify({ error: m }) });
  try {
    if (event.httpMethod !== "POST") return fail(405, "Méthode non autorisée");
    const auth = event.headers.authorization || event.headers.Authorization || "";
    const { SUPABASE_URL: SU, SUPABASE_ANON_KEY: SK, LIVEKIT_URL: LU, LIVEKIT_API_KEY: K, LIVEKIT_API_SECRET: S } = process.env;
    const manque = Object.entries({ SUPABASE_URL: SU, SUPABASE_ANON_KEY: SK, LIVEKIT_URL: LU, LIVEKIT_API_KEY: K, LIVEKIT_API_SECRET: S }).filter(([, v]) => !v).map(([n]) => n);
    if (manque.length) return fail(500, "Variables manquantes sur Netlify : " + manque.join(", "));
    const u = await fetch(SU + "/auth/v1/user", { headers: { apikey: SK, Authorization: auth } });
    if (!u.ok) return fail(401, "Connexion requise");
    const user = await u.json();
    const p = await fetch(SU + "/rest/v1/profiles?id=eq." + user.id + "&select=full_name", { headers: { apikey: SK, Authorization: auth } });
    const name = ((await p.json())[0] || {}).full_name || "Participant";
    const now = Math.floor(Date.now() / 1000);
    const head = b64({ alg: "HS256", typ: "JWT" });
    const body = b64({ iss: K, sub: user.id, name, nbf: now, exp: now + 6 * 3600,
      video: { room: "rhema-priere", roomJoin: true, canPublish: true, canSubscribe: true } });
    const sig = crypto.createHmac("sha256", S).update(head + "." + body).digest("base64url");
    return { statusCode: 200, headers: h, body: JSON.stringify({ token: head + "." + body + "." + sig, url: LU }) };
  } catch (e) { return fail(500, e.message); }
};
