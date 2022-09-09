import { Box, Flex } from '@chakra-ui/react';
import { ReactNode } from 'react';
import Sidebar from './sidebar/Sidebar';
import Topbar from './topbar/Topbar';

interface Props {
	general: {
		children: ReactNode;
	};
}

const Layout = ({ children }: Props['general']) => {
	return (
		<Box data-testid='layout' h='100vh' w='100%'>
			<Topbar />

			<Flex transition='transform 0.3s, width 0.3s' h='calc(100vh - 64px)'>
				<Sidebar />
				<Box w='100%' pt={10} pr={10} pl={10} minH='100%' overflowY='auto'>
					{children}
				</Box>
			</Flex>
		</Box>
	);
};

export default Layout;
