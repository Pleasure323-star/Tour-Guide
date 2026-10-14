import type {
  UserRole,
  PermissionKey,
  RolePermissionsMap,
  PermissionCheckResult,
  OrgData,
  CustomRole,
} from "~/types/rbac";
import {
  findOrgRoleByNameOrId,
  normalizeRolePermissionList,
  permissionListToPermissionKeys,
  type OrgRoleRecord,
} from "~/utils/org-permissions";

export const ROLE_HIERARCHY: Record<string, number> = {
  owner: 100,
  administrator: 90,
  manager: 70,
  project_lead: 50,
  user: 20,
  bot: 10,
  guest: 0,
};

const CAN_TO_CANONICAL: Record<string, PermissionKey> = {
  can_manage_channels: "manage:channels",
  can_manage_members: "manage:members",
  can_manage_organization: "manage:organization",
  can_manage_settings: "manage:settings",
  can_manage_billing: "manage:billing",
  can_manage_agents: "manage:agents",
  can_manage_workflows: "manage:workflows",
  can_manage_integrations: "manage:integrations",
  can_manage_security: "manage:security",
  can_manage_roles: "manage:roles",
  can_view_analytics: "view:analytics",
  can_view_billing: "view:billing",
  can_view_channels: "view:channels",
  can_edit_messages: "edit:messages",
  can_delete_messages: "delete:messages",
  can_delete_files: "delete:files",
  can_create_channels: "create:channels",
  can_create_agents: "create:agents",
  can_create_role: "create:role",
  can_create_webhooks: "create:webhooks",
  can_archive_channels: "archive:channels",
  can_invite_members: "invite:members",
  can_remove_people: "remove:people",
  can_comment_threads: "comment:threads",
  can_change_user_org_role: "change:user_org_role",
  // Legacy keys still returned on some roles
  can_remove_people_from_organization: "remove:people",
  can_create_custom_role: "create:role",
  can_create_channel: "create:channels",
  can_comment_on_threads: "comment:threads",
  can_delete_any_file: "delete:files",
};

export const normalizePermission = (
  p: string | null | undefined
): PermissionKey | null => {
  if (!p || typeof p !== "string") return null;
  if (
    (p as unknown as PermissionKey) &&
    Object.values(CAN_TO_CANONICAL).includes(p as any)
  ) {
    return p as PermissionKey;
  }
  const lower = p.trim();
  if (CAN_TO_CANONICAL[lower]) return CAN_TO_CANONICAL[lower];
  // try to map some common variants
  const mapped = {
    invite_users: "invite:members",
    invite_users_plural: "invite:members",
  }[lower];
  if (mapped) return mapped as PermissionKey;
  return null;
};

export const normalizePermissionsList = (
  perms: Array<string | PermissionKey> | undefined | null
): PermissionKey[] => {
  if (!Array.isArray(perms)) return [];
  const out: PermissionKey[] = [];
  for (const p of perms) {
    if (!p) continue;
    if (typeof p !== "string") continue;
    const exact = p as PermissionKey;
    // if p already matches one of PermissionKey values, accept it
    if (
      Object.values(DEFAULT_ROLE_PERMISSIONS).some((arr) => arr.includes(exact))
    ) {
      out.push(exact);
      continue;
    }
    const normalized = normalizePermission(p);
    if (normalized) out.push(normalized);
  }
  return Array.from(new Set(out));
};

export const DEFAULT_ROLE_PERMISSIONS: RolePermissionsMap = {
  owner: [
    "manage:channels",
    "manage:members",
    "manage:organization",
    "manage:settings",
    "manage:billing",
    "manage:agents",
    "manage:workflows",
    "manage:integrations",
    "manage:security",
    "manage:roles",
    "view:analytics",
    "view:billing",
    "view:channels",
    "edit:messages",
    "delete:messages",
    "delete:files",
    "create:channels",
    "create:agents",
    "create:role",
    "create:webhooks",
    "archive:channels",
    "invite:members",
    "remove:people",
    "comment:threads",
    "change:user_org_role",
  ],
  administrator: [
    "manage:channels",
    "manage:members",
    "manage:organization",
    "manage:settings",
    "manage:agents",
    "manage:workflows",
    "manage:integrations",
    "manage:roles",
    "view:analytics",
    "view:billing",
    "view:channels",
    "edit:messages",
    "delete:messages",
    "delete:files",
    "create:channels",
    "create:agents",
    "create:role",
    "create:webhooks",
    "archive:channels",
    "invite:members",
    "remove:people",
    "comment:threads",
    "change:user_org_role",
  ],
  manager: [
    "manage:channels",
    "manage:members",
    "manage:settings",
    "manage:agents",
    "view:analytics",
    "view:billing",
    "view:channels",
    "edit:messages",
    "delete:messages",
    "create:channels",
    "create:agents",
    "create:role",
    "archive:channels",
    "invite:members",
    "remove:people",
    "comment:threads",
    "change:user_org_role",
  ],
  project_lead: [
    "manage:channels",
    "view:channels",
    "edit:messages",
    "delete:messages",
    "create:channels",
    "invite:members",
    "comment:threads",
  ],
  user: [
    "view:channels",
    "edit:messages",
    "create:channels",
    "invite:members",
    "comment:threads",
  ],
  bot: ["view:analytics", "view:channels"],
  guest: ["view:channels"],
};

