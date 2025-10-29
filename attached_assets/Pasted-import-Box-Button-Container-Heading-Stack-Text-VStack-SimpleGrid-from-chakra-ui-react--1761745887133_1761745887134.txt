import { Box, Button, Container, Heading, Stack, Text, VStack, SimpleGrid } from '@chakra-ui/react';
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
                        position="relative"
                        overflow="auto"
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

                        <Container maxW="container.lg" position="relative" zIndex={1} py={10}>
                                <Stack
                                        spacing={10}
                                        textAlign="center"
                                        color="white"
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

                                        <VStack spacing={8} pt={8}>
                                                <Heading
                                                        fontSize={{ base: '3xl', md: '4xl' }}
                                                        fontWeight="bold"
                                                        opacity={0.95}
                                                >
                                                        How it works
                                                </Heading>

                                                <SimpleGrid
                                                        columns={{ base: 1, md: 3 }}
                                                        spacing={10}
                                                        pt={8}
                                                        w="full"
                                                >
                                                        <VStack
                                                                spacing={4}
                                                                p={8}
                                                                bg="whiteAlpha.100"
                                                                borderRadius="2xl"
                                                                backdropFilter="blur(10px)"
                                                                border="1px solid"
                                                                borderColor="whiteAlpha.200"
                                                                transition="all 0.3s"
                                                                _hover={{
                                                                        transform: 'translateY(-4px)',
                                                                        bg: 'whiteAlpha.150',
                                                                }}
                                                        >
                                                                <Box
                                                                        fontSize="4xl"
                                                                        fontWeight="bold"
                                                                        bgGradient="linear(to-r, purple.300, pink.300)"
                                                                        bgClip="text"
                                                                >
                                                                        01
                                                                </Box>
                                                                <Text
                                                                        fontSize="xl"
                                                                        fontWeight="bold"
                                                                        textAlign="center"
                                                                >
                                                                        Download the NiaSync app
                                                                </Text>
                                                                <Text
                                                                        fontSize="md"
                                                                        opacity={0.8}
                                                                        textAlign="center"
                                                                >
                                                                        NiaSync automatically scans your mobile money balance and transactions in real time.
                                                                </Text>
                                                        </VStack>

                                                        <VStack
                                                                spacing={4}
                                                                p={8}
                                                                bg="whiteAlpha.100"
                                                                borderRadius="2xl"
                                                                backdropFilter="blur(10px)"
                                                                border="1px solid"
                                                                borderColor="whiteAlpha.200"
                                                                transition="all 0.3s"
                                                                _hover={{
                                                                        transform: 'translateY(-4px)',
                                                                        bg: 'whiteAlpha.150',
                                                                }}
                                                        >
                                                                <Box
                                                                        fontSize="4xl"
                                                                        fontWeight="bold"
                                                                        bgGradient="linear(to-r, blue.300, cyan.300)"
                                                                        bgClip="text"
                                                                >
                                                                        02
                                                                </Box>
                                                                <Text
                                                                        fontSize="xl"
                                                                        fontWeight="bold"
                                                                        textAlign="center"
                                                                >
                                                                        Open Stablecoin Studio
                                                                </Text>
                                                                <Text
                                                                        fontSize="md"
                                                                        opacity={0.8}
                                                                        textAlign="center"
                                                                >
                                                                        Stablecoin Studio tokenizes your available mobile money into verified on-chain assets, backed 1:1.
                                                                </Text>
                                                        </VStack>

                                                        <VStack
                                                                spacing={4}
                                                                p={8}
                                                                bg="whiteAlpha.100"
                                                                borderRadius="2xl"
                                                                backdropFilter="blur(10px)"
                                                                border="1px solid"
                                                                borderColor="whiteAlpha.200"
                                                                transition="all 0.3s"
                                                                _hover={{
                                                                        transform: 'translateY(-4px)',
                                                                        bg: 'whiteAlpha.150',
                                                                }}
                                                        >
                                                                <Box
                                                                        fontSize="4xl"
                                                                        fontWeight="bold"
                                                                        bgGradient="linear(to-r, green.300, teal.300)"
                                                                        bgClip="text"
                                                                >
                                                                        03
                                                                </Box>
                                                                <Text
                                                                        fontSize="xl"
                                                                        fontWeight="bold"
                                                                        textAlign="center"
                                                                >
                                                                        Use or trade your tokens
                                                                </Text>
                                                                <Text
                                                                        fontSize="md"
                                                                        opacity={0.8}
                                                                        textAlign="center"
                                                                >
                                                                        Send, pay, or invest anywhere in DeFi or digital markets — with low fees and instant liquidity.
                                                                </Text>
                                                        </VStack>
                                                </SimpleGrid>
                                        </VStack>

                                        <VStack spacing={6} pt={8} pb={10}>
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
