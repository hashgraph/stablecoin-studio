import { Box, Heading } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import BaseContainer from '../../components/BaseContainer';
import DirectAccess from '../../components/DirectAccess';
import { NamedRoutes } from '../../Router/NamedRoutes';

const Operations = () => {
	const { t } = useTranslation('operations');
	return (
		<BaseContainer title='Operations'>
			<Box p={{ base: 4, md: '128px' }}>
				<Heading fontSize='20px' fontWeight='600' mb={14} data-testid='subtitle'>
					{t('subtitle')}
				</Heading>
				<DirectAccess title={t('cashInOperation')} icon='ArrowDown' route={NamedRoutes.CashIn} />
			</Box>
		</BaseContainer>
	);
};

export default Operations;
