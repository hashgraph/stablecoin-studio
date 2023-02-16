import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import {
  AddFixedFeeRequest,
  AddFractionalFeeRequest,
  RequestCustomFee,
  isRequestFixedFee,
  isRequestFractionalFee,
  Fees,
  UpdateCustomFeesRequest,
} from 'hedera-stable-coin-sdk';

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

  public getFormatedFees(listOfFees: RequestCustomFee[]): any[] {
    const FormatedFees = [];

    listOfFees.forEach((fee) => {
      if (isRequestFixedFee(fee)) {
        FormatedFees.push({
          Fee_Type: 'Fixed',
          Collector_Id: fee.collectorId,
          All_Collectors_Exempt: fee.collectorsExempt,
          Amount: fee.amount,
          Token:
            fee.tokenIdCollected == '0.0.0' ? 'HBAR' : fee.tokenIdCollected,
        });
      } else if (isRequestFractionalFee(fee)) {
        FormatedFees.push({
          Fee_Type: 'Fractional',
          Collector_Id: fee.collectorId,
          All_Collectors_Exempt: fee.collectorsExempt,
          Percentage: fee.percentage,
          Numerator: fee.amountNumerator,
          Denominator: fee.amountDenominator,
          Min: fee.min,
          Max: fee.max == '0' ? 'Unlimited' : fee.max,
          Fees_Paid_By: fee.net ? 'Sender' : 'Receiver',
        });
      }
    });

    return FormatedFees;
  }
}
