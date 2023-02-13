import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import {
  AddFixedFeeRequest,
  AddFractionalFeeRequest,
  CustomFee,
  FixedFee,
  FractionalFee,
  Fees,
  UpdateCustomFeesRequest,
} from '@hashgraph-dev/stablecoin-npm-sdk';

/**
 * Create Role Stable Coin Service
 */
export default class FeeStableCoinService extends Service {
  constructor() {
    super('Fee Stable Coin');
  }

  public async addFixedFee(req: AddFixedFeeRequest): Promise<void> {
    await utilsService.showSpinner(Fees.addFixedFee(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.customFeeCreated') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  public async addFractionalFee(req: AddFractionalFeeRequest): Promise<void> {
    await utilsService.showSpinner(Fees.addFractionalFee(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.customFeeCreated') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  public async updateFees(req: UpdateCustomFeesRequest): Promise<void> {
    await utilsService.showSpinner(Fees.updateCustomFees(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.customFeesRemoved') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  public getFormatedFees(listOfFees: CustomFee[]): any[] {
    const FormatedFees = [];

    listOfFees.forEach((fee) => {
      if (fee instanceof FixedFee) {
        FormatedFees.push({
          Fee_Type: 'Fixed',
          Collector_Id: fee.collectorId.toString(),
          All_Collectors_Exempt: fee.collectorsExempt,
          Amount: fee.amount.toString(),
          Token: fee.tokenId.isNull() ? 'HBAR' : fee.tokenId.toString(),
        });
      } else if (fee instanceof FractionalFee) {
        FormatedFees.push({
          Fee_Type: 'Fractional',
          Collector_Id: fee.collectorId.toString(),
          All_Collectors_Exempt: fee.collectorsExempt,
          Numerator: fee.amountNumerator.toString(),
          Denominator: fee.amountDenominator.toString(),
          Min: fee.min.toString(),
          Max: fee.max.isZero() ? 'Unlimited' : fee.max.toString(),
          Fees_Paid_By: fee.net ? 'Sender' : 'Receiver',
        });
      }
    });

    return FormatedFees;
  }

  /*public displayFees(listOfFees: CustomFee[]) {
    listOfFees.forEach((fee) => {
      if (fee instanceof FixedFee) {
        console.log({
          Fee_Type: 'Fixed',
          Collector_Id: fee.collectorId.toString(),
          All_Collectors_Exempt: fee.collectorsExempt,
          Amount: fee.amount.toString(),
          Token: fee.tokenId.isNull() ? 'HBAR' : fee.tokenId.toString(),
        });
      } else if (fee instanceof FractionalFee) {
        console.log({
          Fee_Type: 'Fractional',
          Collector_Id: fee.collectorId.toString(),
          All_Collectors_Exempt: fee.collectorsExempt,
          Numerator: fee.amountNumerator.toString(),
          Denominator: fee.amountDenominator.toString(),
          Min: fee.min.toString(),
          Max: fee.max.toString(),
          Fees_Paid_By: fee.net ? 'Sender' : 'Receiver',
        });
      }
    });
  }*/
}
