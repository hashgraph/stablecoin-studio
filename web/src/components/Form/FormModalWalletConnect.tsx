import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    Button,
    useDisclosure,
    FormControl,
    FormLabel,
    Input
} from "@chakra-ui/react";

function MyModal() {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
            <Button onClick={onOpen}>Abrir Modal</Button>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Formulario</ModalHeader>
                    <ModalBody>
                        <FormControl>
                            <FormLabel htmlFor='email'>Email</FormLabel>
                            <Input id='email' type='email' />

                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={onClose}>
                            Cerrar
                        </Button>
                        <Button variant="ghost">Enviar</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
