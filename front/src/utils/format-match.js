import {
  getWeeballs,
  getWeapons,
  getItems,
  getLocations,
  getModes,
} from "./data";

const weeballs = getWeeballs();
const weapons = getWeapons();
const items = getItems();
const locations = getLocations();
const modes = getModes();

function formatClientStats(client) {
  client.weeballStats = {};
  client.itemStats = {};
  client.weeballCount = 0;
  if (!client.stats) {
    console.warn("Empty stats!");
  }
  if (client.stats && client.stats.it) {
    for (const it of client.stats.it) {
      client.itemStats[it.i] = it.c;
    }
  }
  for (const weeball of weeballs) {
    const item =
      client.stats &&
      client.stats.w &&
      client.stats.w.find((w) => w.i === weeball.id);
    if (item) {
      if (weeball.id !== 12) {
        client.weeballCount += item.sf;
      }
      client.weeballStats[weeball.id] = {
        id: weeball.id,
        shots: +item.sf,
        hits: +item.sh,
        frags: +item.f,
        deaths: +item.df,
        damageDone: +item.di,
        damageTaken: +item.dt,
        accuracy: +item.sf ? Math.round((100 * item.sh) / item.sf) : 0,
      };
    } else {
      client.weeballStats[weeball.id] = null;
    }
  }

  client.weaponStats = weapons.map((weapon) => {
    const item =
      client.stats &&
      client.stats.w &&
      client.stats.w.find((w) => w.i === weapon.id);
    if (!item) {
      return {
        id: weapon.id,
        shots: 0,
        hits: 0,
        frags: 0,
        deaths: 0,
        damageDone: 0,
        damageTaken: 0,
        accuracy: 0,
        kd: 0,
        usage: 0,
      };
    }
    return {
      id: weapon.id,
      color: weapon.color,
      shots: +item.sf,
      hits: +item.sh,
      frags: +item.f,
      deaths: +item.df,
      damageDone: +item.di,
      damageTaken: +item.dt,
      accuracy: +item.sf ? Math.round((100 * item.sh) / item.sf) : 0,
      kd: +item.df
        ? (Math.round((100 * item.f) / item.df) / 100).toFixed(2)
        : item.f,
      usage: client.stats.di
        ? Math.round((100 * item.di) / client.stats.di)
        : 0,
    };
  });
}

function compareStats(stats1, stats2) {
  return stats1.s && !stats2.s
    ? -1
    : !stats1.s && stats2.s
    ? 1
    : stats1.s > stats2.s
    ? 1
    : stats1.s < stats2.s
    ? -1
    : stats1.di > stats2.di
    ? -1
    : stats1.di < stats2.di
    ? 1
    : 0;
}

