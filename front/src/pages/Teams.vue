<template>
  <q-page v-if="!!teams">
    <div class="row">
      <q-toolbar class="bg-primary text-white q-my-md shadow-2">
        <span>Teams</span>
        <q-space />
        <q-separator />

        <q-btn
          v-if="authenticated"
          @click="createTeam()"
          flat
          dense
          round
          icon="add"
        >
          <q-tooltip>Create new team</q-tooltip></q-btn
        >
      </q-toolbar>
    </div>
    <q-table
      :title="`Teams (${teams.length})`"
      :rows="teams"
      :columns="columns"
      :pagination="initialPagination"
      row-key="name"
    >
      <template v-slot:body-cell-players="props">
        <q-td :props="props">
          <div v-for="player of props.value" :key="player._id">
            <b>{{ player.discordTag }}</b>
          </div>
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
            v-if="authenticated && !inTeam(props.row._id)"
            @click="joinTeam(props.row._id)"
            flat
            dense
            round
            icon="login"
          >
            <q-tooltip>Join {{ props.row.name }}</q-tooltip></q-btn
          >

          <q-btn
            v-if="authenticated && inTeam(props.row._id)"
            @click="leaveTeam(props.row._id)"
            flat
            dense
            round
            icon="logout"
          >
            <q-tooltip>Leave {{ props.row.name }}</q-tooltip></q-btn
          >

          <q-btn
            v-if="authenticated && canEditTeam(props.row._id)"
            @click="editTeam(props.row._id)"
            flat
            dense
            round
            icon="edit"
          >
            <q-tooltip>Edit {{ props.row.name }}</q-tooltip>
          </q-btn>

          <q-btn
            v-if="authenticated && canEditTeam(props.row._id)"
            @click="renewPassword(props.row._id)"
            flat
            dense
            round
            icon="refresh"
          >
            <q-tooltip>Renew password for {{ props.row.name }}</q-tooltip>
          </q-btn>

          <q-btn
            v-if="authenticated && canViewTeamPassword(props.row._id)"
            @click="unlockTeamPassword(props.row._id)"
            flat
            dense
            round
            icon="visibility"
          >
            <q-tooltip>Get password for {{ props.row.name }}</q-tooltip>
          </q-btn>

          <q-btn
            v-if="authenticated && isAdmin"
            @click="removeTeam(props.row._id)"
            flat
            dense
            round
            icon="delete"
          >
            <q-tooltip>Remove {{ props.row.name }}</q-tooltip></q-btn
          >
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script>
import APIService from "src/services/api";
import { mapState } from "vuex";
import wrapLoading from "src/utils/loading";
import Date from "src/components/Date";
import TeamPassword from "src/components/dialog/TeamPassword";

export default {
  name: "Teams",
  components: {
    Date,
  },
  computed: mapState({
    user: (state) => state.general.user,
    authenticated: (state) => !!state.general.user,
    isAdmin: (state) => !!state.general.user && state.general.user.admin,
  }),
  mounted() {
    this.getTeams();
  },
  methods: {
    async getTeams() {
      wrapLoading(this.$q, async () => {
        const teams = await APIService.listTeams();

        this.teams = teams;
      });
    },
    inTeam(teamId) {
      const team = this.teams.find((t) => t._id === teamId);

      if (!team.players.length) return false;

      // If its a non-populated array
      if (typeof team.players[0] === "string")
        return team.players.includes(this.user._id);

      return team.players.map((p) => p._id).includes(this.user._id);
    },

    canEditTeam(teamId) {
      const team = this.teams.find((t) => t._id === teamId);
      const ownerId =
        typeof team.owner === "string" ? team.owner : team.owner._id;

      return ownerId === team.owner || this.isAdmin;
    },

    canViewTeamPassword(teamId) {
      return this.canEditTeam(teamId);
    },

    async getTeamPassword(teamId) {
      const password = await wrapLoading(this.$q, async () => {
        return await APIService.teamPassword(teamId);
      });
      return password;
    },

    async unlockTeamPassword(teamId) {
      const password = await this.getTeamPassword(teamId);

      if (!password)
        return this.$q.notify({
          message: "You don't have access to that password",
          color: "negative",
        });

      this.$q.dialog({
        component: TeamPassword,
        componentProps: {
          password,
        },
      });
    },

    async renewPassword(teamId) {
      await wrapLoading(this.$q, async () => {
        await APIService.renewTeamPassword(teamId);
      });
      this.$q.notify({
        message: "Password renewed!",
        color: "positive",
      });
    },

    async editTeam(teamId) {
      const team = this.teams.find((t) => t._id === teamId);

      this.$q
        .dialog({
          title: "Edit team",
          message: "Please, enter a new team name",
          prompt: {
            model: team.name,
            type: "text", // optional
          },
        })
        .onOk(async (name) => {
          wrapLoading(this.$q, async () => {
            await APIService.editTeam(teamId, name);
            await this.getTeams();
          });
        });
    },

    async createTeam() {
      this.$q
        .dialog({
          title: "Enter team name",
          message: "Please, enter team name",
          prompt: {
            model: "",
            type: "text", // optional
          },
        })
        .onOk(async (name) => {
          wrapLoading(this.$q, async () => {
            await APIService.createTeam(name);
            await this.getTeams();
          });
        });
    },
    async removeTeam(teamId) {
      this.$q
        .dialog({
          title: "Confirm",
          message: "Are you sure you want to remove this team ?",
          cancel: true,
          persistent: false,
        })
        .onOk(async () => {
          wrapLoading(this.$q, async () => {
            await APIService.removeTeam(teamId);
            await this.getTeams();
          });
        });
    },
    async joinTeam(teamId) {
      this.$q
        .dialog({
          title: "Enter password",
          message: "Please, enter team password",
          prompt: {
            model: "",
            type: "text", // optional
          },
        })
        .onOk(async (password) => {
          wrapLoading(this.$q, async () => {
            await APIService.joinTeam(teamId, password);
            await this.getTeams();
          });
        });
    },
    async leaveTeam(teamId) {
      this.$q
        .dialog({
          title: "Confirm",
          message: "Are you sure you want to leave this team ?",
          cancel: true,
          persistent: false,
        })
        .onOk(async () => {
          wrapLoading(this.$q, async () => {
            await APIService.leaveTeam(teamId);
            await this.getTeams();
          });
        });
    },
  },
  data() {
    const columns = [
      {
        name: "name",
        label: "Name",
        field: "name",
        align: "left",
      },
      {
        name: "players",
        label: "Players",
        field: "players",
        align: "left",
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
      teams: [],
      initialPagination: {
        page: 1,
        rowsPerPage: 0,
      },
    };
  },
};
</script>
