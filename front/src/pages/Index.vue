<template>
  <q-page class="flex flex-center">
    <diabotical-api-match id="toto"></diabotical-api-match>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";

import DiaboticalAPIMatch from "src/components/DiaboticalAPIMatch";

export default defineComponent({
  name: "PageIndex",
  components: {
    "diabotical-api-match": DiaboticalAPIMatch,
  },
});
</script>
