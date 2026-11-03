import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://valbr-dev.github.io",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const adminEmail = (Deno.env.get("ADMIN_EMAIL") || "").toLowerCase();
    const githubToken = Deno.env.get("GITHUB_TOKEN");
    const owner = Deno.env.get("GITHUB_OWNER") || "valbr-dev";
    const repo = Deno.env.get("GITHUB_REPO") || "visisite";
    const branch = Deno.env.get("GITHUB_BRANCH") || "main";
    if (!supabaseUrl || !anonKey || !adminEmail || !githubToken) {
      return json({ error: "На сервере не настроены секреты функции. См. инструкцию." }, 500);
    }

    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || (user.email || "").toLowerCase() !== adminEmail) {
      return json({ error: "Недостаточно прав для загрузки файлов" }, 403);
    }

    const body = await req.json();
    const filename = String(body.filename || "").split(/[\\/]/).pop() || "photo";
    const mimeType = String(body.mimeType || "");
    const folder = ["projects", "gallery", "about"].includes(body.folder) ? body.folder : "projects";
    const base64 = String(body.contentBase64 || "");
    if (!/^image\/(jpeg|png|webp|avif)$/.test(mimeType)) return json({ error: "Недопустимый формат изображения" }, 400);
    if (!base64 || base64.length > 11_200_000) return json({ error: "Файл пустой или превышает лимит 8 МБ" }, 413);

    const safeName = filename.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(-100) || "photo";
    const uniqueName = `${Date.now()}-${safeName}`;
    const path = `images/${folder}/${uniqueName}`;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path.split("/").map(encodeURIComponent).join("/")}`;
    const githubResponse = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${githubToken}`,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
        "User-Agent": "Armada-Admin",
      },
      body: JSON.stringify({
        message: `Upload image: ${uniqueName}`,
        content: base64,
        branch,
      }),
    });
    const githubData = await githubResponse.json().catch(() => ({}));
    if (!githubResponse.ok) {
      return json({ error: githubData.message || `GitHub API error: ${githubResponse.status}` }, 502);
    }

    return json({
      path,
      publicUrl: `https://valbr-dev.github.io/${repo}/${path}`,
      commit: githubData.commit?.sha || null,
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unexpected server error" }, 500);
  }
});
