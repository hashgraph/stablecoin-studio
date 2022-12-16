import { QueryResponse } from "../../../../core/query/QueryResponse.js";
import PublicKey from "../../../../domain/context/account/PublicKey.js";

export default interface AccountViewModel extends QueryResponse {
    id?:string,
    accountEvmAddress?:string,
    publicKey?:PublicKey,
    alias?:string
}
 
  