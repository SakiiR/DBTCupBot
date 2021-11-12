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
          <bool-icon :value="props.value" />
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

          <q-btn
            v-if="isAdmin"
            @click="kickPlayer(props.row)"
            flat
            dense
            round
            icon="person_remove"
            ><q-tooltip>Kick player</q-tooltip></q-btn
          >

          <router-link :to="`/user/${props.row._id}`">
            <q-btn flat round dense icon="double_arrow" class="q-mr-xs">
              <q-tooltip> User {{ props.row.discordTag }} </q-tooltip>
            </q-btn>
          </router-link>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script>
import APIService from "src/services/api";
import { mapState } from "vuex";
import BoolIcon from "../BoolIcon.vue";
import wrapLoading from "src/utils/loading";

export default {
  components: { BoolIcon },
  name: "CupPlayers",
  props: {
    cup: Object,
  },
  computed: {
    ...mapState({
      user: (state) => state.general.user,
      authenticated: (state) => !!state.general.user,
      isAdmin: (state) => !!state.general.user && state.general.user.admin,
    }),
    cupLocked() {
      const cup = this.cup.cup;
      return cup.over || cup.started;
    },
  },
  methods: {
    async kickPlayer(user) {
      if (this.cupLocked) {
        return this.$q.notify({
          type: "negative",
          message: "The cup cannot be modified",
        });
      }

      this.$q
        .dialog({
          title: "Confirm",
          message: `Are you sure you want to kick '${user.discordTag}' from the cup ?`,
          cancel: true,
          persistent: false,
        })
        .onOk(() => {
          wrapLoading(this.$q, async () => {
            await APIService.kickPlayer(this.cup.cup._id, user._id);
            this.$emit("update");
          });
        });
    },
    async adjustSeeding(user, direction) {
      if (this.cupLocked) {
        return this.$q.notify({
          type: "negative",
          message: "The cup cannot be modified",
        });
      }

      wrapLoading(this.$q, async () => {
        await APIService.adjustSeeding(this.cup.cup._id, user, direction);
        this.$emit("update");
      });
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
