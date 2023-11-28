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
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../components/Icon';
import { useNavigate } from 'react-router-dom';
import BaseContainer from '../../components/BaseContainer';
import { SelectController } from '../../components/Form/SelectController';
import { networkOptions } from './constants';
import { FieldValues, useForm, useWatch } from 'react-hook-form';
import { propertyNotFound } from '../../constant';
import InputController from '../../components/Form/InputController';
import SwitchController from '../../components/Form/SwitchController';
const AppSettings = () => {
	interface OptionMirror {
		name: string;
		url: string;
		apikey: string;
		isInConfig: boolean;
		header: string;
	}
	const { t } = useTranslation(['appSettings', 'errorPage']);

	const navigate = useNavigate();
	const [defaultValue, setDefaultValue] = useState('0');

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

	const form = useForm<FieldValues>({
		mode: 'onChange',
	});
	const { control, getValues } = form;

	let mirrorNodeList, rpcList;

	if (process.env.REACT_APP_RPC_NODE) {
		rpcList = JSON.parse(process.env.REACT_APP_RPC_NODE);
	}

	if (process.env.REACT_APP_MIRROR_NODE) {
		mirrorNodeList = JSON.parse(process.env.REACT_APP_MIRROR_NODE);
	}

	const [arrayMirror, setArrayMirror] = useState<OptionMirror[]>([]);
	const [arrayRPC, setArrayRPC] = useState<OptionMirror[]>([]);

	const addMirrorToArray = (newMirror: OptionMirror) => {
		const newArray = [...arrayMirror, newMirror];
		setArrayMirror(newArray);
	};
	const addRPCToArray = (newRPC: OptionMirror) => {
		const newArray = [...arrayRPC, newRPC];
		setArrayRPC(newArray);
	};

	const removeMirrorToArray = (mirrorName: string) => {
		setArrayMirror(arrayMirror.filter((obj: OptionMirror) => obj.name !== mirrorName));
	};
	const removeRPCToArray = (rpcName: string) => {
		setArrayRPC(arrayRPC.filter((obj: OptionMirror) => obj.name !== rpcName));
	};

	const apiKeyMirror = useWatch({
		control,
		name: 'apiKeyMirror',
	});
	const apiKeyRpc = useWatch({
		control,
		name: 'apiKeyRpc',
	});

	const addMirror = async () => {
		const { nameMirror, urlMirror, apiKeyValueMirror, apiKeyMirror, apiKeyHeaderMirror } =
			getValues();
		addMirrorToArray(
			createOptionMirror(nameMirror, urlMirror, apiKeyValueMirror, false, apiKeyHeaderMirror),
		);
	};
	const addRpc = async () => {
		const { nameRPC, urlRPC, apiKeyValueRPC, apiKeyHeaderRPC } = getValues();
		addRPCToArray(createOptionMirror(nameRPC, urlRPC, apiKeyValueRPC, false, apiKeyHeaderRPC));
	};

	function createOptionMirror(
		name: string,
		url: string,
		apikey: string,
		isInConfig: boolean,
		header: string,
	): OptionMirror {
		return { name, url, apikey, isInConfig, header };
	}
	const [showContentMirror, setShowContentMirror] = useState(false);
	const [showContentRPC, setShowContentRPC] = useState(false);

	async function handleTypeChangeMirror(): Promise<void> {
		const { mirrorNetwork, rpcNetwork } = getValues();
		setShowContentMirror(true);
		setArrayMirror([]);

		console.log('mirrorNetwork');
		console.log(mirrorNetwork);

		if (process.env.REACT_APP_MIRROR_NODE) {
			let i = 0;
			JSON.parse(process.env.REACT_APP_MIRROR_NODE).forEach(
				(obj: { BASE_URL: string; API_KEY: string; Environment: string; HEADER: string }) => {
					console.log(obj);
					if (obj.Environment.toUpperCase() === mirrorNetwork.value.toUpperCase()) {
						const newArray = [
							...arrayMirror,
							createOptionMirror(
								'EnvConf' + String(i),
								obj.BASE_URL,
								obj.API_KEY,
								true,
								obj.HEADER,
							),
						];
						setArrayMirror(newArray);
						i++;
					}
				},
			);
		}
	}
	async function handleTypeChangeRPC(): Promise<void> {
		const { rpcNetwork } = getValues();
		setShowContentRPC(true);
		setArrayRPC([]);
		if (process.env.REACT_APP_RPC_NODE) {
			let i = 0;
			JSON.parse(process.env.REACT_APP_RPC_NODE).forEach(
				(obj: { BASE_URL: string; API_KEY: string; Environment: string; HEADER: string }) => {
					if (obj.Environment.toUpperCase() === rpcNetwork.value.toUpperCase()) {
						const newArray = [
							...arrayRPC,
							createOptionMirror(String(i), obj.BASE_URL, obj.API_KEY, true, obj.HEADER),
						];
						setArrayRPC(newArray);
						i++;
					}
				},
			);
		}
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
									<RadioGroup onChange={setDefaultValue}>
										{arrayMirror.map((option: OptionMirror) => {
											return (
												<HStack key={option.name}>
													<Radio value={option.name}>
														{option.name} -{option.url} - Apikey: {option.apikey}{' '}
													</Radio>

													<Box borderLeft='2px solid' borderLeftColor='light.primary' w='1px' />

													<Flex>
														<Icon
															name='Trash'
															color='brand.primary'
															cursor='pointer'
															fontSize='22px'
															onClick={() => removeMirrorToArray(option.name)}
															marginLeft={{ base: 2 }}
															display={option.isInConfig ? 'none' : 'block'}
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
									<RadioGroup onChange={setDefaultValue}>
										{arrayRPC.map((option: OptionMirror) => {
											return (
												<HStack key={option.name}>
													<Radio value={option.name}>
														{option.name} -{option.url} - Apikey: {option.apikey}{' '}
													</Radio>

													<Box borderLeft='2px solid' borderLeftColor='light.primary' w='1px' />

													<Flex>
														<Icon
															name='Trash'
															color='brand.primary'
															cursor='pointer'
															fontSize='22px'
															onClick={() => removeRPCToArray(option.name)}
															marginLeft={{ base: 2 }}
															display={option.isInConfig ? 'none' : 'block'}
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
