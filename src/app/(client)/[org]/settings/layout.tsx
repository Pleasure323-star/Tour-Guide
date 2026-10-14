"use client";

import React, { useContext } from "react";
import SettingsNav from "./components/settings-nav";
import { DataContext } from "~/store/GlobalState";
import { SettingsRolesLoadingContext } from "./context/settings-roles-loading-context";
import { SettingsOrganisationRouteGuard } from "~/components/rbac/SettingsOrganisationRouteGuard";

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const { state } = useContext(DataContext);
  const rolesLoading =
    Boolean(state.orgAccessLoading) || state.orgRoles == null;
  const permissionsLoading =
    Boolean(state.orgAccessLoading) || state.permissionsCatalog == null;

  return (
    <SettingsRolesLoadingContext.Provider
      value={{ rolesLoading, permissionsLoading }}
    >
      <div className="w-full flex relative">
        <SettingsNav />

        <div className={`w-full lg:ml-[355px] mt-[60px]`}>
          <SettingsOrganisationRouteGuard>
            {children}
          </SettingsOrganisationRouteGuard>
        </div>
      </div>
    </SettingsRolesLoadingContext.Provider>
  );
}

export default Layout;
