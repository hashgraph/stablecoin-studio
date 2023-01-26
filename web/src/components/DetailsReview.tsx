import type { FlexProps as ChakraFlexProps, TextProps as ChakraTextProps } from '@chakra-ui/react';
import { Box, Divider, Flex, Text, HStack } from '@chakra-ui/react';
import Icon from './Icon';
import TooltipCopy from './TooltipCopy';

export interface Detail {
	label: string;
	labelInBold?: boolean;
	value: any; // TODO: string | number
	valueInBold?: boolean;
	copyButton?: boolean;
}

export interface DetailsReviewProps {
	details: Detail[];
	divider?: boolean;
	title?: string|null;
	titleProps?: ChakraTextProps;
	contentProps?: ChakraFlexProps;
}

const commonTextProps: ChakraTextProps = {
	fontSize: '14px',
	fontWeight: 500,
	lineHeight: '17px',
	color: 'brand.gray',
	wordBreak: 'break-all',
};

const textInBoldProps: ChakraTextProps = {
	...commonTextProps,
	fontWeight: 700,
	color: 'brand.black',
};

const DetailsReview = (props: DetailsReviewProps) => {
	const { details, divider = true, title, titleProps, contentProps } = props;
	return (
		<Box textAlign='left'>
			{title && (
				<Text
					data-testid='details-review-title'
					fontSize='16px'
					fontWeight={600}
					color='brand.gray'
					mb={6}
					{...titleProps}
				>
					{title}
				</Text>
			)}
			<Box>
				{details.map((detail: Detail, index: number, details: Detail[]) => (
					<Box key={`details-review-detail-${index}`}>
						<Flex
							data-testid={`details-review-detail-${index}`}
							justifyContent='space-between'
							{...contentProps}
						>
							<Text
								whiteSpace={'nowrap'}
								{...(detail.labelInBold ? textInBoldProps : commonTextProps)}
							>
								{detail.label}
							</Text>

							{typeof detail.value === 'string' || typeof detail.value === 'number' ? (
								<HStack {...(detail.valueInBold ? textInBoldProps : commonTextProps)}>
									<Text>{detail.value.toString()}</Text>
									{detail.copyButton && (
										<TooltipCopy valueToCopy={detail.value.toString() ?? ''}>
											<Icon name='Copy' />
										</TooltipCopy>
									)}
								</HStack>
							) : 'toString' in detail.value && 'value' in detail.value ? (
								detail.value.toString()
							) : (
								detail.value
							)}
						</Flex>
						{divider && details.length !== index + 1 && (
							<Divider title='divider' mt='13px' mb='13px' />
						)}
					</Box>
				))}
			</Box>
		</Box>
	);
};

export default DetailsReview;
