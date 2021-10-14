export default class APIService {
  static async me() {
    const ts = new Date().getTime();
    const response = await fetch(`/api/me?${ts}`);
    const json = await response.json();

    return json;
  }

  static async cups() {
    const ts = new Date().getTime();
    const response = await fetch(`/api/cups?${ts}`);
    const json = await response.json();

    return json;
  }

  static async cup(id) {
    const ts = new Date().getTime();
    const response = await fetch(`/api/cup/${id}?${ts}`);
    const json = await response.json();

    return json;
  }
}
