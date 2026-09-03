INSERT INTO "Permission" ("id", "tag", "displayName") VALUES
  ('perm_roles_manage', 'roles.manage', 'Rolleri ve rol izinlerini yönetme'),
  ('perm_users_roles_update', 'users.roles.update', 'Kullanıcı rollerini düzenleme')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT 'role_administrator', "id"
FROM "Permission"
WHERE "tag" IN ('roles.manage', 'users.roles.update')
ON CONFLICT ("roleId", "permissionId") DO NOTHING;
