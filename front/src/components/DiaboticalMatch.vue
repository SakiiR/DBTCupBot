<template>
  <section
    class="w-full mt-4 space-y-1"
    v-if="!!match"
    :key="match.match_id"
    :data-id="`${match.match_id}`"
  >
    <div class="flex justify-between space-x-4 text-xl font-bold">
      <div class="flex items-center space-x-2">
        <img class="h-6" :src="`img/modes/${match.modeImage}`" alt="" />
        <span>{{ match.match_mode }}</span>
        <span>/</span>
        <span :title="match.match_map_name">{{ match.match_map }}</span>
        <span>({{ prettyDuration(match.match_time) }})</span>
        <span>/</span>
        <!-- <span class="mr-2 rounded-sm fflag" :class="`fflag-${match.flag}`"></span> -->
        <span>{{ match.location }}</span>
        <span>/</span>
        <span>{{
          match.match_type === 0
            ? "custom"
            : match.match_type === 1
            ? "tournament"
            : match.match_type === 2
            ? "ranked"
            : match.match_type === 3
            ? "quickplay"
            : match.match_type === 4
            ? "warmup"
            : "unknown"
        }}</span>
      </div>
      <div class="text-gray-500">{{ match.prettyDate }}</div>
    </div>

    <div
      class="
        relative
        bg-black bg-opacity-50
        border border-white
        rounded
        border-opacity-10
      "
      v-if="match.match_mode === 'wipeout' || match.match_mode === 'ca'"
    >
      <div class="relative divide-y divide-white divide-opacity-5">
        <div class="flex items-center font-bold">
          <div class="flex-1 p-2">&nbsp;</div>
          <div class="w-24 p-2">Score</div>
          <div class="w-24 p-2">Damage</div>
          <div class="w-24 p-2">Heal</div>
          <div
            class="w-12 p-2"
            v-for="(round, index) in match.teams[0].stats.r"
            :key="index"
          >
            R{{ +index + 1 }}
          </div>
        </div>
        <div
          class="flex items-center"
          v-for="(team, index) in match.teams"
          :key="team.team_idx"
          :style="{ backgroundColor: teamColors[index] }"
        >
          <div class="flex-1 p-2 font-bold text-left">Team {{ index + 1 }}</div>
          <div class="w-24 p-2">{{ team.score }}</div>
          <div class="w-24 p-2">{{ team.stats.di }}</div>
          <div class="w-24 p-2">{{ team.stats.h }}</div>
          <div class="w-12 p-2" v-for="(round, key) in team.stats.r" :key="key">
            {{ round.s }}
          </div>
        </div>
      </div>
    </div>

    <div
      class="
        relative
        overflow-hidden
        bg-black bg-opacity-50
        border border-white
        rounded
        border-opacity-10
      "
    >
      <!-- <div
              class="absolute bg-center bg-cover -inset-8"
              :style="{filter: 'blur(5px)', opacity: 0.3, backgroundImage: `url(img/map_thumbnails/${match.match_map}.jpg)`}"
            ></div> -->

      <div class="relative divide-y divide-white divide-opacity-5">
        <div class="flex items-center p-2 font-bold text-center">
          <!-- <div class="w-16">&nbsp;</div> -->
          <div class="flex-1">&nbsp;</div>
          <div>
            <div v-if="match.match_mode === 'race'" class="w-32">Time</div>
            <div v-else class="w-16">Score</div>
          </div>
          <div v-if="match.match_mode !== 'race'" class="w-20">Damage</div>
          <div
            class="flex justify-center w-12"
            v-for="(item, index) in match.items"
            :key="index"
          >
            <img class="w-6 h-6" :src="`img/items/${item.image}`" alt="" />
          </div>
          <!-- <div class="flex justify-center w-32">Items</div> -->
          <!-- <div class="flex justify-center w-12" v-for="(weeball, index) in match.weeballs" :key="index">
                  <img class="w-6 h-6" :src="`img/items/${weeball.image}`" alt="" />
                </div> -->
          <div v-if="match.healWeeball" class="flex justify-center w-16">
            <img class="w-6 h-6" :src="`img/items/weapon_hw.svg`" alt="" />
          </div>
          <div class="flex justify-center w-16">
            <img class="w-6 h-6" :src="`img/items/weeb.svg`" alt="" />
          </div>
          <div
            class="flex justify-center w-16"
            v-for="(weapon, index) in weapons"
            :key="index"
          >
            <img class="w-6 h-6" :src="`img/items/${weapon.image}`" alt="" />
          </div>
        </div>
        <div
          class="flex items-center divide-x divide-white divide-opacity-5"
          v-for="(team, index) in match.teams"
          :key="team.team_idx"
          :style="{ backgroundColor: teamColors[index] }"
        >
          <div
            v-if="match.team_size > 1"
            class="text-3xl font-bold text-center"
          >
            <div v-if="match.match_mode === 'race'" class="w-32">
              {{ (team.score / 1000).toFixed(3) }}
            </div>
            <div v-else class="w-16">{{ team.score }}</div>
          </div>
          <div class="flex-1 divide-y divide-white divide-opacity-5">
            <div
              class="flex items-center p-2"
              v-for="client in team.clients"
              :key="client.user_id"
            >
              <div class="flex items-center flex-1">
                <div
                  class="mr-1 rounded-sm fflag"
                  :class="`fflag fflag-${!!client.country ? client.country.toUpperCase(): 'unknown'} ff-lg ff-wave`"
                ></div>
                <!-- <div
                  class="w-6 h-6 mr-1 -my-1 bg-gray-400 bg-cover rounded-sm"
                  :style="{
                    backgroundImage: `url(https://quakelife.ru/diabotical/streamers/avatars/${client.avatar}.png)`,
                  }"
                ></div> -->
                {{ client.name }}
              </div>
              <div
                class="text-center"
                :class="match.match_mode === 'race' ? 'w-32' : 'w-16'"
              >
                <div v-if="client.stats" class="space-y-1">
                  <template v-if="match.match_mode === 'race'">
                    <div v-if="client.stats.s" class="w-32" title="Time">
                      {{ (client.stats.s / 1000).toFixed(3) }}
                    </div>
                    <div
                      v-else
                      class="w-32 text-gray-500"
                      title="Not completed"
                    >
                      —
                    </div>
                  </template>
                  <template v-else>
                    <div title="Score" class="w-16">{{ client.stats.s }}</div>
                    <div
                      class="opacity-40 text-2xs"
                      v-if="match.match_mode !== 'duel'"
                      title="Kills ⋅ Deaths ⋅ Assists"
                    >
                      K ⋅ D ⋅ A
                    </div>
                    <div
                      class="opacity-40 text-2xs"
                      v-if="match.match_mode !== 'duel'"
                      title="Kills ⋅ Deaths ⋅ Assists"
                    >
                      <span
                        :class="{
                          'text-green-300': match.maxF === client.stats.f,
                          'text-red-300': match.minF === client.stats.f,
                        }"
                        >{{ client.stats.f }}</span
                      >
                      ⋅
                      <span
                        :class="{
                          'text-green-300': match.minD === client.stats.d,
                          'text-red-300': match.maxD === client.stats.d,
                        }"
                        >{{ client.stats.d }}</span
                      >
                      ⋅
                      <span
                        :class="{
                          'text-green-300': match.maxA === client.stats.a,
                          'text-red-300': match.minA === client.stats.a,
                        }"
                        >{{ client.stats.a }}</span
                      >
                    </div>
                  </template>
                </div>
                <div class="text-gray-500" v-else>?</div>
              </div>
              <div
                v-if="client.stats && match.match_mode !== 'race'"
                class="w-20 space-y-1 text-center"
              >
                <div
                  :class="{
                    'text-green-300': match.maxDI === client.stats.di,
                    'text-red-300': match.minDI === client.stats.di,
                  }"
                  title="Inflicted damage"
                >
                  {{ client.stats.di }}
                </div>
                <div
                  class="opacity-40 text-2xs"
                  :class="{
                    'text-green-300': match.minDT === client.stats.dt,
                    'text-red-300': match.maxDT === client.stats.dt,
                  }"
                >
                  Taken: {{ client.stats.dt }}
                </div>
                <div
                  class="opacity-40 text-2xs"
                  :class="{
                    'text-green-300':
                      match.maxNET === client.stats.di - client.stats.dt,
                    'text-red-300':
                      match.minNET === client.stats.di - client.stats.dt,
                  }"
                >
                  Net: {{ client.stats.di - client.stats.dt }}
                </div>
              </div>
              <div
                class="flex justify-center w-12"
                v-for="item in match.items"
                :key="item.id"
              >
                <div v-if="client.itemStats[item.id]">
                  {{ client.itemStats[item.id] }}
                </div>
                <div v-else class="text-gray-500">0</div>
              </div>
              <!-- <div class="w-32 space-y-1 text-center">
                      <div>total?</div>
                      <div class="flex space-x-1 text-2xs opacity-60">
                        <div v-for="(item, index) in match.items" :key="itemId">
                          <img class="w-2 h-2 mb-1" :src="`img/items/${item.image}`" alt="" />
                          <div v-if="client.itemStats[item.id]">{{client.itemStats[item.id]}}</div>
                          <div v-else class="text-gray-500">0</div>
                        </div>
                      </div>
                    </div> -->
              <div class="w-16" v-if="match.healWeeball">
                <div class="space-y-1">
                  <div>
                    {{
                      client.weeballStats[12]
                        ? client.weeballStats[12].shots
                        : 0
                    }}
                  </div>
                  <div
                    class="opacity-40 text-2xs"
                    :class="{
                      'text-green-300': match.maxOH === client.stats.oh,
                    }"
                  >
                    Self: {{ client.stats.oh }}
                  </div>
                  <div
                    class="opacity-40 text-2xs"
                    :class="{
                      'text-green-300': match.maxTH === client.stats.th,
                    }"
                  >
                    Team: {{ client.stats.th }}
                  </div>
                </div>
              </div>
              <div class="flex justify-center w-16">
                <div class="space-y-1">
                  <div>{{ client.weeballCount }}</div>
                  <div class="flex space-x-1 text-2xs opacity-60">
                    <div v-if="client.weeballStats[16]">
                      <img
                        class="w-2 h-2 mb-1"
                        :src="`img/items/weapon_smw.svg`"
                        alt=""
                      />
                      {{ client.weeballStats[16].shots }}
                    </div>
                    <div v-if="client.weeballStats[15]">
                      <img
                        class="w-2 h-2 mb-1"
                        :src="`img/items/weapon_bw.svg`"
                        alt=""
                      />
                      {{ client.weeballStats[15].shots }}
                    </div>
                    <div v-if="client.weeballStats[13]">
                      <img
                        class="w-2 h-2 mb-1"
                        :src="`img/items/weapon_iw.svg`"
                        alt=""
                      />
                      {{ client.weeballStats[13].shots }}
                    </div>
                    <div v-if="client.weeballStats[14]">
                      <img
                        class="w-2 h-2 mb-1"
                        :src="`img/items/weapon_sw.svg`"
                        alt=""
                      />
                      {{ client.weeballStats[14].shots }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="relative flex items-center">
                <div
                  class="flex justify-center w-16"
                  v-for="(weapon, index) in client.weaponStats"
                  :key="index"
                >
                  <div
                    v-if="weapon.shots > 0"
                    class="space-y-1"
                    :class="{ 'opacity-25': !weapon.damageDone }"
                  >
                    <div
                      :class="{
                        'text-green-300':
                          weapon.accuracy === match.maxWeaponAcc[weapon.id],
                      }"
                    >
                      {{ weapon.accuracy }}%
                    </div>
                    <div
                      class="opacity-40 text-2xs"
                      :class="{
                        'text-green-300':
                          weapon.damageDone === match.maxWeaponDmg[weapon.id],
                      }"
                    >
                      Dmg: {{ weapon.damageDone }}
                    </div>
                    <div class="opacity-40 text-2xs">
                      Frags: {{ weapon.frags }}
                    </div>
                  </div>
                  <div v-else class="text-gray-500">—</div>
                </div>
                <div
                  class="absolute left-0 flex opacity-25 -right-2 -bottom-2"
                  style="flex-wrap: unset !important"
                >
                  <div
                    class="h-1"
                    :style="{
                      backgroundColor: weapon.color,
                      width: `${weapon.usage}%`,
                    }"
                    v-for="weapon in client.weaponStats"
                    :key="weapon.id + 'stat'"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end font-mono text-xs text-gray-500">
      {{ match.match_id }}
    </div>
  </section>
</template>

<script>
import { useQuasar } from "quasar";
import {
  getItems,
  getLocations,
  getModes,
  getTeamColors,
  getWeapons,
  getWeeballs,
} from "src/utils/data";

const modes = getModes();
const weapons = getWeapons();
const weeballs = getWeeballs();
const locations = getLocations();
const items = getItems();
const teamColors = getTeamColors();

export default {
  name: "DiaboticalMatch",
  setup() {},
  props: {
    match: Object,
  },
  methods: {
    prettyDuration(time) {
      const m = `${Math.floor(time / 60)}`.padStart(2, "0");
      const s = `${time - m * 60}`.padStart(2, "0");
      return m ? `${m}:${s}` : s;
    },
  },
  data() {
    return {
      items,
      weeballs,
      weapons,
      modes,
      locations,
      teamColors,
    };
  },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Open+Sans&display=swap");

* {
  font-family: "Open Sans", sans-serif;
  font-size: 12px;
}
div {
  color: white;
}
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";

.flex .justify-center {
  text-align: center;
}

.w-16 {
  width: 6rem;
}
</style>
