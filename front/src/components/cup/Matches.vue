<template>
  <div v-if="!!cup.cup">
    <q-table
      :title="`Matches (${cup.cup.matches.length})`"
      :rows="cup.cup.matches"
      :columns="columns"
      :pagination="initialPagination"
      row-key="_id"
    >
      <template v-slot:body-cell-match_played="props">
        <q-td :props="props">
          <div v-for="map in props.value" :key="map.match_id">
            <router-link :to="`/match/${map.match_id}`">{{
              map.match_map
            }}</router-link>
          </div>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script>
export default {
  name: "CupPlayers",
  props: {
    cup: Object,
  },
  data() {
    const columns = [
      {
        name: "player1",
        label: "Player 1",
        field: (c) => c.highSeedPlayer.epicName,
        align: "left",
      },
      {
        name: "player2",
        label: "Player 2",
        field: (c) => c.lowSeedPlayer.epicName,
        align: "left",
      },
      {
        name: "match_played",
        label: "Matches played",
        field: "maps",
        align: "left",
      },
    ];

    return {
      columns,
      initialPagination: {
        page: 1,
        rowsPerPage: 200,
      },
    };
  },
};
</script>
