import type { FlexProps } from '@chakra-ui/react';
import { Flex, Text, useStyleConfig, useDisclosure } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import DetailsReview from './DetailsReview';
import Icon from './Icon';
import ModalsHandler from './ModalsHandler';
import type { ModalsHandlerActionsProps } from './ModalsHandler';

type OperationTraslateType = 'pause' | 'unpause' | 'delete';

export interface DirectActionProps extends FlexProps {
	title: string;
	icon: string;
	variant?: string;
	isDisabled?: boolean;
	handleAction: ModalsHandlerActionsProps['onConfirm'];
	errorNotification: string;
	operationTranslate: OperationTraslateType;
}

const DirectAction = ({
	title,
	icon,
	isDisabled = false,
	variant = 'primary',
	handleAction,
	errorNotification,
	operationTranslate,
	...props
}: DirectActionProps) => {
	const {
		isOpen: isOpenModalAction,
		onOpen: onOpenModalAction,
		onClose: onCloseModalAction,
	} = useDisclosure();

	const style = useStyleConfig('DirectAction', { variant: isDisabled ? 'disabled' : variant });
	const { t } = useTranslation(['burn', 'global', 'operations']);

	return (
		<Flex sx={style} as='button' onClick={onOpenModalAction} disabled={isDisabled} {...props}>
			<Flex
				h='48px'
				w='48px'
				borderRadius='50%'
				bgColor='light.purple4'
				justifyContent='center'
				alignItems='center'
			>
				<Icon
					data-testid={`direct-access-${icon}`}
					name={icon}
					fontSize='28px'
					color='light.purple3'
				/>
			</Flex>
			<Text
				data-testid={`direct-access-${title}`}
				color='brand.gray600'
				fontSize='14px'
				fontWeight='700'
				lineHeight='16px'
			>
				{title}
			</Text>
			<ModalsHandler
				errorNotificationTitle={t('operations:modalErrorTitle')}
				errorNotificationDescription={errorNotification}
				successNotificationTitle={t(`operations:${operationTranslate}.modalSuccessTitle`)}
				successNotificationDescription={t(`operations:${operationTranslate}.modalSuccessDesc`)}
				modalActionProps={{
					isOpen: isOpenModalAction,
					onClose: onCloseModalAction,
					title: t(`operations:${operationTranslate}.title`),
					confirmButtonLabel: t(`operations:${operationTranslate}.modalAction.accept`),
					onConfirm: handleAction,
				}}
				ModalActionChildren={
					<DetailsReview
						title={t(`operations:${operationTranslate}.modalAction.subtitle`)}
						details={[]}
					/>
				}
			/>
		</Flex>
	);
};

export default DirectAction;
