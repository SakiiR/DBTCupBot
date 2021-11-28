<template>
  <div>
    <q-chip color="warning">
      <q-tooltip> Position </q-tooltip>
      <b>{{ value.position }}</b>
    </q-chip>

    <q-chip color="accent">
      <q-tooltip> Tier </q-tooltip>
      <b>{{ tier }}</b>
    </q-chip>

    <q-chip v-if="!!value.tier" color="white">
      <div :class="`rank rank-${tier}`" :title="rankHuman"></div>
      <q-tooltip>{{ rankHuman }}</q-tooltip>
    </q-chip>
  </div>
</template>

<script>
const titleByTier = {
  41: "Elite",
  42: "Grandmaster",
  43: "High Warlord",
  44: "Legend",
};
const tierNames = [
  "Explorer",
  "Artisan",
  "Scout",
  "Hunter",
  "Tactician",
  "Sentinel",
  "Vindicator",
  "Architect",
];
const romans = [" V", " I", " II", " III", " IV"];
for (let index = 0; index < 41; index++) {
  titleByTier[index] =
    tierNames[Math.round((index - 3) / 5)] + romans[(index % 10) % 5];
}
export default {
  name: "Rating",
  props: {
    value: Object,
  },
  data() {
    return {
      titleByTier,
    };
  },
  computed: {
    tier() {
      const { value } = this;

      if (value.position === 0) return value.tier;

      if (value.position === 1) return 44;

      if (value.position <= 50) return 43;

      if (value.position <= 71) return 42;

      return value.tier;
    },
    rankHuman() {
      return this.titleByTier[this.tier];
    },
  },
};
</script>

<style scoped>
.rank {
  width: 30px;
  height: 30px;
  background-image: url("/ranks_sprite_50.png");
  background-size: 30px;
  background-repeat: no-repeat;
}

.rank-0 {
  background-position: 0 -1px;
}
.rank-1 {
  background-position: 0 -31px;
}
.rank-2 {
  background-position: 0 -61px;
}
.rank-3 {
  background-position: 0 -91px;
}
.rank-4 {
  background-position: 0 -121px;
}
.rank-5 {
  background-position: 0 -151px;
}
.rank-6 {
  background-position: 0 -181px;
}
.rank-7 {
  background-position: 0 -211px;
}
.rank-8 {
  background-position: 0 -241px;
}
.rank-9 {
  background-position: 0 -271px;
}
.rank-10 {
  background-position: 0 -301px;
}
.rank-11 {
  background-position: 0 -331px;
}
.rank-12 {
  background-position: 0 -361px;
}
.rank-13 {
  background-position: 0 -391px;
}
.rank-14 {
  background-position: 0 -421px;
}
.rank-15 {
  background-position: 0 -451px;
}
.rank-16 {
  background-position: 0 -481px;
}
.rank-17 {
  background-position: 0 -511px;
}
.rank-18 {
  background-position: 0 -541px;
}
.rank-19 {
  background-position: 0 -571px;
}
.rank-20 {
  background-position: 0 -601px;
}
.rank-21 {
  background-position: 0 -631px;
}
.rank-22 {
  background-position: 0 -661px;
}
.rank-23 {
  background-position: 0 -691px;
}
.rank-24 {
  background-position: 0 -721px;
}
.rank-25 {
  background-position: 0 -751px;
}
.rank-26 {
  background-position: 0 -781px;
}
.rank-27 {
  background-position: 0 -811px;
}
.rank-28 {
  background-position: 0 -841px;
}
.rank-29 {
  background-position: 0 -871px;
}
.rank-30 {
  background-position: 0 -901px;
}
.rank-31 {
  background-position: 0 -931px;
}
.rank-32 {
  background-position: 0 -961px;
}
.rank-33 {
  background-position: 0 -991px;
}
.rank-34 {
  background-position: 0 -1021px;
}
.rank-35 {
  background-position: 0 -1051px;
}
.rank-36 {
  background-position: 0 -1081px;
}
.rank-37 {
  background-position: 0 -1111px;
}
.rank-38 {
  background-position: 0 -1141px;
}
.rank-39 {
  background-position: 0 -1171px;
}
.rank-40 {
  background-position: 0 -1201px;
}
.rank-41 {
  background-position: 0 -1231px;
}
.rank-42 {
  background-position: 0 -1261px;
}
.rank-43 {
  background-position: 0 -1291px;
}
.rank-44 {
  background-position: 0 -1321px;
}
.rank-45 {
  background-position: 0 -1351px;
}
</style>
