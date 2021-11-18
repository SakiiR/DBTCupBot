<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">Please authenticated</div>
        <div class="text-subtitle2">unlock access to a ton of features</div>
      </q-card-section>

      <q-card-section>
        <login-btn />
      </q-card-section>

      <q-separator dark />

      <q-card-actions align="right">
        <q-checkbox
          dark
          v-model="dismiss"
          label="I don't want to see this dialog again"
          color="red"
          @click="onDismissChange"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { useDialogPluginComponent } from "quasar";
import LoginBtn from "src/components/LoginBtn";
import { ref } from "vue";

export default {
  name: "SuggestSignin",
  components: { LoginBtn },
  setup() {
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
      useDialogPluginComponent();
    return {
      dialogRef,
      onDialogHide,
      onOKClick() {
        onDialogOK();
      },
      onCancelClick: onDialogCancel,
      dismiss: ref(false),
    };
  },
  methods: {
    onDismissChange() {
      localStorage.setItem("dismiss", this.dismiss ? "1" : "0");
    },
  },
};
</script>
