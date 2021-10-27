<template>
  <q-page>
    <div v-if="!!cup">
      <div class="row">
        <q-toolbar class="bg-primary text-white q-my-md shadow-2">
          <span>{{ cup.cup.title }}</span>
          <q-space />
          <q-separator />
          <q-btn
            v-if="authenticated && !cupJoined"
            flat
            color="positive"
            label="Join"
            @click="joinCup()"
          />
          <q-btn
            v-if="authenticated && cupJoined"
            flag
            color="negative"
            label="Leave"
            @click="leaveCup()"
          />
        </q-toolbar>
      </div>

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
          <cup-maps :cup="cup" @update="this.getCup()" />
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
import { mapState } from "vuex";

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
  computed: {
    ...mapState({
      user: (state) => state.general.user,
      authenticated: (state) => !!state.general.user,
    }),
    cupJoined() {
      if (!this.authenticated) return false;
      if (!this.cup) return false;

      const { cup } = this.cup;

      return !!cup.challengers.find(
        (c) => c.discordTag === this.user.discordTag
      );
    },
  },
  methods: {
    async getCup() {
      const cup = await APIService.cup(this.$route.params.id);

      this.cup = cup;
    },

    async joinCup() {
      await APIService.joinCup(this.$route.params.id);
      await this.getCup();
    },
    async leaveCup() {
      this.$q
        .dialog({
          title: "Confirm",
          message: "Are you sure you want to leave this cup ?",
          cancel: true,
          persistent: false,
        })
        .onOk(async () => {
          await APIService.leaveCup(this.$route.params.id);
          await this.getCup();
        });
    },
  },
};
</script>
