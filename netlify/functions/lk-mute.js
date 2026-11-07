// Coupe le micro de participants. Réservé aux administrateurs.
const crypto = require("crypto");
const b64 = (o) => Buffer.from(typeof o === "string" ? o : JSON.stringify(o)).toString("base64url");
const ROOM = "rhema-priere";
exports.handler = async (event) => {
  const h = { "Content-Type": "application/json" };
  const fail = (c, m) => ({ statusCode: c, headers: h, body: JSON.stringify({ error: m }) });
  try {
    if (event.httpMethod !== "POST") return fail(405, "Méthode non autorisée");
    const auth = event.headers.authorization || event.headers.Authorization || "";
    const { SUPABASE_URL: SU, SUPABASE_ANON_KEY: SK, LIVEKIT_URL: LU, LIVEKIT_API_KEY: K, LIVEKIT_API_SECRET: S } = process.env;
    if (!SU || !SK || !LU || !K || !S) return fail(500, "Variables d'environnement manquantes sur Netlify");
    const u = await fetch(SU + "/auth/v1/user", { headers: { apikey: SK, Authorization: auth } });
    if (!u.ok) return fail(401, "Connexion requise");
    const user = await u.json();
    const p = await fetch(SU + "/rest/v1/profiles?id=eq." + user.id + "&select=role", { headers: { apikey: SK, Authorization: auth } });
    if (((await p.json())[0] || {}).role !== "admin") return fail(403, "Réservé à l'administrateur");
    const items = (JSON.parse(event.body || "{}").items || []).slice(0, 200);
    const now = Math.floor(Date.now() / 1000), head = b64({ alg: "HS256", typ: "JWT" });
    const body = b64({ iss: K, sub: "serveur-rhema", nbf: now, exp: now + 60, video: { room: ROOM, roomAdmin: true } });
    const token = head + "." + body + "." + crypto.createHmac("sha256", S).update(head + "." + body).digest("base64url");
    const api = LU.replace(/^wss:/, "https:").replace(/^ws:/, "http:").replace(/\/$/, "");
    for (const it of items) {
      const r = await fetch(api + "/twirp/livekit.RoomService/MutePublishedTrack", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ room: ROOM, identity: it.identity, track_sid: it.sid, muted: true }) });
      if (!r.ok) return fail(502, "LiveKit a refusé la demande (" + r.status + ")");
    }
    return { statusCode: 200, headers: h, body: JSON.stringify({ ok: true }) };
  } catch (e) { return fail(500, e.message); }
};
