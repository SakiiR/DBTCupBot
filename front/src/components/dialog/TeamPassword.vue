<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">Unlock team password</div>
        <div class="text-subtitle2">Unlock this team password</div>
      </q-card-section>

      <q-card-section>
        <q-input
          readonly
          outlined
          bottom-slots
          label="Team password"
          :model-value="password"
          :type="inputType"
        >
          <template v-slot:append>
            <q-btn
              @click="toggleViewPassword()"
              flat
              dense
              round
              :icon="inputType === 'password' ? 'visibility' : 'visibility_off'"
            />
            <q-btn
              @click="copyPassword()"
              flat
              dense
              round
              icon="content_paste"
            />
          </template>
        </q-input>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { useDialogPluginComponent } from "quasar";
import { ref } from "vue";

import { copyToClipboard } from "quasar";

export default {
  name: "TeamPassword",
  props: { password: String },
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
  data() {
    return {
      inputType: "password",
    };
  },
  methods: {
    toggleViewPassword() {
      this.inputType = this.inputType === "password" ? "text" : "password";
    },
    copyPassword() {
      copyToClipboard(this.password)
        .then(() => {
          this.$q.notify({
            message: "Saved to clipboard!",
            color: "positive",
          });
        })
        .catch(() => {
          this.$q.notify({
            message: "Could not save data to clipboard",
            color: "negative",
          });
        });
    },
    onDismissChange() {
      localStorage.setItem("dismiss", this.dismiss ? "1" : "0");
    },
  },
};
</script>
