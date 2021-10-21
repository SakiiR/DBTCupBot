<template>
  <q-page>
    <div v-if="!!cup">
      <h3>{{ cup.title }}</h3>

      <div class="row">
        <div class="col-12">
          <cup-bracket :cup="cup" />
        </div>
      </div>

      <br />

      <div class="row">
        <div class="col-12">
          <cup-matches :cup="cup" />
        </div>
      </div>

      <br />

      <div class="row">
        <div class="col-9">
          <cup-players :cup="cup" @update="this.getCup()" />
        </div>
        <div class="col-1"></div>
        <div class="col-2">
          <cup-maps :cup="cup" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import APIService from "src/services/api";
import CupPlayers from "src/components/cup/Players.vue";
import CupMaps from "src/components/cup/Maps.vue";
import CupBracket from "src/components/cup/Bracket.vue";
import CupMatches from "src/components/cup/Matches.vue";

export default {
  name: "Cup",
  components: {
    CupPlayers,
    CupMaps,
    CupBracket,
    CupMatches,
  },
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
