import { PublicKey } from "../sdk.js";

export default interface AccountInfo {
    account?:string,
    accountEvmAddress?:string,
    publicKey?:PublicKey,
}
 
  