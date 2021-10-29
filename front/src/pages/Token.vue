<template>
  <span></span>
</template>

<script>
import SessionManager from "src/utils/session";
export default {
  name: "Token",
  setup() {},
  mounted() {
    const [, token] = location.hash.split("?");
    SessionManager.set(token);
    location = "/";
  },
};
</script>
