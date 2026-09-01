-- Varsayılan roller ve uygulamanın kullandığı makine izinleri.
-- displayName yalnızca arayüz içindir; yetki kontrolü tag üzerinden yapılır.
INSERT INTO "UserRole" ("id", "displayName") VALUES
  ('role_user', 'Kullanıcı'),
  ('role_developer', 'Geliştirici'),
  ('role_admin', 'Yönetici')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Permission" ("id", "tag", "displayName") VALUES
  ('perm_profile_limits_bypass', 'profile.limits.bypass', 'Profil değişiklik limitlerini aşma')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "RolePermission" ("roleId", "permissionId") VALUES
  ('role_developer', 'perm_profile_limits_bypass'),
  ('role_admin', 'perm_profile_limits_bypass')
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

INSERT INTO "UserRoleAssignment" ("userId", "roleId")
SELECT "id", 'role_user' FROM "User"
ON CONFLICT ("userId", "roleId") DO NOTHING;
