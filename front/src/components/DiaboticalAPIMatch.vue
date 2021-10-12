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
        `https://api.diabotical.com/api/v0/diabotical/match/3ce83918-4e0c-49c1-94ce-e253d37471e8`
      );
      const { match } = await response.json();

      this.match = formatMatch(match);
    },
  },
};
</script>
