<template>
  <div>
    <q-icon
      v-if="!!value"
      name="check"
      color="positive"
      style="font-size: 3em"
    ></q-icon>
    <q-icon
      v-if="!!!value"
      name="close"
      color="negative"
      style="font-size: 3em"
    ></q-icon>
  </div>
</template>

<script>
export default {
  name: "BoolIcon",
  props: {
    value: Boolean,
  },
};
</script>
