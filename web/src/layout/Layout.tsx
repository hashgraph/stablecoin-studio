import { Box, Flex } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import Sidebar from './sidebar/Sidebar';
import Topbar from './topbar/Topbar';

interface LayoutProps {
	children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
	return (
		<Box data-testid='layout' h='100vh' w='100%'>
			<Topbar />

			<Flex transition='transform 0.3s, width 0.3s' h='calc(100vh - 64px)'>
				<Sidebar />
				<Box w='100%' py={9} px={10} minH='100%' bgColor='brand.gray5'>
					{children}
				</Box>
			</Flex>
		</Box>
	);
};

export default Layout;
