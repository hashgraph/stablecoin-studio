import { IWipeKey } from './IWipeKey';
import { IFreezeKey } from './IFreezeKey';
import { IKYCKey } from './IKYCKey';
import { IAdminKey } from './IAdminKey';
import { ICustomFees } from './ICustomFees';

export default interface IStableCoinDetail {
	token_id?: string;
	name?: string;
	symbol?: string;
	decimals?: string;
	total_supply?: string;
	max_supply?: string;
	custom_fees?: ICustomFees;
	treasury_account_id?: string;
	expiry_timestamp?: string;
	memo?: string;
	pause_status?: string;
	freeze_default?: boolean;
	// kycStatus: string;
	deleted?: boolean;
	admin_key?: IAdminKey;
	kyc_key?: IKYCKey;
	freeze_key?: IFreezeKey;
	wipe_key?: IWipeKey;
	supply_key?: string;
	pause_key?: string;
}
