import { Box, Heading } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import BaseContainer from '../../components/BaseContainer';

import { useRefreshCoinInfo } from '../../hooks/useRefreshCoinInfo';
import { SELECTED_WALLET_ACCOUNT_INFO, SELECTED_WALLET_COIN } from '../../store/slices/walletSlice';

const StableCoinProof = () => {

const { t } = useTranslation('stableCoinDetails');

const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
const account = useSelector(SELECTED_WALLET_ACCOUNT_INFO);

useRefreshCoinInfo();

return (
		<BaseContainer title={t('title')}>
			<Box p={{ base: 4, md: '128px' }}>
				<Heading fontSize='20px' fontWeight='600' mb={14} data-testid='subtitle'>
					{t('subtitle')}
				</Heading>
				
				aqui
			</Box>
		</BaseContainer>
	);
};

export default StableCoinProof;
