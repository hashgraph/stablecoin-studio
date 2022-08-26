
import {deployContracts} from "./utilsToSDK";

async function  main () {
  deployContracts("TOKEN","TK",2,0,100000,"mytoken",false);
}

main();
