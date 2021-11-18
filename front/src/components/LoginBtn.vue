<template>
  <q-btn flat @click="loginClick()">
    Login with discord
    <q-avatar size="42px">
      <img src="/img/discord.png" />
    </q-avatar>
  </q-btn>
</template>

<script>
export default {
  name: "LoginBtn",
  methods: {
    loginClick() {
      window.location = `/api/auth/login`;
    },
  },
};
</script>
