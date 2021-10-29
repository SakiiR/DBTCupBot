export default async function wrapLoading($q, prom) {
  $q.loadingBar.start();
  try {
    await prom();
  } catch (e) {
    console.error(e);
  }
  $q.loadingBar.stop();
}
