<template>
  <div v-if="!!cup && !!cup.cupData">
    <div ref="bracket" id="bracketsViewerExample" class="brackets-viewer"></div>
  </div>
</template>

<script>
const BRACKETS = "brackets";
const INPUT_MASK = "input-mask";
const INPUT_SUBMIT = "input-submit";
const OPPONENT1 = "opponent1";
const OPPONENT2 = "opponent2";
const RADIO_OPPONENT1 = "won-opponent1";
const RADIO_OPPONENT2 = "won-opponent2";
const RADIO_DRAW = "won-draw";
const ELEMENT_ID = "bracketsViewerExample";

export default {
  name: "CupBracket",
  props: {
    cup: Object,
  },
  mounted() {
    this.loadBracketManager();
  },
  data() {
    return {};
  },
  methods: {
    loadBracketManager() {
      let script = document.createElement("script");
      script.setAttribute(
        "src",
        "https://cdn.jsdelivr.net/npm/brackets-viewer/dist/brackets-viewer.min.js"
      );
      document.head.appendChild(script);
      script.addEventListener("load", this.loadedBracketManager);
    },
    loadedBracketManager() {
      this.renderBracket(this.cup.cupData);
    },
    renderBracket(data) {
      if (!data) {
        console.log("No data to inject for the bracket");
        return;
      }
      window.bracketsViewer.render(
        {
          stages: data.stage,
          matches: data.match,
          matchGames: data.match_game,
          participants: data.participant,
        },
        {
          selector: "#" + ELEMENT_ID,
          participantOriginPlacement: "before",
          separatedChildCountLabel: true,
          showSlotsOrigin: true,
          showLowerBracketSlotsOrigin: true,
          highlightParticipantOnHover: true,
        }
      );
    },
  },
};
</script>

<style scoped>
@import "https://cdn.jsdelivr.net/npm/brackets-viewer/dist/brackets-viewer.min.css";
</style>
