import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Flex, Spinner } from '@chakra-ui/react';
import Layout from '../layout/Layout';
import { RoutesMappingUrl } from './RoutesMappingUrl';
import CashInOperation from '../views/Operations/CashIn';
import WipeOperation from '../views/Operations/Wipe';
import Dashboard from '../views/Dashboard';
import GetBalanceOperation from '../views/Operations/GetBalance';
import HandleRoles from '../views/Roles/HandleRoles';
import { actions } from '../views/Roles/constants';
import Login from '../views/Login';
import Operations from '../views/Operations';
import Roles from '../views/Roles';
import StableCoinCreation from '../views/StableCoinCreation/StableCoinCreation';
import StableCoinNotSelected from '../views/ErrorPage/StableCoinNotSelected';
import SDKService, { HashConnectConnectionState } from '../services/SDKService';
import type { AcknowledgeMessage } from 'hedera-stable-coin-sdk';
import { hashpackActions, IS_INITIALIZED } from '../store/slices/hashpackSlice';
import { walletActions, HAS_WALLET_EXTENSION } from '../store/slices/walletSlice';

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
		<Navigate to={RoutesMappingUrl.dashboard} replace />
	);
};

const Router = () => {
	const [status, setStatus] = useState<HashConnectConnectionState>();
	const dispatch = useDispatch();
	const haspackInitialized = useSelector(IS_INITIALIZED);
	const hasWalletExtension = useSelector(HAS_WALLET_EXTENSION);

	useEffect(() => {
		instanceSDK();
	}, []);

	useEffect(() => {
		if (haspackInitialized || hasWalletExtension) {
			getStatus();
		}
	}, [haspackInitialized, hasWalletExtension]);

	const onInit = () => dispatch(hashpackActions.setInitialized());

	const onWalletExtensionFound = () => dispatch(walletActions.setHasWalletExtension());

	const onWalletPaired = () => setStatus(HashConnectConnectionState.Paired);

	const onWalletAcknowledgeMessageEvent = (msg: AcknowledgeMessage) =>
		dispatch(hashpackActions.setAckMessage(msg));

	const instanceSDK = async () =>
		await SDKService.getInstance({
			onInit,
			onWalletExtensionFound,
			onWalletPaired,
			onWalletAcknowledgeMessageEvent,
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
					{status && (
						<Route element={<PrivateRoute status={status} />}>
							<Route path={RoutesMappingUrl.balance} element={<GetBalanceOperation />} />
							<Route path={RoutesMappingUrl.cashIn} element={<CashInOperation />} />
							<Route path={RoutesMappingUrl.wipe} element={<WipeOperation />} />
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
							<Route
								path={RoutesMappingUrl.revokeRole}
								element={<HandleRoles action={actions.revoke} />}
							/>
							<Route path={RoutesMappingUrl.roles} element={<Roles />} />
							<Route path={RoutesMappingUrl.stableCoinCreation} element={<StableCoinCreation />} />
							<Route
								path={RoutesMappingUrl.stableCoinNotSelected}
								element={<StableCoinNotSelected />}
							/>
							<Route path='*' element={<Navigate to={RoutesMappingUrl.dashboard} />} />
						</Route>
					)}
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
