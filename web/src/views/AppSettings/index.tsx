import {
	Box,
	Heading,
	Alert,
	AlertDescription,
	AlertIcon,
	CloseButton,
	Flex,
	Link,
	Text,
	Image,
	Tabs, 
	TabList, 
	TabPanels, 
	Tab, 
	TabPanel, 
	Stack,
	HStack,
	Button,
	RadioGroup,
	Radio
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import BaseContainer from '../../components/BaseContainer';
import type { DirectAccessProps } from '../../components/DirectAccess';
import GridDirectAccess from '../../components/GridDirectAccess';
import type { IAccountToken } from '../../interfaces/IAccountToken';
import type { IExternalToken } from '../../interfaces/IExternalToken';
import {
	SELECTED_WALLET_COIN,
	SELECTED_WALLET_PAIRED_ACCOUNTID,
	IS_PROXY_OWNER,
	IS_FACTORY_PROXY_OWNER,
	IS_PENDING_OWNER,
	IS_ACCEPT_OWNER,
	IS_FACTORY_ACCEPT_OWNER,
	IS_FACTORY_PENDING_OWNER,
	SELECTED_NETWORK_FACTORY_PROXY_CONFIG,
} from '../../store/slices/walletSlice';
import { NamedRoutes } from './../../Router/NamedRoutes';
import { RouterManager } from '../../Router/RouterManager';
import SAFE_BOX from '../../assets/svg/safe-box.svg';
import { SelectController } from '../../components/Form/SelectController';
import { networkOptions } from './constants';
import { useForm, useWatch } from 'react-hook-form';
import { propertyNotFound } from '../../constant';
import InputController from '../../components/Form/InputController';
import InputLabel from '../../components/Form/InputLabel.js';
import SwitchController from '../../components/Form/SwitchController';


const AppSettings = () => {
	const { t } = useTranslation(['appSettings', 'errorPage']);
	const navigate = useNavigate();
	const [value, setValue] = React.useState('1')
  
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


	const { control, getValues } = useForm({
		mode: 'onChange',
	});


	const apiKeyMirror = useWatch({
		control,
		name: 'apiKeyMirror',
	});
	const apiKeyRpc = useWatch({
		control,
		name: 'apiKeyRpc',
	});

	const handleChangeOwner = async () => {
		const { updateOwner } = getValues();
	}
	let mirrorNodeList,rpcList;
	if (process.env.REACT_APP_MIRROR_NODE) {
		mirrorNodeList = JSON.parse(process.env.REACT_APP_MIRROR_NODE);
		
	}
	if (process.env.REACT_APP_RPC_NODE) {
		rpcList = JSON.parse(process.env.REACT_APP_RPC_NODE);
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
							<Stack as='form' spacing={6} maxW='520px'>
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
							/>
							 <RadioGroup onChange={setValue} >
							 	{mirrorNodeList.map((option: { BASE_URL: any;API_KEY: any; }) => {
								return <Radio key={option.BASE_URL}>{option.BASE_URL} - Apikey: {option.API_KEY} </Radio>;
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
									name={'ApiKeyValueMirror'}
									placeholder={t('apiKey') ?? propertyNotFound}
									/>	
								</HStack>
							)}	
							</HStack>
							<Button
											data-testid={`update-owner-button`}
											variant='primary'
											onClick={handleChangeOwner}
											
										>
											{t('addMirror')}
										</Button>					
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
							/>
							 <RadioGroup onChange={setValue} >
							 	{rpcList.map((option: { BASE_URL: any;API_KEY: any; }) => {
								return <Radio key={option.BASE_URL}>{option.BASE_URL} - Apikey: {option.API_KEY} </Radio>;
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
								<SwitchController
									control={control}
									name={'apiKeyRpc'}
									defaultValue={false}
								/>
											{apiKeyRpc === true && (
								<HStack>
								<InputController
									isRequired
									control={control}
									name={'ApiKeyValueMirror'}
									placeholder={t('apiKey') ?? propertyNotFound}
									/>	
								</HStack>
							)}	
							</HStack>
							<Button
											data-testid={`update-owner-button`}
											variant='primary'
											onClick={handleChangeOwner}
											
										>
											{t('addRPC')}
										</Button>					
							</Stack>
						</TabPanel>
					</TabPanels>
				</Tabs>
			</Box>
		</BaseContainer>
	);
};

export default AppSettings;
