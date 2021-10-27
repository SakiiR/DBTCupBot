<template>
  <diabotical-match :match="match" />
</template>

<script>
import DiaboticalMatch from "./DiaboticalMatch.vue";
import formatMatch from "../utils/format-match";

export default {
  name: "DiaboticalAPIMatch",
  props: {
    id: String,
  },
  components: {
    DiaboticalMatch,
  },
  created() {
    this.loadMatch();
  },
  data() {
    return {
      match: null,
    };
  },
  methods: {
    async loadMatch() {
      const response = await fetch(
        `https://api.diabotical.com/api/v0/diabotical/match/${this.id}`
      );
      const { match } = await response.json();

      if (!match) {
        return this.$q.notify({
          type: "negative",
          message: `Invalid match id provided: ${this.id}`,
        });
      }

      this.match = formatMatch(match);
    },
  },
};
</script>
