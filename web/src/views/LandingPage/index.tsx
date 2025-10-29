import { Box, Button, Container, Heading, Stack, Text, VStack, HStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { RoutesMappingUrl } from '../../Router/RoutesMappingUrl';
import { NamedRoutes } from '../../Router/NamedRoutes';

const LandingPage = () => {
        const navigate = useNavigate();

        const handleGetStarted = () => {
                navigate(RoutesMappingUrl[NamedRoutes.StableCoinNotSelected]);
        };

        return (
                <Box
                        minH="100vh"
                        bgGradient="linear(to-br, #6B46C1, #805AD5, #9F7AEA)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        position="relative"
                        overflow="hidden"
                >
                        <Box
                                position="absolute"
                                top="-10%"
                                right="-10%"
                                w="500px"
                                h="500px"
                                borderRadius="full"
                                bg="whiteAlpha.100"
                                filter="blur(100px)"
                        />
                        <Box
                                position="absolute"
                                bottom="-10%"
                                left="-10%"
                                w="400px"
                                h="400px"
                                borderRadius="full"
                                bg="whiteAlpha.100"
                                filter="blur(100px)"
                        />

                        <Container maxW="container.xl" position="relative" zIndex={1}>
                                <Stack
                                        spacing={8}
                                        textAlign="center"
                                        color="white"
                                        py={20}
                                >
                                        <VStack spacing={4}>
                                                <Heading
                                                        fontSize={{ base: '4xl', md: '6xl' }}
                                                        fontWeight="bold"
                                                        lineHeight="1.2"
                                                >
                                                        Stablecoin Studio
                                                </Heading>
                                                <Text
                                                        fontSize={{ base: 'xl', md: '2xl' }}
                                                        fontWeight="medium"
                                                        maxW="2xl"
                                                        opacity={0.9}
                                                >
                                                        A comprehensive toolkit for creating, managing, and operating stablecoins on the Hedera network
                                                </Text>
                                        </VStack>

                                        <HStack spacing={8} justify="center" flexWrap="wrap" pt={8}>
                                                <VStack
                                                        bg="whiteAlpha.200"
                                                        backdropFilter="blur(10px)"
                                                        borderRadius="lg"
                                                        p={6}
                                                        spacing={3}
                                                        minW="250px"
                                                        transition="all 0.3s"
                                                        _hover={{ bg: 'whiteAlpha.300', transform: 'translateY(-4px)' }}
                                                >
                                                        <Heading fontSize="xl">Smart Contracts</Heading>
                                                        <Text fontSize="sm" opacity={0.9}>
                                                                Diamond pattern upgradeable contracts with modular architecture
                                                        </Text>
                                                </VStack>

                                                <VStack
                                                        bg="whiteAlpha.200"
                                                        backdropFilter="blur(10px)"
                                                        borderRadius="lg"
                                                        p={6}
                                                        spacing={3}
                                                        minW="250px"
                                                        transition="all 0.3s"
                                                        _hover={{ bg: 'whiteAlpha.300', transform: 'translateY(-4px)' }}
                                                >
                                                        <Heading fontSize="xl">Mobile Money</Heading>
                                                        <Text fontSize="sm" opacity={0.9}>
                                                                Analytics dashboard for Orange Money and MVola transactions
                                                        </Text>
                                                </VStack>

                                                <VStack
                                                        bg="whiteAlpha.200"
                                                        backdropFilter="blur(10px)"
                                                        borderRadius="lg"
                                                        p={6}
                                                        spacing={3}
                                                        minW="250px"
                                                        transition="all 0.3s"
                                                        _hover={{ bg: 'whiteAlpha.300', transform: 'translateY(-4px)' }}
                                                >
                                                        <Heading fontSize="xl">Multisig Support</Heading>
                                                        <Text fontSize="sm" opacity={0.9}>
                                                                Role-based access control with threshold key management
                                                        </Text>
                                                </VStack>
                                        </HStack>

                                        <VStack spacing={4} pt={8}>
                                                <Button
                                                        size="lg"
                                                        colorScheme="whiteAlpha"
                                                        bg="white"
                                                        color="brand.primary"
                                                        fontSize="lg"
                                                        px={12}
                                                        py={7}
                                                        onClick={handleGetStarted}
                                                        _hover={{
                                                                transform: 'translateY(-2px)',
                                                                boxShadow: 'xl',
                                                        }}
                                                        transition="all 0.3s"
                                                >
                                                        Get Started →
                                                </Button>
                                                <Text fontSize="sm" opacity={0.8}>
                                                        Launch the Stablecoin Studio application
                                                </Text>
                                        </VStack>
                                </Stack>
                        </Container>
                </Box>
        );
};

export default LandingPage;
