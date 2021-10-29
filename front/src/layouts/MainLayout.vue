<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <!-- <q-btn flat dense round icon="menu" aria-label="Menu" /> -->

        <q-toolbar-title> DBT Cup </q-toolbar-title>

        <router-link to="/cups">
          <q-btn flat round dense icon="emoji_events" class="q-mr-xs">
            <q-tooltip> Cups </q-tooltip>
          </q-btn>
        </router-link>

        <router-link to="/users">
          <q-btn flat round dense icon="people" class="q-mr-xs">
            <q-tooltip> Users </q-tooltip>
          </q-btn>
        </router-link>

        <router-link to="/login" v-if="!authenticated">
          <q-btn flat round dense icon="vpn_key" class="q-mr-xs">
            <q-tooltip> Authenticate </q-tooltip>
          </q-btn>
        </router-link>

        <router-link to="/me" v-if="authenticated">
          <q-btn flat round dense icon="person" class="q-mr-xs">
            <q-tooltip> My profile </q-tooltip>
          </q-btn>
        </router-link>

        <router-link to="/logout" v-if="authenticated">
          <q-btn flat round dense icon="lock" class="q-mr-xs">
            <q-tooltip> Logout </q-tooltip>
          </q-btn>
        </router-link>

        <span v-if="authenticated">{{ user.epicName || user.discordTag }}</span>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from "vue";
import store from "src/store";
import { mapState } from "vuex";

export default defineComponent({
  name: "MainLayout",

  setup() {
    store.dispatch("general/fetchMe");
  },

  computed: mapState({
    user: (state) => state.general.user,
    authenticated: (state) => !!state.general.user,
  }),
});
</script>
