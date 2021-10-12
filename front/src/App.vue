<template>
  <router-view />
</template>
<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
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
