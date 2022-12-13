import { StableCoinRole } from '../../../domain/context/stablecoin/StableCoinRole.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class HasRoleRequest
	extends ValidatedRequest<HasRoleRequest>
{
	targetId: string;
	tokenId: string;
	role: StableCoinRole | undefined;

	constructor({
		targetId,
		tokenId,
		role
	}: {
		targetId: string;
		tokenId: string;
		role: StableCoinRole | undefined;
	}) {
		super({
			targetId: Validation.checkHederaIdFormat(),
			tokenId: Validation.checkHederaIdFormat(),
			role: Validation.checkRole()	
		});
		this.tokenId = tokenId;
		this.targetId = targetId;
		this.role = role;
	}
}
