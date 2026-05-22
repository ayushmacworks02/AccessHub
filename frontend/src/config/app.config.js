export const appConfig = {
  name: "NxAuth",
  description: "Enterprise authentication and RBAC management panel",

  routes: {
    login: "/login",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",

    dashboard: "/dashboard",
    users: "/users",
    roles: "/roles",
    groups: "/groups",
    departments: "/departments",
    permissions: "/permissions",
    audits: "/audits",
    profile: "/profile",
    settings: "/settings",

    forbidden: "/403",
    notFound: "/404",
  },
};