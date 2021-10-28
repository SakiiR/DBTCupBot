class DBTCup {
  constructor() {}
}

export const dbtCup = new DBTCup();

export default async ({ app }) => {
  app.$dbtcup = dbtCup;
};
