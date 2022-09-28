import { Stack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { FieldValues } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import BaseContainer from '../../components/BaseContainer';
import BasicDetails from './BasicDetails';
import type { Step } from '../../components/Stepper';
import Stepper from '../../components/Stepper';
import { NamedRoutes } from '../../Router/NamedRoutes';
import { RouterManager } from '../../Router/RouterManager';
import OptionalDetails from './OptionalDetails';
import ManagementPermissions from './ManagementPermissions';
import Review from './Review';
import { useEffect, useState } from 'react';
import { OTHER_KEY_VALUE } from './components/KeySelector';

export const isInvalidForm = (formValues: FieldValues, inputs: string[]) => {
	if (Object.keys(formValues).length === 0) return true;

	let isInvalid = false;

	Object.keys(formValues).forEach((key) => {
		if (inputs.includes(key) && (formValues[key] === undefined || formValues[key] === '')) {
			isInvalid = true;
		}
	});

	return isInvalid;
};

const StableCoinCreation = () => {
	const navigate = useNavigate();
	const { t } = useTranslation('stableCoinCreation');

	const form = useForm({ mode: 'onChange', defaultValues: {} });
	const { control, getValues, watch } = form;

	const [isValidForm, setIsValidForm] = useState(false);
	const [currentStep, setCurrentStep] = useState(0);

	useEffect(() => {
		if (getValues()) {
			isValidStep();
		}
	}, [getValues(), currentStep]);

	const steps: Step[] = [
		{
			number: '01',
			title: t('tabs.basicDetails'),
			children: <BasicDetails control={control} />,
		},
		{
			number: '02',
			title: t('tabs.optionalDetails'),
			children: <OptionalDetails control={control} />,
		},
		{
			number: '03',
			title: t('tabs.managementPermissions'),
			children: <ManagementPermissions control={control} />,
		},
		{
			number: '04',
			title: t('tabs.review'),
			children: <Review form={form} />,
		},
	];

	const isValidStep = () => {
		// @ts-ignore
		let fieldsStep = [];

		if (currentStep === 0) {
			// @ts-ignore
			fieldsStep = watch(['name', 'symbol']);
		}

		if (currentStep === 1) {
			// @ts-ignore
			fieldsStep = watch(['initialSupply', 'totalSupply', 'decimals', 'expirationDate']);
		}

		if (currentStep === 2) {
			// @ts-ignore
			const managePermissions = watch('managementPermissions');

			if (!managePermissions) {
				const keys = [
					'adminKey',
					'supplyKey',
					'rescueKey',
					'wipeKey',
					'freezeKey',
					'feeScheduleKey',
				];

				// @ts-ignore
				fieldsStep = watch(keys);
				fieldsStep.forEach((item, index) => {
					if (item?.value === OTHER_KEY_VALUE) {
						// @ts-ignore
						fieldsStep[index] = watch(keys[index].concat('Other'));
					}

					if (item?.value === OTHER_KEY_VALUE && index === 1) {
						// @ts-ignore
						fieldsStep = fieldsStep.concat(watch('treasuryAccountAddress'));
					}
				});
			}
		}

		return setIsValidForm(fieldsStep?.filter((item) => !item).length === 0);
	};

	const handleFinish = () => {
		// TODO: connect with SDK services
		alert('create!');
	};

	const handleCancel = () => {
		RouterManager.to(navigate, NamedRoutes.Dashboard);
	};

	const stepperProps = {
		steps,
		handleLastButtonPrimary: handleFinish,
		handleFirstButtonSecondary: handleCancel,
		textLastButtonPrimary: t('common.createStableCoin'),
		isValid: isValidForm,
		currentStep,
		setCurrentStep,
	};

	return (
		<Stack h='full'>
			<BaseContainer title={t('common.createNewStableCoin')}>
				<Stepper {...stepperProps} />
			</BaseContainer>
		</Stack>
	);
};

export default StableCoinCreation;
