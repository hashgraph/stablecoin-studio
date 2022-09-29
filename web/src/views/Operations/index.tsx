import { Box, Heading } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import BaseContainer from '../../components/BaseContainer';
import { NamedRoutes } from '../../Router/NamedRoutes';
import GridDirectAccess from '../../components/GridDirectAccess';

const Operations = () => {
	const { t } = useTranslation('operations');
	const directAccesses = [
		{
			icon: 'ArrowDown',
			route: NamedRoutes.CashIn,
			title: t('cashInOperation'),
		},
		{
			icon: 'ArrowUp',
			route: NamedRoutes.CashOut,
			title: t('cashOutOperation'),
		},
		{
			icon: 'Coin',
			route: NamedRoutes.Balance,
			title: t('getBalanceOperation'),
		},
		{
			icon: 'ArrowsDownUp',
			route: NamedRoutes.RescueTokens,
			title: t('rescueOperation'),
		},
		{
			icon: 'MinusCircle',
			route: NamedRoutes.Wipe,
			title: t('wipeOperation'),
		},
	];

	return (
		<BaseContainer title={t('title')}>
			<Box p={{ base: 4, md: '128px' }}>
				<Heading fontSize='20px' fontWeight='600' mb={14} data-testid='subtitle'>
					{t('subtitle')}
				</Heading>
				<GridDirectAccess directAccesses={directAccesses} />
			</Box>
		</BaseContainer>
	);
};

export default Operations;
