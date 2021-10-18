<template>
  <q-page class="flex flex-center">
    <q-btn @click="loginClick">Login with discord</q-btn>
  </q-page>
</template>

<script>
export default {
  name: "Login",
  methods: {
    loginClick() {
      const callbackUrl = `${window.origin}/api/auth/callback`;
      const url = `https://discord.com/api/oauth2/authorize?client_id=890617066325942322&redirect_uri=${callbackUrl}&response_type=code&scope=identify`;

      window.location = url;
    },
  },
};
</script>
