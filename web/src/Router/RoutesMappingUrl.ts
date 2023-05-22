import { NamedRoutes } from './NamedRoutes';

/**
 * Mapping from name to the url.
 * */
export const RoutesMappingUrl: Record<NamedRoutes, string> = {
	[NamedRoutes.Balance]: '/operations/balance',
	[NamedRoutes.Burn]: '/operations/burn',
	[NamedRoutes.CashIn]: '/operations/cash-in',
	[NamedRoutes.Dashboard]: '/dashboard',
	[NamedRoutes.EditRole]: '/roles/edit-role',
	[NamedRoutes.GiveRole]: '/roles/give-role',
	[NamedRoutes.GetAccountsWithRole]: '/roles/get-accounts-with-role',
	[NamedRoutes.RefreshRoles]: '/roles/refresh-roles',
	[NamedRoutes.Login]: '/login',
	[NamedRoutes.Operations]: '/operations',
	[NamedRoutes.RescueTokens]: '/operations/rescue-tokens',
	[NamedRoutes.RescueHBAR]: '/operations/rescue-HBAR',
	[NamedRoutes.RevokeRole]: '/roles/revoke-role',
	[NamedRoutes.Roles]: '/roles',
	[NamedRoutes.StableCoinCreation]: '/stable-coin/creation',
	[NamedRoutes.StableCoinDetails]: '/stable-coin/details',
	[NamedRoutes.StableCoinNotSelected]: '/stable-coin/not-selected',
	[NamedRoutes.Wipe]: '/operations/wipe',
	[NamedRoutes.ImportedToken]: '/stable-coin/imported',
	[NamedRoutes.DangerZone]: '/operations/danger-zone',
	[NamedRoutes.Freeze]: '/operations/freeze',
	[NamedRoutes.Unfreeze]: '/operations/unfreeze',
	[NamedRoutes.ProofOfReserve]: '/proofOfReserve',
	[NamedRoutes.GrantKyc]: '/operations/grant-kyc',
	[NamedRoutes.RevokeKyc]: '/operations/revoke-kyc',
	[NamedRoutes.CheckKyc]: '/operations/check-kyc',
	[NamedRoutes.FeesManagement]: '/feesManagement',
	[NamedRoutes.Settings]: '/settings',
};
