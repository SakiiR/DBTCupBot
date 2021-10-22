<template>
  <div v-if="!!cup" style="max-width: 350px">
    <q-toolbar class="bg-primary text-white shadow-2">
      <q-toolbar-title
        >Maps ({{ cup.cup.maps.length }})
        <q-btn v-if="isAdmin" @click="addMap()" flat dense round icon="add" />
      </q-toolbar-title>
    </q-toolbar>
    <q-list bordered>
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

export default {
  name: "CupMaps",
  props: {
    cup: Object,
  },
  computed: mapState({
    isAdmin: (state) => !!state.general.user && state.general.user.admin,
  }),
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

          await APIService.addMap(this.cup.cup._id, mapName);

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
          await APIService.removeMap(this.cup.cup._id, mapName);

          this.$emit("update");
        });
    },
  },
  data() {
    return {};
  },
};
</script>
