import { createSelector } from "reselect";
import {State} from "../../../reducers";

const getPicturesLike = ((state: State) => state.like);

export const getPictureLikes = createSelector([getPicturesLike], s => s.likes);
export const getLoadLike = createSelector([getPicturesLike], s => s.load);
