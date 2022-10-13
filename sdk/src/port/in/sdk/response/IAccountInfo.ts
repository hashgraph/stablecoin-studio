import { PublicKey } from "../sdk.js";

export default interface IAccountInfo {
    account?:string,
    accountEvmAddress?:string,
    publicKey?:PublicKey,
}
 
  