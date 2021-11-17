<template>
  <div>
    <q-chip color="warning">
      <q-tooltip> Position </q-tooltip>
      <b>{{ value.position }}</b>
    </q-chip>

    <q-chip color="accent">
      <q-tooltip> Tier </q-tooltip>
      <b>{{ value.tier }}</b>
    </q-chip>
  </div>
</template>

<script>
export default {
  name: "Rating",
  props: {
    value: Object,
  },
};
</script>
