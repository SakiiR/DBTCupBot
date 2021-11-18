<template>
  <div>
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
  computed: {
    humanDate() {
      if (!this.value) return this.unknown;
      return moment(this.value).fromNow();
    },
  },
};
</script>