export const isPrivilegedRole = (
  role: UserRole | null | undefined
): boolean => {
  if (!role) return false;
  return getRoleHierarchyLevel(role) >= 70;
};

export const normalizeRoleKey = (role: string | null | undefined): string => {
  if (!role) return "";
  return role.trim().toLowerCase().replace(/\s+/g, "_");
};

/** Owner and Administrator only — for org role create/edit UI. */
export const isOwnerOrAdministrator = (
  role: UserRole | null | undefined
): boolean => {
  const key = normalizeRoleKey(role);
  return key === "owner" || key === "administrator";
};

export const getRoleHierarchyLevel = (
  role: UserRole | null | undefined
): number => {
  if (!role) return 0;
  const key = normalizeRoleKey(role);
  return ROLE_HIERARCHY[key] ?? 0;
};

export const isRoleHigherThan = (
  role1: UserRole | undefined,
  role2: UserRole | undefined
): boolean => {
  return getRoleHierarchyLevel(role1) > getRoleHierarchyLevel(role2);
};

export const checkPermission = (
  role: UserRole | null | undefined,
  permission: PermissionKey,
  customPermissions?: PermissionKey[] | null,
  rolePermissionsMap: RolePermissionsMap = DEFAULT_ROLE_PERMISSIONS,
  customRoles?: CustomRole[] | undefined,
  orgRoles?: OrgRoleRecord[] | null
): boolean => {
  if (!role) return false;

  const hierarchyLevel = getRoleHierarchyLevel(role);
  if (hierarchyLevel >= 90) {
    return true;
  }

  if (customPermissions && Array.isArray(customPermissions)) {
    if (customPermissions.includes(permission)) {
      return true;
    }
  }

  const orgRolePerms = getPermissionsForOrgRole(role, orgRoles);
  if (orgRolePerms?.includes(permission)) {
    return true;
  }

  const customRolePerms = getCustomRolePermissions(role, customRoles);
  if (customRolePerms) {
    return customRolePerms.includes(permission);
  }

  const roleKey = normalizeRoleKey(role);
  const perms =
    rolePermissionsMap[roleKey as string] ?? rolePermissionsMap[role as string];
  if (perms) {
    return perms.includes(permission);
  }

  return false;
};

export const permissionsToSet = (
  permissions: PermissionKey[] | null | undefined
): Set<PermissionKey> => {
  if (!Array.isArray(permissions)) {
    return new Set();
  }
  return new Set(permissions);
};

export const getCustomRolePermissions = (
  roleName: string | null | undefined,
  customRoles: CustomRole[] | undefined
): PermissionKey[] | null => {
  if (!roleName || !Array.isArray(customRoles)) {
    return null;
  }
  const customRole = customRoles?.find(
    (r) => r.name === roleName || r.id === roleName
  );
  return customRole ? customRole.permissions : null;
};

export const resolveRolePermissions = (
  role: UserRole | null | undefined,
  orgData: OrgData | null | undefined,
  rolePermissionsMap: RolePermissionsMap = DEFAULT_ROLE_PERMISSIONS
): PermissionKey[] => {
  if (!role) return [];

  const customRolePerms = getCustomRolePermissions(role, orgData?.customRoles);
  if (customRolePerms) {
    return customRolePerms;
  }

  return (
    rolePermissionsMap[normalizeRoleKey(role) as string] ||
    rolePermissionsMap[role as string] ||
    []
  );
};

export const isValidOrgData = (orgData: any): orgData is OrgData => {
  return (
    orgData &&
    typeof orgData === "object" &&
    (typeof orgData.id === "string" || orgData.id !== undefined)
  );
};

export const getPermissionsForOrgRole = (
  roleName: UserRole | null | undefined,
  orgRoles: OrgRoleRecord[] | null | undefined
): PermissionKey[] | null => {
  const roleRecord = findOrgRoleByNameOrId(orgRoles, roleName ?? null);
  if (!roleRecord?.permissions?.permission_list) return null;

  return permissionListToPermissionKeys(
    normalizeRolePermissionList(roleRecord.permissions.permission_list),
    normalizePermission
  );
};

