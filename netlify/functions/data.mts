import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

const STORES = ["orders", "overrides", "contacts"];

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
