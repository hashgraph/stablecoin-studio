import ModalHashpack from '../ModalHashpack';
import { render } from '../../test/index';
import en from '../../translations/en/global.json';

const HEDERA_LOGO = 'hedera-hbar-logo.svg';
const downloadHashpack = 'https://www.hashpack.app/download';
const translations = en['hashpack-no-installed'];

describe(`<${ModalHashpack.name} />`, () => {
	test('should render correctly', () => {
		const component = render(<ModalHashpack type='no-installed' />);

		expect(component.asFragment()).toMatchSnapshot();
	});

	test('should has the Hedera Logo', () => {
		const component = render(<ModalHashpack type='no-installed' />);

		expect(component.getByTestId('hedera-logo')).toHaveAttribute('src', HEDERA_LOGO);
	});

	test('should has title and description', () => {
		const component = render(<ModalHashpack type='no-installed' />);

		const title = component.getByTestId('modal-hashpack-title');
		expect(title).toBeInTheDocument();
		expect(title).toHaveTextContent(translations.title);

		const description = component.getByTestId('modal-hashpack-description');
		expect(description).toBeInTheDocument();
		expect(description).toHaveTextContent(translations.description);
	});


	test('should has a link to download hashpack', () => {
		const component = render(<ModalHashpack type='no-installed' />);

		const link = component.getByTestId('modal-hashpack-link');
		expect(link).toHaveAttribute('href', downloadHashpack);
	});

	test('should has a button', async () => {
		const component = render(<ModalHashpack type='no-installed' />);

		const button = component.getByTestId('modal-hashpack-button');
		expect(button).toBeInTheDocument();
		expect(button).toHaveTextContent(translations.button);

		// TODO add test for check background color before and after hover
	});
});
