<template>
  <div>
    <q-chip>
      <q-tooltip>{{ value }}</q-tooltip>
      {{ humanDate }}
    </q-chip>
  </div>
</template>

<script>
import moment from "moment";

export default {
  name: "Date",
  props: {
    value: String,
  },

  computed: {
    humanDate() {
      return moment(this.value).fromNow();
    },
  },
};
</script>
