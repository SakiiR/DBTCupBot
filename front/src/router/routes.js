const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/Index.vue") },
      { path: "login", component: () => import("pages/Login.vue") },
      { path: "me", component: () => import("pages/Me.vue") },
      { path: "cups", component: () => import("pages/Cups.vue") },
      { path: "match/:id", component: () => import("pages/Match.vue") },
      { path: "cup/:id", component: () => import("pages/Cup.vue") },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/Error404.vue"),
  },
];

export default routes;
