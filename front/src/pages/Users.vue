<template>
  <q-page v-if="!!users">
    <div class="row">
      <q-toolbar class="bg-primary text-white q-my-md shadow-2">
        <span>Users</span>
        <q-space />
        <q-separator />
        <q-btn
          v-if="authenticated && isAdmin"
          flat
          round
          icon="refresh"
          @click="refreshRating()"
        >
          <q-tooltip>Refresh rating</q-tooltip>
        </q-btn>
      </q-toolbar>
    </div>
    <q-table
      :title="`Users (${users.length})`"
      :rows="users"
      :columns="columns"
      :pagination="initialPagination"
      row-key="discordTag"
    >
      <template v-slot:body-cell-admin="props">
        <q-td :props="props">
          <q-toggle
            v-model="{ v: props.value }.v"
            @click="authenticated && isAdmin && changeAdminess(props.row)"
            :disable="!(authenticated && isAdmin)"
            :color="!!props.value ? 'green' : 'red'"
          />
        </q-td>
      </template>

      <template v-slot:body-cell-rating="props">
        <q-td :props="props">
          <rating :value="props.value" />
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <router-link :to="`/user/${props.row._id}`">
            <q-btn flat round dense icon="double_arrow" class="q-mr-xs">
              <q-tooltip> User {{ props.row.discordTag }} </q-tooltip>
            </q-btn>
          </router-link>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import APIService from "src/services/api";
import { mapState } from "vuex";
import wrapLoading from "src/utils/loading";
import Rating from "src/components/Rating";

export default {
  name: "Users",
  components: {
    Rating,
  },
  computed: mapState({
    user: (state) => state.general.user,
    authenticated: (state) => !!state.general.user,
    isAdmin: (state) => !!state.general.user && state.general.user.admin,
  }),
  mounted() {
    this.getUsers();
  },
  methods: {
    async refreshRating() {
      wrapLoading(this.$q, async () => {
        await APIService.refreshRating();
        await this.getUsers();
      });
    },
    async changeAdminess(user) {
      wrapLoading(this.$q, async () => {
        await APIService.toggleAdmin(user._id);
        await this.getUsers();
      });
    },
    async getUsers() {
      wrapLoading(this.$q, async () => {
        const users = await APIService.listUsers();

        this.users = users;
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
      users: [],
      initialPagination: {
        page: 1,
        rowsPerPage: 0,
      },
    };
  },
};
</script>
