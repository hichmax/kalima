import { pool } from "@/lib/auth";

export type AdminUser = {
  email: string;
  name: string;
  createdAt: string;
  emailVerified: boolean;
  newsletter: boolean;
  methods: string[];
  lastSync: string | null;
};

/** Tous les inscrits, du plus récent au plus ancien (réservé aux administrateurs). */
export async function listUsers(): Promise<AdminUser[]> {
  const { rows } = await pool.query<{
    email: string;
    name: string;
    created_at: Date;
    email_verified: boolean;
    newsletter: boolean | null;
    methods: string[] | null;
    last_sync: Date | null;
  }>(`
    select u.email, u.name, u."createdAt" as created_at, u."emailVerified" as email_verified, u.newsletter,
           array_remove(array_agg(distinct a."providerId"), null) as methods, p.updated_at as last_sync
      from "user" u
      left join account a on a."userId" = u.id
      left join kalima_progress p on p.user_id = u.id
     group by u.id, p.updated_at
     order by u."createdAt" desc
  `);
  return rows.map((row) => ({
    email: row.email,
    name: row.name,
    createdAt: row.created_at.toISOString(),
    emailVerified: row.email_verified,
    newsletter: Boolean(row.newsletter),
    methods: (row.methods ?? []).map((method) => (method === "credential" ? "e-mail" : method)),
    lastSync: row.last_sync ? row.last_sync.toISOString() : null,
  }));
}
