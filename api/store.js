// api/store.js — Vercel Serverless Function con almacenamiento en archivo JSON
// Usa el sistema de archivos temporal de Vercel + una variable de entorno
// para guardar todos los datos de la porra en un único objeto JSON.

import { kv } from "@vercel/kv";

const KEY = "porra2026";

async function getStore() {
  const data = await kv.get(KEY);
  return data || { users: {}, results: { groups: {}, bracket: {} } };
}

async function setStore(data) {
  await kv.set(KEY, data);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    const store = await getStore();
    return res.status(200).json(store);
  }

  if (req.method === "POST") {
    const { action, ...payload } = req.body;
    const store = await getStore();

    if (action === "saveUser") {
      store.users[payload.name] = payload.pred;
    } else if (action === "deleteUser") {
      delete store.users[payload.name];
    } else if (action === "setResultGroup") {
      store.results.groups[payload.g] = payload.order;
    } else if (action === "setResultMatch") {
      store.results.bracket[payload.id] = payload.winner;
    } else {
      return res.status(400).json({ error: "Acción desconocida" });
    }

    await setStore(store);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Método no permitido" });
}
