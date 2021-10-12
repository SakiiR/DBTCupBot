export function getItems() {
  return [
    {
      id: "flag",
      name: "flag",
      color: "#ffffff",
      image: "item_flag.svg",
      type: "mode_pickup",
    },
    {
      id: "macguffin",
      name: "macguffin",
      color: "#f8d206",
      image: "item_macguffin.svg",
      type: "mode_pickup",
    },
    {
      id: "diabotical",
      name: "doubledamage",
      color: "#ffff0d",
      image: "powerup_diabotical.svg",
      type: "powerup",
    },
    {
      id: "doubledamage",
      name: "doubledamage",
      color: "#891e94",
      image: "powerup_tripledamage.svg",
      type: "powerup",
    },
    {
      id: "tripledamage",
      name: "tripledamage",
      color: "#891e94",
      image: "powerup_tripledamage.svg",
      type: "powerup",
    },
    {
      id: "survival",
      name: "survival",
      color: "#42fc42",
      image: "powerup_siphonator.svg",
      type: "powerup",
    },
    {
      id: "haste",
      name: "haste",
      color: "#ff5c42",
      image: "powerup_surge.svg",
      type: "powerup",
    },
    {
      id: "vanguard",
      name: "vanguard",
      color: "#0dffff",
      image: "powerup_vanguard.svg",
      type: "powerup",
    },
    // { id: 'armort1', name: 'armort1', color: '#27b1cf', image: 'item_armort1.svg', type: 'armor' },
    {
      id: "armort2",
      name: "armort2",
      color: "#27b1cf",
      image: "item_armort2.svg",
      type: "armor",
    },
    {
      id: "armort3",
      name: "armort3",
      color: "#ddb625",
      image: "item_armort3.svg",
      type: "armor",
    },
    {
      id: "armort4",
      name: "armort4",
      color: "#e51d1d",
      image: "item_armort4.svg",
      type: "armor",
    },
    // { id: 'hpt0', name: 'hpt0', color: '#3dbc75', image: 'item_hpt0.svg', type: 'health' },
    // { id: 'hpt1', name: 'hpt1', color: '#3dbc75', image: 'item_hpt1.svg', type: 'health' },
    // { id: 'hpt2', name: 'hpt2', color: '#3dbc75', image: 'item_hpt2.svg', type: 'health' },
    {
      id: "hpt3",
      name: "hpt3",
      color: "#3dbc75",
      image: "item_hpt3.svg",
      type: "health",
    },
  ];
}

export function getModes() {
  return [
    { id: "brawl", name: "Brawl", enabled: true, image: "brawl.png" },
    { id: "ca", name: "Aim Arena", enabled: true, image: "arena.png" },
    {
      id: "coinrun",
      name: "Wee-bow Gold Rush",
      enabled: true,
      image: "instagib.png",
    },
    { id: "ctf", name: "Capture The Flag", enabled: true, image: "ctf.png" },
    { id: "duel", name: "Duel", enabled: true, image: "duel.png" },
    { id: "extinction", name: "Extinction", enabled: true, image: "tdm.png" },
    { id: "ffa", name: "Free For All", enabled: true, image: "brawl.png" },
    {
      id: "ghosthunt",
      name: "Wee-bow Instagib",
      enabled: true,
      image: "instagib.png",
    },
    {
      id: "instagib_duel",
      name: "Instagib Duel",
      enabled: true,
      image: "instagib.png",
    },
    {
      id: "macguffin",
      name: "MacGuffin",
      enabled: true,
      image: "macguffin.png",
    },
    { id: "race", name: "Time Trials", enabled: true, image: "race.png" },
    {
      id: "rocket_arena",
      name: "Rocket Arena",
      enabled: true,
      image: "arena.png",
    },
    {
      id: "shaft_arena",
      name: "Shaft Arena",
      enabled: true,
      image: "arena.png",
    },
    { id: "tdm", name: "Team Deathmatch", enabled: true, image: "tdm.png" },
    { id: "wipeout", name: "Wipeout", enabled: true, image: "wipeout.png" },
  ];
}

