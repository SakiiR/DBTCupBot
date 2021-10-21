<template>
  <div v-if="!!cup.cup">
    <q-table
      :title="`Players (${cup.cup.challengers.length})`"
      :rows="cup.cup.challengers"
      :columns="columns"
      :pagination="initialPagination"
      row-key="name"
    >
      <template v-slot:body-cell-admin="props">
        <q-td :props="props">
          <q-icon
            v-if="!!props.value"
            name="check"
            color="positive"
            style="font-size: 3em"
          ></q-icon>
          <q-icon
            v-if="!!!props.value"
            name="close"
            color="negative"
            style="font-size: 3em"
          ></q-icon>
        </q-td>
      </template>

      <template v-slot:body-cell-rating="props">
        <q-td :props="props">
          <q-chip>{{ props.value }}</q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            v-if="isAdmin"
            @click="adjustSeeding(props.row._id, 'up')"
            flat
            dense
            round
            icon="arrow_upward"
          />

          <q-btn
            v-if="isAdmin"
            @click="adjustSeeding(props.row._id, 'down')"
            flat
            dense
            round
            icon="arrow_downward"
          />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script>
import APIService from "src/services/api";
import { mapState } from "vuex";

export default {
  name: "CupPlayers",
  props: {
    cup: Object,
  },
  computed: mapState({
    user: (state) => state.general.user,
    authenticated: (state) => !!state.general.user,
    isAdmin: (state) => !!state.general.user && state.general.user.admin,
  }),
  methods: {
    async adjustSeeding(user, direction) {
      const challengers = await APIService.adjustSeeding(
        this.cup.cup._id,
        user,
        direction
      );

      this.$emit("update");
    },
  },
  data() {
    const columns = [
      {
        name: "epicName",
        label: "Username ( Epic Games )",
        field: "epicName",
        align: "left",
      },
      {
        name: "discordTag",
        label: "Username ( Discord )",
        field: "discordTag",
        align: "left",
      },
      {
        name: "admin",
        label: "Admin?",
        field: "admin",
        align: "left",
      },
      {
        name: "rating",
        label: "Rating",
        field: "rating",
        align: "left",
        sortable: true,
      },
      {
        name: "actions",
        label: "Actions",
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
