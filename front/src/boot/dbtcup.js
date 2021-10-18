class DBTCup {
  constructor() {}

  async fetchMe() {
    console.log("fetchMe");
  }
}

export const dbtCup = new DBTCup();

export default async ({ app }) => {
  app.$dbtcup = dbtCup;
};
