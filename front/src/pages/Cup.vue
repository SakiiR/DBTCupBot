<template>
  <q-page>
    <div v-if="!!cup">
      <div class="row">
        <q-toolbar class="bg-primary text-white q-my-md shadow-2">
          <span>{{ cup.cup.title }}</span>

          <q-space />

          <q-select
            label="Cup BO strategy"
            v-model="boStrategy"
            style="width: 500px"
            :disable="cupLocked || !admin"
            :options="boStrategyOptions"
            @update:model-value="onBoStrategyChange()"
          />

          <q-checkbox
            color="positive"
            label="Automatic seeding"
            @update:model-value="onAutomaticSeedingChange()"
            :disable="cupLocked || !admin"
            v-model="cup.cup.automaticSeeding"
          >
            <q-tooltip>Automatic seeding</q-tooltip>
          </q-checkbox>

          <q-btn
            v-if="authenticated && !cupJoined"
            flat
            stretch
            color="positive"
            label="Join"
            @click="joinCup()"
          />

          <q-btn
            v-if="authenticated && cupJoined"
            flat
            stretch
            color="negative"
            label="Leave"
            @click="leaveCup()"
          />

          <q-btn
            v-if="admin"
            flat
            stretch
            color="accent"
            label="Preview Seeding"
            @click="previewSeeding()"
          />

          <q-btn
            v-if="admin && !cupLocked"
            flat
            stretch
            color="positive"
            label="Start"
            @click="startCup()"
          />

          <q-btn
            v-if="admin && cupLocked"
            flat
            stretch
            color="negative"
            label="Cancel"
            @click="cancelCup()"
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
        <div class="col-9 q-pr-md">
          <cup-players :cup="cup" @update="this.getCup()" />
        </div>
        <div class="col-3 q-pl-md">
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
import wrapLoading from "src/utils/loading";
import BoStrategy from "src/utils/bo-strategy";
import sleep from "src/utils/sleep";

export default {
  name: "Cup",
  components: {
    CupPlayers,
    CupMaps,
    CupBracket,
    CupMatches,
  },
  data() {
    const boStrategyOptions = [
      ...Object.keys(BoStrategy).map((k) => ({
        label: BoStrategy[k].label,
        value: BoStrategy[k].value,
      })),
    ];

    return {
      cup: null,
      polling: null,
      boStrategy: null,
      boStrategyOptions,
    };
  },
  mounted() {
    const interval = 10000;

    this.getCup();
    this.polling = setInterval(() => {
      this.getCup();
    }, interval);
  },
  beforeUnmount() {
    if (this.polling) clearInterval(this.polling);
  },

  computed: {
    ...mapState({
      user: (state) => state.general.user,
      authenticated: (state) => !!state.general.user,
      admin: (state) => !!state.general.user && state.general.user.admin,
    }),
    cupLocked() {
      const { cup } = this.cup;
      return cup.started || cup.over;
    },
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
    async onAutomaticSeedingChange() {
      const automaticSeeding = !this.cup.cup.automaticSeeding;

      wrapLoading(this.$q, async () => {
        await APIService.setAutomaticSeeding(
          this.$route.params.id,
          automaticSeeding
        );
        await this.getCup();
      });
    },
    async onBoStrategyChange() {
      const strategy = this.boStrategy.value;

      wrapLoading(this.$q, async () => {
        await APIService.setBoStrategy(this.$route.params.id, strategy);
        await this.getCup();
      });
    },
    async getCup() {
      wrapLoading(this.$q, async () => {
        const cup = await APIService.cup(this.$route.params.id);
        this.cup = cup;
        this.boStrategy = this.boStrategyOptions.find(
          (b) => b.value === this.cup.cup.boStrategy
        );
      });
    },

    async previewSeeding() {
      wrapLoading(this.$q, async () => {
        const seeding = await APIService.previewSeeding(this.cup.cup._id);

        let content = ``;
        let i = 0;

        content += `<ul>`;
        for (const player of seeding) {
          if (i++ % 2 == 0) content += "<br />";
          content += `<li>${player ? player : "BYE"}</li>`;
        }
        content += `</ul>`;

        this.$q.dialog({
          message: content,
          html: true,
        });
      });
    },
    async startCup() {
      this.$q
        .dialog({
          title: "Confirm",
          message: "Are you sure you want to start this cup ?",
          cancel: true,
          persistent: false,
        })
        .onOk(async () => {
          wrapLoading(this.$q, async () => {
            await APIService.startCup(this.cup.cup._id);
            await sleep(1000);
            location.reload();
          });
        });
    },

    async cancelCup() {
      this.$q
        .dialog({
          title: "Confirm",
          message: "Are you sure you want to cancel this cup ?",
          cancel: true,
          persistent: false,
        })
        .onOk(async () => {
          wrapLoading(this.$q, async () => {
            await APIService.cancelCup(this.cup.cup._id);
            await sleep(1000);
            location.reload();
          });
        });
    },

    async joinCup() {
      if (this.cupLocked) {
        return this.$q.notify({
          color: "negative",
          message: "The cup is locked",
        });
      }

      wrapLoading(this.$q, async () => {
        await APIService.joinCup(this.$route.params.id);
        await this.getCup();
      });
    },
    async leaveCup() {
      if (this.cupLocked) {
        return this.$q.notify({
          color: "negative",
          message: "The cup is locked",
        });
      }
      this.$q
        .dialog({
          title: "Confirm",
          message: "Are you sure you want to leave this cup ?",
          cancel: true,
          persistent: false,
        })
        .onOk(async () => {
          wrapLoading(this.$q, async () => {
            await APIService.leaveCup(this.$route.params.id);
            await this.getCup();
          });
        });
    },
  },
};
</script>
