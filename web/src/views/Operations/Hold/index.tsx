import { Box, Heading, Stack, HStack, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
	SELECTED_WALLET_CAPABILITIES,
	SELECTED_WALLET_COIN,
} from '../../../store/slices/walletSlice';
import { type DirectAccessProps } from '../../../components/DirectAccess';
import { NamedRoutes } from '../../../Router/NamedRoutes';
import BaseContainer from '../../../components/BaseContainer';
import GridDirectAccess from '../../../components/GridDirectAccess';

export const HoldOperations = () => {
	const { t } = useTranslation('operations', {
		keyPrefix: 'hold',
	});

	const selectedStableCoin = useSelector(SELECTED_WALLET_COIN);
	const capabilities = useSelector(SELECTED_WALLET_CAPABILITIES);

	const [isPaused, setPaused] = useState(false);
	const [isDeleted, setDeleted] = useState(false);

	useEffect(() => {
		if (selectedStableCoin) {
			checkTokenStatus();
		}
	}, [selectedStableCoin, capabilities]);

	const checkTokenStatus = async () => {
		setPaused(selectedStableCoin?.paused || false);
		setDeleted(selectedStableCoin?.deleted || false);
	};

	const directAccesses: DirectAccessProps[] = [
		{
			icon: 'ListBullets',
			route: NamedRoutes.HoldList,
			title: t('operations.list'),
		},
		{
			icon: 'PlusCircle',
			route: NamedRoutes.HoldCreate,
			title: t('operations.create'),
		},
		{
			icon: 'PlayCircle',
			route: NamedRoutes.HoldExecute,
			title: t('operations.execute'),
		},
		{
			icon: 'ArrowCircleDownLeft',
			route: NamedRoutes.HoldRelease,
			title: t('operations.release'),
		},
		{
			icon: 'ArrowCircleUpRight',
			route: NamedRoutes.HoldReclaim,
			title: t('operations.reclaim'),
		},
	];

	const filteredDirectAccesses = directAccesses.filter((access) => !access.isDisabled);

	return (
		<Stack h='full'>
			<HStack spacing={6} w='full'>
				{isPaused && (
					<Text
						fontSize='16px'
						color='brand.secondary'
						fontWeight={700}
						align='right'
						w='full'
						as='i'
						data-testid='paused-subtitle'
					>
						{t('pausedToken')}
					</Text>
				)}
				{isDeleted && (
					<Text
						fontSize='16px'
						color='brand.secondary'
						fontWeight={700}
						align='right'
						w='full'
						as='i'
						data-testid='deleted-subtitle'
					>
						{t('deletedToken')}
					</Text>
				)}
			</HStack>
			<BaseContainer title={t('title')}>
				<Box p={{ base: 4, md: '128px' }}>
					<Heading fontSize='20px' fontWeight='600' mb={14} data-testid='subtitle'>
						{t('subtitle')}
					</Heading>
					<GridDirectAccess directAccesses={filteredDirectAccesses} />
				</Box>
			</BaseContainer>
		</Stack>
	);
};
