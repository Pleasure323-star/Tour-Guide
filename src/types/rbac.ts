export type PredefinedRole =
  | "owner"
  | "administrator"
  | "manager"
  | "project_lead"
  | "user"
  | "bot"
  | "guest";

export type UserRole = PredefinedRole | string;

export type PermissionKey =
  | "manage:channels"
  | "manage:members"
  | "manage:organization"
  | "manage:settings"
  | "manage:billing"
  | "manage:agents"
  | "manage:workflows"
  | "manage:integrations"
  | "manage:security"
  | "manage:roles"
  | "view:analytics"
  | "view:billing"
  | "view:channels"
  | "edit:messages"
  | "delete:messages"
  | "delete:files"
  | "create:channels"
  | "create:agents"
  | "create:role"
  | "create:webhooks"
  | "archive:channels"
  | "invite:members"
  | "remove:people"
  | "comment:threads"
  | "change:user_org_role";

export type RBACStatus = "loading" | "authorized" | "unauthorized";

export interface RoleHierarchy {
  level: number;
  displayName: string;
}

export interface CustomRole {
  id: string;
  name: string;
  displayName: string;
  hierarchyLevel: number;
  permissions: PermissionKey[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Permission {
  key: PermissionKey;
  description?: string;
}

export interface OrgData {
  id: string;
  name: string;
  slug: string;
  role?: UserRole;
  permissions?: PermissionKey[];
  user_role?: {
    role_id?: string;
    role_name?: string;
    permissions?: string[];
  };
  customRoles?: CustomRole[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface RolePermissionsMap {
  owner: PermissionKey[];
  administrator: PermissionKey[];
  manager: PermissionKey[];
  project_lead: PermissionKey[];
  user: PermissionKey[];
  bot: PermissionKey[];
  guest: PermissionKey[];
  [key: string]: PermissionKey[];
}

export interface RBACContextValue {
  status: RBACStatus;
  userRole: UserRole | null;
  permissions: Set<PermissionKey>;
  hasPermission: (permission: PermissionKey) => boolean;
  isPrivileged: boolean;
}

export interface WithAuthGateProps {
  requiredPermission: PermissionKey;
  LoadingComponent?: React.ComponentType<any>;
}

export interface PermissionBoundaryProps {
  permission: PermissionKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onUnauthorized?: () => void;
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  status: RBACStatus;
}
