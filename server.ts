/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Supabase Admin Client
  const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY 
    ? createClient(process.env.VITE_SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Admin: Create User
  app.post("/api/admin/users", async (req, res) => {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "API Key Supabase (Service Role) belum diatur di Secrets!" });
    }
    const { email, password, name, role, nis_nip } = req.body;
    
    try {
      // 1. Buat User di Auth
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, role, nis_nip }
      });
      
      if (error) {
        console.error("Auth Error:", error);
        let customMsg = error.message;
        if (customMsg.includes("Database error creating new user")) {
          customMsg = "Database Error: Gagal membuat user. Ini biasanya terjadi karena ada TRIGGER di database Supabase yang gagal (mungkin tabel 'profiles' belum siap). Silakan jalankan SQL FIX di bawah.";
        }
        throw new Error(customMsg);
      }

      // 2. Pastikan Profile dibuat (Upsert sebagai cadangan)
      if (data.user) {
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .upsert({
            id: data.user.id,
            name,
            role,
            nis_nip
          });
        
        if (profileError) {
          console.error("Profile Error:", profileError);
          return res.json({ 
            user: data.user, 
            warning: `User berhasil dibuat di Auth, tapi gagal di tabel Profiles: ${profileError.message}. Ini menandakan struktur tabel belum sesuai.` 
          });
        }
      }

      res.json(data.user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Admin: Delete User (Permanent from Auth)
  app.delete("/api/admin/users/:userId", async (req, res) => {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Supabase Service Role Key not configured" });
    }
    const { userId } = req.params;
    
    try {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) throw error;
      res.json({ message: "User deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Admin: Get All Users from Auth (Sync with profiles)
  app.get("/api/admin/users", async (req, res) => {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Supabase Service Role Key not configured" });
    }
    try {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();
      if (error) throw error;
      res.json(data.users);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
