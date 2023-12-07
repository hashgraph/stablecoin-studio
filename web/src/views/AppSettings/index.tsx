import {
	Box,
	Heading,
	Text,
	Tabs,
	TabList,
	TabPanels,
	Tab,
	TabPanel,
	Stack,
	HStack,
	Button,
	RadioGroup,
	Radio,
	Flex,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/Icon';
import BaseContainer from '../../components/BaseContainer';
import { SelectController } from '../../components/Form/SelectController';
import { networkOptions } from './constants';
import { type FieldValues, useForm, useWatch } from 'react-hook-form';
import { propertyNotFound } from '../../constant';
import InputController from '../../components/Form/InputController';
import SwitchController from '../../components/Form/SwitchController';
import { useDispatch, useSelector } from 'react-redux';
import {
	MIRROR_LIST,
	RPC_LIST,
	SELECTED_MIRRORS,
	SELECTED_RPCS,
	walletActions,
} from '../../store/slices/walletSlice';
import SDKService from '../../services/SDKService';
import { type IMirrorRPCNode } from '../../interfaces/IMirrorRPCNode';

const AppSettings = () => {
	const { t } = useTranslation(['appSettings', 'errorPage']);
	const dispatch = useDispatch();
	const form = useForm<FieldValues>({
		mode: 'onChange',
	});
	const { control, getValues } = form;

	const [defaultMirror, setDefaultMirror] = useState('0');
	const [defaultRPC, setDefaultRPC] = useState('0');
	const [showContentMirror, setShowContentMirror] = useState(false);
	const [showContentRPC, setShowContentRPC] = useState(false);
	const [arrayMirror, setArrayMirror] = useState<IMirrorRPCNode[]>([]);
	const [arrayRPC, setArrayRPC] = useState<IMirrorRPCNode[]>([]);
	const [arrayMirrorCurrentNetwork, setArrayMirrorCurrentNetwork] = useState<IMirrorRPCNode[]>([]);
	const [arrayRPCCurrentNetwork, setArrayRPCCurrentNetwork] = useState<IMirrorRPCNode[]>([]);
	const [selectedMirror, setSelectedMirror] = useState<IMirrorRPCNode>();
	const [selectedRPC, setSelectedRPC] = useState<IMirrorRPCNode>();

	const mirrorList: IMirrorRPCNode[] = useSelector(MIRROR_LIST);
	const selectedMirrors: IMirrorRPCNode[] = useSelector(SELECTED_MIRRORS);
	const rpcList: IMirrorRPCNode[] = useSelector(RPC_LIST);
	const selectedRPCs: IMirrorRPCNode[] = useSelector(SELECTED_RPCS);

	const styles = {
		menuList: {
			maxH: '220px',
			overflowY: 'auto',
			bg: 'brand.white',
			boxShadow: 'down-black',
			p: 4,
		},
		wrapper: {
			border: '1px',
			borderColor: 'brand.black',
			borderRadius: '8px',
			height: 'initial',
		},
	};

	function removeMirrorToArray(mirrorName: string, environment: string) {
		const newArray = arrayMirror.filter(
			(obj: IMirrorRPCNode) =>
				obj.name !== mirrorName ||
				obj.Environment.toLocaleLowerCase() !== environment.toLocaleLowerCase(),
		);
		setArrayMirror(newArray);
		const newArrayCurrentNetwork = newArray.filter(
			(obj: IMirrorRPCNode) =>
				obj.Environment.toLocaleLowerCase() === environment.toLocaleLowerCase(),
		);
		setArrayMirrorCurrentNetwork(newArrayCurrentNetwork);
		dispatch(walletActions.setMirrorList(newArray.filter((mirror) => mirror.isInConfig === false)));
	}
	function removeRPCToArray(rpcName: string, environment: string) {
		const newArray = arrayRPC.filter(
			(obj: IMirrorRPCNode) =>
				obj.name !== rpcName ||
				obj.Environment.toLocaleLowerCase() !== environment.toLocaleLowerCase(),
		);
		setArrayRPC(newArray);
		const newArrayCurrentNetwork = newArray.filter(
			(obj: IMirrorRPCNode) =>
				obj.Environment.toLocaleLowerCase() === environment.toLocaleLowerCase(),
		);
		setArrayRPCCurrentNetwork(newArrayCurrentNetwork);
		dispatch(walletActions.setRPCList(newArray.filter((rpc) => rpc.isInConfig === false)));
	}

	const apiKeyMirror = useWatch({
		control,
		name: 'apiKeyMirror',
	});
	const apiKeyRpc = useWatch({
		control,
		name: 'apiKeyRpc',
	});

	function addMirror() {
		const { nameMirror, urlMirror, apiKeyValueMirror, mirrorNetwork, apiKeyHeaderMirror } =
			getValues();
		const newArray = [
			...arrayMirror,
			createOptionMirror(
				nameMirror,
				urlMirror,
				apiKeyValueMirror,
				mirrorNetwork.value,
				false,
				apiKeyHeaderMirror,
			),
		];
		const newArrayCurrentNetwork = [
			...arrayMirrorCurrentNetwork,
			createOptionMirror(
				nameMirror,
				urlMirror,
				apiKeyValueMirror,
				mirrorNetwork.value,
				false,
				apiKeyHeaderMirror,
			),
		];
		setArrayMirror(newArray);
		setArrayMirrorCurrentNetwork(newArrayCurrentNetwork);
		dispatch(walletActions.setMirrorList(newArray.filter((mirror) => mirror.isInConfig === false)));
	}
	function addRpc() {
		const { nameRPC, urlRPC, apiKeyValueRPC, apiKeyHeaderRPC, rpcNetwork } = getValues();
		const newArray = [
			...arrayRPC,
			createOptionMirror(nameRPC, urlRPC, apiKeyValueRPC, rpcNetwork.value, false, apiKeyHeaderRPC),
		];
		const newArrayCurrentNetwork = [
			...arrayRPCCurrentNetwork,
			createOptionMirror(nameRPC, urlRPC, apiKeyValueRPC, rpcNetwork.value, false, apiKeyHeaderRPC),
		];
		setArrayRPC(newArray);
		setArrayRPCCurrentNetwork(newArrayCurrentNetwork);
		dispatch(walletActions.setRPCList(newArray.filter((rpc) => rpc.isInConfig === false)));
	}

	function createOptionMirror(
		name: string,
		BASE_URL: string,
		API_KEY: string,
		Environment: string,
		isInConfig: boolean,
		HEADER: string,
	): IMirrorRPCNode {
		return { name, BASE_URL, API_KEY, Environment, isInConfig, HEADER };
	}

	useEffect(() => {
		if (defaultMirror !== '0') {
			const selectedDefaultMirror = arrayMirrorCurrentNetwork.find(
				(mirror: any) => mirror.name === defaultMirror,
			);

			const newSelectedMirrors = selectedMirrors.filter(
				(obj: IMirrorRPCNode) =>
					obj.Environment.toLocaleLowerCase() !==
					selectedDefaultMirror?.Environment.toLocaleLowerCase(),
			);
			newSelectedMirrors.push(selectedDefaultMirror!);

			dispatch(walletActions.setSelectedMirrors(newSelectedMirrors));
			setSelectedMirror(selectedDefaultMirror);

			SDKService.setNetwork(
				selectedDefaultMirror!.Environment.toLocaleLowerCase(),
				selectedDefaultMirror,
				selectedRPC,
			);
		}
	}, [defaultMirror]);

	useEffect(() => {
		if (defaultRPC !== '0') {
			const selectedDefaultRPC = arrayRPCCurrentNetwork.find((rpc: any) => rpc.name === defaultRPC);
			const newSelectedRPCs = selectedRPCs.filter(
				(obj: IMirrorRPCNode) =>
					obj.Environment.toLocaleLowerCase() !==
					selectedDefaultRPC?.Environment.toLocaleLowerCase(),
			);
			newSelectedRPCs.push(selectedDefaultRPC!);

			dispatch(walletActions.setSelectedRPCs(newSelectedRPCs));
			setSelectedRPC(selectedDefaultRPC);

			SDKService.setNetwork(
				selectedDefaultRPC!.Environment.toLocaleLowerCase(),
				selectedMirror,
				selectedDefaultRPC,
			);
		}
	}, [defaultRPC]);

	async function handleTypeChangeMirror(): Promise<void> {
		const { mirrorNetwork } = getValues();
		setShowContentMirror(true);

		let newMirrorList: IMirrorRPCNode[] = [];

		if (process.env.REACT_APP_MIRROR_NODE) {
			newMirrorList = setNodeArrayByNetwork(
				JSON.parse(process.env.REACT_APP_MIRROR_NODE),
				mirrorNetwork.value,
			);
		}

		const previousMirrorList = mirrorList.filter(
			(obj: IMirrorRPCNode) =>
				obj.Environment.toLocaleLowerCase() !== mirrorNetwork.value.toLocaleLowerCase() ||
				obj.isInConfig === false,
		);
		previousMirrorList.forEach((obj) => newMirrorList.push(obj));

		setArrayMirror(newMirrorList);

		const newArrayCurrentNetwork = newMirrorList.filter(
			(obj: IMirrorRPCNode) =>
				obj.Environment.toLocaleLowerCase() === mirrorNetwork.value.toLocaleLowerCase(),
		);
		setArrayMirrorCurrentNetwork(newArrayCurrentNetwork);

		const selectedDefaultMirror = selectedMirrors.filter(
			(obj: IMirrorRPCNode) =>
				obj.Environment.toLocaleLowerCase() === mirrorNetwork.value.toLocaleLowerCase(),
		);
		if (selectedDefaultMirror.length > 0) setSelectedMirror(selectedDefaultMirror[0]);
	}

	async function handleTypeChangeRPC(): Promise<void> {
		const { rpcNetwork } = getValues();
		setShowContentRPC(true);

		let newRPCList: IMirrorRPCNode[] = [];

		if (process.env.REACT_APP_RPC_NODE) {
			newRPCList = setNodeArrayByNetwork(
				JSON.parse(process.env.REACT_APP_RPC_NODE),
				rpcNetwork.value,
			);
		}

		const previousRPCList = rpcList.filter(
			(obj: IMirrorRPCNode) =>
				obj.Environment.toLocaleLowerCase() !== rpcNetwork.value.toLocaleLowerCase() ||
				obj.isInConfig === false,
		);

		previousRPCList.forEach((obj) => newRPCList.push(obj));

		setArrayRPC(newRPCList);

		const newArrayCurrentNetwork = newRPCList.filter(
			(obj: IMirrorRPCNode) =>
				obj.Environment.toLocaleLowerCase() === rpcNetwork.value.toLocaleLowerCase(),
		);
		setArrayRPCCurrentNetwork(newArrayCurrentNetwork);

		const selectedDefaultRPC = selectedRPCs.filter(
			(obj: IMirrorRPCNode) =>
				obj.Environment.toLocaleLowerCase() === rpcNetwork.value.toLocaleLowerCase(),
		);

		if (selectedDefaultRPC.length > 0) setSelectedRPC(selectedDefaultRPC[0]);
	}

	function setNodeArrayByNetwork(list: IMirrorRPCNode[], network: string): IMirrorRPCNode[] {
		const nodes: IMirrorRPCNode[] = list
			.filter((obj) => obj.Environment !== undefined)
			.filter((obj) => obj.Environment.toLocaleLowerCase() === network.toLocaleLowerCase())
			.map((obj, index) =>
				createOptionMirror(
					'EnvConf' + String(index),
					obj.BASE_URL,
					obj.API_KEY,
					obj.Environment,
					true,
					obj.HEADER,
				),
			);
		return nodes;
	}

	return (
		<BaseContainer title={t('title')}>
			<Box p={{ base: 1, md: '32px' }}>
				<Tabs>
					<TabList>
						<Tab>{t('MirrorNode')}</Tab>
						<Tab>{t('rpc')}</Tab>
					</TabList>
					<TabPanels>
						<TabPanel>
							<Stack as='form' spacing={6} maxW='600px'>
								<SelectController
									rules={{
										required: t('global:validations.required') ?? propertyNotFound,
									}}
									isRequired
									control={control}
									name='mirrorNetwork'
									placeholder={t('network')}
									options={networkOptions}
									addonLeft={true}
									overrideStyles={styles}
									variant='unstyled'
									onChangeAux={() => handleTypeChangeMirror()}
								/>
								<Stack display={!showContentMirror ? 'none' : 'block'}>
									<RadioGroup
										onChange={setDefaultMirror}
										value={selectedMirror?.name}
										name='radioMirror'
									>
										{arrayMirrorCurrentNetwork.map((option: IMirrorRPCNode) => {
											return (
												<HStack key={option.name}>
													<Radio value={option.name}>
														{option.name} -{option.BASE_URL} - Apikey: {option.API_KEY} -Header{' '}
														{option.HEADER}
													</Radio>
													<Box borderLeft='2px solid' borderLeftColor='light.primary' w='1px' />
													<Flex>
														<Icon
															name='Trash'
															color='brand.primary'
															cursor='pointer'
															fontSize='22px'
															onClick={() => removeMirrorToArray(option.name, option.Environment)}
															marginLeft={{ base: 2 }}
															display={
																option.isInConfig || option.name === selectedMirror?.name
																	? 'none'
																	: 'block'
															}
														/>
													</Flex>
												</HStack>
											);
										})}
									</RadioGroup>
									<Heading
										data-testid='title'
										fontSize='16px'
										fontWeight='600'
										mb={10}
										lineHeight='15.2px'
										textAlign={'left'}
									>
										{t('addMirror')}
									</Heading>
									<InputController
										isRequired
										control={control}
										name={'nameMirror'}
										placeholder={t('name') ?? propertyNotFound}
									/>
									<InputController
										isRequired
										control={control}
										name={'urlMirror'}
										placeholder={t('url') ?? propertyNotFound}
									/>

									<HStack>
										<Text maxW={'252px'} fontSize='14px' fontWeight='400' lineHeight='17px'>
											{t('apiKey')}
										</Text>
										<SwitchController
											control={control}
											name={'apiKeyMirror'}
											defaultValue={false}
										/>
										{apiKeyMirror === true && (
											<HStack>
												<InputController
													isRequired
													control={control}
													name={'apiKeyValueMirror'}
													placeholder={t('apiKey') ?? propertyNotFound}
												/>
												<InputController
													isRequired
													control={control}
													name={'apiKeyHeaderMirror'}
													placeholder={t('header') ?? propertyNotFound}
												/>
											</HStack>
										)}
									</HStack>
									<Button data-testid={`update-owner-button`} variant='primary' onClick={addMirror}>
										{t('addMirror')}
									</Button>
								</Stack>
							</Stack>
						</TabPanel>
						<TabPanel>
							<Stack as='form' spacing={6} maxW='520px'>
								<SelectController
									rules={{
										required: t('global:validations.required') ?? propertyNotFound,
									}}
									isRequired
									control={control}
									name='rpcNetwork'
									placeholder={t('network')}
									options={networkOptions}
									addonLeft={true}
									overrideStyles={styles}
									variant='unstyled'
									onChangeAux={() => handleTypeChangeRPC()}
								/>
								<Stack display={!showContentRPC ? 'none' : 'block'}>
									<RadioGroup onChange={setDefaultRPC} value={selectedRPC?.name} name='radioRPC'>
										{arrayRPCCurrentNetwork.map((option: IMirrorRPCNode) => {
											return (
												<HStack key={option.name}>
													<Radio value={option.name}>
														{option.name} -{option.BASE_URL} - Apikey: {option.API_KEY} -Header{' '}
														{option.HEADER}
													</Radio>
													<Box borderLeft='2px solid' borderLeftColor='light.primary' w='1px' />
													<Flex>
														<Icon
															name='Trash'
															color='brand.primary'
															cursor='pointer'
															fontSize='22px'
															onClick={() => removeRPCToArray(option.name, option.Environment)}
															marginLeft={{ base: 2 }}
															display={
																option.isInConfig || option.name === selectedRPC?.name
																	? 'none'
																	: 'block'
															}
														/>
													</Flex>
												</HStack>
											);
										})}
									</RadioGroup>
									<Heading
										data-testid='title'
										fontSize='16px'
										fontWeight='600'
										mb={10}
										lineHeight='15.2px'
										textAlign={'left'}
									>
										{t('addRPC')}
									</Heading>
									<InputController
										isRequired
										control={control}
										name={'nameRPC'}
										placeholder={t('name') ?? propertyNotFound}
									/>
									<InputController
										isRequired
										control={control}
										name={'urlRPC'}
										placeholder={t('url') ?? propertyNotFound}
									/>
									<HStack>
										<Text maxW={'252px'} fontSize='14px' fontWeight='400' lineHeight='17px'>
											{t('apiKey')}
										</Text>
										<SwitchController control={control} name={'apiKeyRpc'} defaultValue={false} />
										{apiKeyRpc === true && (
											<HStack>
												<InputController
													isRequired
													control={control}
													name={'apiKeyValueRPC'}
													placeholder={t('apiKey') ?? propertyNotFound}
												/>
												<InputController
													isRequired
													control={control}
													name={'apiKeyHeaderRPC'}
													placeholder={t('header') ?? propertyNotFound}
												/>
											</HStack>
										)}
									</HStack>
									<Button data-testid={`update-owner-button`} variant='primary' onClick={addRpc}>
										{t('addMirror')}
									</Button>
								</Stack>
							</Stack>
						</TabPanel>
					</TabPanels>
				</Tabs>
			</Box>
		</BaseContainer>
	);
};

export default AppSettings;
