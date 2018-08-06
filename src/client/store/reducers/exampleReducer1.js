import _ from 'lodash';

const defaultState = {
  favorites: [],
};

const exampleReducer1 = (state = _.cloneDeep(defaultState), action) => {
  switch (action.type) {
  case 'UPDATE_ENDPOINTS':
    return Object.assign({}, state, {
      start: action.start,
      end: action.end,
    });

  default:
    return state;
  }
};

export default exampleReducer1;