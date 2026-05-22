export const appConfig = {
  name: "AccessHub",
  description: "Enterprise RBAC admin management panel",

  routes: {
    login: "/login",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",

    dashboard: "/dashboard",
    users: "/users",
    roles: "/roles",
    departments: "/departments",
    permissions: "/permissions",
    audits: "/audits",

    forbidden: "/403",
    notFound: "/404",
  },
};