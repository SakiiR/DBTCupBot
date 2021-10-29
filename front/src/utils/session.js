export default class SessionManager {
  static key = "dbt-cup-token";
  static debug = false;

  static get() {
    const token = sessionStorage.getItem(this.key);
    this.debug && console.log(`SessionManager.get(): ${token}`);
    return token;
  }

  static clear() {
    this.debug && console.log(`SessionManager.clear()`);
    return sessionStorage.removeItem(this.key);
  }

  static set(value) {
    this.debug && console.log(`SessionManager.set('${value}')`);
    return sessionStorage.setItem(this.key, value);
  }
}
