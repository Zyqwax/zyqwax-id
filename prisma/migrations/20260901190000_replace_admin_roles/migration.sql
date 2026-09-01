-- Yalnızca varsayılan kullanıcı ve administrator rolleri tutulur.
INSERT INTO "UserRole" ("id", "displayName") VALUES
  ('role_administrator', 'Administrator')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT 'role_administrator', "permissionId"
FROM "RolePermission"
WHERE "roleId" = 'role_admin'
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

DELETE FROM "UserRoleAssignment"
WHERE "roleId" IN ('role_developer', 'role_admin');

DELETE FROM "RolePermission"
WHERE "roleId" IN ('role_developer', 'role_admin');

DELETE FROM "UserRole"
WHERE "id" IN ('role_developer', 'role_admin');
