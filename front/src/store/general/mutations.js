import types from "./types";

const mutations = {
  [types.FETCHME_SUCCESS](state, data) {
    state.user = { ...data };
  },
  [types.FETCHME_REQUEST]() {},
  [types.FETCHME_FAILURE](state) {
    state.user = null;
  },
};

export default mutations;
