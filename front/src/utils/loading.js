export default async function wrapLoading($q, prom) {
  $q.loadingBar.start();
  try {
    await prom();
  } catch (e) {
    console.error(e);
    const { message } = e;
    $q.notify({
      message,
      type: "negative",
    });
  }
  $q.loadingBar.stop();
}