export function getWeapons() {
  return [
    {
      id: 0,
      index: 0,
      name: "Melee",
      color: "#888888",
      image: "weapon_melee.svg",
    },
    {
      id: 1,
      index: 1,
      name: "Machine Gun",
      color: "#cc791d",
      image: "weapon_mac.svg",
    },
    {
      id: 2,
      index: 2,
      name: "Blaster",
      color: "#7c62d1",
      image: "weapon_sb.svg",
    },
    {
      id: 3,
      index: 3,
      name: "Super Shotgun",
      color: "#9bc44d",
      image: "weapon_ss.svg",
    },
    {
      id: 4,
      index: 4,
      name: "Rocket Launcher",
      color: "#df1f2d",
      image: "weapon_rl.svg",
    },
    {
      id: 5,
      index: 5,
      name: "Shaft",
      color: "#cdb200",
      image: "weapon_shaft.svg",
    },
    {
      id: 7,
      index: 6,
      name: "PnCR",
      color: "#1fa8b6",
      image: "weapon_pncr.svg",
    },
    {
      id: 19,
      index: 8,
      name: "Void Cannon",
      color: "#ff99aa",
      image: "weapon_vc.svg",
    },
  ];
}

export function getWeeballs() {
  return [
    {
      id: 16,
      name: "smoke_weeball",
      title: "Smoke Weeball",
      color: "#5a811e",
      image: "weapon_smw.svg",
    },
    {
      id: 15,
      name: "explosive_weeball",
      title: "Explosive Weeball",
      color: "#b4513b",
      image: "weapon_bw.svg",
    },
    {
      id: 13,
      name: "implosion_weeball",
      title: "Implosion Weeball",
      color: "#be2f83",
      image: "weapon_iw.svg",
    },
    {
      id: 14,
      name: "slowfield_weeball",
      title: "Slowfield Weeball",
      color: "#28cdcd",
      image: "weapon_sw.svg",
    },
    {
      id: 12,
      name: "healing_weeball",
      title: "Healing Weeball",
      color: "#67da80",
      image: "weapon_hw.svg",
    },
  ];
}

export function getTeamColors() {
  return [
    "rgba(255,0,0,0.05)",
    "rgba(0,255,255,0.05)",
    "rgba(0,255,0,0.05)",
    "rgba(255,0,255,0.05)",
    "rgba(255,255,0,0.05)",
    "rgba(0,100,255,0.05)",
    "rgba(255,255,0,0.05)",
    "rgba(0,0,255,0.05)",
  ];
}

export function getLocations() {
  return [
    { id: "ash", city: "Ashburn", country: "United States", flag: "us" },
    { id: "bue", city: "Buenos Aires", country: "Argentina", flag: "ar" },
    { id: "chi", city: "Chicago", country: "United States", flag: "us" },
    { id: "cla", city: "Santa Clara", country: "United States", flag: "us" },
    { id: "dal", city: "Dallas", country: "United States", flag: "us" },
    { id: "dub", city: "Dubai", country: "United Arab Emirates", flag: "ae" },
    { id: "fra", city: "Frankfurt", country: "Germany", flag: "de" },
    { id: "hon", city: "Hong Kong", country: "China", flag: "hk" },
    { id: "ist", city: "Istanbul", country: "Turkey", flag: "tr" },
    { id: "joh", city: "Johannesburg", country: "South Africa", flag: "za" },
    { id: "lon", city: "London", country: "United Kingdom", flag: "gb" },
    { id: "los", city: "Los Angeles", country: "United States", flag: "us" },
    { id: "mad", city: "Madrid", country: "Spain", flag: "es" },
    { id: "mia", city: "Miami", country: "United States", flag: "us" },
    { id: "mos", city: "Moscow", country: "Russia", flag: "ru" },
    { id: "mum", city: "Mumbai", country: "India", flag: "in" },
    { id: "par", city: "Paris", country: "France", flag: "fr" },
    { id: "rot", city: "Rotterdam", country: "Netherlands", flag: "nl" },
    { id: "san", city: "Santiago", country: "Chile", flag: "cl" },
    { id: "sao", city: "São Paulo", country: "Brazil", flag: "" },
    { id: "sea", city: "Seattle", country: "United States", flag: "us" },
    { id: "sin", city: "Singapore", country: "Singapore", flag: "sg" },
    { id: "syd", city: "Sydney", country: "Australia", flag: "au" },
    { id: "tes", city: "Test", country: "Test", flag: "" },
    { id: "tok", city: "Tokyo", country: "Japan", flag: "jp" },
    { id: "war", city: "Warsaw", country: "Poland", flag: "pl" },
    { id: "yek", city: "Yekaterinburg", country: "Russia", flag: "ru" },
  ];
}
