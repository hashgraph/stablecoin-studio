import { Flex, Image, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import SAFE_BOX from '../../../assets/svg/safe-box.svg';

const NoFeesManagement = () => {
	const { t } = useTranslation('feesManagement');

	return (
		<Flex
			data-testid='no-fees-management-container'
			bgColor='white'
			w='100%'
			h='100%'
			justifyContent='center'
			alignItems='center'
			flexDirection='column'
		>
			<Image
				data-testid='no-fees-management-logo'
				src={SAFE_BOX}
				alt='Safe box'
				w='140px'
				h='140px'
				mb='40px'
			/>
			<Text
				data-testid='no-fees-management-title'
				fontSize='22px'
				fontWeight='700'
				lineHeight='16px'
				mb='16px'
			>
				{t('noFeesManagement.title')}
			</Text>
			<Text
				data-testid='no-fees-management-description'
				fontSize='16px'
				fontWeight='500'
				lineHeight='16px'
				maxW='500px'
				textAlign='center'
				mb='2px'
			>
				{t('noFeesManagement.description')}
			</Text>
		</Flex>
	);
};

export default NoFeesManagement;
