<template>
  <router-view />
</template>
<script>
import { useQuasar } from "quasar";
import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
  setup() {
    const $q = useQuasar();
    $q.dark.set(true);

    $q.loadingBar.setDefaults({
      color: "negative",
      size: "5px",
      position: "bottom",
    });
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

a,
a:visited,
a:hover,
a:active {
  color: inherit;
}
</style>
