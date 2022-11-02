import BaseError, { ErrorCode } from "../../../../core/error/BaseError.js";


export class InitSupplyLargerThanMaxSupply extends BaseError {
    constructor(initSupply: string, maxSupply: string) {
        super(ErrorCode.InvalidRange, `Init supply ${initSupply} is bigger than max supply ${maxSupply}`);        
    }
}