import APIService from "src/services/api";
import types from "./types";

export function fetchMe({ commit }) {
  commit(types.FETCHME_REQUEST);

  APIService.me()
    .then((data) => commit(types.FETCHME_SUCCESS, data))
    .catch(() => commit(types.FETCHME_FAILURE));
}
