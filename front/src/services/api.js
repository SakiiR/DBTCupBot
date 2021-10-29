import SessionManager from "src/utils/session";

function getHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: SessionManager.get(),
  };
}

export default class APIService {
  static async me() {
    const ts = new Date().getTime();
    const response = await fetch(`/api/me?${ts}`, {
      headers: { ...getHeaders() },
    });
    const json = await response.json();

    return json;
  }

  static async cups() {
    const ts = new Date().getTime();
    const response = await fetch(`/api/cups?${ts}`, {
      headers: { ...getHeaders() },
    });
    const json = await response.json();

    return json;
  }

  static async cup(id) {
    const ts = new Date().getTime();
    const response = await fetch(`/api/cup/${id}?${ts}`, {
      headers: { ...getHeaders() },
    });

    const json = await response.json();

    if (json.name && json.name.includes("Error")) {
      console.error(json.message);
      return null;
    }

    return json;
  }

  static async user(id) {
    const ts = new Date().getTime();
    const response = await fetch(`/api/user/${id}?${ts}`, {
      headers: { ...getHeaders() },
    });
    const json = await response.json();

    return json;
  }

  static async getUserLastMatches(epicId) {
    const url = `https://api.diabotical.com/api/v0/diabotical/users/${epicId}/matches`;

    const response = await fetch(url, {
      headers: { ...getHeaders() },
    });
    const json = await response.json();

    return json.matches;
  }

  static async listUsers(id) {
    const ts = new Date().getTime();
    const response = await fetch(`/api/users?${ts}`, {
      headers: { ...getHeaders() },
    });
    const json = await response.json();

    return json;
  }

  static async toggleAdmin(userId) {
    const ts = new Date().getTime();

    const url = `/api/users/toggle-admin?${ts}`;
    const method = "PUT";
    const body = JSON.stringify({
      id: userId,
    });

    const response = await fetch(url, {
      method,
      headers: { ...getHeaders() },
      body,
    });

    return await response.json();
  }

  static async startCup(cupId) {
    const ts = new Date().getTime();

    const url = `/api/cup/start?${ts}`;
    const method = "POST";
    const body = JSON.stringify({
      id: cupId,
    });

    const response = await fetch(url, {
      method,
      headers: { ...getHeaders() },
      body,
    });

    const json = await response.json();

    return json;
  }

  static async joinCup(cupId) {
    const ts = new Date().getTime();

    const url = `/api/cup/join?${ts}`;
    const method = "POST";
    const body = JSON.stringify({
      id: cupId,
    });

    const response = await fetch(url, {
      method,
      headers: { ...getHeaders() },
      body,
    });

    const json = await response.json();

    return json;
  }

  static async linkEpic(epicId) {
    const ts = new Date().getTime();

    const url = `/api/link-epic?${ts}`;
    const method = "POST";
    const body = JSON.stringify({
      id: epicId,
    });

    const response = await fetch(url, {
      method,
      headers: { ...getHeaders() },
      body,
    });

    const json = await response.json();

    return json;
  }

  static async leaveCup(cupId) {
    const ts = new Date().getTime();

    const url = `/api/cup/leave?${ts}`;
    const method = "POST";
    const body = JSON.stringify({
      id: cupId,
    });

    const response = await fetch(url, {
      method,
      headers: { ...getHeaders() },
      body,
    });

    const json = await response.json();

    return json;
  }

  static async refreshRating() {
    const ts = new Date().getTime();

    const url = `/api/users/refresh-rating?${ts}`;
    const method = "PUT";

    const response = await fetch(url, {
      method,
      headers: { ...getHeaders() },
    });

    const json = await response.json();

    return json;
  }

  /**
   * Adjust the seeding of a cup
   *
   * @param {*} cupId The cup identifier
   * @param {*} player The player to be adjusted
   * @param {*} direction The direction the player should be moved to
   * @returns the new seeding
   */
  static async adjustSeeding(cupId, player, direction) {
    const ts = new Date().getTime();

    const url = `/api/cup/${cupId}/seeding?${ts}`;
    const method = "PUT";
    const body = JSON.stringify({
      player,
      direction,
    });

    const response = await fetch(url, {
      method,
      headers: { ...getHeaders() },
      body,
    });

    const json = await response.json();

    return json;
  }

  static async addMap(cupId, name) {
    const ts = new Date().getTime();

    const url = `/api/cup/${cupId}/addMap?${ts}`;
    const method = "POST";
    const body = JSON.stringify({
      name,
    });

    const response = await fetch(url, {
      method,
      headers: { ...getHeaders() },
      body,
    });

    const json = await response.json();

    return json;
  }

  static async removeMap(cupId, name) {
    const ts = new Date().getTime();

    const url = `/api/cup/${cupId}/removeMap?${ts}`;
    const method = "POST";
    const body = JSON.stringify({
      name,
    });

    const response = await fetch(url, {
      method,
      headers: { ...getHeaders() },
      body,
    });

    const json = await response.json();

    return json;
  }
}
