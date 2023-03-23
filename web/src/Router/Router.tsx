import { useEffect } from 'react';
import { Navigate, Route, Routes, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Flex, Spinner, Text } from '@chakra-ui/react';
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
import Operations from '.';
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
import {
	Account,
	EventParameter,
	WalletEvent,
	LoggerTransports,
	SDK,
	ConnectionState,
} from 'hedera-stable-coin-sdk';
import StableCoinProof from '../views/StableCoinProof';
import FeesManagement from '../views/FeesManagement';
import GrantKycOperation from '../views/Operations/GrantKyc';
import RevokeKycOperation from '../views/Operations/RevokeKyc';
import CheckKycOperation from '../views/Operations/CheckKyc';

const LoginOverlayRoute = ({ show }: { show: boolean }) => {
	return (
		<>
			{show && <Login />}
			<Layout>
				<Outlet />
			</Layout>
		</>
	);
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

	const onLastWalletEvent = <T extends keyof WalletEvent>(
		event: EventParameter<T>,
		cll: CallableFunction,
	) => {
		const lastWallet = localStorage.getItem('lastWallet');
		if (event) {
			if (lastWallet && lastWallet === event.wallet) {
				cll(event);
			}
		}
	};

	const walletPaired = (event: EventParameter<'walletPaired'>) => {
		onLastWalletEvent(event, () => {
			dispatch(walletActions.setData(event.data));
			dispatch(walletActions.setStatus(ConnectionState.Paired));
			dispatch(walletActions.setNetwork(event.network.name));
			dispatch(walletActions.setNetworkRecognized(event.network.recognized));
			dispatch(walletActions.setFactoryId(event.network.factoryId));
			if (!event.data.account) dispatch(walletActions.setAccountRecognized(false));
			else
				dispatch(
					walletActions.setAccountRecognized(
						event.data.account.id !== Account.NullHederaAccount.id,
					),
				);
		});
	};

	const walletConnectionStatusChanged = (
		event: EventParameter<'walletConnectionStatusChanged'>,
	) => {
		onLastWalletEvent(event, () => {
			dispatch(walletActions.setStatus(event.status));
		});
	};

	const walletDisconnect = (event: EventParameter<'walletDisconnect'>) => {
		onLastWalletEvent(event, () => {
			dispatch(walletActions.setStatus(ConnectionState.Disconnected));
		});
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
				walletDisconnect,
			},
			lastWallet,
		);
	};

	return (
		<main>
			{availableWallets.length > 0 ? (
				<Routes>
					{/* Private routes */}
					<Route
						element={
							<LoginOverlayRoute show={Boolean(!lastWallet || status !== ConnectionState.Paired)} />
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
									element={<HandleRoles action='editRole' />}
								/>
								<Route
									path={RoutesMappingUrl.giveRole}
									element={<HandleRoles action='giveRole' />}
								/>
								<Route path={RoutesMappingUrl.operations} element={<Operations />} />
								<Route path={RoutesMappingUrl.dangerZone} element={<DangerZoneOperations />} />
								<Route path={RoutesMappingUrl.grantKyc} element={<GrantKycOperation />} />
								<Route path={RoutesMappingUrl.revokeKyc} element={<RevokeKycOperation />} />
								<Route path={RoutesMappingUrl.checkKyc} element={<CheckKycOperation />} />
								<Route
									path={RoutesMappingUrl.revokeRole}
									element={<HandleRoles action='revokeRole' />}
								/>
								<Route
									path={RoutesMappingUrl.refreshRoles}
									element={<HandleRoles action={actions.refresh} />}
								/>
								<Route path={RoutesMappingUrl.roles} element={<Roles />} />
								<Route path={RoutesMappingUrl.stableCoinDetails} element={<StableCoinDetails />} />
								<Route path={RoutesMappingUrl.proofOfReserve} element={<StableCoinProof />} />
								<Route path={RoutesMappingUrl.feesManagement} element={<FeesManagement />} />
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
					flexDir='column'
					gap={10}
				>
					<Spinner
						color='brand.gray'
						thickness='3px'
						w='50px'
						h='50px'
						justifyContent='center'
						alignSelf={'center'}
					/>
					<Text
						fontSize='16px'
						fontWeight={500}
						textAlign='center'
						lineHeight='16px'
						color='brand.gray'
					>
						Searching for supported wallets
					</Text>
				</Flex>
			)}
		</main>
	);
};

export default Router;
