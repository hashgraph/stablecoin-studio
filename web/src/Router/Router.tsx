import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Flex, Spinner } from '@chakra-ui/react';
import Layout from '../layout/Layout';
import { RoutesMappingUrl } from './RoutesMappingUrl';
import CashInOperation from '../views/Operations/CashIn';
import BurnOperation from '../views/Operations/Burn';
import GetBalanceOperation from '../views/Operations/GetBalance';
import RescueTokenOperation from '../views/Operations/RescueTokens';
import WipeOperation from '../views/Operations/Wipe';
import FreezeOperation from '../views/Operations/Freeze';
import UnfreezeOperation from '../views/Operations/Unfreeze';
import Dashboard from '../views/Dashboard';
import HandleRoles from '../views/Roles/HandleRoles';
import { actions } from '../views/Roles/constants';
import Login from '../views/Login';
import Operations from '../views/Operations';
import Roles from '../views/Roles';
import StableCoinCreation from '../views/StableCoinCreation/StableCoinCreation';
import StableCoinNotSelected from '../views/ErrorPage/StableCoinNotSelected';
import SDKService, { HashConnectConnectionState } from '../services/SDKService';
import StableCoinDetails from '../views/StableCoinDetails';
import { hashpackActions, IS_INITIALIZED } from '../store/slices/hashpackSlice';
import {
	HAS_WALLET_EXTENSION,
	SELECTED_WALLET_COIN,
	SELECTED_WALLET_PAIRED,
	walletActions,
} from '../store/slices/walletSlice';
import type { SavedPairingData } from 'hedera-stable-coin-sdk';
import ExternalTokenCreation from '../views/ExternalToken/ExternalTokenCreation';
import DangerZoneOperations from '../views/Operations/DangerZone';

const PrivateRoute = ({ status }: { status?: HashConnectConnectionState }) => {
	return (
		<Layout>
			{status === HashConnectConnectionState.Paired ? (
				<Outlet />
			) : (
				<Navigate to={RoutesMappingUrl.login} replace />
			)}
		</Layout>
	);
};

const OnboardingRoute = ({ status }: { status?: HashConnectConnectionState }) => {
	return status !== HashConnectConnectionState.Paired ? (
		<Outlet />
	) : (
		<Navigate to={RoutesMappingUrl.stableCoinNotSelected} replace />
	);
};

const Router = () => {
	const [status, setStatus] = useState<HashConnectConnectionState>();

	const dispatch = useDispatch();

	const haspackInitialized = useSelector(IS_INITIALIZED);
	const hasWalletExtension = useSelector(HAS_WALLET_EXTENSION);
	const selectedWalletCoin = !!useSelector(SELECTED_WALLET_COIN);
	const selectedWalletPairedAccount = useSelector(SELECTED_WALLET_PAIRED);

	useEffect(() => {
		instanceSDK();
	}, []);

	useEffect(() => {
		if (haspackInitialized || hasWalletExtension) {
			getStatus();
		}
	}, [haspackInitialized, hasWalletExtension]);

	useEffect(() => {
		if (!status) return;

		dispatch(hashpackActions.setStatus(status));

		if (status === HashConnectConnectionState.Paired) {
			getWalletData();
		}
	}, [status]);

	const getWalletData = async () => {
		const walletData = await SDKService.getWalletData();
		let result = { ...walletData };

		if (selectedWalletPairedAccount) {
			result = {
				...result,
				savedPairings: [selectedWalletPairedAccount as any as SavedPairingData],
			};
		}
		dispatch(walletActions.setData(result));
	};

	const onInit = () => dispatch(hashpackActions.setInitialized());

	const onWalletExtensionFound = () => dispatch(walletActions.setHasWalletExtension());

	const onWalletPaired = (savedPairings: any) => {
		if (savedPairings) {
			dispatch(walletActions.setSavedPairings([savedPairings]));
		}

		setStatus(HashConnectConnectionState.Paired);
	};

	const onWalletConnectionChanged = (newStatus: any) => {
		if (newStatus === HashConnectConnectionState.Disconnected) {
			setStatus(HashConnectConnectionState.Disconnected);
		}
	};

	const instanceSDK = async () =>
		await SDKService.getInstance({
			onInit,
			onWalletExtensionFound,
			onWalletPaired,
			onWalletConnectionChanged,
		});

	const getStatus = async () => {
		try {
			const status = await SDKService.getStatus();
			setStatus(status);
		} catch {
			setStatus(HashConnectConnectionState.Disconnected);
		}
	};

	return (
		<main>
			{haspackInitialized ? (
				<Routes>
					{/* Public routes */}
					<Route element={<OnboardingRoute status={status} />}>
						<Route path={RoutesMappingUrl.login} element={<Login />} />
					</Route>
					{/* Private routes */}
					<Route element={<PrivateRoute status={status} />}>
						{selectedWalletCoin && (
							<>
								<Route path={RoutesMappingUrl.balance} element={<GetBalanceOperation />} />
								<Route path={RoutesMappingUrl.cashIn} element={<CashInOperation />} />
								<Route path={RoutesMappingUrl.burn} element={<BurnOperation />} />
								<Route path={RoutesMappingUrl.rescueTokens} element={<RescueTokenOperation />} />
								<Route path={RoutesMappingUrl.wipe} element={<WipeOperation />} />
								<Route path={RoutesMappingUrl.freeze} element={<FreezeOperation />} />
								<Route path={RoutesMappingUrl.unfreeze} element={<UnfreezeOperation />} />
								<Route path={RoutesMappingUrl.dashboard} element={<Dashboard />} />
								<Route
									path={RoutesMappingUrl.editRole}
									element={<HandleRoles action={actions.edit} />}
								/>
								<Route
									path={RoutesMappingUrl.giveRole}
									element={<HandleRoles action={actions.give} />}
								/>
								<Route path={RoutesMappingUrl.operations} element={<Operations />} />
								<Route path={RoutesMappingUrl.dangerZone} element={<DangerZoneOperations />} />
								<Route
									path={RoutesMappingUrl.revokeRole}
									element={<HandleRoles action={actions.revoke} />}
								/>
								<Route
									path={RoutesMappingUrl.refreshRoles}
									element={<HandleRoles action={actions.refresh} />}
								/>
								<Route path={RoutesMappingUrl.roles} element={<Roles />} />
								<Route path={RoutesMappingUrl.stableCoinDetails} element={<StableCoinDetails />} />
							</>
						)}
						<Route path={RoutesMappingUrl.stableCoinCreation} element={<StableCoinCreation />} />
						<Route path={RoutesMappingUrl.externalToken} element={<ExternalTokenCreation />} />
						<Route
							path={RoutesMappingUrl.stableCoinNotSelected}
							element={<StableCoinNotSelected />}
						/>
						<Route path='*' element={<Navigate to={RoutesMappingUrl.stableCoinNotSelected} />} />
					</Route>
				</Routes>
			) : (
				<Flex
					w='full'
					h='100vh'
					justify={'center'}
					alignSelf='center'
					alignContent={'center'}
					flex={1}
				>
					<Spinner w='150px' h='150px' justifyContent='center' alignSelf={'center'} />
				</Flex>
			)}
		</main>
	);
};

export default Router;
