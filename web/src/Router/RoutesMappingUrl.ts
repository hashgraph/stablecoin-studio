import { NamedRoutes } from './NamedRoutes';

/**
 * Mapping from name to the url.
 * */
export const RoutesMappingUrl: Record<NamedRoutes, string> = {
	[NamedRoutes.CashIn]: '/operations/cash-in',
	[NamedRoutes.Dashboard]: '/dashboard',
	[NamedRoutes.Details]: '/details',
	[NamedRoutes.EditRole]: '/roles/edit-role',
	[NamedRoutes.GiveRole]: '/roles/give-role',
	[NamedRoutes.Login]: '/login',
	[NamedRoutes.Operations]: '/operations',
	[NamedRoutes.RevokeRole]: '/roles/revoke-role',
	[NamedRoutes.Roles]: '/roles',
	[NamedRoutes.StableCoinCreation]: '/stable-coin-creation',
	[NamedRoutes.StableCoinNotSelected]: '/stable-coin-not-selected',
};
