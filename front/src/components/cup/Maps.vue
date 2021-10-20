<template>
  <div v-if="!!cup" style="max-width: 350px">
    <q-toolbar class="bg-primary text-white shadow-2">
      <q-toolbar-title>Maps ({{ cup.cup.maps.length }})</q-toolbar-title>
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
      </q-item>
    </q-list>
  </div>
</template>

<script>
export default {
  name: "CupMaps",
  props: {
    cup: Object,
  },
  data() {
    return {};
  },
};
</script>
