<template>
  <span></span>
</template>

<script>
import SessionManager from "src/utils/session";

export default {
  name: "Logout",
  setup() {},
  mounted() {
    SessionManager.clear();
    location = "/";
  },
};
</script>
