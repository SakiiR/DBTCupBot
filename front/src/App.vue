<template>
  <router-view />
</template>
<script>
import { useQuasar } from "quasar";
import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
  setup() {
    useQuasar().dark.set(true);
  },
  mounted() {
    window.onerror = function (event) {
      console.log({ msg: "error", event });
    };
  },
});
</script>

<style>
.q-page {
  padding: 10%;
  padding-top: 20px;
}
</style>
