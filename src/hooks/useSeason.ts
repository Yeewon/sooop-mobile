import {getCurrentSeason, SEASON_CONFIG} from '../shared/constants';

export function useSeason() {
  const season = getCurrentSeason();
  const config = SEASON_CONFIG[season];
  return {season, config};
}
