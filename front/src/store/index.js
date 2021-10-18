import Vuex from "vuex";
import general from "./general";

function useStore(/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
      general,
    },
    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEBUGGING,
  });
  return Store;
}

var store = useStore();

export default store;
