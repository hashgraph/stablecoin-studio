
import {deployContracts} from "./utilsToSDK";

async function  main () {
  deployContracts("TOKEN","TK",2,0,100_000,"mytoken",false);
}

main();
