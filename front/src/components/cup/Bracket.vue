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

.brackets-viewer {
  /* Colors */
  --primary-background: rgb(38, 38, 38);
  --secondary-background: #303030;
  --match-background: var(--primary-background);
  --font-color: #d9d9d9;
  --win-color: #50b649;
  --loss-color: #e61a1a;
  --label-color: grey;
  --hint-color: #a7a7a7;
  --connector-color: #9e9e9e;
  --border-color: #d9d9d9;
  --border-hover-color: #b6b5b5;

  /* Sizes */
  --text-size: 12px;
  --round-margin: 40px;
  --match-width: 150px;
  --match-horizontal-padding: 8px;
  --match-vertical-padding: 6px;
  --connector-border-width: 2px;
  --match-border-width: 1px;
  --match-border-radius: 0.3em;
}
</style>
