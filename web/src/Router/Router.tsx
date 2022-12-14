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
import SDKService from '../services/SDKService';
import StableCoinDetails from '../views/StableCoinDetails';
import { hashpackActions, IS_INITIALIZED } from '../store/slices/hashpackSlice';
import {
	SELECTED_WALLET_COIN,
	SELECTED_WALLET_PAIRED,
	walletActions,
} from '../store/slices/walletSlice';
import ImportedTokenCreation from '../views/ImportedToken/ImportedTokenCreation';
import DangerZoneOperations from '../views/Operations/DangerZone';
import type { EventParameter } from 'hedera-stable-coin-sdk';
import { ConnectionState } from 'hedera-stable-coin-sdk';

const PrivateRoute = ({ status }: { status?: ConnectionState }) => {
	return (
		<Layout>
			{status === ConnectionState.Paired ? (
				<Outlet />
			) : (
				<Navigate to={RoutesMappingUrl.login} replace />
			)}
		</Layout>
	);
};

const OnboardingRoute = ({ status }: { status?: ConnectionState }) => {
	return status !== ConnectionState.Paired ? (
		<Outlet />
	) : (
		<Navigate to={RoutesMappingUrl.stableCoinNotSelected} replace />
	);
};

const Router = () => {
	const [status, setStatus] = useState<ConnectionState>();

	const dispatch = useDispatch();

	const haspackInitialized = useSelector(IS_INITIALIZED);
	const selectedWalletCoin = !!useSelector(SELECTED_WALLET_COIN);
	const selectedWalletPairedAccount = useSelector(SELECTED_WALLET_PAIRED);

	useEffect(() => {
		instanceSDK();
	}, []);

	useEffect(() => {
		if (!status) return;

		dispatch(hashpackActions.setStatus(status));

		if (status === ConnectionState.Paired) {
			getWalletData();
		}
	}, [status]);

	const getWalletData = async () => {
		const walletData = SDKService.getWalletData();
		let result = { ...walletData };

		if (selectedWalletPairedAccount) {
			result = {
				...result,
			};
		}
		dispatch(walletActions.setData(result));
	};

	const walletInit = () => dispatch(hashpackActions.setInitialized());

	const walletFound = (event: EventParameter<'walletFound'>) => {
		dispatch(walletActions.setHasWalletExtension(event.name));
	};

	const walletPaired = (event: EventParameter<'walletPaired'>) => {
		if (event) {
			dispatch(walletActions.setData(event.data));
		}

		setStatus(ConnectionState.Paired);
	};

	const walletConnectionStatusChanged = (newStatus: any) => {
		setStatus(newStatus);
	};

	const instanceSDK = async () => {
		await SDKService.registerEvents({
			walletInit,
			walletFound,
			walletPaired,
			walletConnectionStatusChanged,
		});
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
						<Route path={RoutesMappingUrl.importedToken} element={<ImportedTokenCreation />} />
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
