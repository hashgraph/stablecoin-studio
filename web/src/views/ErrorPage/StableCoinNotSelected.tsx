import { Flex, Image, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import SAFE_BOX from '../../assets/svg/safe-box.svg';

const StableCoinNotSelected = () => {
	const { t } = useTranslation('errorPage');

	return (
		<Flex
			data-testid='stable-coin-not-selected-container'
			bgColor='white'
			w='100%'
			h='100%'
			justifyContent='center'
			alignItems='center'
			flexDirection='column'
		>
			<Image
				data-testid='stable-coin-not-selected-logo'
				src={SAFE_BOX}
				alt='Safe box'
				w='140px'
				h='140px'
				mb='40px'
			/>
			<Text
				data-testid='stable-coin-not-selected-title'
				fontSize='22px'
				fontWeight='700'
				lineHeight='16px'
				mb='16px'
			>
				{t('stableCoinNotSelected.title')}
			</Text>
			<Text
				data-testid='stable-coin-not-selected-description'
				fontSize='16px'
				fontWeight='500'
				lineHeight='16px'
				maxW='500px'
				textAlign='center'
				mb='2px'
			>
				{t('stableCoinNotSelected.description')}
			</Text>
			<Text fontSize='16px' fontWeight='500' lineHeight='16px' maxW='500px' textAlign='center'>
				{t('stableCoinNotSelected.description2')}
			</Text>
		</Flex>
	);
};

export default StableCoinNotSelected;
