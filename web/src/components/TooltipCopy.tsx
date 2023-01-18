import { Box, Tooltip, useClipboard } from '@chakra-ui/react';
import type { TooltipProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface TooltipCopyProps extends TooltipProps {
	children: ReactNode;
	valueToCopy: string;
}

const TooltipCopy = ({ children, valueToCopy, ...props }: TooltipCopyProps) => {
	const { t } = useTranslation('global');

	const { hasCopied, onCopy } = useClipboard(valueToCopy ?? '');

	return (
		<Tooltip
			label={hasCopied ? t('common.copied') : t('common.copy')}
			closeOnClick={false}
			hasArrow
			bgColor='black'
			borderRadius='5px'
			{...props}
		>
			<Box _hover={{ cursor: 'pointer' }} onClick={() => {
				console.log(valueToCopy);
				onCopy();
			}}>
				{children}
			</Box>
		</Tooltip>
	);
};

export default TooltipCopy;
