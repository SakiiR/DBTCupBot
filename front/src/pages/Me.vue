<template>
  <q-page class="flex flex-center">
    <div class="row">
      <div class="col-12">
        <q-btn flat @click="linkEpic()">
          Link Epic
          <q-avatar size="42px">
            <img src="/img/epic.svg" />
          </q-avatar>
        </q-btn>
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <pre>{{ user }}</pre>
      </div>
    </div>
  </q-page>
</template>

<script>
import APIService from "src/services/api";
import store from "src/store";
import { mapState } from "vuex";

const helpLink = `https://www.epicgames.com/help/en-US/epic-accounts-c74/general-support-c79/what-is-an-epic-account-id-and-where-can-i-find-it-a3659`;
export default {
  name: "Me",
  setup() {},
  computed: {
    ...mapState({
      user: (state) => state.general.user,
    }),
  },
  methods: {
    linkEpic() {
      this.$q
        .dialog({
          title: "Prompt",
          message: `What is your Epic Games Id ? (${helpLink})`,
          prompt: {
            model: "",
            type: "text", // optional
          },
          cancel: true,
          persistent: false,
        })
        .onOk(async (epicId) => {
          await APIService.linkEpic(epicId);
          await store.dispatch("general/fetchMe");
        });
    },
  },
};
</script>
