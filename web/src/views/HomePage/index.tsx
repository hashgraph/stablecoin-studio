import { Box, Button, Container, Heading, Stack, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { RoutesMappingUrl } from '../../Router/RoutesMappingUrl';
import { NamedRoutes } from '../../Router/NamedRoutes';

const HomePage = () => {
        const navigate = useNavigate();

        const handleEnter = () => {
                navigate(RoutesMappingUrl[NamedRoutes.LandingPage]);
        };

        return (
                <Box
                        minH="100vh"
                        bgGradient="linear(to-br, #1A202C, #2D3748, #4A5568)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        position="relative"
                        overflow="hidden"
                >
                        <Box
                                position="absolute"
                                top="0"
                                left="0"
                                right="0"
                                bottom="0"
                                opacity="0.1"
                                bgImage="radial-gradient(circle, white 1px, transparent 1px)"
                                bgSize="50px 50px"
                        />

                        <Container maxW="container.lg" position="relative" zIndex={1}>
                                <Stack
                                        spacing={12}
                                        textAlign="center"
                                        color="white"
                                        py={20}
                                >
                                        <VStack spacing={6}>
                                                <Heading
                                                        fontSize={{ base: '5xl', md: '7xl' }}
                                                        fontWeight="extrabold"
                                                        lineHeight="1.1"
                                                        bgGradient="linear(to-r, white, gray.300)"
                                                        bgClip="text"
                                                >
                                                        Welcome
                                                </Heading>
                                                <Text
                                                        fontSize={{ base: '2xl', md: '3xl' }}
                                                        fontWeight="light"
                                                        maxW="3xl"
                                                        opacity={0.9}
                                                >
                                                        Système de gestion des stablecoins
                                                </Text>
                                                <Text
                                                        fontSize={{ base: 'lg', md: 'xl' }}
                                                        maxW="2xl"
                                                        opacity={0.7}
                                                        mt={4}
                                                >
                                                        Plateforme complète pour créer, gérer et opérer vos stablecoins
                                                        avec intégration Orange Money et MVola
                                                </Text>
                                        </VStack>

                                        <VStack spacing={6} pt={12}>
                                                <Button
                                                        size="lg"
                                                        bg="white"
                                                        color="gray.800"
                                                        fontSize="xl"
                                                        px={16}
                                                        py={8}
                                                        onClick={handleEnter}
                                                        _hover={{
                                                                transform: 'scale(1.05)',
                                                                boxShadow: '2xl',
                                                        }}
                                                        transition="all 0.3s"
                                                        borderRadius="full"
                                                >
                                                        Entrer →
                                                </Button>
                                                <Text fontSize="md" opacity={0.6}>
                                                        Cliquez pour accéder à la plateforme
                                                </Text>
                                        </VStack>
                                </Stack>
                        </Container>
                </Box>
        );
};

export default HomePage;
