<template>
  <q-page>
    <div class="row">
      <q-toolbar class="bg-primary text-white q-my-md shadow-2">
        <span>Cups</span>
        <q-space />
        <q-separator />
        <q-btn
          v-if="authenticated && admin"
          flat
          round
          icon="add"
          @click="createCup()"
        >
          <q-tooltip>Create new cup</q-tooltip>
        </q-btn>
      </q-toolbar>
    </div>
    <q-table title="Cups" :rows="rows" :columns="columns">
      <template v-slot:body-cell-index="props">
        <q-td :props="props">
          <b>{{ props.value }}</b>
        </q-td>
      </template>

      <template v-slot:body-cell-started="props">
        <q-td :props="props">
          <bool-icon :value="props.value" />
        </q-td>
      </template>

      <template v-slot:body-cell-over="props">
        <q-td :props="props">
          <bool-icon :value="props.value" />
        </q-td>
      </template>

      <template v-slot:body-cell-createdAt="props">
        <q-td :props="props">
          <date :value="props.value" />
        </q-td>
      </template>

      <template v-slot:body-cell-updatedAt="props">
        <q-td :props="props">
          <date :value="props.value" />
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            flat
            round
            dense
            icon="delete"
            class="q-mr-xs"
            v-if="authenticated && admin"
            :disable="props.row.over || props.row.started"
            @click="removeCup(props.row._id)"
          >
            <q-tooltip> Remove cup {{ props.row.title }} </q-tooltip>
          </q-btn>

          <router-link :to="`/cup/${props.row._id}`">
            <q-btn flat round dense icon="double_arrow" class="q-mr-xs">
              <q-tooltip> Cup {{ props.row.title }} </q-tooltip>
            </q-btn>
          </router-link>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import APIService from "src/services/api";
import BoolIcon from "src/components/BoolIcon.vue";
import wrapLoading from "src/utils/loading";
import { mapState } from "vuex";
import Date from "src/components/Date";

export default {
  name: "Cups",
  components: {
    BoolIcon,
    Date,
  },
  mounted() {
    this.loadCups();
  },
  computed: {
    ...mapState({
      authenticated: (state) => !!state.general.user,
      admin: (state) => !!state.general.user && state.general.user.admin,
    }),
  },

  methods: {
    async removeCup(cupId) {
      this.$q
        .dialog({
          title: "Confirm",
          message: "Are you sure you want to remove this cup ?",
          cancel: true,
          persistent: false,
        })
        .onOk(async () => {
          wrapLoading(this.$q, async () => {
            await APIService.removeCup(cupId);
            await this.loadCups();
          });
        });
    },
    async createCup() {
      this.$q
        .dialog({
          title: "Prompt",
          message: `How do you want to name the cup ?`,
          prompt: {
            model: "",
            type: "text", // optional
          },
          cancel: true,
          persistent: false,
        })
        .onOk(async (cupName) => {
          wrapLoading(this.$q, async () => {
            const res = await APIService.createCup(cupName);
            if (res.name && res.name.includes("Error")) {
              const { message } = res;
              return this.$q.notify({ type: "negative", message });
            }
            await this.loadCups();
          });
        });
    },
    async loadCups() {
      wrapLoading(this.$q, async () => {
        const cups = await APIService.cups();

        this.rows = cups.map((r, index) => ({ ...r, index }));
      });
    },
  },

  data() {
    const columns = [
      {
        name: "index",
        label: "#",
        field: "index",
      },
      {
        name: "title",
        required: true,
        label: "Title",
        field: "title",
        align: "left",
        sortable: true,
      },
      {
        name: "type",
        required: true,
        label: "Type",
        field: "type",
        sortable: true,
      },
      {
        name: "challengers",
        label: "Players",
        field: "challengers",
        sortable: true,
        format: (val) => `${val.length}`,
      },
      {
        name: "maps",
        label: "Maps",
        field: "maps",
        format: (val) => `${val.length}`,
      },
      {
        name: "over",
        label: "Over?",
        field: "over",
      },
      {
        name: "started",
        label: "Started?",
        field: "started",
      },
      {
        name: "createdAt",
        label: "Created At",
        field: "createdAt",
      },
      {
        name: "updatedAt",
        label: "Updated At",
        field: "updatedAt",
      },
      {
        name: "actions",
        label: "Actions",
      },
    ];
    return {
      columns,
      rows: [],
    };
  },
};
</script>
