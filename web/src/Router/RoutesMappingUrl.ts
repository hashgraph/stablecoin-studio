import { NamedRoutes } from './NamedRoutes';

/**
 * Mapping from name to the url.
 * */
export const RoutesMappingUrl: Record<NamedRoutes, string> = {
	[NamedRoutes.Dashboard]: '/dashboard',
	[NamedRoutes.Login]: '/login',
	[NamedRoutes.Operations]: '/operations',
	[NamedRoutes.Roles]: '/roles',
	[NamedRoutes.Details]: '/details',
	[NamedRoutes.CashIn]: '/cash-in',
	[NamedRoutes.StableCoinNotSelected]: '/stable-coin-not-selected',
};
