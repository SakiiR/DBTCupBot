<template>
  <q-page class="flex flex-center">
    <pre>{{ user }}</pre>
  </q-page>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "Me",
  setup() {},
  computed: {
    ...mapState({
      user: (state) => state.general.user,
    }),
  },
};
</script>
