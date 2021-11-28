<template>
  <router-view />
</template>
<script>
import { useQuasar } from "quasar";
import { defineComponent } from "vue";
import SuggestSignin from "src/components/dialog/SuggestSignin";
import { mapState } from "vuex";

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
  computed: mapState({
    authenticated: (state) => !!state.general.user,
  }),
  mounted() {
    window.onerror = function (event) {
      console.log({ msg: "error", event });
    };
  },
  created() {
    setTimeout(() => {
      this.suggestSignIn();
    }, 1000);
  },
  methods: {
    async suggestSignIn() {
      const dismissd =
        localStorage.getItem("dismiss") === "1" || this.authenticated;

      if (!dismissd)
        this.$q.dialog({
          component: SuggestSignin,
        });
    },
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
