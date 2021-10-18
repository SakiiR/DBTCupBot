<template>
  <q-page>
    <span>Cup is {{ $route.params.id }}</span>
  </q-page>
</template>

<script>
import APIService from "src/services/api";
export default {
  name: "Cup",
  data() {
    return {
      cup: null,
    };
  },
  mounted() {
    this.getCup();
  },
  methods: {
    async getCup() {
      const cup = await APIService.cup(this.$route.params.id);

      this.cup = cup;
    },
  },
};
</script>
