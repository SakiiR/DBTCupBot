<template>
  <q-page>
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

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
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

export default {
  name: "Cups",
  components: {
    BoolIcon,
  },
  mounted() {
    this.loadCups();
  },

  methods: {
    async loadCups() {
      const cups = await APIService.cups();

      this.rows = cups.map((r, index) => ({ ...r, index }));
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
