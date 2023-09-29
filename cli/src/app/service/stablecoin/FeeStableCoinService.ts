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
} from '@hashgraph/stablecoin-npm-sdk';

const fixedTypeLabel = 'Fixed';
const fractionalTypeLabel = 'Fractional';
const HBARLabel = 'HBAR';
const separator = ' | ';
const unlimitedLabel = 'unlimited';
const senderLabel = 'Sender';
const receiverLabel = 'Receiver';
const minLabel = 'Min: ';
const maxLabel = 'Max: ';

/**
 * Create Role Stablecoin Service
 */
export default class FeeStableCoinService extends Service {
  constructor() {
    super('Fee Stablecoin');
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
          fixedTypeLabel,
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
          fractionalTypeLabel,
          separator,
          fee.percentage,
          separator,
          minLabel,
          fee.min,
          separator,
          maxLabel,
          fee.max == '0' ? unlimitedLabel : fee.max,
          separator,
          fee.collectorId,
          separator,
          fee.collectorsExempt.toString(),
          separator,
          fee.net ? senderLabel : receiverLabel,
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
