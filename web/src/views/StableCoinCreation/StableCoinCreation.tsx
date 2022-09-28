import { Box, Stack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import BaseContainer from '../../components/BaseContainer';
import BasicDetails from './BasicDetails';
import type { Step } from '../../components/Stepper';
import Stepper from '../../components/Stepper';
import { NamedRoutes } from '../../Router/NamedRoutes';
import { RouterManager } from '../../Router/RouterManager';

const StableCoinCreation = () => {
	const navigate = useNavigate();
	const { t } = useTranslation('stableCoinCreation');
	const {
		control,
		formState: { isValid },
	} = useForm({ mode: 'onChange' });

	// TODO: change childrens props when components will be ready
	const steps: Step[] = [
		{
			number: '01',
			title: t('tabs.basicDetails'),
			complete: false,
			children: <BasicDetails control={control} />,
		},
		{
			number: '02',
			title: t('tabs.optionalDetails'),
			complete: false,
			children: <Box>Tab 2</Box>,
		},
		{
			number: '03',
			title: t('tabs.managementPermissions'),
			complete: false,
			children: <Box>Tab 3</Box>,
		},
		{
			number: '04',
			title: t('tabs.review'),
			complete: false,
			children: <Box>Tab 4</Box>,
		},
	];

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
		isValid,
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
