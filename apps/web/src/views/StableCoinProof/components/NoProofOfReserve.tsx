import { Flex, Image, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import SAFE_BOX from '../../../assets/svg/safe-box.svg';

const NoProofOfReserve = () => {
	const { t } = useTranslation('proofOfReserve');

	return (
		<Flex
			data-testid='no-proof-of-reserve-container'
			bgColor='white'
			w='100%'
			h='100%'
			justifyContent='center'
			alignItems='center'
			flexDirection='column'
		>
			<Image
				data-testid='no-proof-of-reserve-logo'
				src={SAFE_BOX}
				alt='Safe box'
				w='140px'
				h='140px'
				mb='40px'
			/>
			<Text
				data-testid='no-proof-of-reserve-title'
				fontSize='22px'
				fontWeight='700'
				lineHeight='16px'
				mb='16px'
			>
				{t('noProofOfReserve.title')}
			</Text>
			<Text
				data-testid='no-proof-of-reserve-description'
				fontSize='16px'
				fontWeight='500'
				lineHeight='16px'
				maxW='500px'
				textAlign='center'
				mb='2px'
			>
				{t('noProofOfReserve.description')}
			</Text>
		</Flex>
	);
};

export default NoProofOfReserve;
