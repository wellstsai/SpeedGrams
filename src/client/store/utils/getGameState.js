export const getGameState = (store) => {
  return store.getState();
};

export const getApp = (store) => {
  return store.getState().app;
};

export const getResources = (store) => {
  return store.getState.resources;
};
