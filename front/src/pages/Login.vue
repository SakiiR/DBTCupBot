<template>
  <q-page class="flex flex-center">
    <login-btn />
  </q-page>
</template>

<script>
import LoginBtn from "../components/LoginBtn.vue";

export default {
  name: "Login",
  components: {
    LoginBtn,
  },
};
</script>
