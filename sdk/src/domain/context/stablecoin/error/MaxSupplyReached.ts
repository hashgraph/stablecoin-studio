import BaseError, { ErrorCode } from "../../../../core/error/BaseError.js";


export class MaxSupplyReached extends BaseError {
    constructor(maxSupply: string) {
        super(ErrorCode.MaxSupplyReached, `max supply ${maxSupply} reached`);        
    }
}