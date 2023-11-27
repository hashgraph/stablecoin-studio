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
	Radio
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useNavigate } from 'react-router-dom';
import BaseContainer from '../../components/BaseContainer';
import { SelectController } from '../../components/Form/SelectController';
import { networkOptions } from './constants';
import { FieldValues, useForm, useWatch } from 'react-hook-form';
import { propertyNotFound } from '../../constant';
import InputController from '../../components/Form/InputController';
import SwitchController from '../../components/Form/SwitchController';
const AppSettings = () => {
	
	interface OptionMirror{
		name:string;
		url:string;
		apikey:string;
	}
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

	const form = useForm<FieldValues>({
		mode: 'onChange',
	});
	const { control, getValues } = form;

	let mirrorNodeList,rpcList;
	

	if (process.env.REACT_APP_RPC_NODE) {
		rpcList = JSON.parse(process.env.REACT_APP_RPC_NODE);
	}

	if (process.env.REACT_APP_MIRROR_NODE) {
		mirrorNodeList = JSON.parse(process.env.REACT_APP_MIRROR_NODE);
		console.log(mirrorNodeList[0]);
	}

	const [arrayMirror, setArrayMirror] = useState([createOptionMirror("default",mirrorNodeList[0].BASE_URL,mirrorNodeList[0].API_KEY)]);
	const [arrayRPC, setArrayRPC] = useState([createOptionMirror("default",rpcList[0].BASE_URL,rpcList[0].API_KEY)]);

	const addMirrorToArray = (newMirror: OptionMirror) => {
	  const newArray = [...arrayMirror, newMirror];
	  setArrayMirror(newArray);
	};
	const addRPCToArray = (newRPC: OptionMirror) => {
		const newArray = [...arrayRPC, newRPC];
		setArrayRPC(newArray);
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
		console.log("hola");
		const { nameMirror, urlMirror, apiKeyValueMirror ,apiKeyMirror} = getValues();
		addMirrorToArray(createOptionMirror(nameMirror,urlMirror,apiKeyValueMirror))

		console.log(urlMirror + " - Apikey:" + apiKeyMirror?apiKeyValueMirror:'');
	}
	const addRpc = async () => {
		const { nameRPC, urlRPC, apiKeyValueRpc,apiKeyRPC } = getValues();
		console.log(urlRPC + " - Apikey:" + apiKeyRpc?apiKeyValueRpc:'');

	}


	function createOptionMirror(name: string, url: string, apikey: string): OptionMirror {
		return { name, url, apikey };
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
							 	{arrayMirror.map((option: OptionMirror) => {
									return <Radio key={option.name}>{option.name} -{option.url} - Apikey: {option.apikey} </Radio>;
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
								</HStack>
							)}	
							</HStack>
							<Button
											data-testid={`update-owner-button`}
											variant='primary'
											onClick={addMirror}
											
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
							 	{arrayRPC.map((option: OptionMirror) => {
									return <Radio key={option.name}>{option.name} -{option.url} - Apikey: {option.apikey} </Radio>;
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
									name={'apiKeyValueRPC'}
									placeholder={t('apiKey') ?? propertyNotFound}
									/>	
								</HStack>
							)}	
							</HStack>
							<Button
											data-testid={`update-owner-button`}
											variant='primary'
											onClick={addRpc}
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
