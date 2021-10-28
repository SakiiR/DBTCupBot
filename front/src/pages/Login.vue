<template>
  <q-page class="flex flex-center">
    <q-btn flat @click="loginClick()">
      Login with discord
      <q-avatar size="42px">
        <img src="/img/discord.png" />
      </q-avatar>
    </q-btn>
  </q-page>
</template>

<script>
export default {
  name: "Login",
  methods: {
    loginClick() {
      window.location = `/api/auth/login`;
    },
  },
};
</script>
