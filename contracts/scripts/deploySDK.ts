
import {deployContracts, deployContractsWithSDK } from "./utilsToSDK";

async function  main () {
  deployContractsWithSDK("TOKEN","TK",2,0,100_000,"mytoken",false);
}

main();
