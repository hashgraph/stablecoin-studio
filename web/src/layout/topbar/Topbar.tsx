import { Box, Flex, HStack, Image } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import LOGO_HEDERA from '../../assets/svg/hedera-hbar-logo.svg';
import { NamedRoutes } from '../../Router/NamedRoutes';
import { RouterManager } from '../../Router/RouterManager';
import CoinDropdown from './CoinDropdown';
import CollapsibleButton from './components/CollapsibleButton';
import TopbarRight from './TopbarRight';

const Topbar = () => {
	const { t } = useTranslation('global');
	const navigate = useNavigate();

	const handleNavigateSC = () => {
		RouterManager.to(navigate, NamedRoutes.StableCoinCreation);
	};

	return (
		<Flex
			data-testid='topbar'
			w='100%'
			h='64px'
			boxShadow='down-black'
			bgColor='brand.white'
			color='brand.gray2'
			alignItems='center'
			position='relative'
			zIndex='100'
		>
			<Box minW='80px' w='80px' textAlign='center' ml='64px' mr='64px'>
				<Image data-testid='topbar-logo' src={LOGO_HEDERA} w='40px' h='40px' margin='auto' />
			</Box>
			<Box borderRight='2px solid' borderRightColor='light.primary' w='1px' h='30px' />
			<Flex w='100%' h='100%' justifyContent='space-between' alignItems='center' pl={6} pr={10}>
				<Flex gap={5} alignItems='center'>
					<CoinDropdown />
					<HStack>
						<CollapsibleButton
							nameIcon='Plus'
							text={t('topbar.createSC')}
							onClick={handleNavigateSC}
						/>
						<CollapsibleButton
							nameIcon='ArrowLineDown'
							text={t('topbar.addSC')}
							onClick={() => alert('working on it!')}
						/>
					</HStack>
				</Flex>
				<TopbarRight />
			</Flex>
		</Flex>
	);
};

export default Topbar;