export default function formatMatch(match) {
  const newEvent = {
    maxDuration: 0,
    rounds: 0,
    locations: {},
    clients: {},
    weapons: {},
  };
  match.rounds = 0;
  match.maxWeaponAcc = {};
  match.maxWeaponDmg = {};
  match.minWeaponDmg = {};
  // match.teams.sort((t1, t2) => (t1.score > t2.score ? -1 : 1))
  match.prettyDate = new Date(match.create_ts).toLocaleString();
  newEvent.maxDuration =
    newEvent.maxDuration && match.match_time < newEvent.maxDuration
      ? newEvent.maxDuration
      : match.match_time;
  newEvent.locations[match.location] =
    (newEvent.locations[match.location] || 0) + 1;
  match.clients.forEach(formatClientStats);
  match.items = items.filter((it) =>
    match.clients.some((client) => client.itemStats[it.id])
  );
  match.weeballs = weeballs.filter((weeball) =>
    match.clients.some((client) => client.weeballStats[weeball.id])
  );
  match.healWeeball = match.clients.some((client) => client.weeballStats[12]);
  match.flag = (
    locations.find((location) => location.id === match.location) || {}
  ).flag;
  match.modeImage = (
    modes.find((mode) => mode.id === match.match_mode) || {}
  ).image;
  for (const team of match.teams) {
    team.clients = match.clients.filter((c) => c.team_idx === team.team_idx);
    const modifier = match.match_mode === "race" ? 1 : -1;
    team.clients.sort((c1, c2) => modifier * compareStats(c1.stats, c2.stats));
    team.stats.di = team.clients.reduce(
      (sum, client) => sum + ((client.stats && client.stats.di) || 0),
      0
    );
    team.stats.h = team.clients.reduce(
      (sum, client) =>
        sum + ((client.stats && client.stats.oh + client.stats.th) || 0),
      0
    );
    for (const r in team.stats.r) {
      match.rounds++;
      newEvent.rounds++;
    }
    for (const client of team.clients) {
      const clientG = newEvent.clients[client.user_id] || { ...client };
      client.rounds = match.rounds;
      clientG.rounds = (clientG.rounds || 0) + match.rounds;
      if (client.stats) {
        newEvent.di = (newEvent.di || 0) + client.stats.di;
        newEvent.dt = (newEvent.dt || 0) + client.stats.dt;
        newEvent.oh = (newEvent.oh || 0) + client.stats.oh;
        newEvent.oh = (newEvent.oh || 0) + client.stats.th;
        clientG.di = (clientG.di || 0) + client.stats.di;
        clientG.dt = (clientG.dt || 0) + client.stats.dt;
        clientG.oh = (clientG.oh || 0) + client.stats.oh;
        clientG.th = (clientG.th || 0) + client.stats.th;
        match.maxDI =
          match.maxDI && client.stats.di < match.maxDI
            ? match.maxDI
            : client.stats.di;
        match.minDI =
          match.minDI && client.stats.di > match.minDI
            ? match.minDI
            : client.stats.di;
        match.maxDT =
          match.maxDT && client.stats.dt < match.maxDT
            ? match.maxDT
            : client.stats.dt;
        match.minDT =
          match.minDT && client.stats.dt > match.minDT
            ? match.minDT
            : client.stats.dt;
        match.maxNET =
          match.maxNET && client.stats.di - client.stats.dt < match.maxNET
            ? match.maxNET
            : client.stats.di - client.stats.dt;
        match.minNET =
          match.minNET && client.stats.di - client.stats.dt > match.minNET
            ? match.minNET
            : client.stats.di - client.stats.dt;
        match.maxWeebals =
          match.maxWeebals && client.weeballCount < match.maxWeebals
            ? match.maxWeebals
            : client.weeballCount;
        match.minWeebals =
          match.minWeebals && client.weeballCount > match.minWeebals
            ? match.minWeebals
            : client.weeballCount;
        match.maxOH =
          match.maxOH && client.stats.oh < match.maxOH
            ? match.maxOH
            : client.stats.oh;
        match.maxTH =
          match.maxTH && client.stats.th < match.maxTH
            ? match.maxTH
            : client.stats.th;
        match.maxF =
          match.maxF && client.stats.f < match.maxF
            ? match.maxF
            : client.stats.f;
        match.minF =
          match.minF && client.stats.f > match.minF
            ? match.minF
            : client.stats.f;
        match.maxD =
          match.maxD && client.stats.d < match.maxD
            ? match.maxD
            : client.stats.d;
        match.minD =
          match.minD && client.stats.d > match.minD
            ? match.minD
            : client.stats.d;
        match.maxA =
          match.maxA && client.stats.a < match.maxA
            ? match.maxA
            : client.stats.a;
        match.minA =
          match.minA && client.stats.a > match.minA
            ? match.minA
            : client.stats.a;
      }
      for (const weapon of client.weaponStats || []) {
        if (weapon) {
          // const ws = newEvent.weapons[weapon.id] || {}
          // ws.shots = (ws.shots || 0) + weapon.shots
          // ws.hits = weapon.hits
          // ws.frags = weapon.frags
          // ws.deaths = weapon.deaths
          // ws.damageDone = weapon.damageDone
          // ws.damageTaken = weapon.damageTaken
          // ws.accuracy = newEvent.shots ? Math.round((100 * newEvent.hits) / newEvent.shots) : 0
          // ws.kd = newEvent.deaths ? Math.round(newEvent.frags / newEvent.deaths) : newEvent.frags
          // ws.usage = newEvent.damageDone ? Math.round((100 * weeball.damageDone) / newEvent.damageDone) : 0
          // newEvent.weapons[weapon.id] = ws
          match.maxWeaponAcc[weapon.id] =
            match.maxWeaponAcc[weapon.id] &&
            weapon.accuracy < match.maxWeaponAcc[weapon.id]
              ? match.maxWeaponAcc[weapon.id]
              : weapon.accuracy;
          match.maxWeaponDmg[weapon.id] =
            match.maxWeaponDmg[weapon.id] &&
            weapon.damageDone < match.maxWeaponDmg[weapon.id]
              ? match.maxWeaponDmg[weapon.id]
              : weapon.damageDone;
          match.minWeaponDmg[weapon.id] =
            match.minWeaponDmg[weapon.id] &&
            weapon.damageDone > match.minWeaponDmg[weapon.id]
              ? match.minWeaponDmg[weapon.id]
              : weapon.damageDone;
        }
      }

      newEvent.clients = match.rounds;
    }
  }
  return match;
}
