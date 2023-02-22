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
const FixedTypeLabel = 'Fixed';
const FractionalTypeLabel = 'Fractional';
const HBARLabel = 'HBAR';
const separator = ' | ';
const unlimited = 'unlimited';
const sender = 'Sender';
const receiver = 'Receiver';

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

  public getSerializedFees(listOfFees: RequestCustomFee[]): string[] {
    const SerializedFees: string[] = [];

    listOfFees.forEach((fee) => {
      let feeMessage = separator;

      if (isRequestFixedFee(fee))
        feeMessage = feeMessage.concat(
          FixedTypeLabel,
          separator,
          fee.tokenIdCollected == '0.0.0' ? HBARLabel : fee.tokenIdCollected,
          separator,
          fee.amount,
          separator,
          fee.collectorId,
          separator,
          fee.collectorsExempt.toString(),
        );
      else if (isRequestFractionalFee(fee))
        feeMessage = feeMessage.concat(
          FractionalTypeLabel,
          separator,
          fee.percentage,
          separator,
          fee.min,
          separator,
          fee.max == '0' ? unlimited : fee.max,
          separator,
          fee.collectorId,
          separator,
          fee.collectorsExempt.toString(),
          separator,
          fee.net ? sender : receiver,
        );

      SerializedFees.push(feeMessage);
    });

    return SerializedFees;
  }

  public getRemainingFees(
    originalFees: RequestCustomFee[],
    serializedOriginalFees: string[],
    serializedRemovedFees: string[],
  ): RequestCustomFee[] {
    const remainingFees = originalFees;

    serializedRemovedFees.forEach((feeToRemove) => {
      const index = serializedOriginalFees.indexOf(feeToRemove);
      serializedOriginalFees.splice(index, 1);
      remainingFees.splice(index, 1);
    });

    return remainingFees;
  }
}
