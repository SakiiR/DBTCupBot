<template>
  <q-page class="flex flex-center">
    <diabotical-api-match :id="$route.params.id" />
  </q-page>
</template>

<script>
import DiaboticalAPIMatch from "../components/DiaboticalAPIMatch.vue";
export default {
  name: "Match",
  components: {
    "diabotical-api-match": DiaboticalAPIMatch,
  },
  setup() {},
};
</script>
