import { useEffect } from 'react';
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
import {
	AVAILABLE_WALLETS,
	LAST_WALLET_SELECTED,
	SELECTED_WALLET_COIN,
	SELECTED_WALLET_STATUS,
	walletActions,
} from '../store/slices/walletSlice';
import ImportedTokenCreation from '../views/ImportedToken/ImportedTokenCreation';
import DangerZoneOperations from '../views/Operations/DangerZone';
import type { EventParameter } from 'hedera-stable-coin-sdk';
import { LoggerTransports, SDK, ConnectionState } from 'hedera-stable-coin-sdk';

const PrivateRoute = ({ allow }: { allow: boolean }) => {
	return <Layout>{allow ? <Outlet /> : <Navigate to={RoutesMappingUrl.login} replace />}</Layout>;
};

const OnboardingRoute = ({ allow }: { allow: boolean }) => {
	return allow ? <Outlet /> : <Navigate to={RoutesMappingUrl.stableCoinNotSelected} replace />;
};

const Router = () => {
	const dispatch = useDispatch();

	const availableWallets = useSelector(AVAILABLE_WALLETS);
	const selectedWalletCoin = !!useSelector(SELECTED_WALLET_COIN);
	const lastWallet = useSelector(LAST_WALLET_SELECTED);
	const status = useSelector(SELECTED_WALLET_STATUS);

	useEffect(() => {
		instanceSDK();
	}, []);

	const walletPaired = (event: EventParameter<'walletPaired'>) => {
		const lastWallet = localStorage.getItem('lastWallet');
		if (event) {
			if (lastWallet && lastWallet === event.wallet) {
				dispatch(walletActions.setData(event.data));
				dispatch(walletActions.setStatus(ConnectionState.Paired));
			}
		}
	};

	const walletConnectionStatusChanged = (
		newStatus: EventParameter<'walletConnectionStatusChanged'>,
	) => {
		dispatch(walletActions.setStatus(newStatus.status));
	};

	const walletFound = (event: EventParameter<'walletFound'>) => {
		if (event) {
			dispatch(walletActions.setHasWalletExtension(event.name));
		}
	};

	const instanceSDK = async () => {
		SDK.appMetadata = {
			name: 'Hedera Stable Coin',
			description: 'An hedera dApp',
			icon: 'https://dashboard-assets.dappradar.com/document/15402/hashpack-dapp-defi-hedera-logo-166x166_696a701b42fd20aaa41f2591ef2339c7.png',
			url: '',
		};
		SDK.log = {
			level: process.env.REACT_APP_LOG_LEVEL ?? 'ERROR',
			transports: new LoggerTransports.Console(),
		};
		await SDKService.init(
			{
				walletFound,
				walletPaired,
				walletConnectionStatusChanged,
			},
			lastWallet,
		);
	};

	return (
		<main>
			{availableWallets.length > 0 ? (
				<Routes>
					{/* Public routes */}
					<Route
						element={
							<OnboardingRoute allow={Boolean(!lastWallet || status !== ConnectionState.Paired)} />
						}
					>
						<Route path={RoutesMappingUrl.login} element={<Login />} />
					</Route>
					{/* Private routes */}
					<Route
						element={
							<PrivateRoute allow={Boolean(lastWallet && status === ConnectionState.Paired)} />
						}
					>
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
