import { Box, Heading } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import BaseContainer from '../../components/BaseContainer';
import { NamedRoutes } from '../../Router/NamedRoutes';
import GridDirectAccess from '../../components/GridDirectAccess';

const Roles = () => {
	const { t } = useTranslation('roles');
	const directAccesses = [
		{
			icon: 'PlusCircle',
			route: NamedRoutes.GiveRole,
			title: t('give'),
		},
		{
			icon: 'MinusCircle',
			route: NamedRoutes.RevokeRole,
			title: t('revoke'),
		},
		{
			icon: 'PencilSimple',
			route: NamedRoutes.EditRole,
			title: t('edit'),
			variant: 'disabled',
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

export default Roles;
