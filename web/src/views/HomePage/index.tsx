import { Box, Button, Container, Heading, Stack, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { RoutesMappingUrl } from '../../Router/RoutesMappingUrl';
import { NamedRoutes } from '../../Router/NamedRoutes';

const HomePage = () => {
        const navigate = useNavigate();

        const handleEnter = () => {
                navigate(RoutesMappingUrl[NamedRoutes.StableCoinNotSelected]);
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
                                                        fontSize={{ base: '4xl', md: '6xl' }}
                                                        fontWeight="extrabold"
                                                        lineHeight="1.2"
                                                        bgGradient="linear(to-r, white, gray.300)"
                                                        bgClip="text"
                                                >
                                                        Mobile money on-chain, cash out anywhere.
                                                </Heading>
                                                <Text
                                                        fontSize={{ base: '2xl', md: '3xl' }}
                                                        fontWeight="medium"
                                                        maxW="3xl"
                                                        opacity={0.9}
                                                >
                                                        A complete platform to create, manage, and operate stablecoins backed by mobile money reserves.
                                                </Text>
                                                <Text
                                                        fontSize={{ base: 'lg', md: 'xl' }}
                                                        maxW="2xl"
                                                        opacity={0.7}
                                                        mt={4}
                                                >
                                                        Bring local liquidity to the blockchain with full transparency and automated reserve tracking.
                                                        Issue, mint, and redeem stablecoins seamlessly — all from one unified interface.
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
                                                        Get Started →
                                                </Button>
                                                <Text fontSize="md" opacity={0.6}>
                                                        Click to access the platform
                                                </Text>
                                        </VStack>
                                </Stack>
                        </Container>
                </Box>
        );
};

export default HomePage;
