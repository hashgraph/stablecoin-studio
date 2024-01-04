import {
    Button, FormControl, FormLabel,
    HStack, Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text, VStack,
} from '@chakra-ui/react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

interface FormValues {
    apiKey: string;
    baseUrl: string;
    vaultAccountId: string;
    fileInput: FileList;
}

interface FireblocksFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBackToWalletSelect: () => void;
    onConfirm: (data: FormValues, file: FileList) => void;
}

const FireblocksFormModal = (props: FireblocksFormModalProps) => {
    const { isOpen, onClose, onBackToWalletSelect, onConfirm } = props;
    const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>();
    const fileInput = watch("fileInput");

    const onSubmit: SubmitHandler<FormValues> = data => {
        console.log(data);
        onConfirm(data, fileInput);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size={'xl'} isCentered closeOnEsc={false} closeOnOverlayClick={false}>
            <ModalOverlay />
            <ModalContent p='50' w='500px'>
                <ModalCloseButton />
                <ModalHeader>
                    <Text fontSize='19px' fontWeight={700} lineHeight='16px' color='brand.black'>
                        Fireblocks settings
                    </Text>
                </ModalHeader>
                <ModalBody textAlign='center' pt='14px'>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <VStack spacing={4}>
                            <FormControl isInvalid={!!errors.apiKey}>
                                <FormLabel htmlFor='apiKey'>API Key</FormLabel>
                                <Input id='apiKey' {...register('apiKey', { required: true })} />
                            </FormControl>
                            <FormControl isInvalid={!!errors.baseUrl}>
                                <FormLabel htmlFor='baseUrl'>Base URL</FormLabel>
                                <Input id='baseUrl' {...register('baseUrl', { required: true })} defaultValue='https://api.fireblocks.io' />
                            </FormControl>
                            <FormControl isInvalid={!!errors.vaultAccountId}>
                                <FormLabel htmlFor='vaultAccountId'>Vault Account ID</FormLabel>
                                <Input id='vaultAccountId' {...register('vaultAccountId', { required: true })} />
                            </FormControl>
                            <FormControl>
                                <FormLabel htmlFor='fileInput'>Archivo .key</FormLabel>
                                <Input id='fileInput' type='file' {...register('fileInput')} />
                            </FormControl>
                        </VStack>
                        <ModalFooter justifyContent='center' pt={4}>
                            <HStack spacing={6} w='full'>
                                <Button onClick={onBackToWalletSelect} variant='secondary' flex={1}>
                                    Cancel
                                </Button>
                                <Button type='submit' flex={1}>
                                    Confirm
                                </Button>
                            </HStack>
                        </ModalFooter>
                    </form>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default FireblocksFormModal;
