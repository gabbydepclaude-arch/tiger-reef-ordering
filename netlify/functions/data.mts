import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

const STORES = ["orders", "overrides", "contacts", "links", "mbc"];
// "mbc" holds the ingredient usage sent by the MBC Prep Tool. Anyone can read it,
// but only the Prep Tool can change it: it must send the secret MBC_SYNC_KEY
// (set under Site configuration > Environment variables on Netlify).
const KEYED_WRITE_STORES = ["mbc"];

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const storeName = url.searchParams.get("store") || "";
  const key = url.searchParams.get("key") || "";

  if (!STORES.includes(storeName)) {
    return new Response(JSON.stringify({ error: "invalid store" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const store = getStore(storeName);

  if (req.method !== "GET" && KEYED_WRITE_STORES.includes(storeName)) {
    // trimmed, so a stray space or line break copied with the password doesn't lock the Prep Tool out
    const expected = (Netlify.env.get("MBC_SYNC_KEY") || "").trim();
    const given = (req.headers.get("x-sync-key") || "").trim();
    if (!expected || given !== expected) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  try {
    if (req.method === "GET") {
      if (key) {
        const data = await store.get(key, { type: "json" });
        return new Response(JSON.stringify({ key, data }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      const { blobs } = await store.list();
      const items = await Promise.all(
        blobs.map(async (b) => {
          const data = await store.get(b.key, { type: "json" });
          return { key: b.key, data };
        })
      );
      return new Response(JSON.stringify({ items }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const k = key || crypto.randomUUID();
      await store.setJSON(k, body);
      return new Response(JSON.stringify({ key: k }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "DELETE") {
      if (!key) {
        return new Response(JSON.stringify({ error: "key required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      await store.delete(key);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config: Config = {
  path: "/api/data",
};
