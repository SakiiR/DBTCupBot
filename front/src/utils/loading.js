export default async function wrapLoading($q, prom) {
  let ret = null;
  $q.loadingBar.start();
  try {
    ret = await prom();
  } catch (e) {
    console.error(e);
    const { message } = e;
    $q.notify({
      message,
      type: "negative",
    });
  }
  $q.loadingBar.stop();
  return ret;
}
