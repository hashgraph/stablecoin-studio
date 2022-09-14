import { Box, Heading } from '@chakra-ui/react';
import BaseContainer from '../../components/BaseContainer';
import DirectAccess from '../../components/DirectAccess';
import { NamedRoutes } from '../../Router/NamedRoutes';

const Operations = () => {
	return (
		<BaseContainer title='Operations'>
			<Box p={{ base: 4, md: '128px' }}>
				<Heading fontSize='20px' fontWeight='600' mb={14}>
					Create new operation
				</Heading>
				<DirectAccess title='Cash in tokens' icon='ArrowDown' route={NamedRoutes.CashIn} />
			</Box>
		</BaseContainer>
	);
};

export default Operations;
