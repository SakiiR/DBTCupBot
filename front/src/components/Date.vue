<template>
  <div @click="copy2clipboard()">
    <q-chip>
      <div v-if="!!value">
        <q-tooltip>{{ value }}</q-tooltip>
        {{ humanDate }}
      </div>
      <div v-if="!!!value">
        <q-tooltip>{{ unknown }}</q-tooltip>
        <span>{{ unknown }}</span>
      </div>
    </q-chip>
  </div>
</template>

<script>
import moment from "moment";
import { copyToClipboard } from "quasar";

export default {
  name: "Date",
  data() {
    return {
      unknown: "N/A",
    };
  },
  props: {
    value: String,
  },
  methods: {
    async copy2clipboard() {
      await copyToClipboard(this.value);
      this.$q.notify({
        message: "Copied to clipboard",
        color: "positive",
      });
    },
  },
  computed: {
    humanDate() {
      if (!this.value) return this.unknown;
      return moment(this.value).fromNow();
    },
  },
};
</script>