export const extractRoleAndPermissions = (
  orgData: OrgData | null | undefined,
  defaultRole: UserRole = "guest",
  orgRoles?: OrgRoleRecord[] | null
): {
  role: UserRole;
  permissions: PermissionKey[];
} => {
  if (!isValidOrgData(orgData)) {
    const defaultPerms = DEFAULT_ROLE_PERMISSIONS[defaultRole] || [];
    return {
      role: defaultRole,
      permissions: defaultPerms,
    };
  }

  const apiUserRole = (orgData as any).user_role;
  const roleFromApi = (apiUserRole?.role_name ||
    orgData.role ||
    defaultRole) as UserRole;

  const rolePermissionsFromApi = getPermissionsForOrgRole(
    roleFromApi,
    orgRoles
  );

  if (apiUserRole && typeof apiUserRole === "object") {
    const apiPermsRaw = Array.isArray(apiUserRole.permissions)
      ? apiUserRole.permissions
      : [];
    const apiPerms = normalizePermissionsList(apiPermsRaw);
    const resolvedPerms =
      rolePermissionsFromApi ?? resolveRolePermissions(roleFromApi, orgData);
    const customPerms = normalizePermissionsList(orgData.permissions as any);

    return {
      role: roleFromApi,
      permissions: Array.from(
        new Set([...resolvedPerms, ...apiPerms, ...customPerms])
      ),
    };
  }

  const role = (orgData.role || defaultRole) as UserRole;
  const resolvedPerms =
    getPermissionsForOrgRole(role, orgRoles) ??
    resolveRolePermissions(role, orgData);
  const customPerms = normalizePermissionsList(orgData.permissions as any);

  return {
    role,
    permissions: Array.from(new Set([...resolvedPerms, ...customPerms])),
  };
};

export const performPermissionCheck = (
  orgData: OrgData | null | undefined,
  permission: PermissionKey,
  status: "loading" | "success" = "success",
  orgRoles?: OrgRoleRecord[] | null
): PermissionCheckResult => {
  if (status === "loading" || !orgData) {
    return {
      allowed: false,
      reason: "Data still loading",
      status: "loading",
    };
  }

  const { role, permissions } = extractRoleAndPermissions(
    orgData,
    undefined,
    orgRoles
  );
  const allowed = checkPermission(
    role,
    permission,
    permissions,
    undefined,
    undefined,
    orgRoles
  );

  return {
    allowed,
    reason: allowed
      ? `Permission granted via role: ${role}`
      : `Permission denied. Required: ${permission}`,
    status: "authorized",
  };
};

export const getEffectivePermissions = (
  role: UserRole | null | undefined,
  orgData: OrgData | null | undefined,
  customPermissions?: PermissionKey[] | null,
  rolePermissionsMap: RolePermissionsMap = DEFAULT_ROLE_PERMISSIONS
): PermissionKey[] => {
  if (getRoleHierarchyLevel(role) >= 90) {
    return rolePermissionsMap.owner;
  }

  if (customPermissions && Array.isArray(customPermissions)) {
    return customPermissions;
  }

  const customRolePerms = getCustomRolePermissions(role, orgData?.customRoles);
  if (customRolePerms) {
    return customRolePerms;
  }

  if (role) {
    const normalized = normalizeRoleKey(role);
    if (rolePermissionsMap[normalized]) {
      return rolePermissionsMap[normalized];
    }
    if (rolePermissionsMap[role]) {
      return rolePermissionsMap[role];
    }
  }

  return [];
};

export const hasAnyPermission = (
  role: UserRole | null | undefined,
  permissions: PermissionKey[],
  customPermissions?: PermissionKey[] | null,
  rolePermissionsMap: RolePermissionsMap = DEFAULT_ROLE_PERMISSIONS,
  customRoles?: CustomRole[] | undefined
): boolean => {
  return permissions.some((perm) =>
    checkPermission(
      role,
      perm,
      customPermissions,
      rolePermissionsMap,
      customRoles
    )
  );
};

export const hasAllPermissions = (
  role: UserRole | null | undefined,
  permissions: PermissionKey[],
  customPermissions?: PermissionKey[] | null,
  rolePermissionsMap: RolePermissionsMap = DEFAULT_ROLE_PERMISSIONS,
  customRoles?: CustomRole[] | undefined
): boolean => {
  return permissions.every((perm) =>
    checkPermission(
      role,
      perm,
      customPermissions,
      rolePermissionsMap,
      customRoles
    )
  );
};
