INSERT INTO "Permission" ("id", "tag", "displayName") VALUES
  ('perm_admin_access', 'admin.access', 'Admin paneline erişim'),
  ('perm_users_read', 'users.read', 'Kullanıcıları görüntüleme'),
  ('perm_login_history_read', 'login_history.read', 'Giriş kayıtlarını görüntüleme'),
  ('perm_oauth_clients_read', 'oauth_clients.read', 'OAuth clientlerini görüntüleme'),
  ('perm_oauth_clients_create', 'oauth_clients.create', 'OAuth client oluşturma'),
  ('perm_oauth_clients_update', 'oauth_clients.update', 'OAuth client düzenleme'),
  ('perm_oauth_clients_delete', 'oauth_clients.delete', 'OAuth client silme')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT 'role_administrator', "id"
FROM "Permission"
WHERE "tag" IN (
  'admin.access', 'users.read', 'login_history.read',
  'oauth_clients.read', 'oauth_clients.create',
  'oauth_clients.update', 'oauth_clients.delete'
)
ON CONFLICT ("roleId", "permissionId") DO NOTHING;
