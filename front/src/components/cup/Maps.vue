<template>
  <div v-if="!!cup" style="height: 100%">
    <q-toolbar class="bg-primary text-white shadow-2">
      <q-toolbar-title
        >Maps ({{ cup.cup.maps.length }})
        <q-btn
          v-if="isAdmin"
          :disabled="cupLocked"
          @click="addMap()"
          flat
          dense
          round
          icon="add"
        />
      </q-toolbar-title>
    </q-toolbar>
    <q-list
      bordered
      dark
      class="scroll"
      style="background-color: rgb(29, 29, 29); max-height: 600px"
    >
      <q-item
        v-for="map in cup.cup.maps"
        :key="map"
        class="q-my-sm"
        clickable
        v-ripple
      >
        <q-item-section avatar>
          <q-avatar color="primary" text-color="white">
            <img :src="`/img/maps/${map}.png`" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ map }}</q-item-label>
          <q-item-label caption lines="1">{{ map }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            v-if="isAdmin"
            :disabled="cupLocked"
            @click="removeMap(map)"
            flat
            dense
            round
            icon="delete"
          />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script>
import { mapState } from "vuex";
import APIService from "src/services/api";
import wrapLoading from "src/utils/loading";

export default {
  name: "CupMaps",
  props: {
    cup: Object,
  },
  computed: {
    ...mapState({
      isAdmin: (state) => !!state.general.user && state.general.user.admin,
    }),
    cupLocked() {
      const cup = this.cup.cup;
      return cup.over || cup.started;
    },
  },
  methods: {
    addMap() {
      this.$q
        .dialog({
          title: "Map prompt",
          message: "Which map to add ?",
          prompt: {
            model: "",
            type: "text", // optional
          },
          cancel: true,
          persistent: false,
        })
        .onOk(async (mapName) => {
          if (!mapName) return;

          wrapLoading(this.$q, async () => {
            await APIService.addMap(this.cup.cup._id, mapName);
          });

          this.$emit("update");
        });
    },

    removeMap(mapName) {
      this.$q
        .dialog({
          title: "Are you sure?",
          message: `Are you sure you want to remove ${mapName} from the mapPool ?`,
          cancel: true,
          persistent: false,
        })
        .onOk(async () => {
          wrapLoading(this.$q, async () => {
            await APIService.removeMap(this.cup.cup._id, mapName);
          });

          this.$emit("update");
        });
    },
  },
  data() {
    return {};
  },
};
</script>

<style scoped>
.q-list {
  height: 90%;
}
</style>
