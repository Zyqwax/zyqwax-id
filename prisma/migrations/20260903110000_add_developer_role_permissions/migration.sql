INSERT INTO "UserRole" ("id", "displayName") VALUES ('role_developer', 'Geliştirici') ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Permission" ("id", "tag", "displayName") VALUES
  ('perm_developer_portal_access', 'developer.portal.access', 'Developer Portal erişimi'),
  ('perm_developer_apps_read', 'developer.apps.read', 'Kendi OAuth uygulamalarını görüntüleme'),
  ('perm_developer_apps_create', 'developer.apps.create', 'OAuth uygulaması oluşturma'),
  ('perm_developer_apps_update', 'developer.apps.update', 'Kendi OAuth uygulamalarını güncelleme'),
  ('perm_developer_apps_delete', 'developer.apps.delete', 'Kendi OAuth uygulamalarını devre dışı bırakma')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "RolePermission" ("roleId", "permissionId") SELECT 'role_developer', "id" FROM "Permission" WHERE "tag" IN ('developer.portal.access', 'developer.apps.read', 'developer.apps.create', 'developer.apps.update', 'developer.apps.delete') ON CONFLICT ("roleId", "permissionId") DO NOTHING;
