<template>
  <q-page>
    <div v-if="!!user">
      <div class="row">
        <q-toolbar class="bg-primary text-white q-my-md shadow-2">
          <span>{{ user.discordTag }}</span>
        </q-toolbar>
      </div>

      <div class="row">
        <div class="col-12">
          <pre>{{ user }}</pre>
        </div>
      </div>

      <div class="row">
        <div class="col-12">
          <div class="match" v-for="match in matches" :key="match.match_id">
            <diabotical-api-match :id="match.match_id" />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import APIService from "src/services/api";
import DiaboticalAPIMatchVue from "src/components/DiaboticalAPIMatch.vue";

export default {
  name: "User",
  components: {
    "diabotical-api-match": DiaboticalAPIMatchVue,
  },
  data() {
    return {
      user: null,
      matches: [],
    };
  },
  mounted() {
    this.getUser();
  },
  methods: {
    async getUser() {
      const user = await APIService.user(this.$route.params.id);

      this.user = user;

      if (!this.user.epicId) return;

      this.matches = await APIService.getUserLastMatches(user.epicId);
    },
  },
};
</script>
